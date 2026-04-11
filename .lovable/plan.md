

# Advanced Broadcast Email Builder

## Overview
Replace the basic textarea-based email content editor (Step 2) with a rich, block-based email builder that lets the admin compose professional promotional emails with customizable sections, colors, fonts, spacing, and the ability to load from existing email templates.

## Current State
- Step 2 has a plain `<Input>` for subject and a `<Textarea>` for body content
- The `bodyHtml` is sent as plain text to the `promotional-email.tsx` template which renders it inside a fixed layout
- No way to customize colors, fonts, spacing, or structure

## What Changes

### 1. New Component: `src/components/admin/EmailBuilder.tsx`
A block-based email editor component with:

**Template Loader**
- Dropdown to select a starter template (e.g., "Offre spéciale", "Bienvenue", "Parrainage", "Personnalisé")
- Each template pre-fills the blocks with different layouts and content
- "Personnalisé" starts with empty blocks

**Block System**
- Email is composed of ordered blocks, each with a type:
  - `heading` — editable heading text with font size, color, alignment controls
  - `text` — rich paragraph with font size, color, line height, alignment
  - `image` — image URL + alt text + width control
  - `button` — CTA button with label, URL, background color, text color, border radius
  - `divider` — horizontal rule with color and thickness
  - `spacer` — adjustable vertical spacing (8px–64px)
  - `html` — raw HTML textarea for advanced users
- Each block can be reordered (move up/down), duplicated, or deleted
- "Add block" button with block type selector

**Per-Block Style Controls**
- Inline toolbar when a block is selected:
  - Text color picker
  - Background color picker  
  - Font size selector (12–32px)
  - Font weight (normal/bold)
  - Text alignment (left/center/right)
  - Padding controls (top/bottom)

**Global Email Style Controls**
- Collapsible "Style global" panel at the top:
  - Email background color (default: #ffffff)
  - Content area background color
  - Default font family (Poppins, Arial, Georgia, monospace)
  - Default text color
  - Accent color (used for buttons, dividers)

**Live Preview**
- Side-by-side on desktop: editor left, preview right
- Stacked on mobile: editor on top, toggle to preview below
- Preview renders the blocks as styled HTML in an iframe

### 2. Update `src/pages/admin/AdminBroadcast.tsx`
- Replace the `<Textarea>` in Step 2 with the `<EmailBuilder>` component
- The builder outputs structured JSON (blocks array + global styles) stored in `bodyHtml` as a JSON string
- Step 3 (Review) renders the preview using the same rendering logic
- The `handleSend` function passes the rendered HTML to `body_html`

### 3. Update `supabase/functions/send-broadcast/index.ts`
- Detect if `body_html` is JSON (blocks format) vs plain text (legacy)
- If JSON, render the blocks into inline-styled HTML server-side before passing to the email template
- If plain text, pass as-is (backward compatible)

### 4. Update `supabase/functions/_shared/transactional-email-templates/promotional-email.tsx`
- When `bodyHtml` contains rendered HTML from the builder, use `dangerouslySetInnerHTML` is NOT allowed — instead, receive pre-rendered HTML sections and wrap them in React Email components
- Add a new prop `bodyBlocks` (array of rendered HTML strings) as an alternative to `bodyHtml`
- The edge function renders blocks to HTML before passing to the template

### 5. Helper: `src/lib/email-builder-utils.ts`
- `renderBlocksToHtml(blocks, globalStyles)` — converts the block JSON into inline-styled HTML string
- `getStarterTemplates()` — returns predefined template configurations
- Block type definitions and interfaces

## Starter Templates
1. **Offre spéciale** — Header + accent divider + greeting text + promo paragraph + CTA button
2. **Bienvenue** — Header + welcome text + feature list + CTA
3. **Parrainage** — Header + explanation text + two-column coupon display + CTA
4. **Annonce** — Large image header + text + button
5. **Vide** — Empty canvas, just a heading block

## Files to Create/Modify
- **Create**: `src/components/admin/EmailBuilder.tsx` — the main builder component
- **Create**: `src/lib/email-builder-utils.ts` — block rendering + template definitions
- **Modify**: `src/pages/admin/AdminBroadcast.tsx` — integrate the builder in Step 2
- **Modify**: `supabase/functions/send-broadcast/index.ts` — handle blocks JSON rendering
- **Modify**: `supabase/functions/_shared/transactional-email-templates/promotional-email.tsx` — accept pre-rendered HTML sections

## Mobile/Tablet/Desktop
- Desktop: side-by-side editor + preview layout
- Tablet: side-by-side with narrower preview
- Mobile: stacked with a "Modifier / Aperçu" toggle button, full-width block controls with touch-friendly sizing

