ALTER TABLE public.site_settings
  ADD COLUMN hero_video_start_time integer NOT NULL DEFAULT 0,
  ADD COLUMN hero_title_text text NOT NULL DEFAULT 'Louez votre voiture',
  ADD COLUMN hero_title_highlight text NOT NULL DEFAULT 'en toute confiance',
  ADD COLUMN hero_subtitle_text text NOT NULL DEFAULT 'Des véhicules de qualité, un service professionnel et des prix compétitifs partout au Maroc.',
  ADD COLUMN hero_title_animation text NOT NULL DEFAULT 'fade-up',
  ADD COLUMN hero_subtitle_animation text NOT NULL DEFAULT 'fade-up',
  ADD COLUMN hero_title_style jsonb NOT NULL DEFAULT '{"fontSize":"5xl","fontWeight":"bold","textAlign":"left"}'::jsonb,
  ADD COLUMN hero_subtitle_style jsonb NOT NULL DEFAULT '{"fontSize":"lg","fontWeight":"normal","textAlign":"left"}'::jsonb;