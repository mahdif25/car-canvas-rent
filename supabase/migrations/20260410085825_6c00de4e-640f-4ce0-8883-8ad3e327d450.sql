
-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_amount NUMERIC NOT NULL,
  max_uses INTEGER NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins can insert coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update coupons" ON public.coupons FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete coupons" ON public.coupons FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create coupon_usages table
CREATE TABLE public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id),
  customer_email TEXT NOT NULL,
  discount_applied NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert coupon usage" ON public.coupon_usages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view coupon usages" ON public.coupon_usages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add columns to reservations
ALTER TABLE public.reservations ADD COLUMN coupon_id UUID NULL REFERENCES public.coupons(id);
ALTER TABLE public.reservations ADD COLUMN discount_amount NUMERIC NOT NULL DEFAULT 0;

-- Trigger to increment current_uses on coupon_usages insert
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons SET current_uses = current_uses + 1 WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_coupon_usage_insert
AFTER INSERT ON public.coupon_usages
FOR EACH ROW
EXECUTE FUNCTION public.increment_coupon_usage();
