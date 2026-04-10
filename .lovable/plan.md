

# Capture Leads Per Session (Update, Not Insert Every Blur)

## Problem
Currently, every field blur in StepDriverInfo inserts a **new** lead row. This creates 3+ entries for a single session (as shown in the screenshot). The user wants **one lead record per session** that gets updated as the user fills in more fields, and a **new record only when the user returns with a new session**.

## Approach

### `src/hooks/useAnalytics.ts` — `captureLeadField`
- On the first call per session, INSERT a new lead row and store its `id` in a ref (`leadIdRef`).
- On subsequent calls (same session), UPDATE that existing row with the latest fields and step.
- This means: one session = one lead row, progressively enriched as the user fills fields.
- `markLeadCompleted` will use this same `leadIdRef` if available, falling back to the existing visitor_id lookup.

### `src/components/reservation/StepDriverInfo.tsx`
- No changes needed — it already calls `captureLeadField` on blur with all current fields. The upsert-per-session logic lives entirely in the hook.

### Result
- Same session → single lead row, updated in place
- New session (user leaves and comes back) → new lead row
- Admin dashboard grouping already works (groups by email/visitor_id)

## Files Changed
1. `src/hooks/useAnalytics.ts` — add `leadIdRef`, insert on first call, update on subsequent calls within same session

