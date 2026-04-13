

# Reconstruct Color Variants Editor

## Problem
The current color variant editor has two issues:
1. **Duplication bug**: The "delete all + re-insert" save pattern silently fails on delete (RLS or timing), causing rows to accumulate with every save
2. **Poor UX**: All 5 placements x 3 devices = 15 sliders crammed into a collapsible per color, making it hard to use especially on mobile

## New Design

### Architecture: Extract to a dedicated component
Extract the color variant editor into `src/components/admin/fleet/ColorVariantEditor.tsx`. This keeps `AdminFleet.tsx` manageable and isolates the color editing logic.

### UI Layout per Color Variant
Each color variant card will have:
- **Top row**: Color name input, hex picker, default toggle, delete button, image upload
- **Bottom section** (always visible when image exists): A two-panel layout
  - **Left panel**: Device selector tabs (Desktop / Tablet / Mobile) + Placement selector tabs (Accueil / Flotte / Détail / Réservation / Sidebar) + Zoom slider for the active combination
  - **Right panel**: Live preview showing the image at the selected placement dimensions, scaled for the selected device

This means the admin selects ONE placement + ONE device at a time, adjusts the zoom, and sees the preview immediately. No more 15 sliders visible at once.

### Fix the Duplication Bug
Replace the "delete all then insert all" pattern with an **upsert** approach:
1. For existing colors (those with a valid `id` from the DB), use `UPDATE`
2. For new colors (no `id`), use `INSERT`
3. For removed colors (IDs that were in the original set but no longer in the local state), use `DELETE` with specific IDs
4. Track the original color IDs when entering edit mode to know which ones were removed

### Save Flow
```text
editVehicle() → load colors from DB → store original IDs
user edits/adds/removes colors
save():
  1. Compute removed IDs = original IDs - current IDs
  2. DELETE only removed IDs
  3. UPSERT remaining (insert new, update existing)
  4. Re-fetch fresh colors into local state
```

## Files Modified
- `src/components/admin/fleet/ColorVariantEditor.tsx` — **new** component with the redesigned per-color editor (placement/device selector, single slider, live preview)
- `src/pages/admin/AdminFleet.tsx` — replace inline color variant code (lines 534-723) with `<ColorVariantEditor />`, change save logic from delete-all/insert-all to targeted upsert, track original color IDs

## Technical Details

### ColorVariantEditor Props
```typescript
interface Props {
  colorVariants: ColorVariantState[];
  onChange: (variants: ColorVariantState[]) => void;
}
```

### Save mutation change (AdminFleet.tsx)
```typescript
// Instead of:
await supabase.from("vehicle_colors").delete().eq("vehicle_id", vehicleId);
await supabase.from("vehicle_colors").insert(colorInserts);

// Do:
const removedIds = originalColorIds.filter(id => !currentIds.includes(id));
if (removedIds.length > 0) {
  await supabase.from("vehicle_colors").delete().in("id", removedIds);
}
for (const color of validColors) {
  if (color.id) {
    await supabase.from("vehicle_colors").update({...}).eq("id", color.id);
  } else {
    await supabase.from("vehicle_colors").insert({...});
  }
}
```

