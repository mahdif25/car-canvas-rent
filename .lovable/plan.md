

# Fix: Admin Auth Flow — Timeout, Logout, and Login Redirect

## Problems Found (confirmed via browser testing and database inspection)

1. **Race condition**: The 5-second safety timeout in `useAuth.tsx` fires before `onAuthStateChange` + `has_role` RPC completes. The user `mahdif25@gmail.com` IS an admin in the database, but `isAdmin` stays `false` when the timeout wins.
2. **Logout stuck**: The "Se déconnecter" button on the "Accès refusé" screen calls `signOut()` then `navigate("/")`, but the page doesn't redirect — likely because the auth state change re-triggers rendering before navigation completes.
3. **Redirect loop potential**: Login page redirects authenticated users to `/admin`, which shows "Accès refusé" again.

## Fix — `src/hooks/useAuth.tsx`

Refactor the auth initialization to use `getSession()` for the initial load instead of relying solely on `onAuthStateChange`:

- Call `supabase.auth.getSession()` immediately on mount to get the current session
- If session exists, call `checkAdmin()` then set `loading = false`
- If no session, set `loading = false` immediately
- Keep `onAuthStateChange` for subsequent auth events (login, logout, token refresh)
- Remove the 5-second timeout entirely (it's the root cause)
- Add error handling to `checkAdmin` with `console.error` logging
- In `signOut`, also clear `user` and `session` state immediately (don't wait for `onAuthStateChange`)

Revised flow:
```text
Mount:
  1. getSession() → session found → checkAdmin() → setLoading(false)
                  → no session   → setLoading(false)
  2. onAuthStateChange → handles login/logout/refresh events after mount
```

## Fix — `src/components/admin/AdminLayout.tsx`

Update the "Se déconnecter" handler to use `window.location.href = "/"` instead of `navigate("/")` as a fallback — this ensures a full page reload which clears all React state and avoids the race with `onAuthStateChange` re-rendering.

## Files Changed
- `src/hooks/useAuth.tsx` — refactor initial load + signOut
- `src/components/admin/AdminLayout.tsx` — fix logout redirect

No database changes needed. The user `mahdif25@gmail.com` already has the admin role.

