import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface OfferPayload {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: string;
  counter_amount: number | null;
}

interface MessagePayload {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
}

interface OrderPayload {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  pickup_date: string | null;
}

export const useOfferNotifications = () => {
  const { user } = useAuth();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    const channel = supabase
      .channel("app-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "offers",
        },
        async (payload) => {
          const offer = payload.new as OfferPayload;
          
          // Notify seller of new offer
          if (offer.seller_id === user.id) {
            const { data: listing } = await supabase
              .from("waste_listings")
              .select("title")
              .eq("id", offer.listing_id)
              .single();

            toast.success("New Offer Received! 🎉", {
              description: `You received an offer of $${offer.amount.toLocaleString()} for "${listing?.title || "your listing"}"`,
              action: {
                label: "View",
                onClick: () => window.location.href = "/my-offers",
              },
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "offers",
        },
        async (payload) => {
          const offer = payload.new as OfferPayload;
          const oldOffer = payload.old as OfferPayload;

          if (offer.status === oldOffer.status) return;

          const { data: listing } = await supabase
            .from("waste_listings")
            .select("title")
            .eq("id", offer.listing_id)
            .single();

          const listingTitle = listing?.title || "the listing";

          if (offer.status === "accepted" && offer.buyer_id === user.id) {
            toast.success("Offer Accepted! 🎊", {
              description: `Your offer for "${listingTitle}" was accepted! An order has been created.`,
              action: {
                label: "View Order",
                onClick: () => window.location.href = "/my-orders",
              },
            });
          }

          if (offer.status === "declined" && offer.buyer_id === user.id) {
            toast.error("Offer Declined", {
              description: `Your offer for "${listingTitle}" was declined.`,
              action: {
                label: "View",
                onClick: () => window.location.href = "/my-offers",
              },
            });
          }

          if (offer.status === "countered" && offer.buyer_id === user.id) {
            toast.info("Counter Offer Received! 💬", {
              description: `The seller countered with $${offer.counter_amount?.toLocaleString()} for "${listingTitle}"`,
              action: {
                label: "View",
                onClick: () => window.location.href = "/my-offers",
              },
            });
          }

          if (offer.status === "accepted" && offer.seller_id === user.id && oldOffer.status !== "accepted") {
            toast.success("Deal Confirmed! 🤝", {
              description: `An order has been created for "${listingTitle}"!`,
              action: {
                label: "View Order",
                onClick: () => window.location.href = "/my-orders",
              },
            });
          }

          if (offer.status === "withdrawn" && offer.seller_id === user.id) {
            toast.info("Offer Withdrawn", {
              description: `A buyer withdrew their offer for "${listingTitle}"`,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const message = payload.new as MessagePayload;
          
          if (message.sender_id === user.id) return;

          const { data: conversation } = await supabase
            .from("conversations")
            .select("buyer_id, seller_id, listing:waste_listings(title)")
            .eq("id", message.conversation_id)
            .single();

          if (!conversation) return;
          if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) return;

          const { data: sender } = await supabase
            .from("profiles")
            .select("full_name, company_name")
            .eq("user_id", message.sender_id)
            .single();

          const senderName = sender?.full_name || sender?.company_name || "Someone";

          toast.info(`New Message from ${senderName}`, {
            description: message.content.length > 50 
              ? `${message.content.substring(0, 50)}...` 
              : message.content,
            action: {
              label: "Reply",
              onClick: () => window.location.href = "/messages",
            },
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        async (payload) => {
          const order = payload.new as OrderPayload;
          const oldOrder = payload.old as OrderPayload;

          if (order.status === oldOrder.status) return;

          const { data: listing } = await supabase
            .from("waste_listings")
            .select("title")
            .eq("id", order.listing_id)
            .single();

          const listingTitle = listing?.title || "your order";
          const isBuyer = order.buyer_id === user.id;
          const isSeller = order.seller_id === user.id;

          if (!isBuyer && !isSeller) return;

          const statusMessages: Record<string, { title: string; description: string }> = {
            pickup_scheduled: {
              title: "Pickup Scheduled 📅",
              description: `Pickup has been scheduled for "${listingTitle}"`,
            },
            in_transit: {
              title: "Order In Transit 🚚",
              description: `The materials for "${listingTitle}" are now in transit`,
            },
            delivered: {
              title: "Order Delivered 📦",
              description: `Materials for "${listingTitle}" have been delivered`,
            },
            completed: {
              title: "Transaction Complete ✅",
              description: `The order for "${listingTitle}" has been completed`,
            },
            cancelled: {
              title: "Order Cancelled",
              description: `The order for "${listingTitle}" has been cancelled`,
            },
          };

          const message = statusMessages[order.status];
          if (message) {
            if (order.status === "cancelled") {
              toast.error(message.title, {
                description: message.description,
                action: {
                  label: "View",
                  onClick: () => window.location.href = "/my-orders",
                },
              });
            } else {
              toast.success(message.title, {
                description: message.description,
                action: {
                  label: "View",
                  onClick: () => window.location.href = "/my-orders",
                },
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      initializedRef.current = false;
    };
  }, [user]);
};
