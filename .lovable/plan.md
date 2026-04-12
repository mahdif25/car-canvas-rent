

# Parc Auto — Brand Filter & Image Positioning

## Overview
Two additions to the Parc Auto dashboard:
1. A brand filter dropdown to quickly find vehicles by make
2. Per-plate image positioning controls (flip + scale) matching the existing vehicle image adjustment pattern

## Database Changes

**Migration**: Add 3 columns to `fleet_plates`:
- `image_flipped` boolean DEFAULT false
- `image_scale` numeric DEFAULT 1.0
- `image_offset_y` numeric DEFAULT 50

These are simpler than the vehicle-level adjustments (5 placements x 3 devices) because the Parc Auto cards only have one display context — the card thumbnail and sheet detail view.

## UI Changes

### 1. Brand Filter (`AdminFleetPlates.tsx`)
- Add a `filterBrand` state (string, default `"all"`)
- Extract unique brands from the `plates` array
- Render a `Select` dropdown above the grid: "Toutes les marques" + each brand
- Filter the displayed plates by selected brand before rendering the grid
- Place the filter in the header bar next to the title and "Ajouter" button
- On mobile: filter spans full width below the title row

### 2. Image Positioning (`FleetPlateDetail.tsx`)
- In the image section of the sheet detail panel, add controls below the image URL input:
  - **Flip toggle** (Switch): mirrors the image horizontally
  - **Scale slider** (Slider, 0.5–2.0, step 0.05): zoom in/out
  - **Vertical offset slider** (0–100, step 1): adjust vertical position via `object-position`
- Apply transforms to the image preview in the sheet and pass to `FleetPlateCard`
- Save all 3 values alongside the existing `image_url` save mutation

### 3. Card Image Rendering (`FleetPlateCard.tsx`)
- Accept `image_flipped`, `image_scale`, `image_offset_y` from the plate data
- Apply `transform: scaleX(-1) scale(X)` and `object-position: center Y%` to the card thumbnail image
- Same transforms applied in `FleetPlateDetail` image preview

## Files to Modify
- **Migration**: add 3 columns to `fleet_plates`
- **`AdminFleetPlates.tsx`**: add brand filter state + Select + filtering logic
- **`FleetPlateDetail.tsx`**: add flip/scale/offset controls + save mutation update
- **`FleetPlateCard.tsx`**: apply image transforms from plate data

## Responsive
- Filter dropdown: inline with header on desktop, full-width row on mobile
- Image controls in sheet: full-width, stacked vertically

