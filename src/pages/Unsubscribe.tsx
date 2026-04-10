import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (res.ok && data.valid === true) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      } catch {
        setStatus("error");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container max-w-md text-center space-y-6">
          {status === "loading" && (
            <p className="text-muted-foreground">Vérification en cours...</p>
          )}
          {status === "valid" && (
            <>
              <h1 className="text-2xl font-bold">Se désinscrire</h1>
              <p className="text-muted-foreground">
                Confirmez votre désinscription des emails de Centre Lux Car.
              </p>
              <Button
                onClick={handleUnsubscribe}
                disabled={submitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl px-8 h-12"
              >
                {submitting ? "Traitement..." : "Confirmer la désinscription"}
              </Button>
            </>
          )}
          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold text-primary">Désinscription confirmée</h1>
              <p className="text-muted-foreground">
                Vous ne recevrez plus d'emails de notre part.
              </p>
            </>
          )}
          {status === "already" && (
            <>
              <h1 className="text-2xl font-bold">Déjà désinscrit</h1>
              <p className="text-muted-foreground">
                Vous êtes déjà désinscrit de nos communications.
              </p>
            </>
          )}
          {status === "invalid" && (
            <>
              <h1 className="text-2xl font-bold">Lien invalide</h1>
              <p className="text-muted-foreground">
                Ce lien de désinscription est invalide ou a expiré.
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold">Erreur</h1>
              <p className="text-muted-foreground">
                Une erreur s'est produite. Veuillez réessayer plus tard.
              </p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Unsubscribe;
