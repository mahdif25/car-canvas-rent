

# Make Featured Cars Section More Compact

## Changes to `src/pages/Index.tsx`

Reduce spacing and sizing throughout the featured vehicles section:

1. **Section padding**: `py-16` → `py-10`
2. **Title margin**: `mb-10` → `mb-6`, title size `text-3xl` → `text-2xl`
3. **Card header**: `p-5 pb-0` → `p-4 pb-0`, title `text-lg` → `text-base`
4. **Image area**: `mx-5 mt-4 h-44` → `mx-4 mt-3 h-36`, reduce inner padding `p-4` → `p-2`
5. **Features + price area**: `p-5 space-y-4` → `p-4 space-y-3`, icon size `14` → `12`, gap `gap-3` → `gap-2`
6. **Price**: `text-2xl` → `text-xl`, CTA button padding `px-4 py-2` → `px-3 py-1.5`
7. **Grid gap**: `gap-6` → `gap-4`

Single file change, all in `src/pages/Index.tsx`.

