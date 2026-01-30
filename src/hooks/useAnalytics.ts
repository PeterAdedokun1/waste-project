import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, subMonths, format, startOfWeek, subWeeks, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

export interface AnalyticsData {
  // Summary stats
  totalRevenue: number;
  totalTransactions: number;
  activeListings: number;
  pendingOffers: number;
  
  // Time series data
  revenueByPeriod: { period: string; revenue: number; transactions: number }[];
  listingsByPeriod: { period: string; count: number }[];
  offersByStatus: { status: string; count: number }[];
  ordersByStatus: { status: string; count: number }[];
  
  // Activity metrics
  topWasteTypes: { type: string; count: number; revenue: number }[];
  recentActivity: { date: string; type: string; description: string; amount?: number }[];
}

type TimeRange = "7d" | "30d" | "90d" | "1y";

export const useAnalytics = (timeRange: TimeRange = "30d") => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const getDateRange = useCallback(() => {
    const now = new Date();
    switch (timeRange) {
      case "7d":
        return { start: subWeeks(now, 1), end: now };
      case "30d":
        return { start: subMonths(now, 1), end: now };
      case "90d":
        return { start: subMonths(now, 3), end: now };
      case "1y":
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: subMonths(now, 1), end: now };
    }
  }, [timeRange]);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { start, end } = getDateRange();
    const startDate = start.toISOString();

    try {
      // Fetch all relevant data in parallel
      const [
        ordersRes,
        listingsRes,
        offersRes,
        activeListingsRes,
        pendingOffersRes,
      ] = await Promise.all([
        // All orders for user
        supabase
          .from("orders")
          .select("id, amount, status, created_at, listing_id")
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .gte("created_at", startDate)
          .order("created_at", { ascending: true }),
        
        // All listings
        supabase
          .from("waste_listings")
          .select("id, waste_type, asking_price, status, created_at")
          .eq("user_id", user.id)
          .gte("created_at", startDate)
          .order("created_at", { ascending: true }),
        
        // All offers
        supabase
          .from("offers")
          .select("id, amount, status, created_at")
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .gte("created_at", startDate),
        
        // Current active listings
        supabase
          .from("waste_listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "active"),
        
        // Pending offers
        supabase
          .from("offers")
          .select("*", { count: "exact", head: true })
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .in("status", ["pending", "countered"]),
      ]);

      const orders = ordersRes.data || [];
      const listings = listingsRes.data || [];
      const offers = offersRes.data || [];

      // Calculate summary stats
      const completedOrders = orders.filter(o => o.status === "completed");
      const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.amount), 0);
      const totalTransactions = completedOrders.length;

      // Generate time periods
      const periods = timeRange === "7d" 
        ? eachDayOfInterval({ start, end }).map(d => format(d, "MMM dd"))
        : timeRange === "30d"
        ? eachDayOfInterval({ start, end }).map(d => format(d, "MMM dd"))
        : timeRange === "90d"
        ? eachWeekOfInterval({ start, end }).map(d => format(d, "MMM dd"))
        : eachMonthOfInterval({ start, end }).map(d => format(d, "MMM yyyy"));

      // Revenue by period
      const revenueByPeriod = periods.map(period => {
        const periodOrders = completedOrders.filter(o => {
          const orderDate = new Date(o.created_at);
          if (timeRange === "7d" || timeRange === "30d") {
            return format(orderDate, "MMM dd") === period;
          } else if (timeRange === "90d") {
            return format(startOfWeek(orderDate), "MMM dd") === period;
          } else {
            return format(startOfMonth(orderDate), "MMM yyyy") === period;
          }
        });
        return {
          period,
          revenue: periodOrders.reduce((sum, o) => sum + Number(o.amount), 0),
          transactions: periodOrders.length,
        };
      });

      // Listings by period
      const listingsByPeriod = periods.map(period => {
        const periodListings = listings.filter(l => {
          const listingDate = new Date(l.created_at);
          if (timeRange === "7d" || timeRange === "30d") {
            return format(listingDate, "MMM dd") === period;
          } else if (timeRange === "90d") {
            return format(startOfWeek(listingDate), "MMM dd") === period;
          } else {
            return format(startOfMonth(listingDate), "MMM yyyy") === period;
          }
        });
        return {
          period,
          count: periodListings.length,
        };
      });

      // Offers by status
      const offerStatusCounts: Record<string, number> = {};
      offers.forEach(o => {
        offerStatusCounts[o.status] = (offerStatusCounts[o.status] || 0) + 1;
      });
      const offersByStatus = Object.entries(offerStatusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }));

      // Orders by status
      const orderStatusCounts: Record<string, number> = {};
      orders.forEach(o => {
        orderStatusCounts[o.status] = (orderStatusCounts[o.status] || 0) + 1;
      });
      const ordersByStatus = Object.entries(orderStatusCounts).map(([status, count]) => ({
        status: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        count,
      }));

      // Top waste types (from user's listings)
      const allListingsRes = await supabase
        .from("waste_listings")
        .select("waste_type, asking_price")
        .eq("user_id", user.id);
      
      const wasteTypeCounts: Record<string, { count: number; revenue: number }> = {};
      (allListingsRes.data || []).forEach(l => {
        if (!wasteTypeCounts[l.waste_type]) {
          wasteTypeCounts[l.waste_type] = { count: 0, revenue: 0 };
        }
        wasteTypeCounts[l.waste_type].count += 1;
        wasteTypeCounts[l.waste_type].revenue += Number(l.asking_price);
      });
      const topWasteTypes = Object.entries(wasteTypeCounts)
        .map(([type, data]) => ({
          type: type.charAt(0).toUpperCase() + type.slice(1),
          count: data.count,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent activity
      const recentActivity: AnalyticsData["recentActivity"] = [];
      
      orders.slice(-5).reverse().forEach(o => {
        recentActivity.push({
          date: o.created_at,
          type: "order",
          description: `Order ${o.status.replace(/_/g, " ")}`,
          amount: Number(o.amount),
        });
      });
      
      offers.slice(-5).reverse().forEach(o => {
        recentActivity.push({
          date: o.created_at,
          type: "offer",
          description: `Offer ${o.status}`,
          amount: Number(o.amount),
        });
      });
      
      recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setData({
        totalRevenue,
        totalTransactions,
        activeListings: activeListingsRes.count || 0,
        pendingOffers: pendingOffersRes.count || 0,
        revenueByPeriod,
        listingsByPeriod,
        offersByStatus,
        ordersByStatus,
        topWasteTypes,
        recentActivity: recentActivity.slice(0, 10),
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [user, getDateRange, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, refetch: fetchAnalytics };
};
