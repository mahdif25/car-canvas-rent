

# Fix Autofill Detection on /offre Landing Page

## Problem
The autofill detection on the landing page has two issues:
1. **Missing CSS keyframe**: The `onAutoFillStart` animation name referenced in `handleAutofillAnimation` is never defined in CSS, so the animation-based detection never triggers
2. **Polling too short**: The DOM polling runs for only 3 seconds (15 attempts × 200ms). On mobile, browser autofill suggestions appear in the keyboard but don't populate DOM values until the user taps one — by then polling has stopped

The screenshot shows the user on mobile with autofill suggestions visible in the keyboard bar, but the fields remain empty.

## Changes

### 1. Add CSS keyframes for autofill detection (`src/index.css`)
Add the `onAutoFillStart` keyframe that Chrome/Safari trigger when autofill populates an input via `:-webkit-autofill`:

```css
@keyframes onAutoFillStart { from {} to {} }
input:-webkit-autofill { animation-name: onAutoFillStart; }
```

### 2. Extend and improve polling in `src/pages/LandingOffer.tsx`
- Increase polling duration to ~10 seconds (50 attempts × 200ms) so it catches delayed autofill
- Add a `change` and `input` event listener on the form inputs to catch programmatic value changes from the browser autofill at any time (not just during the polling window)
- These listeners will update the React state whenever the browser fills a value

### 3. Keep the `onAnimationStart` handler as-is
It will now actually work since the CSS keyframe will be defined.

## Files Modified
- `src/index.css` — add autofill animation keyframes
- `src/pages/LandingOffer.tsx` — extend polling window, add persistent input/change event listeners for autofill capture

