

# Fix: "Se déconnecter" button on Accès refusé screen

## Problem
The `signOut` function logs out but doesn't redirect. The user stays on `/admin` showing a stale state.

## Fix — `src/components/admin/AdminLayout.tsx`

Replace the plain `signOut` call with a function that signs out AND redirects to home:

```tsx
// Add useNavigate import
import { Link, useLocation, Navigate, useNavigate } from "react-router-dom";

// Inside component
const navigate = useNavigate();

// In the Accès refusé block, replace the button onClick:
<button
  onClick={async () => { await signOut(); navigate("/"); }}
  className="text-primary hover:underline"
>
  Se déconnecter
</button>
```

Single file change, no migrations needed.

