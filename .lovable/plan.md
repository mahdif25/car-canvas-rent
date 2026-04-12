

# Add Facebook Webhook Secrets to Admin Settings UI

## Overview
Store the three Facebook webhook credentials (App Secret, Verify Token, Page Access Token) in the `site_settings` table so admins can configure them from the Settings page. Update the edge function to read from the database instead of environment variables.

## Changes

### 1. Database migration
Add three columns to `site_settings`:
- `fb_leadads_app_secret` (text, default '')
- `fb_leadads_verify_token` (text, default '')
- `fb_leadads_page_access_token` (text, default '')

### 2. Update `src/hooks/useSiteSettings.ts`
Add the three new fields to the `SiteSettings` interface.

### 3. Update `src/pages/admin/AdminSettings.tsx`
Add three input fields (password-type with show/hide toggle) inside the existing "Facebook Lead Ads Webhook" section:
- **Facebook App Secret** — with helper text: "Facebook Developer Console → App Settings → Basic → App Secret"
- **Verify Token** — with helper text: "Un token aléatoire de votre choix, à coller aussi dans Facebook Webhooks"
- **Page Access Token** — with helper text: "Facebook Business Manager → votre Page → Settings → Page Access Token"

All three save via the existing `updateMutation` on the main save button.

### 4. Update `supabase/functions/facebook-leadads-webhook/index.ts`
Instead of reading from `Deno.env.get(...)`, the function will:
1. Create a Supabase client with the service role key
2. Query `site_settings` for the three token columns
3. Use those values for signature verification, handshake validation, and Graph API calls
4. Fall back to env vars if the DB values are empty (backward compatibility)

## Files Modified
- `supabase/migrations/` — new migration for 3 columns
- `src/hooks/useSiteSettings.ts` — add 3 fields to interface
- `src/pages/admin/AdminSettings.tsx` — add 3 input fields in webhook section
- `supabase/functions/facebook-leadads-webhook/index.ts` — read secrets from DB

