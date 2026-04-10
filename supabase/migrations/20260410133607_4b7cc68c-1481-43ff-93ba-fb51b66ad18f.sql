ALTER TABLE public.site_settings ADD COLUMN facebook_capi_token text NULL;
ALTER TABLE public.site_settings ADD COLUMN lead_capture_mode text NOT NULL DEFAULT 'blur';