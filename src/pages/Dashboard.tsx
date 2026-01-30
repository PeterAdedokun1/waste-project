import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import { 
  Package, 
  TrendingUp, 
  MessageSquare, 
  Plus,
  Factory,
  Truck,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ShoppingBag
} from "lucide-react";

const userTypeIcons = {
  generator: Factory,
  middleman: Truck,
  recycler: RefreshCw,
};

const userTypeLabels = {
  generator: "Waste Generator",
  middleman: "Middleman",
  recycler: "Recycler",
};

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const [listingsCount, setListingsCount] = useState(0);
  const [pendingOffersCount, setPendingOffersCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    const [listingsRes, receivedOffersRes, sentOffersRes, activeOrdersRes, completedOrdersRes, revenueRes] = await Promise.all([
      supabase
        .from("waste_listings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("status", "active"),
      supabase
        .from("offers")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user?.id)
        .eq("status", "pending"),
      supabase
        .from("offers")
        .select("*", { count: "exact", head: true })
        .eq("buyer_id", user?.id)
        .in("status", ["pending", "countered"]),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .or(`buyer_id.eq.${user?.id},seller_id.eq.${user?.id}`)
        .in("status", ["pending_pickup", "pickup_scheduled", "in_transit", "delivered"]),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .or(`buyer_id.eq.${user?.id},seller_id.eq.${user?.id}`)
        .eq("status", "completed"),
      supabase
        .from("orders")
        .select("amount")
        .or(`buyer_id.eq.${user?.id},seller_id.eq.${user?.id}`)
        .eq("status", "completed")
    ]);
    
    setListingsCount(listingsRes.count || 0);
    setPendingOffersCount((receivedOffersRes.count || 0) + (sentOffersRes.count || 0));
    setActiveOrdersCount(activeOrdersRes.count || 0);
    setCompletedOrdersCount(completedOrdersRes.count || 0);
    
    const revenue = (revenueRes.data || []).reduce((sum, o) => sum + Number(o.amount), 0);
    setTotalRevenue(revenue);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const UserIcon = profile?.user_type ? userTypeIcons[profile.user_type] : Factory;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-hero-gradient flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Welcome, {profile?.full_name || "User"}!
                </h1>
                <p className="text-muted-foreground">
                  {profile?.user_type ? userTypeLabels[profile.user_type] : "Member"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link to="/my-listings" className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-primary" />
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{listingsCount}</p>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </Link>

            <Link to="/analytics" className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-accent" />
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  This month
                </span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </Link>

            <Link to="/my-offers" className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
                {pendingOffersCount > 0 && (
                  <span className="text-xs text-primary-foreground bg-primary px-2 py-1 rounded-full">
                    {pendingOffersCount} pending
                  </span>
                )}
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{pendingOffersCount}</p>
              <p className="text-sm text-muted-foreground">Active Offers</p>
            </Link>

            <Link to="/my-orders" className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <ShoppingBag className="w-8 h-8 text-primary" />
                {activeOrdersCount > 0 && (
                  <span className="text-xs text-primary-foreground bg-primary px-2 py-1 rounded-full">
                    {activeOrdersCount} active
                  </span>
                )}
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{activeOrdersCount}</p>
              <p className="text-sm text-muted-foreground">Active Orders</p>
            </Link>

            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-accent" />
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  Completed
                </span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{completedOrdersCount}</p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>
          </div>

          {/* Quick Actions + Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Listing Card */}
            <div className="bg-hero-gradient rounded-3xl p-8 text-primary-foreground">
              <h3 className="font-display text-2xl font-bold mb-2">
                {profile?.user_type === "generator" 
                  ? "List Your Waste" 
                  : profile?.user_type === "recycler"
                  ? "Browse Materials"
                  : "Find Opportunities"}
              </h3>
              <p className="text-white/80 mb-6">
                {profile?.user_type === "generator"
                  ? "Post your waste materials and start receiving offers from interested buyers."
                  : profile?.user_type === "recycler"
                  ? "Browse available waste materials and make competitive offers."
                  : "Connect waste generators with recyclers and earn margins."}
              </p>
              <Button 
                className="bg-white text-primary hover:bg-white/90"
                size="lg"
                asChild
              >
                <Link to={profile?.user_type === "generator" ? "/create-listing" : "/browse"}>
                  <Plus className="w-4 h-4 mr-2" />
                  {profile?.user_type === "generator" ? "Create Listing" : "Browse Listings"}
                </Link>
              </Button>
            </div>

            {/* Recent Activity Feed */}
            <RecentActivityFeed />

            {/* Profile Completion Card */}
            <div className="bg-card rounded-3xl p-8 shadow-soft border border-border">
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Complete Your Profile
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Add more details to build trust with other traders.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">Add company name</span>
                  <span className="text-xs text-muted-foreground">+20%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">Add phone number</span>
                  <span className="text-xs text-muted-foreground">+15%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">Add location</span>
                  <span className="text-xs text-muted-foreground">+15%</span>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/profile">
                  Edit Profile
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
