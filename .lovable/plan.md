

# Fix CAPI Flag on Landing Page Leads

## Problem
The `/offre` landing page inserts leads directly into the database without setting `capi_allowed`, so it defaults to `true`. This shows a misleading "CAPI ✓" badge even though no Facebook CAPI event is actually sent. The page also doesn't use the analytics hook's `captureLeadField` which respects the admin's blur/submit mode setting.

## Changes

### `src/pages/LandingOffer.tsx`
1. On `handleBlur` (progressive capture): explicitly set `capi_allowed: false` in the insert
2. On `handleSubmit` (form submission): set `capi_allowed: true` and fire `trackFacebookEvent("Lead", ...)` to actually report the lead to Facebook CAPI
3. Import and use `useAnalytics` hook for Facebook event tracking
4. Store Facebook user data in sessionStorage (email, phone, name) before firing CAPI so the edge function can hash and send it

This ensures:
- Blur-captured leads show CAPI ✗ (not reported)
- Submitted leads show CAPI ✓ and are actually reported to Facebook as a "Lead" event
- Consistent with the reservation flow behavior

### Files Modified
- `src/pages/LandingOffer.tsx`

