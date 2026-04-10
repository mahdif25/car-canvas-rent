

# Lead CAPI Reporting Flag Based on Capture Mode

## Overview
Add a `capi_allowed` column to the `leads` table. When capture mode is "submit", leads captured on blur are saved with `capi_allowed = false` (visible in admin but not reportable to Facebook CAPI). When the user clicks submit, the lead is upgraded to `capi_allowed = true`. When mode is "blur", all leads are saved with `capi_allowed = true` immediately.

## Database Migration

```sql
ALTER TABLE public.leads
  ADD COLUMN capi_allowed boolean NOT NULL DEFAULT true;
```

## Code Changes

### 1. `src/hooks/useAnalytics.ts`
- Add optional `capi_allowed` parameter to `captureLeadField` (default `true`)
- Pass it through on both insert and update calls

### 2. `src/components/reservation/StepDriverInfo.tsx`
- **Remove** the early return in `handleBlur` when mode is "submit" — always capture on blur
- When mode is "submit": call `captureLeadField` with `capi_allowed: false` on blur
- When mode is "blur": call `captureLeadField` with `capi_allowed: true` on blur (current behavior)
- In `handleNext` (submit button): always call `captureLeadField` with `capi_allowed: true` to upgrade the flag

### 3. `src/pages/admin/AdminLeads.tsx`
- Add `capi_allowed` to the `LeadRow` interface and query
- Display a badge per lead: green "CAPI ✓" when allowed, gray "CAPI ✗" when not

### Files
- `leads` table (migration — add `capi_allowed` column)
- `src/hooks/useAnalytics.ts`
- `src/components/reservation/StepDriverInfo.tsx`
- `src/pages/admin/AdminLeads.tsx`

