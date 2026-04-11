CREATE TABLE public.additional_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  license_number text NOT NULL,
  nationality text,
  dob date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.additional_drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert additional drivers" ON public.additional_drivers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view additional drivers" ON public.additional_drivers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update additional drivers" ON public.additional_drivers FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete additional drivers" ON public.additional_drivers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can view additional drivers" ON public.additional_drivers FOR SELECT TO public USING (true);