
-- Create vehicle_colors table
CREATE TABLE public.vehicle_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  color_name text NOT NULL,
  color_hex text NOT NULL DEFAULT '#000000',
  image_url text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vehicle colors"
ON public.vehicle_colors FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage vehicle colors"
ON public.vehicle_colors FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add selected_color_id to reservations
ALTER TABLE public.reservations
ADD COLUMN selected_color_id uuid REFERENCES public.vehicle_colors(id);
