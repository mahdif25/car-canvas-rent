

# Autofill Support for Reservation Driver Info

## Problem
The form already has `autoComplete` attributes on most fields, but two issues exist:
1. The **license number** and **nationality** fields are missing `name` and `autoComplete` attributes, reducing browser autofill effectiveness
2. When the browser autofills multiple fields at once, `onChange` fires for each but `onBlur` does **not** — so lead capture never triggers until the user manually interacts with a field

## Plan

### `src/components/reservation/StepDriverInfo.tsx`
1. **Wrap inputs in a `<form>` tag** with `autoComplete="on"` to maximize browser autofill triggering (prevent default submit)
2. **Add missing autocomplete attributes**: `name="nationality"` / `autoComplete="country-name"` for nationality
3. **Detect autofill via a `useEffect`** that watches the form fields (`first_name`, `last_name`, `email`, `phone`). When multiple fields become populated (e.g., 2+ fields go from empty to filled in the same render cycle), fire `captureLeadField` once with all collected data — using `capi_allowed: false` when mode is "submit", `true` when mode is "blur"
4. Keep existing `handleBlur` and `handleNext` logic unchanged — the autofill detection is an additional trigger, not a replacement

### Files to change
- `src/components/reservation/StepDriverInfo.tsx` — add `<form>` wrapper, missing autocomplete attrs, and autofill detection effect

