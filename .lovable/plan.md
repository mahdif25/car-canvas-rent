

# Agency Financial Dashboard — Loans, Analytics & Visual Reports

## Overview
Create a dedicated `/admin/finances` page for managing bank loans per vehicle, tracking agency-wide financials, and generating per-car visual reports with charts showing monthly earnings, rental days, idle days, and expense breakdowns.

## Database Changes

**New table: `fleet_loans`**
- `id` uuid PK default gen_random_uuid()
- `plate_id` uuid NOT NULL (references fleet_plates conceptually)
- `bank_name` text NOT NULL
- `loan_amount` numeric NOT NULL
- `monthly_payment` numeric NOT NULL
- `loan_duration_months` integer NOT NULL
- `start_date` date NOT NULL
- `interest_rate` numeric DEFAULT 0
- `remaining_amount` numeric NOT NULL
- `notes` text nullable
- `is_active` boolean DEFAULT true
- `created_at` timestamptz DEFAULT now()

RLS: admin-only ALL policy using `has_role(auth.uid(), 'admin')`

## Page Sections (`AdminFinances.tsx`)

### Section 1 — Agency Overview Cards
- Total monthly loan payments, total loan balance, monthly expenses, monthly revenue, net monthly profit

### Section 2 — Loan Management
- Table of all loans with CRUD (add/edit/delete)
- **Loan Simulator**: input fields for a hypothetical new loan showing projected total monthly payment

### Section 3 — Per-Car Financial Report with Charts
When a plate is selected from a dropdown, display:
- Loan details card (bank, monthly payment, remaining, months left)
- Expenses breakdown by category
- Revenue from reservations assigned to that plate
- Net profit/loss

**Charts (using Recharts, already installed):**
- **Monthly Earnings Bar Chart**: revenue per month for the selected car over the last 12 months
- **Rental Utilization Donut Chart**: days rented vs. days idle in the selected month
- **Expense Category Pie Chart**: breakdown of cleaning, oil change, repair, parts, other
- **Monthly Progress Line Chart**: cumulative revenue vs. cumulative expenses+loan over time, showing financial trajectory

Each chart is interactive with tooltips using the existing `ChartContainer`/`ChartTooltip` components.

### Section 4 — Agency Summary Table
- All plates listed: plate, brand/model, loan monthly, expenses total, revenue total, net profit
- Totals row at bottom

## Files to Create
- **Migration**: create `fleet_loans` table with RLS
- **`src/hooks/useFleetLoans.ts`**: query, add, update, delete hooks
- **`src/pages/admin/AdminFinances.tsx`**: full page with all 4 sections + charts

## Files to Modify
- **`src/App.tsx`**: add route `/admin/finances`
- **`src/components/admin/AdminLayout.tsx`**: add "Finances" nav item with `Banknote` icon

## Chart Details

The per-car report charts pull data from:
- `reservations` (filtered by `assigned_plate_id`) for revenue and rental days
- `fleet_expenses` (filtered by `plate_id`) for expense amounts and categories
- `fleet_loans` (filtered by `plate_id`) for loan cost overlay

Month selector allows viewing any month's breakdown. Default: current month.

## Responsive
- Overview cards: 2 cols mobile, 3 tablet, 5 desktop
- Charts: full-width stacked on mobile, 2x2 grid on desktop
- Loan table and summary table: horizontal scroll on mobile
- Per-car report: stacked on mobile, side-by-side cards + charts on desktop

