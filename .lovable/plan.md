

# Add Vehicle Image to Reservation Sidebar

## Change

In `src/components/reservation/ReservationSidebar.tsx`, add a small vehicle image at the top of the sidebar content when a vehicle is selected. The vehicle's `image_url` field will be used.

### What changes
- After the `<h3>Résumé</h3>` heading in the desktop sidebar, render a small rounded image of the selected vehicle using `vehicle.image_url`
- Image styled as: `w-full h-28 object-contain bg-secondary rounded-lg p-2`
- Also show the image in the mobile expanded view at the top of the content
- Same image added inside the `content` block, before the location/dates info, so it appears in both desktop and mobile views

### File
- `src/components/reservation/ReservationSidebar.tsx`

