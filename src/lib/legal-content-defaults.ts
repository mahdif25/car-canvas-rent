import type { SiteSettings } from "@/hooks/useSiteSettings";

export function injectContactInfo(html: string, settings?: Partial<SiteSettings> | null): string {
  if (!html || !settings) return html;
  return html
    .replace(/\{\{footer_phone\}\}/g, settings.footer_phone || "+212 6 00 00 00 00")
    .replace(/\{\{footer_email\}\}/g, settings.footer_email || "contact@centreluxcar.ma")
    .replace(/\{\{footer_address\}\}/g, settings.footer_address || "Casablanca, Maroc");
}

export const defaultPrivacyPolicyContent = `
<div>
  <h2 class="text-xl font-semibold mb-3">1. Identité du responsable du traitement</h2>
  <p><strong>Centre Lux Car</strong><br/>
  Site web : <a href="https://centreluxcar.com" class="text-primary underline">centreluxcar.com</a><br/>
  E-mail : {{footer_email}}<br/>
  Téléphone : {{footer_phone}}<br/>
  Adresse : {{footer_address}}<br/>
  Centre Lux Car est une société de location de véhicules opérant au Maroc. En tant que responsable du traitement, nous nous engageons à protéger la vie privée de nos clients et visiteurs conformément à la législation marocaine (Loi n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel) et au Règlement Général sur la Protection des Données (RGPD) de l'Union européenne.</p>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">2. Données personnelles collectées</h2>
  <p>Dans le cadre de nos services de location de véhicules et de notre présence en ligne, nous collectons les catégories de données suivantes :</p>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li><strong>Données d'identité :</strong> nom, prénom, date de naissance, nationalité</li>
    <li><strong>Documents officiels :</strong> numéro de permis de conduire et date de délivrance, carte d'identité nationale (CIN) pour les ressortissants marocains, passeport pour les ressortissants étrangers</li>
    <li><strong>Coordonnées :</strong> adresse e-mail, numéro de téléphone</li>
    <li><strong>Données de réservation :</strong> dates et lieux de prise en charge et de restitution, véhicule sélectionné, options et accessoires choisis, code promotionnel utilisé</li>
    <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, système d'exploitation, type d'appareil, pages visitées, durée de visite</li>
    <li><strong>Données issues des réseaux sociaux :</strong> informations fournies via les formulaires Facebook/Instagram Lead Ads (nom, e-mail, téléphone)</li>
    <li><strong>Cookies et identifiants publicitaires :</strong> Facebook Pixel (fbclid, _fbp, _fbc), TikTok Pixel, identifiants Google Analytics</li>
  </ul>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">3. Finalités du traitement</h2>
  <p>Vos données personnelles sont traitées pour les finalités suivantes :</p>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li><strong>Gestion des réservations :</strong> traitement, confirmation et suivi de vos locations de véhicules</li>
    <li><strong>Livraison et restitution :</strong> coordination logistique de la mise à disposition et du retour des véhicules</li>
    <li><strong>Vérification d'identité :</strong> conformité avec les obligations légales liées à la location de véhicules (vérification du permis, de l'âge minimum de 21 ans)</li>
    <li><strong>Facturation et comptabilité :</strong> gestion des paiements, cautions et factures</li>
    <li><strong>Communications commerciales :</strong> envoi de newsletters, offres promotionnelles et codes de réduction (avec votre consentement)</li>
    <li><strong>Amélioration des services :</strong> analyse statistique de la fréquentation du site et optimisation de l'expérience utilisateur</li>
    <li><strong>Publicité ciblée :</strong> diffusion de publicités pertinentes sur les réseaux sociaux et les moteurs de recherche</li>
    <li><strong>Gestion des leads :</strong> traitement des demandes de renseignements reçues via les formulaires publicitaires</li>
  </ul>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">4. Base légale du traitement</h2>
  <p>Le traitement de vos données repose sur les bases légales suivantes :</p>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li><strong>Exécution du contrat :</strong> le traitement est nécessaire à la conclusion et à l'exécution du contrat de location (réservation, vérification d'identité, paiement)</li>
    <li><strong>Consentement :</strong> pour l'envoi de communications commerciales, l'utilisation de cookies publicitaires et le traitement des données issues des formulaires Lead Ads</li>
    <li><strong>Intérêt légitime :</strong> pour l'amélioration de nos services, la prévention de la fraude et la sécurité de notre flotte</li>
    <li><strong>Obligation légale :</strong> conservation des documents contractuels et comptables conformément à la législation marocaine</li>
  </ul>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">5. Publicité sur les réseaux sociaux</h2>
  <p>Centre Lux Car utilise des plateformes publicitaires pour promouvoir ses services. Voici comment vos données peuvent être utilisées dans ce cadre :</p>
  
  <h3 class="text-lg font-medium mt-4 mb-2">Facebook / Instagram (Meta)</h3>
  <ul class="list-disc pl-6 space-y-1">
    <li><strong>Facebook Pixel :</strong> un code de suivi est installé sur centreluxcar.com pour mesurer l'efficacité de nos publicités, suivre les conversions (réservations initiées ou complétées) et créer des audiences personnalisées</li>
    <li><strong>Conversions API (CAPI) :</strong> certains événements de conversion sont envoyés directement à Meta depuis nos serveurs pour une mesure plus fiable, incluant des données hachées (e-mail, téléphone, nom)</li>
    <li><strong>Lead Ads :</strong> lorsque vous remplissez un formulaire de contact via une publicité Facebook ou Instagram, vos informations (nom, e-mail, téléphone) sont transmises directement à notre système de gestion des leads</li>
    <li><strong>Audiences personnalisées :</strong> nous pouvons utiliser des listes de clients pour créer des audiences similaires (lookalike) ou exclure des clients existants de nos campagnes</li>
    <li><strong>Reciblage (retargeting) :</strong> si vous visitez notre site, vous pouvez voir des publicités Centre Lux Car sur Facebook et Instagram</li>
  </ul>

  <h3 class="text-lg font-medium mt-4 mb-2">TikTok</h3>
  <ul class="list-disc pl-6 space-y-1">
    <li><strong>TikTok Pixel :</strong> utilisé pour mesurer les performances des campagnes publicitaires sur TikTok et optimiser la diffusion des annonces</li>
    <li>Les données collectées incluent les pages visitées, les actions effectuées et les identifiants de session</li>
  </ul>

  <h3 class="text-lg font-medium mt-4 mb-2">Google</h3>
  <ul class="list-disc pl-6 space-y-1">
    <li><strong>Google Analytics (GA4) :</strong> utilisé pour analyser le trafic du site, comprendre le comportement des visiteurs et mesurer les performances des campagnes</li>
    <li><strong>Google Tag Manager (GTM) :</strong> utilisé pour gérer et déployer les balises de suivi de manière centralisée</li>
    <li><strong>Google Ads :</strong> les données de conversion peuvent être partagées avec Google pour optimiser les campagnes publicitaires</li>
  </ul>

  <p class="mt-3"><strong>Opt-out :</strong> vous pouvez désactiver le suivi publicitaire en modifiant les paramètres de votre navigateur, en utilisant les outils de préférences publicitaires de chaque plateforme (Meta, TikTok, Google), ou en installant un bloqueur de publicités.</p>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">6. Cookies et technologies de suivi</h2>
  <p>Notre site utilise les cookies et technologies suivants :</p>
  <table class="w-full mt-3 text-sm border border-border rounded">
    <thead>
      <tr class="bg-muted">
        <th class="p-2 text-left border-b border-border">Cookie / Technologie</th>
        <th class="p-2 text-left border-b border-border">Fournisseur</th>
        <th class="p-2 text-left border-b border-border">Finalité</th>
        <th class="p-2 text-left border-b border-border">Durée</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="p-2 border-b border-border">_fbp</td><td class="p-2 border-b border-border">Meta</td><td class="p-2 border-b border-border">Suivi des conversions Facebook</td><td class="p-2 border-b border-border">3 mois</td></tr>
      <tr><td class="p-2 border-b border-border">_fbc</td><td class="p-2 border-b border-border">Meta</td><td class="p-2 border-b border-border">Attribution des clics publicitaires</td><td class="p-2 border-b border-border">Session</td></tr>
      <tr><td class="p-2 border-b border-border">_tt_*</td><td class="p-2 border-b border-border">TikTok</td><td class="p-2 border-b border-border">Suivi des campagnes TikTok</td><td class="p-2 border-b border-border">13 mois</td></tr>
      <tr><td class="p-2 border-b border-border">_ga, _gid</td><td class="p-2 border-b border-border">Google</td><td class="p-2 border-b border-border">Analyse du trafic (Google Analytics)</td><td class="p-2 border-b border-border">2 ans / 24h</td></tr>
      <tr><td class="p-2 border-b border-border">sessionStorage</td><td class="p-2 border-b border-border">Centre Lux Car</td><td class="p-2 border-b border-border">Données de session de réservation</td><td class="p-2 border-b border-border">Session</td></tr>
    </tbody>
  </table>
  <p class="mt-3">Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur. La désactivation de certains cookies peut affecter le fonctionnement du site.</p>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">7. Partage des données</h2>
  <p>Vos données peuvent être partagées avec les catégories de destinataires suivantes :</p>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li><strong>Partenaires d'assurance :</strong> dans le cadre de la couverture d'assurance incluse dans la location</li>
    <li><strong>Plateformes publicitaires :</strong> Meta (Facebook/Instagram), TikTok et Google, pour la mesure et l'optimisation des campagnes publicitaires</li>
    <li><strong>Prestataires techniques :</strong> hébergement du site, envoi d'e-mails transactionnels et promotionnels</li>
    <li><strong>Autorités compétentes :</strong> en cas d'obligation légale ou de réquisition judiciaire</li>
  </ul>
  <p class="mt-3"><strong>Centre Lux Car ne vend jamais vos données personnelles à des tiers.</strong></p>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">8. Durée de conservation</h2>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li><strong>Données de réservation et contrats :</strong> 5 ans après la fin du contrat de location (obligation comptable et légale)</li>
    <li><strong>Données de leads publicitaires :</strong> 24 mois à compter de la collecte, sauf opposition de votre part</li>
    <li><strong>Consentement marketing :</strong> conservé jusqu'au retrait du consentement (désabonnement)</li>
    <li><strong>Données de navigation et cookies :</strong> selon la durée de vie de chaque cookie (voir tableau ci-dessus)</li>
    <li><strong>Documents d'identité :</strong> supprimés 6 mois après la fin de la dernière location</li>
  </ul>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">9. Vos droits</h2>
  <p>Conformément à la Loi n° 09-08 et au RGPD, vous disposez des droits suivants :</p>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles détenues par Centre Lux Car</li>
    <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
    <li><strong>Droit de suppression :</strong> demander l'effacement de vos données (sous réserve des obligations légales de conservation)</li>
    <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données à des fins de prospection commerciale</li>
    <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et couramment utilisé</li>
    <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment pour les traitements basés sur celui-ci</li>
    <li><strong>Droit de réclamation :</strong> introduire une réclamation auprès de la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP) au Maroc</li>
  </ul>
  <p class="mt-3">Pour exercer ces droits, contactez-nous à <strong>{{footer_email}}</strong> ou au <strong>{{footer_phone}}</strong>.</p>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">10. Sécurité des données</h2>
  <p>Centre Lux Car met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li>Chiffrement SSL/TLS pour toutes les communications entre votre navigateur et notre site</li>
    <li>Stockage sécurisé des données avec contrôle d'accès strict</li>
    <li>Hachage des données sensibles transmises aux plateformes publicitaires (e-mail, téléphone)</li>
    <li>Accès aux données client limité au personnel autorisé uniquement</li>
    <li>Surveillance continue des accès et des activités suspectes</li>
  </ul>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">11. Communications commerciales</h2>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li>Lors de votre réservation, vous pouvez consentir à recevoir des communications commerciales de Centre Lux Car</li>
    <li>Ces communications peuvent inclure des offres promotionnelles, des codes de réduction personnalisés et des informations sur nos nouveaux véhicules</li>
    <li>Chaque e-mail commercial contient un lien de <strong>désabonnement</strong> en un clic</li>
    <li>Si vous avez consenti à être contacté via <strong>WhatsApp</strong>, vous recevrez des messages sur le numéro fourni. Vous pouvez vous désinscrire à tout moment en répondant « STOP »</li>
    <li>Le retrait de votre consentement n'affecte pas les communications transactionnelles liées à vos réservations en cours</li>
  </ul>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">12. Transfert international de données</h2>
  <p>Certaines de vos données peuvent être traitées en dehors du Maroc par nos prestataires techniques et partenaires publicitaires :</p>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li><strong>Meta Platforms, Inc.</strong> (États-Unis) — pour Facebook Pixel, Conversions API et Lead Ads</li>
    <li><strong>Google LLC</strong> (États-Unis) — pour Google Analytics et Google Tag Manager</li>
    <li><strong>TikTok Pte. Ltd.</strong> (Singapour) — pour TikTok Pixel</li>
    <li><strong>Services cloud</strong> — hébergement et traitement des données</li>
  </ul>
  <p class="mt-3">Ces transferts sont encadrés par des clauses contractuelles types et les certifications de conformité des prestataires (Data Privacy Framework pour les transferts vers les États-Unis).</p>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">13. Protection des mineurs</h2>
  <p>Les services de location de véhicules de Centre Lux Car sont exclusivement réservés aux personnes âgées de <strong>21 ans et plus</strong>, titulaires d'un permis de conduire valide depuis au moins 2 ans. Nous ne collectons pas sciemment de données personnelles de mineurs. Si nous découvrons que des données d'un mineur ont été collectées par erreur, elles seront immédiatement supprimées.</p>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">14. Modifications de la politique</h2>
  <p>Centre Lux Car se réserve le droit de modifier la présente politique de confidentialité à tout moment. En cas de modification substantielle, nous vous en informerons par e-mail (si vous êtes abonné à nos communications) ou par un avis visible sur notre site. La date de dernière mise à jour est indiquée ci-dessous.</p>
  <p class="mt-2"><strong>Dernière mise à jour :</strong> Avril 2026</p>
</div>

<div>
  <h2 class="text-xl font-semibold mb-3">15. Contact</h2>
  <p>Pour toute question relative à cette politique ou pour exercer vos droits, contactez-nous :<br/>
  <strong>E-mail :</strong> {{footer_email}}<br/>
  <strong>Téléphone :</strong> {{footer_phone}}<br/>
  <strong>Adresse :</strong> {{footer_address}}<br/>
  <strong>Site web :</strong> <a href="https://centreluxcar.com" class="text-primary underline">centreluxcar.com</a></p>
</div>
`;

