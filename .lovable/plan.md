

# Date Input Overhaul + Form Relaxation

## Changes

### 1. Remove CIN Expiration Date from reservation form
Remove the "Date d'expiration CIN" field from both the main driver and additional driver sections in `StepDriverInfo.tsx`. Keep it in the manual reservation dialog (admin may still want it).

### 2. Create a new `DateInputField` component
A text input that accepts `dd/MM/yyyy` format with:
- Auto-insertion of `/` separators as the user types (e.g. typing "15" then "0" becomes "15/0")
- Placeholder guidance text: "JJ/MM/AAAA"
- Validation: only accepts valid calendar dates, rejects invalid input on blur
- Optional `showAge` prop: when true, displays the calculated age next to the field after a valid DOB is entered
- Still stores value as `YYYY-MM-DD` internally (same interface as `DatePickerField`)
- Calendar icon that opens the popover calendar as a secondary input method
- Works on mobile, tablet, and desktop

### 3. Replace all date fields with `DateInputField`
**StepDates.tsx** — pickup date, return date
**StepDriverInfo.tsx** — license delivery date, DOB (with `showAge`), additional driver license delivery date, additional driver DOB (with `showAge`)
**ManualReservationDialog.tsx** — pickup date, return date, license delivery date, DOB (with `showAge`), CIN expiry date, additional driver dates
**DatePickerField** — keep as-is (some places may still use it), but the new component will be the primary date input

### 4. Relax admin manual reservation validation
- Remove email from required fields validation in `handleSubmit`
- Remove phone validation (allow any text, no regex)
- Email field already optional — just ensure the placeholder email fallback still works when empty
- Phone field: remove the `*` label, keep as free text

## Files Modified
- `src/components/ui/date-input-field.tsx` — **new** component with auto-formatting text input + optional calendar popover + age display
- `src/components/reservation/StepDriverInfo.tsx` — remove CIN expiration fields (main + additional driver), replace `type="date"` inputs with `DateInputField`, add `showAge` on DOB fields
- `src/components/reservation/StepDates.tsx` — replace `DatePickerField` with `DateInputField`
- `src/components/admin/ManualReservationDialog.tsx` — replace all date inputs with `DateInputField`, relax phone/email validation, remove phone `*` requirement

## Technical Detail: DateInputField

```typescript
interface DateInputFieldProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showAge?: boolean; // displays "XX ans" after valid DOB
  className?: string;
}
```

Auto-format logic on `onChange`:
- Strip non-digits, limit to 8 digits
- Insert `/` after positions 2 and 4 → `dd/MM/yyyy`
- On blur: parse `dd/MM/yyyy`, validate it's a real date, convert to `YYYY-MM-DD` and call `onChange`
- If invalid, show a red error hint and clear the value

Age calculation (when `showAge=true`):
- `differenceInYears(new Date(), parsedDate)` from date-fns
- Displayed as a small badge: "23 ans"

