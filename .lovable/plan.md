

# Vehicle Color Variants — Color Picker & Admin Management

## Overview
Add a color variant system where each vehicle type can have multiple color options, each with its own image. Users see color swatches on the homepage, fleet page, and reservation flow, and can pick a color. The selected color persists through the reservation and is saved with the booking.

## Database Changes

**New table: `vehicle_colors`**
- `id` uuid PK
- `vehicle_id` uuid FK → vehicles(id) ON DELETE CASCADE
- `color_name` text (e.g. "Rouge", "Noir")
- `color_hex` text (e.g. "#FF0000")
- `image_url` text (the vehicle image for this color)
- `is_default` boolean DEFAULT false
- `sort_order` integer DEFAULT 0
- `created_at` timestamptz DEFAULT now()

RLS: public SELECT, admin ALL.

**New column on `reservations`:**
- `selected_color_id` uuid REFERENCES vehicle_colors(id) — nullable

## Admin: Color Management (inside AdminFleet.tsx)
- In the vehicle edit form, add a "Couleurs" section below the main image
- Each color entry: color name input, hex color picker (native `<input type="color">`), image upload, "default" toggle
- Add/remove color rows dynamically
- On save, upsert `vehicle_colors` for that vehicle_id
- Delete removed colors

## Public-Facing Color Picker Component
Create a reusable `VehicleColorPicker` component:
- Row of circular color swatches (filled with hex color, ring on selected)
- Clicking a swatch updates the displayed vehicle image to that color's image_url
- Compact, fits under the vehicle image

## Integration Points

### Homepage (`Index.tsx`)
- Fetch `vehicle_colors` alongside vehicles
- Show color swatches under each featured vehicle card
- Default to `is_default` color; swap image on swatch click
- Selected color passed as URL param when clicking "Réserver"

### Fleet Page (`Fleet.tsx`)
- Same color swatches on each vehicle card
- Image swaps on hover/click

### Reservation — StepVehicle
- Show color swatches on each vehicle card
- Store selected color in `formData.selected_color_id`
- Image updates based on selected color

### Reservation — Sidebar & Summary
- Show selected color name/swatch alongside vehicle info

### Reservation Submission (`Reservation.tsx`)
- Save `selected_color_id` in the reservation insert

## Data Flow
- New hook `useVehicleColors(vehicleId?)` fetches from `vehicle_colors`
- `ReservationFormData` gets new field `selected_color_id: string`

## Files to Create/Modify
- **Migration**: create `vehicle_colors` table, add `selected_color_id` to reservations
- **`src/hooks/useVehicleColors.ts`** (new): fetch colors per vehicle or all
- **`src/components/VehicleColorPicker.tsx`** (new): reusable swatch component
- **`src/pages/admin/AdminFleet.tsx`**: color management section in vehicle form
- **`src/pages/Index.tsx`**: integrate color picker on featured cards
- **`src/pages/Fleet.tsx`**: integrate color picker on fleet cards
- **`src/components/reservation/StepVehicle.tsx`**: color picker + formData update
- **`src/components/reservation/ReservationSidebar.tsx`**: show selected color
- **`src/components/reservation/StepSummary.tsx`**: show selected color
- **`src/pages/Reservation.tsx`**: add `selected_color_id` to submission
- **`src/lib/types.ts`**: add `selected_color_id` to `ReservationFormData`

## Responsive
- Swatches: small circles (w-6 h-6 on mobile, w-7 h-7 on desktop)
- Wraps naturally on narrow screens

