

# Click "Réserver" → Reservation Page with Car Pre-Selected

## Problem
Currently, clicking a car card on the homepage or fleet page navigates to the vehicle detail page (`/fleet/:slug`), not the reservation page. The user wants clicking "Réserver" to go directly to `/reservation?vehicle=ID` with the car already selected, starting at step 1 (dates).

## Changes

### 1. Homepage cards (`src/pages/Index.tsx`)
- Change the card's `<Link to={...}>` from `/fleet/${slug}` to `/reservation?vehicle=${v.id}`
- This sends the user straight to the reservation flow with the vehicle pre-selected

### 2. Fleet page cards (`src/pages/Fleet.tsx`)
- Same change: link from `/fleet/${slug}` to `/reservation?vehicle=${v.id}`

### 3. Reservation flow order (`src/pages/Reservation.tsx`)
- When a vehicle is pre-selected via URL param, start at **step 1 (Dates)** instead of step 2
- The vehicle is already set in `formData.vehicle_id`, so step 2 (vehicle selection) can be skipped
- Change initial step: `useState(preselectedVehicle ? 2 : 1)` → `useState(1)`
- After dates are selected in step 1, skip step 2 and go directly to step 3 (driver info) if a vehicle is pre-selected
- Adjust `nextStep` logic: if on step 1 and vehicle is pre-selected, jump to step 3

### Files
- `src/pages/Index.tsx` — change card link target
- `src/pages/Fleet.tsx` — change card link target
- `src/pages/Reservation.tsx` — adjust step flow for pre-selected vehicles

