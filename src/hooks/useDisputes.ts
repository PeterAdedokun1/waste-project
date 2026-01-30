import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type DisputeStatus = 
  | "open"
  | "under_review"
  | "awaiting_response"
  | "resolved_buyer_favor"
  | "resolved_seller_favor"
  | "resolved_mutual"
  | "closed";

export type DisputeReason =
  | "quality_issue"
  | "quantity_mismatch"
  | "wrong_material"
  | "delivery_issue"
  | "payment_issue"
  | "communication_issue"
  | "fraud_suspected"
  | "other";

export interface Dispute {
  id: string;
  order_id: string;
  raised_by: string;
  reason: DisputeReason;
  description: string;
  evidence_urls: string[];
  status: DisputeStatus;
  admin_id: string | null;
  admin_notes: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  sender_name?: string;
}

export interface AdminDispute extends Dispute {
  raiser_name: string | null;
  order_amount: number;
  listing_title: string | null;
  buyer_name: string | null;
  seller_name: string | null;
}

export const disputeReasonLabels: Record<DisputeReason, string> = {
  quality_issue: "Quality Issue",
  quantity_mismatch: "Quantity Mismatch",
  wrong_material: "Wrong Material",
  delivery_issue: "Delivery Issue",
  payment_issue: "Payment Issue",
  communication_issue: "Communication Issue",
  fraud_suspected: "Fraud Suspected",
  other: "Other",
};

export const disputeStatusLabels: Record<DisputeStatus, string> = {
  open: "Open",
  under_review: "Under Review",
  awaiting_response: "Awaiting Response",
  resolved_buyer_favor: "Resolved (Buyer)",
  resolved_seller_favor: "Resolved (Seller)",
  resolved_mutual: "Resolved (Mutual)",
  closed: "Closed",
};

export const useOrderDispute = (orderId: string | undefined) => {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDispute = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (!error && data) {
        setDispute(data as Dispute);
      }
      setLoading(false);
    };

    fetchDispute();
  }, [orderId]);

  return { dispute, loading };
};

export const useDisputeMessages = (disputeId: string | undefined) => {
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!disputeId) {
        setLoading(false);
        return;
      }

      const { data: messagesData, error } = await supabase
        .from("dispute_messages")
        .select("*")
        .eq("dispute_id", disputeId)
        .order("created_at", { ascending: true });

      if (error || !messagesData) {
        setLoading(false);
        return;
      }

      // Fetch sender profiles
      const senderIds = [...new Set(messagesData.map((m) => m.sender_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", senderIds);

      const profilesMap = new Map(
        profilesData?.map((p) => [p.user_id, p.full_name]) || []
      );

      const messagesWithNames = messagesData.map((msg) => ({
        ...msg,
        sender_name: msg.is_admin ? "Admin" : (profilesMap.get(msg.sender_id) || "User"),
      }));

      setMessages(messagesWithNames);
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to realtime updates
    if (disputeId) {
      const channel = supabase
        .channel(`dispute-messages-${disputeId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "dispute_messages",
            filter: `dispute_id=eq.${disputeId}`,
          },
          () => fetchMessages()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [disputeId]);

  return { messages, loading };
};

export const useCreateDispute = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createDispute = async (
    orderId: string,
    reason: DisputeReason,
    description: string
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to raise a dispute",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("disputes")
      .insert({
        order_id: orderId,
        raised_by: user.id,
        reason,
        description,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create dispute",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Dispute Raised",
      description: "Your dispute has been submitted for review.",
    });
    return data;
  };

  return { createDispute, loading };
};

export const useSendDisputeMessage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const sendMessage = async (disputeId: string, message: string, isAdmin = false) => {
    if (!user) return false;

    setLoading(true);
    const { error } = await supabase.from("dispute_messages").insert({
      dispute_id: disputeId,
      sender_id: user.id,
      message,
      is_admin: isAdmin,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { sendMessage, loading };
};

export const useAdminDisputes = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_all_disputes_admin");

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch disputes",
        variant: "destructive",
      });
    } else {
      setDisputes((data || []) as AdminDispute[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const updateDispute = async (
    disputeId: string,
    status: DisputeStatus,
    notes?: string,
    resolution?: string
  ) => {
    const { error } = await supabase.rpc("admin_update_dispute", {
      dispute_id: disputeId,
      new_status: status,
      notes: notes || null,
      resolution: resolution || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update dispute",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Dispute Updated",
      description: "The dispute has been updated successfully.",
    });
    await fetchDisputes();
    return true;
  };

  return { disputes, loading, refetch: fetchDisputes, updateDispute };
};
