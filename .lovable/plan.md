

# Keep Edit Form Open After Save

## Problem
When clicking "Modifier" to save changes while editing a vehicle, `resetForm()` is called in the mutation's `onSuccess`, which closes the form and returns to the fleet table. You want saving to keep the form open so you can continue adjusting, and only leave when you click "Annuler" (back).

## Changes

### `src/pages/admin/AdminFleet.tsx`

1. **Split save behavior for edit vs. create**:
   - In `saveMutation.onSuccess`: if `editingId` is set (editing), show a success toast but do **not** call `resetForm()` — keep the form open with updated data
   - If creating a new vehicle (no `editingId`), call `resetForm()` as before

2. **Rename "Annuler" to "Retour" when editing** to clarify it's the back button to the fleet table

3. **After a successful edit save**, re-sync the form state from the freshly fetched data (via query invalidation) so the form reflects any server-side changes — or simply keep existing form state since it already has the latest values

### Logic change (line ~228-229):
```typescript
// Before:
onSuccess: () => {
  qc.invalidateQueries({ queryKey: ["vehicles"] });
  toast({ title: editingId ? "Véhicule modifié" : "Véhicule ajouté" });
  resetForm();
}

// After:
onSuccess: () => {
  qc.invalidateQueries({ queryKey: ["vehicles"] });
  toast({ title: editingId ? "Véhicule modifié" : "Véhicule ajouté" });
  if (!editingId) resetForm(); // Only close form for new vehicles
}
```

### Button label (line ~779):
```typescript
// Change "Annuler" to "Retour" when editing
<Button variant="outline" onClick={resetForm}>
  {editingId ? "Retour" : "Annuler"}
</Button>
```

## Files Modified
- `src/pages/admin/AdminFleet.tsx`

