

# Add Comprehensive Privacy Policy for Centre Lux Car

## What
Populate the Privacy Policy page (`/politique-confidentialite`) with a complete, professionally written privacy policy in French tailored to:
- Car rental business (Centre Lux Car, centreluxcar.com)
- Social media advertising compliance (Facebook/Meta Lead Ads, TikTok, Google)
- RGPD/Morocco data protection law (Loi 09-08)
- Customer data collection during reservations

## Approach
Follow the same pattern as `ConditionsGenerales.tsx` — add a `defaultContent` constant with full HTML, used as fallback when `privacy_policy_html` is empty in site settings. This means admins can still override it later from the settings panel.

## Policy Sections
1. **Identité du responsable** — Centre Lux Car, centreluxcar.com, contact info from site settings
2. **Données collectées** — Name, phone, email, CIN/passport, driver's license, IP, cookies, location preferences
3. **Finalités du traitement** — Reservation management, vehicle delivery, invoicing, marketing communications
4. **Base légale** — Contract execution, consent (marketing), legitimate interest
5. **Publicité sur les réseaux sociaux** — Facebook/Instagram Lead Ads, TikTok Pixel, Google Analytics, how data flows from ad platforms, retargeting practices
6. **Cookies et technologies de suivi** — Facebook Pixel, TikTok Pixel, Google Analytics/GTM, cookie consent
7. **Partage des données** — Insurance partners, payment processors, Meta/Google/TikTok (ad platforms), no sale of data
8. **Durée de conservation** — Rental records, marketing consent, lead data retention periods
9. **Droits des utilisateurs** — Access, rectification, deletion, opposition, portability (per Loi 09-08 / RGPD)
10. **Sécurité des données** — Encryption, secure storage, access controls
11. **Communications commerciales** — Newsletter opt-in, unsubscribe mechanism, WhatsApp messaging consent
12. **Transfert international** — Data processed via cloud services (Meta, Google), safeguards
13. **Mineurs** — Service restricted to 21+ (driver age requirement)
14. **Modifications** — Policy update notification process
15. **Contact** — Email, phone, address from site settings

## File Modified
- `src/pages/PrivacyPolicy.tsx` — Add `defaultContent` HTML constant with all sections, use as fallback (same pattern as ConditionsGenerales)

