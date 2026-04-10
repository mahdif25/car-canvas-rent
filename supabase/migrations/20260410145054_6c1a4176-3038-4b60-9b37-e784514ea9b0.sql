CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  time_label text NOT NULL DEFAULT 'il y a 1 mois',
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read enabled reviews"
  ON public.reviews FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.reviews (name, text, rating, time_label, sort_order) VALUES
  ('Youssef B.', 'Service excellent, voiture propre et bien entretenue. Je recommande vivement Centre Lux Car pour vos locations.', 5, 'il y a 2 mois', 1),
  ('Sarah M.', 'Très professionnel, prix compétitifs et livraison à l''heure. Une expérience de location sans stress.', 5, 'il y a 1 mois', 2),
  ('Ahmed K.', 'J''ai loué plusieurs fois chez eux, toujours satisfait. Le personnel est aimable et les véhicules sont en parfait état.', 5, 'il y a 3 mois', 3),
  ('Fatima Z.', 'Rapport qualité-prix imbattable. La réservation en ligne est simple et rapide. Je reviendrai sans hésiter.', 5, 'il y a 2 semaines', 4);