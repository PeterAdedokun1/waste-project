import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ActivityItem {
  id: string;
  type: "offer_received" | "offer_sent" | "order_update" | "message";
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    listingTitle?: string;
    amount?: number;
    status?: string;
    senderName?: string;
  };
}

export const useRecentActivity = (limit = 10) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchActivity = async () => {
      setLoading(true);

      const [offersRes, ordersRes, messagesRes] = await Promise.all([
        // Fetch recent offers (both received and sent)
        supabase
          .from("offers")
          .select(`
            id,
            amount,
            status,
            created_at,
            updated_at,
            buyer_id,
            seller_id,
            listing:waste_listings(title)
          `)
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order("updated_at", { ascending: false })
          .limit(limit),

        // Fetch recent orders
        supabase
          .from("orders")
          .select(`
            id,
            amount,
            status,
            created_at,
            updated_at,
            buyer_id,
            seller_id,
            listing:waste_listings(title)
          `)
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order("updated_at", { ascending: false })
          .limit(limit),

        // Fetch recent messages
        supabase
          .from("messages")
          .select(`
            id,
            content,
            created_at,
            sender_id,
            conversation:conversations(
              listing:waste_listings(title),
              buyer_id,
              seller_id
            )
          `)
          .neq("sender_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limit),
      ]);

      const activityItems: ActivityItem[] = [];

      // Process offers
      if (offersRes.data) {
        offersRes.data.forEach((offer) => {
          const isReceived = offer.seller_id === user.id;
          const listingTitle = (offer.listing as any)?.title || "a listing";
          
          activityItems.push({
            id: `offer-${offer.id}`,
            type: isReceived ? "offer_received" : "offer_sent",
            title: isReceived ? "New Offer Received" : "Offer Update",
            description: isReceived
              ? `You received an offer of $${offer.amount.toLocaleString()} on "${listingTitle}"`
              : `Your offer of $${offer.amount.toLocaleString()} on "${listingTitle}" is ${offer.status}`,
            timestamp: offer.updated_at || offer.created_at,
            metadata: {
              listingTitle,
              amount: offer.amount,
              status: offer.status,
            },
          });
        });
      }

      // Process orders
      if (ordersRes.data) {
        ordersRes.data.forEach((order) => {
          const isBuyer = order.buyer_id === user.id;
          const listingTitle = (order.listing as any)?.title || "an order";
          const statusLabels: Record<string, string> = {
            pending_pickup: "pending pickup",
            pickup_scheduled: "pickup scheduled",
            in_transit: "in transit",
            delivered: "delivered",
            completed: "completed",
            cancelled: "cancelled",
            disputed: "disputed",
          };

          activityItems.push({
            id: `order-${order.id}`,
            type: "order_update",
            title: "Order Update",
            description: `Order for "${listingTitle}" is now ${statusLabels[order.status] || order.status}`,
            timestamp: order.updated_at || order.created_at,
            metadata: {
              listingTitle,
              amount: order.amount,
              status: order.status,
            },
          });
        });
      }

      // Process messages
      if (messagesRes.data) {
        messagesRes.data.forEach((message) => {
          const conversation = message.conversation as any;
          const listingTitle = conversation?.listing?.title || "a listing";

          activityItems.push({
            id: `message-${message.id}`,
            type: "message",
            title: "New Message",
            description: `New message about "${listingTitle}": "${message.content.substring(0, 50)}${message.content.length > 50 ? "..." : ""}"`,
            timestamp: message.created_at,
            metadata: {
              listingTitle,
            },
          });
        });
      }

      // Sort by timestamp and limit
      activityItems.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(activityItems.slice(0, limit));
      setLoading(false);
    };

    fetchActivity();
  }, [user, limit]);

  return { activities, loading };
};
