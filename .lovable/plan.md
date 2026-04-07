

# Auto-redirect logged-in users from /admin/login to /admin

## Changes

### `src/pages/admin/AdminLogin.tsx`

Add redirect logic at the top of the component using `useAuth`:

- If `loading` is true, show a loading spinner/message
- If `user` is already logged in, use `<Navigate to="/admin" replace />` to redirect to the admin dashboard
- Otherwise, show the login form as normal

The admin dashboard (`AdminLayout`) already handles the admin vs non-admin check — it shows "Accès refusé" for non-admins and the dashboard for admins. So we just need to redirect any authenticated user to `/admin` and let the existing logic handle the rest.

### Implementation detail

```tsx
// At top of AdminLogin component
const { user, loading } = useAuth();

if (loading) {
  return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
}

if (user) {
  return <Navigate to="/admin" replace />;
}

// ... rest of login form
```

Single file change: `src/pages/admin/AdminLogin.tsx`

