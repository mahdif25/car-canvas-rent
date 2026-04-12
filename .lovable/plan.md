

# Add Autofill Detection to Landing Page `/offre`

## Problem
The landing page form at `/offre` does not detect browser-autofilled values. If a user's browser pre-fills name, phone, or email, the React state stays empty — meaning progressive lead capture on blur won't fire, and submitting could fail validation.

## Solution
Port the same autofill detection pattern used in `StepDriverInfo.tsx` and `WhatsAppPopup.tsx` to `LandingOffer.tsx`.

## Changes

### `src/pages/LandingOffer.tsx`
1. Add `useRef` for the form element
2. Add `name` and `autoComplete` attributes to the three inputs:
   - `first_name` → `name="fname"` / `autoComplete="given-name"`
   - `phone` → `name="tel"` / `autoComplete="tel"`
   - `email` → `name="email"` / `autoComplete="email"`
3. Add a `useEffect` with polling (same pattern as StepDriverInfo): check input values every 200ms for up to 3 seconds, sync any autofilled values into `form` state
4. Add `onAnimationStart` handler on each input to catch Chrome's autofill animation event as a secondary detection method

This ensures autofilled values are captured for progressive lead saving (the `handleBlur` logic) and form submission.

## Files Modified
- `src/pages/LandingOffer.tsx` — add ref, autoComplete attributes, polling useEffect, animation handler

