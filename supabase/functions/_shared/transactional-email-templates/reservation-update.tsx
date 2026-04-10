import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Centre Lux Car"

interface Props {
  customerName?: string
  confirmationId?: string
  vehicleName?: string
  pickupDate?: string
  returnDate?: string
  pickupLocation?: string
  returnLocation?: string
  rentalDays?: number
  dailyRate?: number
  vehicleTotal?: number
  addonsDetails?: { name: string; total: number }[]
  deliveryFee?: number
  depositAmount?: number
  totalPrice?: number
  status?: string
}

const ReservationUpdateEmail = (props: Props) => {
  const {
    customerName = 'Client',
    confirmationId = '--------',
    vehicleName = '',
    pickupDate = '',
    returnDate = '',
    pickupLocation = '',
    returnLocation = '',
    rentalDays = 0,
    dailyRate = 0,
    vehicleTotal = 0,
    addonsDetails = [],
    deliveryFee = 0,
    depositAmount = 0,
    totalPrice = 0,
    status = 'pending',
  } = props

  const fmt = (n: number) => n.toLocaleString('fr-FR')

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Mise à jour de votre réservation {confirmationId} — {SITE_NAME}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>{SITE_NAME}</Heading>
            <Text style={subtitle}>MISE À JOUR DE RÉSERVATION</Text>
          </Section>

          <Hr style={accentLine} />

          <Text style={greeting}>Bonjour {customerName},</Text>
          <Text style={text}>
            Votre réservation <strong>N° {confirmationId}</strong> a été mise à jour. Voici les détails actualisés :
          </Text>

          <Section style={section}>
            <Text style={sectionTitle}>DÉTAILS MIS À JOUR</Text>
            <Text style={rowStyle}>Véhicule : <strong>{vehicleName}</strong></Text>
            <Text style={rowStyle}>Du : <strong>{pickupDate}</strong></Text>
            <Text style={rowStyle}>Au : <strong>{returnDate}</strong></Text>
            <Text style={rowStyle}>Prise en charge : <strong>{pickupLocation}</strong></Text>
            {returnLocation && returnLocation !== pickupLocation && (
              <Text style={rowStyle}>Retour : <strong>{returnLocation}</strong></Text>
            )}
            <Text style={rowStyle}>Durée : <strong>{rentalDays} jour{rentalDays > 1 ? 's' : ''}</strong></Text>
            <Text style={rowStyle}>Statut : <strong>{status}</strong></Text>
          </Section>

          <Section style={section}>
            <Text style={sectionTitle}>TARIFICATION</Text>
            <Text style={rowStyle}>Véhicule ({rentalDays}j × {fmt(dailyRate)} MAD) : <strong>{fmt(vehicleTotal)} MAD</strong></Text>
            {addonsDetails.map((a, i) => (
              <Text key={i} style={rowStyle}>{a.name} : <strong>{fmt(a.total)} MAD</strong></Text>
            ))}
            {deliveryFee > 0 && (
              <Text style={rowStyle}>Frais de livraison : <strong>{fmt(deliveryFee)} MAD</strong></Text>
            )}
            <Hr style={divider} />
            <Text style={rowStyle}>Caution : <strong>{fmt(depositAmount)} MAD</strong></Text>
            <Text style={totalRow}>TOTAL : <strong style={{ color: '#00C853' }}>{fmt(totalPrice)} MAD</strong></Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button style={button} href="https://centreluxcar.com/suivi-reservation">
              Suivre ma réservation
            </Button>
          </Section>

          <Hr style={accentLine} />
          <Text style={footer}>Merci pour votre confiance !</Text>
          <Text style={footerSmall}>{SITE_NAME} • centreluxcar.com</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ReservationUpdateEmail,
  subject: (data: Record<string, any>) => `Mise à jour de votre réservation N° ${data.confirmationId || ''}`,
  displayName: 'Mise à jour de réservation',
  previewData: {
    customerName: 'Mohammed',
    confirmationId: 'AB12CD34',
    vehicleName: 'Dacia Duster 2024',
    pickupDate: '16 janvier 2025',
    returnDate: '20 janvier 2025',
    pickupLocation: 'Aéroport Mohammed V',
    returnLocation: 'Casablanca Centre',
    rentalDays: 4,
    dailyRate: 320,
    vehicleTotal: 1280,
    addonsDetails: [],
    deliveryFee: 100,
    depositAmount: 3000,
    totalPrice: 1380,
    status: 'Confirmée',
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
const section = { background: '#f8f8f8', borderRadius: '10px', padding: '18px 22px', marginBottom: '16px' }
const sectionTitle = { fontSize: '11px', fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#00C853', margin: '0 0 12px' }
const rowStyle = { fontSize: '13px', color: '#333', margin: '0 0 6px', lineHeight: '1.5' }
const divider = { border: 'none', borderTop: '1px solid #ddd', margin: '12px 0' }
const totalRow = { fontSize: '16px', fontWeight: '700' as const, color: '#1A1A1A', margin: '10px 0 0' }
const button = { backgroundColor: '#00C853', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' as const, textDecoration: 'none' }
const footer = { fontSize: '14px', fontWeight: '500' as const, color: '#1A1A1A', textAlign: 'center' as const, margin: '0 0 4px' }
const footerSmall = { fontSize: '12px', color: '#999', textAlign: 'center' as const, margin: '0' }