export const defaultConditionsGeneralesContent = `
<div>
  <h2 class="text-xl font-semibold mb-3">1. Objet</h2>
  <p>Les présentes conditions générales régissent la location de véhicules proposée par Centre Lux Car. Toute réservation implique l'acceptation pleine et entière de ces conditions.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">2. Conditions du conducteur</h2>
  <p>Le locataire doit être âgé d'au moins 21 ans et être titulaire d'un permis de conduire valide depuis au moins 2 ans. Une pièce d'identité en cours de validité est obligatoire.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">2bis. Conducteur principal et responsabilité</h2>
  <p>Le conducteur principal (signataire du contrat) est le seul responsable du véhicule pendant toute la durée de la location. En cas de dépassement de la date de restitution convenue, le conducteur principal reste entièrement responsable du véhicule, y compris de tous les frais, dommages et pénalités qui pourraient en découler, jusqu'à la restitution effective du véhicule.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">2ter. Conducteur supplémentaire</h2>
  <p>Un conducteur supplémentaire peut être déclaré lors de la réservation. Le conducteur supplémentaire doit remplir les mêmes conditions que le conducteur principal (âge minimum, permis de conduire valide). Le conducteur principal reste toutefois le seul responsable du véhicule en toutes circonstances.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">3. Réservation et paiement</h2>
  <p>La réservation est confirmée après validation en ligne. Le paiement du montant total de la location est dû au moment de la prise en charge du véhicule.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">4. Caution (dépôt de garantie)</h2>
  <p>Une caution est exigée à la prise en charge du véhicule. Son montant varie selon la catégorie du véhicule.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">5. Assurance</h2>
  <p>Tous les véhicules sont couverts par une assurance responsabilité civile. Une assurance tous risques avec franchise est incluse.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">6. Carburant</h2>
  <p>Le véhicule est remis avec un niveau de carburant défini. Le locataire s'engage à restituer le véhicule avec le même niveau.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">7. Kilométrage</h2>
  <p>Le kilométrage peut être illimité ou limité selon le tarif choisi.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">8. État du véhicule et dommages</h2>
  <p>Un état des lieux est effectué au départ et au retour du véhicule.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">9. Annulation</h2>
  <p>Toute annulation effectuée plus de 48 heures avant la date de prise en charge est gratuite.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">10. Livraison et restitution</h2>
  <p>La livraison et la restitution du véhicule peuvent être effectuées à l'aéroport, à l'hôtel ou à toute adresse convenue.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">11. Interdictions</h2>
  <p>Il est strictement interdit de conduire sous l'influence de l'alcool ou de stupéfiants, sous-louer le véhicule, ou quitter le territoire national sans autorisation.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">12. Protection des données personnelles</h2>
  <p>Les données personnelles collectées sont traitées conformément à la législation en vigueur.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">13. Newsletter et communications</h2>
  <p>En acceptant les présentes conditions, vous consentez à recevoir des communications commerciales de Centre Lux Car.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">14. Loi applicable</h2>
  <p>Les présentes conditions sont soumises au droit marocain.</p>
</div>
<div>
  <p class="mt-4">Pour toute question, contactez-nous à <strong>{{footer_email}}</strong> ou au <strong>{{footer_phone}}</strong>.</p>
</div>
`;

