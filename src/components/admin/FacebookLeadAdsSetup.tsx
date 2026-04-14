import { useState } from "react";
import { SiteSettings } from "@/hooks/useSiteSettings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Check, Copy, ExternalLink, Loader2, RefreshCw, Send, ShieldCheck, Zap } from "lucide-react";

const WEBHOOK_URL = "https://mtcxliurdruvrzjtxful.supabase.co/functions/v1/facebook-leadads-webhook";

interface Props {
  form: Partial<SiteSettings>;
  setForm: React.Dispatch<React.SetStateAction<Partial<SiteSettings>>>;
  save: (fields: (keyof SiteSettings)[]) => void;
  isSaving: boolean;
}

export default function FacebookLeadAdsSetup({ form, setForm, save, isSaving }: Props) {
  const [appCreated, setAppCreated] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<"success" | "error" | null>(null);
  const [sendingTestLead, setSendingTestLead] = useState(false);
  const [testLeadResult, setTestLeadResult] = useState<"success" | "error" | null>(null);

  const steps = [
    { key: "app", label: "Créer l'Application Facebook", done: appCreated },
    { key: "secret", label: "Configurer l'App Secret", done: !!(form.fb_leadads_app_secret) },
    { key: "verify", label: "Définir le Verify Token", done: !!(form.fb_leadads_verify_token) },
    { key: "webhook", label: "Abonner le Webhook", done: connectionResult === "success" },
    { key: "token", label: "Page Access Token", done: !!(form.fb_leadads_page_access_token) },
    { key: "test", label: "Tester & Vérifier", done: testLeadResult === "success" },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  };

  const generateVerifyToken = () => {
    const token = crypto.randomUUID();
    setForm((f) => ({ ...f, fb_leadads_verify_token: token }));
    toast.info("Token généré — pensez à sauvegarder");
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const verifyToken = form.fb_leadads_verify_token || "";
      const challenge = "test_challenge_" + Date.now();
      const res = await fetch(
        `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=${challenge}`
      );
      const text = await res.text();
      if (res.ok && text === challenge) {
        setConnectionResult("success");
        toast.success("Connexion vérifiée avec succès !");
      } else {
        setConnectionResult("error");
        toast.error("Échec de la vérification. Vérifiez votre Verify Token.");
      }
    } catch {
      setConnectionResult("error");
      toast.error("Erreur réseau lors du test");
    } finally {
      setTestingConnection(false);
    }
  };

  const sendTestLead = async () => {
    setSendingTestLead(true);
    setTestLeadResult(null);
    try {
      const testPayload = {
        object: "page",
        entry: [{
          id: "test_page_id",
          time: Date.now(),
          changes: [{
            field: "leadgen",
            value: { leadgen_id: `test_${Date.now()}`, page_id: "test_page_id" },
          }],
        }],
      };
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });
      const json = await res.json();
      if (json.success) {
        setTestLeadResult("success");
        toast.success("Lead test envoyé avec succès ! Vérifiez l'onglet Leads.");
      } else {
        setTestLeadResult("error");
        toast.error("Échec de l'envoi du lead test");
      }
    } catch {
      setTestLeadResult("error");
      toast.error("Erreur réseau lors du test");
    } finally {
      setSendingTestLead(false);
    }
  };

  const StepBadge = ({ index, done }: { index: number; done: boolean }) => (
    <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
      done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
    }`}>
      {done ? <Check size={14} /> : index + 1}
    </span>
  );

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
      <div className="flex items-center gap-3">
        <Zap className="text-primary" size={22} />
        <h2 className="font-semibold text-lg">Facebook Lead Ads — Configuration</h2>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium">{completedCount}/{steps.length} étapes</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Accordion type="single" collapsible className="space-y-2" defaultValue="app">
        {/* Step 1 — Create App */}
        <AccordionItem value="app" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={0} done={steps[0].done} />
              <span className="font-medium text-sm">{steps[0].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
              <li>
                Rendez-vous sur{" "}
                <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                  developers.facebook.com <ExternalLink size={12} />
                </a>
              </li>
              <li>Cliquez sur <strong>"Créer une application"</strong> → choisissez <strong>"Business"</strong></li>
              <li>Donnez un nom à votre app (ex: "CentreLuxCar Leads")</li>
              <li>Dans le tableau de bord de l'app, cliquez sur <strong>"Ajouter un produit"</strong></li>
              <li>Trouvez <strong>"Webhooks"</strong> et cliquez <strong>"Configurer"</strong></li>
              <li>Sélectionnez <strong>"Page"</strong> dans le menu déroulant</li>
            </ol>
            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                id="app-created"
                checked={appCreated}
                onCheckedChange={(v) => setAppCreated(!!v)}
              />
              <label htmlFor="app-created" className="text-sm font-medium cursor-pointer">
                J'ai créé mon application Facebook
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Step 2 — App Secret */}
        <AccordionItem value="secret" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={1} done={steps[1].done} />
              <span className="font-medium text-sm">{steps[1].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Dans votre app Facebook : <strong>Paramètres → Base → App Secret</strong>. Cliquez sur "Afficher" puis copiez-le ici.
            </p>
            <div className="space-y-2">
              <Label>App Secret</Label>
              <Input
                type="password"
                value={form.fb_leadads_app_secret ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, fb_leadads_app_secret: e.target.value }))}
                placeholder="Collez votre App Secret ici"
              />
            </div>
            <Button
              size="sm"
              onClick={() => save(["fb_leadads_app_secret"])}
              disabled={isSaving || !form.fb_leadads_app_secret}
              className="gap-2"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Sauvegarder l'App Secret
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Step 3 — Verify Token */}
        <AccordionItem value="verify" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={2} done={steps[2].done} />
              <span className="font-medium text-sm">{steps[2].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Ce token sert à vérifier l'identité de votre webhook avec Facebook. Vous pouvez en générer un automatiquement ou en choisir un vous-même.
            </p>
            <div className="space-y-2">
              <Label>Verify Token</Label>
              <div className="flex gap-2">
                <Input
                  value={form.fb_leadads_verify_token ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, fb_leadads_verify_token: e.target.value }))}
                  placeholder="Votre verify token"
                  className="flex-1 font-mono text-xs"
                />
                <Button variant="outline" size="sm" onClick={generateVerifyToken} className="gap-1.5 flex-shrink-0">
                  <RefreshCw size={14} /> Générer
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => save(["fb_leadads_verify_token"])}
              disabled={isSaving || !form.fb_leadads_verify_token}
              className="gap-2"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Sauvegarder le Verify Token
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Step 4 — Subscribe Webhook */}
        <AccordionItem value="webhook" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={3} done={steps[3].done} />
              <span className="font-medium text-sm">{steps[3].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>URL du Webhook (à coller dans Facebook)</Label>
              <div className="flex gap-2">
                <Input readOnly value={WEBHOOK_URL} className="font-mono text-xs flex-1" />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(WEBHOOK_URL)} className="gap-1.5 flex-shrink-0">
                  <Copy size={14} /> Copier
                </Button>
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">Instructions :</p>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                <li>Dans votre app Facebook, allez dans <strong>Webhooks</strong></li>
                <li>Sélectionnez <strong>"Page"</strong> dans le menu déroulant</li>
                <li>Cliquez sur <strong>"S'abonner à cet objet"</strong></li>
                <li>Collez l'<strong>URL du Webhook</strong> ci-dessus</li>
                <li>Collez votre <strong>Verify Token</strong> (celui de l'étape 3)</li>
                <li>Cliquez <strong>"Vérifier et enregistrer"</strong></li>
                <li>Puis abonnez-vous au champ <strong>"leadgen"</strong></li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={testConnection}
                disabled={testingConnection || !form.fb_leadads_verify_token}
                className="gap-2"
              >
                {testingConnection ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                Tester la connexion
              </Button>
              {connectionResult === "success" && (
                <span className="text-sm text-green-600 flex items-center gap-1"><Check size={14} /> Connexion vérifiée</span>
              )}
              {connectionResult === "error" && (
                <span className="text-sm text-destructive">Échec — vérifiez votre Verify Token</span>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Step 5 — Page Access Token */}
        <AccordionItem value="token" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={4} done={steps[4].done} />
              <span className="font-medium text-sm">{steps[4].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="bg-secondary rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">Comment obtenir un Page Access Token permanent :</p>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                <li>
                  Allez sur{" "}
                  <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                    Graph API Explorer <ExternalLink size={12} />
                  </a>
                </li>
                <li>Sélectionnez votre app dans le menu en haut</li>
                <li>Cliquez <strong>"Generate Access Token"</strong></li>
                <li>
                  Accordez les permissions : <code className="bg-muted px-1 rounded text-xs">pages_show_list</code>,{" "}
                  <code className="bg-muted px-1 rounded text-xs">pages_manage_ads</code>,{" "}
                  <code className="bg-muted px-1 rounded text-xs">leads_retrieval</code>,{" "}
                  <code className="bg-muted px-1 rounded text-xs">pages_read_engagement</code>
                </li>
                <li>Copiez le token utilisateur</li>
                <li>
                  Rendez-vous sur{" "}
                  <a href="https://developers.facebook.com/tools/debug/accesstoken/" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                    Access Token Debugger <ExternalLink size={12} />
                  </a>
                  {" "}→ collez le token → cliquez <strong>"Extend Access Token"</strong>
                </li>
                <li>
                  Faites un appel GET : <code className="bg-muted px-1 rounded text-xs break-all">GET /me/accounts</code> avec le token long pour obtenir le <strong>Page Access Token permanent</strong>
                </li>
              </ol>
            </div>
            <div className="space-y-2">
              <Label>Page Access Token</Label>
              <Input
                type="password"
                value={form.fb_leadads_page_access_token ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, fb_leadads_page_access_token: e.target.value }))}
                placeholder="Collez votre Page Access Token ici"
              />
            </div>
            <Button
              size="sm"
              onClick={() => save(["fb_leadads_page_access_token"])}
              disabled={isSaving || !form.fb_leadads_page_access_token}
              className="gap-2"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Sauvegarder le Page Access Token
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Step 6 — Test & Verify */}
        <AccordionItem value="test" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={5} done={steps[5].done} />
              <span className="font-medium text-sm">{steps[5].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Envoyez un lead fictif pour vérifier que tout fonctionne. Le lead apparaîtra dans l'onglet <strong>Leads</strong> du tableau de bord.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="sm"
                onClick={sendTestLead}
                disabled={sendingTestLead}
                className="gap-2"
              >
                {sendingTestLead ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Envoyer un lead test
              </Button>
              {testLeadResult === "success" && (
                <span className="text-sm text-green-600 flex items-center gap-1"><Check size={14} /> Lead test reçu !</span>
              )}
              {testLeadResult === "error" && (
                <span className="text-sm text-destructive">Échec de l'envoi</span>
              )}
            </div>

            <div className="bg-secondary rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">Vous pouvez aussi tester avec l'outil officiel :</p>
              <a
                href="https://developers.facebook.com/tools/lead-ads-testing/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                Facebook Lead Ads Testing Tool <ExternalLink size={12} />
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Landing Page URL */}
      <div className="bg-secondary rounded-lg p-4 space-y-2 text-sm">
        <p className="font-medium">Landing Page Facebook :</p>
        <div className="flex gap-2 items-center">
          <Input readOnly value="https://centreluxcar.com/offre" className="font-mono text-xs" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard("https://centreluxcar.com/offre")}
            className="gap-1.5 flex-shrink-0"
          >
            <Copy size={14} /> Copier
          </Button>
        </div>
        <p className="text-muted-foreground">Utilisez cette URL comme destination pour vos publicités Facebook de type "Trafic".</p>
      </div>
    </div>
  );
}
