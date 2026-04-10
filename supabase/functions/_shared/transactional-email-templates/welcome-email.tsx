import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Centre Lux Car"

interface Props {
  customerName?: string
}

const WelcomeEmail = ({ customerName = 'Client' }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Bienvenue chez {SITE_NAME} !</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>{SITE_NAME}</Heading>
        </Section>

        <Hr style={accentLine} />

        <Heading style={h2}>Bienvenue, {customerName} ! 🎉</Heading>

        <Text style={text}>
          Merci d'avoir choisi {SITE_NAME} pour votre location de voiture au Maroc.
          Nous sommes ravis de vous compter parmi nos clients.
        </Text>

        <Text style={text}>
          Avec {SITE_NAME}, vous bénéficiez de :
        </Text>

        <Section style={section}>
          <Text style={listItem}>✅ Des véhicules récents et bien entretenus</Text>
          <Text style={listItem}>✅ Un service client disponible 7j/7</Text>
          <Text style={listItem}>✅ Des tarifs transparents sans frais cachés</Text>
          <Text style={listItem}>✅ La livraison à l'aéroport ou à domicile</Text>
        </Section>

        <Text style={text}>
          Vous pouvez suivre votre réservation à tout moment en utilisant votre numéro de réservation et votre email.
        </Text>

        <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
          <Button style={button} href="https://centreluxcar.com/fleet">
            Découvrir notre flotte
          </Button>
        </Section>

        <Hr style={accentLine} />
        <Text style={footer}>Merci pour votre confiance !</Text>
        <Text style={footerSmall}>{SITE_NAME} • centreluxcar.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: `Bienvenue chez ${SITE_NAME} !`,
  displayName: 'Email de bienvenue',
  previewData: { customerName: 'Mohammed' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '600px', margin: '0 auto' }
const header = { textAlign: 'center' as const, marginBottom: '20px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1A1A1A', margin: '0', letterSpacing: '1px' }
const h2 = { fontSize: '20px', fontWeight: '600' as const, color: '#1A1A1A', margin: '0 0 16px' }
const accentLine = { border: 'none', borderTop: '3px solid #00C853', margin: '20px 0' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const section = { background: '#f8f8f8', borderRadius: '10px', padding: '18px 22px', marginBottom: '16px' }
const listItem = { fontSize: '14px', color: '#333', margin: '0 0 8px', lineHeight: '1.5' }
const button = { backgroundColor: '#00C853', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' as const, textDecoration: 'none' }
const footer = { fontSize: '14px', fontWeight: '500' as const, color: '#1A1A1A', textAlign: 'center' as const, margin: '0 0 4px' }
const footerSmall = { fontSize: '12px', color: '#999', textAlign: 'center' as const, margin: '0' }
