import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type OrderStatus = 
  | "pending_pickup"
  | "pickup_scheduled"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed";

export interface Order {
  id: string;
  offer_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: OrderStatus;
  pickup_date: string | null;
  pickup_time: string | null;
  pickup_address: string | null;
  pickup_notes: string | null;
  delivery_confirmed_at: string | null;
  seller_confirmed_at: string | null;
  buyer_confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  listing?: {
    id: string;
    title: string;
    waste_type: string;
    quantity: number;
    quantity_unit: string;
    images: string[];
  };
  buyer_profile?: {
    full_name: string | null;
    company_name: string | null;
    phone: string | null;
    location: string | null;
  };
  seller_profile?: {
    full_name: string | null;
    company_name: string | null;
    phone: string | null;
    location: string | null;
  };
}

export interface OrderStatusHistoryEntry {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string;
  notes: string | null;
  created_at: string;
}

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }

    // Fetch related data
    const listingIds = [...new Set(data.map(o => o.listing_id))];
    const userIds = [...new Set(data.flatMap(o => [o.buyer_id, o.seller_id]))];

    const [listingsRes, profilesRes] = await Promise.all([
      supabase.from("waste_listings").select("id, title, waste_type, quantity, quantity_unit, images").in("id", listingIds),
      supabase.from("profiles").select("user_id, full_name, company_name, phone, location").in("user_id", userIds)
    ]);

    const listingsMap = new Map(listingsRes.data?.map(l => [l.id, l]) || []);
    const profilesMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);

    const enrichedOrders = data.map(order => ({
      ...order,
      listing: listingsMap.get(order.listing_id),
      buyer_profile: profilesMap.get(order.buyer_id),
      seller_profile: profilesMap.get(order.seller_id)
    })) as Order[];

    setOrders(enrichedOrders);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
};

export const useOrderStatusHistory = (orderId: string | null) => {
  const [history, setHistory] = useState<OrderStatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching order history:", error);
      } else {
        setHistory(data || []);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [orderId]);

  return { history, loading };
};

export const useUpdateOrderStatus = () => {
  const { user } = useAuth();

  const updateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    notes?: string,
    additionalUpdates?: Partial<Order>
  ) => {
    if (!user) throw new Error("Must be logged in");

    const updates: Record<string, unknown> = {
      status: newStatus,
      ...additionalUpdates,
    };

    // Add timestamp based on status
    if (newStatus === "completed") {
      updates.completed_at = new Date().toISOString();
    } else if (newStatus === "cancelled") {
      updates.cancelled_at = new Date().toISOString();
    } else if (newStatus === "delivered") {
      updates.delivery_confirmed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (updateError) throw updateError;

    // Add to history
    const { error: historyError } = await supabase
      .from("order_status_history")
      .insert({
        order_id: orderId,
        status: newStatus,
        changed_by: user.id,
        notes: notes || null,
      });

    if (historyError) throw historyError;
  };

  return { updateStatus };
};

export const useSchedulePickup = () => {
  const { user } = useAuth();

  const schedulePickup = async (
    orderId: string,
    pickupDate: string,
    pickupTime: string,
    pickupAddress: string,
    pickupNotes?: string
  ) => {
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
      .from("orders")
      .update({
        status: "pickup_scheduled",
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        pickup_address: pickupAddress,
        pickup_notes: pickupNotes || null,
      })
      .eq("id", orderId);

    if (error) throw error;

    // Add to history
    await supabase
      .from("order_status_history")
      .insert({
        order_id: orderId,
        status: "pickup_scheduled",
        changed_by: user.id,
        notes: `Pickup scheduled for ${pickupDate} at ${pickupTime}`,
      });
  };

  return { schedulePickup };
};

export const useConfirmDelivery = () => {
  const { user } = useAuth();

  const confirmDelivery = async (orderId: string, isBuyer: boolean) => {
    if (!user) throw new Error("Must be logged in");

    const updates: Record<string, unknown> = {};
    
    if (isBuyer) {
      updates.buyer_confirmed_at = new Date().toISOString();
    } else {
      updates.seller_confirmed_at = new Date().toISOString();
    }

    // Get current order to check if both parties confirmed
    const { data: order } = await supabase
      .from("orders")
      .select("buyer_confirmed_at, seller_confirmed_at")
      .eq("id", orderId)
      .single();

    // If the other party already confirmed, mark as completed
    if (order) {
      const otherConfirmed = isBuyer ? order.seller_confirmed_at : order.buyer_confirmed_at;
      if (otherConfirmed) {
        updates.status = "completed";
        updates.completed_at = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (error) throw error;

    // Add to history
    await supabase
      .from("order_status_history")
      .insert({
        order_id: orderId,
        status: updates.status === "completed" ? "completed" : "delivered",
        changed_by: user.id,
        notes: `${isBuyer ? "Buyer" : "Seller"} confirmed delivery`,
      });
  };

  return { confirmDelivery };
};
