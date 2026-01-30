import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  offer_id: string | null;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
  // Joined data
  listing?: {
    id: string;
    title: string;
    images: string[];
  };
  other_user?: {
    full_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
  };
  last_message?: Message;
  unread_count?: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Fetch related data
    const listingIds = [...new Set(data.map(c => c.listing_id))];
    const userIds = [...new Set(data.map(c => c.buyer_id === user.id ? c.seller_id : c.buyer_id))];
    const conversationIds = data.map(c => c.id);

    const [listingsRes, profilesRes, lastMessagesRes, unreadCountsRes] = await Promise.all([
      supabase.from("waste_listings").select("id, title, images").in("id", listingIds),
      supabase.from("profiles").select("user_id, full_name, company_name, avatar_url").in("user_id", userIds),
      supabase.from("messages").select("*").in("conversation_id", conversationIds).order("created_at", { ascending: false }),
      supabase.from("messages").select("conversation_id").in("conversation_id", conversationIds).is("read_at", null).neq("sender_id", user.id)
    ]);

    const listingsMap = new Map(listingsRes.data?.map(l => [l.id, l]) || []);
    const profilesMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);
    
    // Get last message per conversation
    const lastMessageMap = new Map<string, Message>();
    lastMessagesRes.data?.forEach(msg => {
      if (!lastMessageMap.has(msg.conversation_id)) {
        lastMessageMap.set(msg.conversation_id, msg);
      }
    });

    // Count unread messages per conversation
    const unreadCountMap = new Map<string, number>();
    unreadCountsRes.data?.forEach(msg => {
      unreadCountMap.set(msg.conversation_id, (unreadCountMap.get(msg.conversation_id) || 0) + 1);
    });

    const enrichedConversations = data.map(conv => ({
      ...conv,
      listing: listingsMap.get(conv.listing_id),
      other_user: profilesMap.get(conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id),
      last_message: lastMessageMap.get(conv.id),
      unread_count: unreadCountMap.get(conv.id) || 0
    })) as Conversation[];

    setConversations(enrichedConversations);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => fetchConversations()
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  return { conversations, loading, refetch: fetchConversations };
};

export const useConversationMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
      return;
    }

    setMessages(data || []);
    setLoading(false);

    // Mark messages as read
    if (user && data && data.length > 0) {
      const unreadIds = data
        .filter(m => m.sender_id !== user.id && !m.read_at)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);
      }
    }
  }, [conversationId, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if not sender
          if (user && newMessage.sender_id !== user.id) {
            supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return { messages, loading, refetch: fetchMessages };
};

export const useSendMessage = () => {
  const { user } = useAuth();

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) throw new Error("Must be logged in");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { sendMessage };
};

export const useGetOrCreateConversation = () => {
  const { user } = useAuth();

  const getOrCreateConversation = async (
    listingId: string,
    sellerId: string,
    offerId?: string
  ): Promise<Conversation> => {
    if (!user) throw new Error("Must be logged in");

    // First try to find existing conversation
    let query = supabase
      .from("conversations")
      .select("*")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .eq("seller_id", sellerId);

    if (offerId) {
      query = query.eq("offer_id", offerId);
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) return existing;

    // Create new conversation
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
        offer_id: offerId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { getOrCreateConversation };
};
