ALTER TABLE public.site_settings
  ADD COLUMN footer_description text NOT NULL DEFAULT 'Location de voitures de qualité au Maroc. Service professionnel et véhicules bien entretenus.',
  ADD COLUMN footer_phone text NOT NULL DEFAULT '+212 6 00 00 00 00',
  ADD COLUMN footer_email text NOT NULL DEFAULT 'contact@centreluxcar.ma',
  ADD COLUMN footer_address text NOT NULL DEFAULT 'Casablanca, Maroc',
  ADD COLUMN footer_copyright text NOT NULL DEFAULT 'Centre Lux Car. Tous droits réservés.',
  ADD COLUMN conditions_generales_html text NOT NULL DEFAULT '',
  ADD COLUMN privacy_policy_html text NOT NULL DEFAULT '',
  ADD COLUMN caution_policy_html text NOT NULL DEFAULT '';