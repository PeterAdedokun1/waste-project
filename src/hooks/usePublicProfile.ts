import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PublicProfile {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  user_type: "generator" | "middleman" | "recycler";
  created_at: string;
}

interface PublicListing {
  id: string;
  title: string;
  waste_type: string;
  quantity: number;
  quantity_unit: string;
  asking_price: number;
  location: string;
  status: string;
  created_at: string;
  images: string[] | null;
}

interface CompletedTransaction {
  id: string;
  amount: number;
  completed_at: string;
  role: "buyer" | "seller";
  listing_title: string;
  waste_type: string;
}

export const usePublicProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Use the public view to avoid exposing sensitive data (email, phone)
      const { data, error } = await supabase
        .from("profiles_public")
        .select("user_id, full_name, company_name, location, bio, avatar_url, user_type, created_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as PublicProfile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading };
};

export const useUserListings = (userId: string | undefined) => {
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("waste_listings")
        .select("id, title, waste_type, quantity, quantity_unit, asking_price, location, status, created_at, images")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setListings(data as PublicListing[]);
      }
      setLoading(false);
    };

    fetchListings();
  }, [userId]);

  return { listings, loading };
};

export const useUserTransactions = (userId: string | undefined) => {
  const [transactions, setTransactions] = useState<CompletedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCompleted: 0, totalValue: 0 });

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Fetch completed orders where user is buyer or seller
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, amount, completed_at, buyer_id, seller_id, listing_id")
        .eq("status", "completed")
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("completed_at", { ascending: false })
        .limit(10);

      if (ordersError || !ordersData) {
        setLoading(false);
        return;
      }

      // Fetch listing details
      const listingIds = [...new Set(ordersData.map(o => o.listing_id))];
      const { data: listingsData } = await supabase
        .from("waste_listings")
        .select("id, title, waste_type")
        .in("id", listingIds);

      const listingsMap = new Map(
        listingsData?.map(l => [l.id, { title: l.title, waste_type: l.waste_type }]) || []
      );

      const transactionsWithDetails: CompletedTransaction[] = ordersData.map(order => ({
        id: order.id,
        amount: order.amount,
        completed_at: order.completed_at || "",
        role: order.buyer_id === userId ? "buyer" : "seller",
        listing_title: listingsMap.get(order.listing_id)?.title || "Unknown",
        waste_type: listingsMap.get(order.listing_id)?.waste_type || "other",
      }));

      setTransactions(transactionsWithDetails);
      setStats({
        totalCompleted: ordersData.length,
        totalValue: ordersData.reduce((sum, o) => sum + Number(o.amount), 0),
      });
      setLoading(false);
    };

    fetchTransactions();
  }, [userId]);

  return { transactions, stats, loading };
};