export const defaultCautionPolicyContent = `
<div>
  <h2 class="text-xl font-semibold mb-3">1. Principe de la caution</h2>
  <p>Une caution (dépôt de garantie) est exigée au moment de la prise en charge du véhicule. Elle garantit Centre Lux Car contre les éventuels dommages, amendes ou dépassements de kilométrage.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">2. Montant de la caution</h2>
  <p>Le montant de la caution varie selon la catégorie et le modèle du véhicule loué. Il est indiqué lors de la réservation et confirmé au moment de la prise en charge.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">3. Modes de paiement acceptés</h2>
  <p>La caution peut être réglée par carte bancaire ou en espèces. Le montant est bloqué (pré-autorisation) ou collecté au début de la location.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">4. Restitution de la caution</h2>
  <p>La caution est restituée intégralement à la fin de la location si :</p>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li>Le véhicule est restitué dans l'état initial constaté lors de l'état des lieux de départ</li>
    <li>Aucune amende ou infraction n'est constatée pendant la durée de la location</li>
    <li>Le kilométrage convenu n'a pas été dépassé (le cas échéant)</li>
    <li>Le véhicule est restitué avec le même niveau de carburant</li>
  </ul>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">5. Retenues sur la caution</h2>
  <p>Des retenues pourront être effectuées en cas de :</p>
  <ul class="list-disc pl-6 space-y-1 mt-2">
    <li>Dommages constatés sur le véhicule (rayures, bosses, bris de glace, etc.)</li>
    <li>Nettoyage excessif nécessaire (intérieur ou extérieur)</li>
    <li>Amendes ou infractions au code de la route</li>
    <li>Dépassement de kilométrage</li>
    <li>Retard de restitution non autorisé</li>
    <li>Niveau de carburant inférieur à celui constaté au départ</li>
  </ul>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">6. Délai de restitution</h2>
  <p>La caution est restituée dans un délai de 7 jours ouvrables après la restitution du véhicule si aucune retenue n'est nécessaire. En cas de pré-autorisation bancaire, le déblocage suit les délais habituels de votre établissement bancaire.</p>
</div>
<div>
  <h2 class="text-xl font-semibold mb-3">7. Contact</h2>
  <p>Pour toute question relative à la caution, contactez-nous :<br/>
  <strong>E-mail :</strong> {{footer_email}}<br/>
  <strong>Téléphone :</strong> {{footer_phone}}</p>
</div>
`;
