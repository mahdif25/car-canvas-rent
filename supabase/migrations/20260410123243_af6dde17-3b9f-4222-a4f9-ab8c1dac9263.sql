
-- Create email_broadcasts table
CREATE TABLE public.email_broadcasts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  body_html text NOT NULL DEFAULT '',
  coupon_mode text NOT NULL DEFAULT 'none',
  source_coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_prefix text,
  discount_amount numeric NOT NULL DEFAULT 0,
  friend_discount_amount numeric NOT NULL DEFAULT 0,
  coupon_expires_at timestamp with time zone,
  filters_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  recipient_count integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.email_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view broadcasts" ON public.email_broadcasts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert broadcasts" ON public.email_broadcasts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update broadcasts" ON public.email_broadcasts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete broadcasts" ON public.email_broadcasts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create broadcast_recipients table
CREATE TABLE public.broadcast_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcast_id uuid NOT NULL REFERENCES public.email_broadcasts(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  friend_coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view broadcast recipients" ON public.broadcast_recipients FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert broadcast recipients" ON public.broadcast_recipients FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update broadcast recipients" ON public.broadcast_recipients FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete broadcast recipients" ON public.broadcast_recipients FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
