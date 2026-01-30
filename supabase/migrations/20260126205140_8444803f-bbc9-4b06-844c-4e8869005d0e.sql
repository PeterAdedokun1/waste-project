-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add is_suspended column to profiles for moderation
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Create admin-only view for all profiles (admins bypass normal RLS)
CREATE OR REPLACE FUNCTION public.get_all_profiles_admin()
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles ORDER BY created_at DESC
$$;

-- Create admin-only function to get all listings
CREATE OR REPLACE FUNCTION public.get_all_listings_admin()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  waste_type public.waste_type,
  quantity NUMERIC,
  quantity_unit TEXT,
  asking_price NUMERIC,
  location TEXT,
  city TEXT,
  state TEXT,
  status public.listing_status,
  views_count INTEGER,
  offers_count INTEGER,
  user_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  seller_name TEXT,
  seller_email TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    l.id, l.title, l.description, l.waste_type, l.quantity, l.quantity_unit,
    l.asking_price, l.location, l.city, l.state, l.status, l.views_count,
    l.offers_count, l.user_id, l.created_at, l.updated_at,
    p.full_name as seller_name, p.email as seller_email
  FROM public.waste_listings l
  LEFT JOIN public.profiles p ON l.user_id = p.user_id
  ORDER BY l.created_at DESC
$$;

-- Create admin-only function to get all orders
CREATE OR REPLACE FUNCTION public.get_all_orders_admin()
RETURNS TABLE (
  id UUID,
  offer_id UUID,
  listing_id UUID,
  buyer_id UUID,
  seller_id UUID,
  amount NUMERIC,
  status public.order_status,
  pickup_date DATE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  buyer_name TEXT,
  seller_name TEXT,
  listing_title TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id, o.offer_id, o.listing_id, o.buyer_id, o.seller_id, o.amount,
    o.status, o.pickup_date, o.created_at, o.updated_at,
    pb.full_name as buyer_name, ps.full_name as seller_name,
    l.title as listing_title
  FROM public.orders o
  LEFT JOIN public.profiles pb ON o.buyer_id = pb.user_id
  LEFT JOIN public.profiles ps ON o.seller_id = ps.user_id
  LEFT JOIN public.waste_listings l ON o.listing_id = l.id
  ORDER BY o.created_at DESC
$$;

-- Admin function to suspend a user
CREATE OR REPLACE FUNCTION public.suspend_user(target_user_id UUID, reason TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  UPDATE public.profiles
  SET is_suspended = true, suspended_at = now(), suspended_reason = reason
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- Admin function to unsuspend a user
CREATE OR REPLACE FUNCTION public.unsuspend_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  UPDATE public.profiles
  SET is_suspended = false, suspended_at = NULL, suspended_reason = NULL
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- Admin function to remove a listing
CREATE OR REPLACE FUNCTION public.admin_remove_listing(target_listing_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  UPDATE public.waste_listings
  SET status = 'cancelled'
  WHERE id = target_listing_id;
  
  RETURN true;
END;
$$;