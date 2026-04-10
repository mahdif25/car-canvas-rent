import Layout from "@/components/layout/Layout";

const ConditionsGenerales = () => {
  return (
    <Layout>
      <section className="py-10">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">
            <span className="text-primary">Conditions Générales</span> de Location
          </h1>

          <div className="prose prose-sm max-w-none space-y-8 text-foreground/80">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Objet</h2>
              <p>Les présentes conditions générales régissent la location de véhicules proposée par Centre Lux Car. Toute réservation implique l'acceptation pleine et entière de ces conditions.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Conditions du conducteur</h2>
              <p>Le locataire doit être âgé d'au moins 21 ans et être titulaire d'un permis de conduire valide depuis au moins 2 ans. Une pièce d'identité en cours de validité est obligatoire. Le véhicule ne peut être conduit que par le(s) conducteur(s) désigné(s) sur le contrat de location.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Réservation et paiement</h2>
              <p>La réservation est confirmée après validation en ligne. Le paiement du montant total de la location est dû au moment de la prise en charge du véhicule. Les tarifs incluent l'assurance de base, le kilométrage selon le forfait choisi, et la TVA.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Caution (dépôt de garantie)</h2>
              <p>Une caution est exigée à la prise en charge du véhicule. Son montant varie selon la catégorie du véhicule et est indiqué lors de la réservation. La caution est restituée intégralement dans un délai de 7 jours ouvrés après le retour du véhicule, sous réserve qu'aucun dommage, infraction ou dépassement de kilométrage ne soit constaté.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Assurance</h2>
              <p>Tous les véhicules sont couverts par une assurance responsabilité civile. Une assurance tous risques avec franchise est incluse. Le locataire reste responsable du paiement de la franchise en cas de sinistre. Des options de rachat de franchise sont disponibles en tant qu'options supplémentaires.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Carburant</h2>
              <p>Le véhicule est remis avec un niveau de carburant défini. Le locataire s'engage à restituer le véhicule avec le même niveau de carburant. En cas de manquement, des frais de carburant et de service seront facturés.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Kilométrage</h2>
              <p>Le kilométrage peut être illimité ou limité selon le tarif choisi. En cas de dépassement du forfait kilométrique, un supplément par kilomètre sera facturé selon le barème en vigueur.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. État du véhicule et dommages</h2>
              <p>Un état des lieux est effectué au départ et au retour du véhicule. Le locataire est responsable de tout dommage constaté au retour qui n'était pas présent au départ. Les réparations seront facturées au locataire, déduction faite de la couverture d'assurance applicable.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Annulation</h2>
              <p>Toute annulation effectuée plus de 48 heures avant la date de prise en charge est gratuite. Les annulations effectuées moins de 48 heures avant la prise en charge peuvent entraîner des frais d'annulation équivalents à une journée de location. En cas de non-présentation (no-show), le montant total de la réservation pourra être facturé.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Livraison et restitution</h2>
              <p>La livraison et la restitution du véhicule peuvent être effectuées à l'aéroport, à l'hôtel ou à toute adresse convenue. Des frais de livraison peuvent s'appliquer selon le lieu choisi. Le retard dans la restitution du véhicule entraînera la facturation d'une journée supplémentaire.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Interdictions</h2>
              <p>Il est strictement interdit de : conduire sous l'influence de l'alcool ou de stupéfiants, utiliser le véhicule pour des courses ou compétitions, transporter des marchandises dangereuses, sous-louer le véhicule à un tiers, quitter le territoire national sans autorisation écrite préalable.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">12. Protection des données personnelles</h2>
              <p>Les données personnelles collectées lors de la réservation sont traitées conformément à la législation en vigueur. Elles sont utilisées exclusivement pour la gestion de votre réservation et, avec votre consentement, pour l'envoi d'offres promotionnelles. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant notre service client.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">13. Newsletter et communications</h2>
              <p>En acceptant les présentes conditions, vous consentez à recevoir des communications commerciales de Centre Lux Car, incluant des offres spéciales, des promotions et des codes de réduction. Vous pouvez vous désinscrire à tout moment via le lien de désinscription présent dans chaque email.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">14. Loi applicable</h2>
              <p>Les présentes conditions sont soumises au droit marocain. Tout litige sera soumis aux tribunaux compétents de Casablanca.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mt-8">
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Pour toute question, contactez-nous à <strong>contact@centreluxcar.ma</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ConditionsGenerales;
