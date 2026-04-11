import Layout from "@/components/layout/Layout";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

const defaultContent = `
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
`;

const ConditionsGenerales = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const html = settings?.conditions_generales_html || defaultContent;

  return (
    <Layout>
      <section className="py-10">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">
            <span className="text-primary">Conditions Générales</span> de Location
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
            <p className="text-sm text-muted-foreground">
              Pour toute question, contactez-nous à <strong>{settings?.footer_email || "contact@centreluxcar.ma"}</strong>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ConditionsGenerales;
