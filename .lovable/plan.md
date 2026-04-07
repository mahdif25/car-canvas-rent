

# Fix: Admin Dashboard Shows "Accès refusé" Despite User Having Admin Role

## Root Cause

The `checkAdmin` function in `useAuth.tsx` queries the `user_roles` table directly:

```typescript
const { data } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", userId)
  .eq("role", "admin")
  .maybeSingle();
```

But the RLS policy on `user_roles` for SELECT requires `has_role(auth.uid(), 'admin')` — meaning you must already be confirmed admin to read your own role. This is a **circular dependency**: you can't prove you're admin because you can't read the table that proves you're admin.

The `has_role` database function is `SECURITY DEFINER` and bypasses RLS, but the direct table query does not.

## Fix

Two changes:

### 1. `src/hooks/useAuth.tsx` — Use RPC instead of direct query

Replace the `checkAdmin` function to call the `has_role` database function via RPC, which is `SECURITY DEFINER` and bypasses RLS:

```typescript
const checkAdmin = async (userId: string) => {
  const { data } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  setIsAdmin(!!data);
};
```

### 2. (Optional but recommended) Add RLS policy for users to read own roles

Add a migration to let users SELECT their own row from `user_roles`:

```sql
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

This prevents the same circular issue if any other code queries `user_roles` directly.

## Summary
- Single file change + one small migration
- No other code affected

