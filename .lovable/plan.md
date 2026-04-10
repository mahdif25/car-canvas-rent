

# Fix: Vehicle Image Fill in Reservation Sidebar

## Change

In `src/components/reservation/ReservationSidebar.tsx` (lines 30-32), change the image from `object-contain` with padding to `object-cover` without padding, so the car fills the entire container edge-to-edge.

**Current:**
```tsx
<div className="w-full h-28 bg-secondary rounded-lg p-2">
  <img ... className="w-full h-full object-contain" />
</div>
```

**New:**
```tsx
<div className="w-full h-28 bg-secondary rounded-lg overflow-hidden">
  <img ... className="w-full h-full object-cover" />
</div>
```

- Remove `p-2` padding from container
- Add `overflow-hidden` to clip the image within rounded corners
- Change `object-contain` → `object-cover` so the image fills the box

### File
- `src/components/reservation/ReservationSidebar.tsx`

