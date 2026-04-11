import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Centre Lux Car"

interface Props {
  recipientName?: string
  bodyHtml?: string
  renderedBodyHtml?: string
  couponCode?: string
  discountAmount?: number
  expiresAt?: string
  friendCouponCode?: string
  friendDiscountAmount?: number
  minTotalPrice?: number | null
  minRentalDays?: number | null
}

const PromotionalEmail = (props: Props) => {
  const {
    recipientName = 'Client',
    bodyHtml = '',
    renderedBodyHtml = '',
    couponCode,
    discountAmount = 0,
    expiresAt,
    friendCouponCode,
    friendDiscountAmount = 0,
    minTotalPrice,
    minRentalDays,
  } = props

  const hasCustomHtml = renderedBodyHtml.length > 0

  const fmt = (n: number) => n.toLocaleString('fr-FR')

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Offre spéciale de {SITE_NAME}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>{SITE_NAME}</Heading>
            <Text style={subtitle}>OFFRE SPÉCIALE</Text>
          </Section>

          <Hr style={accentLine} />

          <Text style={greeting}>Bonjour {recipientName},</Text>

          {bodyHtml && <Text style={text}>{bodyHtml}</Text>}

          {couponCode && (
            <Section style={couponSection}>
              <Text style={couponLabel}>VOTRE CODE PROMO</Text>
              <Text style={couponCodeStyle}>{couponCode}</Text>
              <Text style={couponDiscount}>-{fmt(discountAmount)} MAD sur votre prochaine réservation</Text>
              {expiresAt && (
                <Text style={couponExpiry}>Valable jusqu'au {expiresAt}</Text>
              )}
              {minRentalDays && (
                <Text style={couponExpiry}>Valable pour les réservations de {minRentalDays} jours minimum</Text>
              )}
              {minTotalPrice && (
                <Text style={couponExpiry}>Valable pour les réservations à partir de {fmt(minTotalPrice)} MAD</Text>
              )}
            </Section>
          )}

          {friendCouponCode && (
            <Section style={couponSection}>
              <Text style={couponLabel}>CODE POUR VOTRE AMI(E)</Text>
              <Text style={couponCodeStyle}>{friendCouponCode}</Text>
              <Text style={couponDiscount}>-{fmt(friendDiscountAmount)} MAD pour son premier séjour</Text>
              {expiresAt && (
                <Text style={couponExpiry}>Valable jusqu'au {expiresAt}</Text>
              )}
              {minRentalDays && (
                <Text style={couponExpiry}>Valable pour les réservations de {minRentalDays} jours minimum</Text>
              )}
              {minTotalPrice && (
                <Text style={couponExpiry}>Valable pour les réservations à partir de {fmt(minTotalPrice)} MAD</Text>
              )}
              <Text style={referralNote}>
                Partagez ce code avec un ami — vous bénéficiez tous les deux d'une réduction !
              </Text>
            </Section>
          )}

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button style={button} href="https://centreluxcar.com/fleet">
              Réserver maintenant
            </Button>
          </Section>

          <Hr style={accentLine} />
          <Text style={footer}>{SITE_NAME} • centreluxcar.com</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PromotionalEmail,
  subject: (data: Record<string, any>) => data.subject || `Offre spéciale — ${SITE_NAME}`,
  displayName: 'Email promotionnel',
  previewData: {
    recipientName: 'Mohammed',
    bodyHtml: 'Profitez de notre offre exclusive de la rentrée ! Louez le véhicule de vos rêves à prix réduit.',
    couponCode: 'RENTRÉE-MOHAMMED',
    discountAmount: 200,
    expiresAt: '31 décembre 2026',
    friendCouponCode: 'AMI-MOHAMMED',
    friendDiscountAmount: 150,
    minTotalPrice: 1500,
    minRentalDays: 7,
    subject: 'Offre spéciale rentrée 🚗',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '600px', margin: '0 auto' }
const header = { textAlign: 'center' as const, marginBottom: '20px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1A1A1A', margin: '0', letterSpacing: '1px' }
const subtitle = { fontSize: '13px', fontWeight: '600' as const, color: '#00C853', margin: '4px 0 0', letterSpacing: '1.5px' }
const accentLine = { border: 'none', borderTop: '3px solid #00C853', margin: '20px 0' }
const greeting = { fontSize: '15px', color: '#1A1A1A', margin: '0 0 10px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const couponSection = { background: '#f8f8f8', borderRadius: '10px', padding: '20px', marginBottom: '16px', textAlign: 'center' as const }
const couponLabel = { fontSize: '11px', fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#00C853', margin: '0 0 8px' }
const couponCodeStyle = { fontSize: '28px', fontWeight: '700' as const, color: '#1A1A1A', margin: '0 0 8px', letterSpacing: '2px', fontFamily: 'monospace' }
const couponDiscount = { fontSize: '14px', color: '#00C853', fontWeight: '600' as const, margin: '0 0 4px' }
const couponExpiry = { fontSize: '12px', color: '#999', margin: '0' }
const referralNote = { fontSize: '12px', color: '#666', margin: '10px 0 0', fontStyle: 'italic' as const }
const button = { backgroundColor: '#00C853', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' as const, textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999', textAlign: 'center' as const, margin: '0' }
