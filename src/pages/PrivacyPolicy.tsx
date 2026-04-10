import Layout from "@/components/layout/Layout";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

const PrivacyPolicy = () => {
  const { data: settings, isLoading } = useSiteSettings();

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
          ) : settings?.privacy_policy_html ? (
            <div
              className="prose prose-sm max-w-none text-foreground/80"
              dangerouslySetInnerHTML={{ __html: settings.privacy_policy_html }}
            />
          ) : (
            <p className="text-muted-foreground">Contenu bientôt disponible.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
