

# WhatsApp Widget: Price Range, Explanatory Pricing + Fix Name Capture

## Changes to `src/components/WhatsAppPopup.tsx`

### 1. Vehicle cards (Step 1) — price range
Replace "À partir de {rate} MAD/jour" with a range showing min–max daily rates:
- Display `{min} - {max} MAD/jour` when tiers have different rates
- Display `{rate} MAD/jour` when only one tier or all same rate
- Add inline helper `getMaxPriceFromTiers(tiers)` using `Math.max()`

### 2. Summary bubble (Step 4) — explain the rate
Replace the generic "À partir de" line with:
> Pour une location de {days} jours, le tarif est de **{rate} MAD/jour**

### 3. WhatsApp message — conversational tone to owner
Rewrite pre-filled message:
> Bonjour, je souhaite louer la {vehicle} pour {days} jours. D'après vos tarifs, le prix serait de {rate} MAD/jour. Récupération à {location}. Merci !

### 4. Fix browser autofill name capture
The current hidden input approach (`opacity-0 h-0 w-0`) is skipped by most browsers. Fix:
- Wrap the input in a `<form autoComplete="on">` element (browsers prefer autofilling inside forms)
- Change hiding to `position: fixed; top: -100px; left: -100px; width: 1px; height: 1px; overflow: hidden` — browsers treat this as autofillable
- Add `onAnimationStart` handler to detect Chrome's autofill animation event (`onautofillstart`)
- Replace single timeout with a polling interval (every 500ms for 3s) to catch delayed autofill
- Keep the greeting logic: show "Bonjour {prénom} ! 👋" if captured, else "Bonjour ! 👋"

## File
- `src/components/WhatsAppPopup.tsx` — all 4 changes in this single file

