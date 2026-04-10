

# Fix Reservation Zoom Not Visually Applying

## Problem
The zoom scale values are being saved and applied via `transform: scale()`, but the visual effect is invisible because:

1. **Sidebar** (`ReservationSidebar.tsx` line 30): The container has `overflow-hidden`, so when the image scales up, the overflow is clipped — making it look the same size
2. **StepVehicle** (`StepVehicle.tsx` line 45): The image has `object-cover` with fixed dimensions (`w-48 h-32`), and `scale()` on an `object-cover` image just enlarges the element box (which gets clipped by the flex layout)

## Root Cause
`transform: scale()` scales the entire `<img>` element, but when the parent clips overflow, the scaled-up portion is invisible. The correct approach is to use `object-position` combined with a CSS `scale` on the image content, or better yet, wrap the image in a container and scale inside it.

## Fix

### Both files: Wrap image in an overflow-hidden container, scale the img inside
The pattern should be:
```tsx
<div className="... overflow-hidden">
  <img style={{ transform: `scale(${scale})` }} className="w-full h-full object-contain" />
</div>
```

This way `scale()` zooms into the image (showing more detail / less surrounding space), which is the expected "zoom" behavior.

### `src/components/reservation/StepVehicle.tsx`
- Wrap the `<img>` in a fixed-size `div` with `overflow-hidden`
- Move dimensions (`md:w-48 h-32`) to the wrapper div
- Let the img be `w-full h-full object-contain` with the transform

### `src/components/reservation/ReservationSidebar.tsx`
- The container already has `overflow-hidden` — the issue is that `object-contain` + `scale()` works correctly only when the image fills its container. Currently it should work, but we need to verify the scale value is actually coming through from the database (not stuck at 1.0)
- Remove `(v as any)` casts since the types now include these columns natively

### All other pages (Index.tsx, Fleet.tsx, VehicleDetail.tsx)
- Apply the same wrapper pattern to ensure zoom works consistently everywhere — wrap images in `overflow-hidden` containers and scale inside

### Files to change
- `src/components/reservation/StepVehicle.tsx`
- `src/components/reservation/ReservationSidebar.tsx`
- `src/pages/Index.tsx`
- `src/pages/Fleet.tsx`
- `src/pages/VehicleDetail.tsx`
- Remove unnecessary `(v as any)` casts since the DB types already include these columns

