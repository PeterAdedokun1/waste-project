-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL,
    reviewee_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    -- Ensure one review per user per order (buyer reviews seller, seller reviews buyer)
    UNIQUE (order_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews (for reputation transparency)
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Users can only create reviews for orders they're part of and only for completed orders
CREATE POLICY "Users can create reviews for their completed orders"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id
        AND o.status = 'completed'
        AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
        AND (
            (o.buyer_id = auth.uid() AND reviewee_id = o.seller_id) OR
            (o.seller_id = auth.uid() AND reviewee_id = o.buyer_id)
        )
    )
);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = reviewer_id);

-- Create function to get user's average rating
CREATE OR REPLACE FUNCTION public.get_user_rating(target_user_id UUID)
RETURNS TABLE (
    average_rating NUMERIC,
    total_reviews BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        ROUND(AVG(rating)::numeric, 1) as average_rating,
        COUNT(*) as total_reviews
    FROM public.reviews
    WHERE reviewee_id = target_user_id
$$;

-- Create function to check if user can review an order
CREATE OR REPLACE FUNCTION public.can_review_order(target_order_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = target_order_id
        AND o.status = 'completed'
        AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
        AND NOT EXISTS (
            SELECT 1 FROM public.reviews r
            WHERE r.order_id = target_order_id
            AND r.reviewer_id = auth.uid()
        )
    )
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;