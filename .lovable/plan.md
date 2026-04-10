

# Update Brand Logo

## Change
Replace the existing logo file at `src/assets/logo.png` with the new uploaded logo image.

## Details
The logo is imported from `src/assets/logo.png` in 4 files:
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/admin/AdminLayout.tsx`
- `src/pages/admin/AdminLogin.tsx`

Since all files reference the same path, replacing the single file updates the logo everywhere. No code changes needed.

## Steps
1. Copy `user-uploads://image-removebg-preview.png` to `src/assets/logo.png` (overwrite)

