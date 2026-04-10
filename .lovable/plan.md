

# Fix Logo: Bigger, More Compact, Less Empty Space

## Problem
The logo image likely has built-in transparent padding, so even at 80px it looks small with too much empty space. The slider max of 80px is also too limiting, and the navbar has a fixed `h-16` height that constrains the visual size.

## Changes

### 1. Increase slider range and default (`src/pages/admin/AdminSettings.tsx`)
- Change slider range from `32–80` to `32–120`
- This allows the logo to be set much larger

### 2. Adjust navbar height to accommodate larger logos (`src/components/layout/Navbar.tsx`)
- Make the header height dynamic: use `max(64px, logoH + 16px)` so the navbar grows with the logo instead of clipping it
- Change from fixed `h-16` to dynamic `style={{ minHeight: Math.max(64, logoH + 16) }}`

### 3. Trim transparent space from the logo image
- Use imagemagick to auto-trim the transparent padding from `src/assets/logo.png` so the actual graphic fills more of the allocated space

### 4. Admin sidebar logo padding (`src/components/admin/AdminLayout.tsx`)
- Reduce padding around the sidebar logo from `p-4` to `p-2` in the logo container to make it more compact

### Files
- `src/assets/logo.png` (trim whitespace)
- `src/pages/admin/AdminSettings.tsx` (slider max → 120)
- `src/components/layout/Navbar.tsx` (dynamic header height)
- `src/components/admin/AdminLayout.tsx` (tighter padding)

