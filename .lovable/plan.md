

# Vehicle Card Click + Auto-Fill + Date Text Input for Manual Reservations

## Changes

### 1. Make vehicle cards clickable on /offre (`src/pages/LandingOffer.tsx`)
- Add `onClick` handler to each vehicle card: sets `form.vehicle_id`, smooth-scrolls to `#form`, and programmatically focuses the first name input to trigger browser autofill suggestions
- Add a "Réserver" button on each card for clarity
- On page mount, auto-focus the first name input after 500ms with `preventScroll: true` to prompt browser autofill without scrolling

### 2. Use `requestSubmit` trick for instant autofill capture
Browser autofill only populates values when the user interacts with an input. We cannot force the browser to fill fields without user action. However, by focusing the input and using `autocomplete` attributes correctly, the browser will show suggestions. The current setup already has correct `autoComplete` attributes.

The key improvement: when a vehicle card is clicked, scroll to form and focus the first empty field — the browser will immediately show its autofill dropdown. The user taps one suggestion and all fields fill at once (browser behavior). The existing polling + event listeners will capture the values.

### 3. Replace pickup/return date inputs with `DateInputField` in Manual Reservations (`src/components/admin/ManualReservationDialog.tsx`)
The pickup date and return date fields currently use `DateInputField` already based on previous changes. Let me verify and ensure they use the text-input format consistently.

### 4. Verify StepDates already uses DateInputField
Already confirmed — `StepDates.tsx` uses `DateInputField` for both pickup and return dates.

## Files Modified
- `src/pages/LandingOffer.tsx` — add vehicle card click handler (scroll to form + select vehicle + focus input), add auto-focus on mount, add "Réserver" button to cards

