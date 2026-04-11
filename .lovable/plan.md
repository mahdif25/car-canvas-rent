

# Browser Autofill Detection & Comprehensive Tracking Events

## Problems
1. Browser autofill populates fields but React state doesn't update until user interacts — the form appears empty despite filled inputs
2. `InitiateCheckout` fires on step 4 (Summary) instead of step 3 (Info) where the user actually enters checkout info
3. No `Purchase` event for TikTok/Google; no `PageView` events per step for other platforms; missing `AddToCart` and `ViewContent` events

## Changes

### 1. `src/components/reservation/StepDriverInfo.tsx` — Autofill detection

- Add a polling mechanism using `requestAnimationFrame` or a short `setInterval` (500ms, 3 attempts) that reads the actual DOM input values via refs after mount
- If DOM values differ from React state (autofill happened), call `updateForm()` with those values
- Use `onAnimationStart` on inputs to detect Chrome's autofill CSS animation (`:-webkit-autofill`) as a trigger to read DOM values immediately
- Add a shared `useAutofillDetect` effect that checks all main fields (fname, lname, email, phone) and syncs to state

### 2. `src/pages/Reservation.tsx` — Fix event timing & add multi-platform events

Current tracking in the `useEffect` on `currentStep`:
- **Step 1**: `PageView` (already via `useAnalytics`), add TikTok `ttq.page()`, GA `page_view`
- **Step 2**: Track `ViewContent` (FB) / `ViewContent` (TikTok) when viewing vehicle selection  
- **Step 3**: Fire `InitiateCheckout` (FB Pixel + CAPI), TikTok `InitiateCheckout`, GA `begin_checkout` — move from step 4 to step 3
- **Step 4**: Fire `AddPaymentInfo` (FB) when reaching summary
- On confirm (step 5): Keep `Purchase` (FB), add TikTok `CompletePayment`, GA `purchase`

### 3. `src/components/reservation/StepDriverInfo.tsx` — Track on Continue click

- In `handleNext`, after saving fb_* to sessionStorage:
  - Fire `Lead` event via `trackFacebookEvent("Lead", ...)` when lead capture mode is "submit"
  - This ensures CAPI sends the lead with user data populated in sessionStorage

### 4. `src/hooks/useAnalytics.ts` — Add TikTok & GA event helpers

- Add `trackTikTokEvent(eventName, params)` — calls `window.ttq.track(eventName, params)` if available
- Add `trackGAEvent(eventName, params)` — calls `window.gtag('event', eventName, params)` if available
- Export both alongside existing methods

## Files to Modify
- `src/components/reservation/StepDriverInfo.tsx` — autofill detection + Lead event on submit
- `src/pages/Reservation.tsx` — fix InitiateCheckout timing, add multi-platform events per step
- `src/hooks/useAnalytics.ts` — add TikTok and GA tracking helpers, declare window types

