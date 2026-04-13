

# Fix Admin Reservation Notifications + Color Variant Duplication

## Issue 1: Admin not receiving reservation notifications

There is no "admin notification" email template or trigger. When a website reservation is made, emails are only sent to the customer (confirmation + welcome). No email is sent to the admin's `notification_email` address.

For manual reservations, the admin already knows about them (they created them), so no notification should be sent.

### Changes

1. **Create a new transactional email template** `admin-new-reservation` in `supabase/functions/_shared/transactional-email-templates/` that renders reservation details (customer name, vehicle, dates, total, confirmation ID).

2. **Register it in `registry.ts`** — no fixed `to` field (recipient will be passed dynamically).

3. **In `src/pages/Reservation.tsx`** (website reservations only), after sending customer emails, fetch `notification_email` from `site_settings` and send the `admin-new-reservation` template to that address if it is set and `send_reservation_emails` is true.

4. **Do NOT add admin notification in `ManualReservationDialog.tsx`** — manual reservations should not trigger admin emails.

---

## Issue 2: Color variants duplicating on mobile when editing zoom

The save mutation (lines 190-221) correctly deletes all colors then re-inserts them. But since we made the form stay open after save, the `colorVariants` local state is stale — it still holds entries without proper IDs. The `onSuccess` invalidates the `vehicle_colors` query cache, but the component uses local `colorVariants` state, not a query. So the local state is never refreshed after save.

On mobile, each edit+save keeps the old state while the DB gets new rows. This accumulation leads to apparent "duplicates."

### Changes

In `src/pages/admin/AdminFleet.tsx`, after a successful save when editing, re-fetch the color variants from the database and update local state:

```typescript
onSuccess: async () => {
  qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
  qc.invalidateQueries({ queryKey: ["admin-pricing-tiers"] });
  qc.invalidateQueries({ queryKey: ["vehicle_colors"] });
  toast({ title: editingId ? "Véhicule modifié" : "Véhicule ajouté" });
  if (!editingId) {
    resetForm();
  } else {
    // Re-fetch colors to sync local state with DB
    const { data: freshColors } = await supabase
      .from("vehicle_colors")
      .select("*")
      .eq("vehicle_id", editingId)
      .order("sort_order");
    setColorVariants((freshColors ?? []) as VehicleColor[]);
  }
}
```

---

## Files Modified
- `supabase/functions/_shared/transactional-email-templates/admin-new-reservation.tsx` (new)
- `supabase/functions/_shared/transactional-email-templates/registry.ts`
- `src/pages/Reservation.tsx` — add admin notification email call
- `src/pages/admin/AdminFleet.tsx` — refresh colorVariants state after save

