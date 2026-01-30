-- Create offer status enum
CREATE TYPE public.offer_status AS ENUM ('pending', 'accepted', 'declined', 'countered', 'expired', 'withdrawn');

-- Create offers table
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.waste_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  message TEXT,
  status public.offer_status NOT NULL DEFAULT 'pending',
  parent_offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  counter_amount DECIMAL(12,2),
  counter_message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offers
CREATE POLICY "Users can view offers they're involved in" 
ON public.offers 
FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create offers" 
ON public.offers 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Involved users can update offers" 
ON public.offers 
FOR UPDATE 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Trigger for updated_at
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update listing offers_count
CREATE OR REPLACE FUNCTION public.update_listing_offers_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.waste_listings 
    SET offers_count = offers_count + 1 
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.waste_listings 
    SET offers_count = GREATEST(offers_count - 1, 0) 
    WHERE id = OLD.listing_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update offers count
CREATE TRIGGER update_listing_offers_count_trigger
  AFTER INSERT OR DELETE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_listing_offers_count();

-- Enable realtime for offers table
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;