import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Offer {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "countered" | "expired" | "withdrawn";
  parent_offer_id: string | null;
  counter_amount: number | null;
  counter_message: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  listing?: {
    id: string;
    title: string;
    waste_type: string;
    asking_price: number;
    images: string[];
  };
  buyer_profile?: {
    full_name: string | null;
    company_name: string | null;
  };
  seller_profile?: {
    full_name: string | null;
    company_name: string | null;
  };
}

export const useOffers = (listingId?: string) => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    if (!user) return;

    let query = supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false });

    if (listingId) {
      query = query.eq("listing_id", listingId);
    } else {
      query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching offers:", error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setOffers([]);
      setLoading(false);
      return;
    }

    // Fetch related data
    const listingIds = [...new Set(data.map(o => o.listing_id))];
    const userIds = [...new Set(data.flatMap(o => [o.buyer_id, o.seller_id]))];

    const [listingsRes, profilesRes] = await Promise.all([
      supabase.from("waste_listings").select("id, title, waste_type, asking_price, images").in("id", listingIds),
      supabase.from("profiles").select("user_id, full_name, company_name").in("user_id", userIds)
    ]);

    const listingsMap = new Map(listingsRes.data?.map(l => [l.id, l]) || []);
    const profilesMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);

    const enrichedOffers = data.map(offer => ({
      ...offer,
      listing: listingsMap.get(offer.listing_id),
      buyer_profile: profilesMap.get(offer.buyer_id),
      seller_profile: profilesMap.get(offer.seller_id)
    })) as Offer[];

    setOffers(enrichedOffers);
    setLoading(false);
  }, [user, listingId]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("offers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
          filter: listingId 
            ? `listing_id=eq.${listingId}`
            : undefined
        },
        () => {
          fetchOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, listingId, fetchOffers]);

  return { offers, loading, refetch: fetchOffers };
};

export const useCreateOffer = () => {
  const { user } = useAuth();

  const createOffer = async (
    listingId: string,
    sellerId: string,
    amount: number,
    message?: string
  ) => {
    if (!user) throw new Error("Must be logged in");

    const { data, error } = await supabase
      .from("offers")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
        amount,
        message: message || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { createOffer };
};

export const useRespondToOffer = () => {
  const respondToOffer = async (
    offerId: string,
    action: "accept" | "decline" | "counter",
    counterAmount?: number,
    counterMessage?: string
  ) => {
    const updates: Record<string, unknown> = {
      responded_at: new Date().toISOString()
    };

    if (action === "accept") {
      updates.status = "accepted";
    } else if (action === "decline") {
      updates.status = "declined";
    } else if (action === "counter") {
      updates.status = "countered";
      updates.counter_amount = counterAmount;
      updates.counter_message = counterMessage || null;
    }

    const { data, error } = await supabase
      .from("offers")
      .update(updates)
      .eq("id", offerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { respondToOffer };
};

export const useAcceptCounter = () => {
  const { user } = useAuth();

  const acceptCounter = async (offer: Offer) => {
    if (!user) throw new Error("Must be logged in");

    // Create a new accepted offer with the counter amount
    const { data, error } = await supabase
      .from("offers")
      .insert({
        listing_id: offer.listing_id,
        buyer_id: offer.buyer_id,
        seller_id: offer.seller_id,
        amount: offer.counter_amount,
        message: `Accepted counter offer of $${offer.counter_amount?.toLocaleString()}`,
        status: "accepted",
        parent_offer_id: offer.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { acceptCounter };
};

export const useWithdrawOffer = () => {
  const withdrawOffer = async (offerId: string) => {
    const { data, error } = await supabase
      .from("offers")
      .update({ status: "withdrawn" })
      .eq("id", offerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { withdrawOffer };
};
