-- Create order status enum
CREATE TYPE public.order_status AS ENUM (
  'pending_pickup',
  'pickup_scheduled',
  'in_transit',
  'delivered',
  'completed',
  'cancelled',
  'disputed'
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE RESTRICT UNIQUE,
  listing_id UUID NOT NULL REFERENCES public.waste_listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending_pickup',
  pickup_date DATE,
  pickup_time TEXT,
  pickup_address TEXT,
  pickup_notes TEXT,
  delivery_confirmed_at TIMESTAMP WITH TIME ZONE,
  seller_confirmed_at TIMESTAMP WITH TIME ZONE,
  buyer_confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order status history table
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.order_status NOT NULL,
  changed_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Orders RLS policies
CREATE POLICY "Users can view their orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "System can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Involved users can update orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Order status history RLS policies
CREATE POLICY "Users can view their order history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
      AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can add history entries"
  ON public.order_status_history FOR INSERT
  WITH CHECK (
    auth.uid() = changed_by AND
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
      AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
  );

-- Trigger to update orders updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create order when offer is accepted
CREATE OR REPLACE FUNCTION public.create_order_on_accepted_offer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    INSERT INTO public.orders (offer_id, listing_id, buyer_id, seller_id, amount)
    VALUES (NEW.id, NEW.listing_id, NEW.buyer_id, NEW.seller_id, NEW.amount)
    ON CONFLICT (offer_id) DO NOTHING;
    
    -- Also mark the listing as sold
    UPDATE public.waste_listings
    SET status = 'sold'
    WHERE id = NEW.listing_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_offer_accepted
  AFTER UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.create_order_on_accepted_offer();

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;