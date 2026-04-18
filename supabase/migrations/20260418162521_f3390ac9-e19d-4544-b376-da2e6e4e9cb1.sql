-- Add Facebook Lead Ads metadata columns to leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS fb_leadgen_id text,
  ADD COLUMN IF NOT EXISTS fb_page_id text,
  ADD COLUMN IF NOT EXISTS fb_form_id text,
  ADD COLUMN IF NOT EXISTS fb_form_name text,
  ADD COLUMN IF NOT EXISTS fb_ad_id text,
  ADD COLUMN IF NOT EXISTS fb_ad_name text,
  ADD COLUMN IF NOT EXISTS fb_adset_id text,
  ADD COLUMN IF NOT EXISTS fb_adset_name text,
  ADD COLUMN IF NOT EXISTS fb_campaign_id text,
  ADD COLUMN IF NOT EXISTS fb_campaign_name text,
  ADD COLUMN IF NOT EXISTS fb_ad_account_id text,
  ADD COLUMN IF NOT EXISTS fb_pixel_id text,
  ADD COLUMN IF NOT EXISTS fb_platform text,
  ADD COLUMN IF NOT EXISTS fb_partner_name text,
  ADD COLUMN IF NOT EXISTS fb_is_organic boolean,
  ADD COLUMN IF NOT EXISTS fb_is_test_lead boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS fb_lead_type text,
  ADD COLUMN IF NOT EXISTS fb_created_time timestamptz,
  ADD COLUMN IF NOT EXISTS fb_raw_field_data jsonb,
  ADD COLUMN IF NOT EXISTS fb_raw_payload jsonb,
  ADD COLUMN IF NOT EXISTS fb_user_agent text;

-- Unique index for idempotency on Facebook lead retries
CREATE UNIQUE INDEX IF NOT EXISTS leads_fb_leadgen_id_key
  ON public.leads (fb_leadgen_id)
  WHERE fb_leadgen_id IS NOT NULL;

-- Optional override / display fields for site settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS fb_ad_account_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fb_leadads_pixel_id text NOT NULL DEFAULT '';