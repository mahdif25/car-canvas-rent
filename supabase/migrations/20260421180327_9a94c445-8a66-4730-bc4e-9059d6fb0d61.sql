
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS whatsapp_business_account_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_verify_token text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_bot_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_bot_welcome_message text NOT NULL DEFAULT 'Bonjour {name} 👋 Bienvenue chez Centre Lux Car ! Quelle voiture vous intéresse ?',
  ADD COLUMN IF NOT EXISTS whatsapp_bot_handoff_keyword text NOT NULL DEFAULT 'AGENT';
