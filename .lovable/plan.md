

# Facebook Lead Ads Webhook + Dedicated Landing Page

## Overview
Build two features: (1) a webhook edge function to receive Facebook Lead Ads, and (2) a conversion-optimized landing page at `/offre`. The admin can configure the webhook URL from the Settings page. The landing page domain will be `centreluxcar.com/offre`.

## Changes

### 1. Database migration
- Add `source` column to `leads` table (`text`, default `'website'`) to distinguish lead origins (website, facebook_lead_ad, facebook_landing)

### 2. New edge function: `facebook-leadads-webhook`
- `supabase/functions/facebook-leadads-webhook/index.ts`
- Handles GET requests (Facebook verification handshake using a verify token)
- Handles POST requests (incoming lead data), validates signature with `FACEBOOK_APP_SECRET`
- Extracts name, email, phone from the lead payload and inserts into `leads` table with `source = 'facebook_lead_ad'`
- Add to `supabase/config.toml` with `verify_jwt = false`

### 3. Secrets needed
- `FACEBOOK_APP_SECRET` — from Facebook Developer Console
- `FB_LEADADS_VERIFY_TOKEN` — a random string you choose

### 4. New landing page: `/offre`
- `src/pages/LandingOffer.tsx` — mobile-first, conversion-optimized page
- Hero with headline + CTA
- Featured vehicles carousel (top 3-4 cars with prices)
- Quick lead capture form (name, phone, email, preferred vehicle)
- Trust badges (reviews, experience, fleet size)
- WhatsApp CTA as secondary action
- Auto-captures UTM params from URL for attribution
- Submits lead with `source = 'facebook_landing'`
- Redirects to full `/reservation` page with pre-filled data
- Responsive across mobile, tablet, desktop

### 5. Route update in `src/App.tsx`
- Add `/offre` route pointing to `LandingOffer`

### 6. Admin webhook URL config in `AdminSettings.tsx`
- Add a new section in the Marketing/Analytics tab showing the webhook URL (read-only, with copy button)
- Display: `https://mtcxliurdruvrzjtxful.supabase.co/functions/v1/facebook-leadads-webhook`
- Include instructions: "Paste this URL in Facebook Business Manager → Webhooks → leadgen"
- Show the verify token field (stored in site_settings or as a secret)

### 7. Update `AdminLeads.tsx`
- Show `source` badge on each lead (Website / Facebook Lead Ad / Landing Page)
- Add source filter dropdown

## Files Created/Modified
- `supabase/functions/facebook-leadads-webhook/index.ts` (new)
- `supabase/functions/facebook-leadads-webhook/deno.json` (new)
- `supabase/config.toml` (add function config)
- `src/pages/LandingOffer.tsx` (new)
- `src/App.tsx` (add route)
- `src/pages/admin/AdminSettings.tsx` (add webhook URL section)
- `src/pages/admin/AdminLeads.tsx` (add source badge + filter)
- Database migration: add `source` column to `leads`

## Setup After Implementation
1. Add secrets (`FACEBOOK_APP_SECRET`, `FB_LEADADS_VERIFY_TOKEN`)
2. In Facebook Business Manager → App → Webhooks → subscribe to `leadgen` events with the webhook URL
3. Point Facebook traffic ads to `centreluxcar.com/offre`

