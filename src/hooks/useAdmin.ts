import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  user_type: string;
  location: string | null;
  is_suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  created_at: string;
}

interface AdminListing {
  id: string;
  title: string;
  description: string | null;
  waste_type: string;
  quantity: number;
  quantity_unit: string;
  asking_price: number;
  location: string;
  city: string | null;
  state: string | null;
  status: string;
  views_count: number;
  offers_count: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  seller_name: string | null;
  seller_email: string | null;
}

interface AdminOrder {
  id: string;
  offer_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: string;
  pickup_date: string | null;
  created_at: string;
  updated_at: string;
  buyer_name: string | null;
  seller_name: string | null;
  listing_title: string | null;
}

interface PlatformStats {
  totalUsers: number;
  activeListings: number;
  totalTransactions: number;
  totalRevenue: number;
  suspendedUsers: number;
  pendingOrders: number;
}

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, loading };
};

export const useAdminData = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeListings: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    suspendedUsers: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, listingsRes, ordersRes] = await Promise.all([
        supabase.rpc("get_all_profiles_admin"),
        supabase.rpc("get_all_listings_admin"),
        supabase.rpc("get_all_orders_admin"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (listingsRes.error) throw listingsRes.error;
      if (ordersRes.error) throw ordersRes.error;

      const profilesData = (profilesRes.data || []) as AdminProfile[];
      const listingsData = (listingsRes.data || []) as AdminListing[];
      const ordersData = (ordersRes.data || []) as AdminOrder[];

      setProfiles(profilesData);
      setListings(listingsData);
      setOrders(ordersData);

      // Calculate stats
      setStats({
        totalUsers: profilesData.length,
        activeListings: listingsData.filter((l) => l.status === "active").length,
        totalTransactions: ordersData.filter((o) => o.status === "completed").length,
        totalRevenue: ordersData
          .filter((o) => o.status === "completed")
          .reduce((sum, o) => sum + Number(o.amount), 0),
        suspendedUsers: profilesData.filter((p) => p.is_suspended).length,
        pendingOrders: ordersData.filter((o) => 
          ["pending_pickup", "pickup_scheduled", "in_transit"].includes(o.status)
        ).length,
      });
    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { profiles, listings, orders, stats, loading, refetch: fetchData };
};

export const useAdminActions = () => {
  const { toast } = useToast();

  const suspendUser = async (userId: string, reason: string) => {
    const { error } = await supabase.rpc("suspend_user", {
      target_user_id: userId,
      reason,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend user",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "User Suspended",
      description: "The user has been suspended successfully.",
    });
    return true;
  };

  const unsuspendUser = async (userId: string) => {
    const { error } = await supabase.rpc("unsuspend_user", {
      target_user_id: userId,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to unsuspend user",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "User Unsuspended",
      description: "The user has been unsuspended successfully.",
    });
    return true;
  };

  const removeListing = async (listingId: string) => {
    const { error } = await supabase.rpc("admin_remove_listing", {
      target_listing_id: listingId,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove listing",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Listing Removed",
      description: "The listing has been removed successfully.",
    });
    return true;
  };

  const assignAdminRole = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "admin",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign admin role",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Admin Role Assigned",
      description: "The user has been granted admin privileges.",
    });
    return true;
  };

  return { suspendUser, unsuspendUser, removeListing, assignAdminRole };
};
