-- Create dispute status enum
CREATE TYPE public.dispute_status AS ENUM (
  'open',
  'under_review',
  'awaiting_response',
  'resolved_buyer_favor',
  'resolved_seller_favor',
  'resolved_mutual',
  'closed'
);

-- Create dispute reason enum
CREATE TYPE public.dispute_reason AS ENUM (
  'quality_issue',
  'quantity_mismatch',
  'wrong_material',
  'delivery_issue',
  'payment_issue',
  'communication_issue',
  'fraud_suspected',
  'other'
);

-- Create disputes table
CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    raised_by UUID NOT NULL,
    reason public.dispute_reason NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    status public.dispute_status NOT NULL DEFAULT 'open',
    admin_id UUID,
    admin_notes TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    -- One active dispute per order
    UNIQUE (order_id)
);

-- Create dispute messages for communication
CREATE TABLE public.dispute_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;

-- Disputes RLS policies
CREATE POLICY "Users can view disputes for their orders"
ON public.disputes
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id
        AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
    OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can create disputes for their orders"
ON public.disputes
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = raised_by
    AND EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id
        AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
        AND o.status NOT IN ('completed', 'cancelled')
    )
);

CREATE POLICY "Admins can update disputes"
ON public.disputes
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Dispute messages RLS policies
CREATE POLICY "Users can view messages for their disputes"
ON public.dispute_messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.disputes d
        JOIN public.orders o ON o.id = d.order_id
        WHERE d.id = dispute_id
        AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
    OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can send messages to their disputes"
ON public.dispute_messages
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.disputes d
        JOIN public.orders o ON o.id = d.order_id
        WHERE d.id = dispute_id
        AND (
            (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
            OR public.has_role(auth.uid(), 'admin')
        )
        AND d.status NOT IN ('resolved_buyer_favor', 'resolved_seller_favor', 'resolved_mutual', 'closed')
    )
);

-- Admin function to get all disputes
CREATE OR REPLACE FUNCTION public.get_all_disputes_admin()
RETURNS TABLE (
    id UUID,
    order_id UUID,
    raised_by UUID,
    reason public.dispute_reason,
    description TEXT,
    status public.dispute_status,
    admin_id UUID,
    admin_notes TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    raiser_name TEXT,
    order_amount NUMERIC,
    listing_title TEXT,
    buyer_name TEXT,
    seller_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        d.id, d.order_id, d.raised_by, d.reason, d.description, d.status,
        d.admin_id, d.admin_notes, d.resolution_notes, d.resolved_at,
        d.created_at, d.updated_at,
        pr.full_name as raiser_name,
        o.amount as order_amount,
        l.title as listing_title,
        pb.full_name as buyer_name,
        ps.full_name as seller_name
    FROM public.disputes d
    JOIN public.orders o ON o.id = d.order_id
    LEFT JOIN public.profiles pr ON pr.user_id = d.raised_by
    LEFT JOIN public.profiles pb ON pb.user_id = o.buyer_id
    LEFT JOIN public.profiles ps ON ps.user_id = o.seller_id
    LEFT JOIN public.waste_listings l ON l.id = o.listing_id
    ORDER BY 
        CASE d.status 
            WHEN 'open' THEN 1
            WHEN 'under_review' THEN 2
            WHEN 'awaiting_response' THEN 3
            ELSE 4
        END,
        d.created_at DESC
$$;

-- Admin function to update dispute status
CREATE OR REPLACE FUNCTION public.admin_update_dispute(
    dispute_id UUID,
    new_status public.dispute_status,
    notes TEXT DEFAULT NULL,
    resolution TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id UUID;
BEGIN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Admin role required';
    END IF;
    
    -- Get order_id for potential status update
    SELECT order_id INTO v_order_id FROM public.disputes WHERE id = dispute_id;
    
    UPDATE public.disputes
    SET 
        status = new_status,
        admin_id = auth.uid(),
        admin_notes = COALESCE(notes, admin_notes),
        resolution_notes = COALESCE(resolution, resolution_notes),
        resolved_at = CASE 
            WHEN new_status IN ('resolved_buyer_favor', 'resolved_seller_favor', 'resolved_mutual', 'closed') 
            THEN now() 
            ELSE resolved_at 
        END,
        updated_at = now()
    WHERE id = dispute_id;
    
    -- Update order status based on resolution
    IF new_status IN ('resolved_buyer_favor', 'resolved_seller_favor', 'resolved_mutual') THEN
        UPDATE public.orders
        SET status = 'completed', completed_at = now(), updated_at = now()
        WHERE id = v_order_id AND status = 'disputed';
    ELSIF new_status = 'closed' THEN
        UPDATE public.orders
        SET status = 'cancelled', cancelled_at = now(), cancellation_reason = 'Dispute closed', updated_at = now()
        WHERE id = v_order_id AND status = 'disputed';
    END IF;
    
    RETURN true;
END;
$$;

-- Trigger to mark order as disputed when dispute is created
CREATE OR REPLACE FUNCTION public.mark_order_disputed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.orders
    SET status = 'disputed', updated_at = now()
    WHERE id = NEW.order_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_dispute_created
AFTER INSERT ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.mark_order_disputed();

-- Add triggers for updated_at
CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dispute_messages;