

# Fix Email Sender Domain Configuration

## Problem
Both email edge functions reference the old domain `mail.centreluxcar.com` as the `SENDER_DOMAIN`, but the verified domain is `m.centreluxcar.com`. Every email send is rejected because the API can't find a verified domain record for `mail.centreluxcar.com`.

## Changes

### 1. `supabase/functions/auth-email-hook/index.ts` (line 40)
- Change `SENDER_DOMAIN` from `"mail.centreluxcar.com"` to `"m.centreluxcar.com"`

### 2. `supabase/functions/send-transactional-email/index.ts` (line 12)
- Change `SENDER_DOMAIN` from `"mail.centreluxcar.com"` to `"m.centreluxcar.com"`

### 3. Deploy both edge functions
- Deploy `auth-email-hook` and `send-transactional-email` so the updated domain takes effect immediately.

## Files Modified
- `supabase/functions/auth-email-hook/index.ts`
- `supabase/functions/send-transactional-email/index.ts`

