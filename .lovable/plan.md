

# Parc Auto — Sheet Detail Panel & Per-Plate Image Override

## Problems
1. Clicking a car card opens the detail panel at the bottom of the grid, forcing scroll up/down — impractical with many vehicles
2. Car images in Parc Auto are pulled from the vehicle type and cannot be customized per plate

## Solution

### 1. Replace inline detail panel with a right-side Sheet
- When clicking a card, open a `Sheet` (slide-in panel from the right) instead of rendering `FleetPlateDetail` inline in the grid
- The sheet stays visible while the card grid remains scrollable behind the overlay
- On mobile: sheet takes full width; on desktop: `sm:max-w-lg`
- No more scrolling to find the detail — it's always docked to the side

### 2. Add per-plate custom image
- Add an `image_url` column (text, nullable) to `fleet_plates` table
- In the sheet detail panel, add an image section at the top with the current image displayed and a text input to override the image URL (or keep the default from the vehicle type)
- `FleetPlateCard` uses `plate.image_url || vehicleImage` as the displayed image
- Admin can paste a custom image URL per plate to differentiate cars of the same model

## Files to Modify

- **Migration**: `ALTER TABLE fleet_plates ADD COLUMN image_url text;`
- **`AdminFleetPlates.tsx`**: wrap `FleetPlateDetail` in a `Sheet` instead of rendering inline; add `image_url` field to the add/edit form
- **`FleetPlateDetail.tsx`**: add image display + URL edit input at the top of the sheet; include save mutation for image changes
- **`FleetPlateCard.tsx`**: use `plate.image_url || vehicleImage` for the displayed image

## Responsive
- Sheet: full-width on mobile, max-w-lg on tablet/desktop
- Image input: full-width inside sheet
- Card grid remains 1/2/3 columns as before

