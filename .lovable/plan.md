

# Fix Email Sender Domain Mismatch

## Problem
The verified email domain is `mail.centreluxcar.com`, but the two edge functions that send emails use incorrect sender domains:
- `send-transactional-email/index.ts` → `SENDER_DOMAIN = "notify.centreluxcar.com"` (wrong)
- `auth-email-hook/index.ts` → `SENDER_DOMAIN = "notif.centreluxcar.com"` (wrong)

This causes the email API to reject every send with: **"No sender domain matches the requested sender domain"** (403 error). This affects ALL emails — reservation confirmations, updates, welcome emails, broadcasts, and auth emails.

## Fix

### 1. Update `SENDER_DOMAIN` in both edge functions
Change the `SENDER_DOMAIN` constant to `"mail.centreluxcar.com"` in:
- `supabase/functions/send-transactional-email/index.ts` (line 12)
- `supabase/functions/auth-email-hook/index.ts` (line 40)

### 2. Redeploy both edge functions
Deploy `send-transactional-email` and `auth-email-hook` so the fix takes effect.

### 3. Verify
Test by updating a reservation or sending a test email to confirm delivery.

## Files Modified
- `supabase/functions/send-transactional-email/index.ts` — fix SENDER_DOMAIN
- `supabase/functions/auth-email-hook/index.ts` — fix SENDER_DOMAIN

