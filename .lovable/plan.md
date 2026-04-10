

# Fix Vehicle Image Rendering in Reservation Sidebar

## Problem
The sidebar image uses `object-cover` which crops some vehicle images (depending on the original photo composition). Some cars appear cut off or poorly framed.

## Solution
Switch to `object-contain` so the full vehicle is always visible, matching the approach used on the Fleet page. The `bg-secondary` background fills any empty space.

### Change in `src/components/reservation/ReservationSidebar.tsx` (line 31)

**Current:**
```tsx
<img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover" />
```

**New:**
```tsx
<img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-contain" />
```

Single line change. The `bg-secondary` on the container already provides a clean background for any gaps.

