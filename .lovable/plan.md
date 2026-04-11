

# Fix Scroll & Auto-Insert Coupon Block

## Problems
1. **Scroll**: `ScrollArea` has `max-h-[50vh]` but `addBlock` never scrolls to the new block — it's added off-screen.
2. **Coupon placement**: Coupon section is appended at the bottom by the email template, outside the builder's control. User wants to position it within the email and see it in the preview.

## Changes

### 1. `src/lib/email-builder-utils.ts`
- Add a new block type `'coupon'` to `EmailBlock['type']`
- Add coupon-related fields to `BlockSettings`: `couponMode`, `discountAmount`, `couponPrefix`, `friendDiscountAmount`, `expiresAt`, `minTotalPrice`, `minRentalDays`
- Update `createBlock('coupon')` to return a placeholder coupon block
- Update `renderBlocksToHtml` to render the coupon block as a styled coupon card (matching the promotional-email.tsx styles: grey background, code placeholder, discount text)

### 2. `src/components/admin/EmailBuilder.tsx`
- **Scroll fix**: After `addBlock`, use a `useEffect` + ref to scroll the ScrollArea viewport to the bottom when blocks length increases
- **Coupon block**: Add `'coupon'` to `BLOCK_TYPE_OPTIONS` but do NOT show it in the "add block" menu — it's only added/removed programmatically
- Accept new props: `couponMode`, `discountAmount`, `couponPrefix`, `friendDiscountAmount`, `couponExpiresAt`, `minTotalPrice`, `minRentalDays`
- When `couponMode` changes from `'none'` to something else: auto-insert a coupon block (if not already present)
- When `couponMode` changes to `'none'`: auto-remove any coupon block
- Coupon block editor: read-only label saying "Bloc coupon — configuré depuis le mode coupon ci-dessous", with move up/down buttons to reposition it but no delete/edit
- Render coupon block in preview with placeholder values (e.g. `{PREFIX}-{NOM}`, discount amount)

### 3. `src/pages/admin/AdminBroadcast.tsx`
- Pass coupon-related state as props to `<EmailBuilder>`: `couponMode`, `discountAmount`, `couponPrefix`, `friendDiscountAmount`, `couponExpiresAt`, `minTotalPrice`, `minRentalDays`
- Update `handleSend`: when rendering HTML, strip the coupon block from builder output (server handles actual coupon rendering with real codes), OR pass coupon block position info so the server inserts it at the right place

### 4. `supabase/functions/send-broadcast/index.ts`
- When `body_html` contains a coupon placeholder marker (e.g. `<!--COUPON_BLOCK-->`), split the HTML and insert the real coupon section at that position instead of appending at the end

### 5. `supabase/functions/_shared/transactional-email-templates/promotional-email.tsx`
- Update builder-generated path: instead of always appending coupon after `renderedBodyHtml`, look for `<!--COUPON_BLOCK-->` marker and place coupon there. If no marker, fall back to appending at end.

## Summary
5 files modified. Scroll fix is a simple auto-scroll on block add. Coupon block is a special non-editable, repositionable placeholder that syncs with the coupon mode selector and renders in preview with sample data.

