

# Broadcast History Dashboard + Fix Email Sending Bug

## Root Cause: Broadcasts Not Sending

The logs show `send-transactional-email` crashes with: **"Can only set one of `children` or `props.dangerouslySetInnerHTML`"**. This happens because the `promotional-email.tsx` template uses react-email's `<Section>` component with `dangerouslySetInnerHTML` — but `Section` internally renders its own children wrapper, which conflicts with `dangerouslySetInnerHTML`. The fix is to use plain `<div>` elements instead of `<Section>` for the `dangerouslySetInnerHTML` blocks.

## Changes

### 1. Fix promotional email template (`promotional-email.tsx`)
Replace `<Section dangerouslySetInnerHTML=...>` (lines 74, 78, 90) with `<div dangerouslySetInnerHTML=...>`. This resolves the React rendering conflict that causes the 500 error in `send-transactional-email`, which in turn causes `send-broadcast` to mark all recipients as failed.

Redeploy `send-transactional-email` after the fix.

### 2. Broadcast History Dashboard (`AdminBroadcast.tsx`)
Add a view toggle at the top: **"Nouveau"** (current creation wizard) and **"Historique"** (new history view).

**History list view:**
- Fetch from `email_broadcasts` ordered by `created_at DESC`
- Display as cards (mobile) / table (desktop) with: Subject, Date, Status badge, Recipients count, Sent/Failed counts
- Click a broadcast to expand to detail view

**Broadcast detail view:**
- Summary stat cards: Total recipients, Sent, Failed, Pending
- Recipient table from `broadcast_recipients`: Name, Email, Status (color-coded badges — green=sent, red=failed, yellow=pending)
- Back button to return to history list

### 3. Responsive
- Mobile: card layout for broadcast list and recipients
- Desktop: table layout
- Detail view uses responsive stat cards grid

## Files Modified
- `supabase/functions/_shared/transactional-email-templates/promotional-email.tsx` — fix dangerouslySetInnerHTML conflict
- `src/pages/admin/AdminBroadcast.tsx` — add history and detail views

## No database changes needed

