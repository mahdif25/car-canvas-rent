

# Fix: Admin Dashboard Stuck on "Chargement..."

## Root Cause
The `useAuth` hook has a fragile loading state flow. If `checkAdmin()` hangs (Supabase query never resolves) or if there's a race condition between `getSession()` and `onAuthStateChange`, `setLoading(false)` is never called.

## Fix — `src/hooks/useAuth.tsx`

Restructure the auth initialization to be more robust:

1. **Set up `onAuthStateChange` BEFORE `getSession`** (Supabase recommended pattern) — use `onAuthStateChange` as the single source of truth for session state
2. **Remove the separate `getSession()` call** — `onAuthStateChange` with the `INITIAL_SESSION` event already provides the initial session
3. **Add a timeout fallback** — if auth initialization takes more than 5 seconds, force `setLoading(false)` to prevent infinite loading
4. **Ensure `setLoading(false)` is in a `finally` block** after `checkAdmin` so it always executes regardless of query outcome

The rewritten `useEffect` will:
```
onAuthStateChange → fires INITIAL_SESSION event
  → set session/user
  → try checkAdmin() finally setLoading(false)
```

This eliminates the race condition and guarantees loading resolves.

## Technical Details
- Single file change: `src/hooks/useAuth.tsx`
- No database or migration changes needed
- No new dependencies

