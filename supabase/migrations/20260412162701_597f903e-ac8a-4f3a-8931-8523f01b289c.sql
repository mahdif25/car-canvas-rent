ALTER TABLE public.site_settings
  ADD COLUMN fb_leadads_app_secret text NOT NULL DEFAULT '',
  ADD COLUMN fb_leadads_verify_token text NOT NULL DEFAULT '',
  ADD COLUMN fb_leadads_page_access_token text NOT NULL DEFAULT '';