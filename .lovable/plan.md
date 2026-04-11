

# Add Plate Assignment to Manual Reservation Dialog

## Overview
Add a "Véhicule du parc" dropdown to the manual reservation dialog that appears only after a vehicle type is selected. It filters available plates by the selected vehicle type and date range, and saves the `assigned_plate_id` on the reservation.

## Changes

### `src/components/admin/ManualReservationDialog.tsx`
- Add `assigned_plate_id` state (string, initially empty)
- Import and use `useAvailablePlates` from `@/hooks/useFleetPlates` with `vehicleId`, `pickupDate`, `returnDate`
- After the vehicle selector, show a "Véhicule du parc (immatriculation)" dropdown — only visible when `vehicleId` is set
- Options: available plates for that vehicle type + date range, displayed as plate number
- Reset `assigned_plate_id` when `vehicleId` changes
- Include `assigned_plate_id` in the insert payload (or null if not selected)
- Add to `resetForm()`

No database or migration changes needed — `assigned_plate_id` already exists on `reservations`.

