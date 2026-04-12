

# Agency Summary — Period Selector & All-Reservations Report Download

## What Changes

In the "Résumé agence" tab of AdminFinances, add:

1. **Period selector** — two DatePickerField inputs (start/end date) at the top of the tab, defaulting to last 12 months → today
2. **Filter all summary data by period** — the summary table rows (expenses, revenue, net) will be scoped to the selected period instead of showing all-time totals
3. **Download button** — "Télécharger le rapport" button that opens a printable window containing:
   - Agency name, selected period
   - Summary table (all plates with loan monthly, expenses, revenue, net for the period)
   - Agency totals row
   - Full list of all reservations across all vehicles within the period, each showing: reservation ID (8-char), plate number, pickup date, return date, days, amount paid (no customer personal details)

## Technical Details

### File: `src/pages/admin/AdminFinances.tsx`

- Add `summaryStartDate` / `summaryEndDate` state (default: 12 months ago → today)
- Place two `DatePickerField` + a `Download` button in a flex row above the summary table
- Filter `summaryRows` computation: scope `pExpenses` and `pReservations` by the selected period
- Build a `allReservationsInPeriod` list from `reservations` filtered by period, joined with plate info
- `handleDownloadAgencyReport()`: opens `window.open()` with a styled HTML page containing the summary table + all reservations table, then calls `print()`

### Responsive
- Period selectors + download button: stacked on mobile, inline row on desktop

