-- Fix 1: Restrict profiles table SELECT policy to only show own profile directly
-- Create a public view for profiles that excludes sensitive fields (email, phone)
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    user_id, 
    full_name, 
    company_name, 
    location, 
    bio, 
    avatar_url, 
    user_type, 
    created_at
  FROM public.profiles;
-- Note: Excludes email, phone, id, is_suspended, suspended_at, suspended_reason, updated_at

-- Drop the overly permissive SELECT policy on profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy: Users can only SELECT their own profile from the base table
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Fix 2: Restrict reviews table to not expose user relationships publicly
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Create a view for public review data that only exposes rating/comment, not user IDs
CREATE VIEW public.reviews_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    rating, 
    comment, 
    created_at,
    reviewee_id
  FROM public.reviews;
-- Note: Excludes order_id, reviewer_id (only keeps reviewee_id for profile display)

-- New policy: Only authenticated users involved in the order or the reviewee can see full review details
CREATE POLICY "Users can view reviews about them or their orders"
ON public.reviews
FOR SELECT
USING (
  auth.uid() = reviewee_id 
  OR auth.uid() = reviewer_id
  OR EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = reviews.order_id 
    AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
  )
);

-- Allow public to read the sanitized view (reviews_public)
-- For reputation display, we need reviewee's reviews to be visible
-- Update: Allow anyone to see reviews for a specific user (for reputation)
DROP POLICY IF EXISTS "Users can view reviews about them or their orders" ON public.reviews;

CREATE POLICY "Authenticated users can view reviews"
ON public.reviews
FOR SELECT
USING (auth.role() = 'authenticated');