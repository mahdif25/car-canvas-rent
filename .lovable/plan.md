

# Upload Vehicle Images from Admin Panel

## Overview
Replace the URL text inputs for both the main image and gallery images with file upload buttons. Files get uploaded to the existing `vehicle-images` storage bucket, and the resulting public URL is saved to the database.

## Changes

### 1. Add RLS policies for storage bucket (`migration`)
Add storage policies so authenticated admins can upload/delete files in the `vehicle-images` bucket:
```sql
CREATE POLICY "Admins can upload vehicle images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete vehicle images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'vehicle-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view vehicle images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'vehicle-images');
```

### 2. Update AdminFleet.tsx
- Add an `uploadImage` helper function that uploads a file to `vehicle-images/{vehicleId or timestamp}/{filename}` via `supabase.storage` and returns the public URL
- **Main image**: Replace the URL text input with a file input + upload button. Show a thumbnail preview of the current image. Keep the URL input as a fallback (collapsible "ou coller un lien")
- **Gallery images**: Replace each URL input with a file upload area. Show thumbnail previews. Keep "coller un lien" as fallback option
- Add loading states during upload
- Add a delete button on each thumbnail that removes the file from storage

### Files
- `supabase/migrations/` (new migration for storage RLS)
- `src/pages/admin/AdminFleet.tsx`

