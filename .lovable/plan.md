

# Interactive WhatsApp Chat Widget

## Overview
Replace the current simple WhatsApp floating button with an interactive chat-style widget at the bottom-left. It guides the user through a 4-step conversation (vehicle → days → pickup location → send), then opens WhatsApp with a pre-filled message containing all selected details.

## Design
- **Floating button**: Bottom-left, WhatsApp green (#25D366), WhatsApp icon
- **Chat panel**: Opens above the button. Green header with "Assistant Location", message bubbles (bot = gray, user = green), close button
- **Mobile**: Full-width panel from bottom (max-h 80vh). **Desktop**: 380px wide card anchored bottom-left
- **Flow** (4 steps as chat messages):

```text
Step 1 — Bot: "Bonjour! Quel véhicule vous intéresse?"
         → Scrollable list of available vehicles (image + name + category)
         → User taps one → appears as user bubble

Step 2 — Bot: "Pour combien de jours souhaitez-vous louer [car]?"
         → Preset chips (1, 3, 7, 14, 30) + custom input
         → User picks → appears as user bubble

Step 3 — Bot: "Où souhaitez-vous récupérer le véhicule?"
         → List of enabled pickup locations from useLocations()
         → User taps one → appears as user bubble

Step 4 — Bot: "Récapitulatif: [car] • [X] jours • [location] • à partir de [rate] MAD/jour"
         → Green "Envoyer sur WhatsApp" button
         → Opens wa.me with message:
           "Bonjour, je suis intéressé par la [vehicle] pour [X] jours,
            récupération à [location]. Merci!"
```

- "Recommencer" link to reset the conversation at any point
- Closing the panel resets the flow

## Data Sources
- `useVehicles()` — available vehicles (filtered `is_available`)
- `usePricingTiers()` — all tiers, to compute daily rate with `getDailyRateFromTiers`
- `useLocations()` — enabled pickup locations
- `useSiteSettings()` — WhatsApp number, enabled flag, default message

## Files

### Modified: `src/components/WhatsAppPopup.tsx`
Complete rewrite:
- State: `isOpen`, `step` (1-4), `selectedVehicle`, `days`, `pickupLocation`
- Fetch vehicles, pricing tiers, locations, site settings
- Render floating button (bottom-left) + conditional chat panel
- Step 1: Vehicle cards in ScrollArea (image, name, category)
- Step 2: Day chips + custom number input
- Step 3: Location buttons from `useLocations()`
- Step 4: Summary bubble + "Envoyer sur WhatsApp" button building `wa.me` URL
- Responsive: mobile full-width bottom sheet, desktop 380px card
- Reset on close

No other files change — component is already in `Layout.tsx`.

## Execution Order
1. Rewrite `WhatsAppPopup.tsx`

