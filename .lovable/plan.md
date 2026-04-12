

# Fix Duplicate Leads on Landing Page Blur Capture

## Problem
Every time a user tabs between fields on `/offre`, `handleBlur` inserts a brand-new lead row with a unique `visitor_id` (`landing_blur_${Date.now()}`). Tabbing through 3 fields = 3 duplicate leads. The screenshot shows exactly this: 4 identical "Mahdi / 0708844552 / Étape 0" entries.

## Root Cause
Unlike `useAnalytics.captureLeadField` which stores a `leadIdRef` and updates the same row, `handleBlur` always calls `.insert()` with a fresh ID.

## Solution
Track the blur-captured lead ID in a `useRef`, and use **upsert/update** on subsequent blurs instead of inserting new rows.

### `src/pages/LandingOffer.tsx`
1. Add a `leadIdRef = useRef<string | null>(null)` to track the blur-captured lead
2. Generate a stable `visitor_id` once (e.g. from `localStorage` or a single `useRef`)
3. In `handleBlur`:
   - If `leadIdRef.current` exists → **update** that row
   - If not → **insert** a new row, store the returned `id` in `leadIdRef`
4. In `handleSubmit`:
   - If `leadIdRef.current` exists → **update** the existing blur row (set `capi_allowed: true`, `last_reservation_step: 1`) instead of inserting a duplicate
   - If not → insert as before

This ensures one lead per visitor session on the landing page, matching the reservation flow behavior.

## Files Modified
- `src/pages/LandingOffer.tsx`

