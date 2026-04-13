

# Sticky Save/Return Buttons in Fleet Editor

## Problem
When editing a vehicle, the Save and Return buttons are at the bottom of a long form. You have to scroll all the way down to save or go back, which is inconvenient when making quick adjustments.

## Solution
Make the action buttons sticky at the bottom of the viewport while the edit form is open, on both desktop and mobile.

### `src/pages/admin/AdminFleet.tsx`

1. **Move the button container outside the Card/CardContent** and make it a fixed/sticky bar at the bottom of the screen:
   - Use `fixed bottom-0 left-0 right-0 z-40` positioning with a background, border-top, padding, and shadow
   - On desktop, offset `left` by the sidebar width (`left-64`) so it doesn't overlap the nav
   - On mobile, account for the bottom nav bar height (`bottom-[68px]`)

2. **Add bottom padding to the form content** so the last form elements aren't hidden behind the sticky bar (~`pb-20` on the edit card)

3. **Remove the current inline button `div`** (lines 775-780) and replace with the sticky footer bar

### Resulting layout
```text
┌──────────────────────────────┐
│  Edit form content scrolls   │
│  ...                         │
│  ...                         │
├──────────────────────────────┤
│  [Modifier]  [Retour]        │  ← sticky bottom bar
└──────────────────────────────┘
```

## Files Modified
- `src/pages/admin/AdminFleet.tsx`

