import Layout from "@/components/layout/Layout";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { defaultPrivacyPolicyContent, injectContactInfo } from "@/lib/legal-content-defaults";

const PrivacyPolicy = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const rawHtml = settings?.privacy_policy_html || defaultPrivacyPolicyContent;
  const html = injectContactInfo(rawHtml, settings);

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
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
