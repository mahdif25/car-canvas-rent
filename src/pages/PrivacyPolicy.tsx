import Layout from "@/components/layout/Layout";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

const defaultContent = `
<div>
  <h2 class="text-xl font-semibold mb-3">1. Identité du responsable du traitement</h2>
  <p><strong>Centre Lux Car</strong><br/>
  Site web : <a href="https://centreluxcar.com" class="text-primary underline">centreluxcar.com</a><br/>
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
  <p class="mt-3">Pour exercer ces droits, contactez-nous par e-mail ou par téléphone (voir section Contact ci-dessous).</p>
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
`;

const PrivacyPolicy = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const html = settings?.privacy_policy_html || defaultContent;

  return (
    <Layout>
      <section className="py-10">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">
            <span className="text-primary">Politique de Confidentialité</span>
          </h1>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none space-y-8 text-foreground/80"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
          <div className="bg-card border border-border rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold mb-2">15. Contact</h3>
            <p className="text-sm text-muted-foreground">
              Pour toute question relative à cette politique ou pour exercer vos droits, contactez-nous :<br />
              <strong>E-mail :</strong> {settings?.footer_email || "contact@centreluxcar.ma"}<br />
              <strong>Téléphone :</strong> {settings?.footer_phone || "+212 6 00 00 00 00"}<br />
              <strong>Adresse :</strong> {settings?.footer_address || "Casablanca, Maroc"}<br />
              <strong>Site web :</strong> <a href="https://centreluxcar.com" className="text-primary underline">centreluxcar.com</a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
