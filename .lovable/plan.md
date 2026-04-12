

# Send Confirmation & Update Emails for Manual Reservations

## Problem
Manual reservations created by the admin don't trigger confirmation or welcome emails. When the admin updates any reservation (including manual ones), the update email is already sent — but the initial creation of a manual reservation silently skips email notifications.

## Changes

### 1. Send confirmation + welcome emails on manual reservation creation (`ManualReservationDialog.tsx`)

After the reservation is successfully inserted (line ~214, before `resetForm()`), add email sends — only if the customer has a real email (not the `manual-*@noemail.local` fallback):

- **Confirmation email**: Call `send-transactional-email` with `templateName: "reservation-confirmation"`, passing the same `templateData` structure used in `Reservation.tsx` (customerName, confirmationId, vehicleName, dates, locations, pricing breakdown).
- **Welcome email**: Call `send-transactional-email` with `templateName: "welcome-email"`.
- **Guard**: Skip both sends if `form.email` is empty (i.e., the fallback `@noemail.local` was used).
- Both calls use `.catch(console.error)` to avoid blocking the creation flow.

### 2. Data mapping

Build the `templateData` from existing `form`, `calc`, and `vehicles`/`allAddons` data already available in scope:
- `customerName` → `form.firstName`
- `confirmationId` → `reservation.id.slice(0, 8).toUpperCase()`
- `vehicleName` → vehicle name from `vehicles` array
- Dates formatted with `toLocaleDateString("fr-FR", ...)`
- `addonsDetails` → mapped from `form.selectedAddons` with addon name + total
- All pricing from `calc` object

## Files Modified
- `src/components/admin/ManualReservationDialog.tsx` — add email sends after successful creation

## No database or edge function changes needed
The templates and edge functions already exist and work correctly.

