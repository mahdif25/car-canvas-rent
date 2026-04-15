

# Enhance Admin Content Tab with Editable Privacy Policy & Auto-Populated Contact Info

## What
Improve the Content tab in Admin Settings so:
1. The Privacy Policy editor shows the full default content pre-filled (not an empty textarea) when `privacy_policy_html` is empty — so admins can see and edit the actual text
2. Contact info (phone, email, address) from the Footer section is automatically injected into the Privacy Policy's "Contact" section when rendering
3. The same treatment applies to Conditions Générales and Caution Policy (pre-fill defaults)
4. A "Réinitialiser au contenu par défaut" (reset to default) button for each legal page

## Approach

### File: `src/pages/admin/AdminSettings.tsx`
- For each legal content textarea (Privacy Policy, Conditions Générales, Caution Policy):
  - Import the `defaultContent` constants from their respective page files (or extract them to shared constants)
  - Pre-fill the textarea with the default content when the saved value is empty, so admins can see and edit the actual text
  - Add a "Reset to default" button that clears the saved HTML (reverting to the hardcoded default)
  - Add a helper note: "Les informations de contact (email, téléphone, adresse) sont automatiquement tirées des champs Footer ci-dessus"

### File: `src/pages/PrivacyPolicy.tsx`
- Extract `defaultContent` to a named export so it can be imported by AdminSettings
- In the Contact section (section 15), dynamically replace placeholder values with `settings.footer_email`, `settings.footer_phone`, `settings.footer_address` — this already happens in the JSX contact card, but should also be injected into the HTML content itself using string replacement before rendering

### File: `src/pages/ConditionsGenerales.tsx` & `src/pages/CautionPolicy.tsx`
- Same pattern: export `defaultContent` as a named constant

### Shared utility: `src/lib/legal-content-defaults.ts`
- Move all three `defaultContent` constants here to keep pages and admin settings clean
- Export a helper `injectContactInfo(html, settings)` that replaces placeholder tokens like `{{phone}}`, `{{email}}`, `{{address}}` in the HTML with actual site settings values

## Changes Summary

| File | Change |
|------|--------|
| `src/lib/legal-content-defaults.ts` | New file — three default HTML constants + `injectContactInfo` helper |
| `src/pages/PrivacyPolicy.tsx` | Import defaults from shared file, use `injectContactInfo` before rendering |
| `src/pages/ConditionsGenerales.tsx` | Import defaults from shared file |
| `src/pages/CautionPolicy.tsx` | Import defaults from shared file |
| `src/pages/admin/AdminSettings.tsx` | Pre-fill textareas with defaults, add reset buttons, add contact info note |

## Technical Details
- Contact placeholders in default HTML: `{{footer_phone}}`, `{{footer_email}}`, `{{footer_address}}`
- `injectContactInfo()` does simple string `.replace()` on these tokens before `dangerouslySetInnerHTML`
- Reset button sets the field to `""` (empty string) and saves, which makes the page fall back to `defaultContent`
- Textarea shows `defaultContent` when saved value is empty, but saving that text writes it to the DB (so future edits persist)
- All responsive — textareas and buttons work on mobile/tablet/desktop

