-- Create waste type enum
CREATE TYPE public.waste_type AS ENUM ('plastic', 'paper', 'metal', 'electronics', 'organic', 'textile', 'glass', 'rubber', 'wood', 'other');

-- Create listing status enum
CREATE TYPE public.listing_status AS ENUM ('active', 'pending', 'sold', 'expired', 'cancelled');

-- Create waste_listings table
CREATE TABLE public.waste_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  waste_type public.waste_type NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  quantity_unit TEXT NOT NULL DEFAULT 'kg',
  asking_price DECIMAL(12,2) NOT NULL,
  location TEXT NOT NULL,
  city TEXT,
  state TEXT,
  images TEXT[] DEFAULT '{}',
  status public.listing_status NOT NULL DEFAULT 'active',
  offers_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waste_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active listings" 
ON public.waste_listings 
FOR SELECT 
USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own listings" 
ON public.waste_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
ON public.waste_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" 
ON public.waste_listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_waste_listings_updated_at
  BEFORE UPDATE ON public.waste_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

-- Storage policies for listing images
CREATE POLICY "Anyone can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listing images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing images"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);