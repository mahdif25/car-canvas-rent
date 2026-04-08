

# Three Features: Hide Fees in Dropdown, Admin Reservation Editing + Print, Mobile Admin Layout

## 1. Remove delivery fee labels from location dropdowns

**File: `src/components/reservation/StepDates.tsx`**
- Remove the `(XXX MAD)` and `(Gratuit)` text from both pickup and dropoff `SelectItem` labels
- Show only `{l.name}` — fees are already visible in the sidebar summary

## 2. Admin reservation editing (vehicle, dates, recalculate) + print receipt

**File: `src/pages/admin/AdminReservations.tsx`**
- In the expanded reservation detail, add editable fields:
  - **Vehicle selector**: dropdown of all vehicles (fetched via `useVehicles`)
  - **Pickup/return date**: date inputs pre-filled with current values
  - **Pickup/return location**: dropdowns from `useLocations`
- Add a "Recalculer" button that:
  - Computes new rental days from updated dates
  - Looks up pricing tiers for the new vehicle
  - Recalculates delivery fees from locations
  - Fetches reservation_addons for addon costs
  - Updates `vehicle_id`, `pickup_date`, `return_date`, `pickup_location`, `return_location`, `total_price`, `delivery_fee`, `deposit_amount` on the reservation row
- Add a "Imprimer" (Print) button that opens a printable receipt view:
  - Create a hidden print-optimized div or use `window.print()` with a print-specific layout
  - Receipt shows: client info, vehicle, dates, locations, price breakdown (vehicle cost, addons, delivery fee, total), deposit amount, reservation ID
  - Use `@media print` CSS to hide admin chrome and show only the receipt

**Files:**
- `src/pages/admin/AdminReservations.tsx` — add edit fields, recalculate logic, print button
- `src/index.css` — add `@media print` styles to hide sidebar/nav

## 3. Mobile-optimized admin layout

**File: `src/components/admin/AdminLayout.tsx`**
- On mobile (use `useIsMobile` hook), replace the fixed sidebar with:
  - A top header bar with logo + hamburger menu button
  - A Sheet (slide-in drawer from left) containing the nav items
  - Bottom navigation bar with icon-only nav items for quick access (Dashboard, Flotte, Réservations, Lieux, Plus)
- Desktop remains unchanged (sidebar layout)

**Files:**
- `src/components/admin/AdminLayout.tsx` — conditional mobile/desktop layout using `useIsMobile`

## Summary of all files changed
1. `src/components/reservation/StepDates.tsx` — remove fee labels from dropdowns
2. `src/pages/admin/AdminReservations.tsx` — add vehicle/date editing, recalculate, print receipt
3. `src/components/admin/AdminLayout.tsx` — responsive mobile layout with bottom nav + hamburger drawer
4. `src/index.css` — print media styles

No database migrations needed — all fields already exist on the reservations table.

