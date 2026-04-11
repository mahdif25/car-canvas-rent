

# Make Hero Section More Compact

## Current state
- Hero section: `min-h-[85vh]` on mobile, `min-h-[70vh]` on tablet/desktop
- Inner content padding: `py-12` on mobile, `py-32` on tablet/desktop
- Search bar margin: `mt-6` mobile, `mt-10` desktop
- Search bar padding: `p-4` mobile, `p-8` desktop
- Text spacing: `space-y-4` mobile, `space-y-6` desktop

## Changes — `src/pages/Index.tsx`

### 1. Reduce min-height per breakpoint
```
Before: min-h-[85vh] md:min-h-[70vh]
After:  min-h-[60vh] md:min-h-[50vh] lg:min-h-[55vh]
```

### 2. Reduce container padding
```
Before: py-12 md:py-32
After:  py-8 md:py-16 lg:py-20
```

### 3. Tighten text + search bar spacing
- Text block: `space-y-3 md:space-y-4` (from `space-y-4 md:space-y-6`)
- Search bar margin: `mt-4 md:mt-6` (from `mt-6 md:mt-10`)
- Search bar padding: `p-3 md:p-6` (from `p-4 md:p-8`)

### 4. Update admin preview ratio to match
In `src/pages/admin/AdminSettings.tsx`, update the `heroRatio` to reflect the new min-heights:
```
Before: mobile 0.85, others 0.70
After:  mobile 0.60, tablet 0.50, desktop 0.55
```

## Result
The hero section becomes noticeably shorter on all devices, bringing the search bar and content below the fold into view sooner, while keeping the same layout structure and background media.

