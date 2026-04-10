

# Restyle Website Based on Figma "Qent" Car Rental Design

## Design Analysis from Figma

The Figma design ("Qent") is a **mobile-first car rental app** with these key style patterns (adapted to your existing web layout and green brand colors):

1. **Cards**: Clean white cards with subtle shadows, rounded corners (~16px), no harsh borders
2. **Car Details page**: Image carousel with dot indicators, feature specs in icon-grid cards (Capacity, Engine, Speed), star ratings
3. **Filters**: Horizontal chip/pill toggles for categories (All Cars, Regular, Luxury), color dots, capacity numbers in circles
4. **Calendar/Date picker**: Full popover calendar with time pickers (AM/PM toggle), date range highlighting with filled circles on start/end, "Cancel"/"Done" buttons
5. **Booking form (image-5)**: Step progress bar (dots connected by lines), form fields with clean borders, gender radio pills, rental duration chips (Hour/Day/Weekly/Monthly), date fields showing `dd/Month/yyyy`, location with map pin icon, prominent full-width CTA button
6. **Typography**: Clean, semibold headings, muted descriptions
7. **Layout**: Generous whitespace, icon-prefixed fields, bottom navigation on mobile

## What Changes (keeping your green #00C853 + black #1A1A1A palette)

### 1. New `DatePickerField` component
- `src/components/ui/date-picker-field.tsx` -- Popover + Calendar picker
- Trigger button shows calendar icon + formatted date (`dd/MM/yyyy`) or placeholder
- Styled to match Figma: clean bordered button, calendar popover with month navigation

### 2. Home Page (`src/pages/Index.tsx`)
- Replace `<Input type="date">` with `DatePickerField` in hero search bar
- Vehicle cards: add star rating placeholder, slightly rounder corners, image with heart/favorite icon overlay (visual only)
- Benefits section: icon cards with larger icons in circular backgrounds matching Figma style

### 3. Fleet Page (`src/pages/Fleet.tsx`)
- Replace dropdown filters with horizontal **chip/pill toggles** for categories (matching Figma "All Cars / Regular / Luxury" style)
- Keep transmission as chips too
- Vehicle cards: match Figma card style with specs row using icon badges

### 4. Vehicle Detail Page (`src/pages/VehicleDetail.tsx`)
- Feature specs as icon cards in a grid (like Figma: Capacity 5 Seats, Engine 670HP, Max Speed 250km/h style)
- Image with dot carousel indicator (visual dots, single image for now)
- Owner/contact section style (adapted as agency info)

### 5. Reservation Flow -- Step Dates (`src/components/reservation/StepDates.tsx`)
- Use `DatePickerField` for pickup/return dates
- Add icons (MapPin, Calendar, Clock) before each field group
- Wrap in card sections with subtle borders

### 6. Reservation Flow -- Step Driver Info (`src/components/reservation/StepDriverInfo.tsx`)
- Match Figma booking details style: icon-prefixed input fields
- Full-width CTA button on mobile
- Clean card wrapper around the form

### 7. Reservation Flow -- Stepper (`src/pages/Reservation.tsx`)
- Redesign stepper to match Figma: connected dots with labels, filled state for completed steps
- On mobile: compact dot stepper with active label only

### 8. Sidebar (`src/components/reservation/ReservationSidebar.tsx`)
- On mobile: collapsible sticky bottom bar showing total, expandable on tap
- Desktop: keep sticky sidebar with cleaner card styling

### 9. Admin Reservations (`src/pages/admin/AdminReservations.tsx`)
- Replace `<Input type="date">` with `DatePickerField` in edit modal

### 10. Confirmation Page (`src/components/reservation/StepConfirmation.tsx`)
- Match Figma confirmation style: card-based sections with clean dividers

## Files Changed

1. `src/components/ui/date-picker-field.tsx` -- **new**
2. `src/pages/Index.tsx` -- date picker + card restyling
3. `src/pages/Fleet.tsx` -- chip filters + card restyling
4. `src/pages/VehicleDetail.tsx` -- feature icon cards, image dots
5. `src/components/reservation/StepDates.tsx` -- date picker, icons, cards
6. `src/components/reservation/StepDriverInfo.tsx` -- icon-prefixed fields, mobile CTA
7. `src/components/reservation/StepConfirmation.tsx` -- cleaner card style
8. `src/components/reservation/ReservationSidebar.tsx` -- mobile bottom bar
9. `src/pages/Reservation.tsx` -- redesigned stepper, mobile layout
10. `src/pages/admin/AdminReservations.tsx` -- date picker in edit modal

