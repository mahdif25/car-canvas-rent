

# Fix Lead Capture Across All Pages

## Root Cause

The `captureLeadField` function in `useAnalytics.ts` does `.insert().select("id").single()` after inserting a lead. However, the SELECT RLS policy on `leads` only allows `authenticated` users with the `admin` role. Anonymous visitors (who are all lead sources) get a silent null back from `.select("id")`, so `leadIdRef.current` is **never set**. Every subsequent call to `captureLeadField` creates a NEW lead instead of updating the existing one. This also explains why step transitions don't accumulate data on a single lead row.

The same pattern exists on the `/offre` landing page — the `.select("id").single()` after insert also fails silently.

Additionally:
- The landing page does NOT include `vehicle_id` in the lead payload
- When navigating from `/offre` to `/reservation`, the user's name/phone/email are not carried over to pre-fill the reservation form
- The landing page and reservation page use separate `leadIdRef` instances, so they can never update the same lead

## Changes

### 1. Fix `captureLeadField` in `src/hooks/useAnalytics.ts`
Generate the lead ID client-side using `crypto.randomUUID()` and pass it in the insert payload. This avoids needing `.select("id").single()` (which fails due to RLS). Store the generated ID in `leadIdRef` immediately.

```typescript
// Before (broken):
const { data } = await supabase.from("leads").insert({...}).select("id").single();
if (data) leadIdRef.current = data.id;

// After (fixed):
const newId = crypto.randomUUID();
await supabase.from("leads").insert({ id: newId, ... });
leadIdRef.current = newId;
```

Also persist `leadIdRef` to sessionStorage so it survives page navigation (e.g. `/offre` → `/reservation`).

### 2. Fix landing page `/offre` — `src/pages/LandingOffer.tsx`
- Include `vehicle_id` in both `leadPayload` and `blurPayload`
- Use client-side ID generation (same pattern as above)
- Store the lead ID in sessionStorage so the reservation page can continue updating the same lead
- Store the user's contact details (`first_name`, `phone`, `email`) in sessionStorage under a dedicated key so the reservation form can pre-fill them

### 3. Pre-fill reservation form from landing data — `src/pages/Reservation.tsx`
In `getInitialState()`, check sessionStorage for landing page data and merge it into the initial form state (first_name, phone, email). This way, when a user comes from `/offre`, their info is already filled in.

### 4. Fix landing page lead ID generation — `src/pages/LandingOffer.tsx`
Use `crypto.randomUUID()` for insert instead of relying on `.select("id").single()`.

## Files Modified
- `src/hooks/useAnalytics.ts` — client-side ID generation, sessionStorage persistence for leadId
- `src/pages/LandingOffer.tsx` — include vehicle_id, client-side ID, store contact data in sessionStorage
- `src/pages/Reservation.tsx` — pre-fill form from landing page sessionStorage data

