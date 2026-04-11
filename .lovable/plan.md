

# Persist Reservation Form & Allow Vehicle Change at Any Stage

## Overview
Two changes: (1) persist all form data + current step to `sessionStorage` so a page refresh restores the user's progress; (2) remove the skip-step-2 logic when a vehicle is preselected, so users can always change their vehicle.

## Changes

### 1. `src/pages/Reservation.tsx` — Session persistence

- **Initialize state from sessionStorage**: On mount, read `reservation_form` and `reservation_step` from `sessionStorage`. If found, use those values as initial state instead of defaults. URL search params (location, pickup, return, vehicle) override only if they differ from what's stored (i.e., fresh navigation with new params takes priority).
- **Persist on every update**: Add a `useEffect` that writes `formData` and `currentStep` to `sessionStorage` whenever they change.
- **Clear on confirmation**: After successful reservation (step 5), clear sessionStorage keys.

### 2. `src/pages/Reservation.tsx` — Allow vehicle change at any step

- Remove the `preselectedVehicle` skip logic in `nextStep` and `prevStep` (lines 98-107). Users always go through step 2.
- Add a "Changer de véhicule" button visible on steps 3 and 4 (near the vehicle info in the sidebar or in the step content) that sets `currentStep` to 2.

### 3. `src/components/reservation/ReservationSidebar.tsx` — Change vehicle button

- Add an optional `onChangeVehicle` callback prop
- When a vehicle is selected and `onChangeVehicle` is provided, show a small "Modifier" link/button next to the vehicle name that calls `onChangeVehicle`

## Technical Details

```typescript
// Session storage keys
const STORAGE_KEY = "reservation_form";
const STEP_KEY = "reservation_step";

// On mount: merge sessionStorage with URL params
const saved = sessionStorage.getItem(STORAGE_KEY);
const savedData = saved ? JSON.parse(saved) : null;
// URL params take priority only when explicitly provided
const initialData = { ...defaultForm, ...savedData, ...urlOverrides };

// Persist effect
useEffect(() => {
  if (currentStep < 5) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    sessionStorage.setItem(STEP_KEY, String(currentStep));
  }
}, [formData, currentStep]);
```

## Files to Modify
- `src/pages/Reservation.tsx` — persistence logic + remove skip-step-2
- `src/components/reservation/ReservationSidebar.tsx` — add "Modifier" vehicle button

