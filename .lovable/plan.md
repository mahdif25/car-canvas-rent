

# Insurance Expense, Credit Editing, Homepage Card Navigation

## 4 Changes

### 1. Add "Assurance" to expense categories (`src/hooks/useFleetExpenses.ts`)
Add `{ value: "insurance", label: "Assurance" }` to `EXPENSE_CATEGORIES` array.

### 2. Edit credits — change plate (immatriculation) and all fields (`src/pages/admin/AdminFinances.tsx`)
- Import `useUpdateLoan` from `useFleetLoans`
- Add `editingLoan` state and an edit dialog (reuse same form fields as the add dialog)
- Pre-fill form with existing loan data when editing
- Add an edit (Pencil) button next to the delete button in both mobile cards and desktop table rows
- On save, call `updateLoan.mutate()` with the updated fields including `plate_id`

### 3. Homepage vehicle cards — click card → vehicle detail, click "Réserver" → reservation (`src/pages/Index.tsx`)
Currently the entire card is wrapped in a `<Link to="/reservation?vehicle=...">`. Change to:
- Wrap the card in `<Link to={`/fleet/${v.slug || v.id}`}>` so clicking anywhere goes to the vehicle detail page
- Change the "Réserver" button to use `onClick` with `e.preventDefault()` + `e.stopPropagation()` and navigate to `/reservation?vehicle=${v.id}&color=${selectedColorId}`
- This way: card click → detail page, "Réserver" click → reservation page

### 4. Responsive
- Edit dialog uses same responsive grid as the add dialog (works on all devices)
- Edit button visible on both mobile cards and desktop table
- Homepage card behavior works on all devices (tap card → detail, tap Réserver → reservation)

## Files Modified
- `src/hooks/useFleetExpenses.ts` — add insurance category
- `src/pages/admin/AdminFinances.tsx` — credit edit functionality
- `src/pages/Index.tsx` — card navigation split

## No database changes needed

