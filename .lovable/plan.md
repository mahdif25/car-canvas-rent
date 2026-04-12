

# Match Fleet Page Cards to Homepage Hover Effects + Navigation Flow

## Problem
Fleet page vehicle cards lack the homepage's hover effects (lift + colored background sweep) and link directly to the reservation page instead of opening the vehicle detail page first.

## Changes to `src/pages/Fleet.tsx`

### 1. Add homepage hover effects to fleet cards
- Add `hover:-translate-y-1` to the card Link class
- Add the primary color sweep overlay behind the car image (the `bg-primary translate-x-full group-hover:translate-x-0` div)
- Restructure the card layout to match homepage style: title/category above the image, specs below

### 2. Change card navigation flow
- Card Link → `/fleet/{slug || id}` (opens vehicle detail page)
- Add a separate "Réserver" button that navigates to `/reservation?vehicle={id}&color={colorId}` using `e.preventDefault()` + `e.stopPropagation()` + `navigate()` (same pattern as homepage)

### 3. Import changes
- Add `useNavigate` from react-router-dom
- Add `DoorOpen`, `Briefcase`, `Snowflake` icons (if matching homepage spec grid)
- Remove `Heart` icon (or keep — user preference)

## Files Modified
- `src/pages/Fleet.tsx` — update card structure, hover effects, and navigation

