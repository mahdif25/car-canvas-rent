

# Keep All Lead Entries (Never Overwrite)

## Problem
Currently, `captureLeadField` in `useAnalytics.ts` upserts by `visitor_id` — it finds the latest lead for that visitor and overwrites it. The user wants every form interaction to be preserved as a separate record, creating a full history of lead captures per visitor.

## Approach

### `src/hooks/useAnalytics.ts`
- **`captureLeadField`**: Change from upsert to always `INSERT` a new row. Remove the "find existing and update" logic. Every blur event that captures fields will create a new lead record with the current visitor_id, session_id, fields, and step.
- **`markLeadCompleted`**: Keep finding the latest lead by visitor_id and marking it completed (this is fine — it marks the most recent entry).

### `src/pages/admin/AdminLeads.tsx`
- Group leads by email (or visitor_id if no email) so admins can see all entries for the same person.
- Add a count column showing how many lead entries exist per person.
- In the expanded detail view, show a timeline of all lead entries for that visitor (each with their captured fields, step reached, and timestamp).

## Files Changed
1. `src/hooks/useAnalytics.ts` — replace upsert with always-insert in `captureLeadField`
2. `src/pages/admin/AdminLeads.tsx` — show grouped lead history per visitor/client

