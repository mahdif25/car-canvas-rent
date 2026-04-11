

# Add Manual Reservation from Admin Dashboard

## Overview
Add a "Nouvelle réservation" button to the admin reservations page that opens a dialog/form where admins can manually create a reservation by selecting a vehicle, dates, locations, and entering customer details. The reservation will be marked as a manual entry and flagged as cash payment.

## Database Changes

**Migration**: Add two columns to the `reservations` table:
- `is_manual` (boolean, default false) — flags admin-created reservations
- `payment_method` (text, default 'pickup') — stores payment type ('cash' for manual)

## UI Changes

### `src/pages/admin/AdminReservations.tsx`
- Add a "Nouvelle réservation" button at the top next to the status filter
- Create a Dialog component (`ManualReservationDialog`) containing a form with:
  - **Vehicle selector** (dropdown from existing vehicles list)
  - **Dates**: pickup date, return date, pickup time, return time
  - **Locations**: pickup location, return location (from locations list)
  - **Customer info**: first name, last name, email, phone, license number, nationality, DOB
  - **Optional additional driver** toggle + fields (same as public flow)
  - **Add-ons** checkboxes
  - Auto-calculated total price, delivery fee, deposit amount (reusing `getDailyRateFromTiers` and `getDeliveryFee`)
- On submit: insert into `reservations` with `is_manual: true`, `payment_method: 'cash'`, `status: 'confirmed'`
- Also insert `reservation_addons` and `additional_drivers` if applicable
- Show a "Manuel" badge on manual reservations in the list
- Responsive: dialog scrollable on mobile, form fields stack vertically

### Display in reservation list
- Show a small "Manuel" / "Cash" badge next to manual reservations in both the desktop table and mobile card views

## Files to Modify
- **Migration**: add `is_manual` and `payment_method` columns
- **`src/pages/admin/AdminReservations.tsx`**: add button, dialog, form, insert logic, badge display

