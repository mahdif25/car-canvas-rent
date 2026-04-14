

# Capture All Reservation Fields in Leads

## Problem
Currently, leads only store: first_name, last_name, email, phone, license_number. Missing fields include: selected vehicle, dates, locations, nationality, DOB, CIN, passport, color, addons, and promo code. The admin Leads page cannot show which car a user was interested in.

## Changes

### 1. Add columns to `leads` table (database migration)
Add new nullable columns to capture reservation context:
- `vehicle_id` (uuid) — the selected vehicle
- `pickup_date` (text), `return_date` (text), `pickup_time` (text), `return_time` (text)
- `pickup_location` (text), `return_location` (text)
- `nationality` (text), `dob` (text)
- `cin` (text), `passport` (text)
- `license_delivery_date` (text), `cin_expiry_date` (text)
- `selected_color_id` (uuid)
- `selected_addons` (text[]) — array of addon IDs
- `promo_code` (text)

### 2. Capture lead data at every step transition
Currently `captureLeadField` is only called at step 3. Update to also capture at:
- **Step 1 → 2**: Pass pickup/return dates, times, locations
- **Step 2 → 3**: Pass vehicle_id and selected_color_id
- **Step 3 → 4 (summary)**: Already captured, but expand `collectAllFields()` to include nationality, dob, cin, passport, license dates, and addons

This means adding `captureLeadField` calls in `Reservation.tsx` at each step transition, passing the relevant form data fields.

### 3. Expand `collectAllFields()` in StepDriverInfo
Add nationality, dob, cin, passport, license_delivery_date, cin_expiry_date to the fields object.

### 4. Update AdminLeads page to show vehicle info
- Join/lookup vehicle name from `vehicles` table
- Show the selected vehicle column in the leads table
- Show additional captured fields (dates, location, nationality, etc.) in the expanded detail view

## Files Modified
- Database migration — add new columns to `leads` table
- `src/hooks/useAnalytics.ts` — no changes needed (already accepts any fields via `Record<string, string>`)
- `src/pages/Reservation.tsx` — add `captureLeadField` calls at step 1→2 and step 2→3 transitions
- `src/components/reservation/StepDriverInfo.tsx` — expand `collectAllFields()` to include all driver fields
- `src/pages/admin/AdminLeads.tsx` — add vehicle column, show new fields in expanded view

