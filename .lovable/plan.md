

# WhatsApp Widget: Per-Car Pricing + Browser Autofill Greeting

## Overview
Two enhancements to the WhatsApp chat widget:
1. Show "À partir de X MAD/jour" under each vehicle in the car selection list (Step 1)
2. Use a hidden input with `autocomplete="given-name"` to capture the browser's saved first name, then personalize the greeting to "Bonjour [Prénom] ! 👋"

## Changes — `src/components/WhatsAppPopup.tsx`

### 1. Show starting price per vehicle
In the Step 1 vehicle list, compute the lowest daily rate from `tiers` for each vehicle using `getStartingPriceFromTiers` (already exported from `useVehicles.ts`) and display it below the category:
```
<p className="text-xs text-primary font-semibold">À partir de {rate} MAD/jour</p>
```
Import `getStartingPriceFromTiers` from `useVehicles.ts`.

### 2. Browser autofill first name capture
- Add a hidden `<input>` with `autocomplete="given-name"` and `name="fname"` rendered inside the widget (visually hidden but present in the DOM so the browser can autofill it)
- Add state `autofillName` initialized to `""`
- Use an `onChange` handler on the input to capture the browser-autofilled value
- Also attempt to read from the input ref on mount via a short timeout (browsers sometimes fill before React mounts)
- Update the greeting bubble: if `autofillName` is non-empty, show `Bonjour {autofillName} ! 👋 Quel véhicule vous intéresse ?`, otherwise keep the current `Bonjour ! 👋 Quel véhicule vous intéresse ?`

### Technical note on autofill
Browser autofill is best-effort — it only works if the user has saved form data. The hidden input trick uses `position: absolute; opacity: 0; height: 0` so it's invisible but still autofillable. A `setTimeout` of ~500ms on mount checks if the browser populated it.

## Files
- `src/components/WhatsAppPopup.tsx` — add import for `getStartingPriceFromTiers`, add autofill input + state, update greeting and vehicle cards

