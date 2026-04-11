export interface EmailBlock {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'html' | 'coupon';
  content?: string;
  settings: BlockSettings;
}

export interface BlockSettings {
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  paddingTop?: string;
  paddingBottom?: string;
  // image
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: string;
  // button
  buttonUrl?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;
  // divider
  dividerColor?: string;
  dividerThickness?: string;
  // spacer
  spacerHeight?: string;
  // line height for text
  lineHeight?: string;
}

export interface GlobalStyles {
  emailBgColor: string;
  contentBgColor: string;
  fontFamily: string;
  textColor: string;
  accentColor: string;
}

export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  emailBgColor: '#ffffff',
  contentBgColor: '#ffffff',
  fontFamily: "'Poppins', Arial, sans-serif",
  textColor: '#1A1A1A',
  accentColor: '#00C853',
};

export function createBlock(type: EmailBlock['type']): EmailBlock {
  const id = crypto.randomUUID();
  const base: EmailBlock = { id, type, content: '', settings: {} };

  switch (type) {
    case 'heading':
      return { ...base, content: 'Titre', settings: { fontSize: '24', fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A', paddingTop: '10', paddingBottom: '10' } };
    case 'text':
      return { ...base, content: 'Votre texte ici...', settings: { fontSize: '14', fontWeight: 'normal', textAlign: 'left', color: '#55575d', lineHeight: '1.6', paddingTop: '0', paddingBottom: '10' } };
    case 'image':
      return { ...base, settings: { imageUrl: '', imageAlt: '', imageWidth: '100', textAlign: 'center', paddingTop: '10', paddingBottom: '10' } };
    case 'button':
      return { ...base, content: 'Réserver maintenant', settings: { buttonUrl: 'https://centreluxcar.com/fleet', buttonBgColor: '#00C853', buttonTextColor: '#ffffff', buttonBorderRadius: '8', fontSize: '14', fontWeight: '600', textAlign: 'center', paddingTop: '10', paddingBottom: '10' } };
    case 'divider':
      return { ...base, settings: { dividerColor: '#00C853', dividerThickness: '3', paddingTop: '10', paddingBottom: '10' } };
    case 'spacer':
      return { ...base, settings: { spacerHeight: '24' } };
    case 'html':
      return { ...base, content: '', settings: { paddingTop: '0', paddingBottom: '0' } };
    case 'coupon':
      return { ...base, content: 'coupon', settings: { paddingTop: '10', paddingBottom: '10' } };
  }
}

export function renderBlocksToHtml(blocks: EmailBlock[], globals: GlobalStyles): string {
  const blockHtmls = blocks.map((block) => {
    const pt = block.settings.paddingTop || '0';
    const pb = block.settings.paddingBottom || '0';
    const wrapStyle = `padding-top:${pt}px;padding-bottom:${pb}px;`;

    switch (block.type) {
      case 'heading':
        return `<div style="${wrapStyle}"><h1 style="font-size:${block.settings.fontSize || '24'}px;font-weight:${block.settings.fontWeight || 'bold'};text-align:${block.settings.textAlign || 'center'};color:${block.settings.color || globals.textColor};margin:0;font-family:${globals.fontFamily};">${escapeHtml(block.content || '')}</h1></div>`;
      case 'text':
        return `<div style="${wrapStyle}"><p style="font-size:${block.settings.fontSize || '14'}px;font-weight:${block.settings.fontWeight || 'normal'};text-align:${block.settings.textAlign || 'left'};color:${block.settings.color || '#55575d'};line-height:${block.settings.lineHeight || '1.6'};margin:0;font-family:${globals.fontFamily};">${escapeHtml(block.content || '')}</p></div>`;
      case 'image':
        if (!block.settings.imageUrl) return '';
        return `<div style="${wrapStyle}text-align:${block.settings.textAlign || 'center'};"><img src="${escapeHtml(block.settings.imageUrl)}" alt="${escapeHtml(block.settings.imageAlt || '')}" style="max-width:${block.settings.imageWidth || '100'}%;height:auto;border:0;" /></div>`;
      case 'button':
        return `<div style="${wrapStyle}text-align:${block.settings.textAlign || 'center'};"><a href="${escapeHtml(block.settings.buttonUrl || '#')}" style="display:inline-block;background-color:${block.settings.buttonBgColor || globals.accentColor};color:${block.settings.buttonTextColor || '#ffffff'};padding:12px 28px;border-radius:${block.settings.buttonBorderRadius || '8'}px;font-size:${block.settings.fontSize || '14'}px;font-weight:${block.settings.fontWeight || '600'};text-decoration:none;font-family:${globals.fontFamily};">${escapeHtml(block.content || '')}</a></div>`;
      case 'divider':
        return `<div style="${wrapStyle}"><hr style="border:none;border-top:${block.settings.dividerThickness || '3'}px solid ${block.settings.dividerColor || globals.accentColor};margin:0;" /></div>`;
      case 'spacer':
        return `<div style="height:${block.settings.spacerHeight || '24'}px;"></div>`;
      case 'html':
        return `<div style="${wrapStyle}">${block.content || ''}</div>`;
      case 'coupon':
        return `<!--COUPON_BLOCK-->`;
      default:
        return '';
    }
  });

  return `<div style="background-color:${globals.emailBgColor};padding:20px 0;"><div style="max-width:600px;margin:0 auto;padding:20px 25px;background-color:${globals.contentBgColor};font-family:${globals.fontFamily};">${blockHtmls.join('')}</div></div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface StarterTemplate {
  name: string;
  label: string;
  blocks: EmailBlock[];
  globals: GlobalStyles;
}

export function getStarterTemplates(): StarterTemplate[] {
  return [
    {
      name: 'offre-speciale',
      label: 'Offre spéciale',
      globals: { ...DEFAULT_GLOBAL_STYLES },
      blocks: [
        { id: crypto.randomUUID(), type: 'heading', content: 'CENTRE LUX CAR', settings: { fontSize: '22', fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A', paddingTop: '10', paddingBottom: '4' } },
        { id: crypto.randomUUID(), type: 'text', content: 'OFFRE SPÉCIALE', settings: { fontSize: '13', fontWeight: '600', textAlign: 'center', color: '#00C853', paddingTop: '0', paddingBottom: '10' } },
        { id: crypto.randomUUID(), type: 'divider', settings: { dividerColor: '#00C853', dividerThickness: '3', paddingTop: '0', paddingBottom: '16' } },
        { id: crypto.randomUUID(), type: 'text', content: 'Bonjour,', settings: { fontSize: '15', fontWeight: 'normal', textAlign: 'left', color: '#1A1A1A', paddingTop: '0', paddingBottom: '10' } },
        { id: crypto.randomUUID(), type: 'text', content: 'Profitez de notre offre exclusive ! Louez le véhicule de vos rêves à prix réduit.', settings: { fontSize: '14', fontWeight: 'normal', textAlign: 'left', color: '#55575d', lineHeight: '1.6', paddingTop: '0', paddingBottom: '16' } },
        { id: crypto.randomUUID(), type: 'button', content: 'Réserver maintenant', settings: { buttonUrl: 'https://centreluxcar.com/fleet', buttonBgColor: '#00C853', buttonTextColor: '#ffffff', buttonBorderRadius: '8', fontSize: '14', fontWeight: '600', textAlign: 'center', paddingTop: '10', paddingBottom: '10' } },
        { id: crypto.randomUUID(), type: 'divider', settings: { dividerColor: '#00C853', dividerThickness: '3', paddingTop: '16', paddingBottom: '10' } },
        { id: crypto.randomUUID(), type: 'text', content: 'Centre Lux Car • centreluxcar.com', settings: { fontSize: '12', fontWeight: 'normal', textAlign: 'center', color: '#999999', paddingTop: '0', paddingBottom: '0' } },
      ],
    },
    {
      name: 'bienvenue',
      label: 'Bienvenue',
      globals: { ...DEFAULT_GLOBAL_STYLES },
      blocks: [
        { id: crypto.randomUUID(), type: 'heading', content: 'Bienvenue chez Centre Lux Car !', settings: { fontSize: '24', fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A', paddingTop: '10', paddingBottom: '10' } },
        { id: crypto.randomUUID(), type: 'divider', settings: { dividerColor: '#00C853', dividerThickness: '3', paddingTop: '0', paddingBottom: '16' } },
        { id: crypto.randomUUID(), type: 'text', content: 'Merci de nous avoir choisis pour votre prochaine aventure ! Nous sommes ravis de vous compter parmi nos clients.', settings: { fontSize: '14', fontWeight: 'normal', textAlign: 'left', color: '#55575d', lineHeight: '1.6', paddingTop: '0', paddingBottom: '16' } },
        { id: crypto.randomUUID(), type: 'button', content: 'Découvrir notre flotte', settings: { buttonUrl: 'https://centreluxcar.com/fleet', buttonBgColor: '#00C853', buttonTextColor: '#ffffff', buttonBorderRadius: '8', fontSize: '14', fontWeight: '600', textAlign: 'center', paddingTop: '10', paddingBottom: '10' } },
      ],
    },
    {
      name: 'parrainage',
      label: 'Parrainage',
      globals: { ...DEFAULT_GLOBAL_STYLES },
      blocks: [
        { id: crypto.randomUUID(), type: 'heading', content: 'Programme de Parrainage', settings: { fontSize: '22', fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A', paddingTop: '10', paddingBottom: '10' } },
        { id: crypto.randomUUID(), type: 'divider', settings: { dividerColor: '#00C853', dividerThickness: '3', paddingTop: '0', paddingBottom: '16' } },
        { id: crypto.randomUUID(), type: 'text', content: 'Parrainez un ami et bénéficiez tous les deux d\'une réduction sur votre prochaine location !', settings: { fontSize: '14', fontWeight: 'normal', textAlign: 'left', color: '#55575d', lineHeight: '1.6', paddingTop: '0', paddingBottom: '16' } },
        { id: crypto.randomUUID(), type: 'text', content: 'Partagez votre code avec un ami — vous bénéficiez tous les deux d\'une réduction !', settings: { fontSize: '13', fontWeight: 'normal', textAlign: 'center', color: '#666666', paddingTop: '10', paddingBottom: '10' } },
        { id: crypto.randomUUID(), type: 'button', content: 'Réserver maintenant', settings: { buttonUrl: 'https://centreluxcar.com/fleet', buttonBgColor: '#00C853', buttonTextColor: '#ffffff', buttonBorderRadius: '8', fontSize: '14', fontWeight: '600', textAlign: 'center', paddingTop: '10', paddingBottom: '10' } },
      ],
    },
    {
      name: 'annonce',
      label: 'Annonce',
      globals: { ...DEFAULT_GLOBAL_STYLES },
      blocks: [
        { id: crypto.randomUUID(), type: 'image', settings: { imageUrl: '', imageAlt: 'Bannière', imageWidth: '100', textAlign: 'center', paddingTop: '0', paddingBottom: '16' } },
        { id: crypto.randomUUID(), type: 'heading', content: 'Nouvelle annonce', settings: { fontSize: '24', fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A', paddingTop: '10', paddingBottom: '10' } },
        { id: crypto.randomUUID(), type: 'text', content: 'Découvrez notre dernière nouveauté...', settings: { fontSize: '14', fontWeight: 'normal', textAlign: 'left', color: '#55575d', lineHeight: '1.6', paddingTop: '0', paddingBottom: '16' } },
        { id: crypto.randomUUID(), type: 'button', content: 'En savoir plus', settings: { buttonUrl: 'https://centreluxcar.com', buttonBgColor: '#00C853', buttonTextColor: '#ffffff', buttonBorderRadius: '8', fontSize: '14', fontWeight: '600', textAlign: 'center', paddingTop: '10', paddingBottom: '10' } },
      ],
    },
    {
      name: 'vide',
      label: 'Vide (personnalisé)',
      globals: { ...DEFAULT_GLOBAL_STYLES },
      blocks: [
        { id: crypto.randomUUID(), type: 'heading', content: 'Titre', settings: { fontSize: '24', fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A', paddingTop: '10', paddingBottom: '10' } },
      ],
    },
  ];
}

export interface EmailBuilderData {
  blocks: EmailBlock[];
  globalStyles: GlobalStyles;
}
