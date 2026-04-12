

# Email History Dashboard on Settings > Emails Tab

## Overview
Add a full email log dashboard below the existing email configuration section in the Emails tab. This shows all emails sent from the platform with status, type, recipient, and details.

## Important Limitation: Open & Click Tracking
Open rates and click rates require additional infrastructure (tracking pixel endpoint + link redirect endpoint embedded in every email). This is NOT currently implemented. The dashboard will show **delivery status** (sent, failed, pending) but open/click columns will be added as "coming soon" or implemented as a follow-up with tracking pixel + link wrapping edge functions.

## Changes

### 1. Database: RLS policy for `email_send_log` (migration)
Add an RLS policy so authenticated admins can SELECT from `email_send_log`:
```sql
CREATE POLICY "Admins can view email send log"
ON public.email_send_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
```

### 2. Add Email History section to `AdminSettings.tsx` Emails tab
Below the existing "Configuration emails" card, add:

**Filters bar:**
- Time range: Last 24h / 7 days / 30 days buttons
- Template type dropdown: All, reservation-confirmation, reservation-update, welcome-email, promotional-email, auth_emails
- Status filter: All, Sent, Failed, Pending

**Summary stat cards:**
- Total emails, Sent, Failed, Pending (deduplicated by `message_id`)

**Email log table (responsive — cards on mobile, table on desktop):**
- Columns: Type (template_name badge), Recipient, Status (color-coded badge), Date, Error (for failed)
- Click a row to expand and see full details (metadata, error message)
- Pagination (50 per page)
- Deduplicate by `message_id`, show latest status per email

**Query approach:** Use a subquery pattern client-side — fetch from `email_send_log` ordered by `created_at DESC`, then deduplicate by `message_id` in JS (since Supabase JS client doesn't support `DISTINCT ON`).

### 3. Open/Click tracking note
Display a small info banner: "Le suivi des ouvertures et clics sera disponible prochainement" — these features require tracking pixel and link redirect infrastructure that can be built as a follow-up.

## Files Modified
- `src/pages/admin/AdminSettings.tsx` — add email history dashboard to emails tab
- Database migration — add admin SELECT policy on `email_send_log`

