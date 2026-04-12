

# Add Plate Number Editing from Parc Auto

## Problem
The `editPlate` function exists in `AdminFleetPlates.tsx` but is never wired to any UI button. Users cannot edit a plate's immatriculation from the cards or detail panel.

## Changes

### 1. Add "Edit" button to `FleetPlateDetail.tsx`
- Accept a new `onEdit` callback prop
- Add an "Edit" (pencil icon) button near the plate number header that calls `onEdit`

### 2. Add "Edit" button to `FleetPlateCard.tsx`
- Accept a new `onEdit` callback prop
- Add a small edit icon button on the card (with `e.stopPropagation()` to prevent opening the detail sheet)

### 3. Wire callbacks in `AdminFleetPlates.tsx`
- Pass `onEdit={() => editPlate(plate)}` to both `FleetPlateCard` and `FleetPlateDetail`
- When editing from the detail panel, close the sheet first, then open the form

## Files Modified
- `src/components/admin/fleet/FleetPlateCard.tsx` — add onEdit prop + button
- `src/components/admin/fleet/FleetPlateDetail.tsx` — add onEdit prop + button
- `src/pages/admin/AdminFleetPlates.tsx` — pass onEdit to both components

