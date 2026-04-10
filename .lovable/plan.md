

# Facebook Pixel Advanced Matching + Conversions API + Autofill + Capture Mode Toggle

## Overview
Combine all pending Facebook tracking features into one implementation: browser autofill on the reservation form, Facebook Pixel Advanced Matching, server-side Conversions API (CAPI) with admin-configurable token, and a blur/submit capture mode toggle.

## Database Migration
Add 2 columns to `site_settings`:
- `facebook_capi_token` (text, nullable) — Facebook Conversions API access token
- `lead_capture_mode` (text, default `'blur'`) — `'blur'` or `'submit'`

## Changes

### 1. Admin Settings — CAPI Token + Capture Mode (`AdminSettings.tsx`)
- **Tracking tab**: Add "Facebook Conversions API Token" input field below the existing Facebook Pixel ID field. Saved to `facebook_capi_token`.
- **Tracking tab**: Add "Mode de capture des données" radio/select with two options:
  - **Au blur** — data captured progressively as each field loses focus
  - **Au submit** — data captured only when user clicks "Continuer"

### 2. `useSiteSettings.ts`
- Add `facebook_capi_token` and `lead_capture_mode` to the `SiteSettings` interface

### 3. `StepDriverInfo.tsx` — Autofill + Capture Mode
- Add `autocomplete` attributes to inputs: `given-name`, `family-name`, `email`, `tel` — enables Facebook in-app browser and standard browser autofill
- Add `name` attributes: `fname`, `lname`, `email`, `phone`
- Accept `leadCaptureMode` prop (from Reservation.tsx)
- If `blur`: current onBlur behavior (capture per field)
- If `submit`: skip onBlur, capture all fields at once in `onNext` before proceeding

### 4. `Reservation.tsx` — Pass capture mode + fire CAPI events
- Read `lead_capture_mode` from `useSiteSettings` and pass to `StepDriverInfo`
- On step 4 load: fire `InitiateCheckout` (Pixel + CAPI)
- On confirmation: fire `Purchase` (Pixel + CAPI) with reservation value

### 5. `TrackingScripts.tsx` — Advanced Matching
- On Pixel init, check `sessionStorage` for captured user data
- If available, pass to `fbq('init', pixelId, { em, fn, ln, ph })` for Advanced Matching
- Capture `fbclid` from URL on page load, store in `sessionStorage`

### 6. `useAnalytics.ts` — Add `trackFacebookEvent`
- Extract and store `fbclid` from URL in `sessionStorage` on init
- Add `trackFacebookEvent(eventName, customData)` that:
  - Fires `fbq('track', eventName, customData, { eventID })` client-side
  - Calls `facebook-capi` edge function with matching `event_id` for deduplication
- Events: `Lead` (step 3), `InitiateCheckout` (step 4), `Purchase` (confirmation)

### 7. New Edge Function: `supabase/functions/facebook-capi/index.ts`
- Receives: `event_name`, `event_id`, `user_data` (email, phone, first_name, fbclid, fbc, fbp), `custom_data` (value, currency)
- Reads `facebook_pixel_id` and `facebook_capi_token` from `site_settings` using service role
- SHA-256 hashes PII as required by Facebook
- POSTs to `https://graph.facebook.com/v19.0/{pixel_id}/events`
- Deduplicates with browser Pixel via shared `event_id`
- Returns error if no CAPI token configured

### 8. `supabase/functions/facebook-capi/deno.json`
Standard Deno config

### 9. `supabase/config.toml`
Add `[functions.facebook-capi]` with `verify_jwt = false`

## Events Tracked

| Moment | Browser Pixel | Server CAPI | Event |
|--------|:---:|:---:|-------|
| Page view | Yes | No | PageView |
| Driver info captured | Yes | Yes | Lead |
| Step 4 loads | Yes | Yes | InitiateCheckout |
| Reservation confirmed | Yes | Yes | Purchase |

All paired events share the same `event_id` for deduplication.

## Files

**New**: `supabase/functions/facebook-capi/index.ts`, `supabase/functions/facebook-capi/deno.json`

**Modified**: `AdminSettings.tsx`, `useSiteSettings.ts`, `StepDriverInfo.tsx`, `Reservation.tsx`, `TrackingScripts.tsx`, `useAnalytics.ts`, `supabase/config.toml`

**Migration**: 1 migration adding `facebook_capi_token` + `lead_capture_mode` to `site_settings`

## Execution Order
1. Database migration (2 columns)
2. Update `useSiteSettings.ts` interface
3. Update `AdminSettings.tsx` (CAPI token + capture mode toggle)
4. Update `StepDriverInfo.tsx` (autocomplete attrs + conditional capture)
5. Update `Reservation.tsx` (pass mode + CAPI event calls)
6. Update `TrackingScripts.tsx` (Advanced Matching + fbclid)
7. Update `useAnalytics.ts` (trackFacebookEvent)
8. Create `facebook-capi` edge function
9. Update `supabase/config.toml`

