

# Per-Car Report Period Selector & Download + Reservations Search & Date Filter

## Part 1 — AdminFinances: Period Selection & Downloadable Report

### Period Selector
- Add `reportStartDate` and `reportEndDate` state (default: 12 months ago → today)
- Place two `DatePickerField` inputs next to the vehicle selector in the "Rapport par véhicule" tab
- All charts, KPIs, and reservation data in the per-car report filter by this date range instead of hardcoded "last 12 months" / "current month"

### Reservation Breakdown Table
- Below the 4 charts, add a table listing all reservations for the selected plate within the period:
  - Reservation ID (first 8 chars uppercase), start date, end date, number of days, amount paid
  - No customer personal details (no name, email, phone, license)

### Download Report as PDF
- Add a "Télécharger le rapport" button
- Uses `window.print()` on a styled printable view (same approach as the receipt printer) containing:
  - Vehicle info (plate, brand, model)
  - Period selected
  - KPI summary (loan monthly, expenses, revenue, net)
  - All 4 charts rendered as static content
  - Reservation breakdown table
- The print view opens in a new window with `@media print` styles

## Part 2 — AdminReservations: Search, Reservation ID & Date Filter

### Reservation ID Display
- Show the reservation ID (first 8 chars, uppercase) in each reservation row — both desktop and mobile layouts
- Positioned prominently near the customer name

### Search Bar
- Add a search `Input` with placeholder "Rechercher par ID, nom, email, permis, passeport..."
- Filter reservations client-side by matching against: `id` (short), `customer_first_name`, `customer_last_name`, `customer_email`, `customer_phone`, `customer_license`
- Place it in the header bar next to the status filter

### Date Range Filter
- Add two `DatePickerField` inputs for filtering reservations by pickup date range
- Filter applied client-side alongside status and search filters
- On mobile: filters stack vertically; on desktop: inline row

## Files to Modify
- **`src/pages/admin/AdminFinances.tsx`**: add period selector, reservation breakdown table, download button
- **`src/pages/admin/AdminReservations.tsx`**: add search input, reservation ID display, date range filter

## Responsive
- Finances period selectors: stacked on mobile, inline on desktop
- Reservations search + filters: stacked on mobile, inline row on desktop

