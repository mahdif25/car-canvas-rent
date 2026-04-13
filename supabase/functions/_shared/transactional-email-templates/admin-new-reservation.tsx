import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Centre Lux Car"

interface Props {
  confirmationId?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  vehicleName?: string
  pickupDate?: string
  returnDate?: string
  pickupLocation?: string
  returnLocation?: string
  rentalDays?: number
  totalPrice?: number
  depositAmount?: number
  deliveryFee?: number
  discountAmount?: number
}

const AdminNewReservationEmail = (props: Props) => {
  const {
    confirmationId = '--------',
    customerName = 'Client',
    customerEmail = '',
    customerPhone = '',
    vehicleName = '',
    pickupDate = '',
    returnDate = '',
    pickupLocation = '',
    returnLocation = '',
    rentalDays = 0,
    totalPrice = 0,
    depositAmount = 0,
    deliveryFee = 0,
    discountAmount = 0,
  } = props

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Nouvelle réservation #{confirmationId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <div style={header}>
            <Heading style={h1}>{SITE_NAME}</Heading>
            <Text style={subtitle}>NOUVELLE RÉSERVATION</Text>
          </div>
          <Hr style={accentLine} />

          <Text style={greeting}>
            Une nouvelle réservation a été effectuée sur le site.
          </Text>

          <Section style={section}>
            <Text style={sectionTitle}>Référence</Text>
            <Text style={row}><strong>ID :</strong> {confirmationId}</Text>
          </Section>

          <Section style={section}>
            <Text style={sectionTitle}>Client</Text>
            <Text style={row}><strong>Nom :</strong> {customerName}</Text>
            <Text style={row}><strong>Email :</strong> {customerEmail}</Text>
            <Text style={row}><strong>Tél :</strong> {customerPhone}</Text>
          </Section>

          <Section style={section}>
            <Text style={sectionTitle}>Détails de la location</Text>
            <Text style={row}><strong>Véhicule :</strong> {vehicleName}</Text>
            <Text style={row}><strong>Du :</strong> {pickupDate}</Text>
            <Text style={row}><strong>Au :</strong> {returnDate}</Text>
            <Text style={row}><strong>Durée :</strong> {rentalDays} jour{rentalDays > 1 ? 's' : ''}</Text>
            <Text style={row}><strong>Lieu prise en charge :</strong> {pickupLocation}</Text>
            <Text style={row}><strong>Lieu retour :</strong> {returnLocation}</Text>
          </Section>

          <Section style={section}>
            <Text style={sectionTitle}>Montants</Text>
            {deliveryFee > 0 && <Text style={row}><strong>Livraison :</strong> {deliveryFee} MAD</Text>}
            {discountAmount > 0 && <Text style={row}><strong>Réduction :</strong> -{discountAmount} MAD</Text>}
            <Text style={row}><strong>Caution :</strong> {depositAmount} MAD</Text>
            <Hr style={divider} />
            <Text style={totalRow}><strong>Total :</strong> {totalPrice} MAD</Text>
          </Section>

          <Hr style={accentLine} />
          <Text style={footer}>— {SITE_NAME}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AdminNewReservationEmail,
  subject: (data: Record<string, any>) => `Nouvelle réservation #${data.confirmationId || ''}`,
  displayName: 'Notification admin – nouvelle réservation',
  previewData: {
    confirmationId: 'A1B2C3D4',
    customerName: 'Mohammed Ali',
    customerEmail: 'mohammed@example.com',
    customerPhone: '+212 600 000 000',
    vehicleName: 'Dacia Logan',
    pickupDate: '15 janvier 2025',
    returnDate: '20 janvier 2025',
    pickupLocation: 'Casablanca',
    returnLocation: 'Casablanca',
    rentalDays: 5,
    totalPrice: 1500,
    depositAmount: 3000,
    deliveryFee: 0,
    discountAmount: 0,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '600px', margin: '0 auto' }
const header = { textAlign: 'center' as const, marginBottom: '20px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1A1A1A', margin: '0', letterSpacing: '1px' }
const subtitle = { fontSize: '13px', fontWeight: '600' as const, color: '#00C853', margin: '4px 0 0', letterSpacing: '1.5px' }
const accentLine = { border: 'none', borderTop: '3px solid #00C853', margin: '20px 0' }
const greeting = { fontSize: '15px', color: '#1A1A1A', margin: '0 0 10px' }
const section = { background: '#f8f8f8', borderRadius: '10px', padding: '18px 22px', marginBottom: '16px' }
const sectionTitle = { fontSize: '11px', fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#00C853', margin: '0 0 12px' }
const row = { fontSize: '13px', color: '#333', margin: '0 0 6px', lineHeight: '1.5' }
const divider = { border: 'none', borderTop: '1px solid #ddd', margin: '12px 0' }
const totalRow = { fontSize: '16px', fontWeight: '700' as const, color: '#1A1A1A', margin: '10px 0 0' }
const footer = { fontSize: '14px', fontWeight: '500' as const, color: '#1A1A1A', textAlign: 'center' as const, margin: '0' }
