import { useEffect, useRef, useState } from "react";
import { SiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteSettings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const WEBHOOK_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/whatsapp-webhook`;

interface Props {
  form: Partial<SiteSettings>;
  setForm: React.Dispatch<React.SetStateAction<Partial<SiteSettings>>>;
}

type CheckResult = { ok: boolean; message: string } | null;

export default function WhatsAppBusinessSetup({ form, setForm }: Props) {
  const updateMutation = useUpdateSiteSettings();
  const [savingFlash, setSavingFlash] = useState<Record<string, boolean>>({});
  const debounceTimers = useRef<Record<string, number>>({});

  const [tokenCheck, setTokenCheck] = useState<CheckResult>(null);
  const [wabaCheck, setWabaCheck] = useState<CheckResult>(null);
  const [phoneCheck, setPhoneCheck] = useState<CheckResult>(null);
  const [subCheck, setSubCheck] = useState<CheckResult>(null);
  const [testCheck, setTestCheck] = useState<CheckResult>(null);

  const [loadingToken, setLoadingToken] = useState(false);
  const [loadingWaba, setLoadingWaba] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingHandshake, setLoadingHandshake] = useState(false);
  const [handshakeCheck, setHandshakeCheck] = useState<CheckResult>(null);

  const [testNumber, setTestNumber] = useState("");

  // Debounced auto-save on change
  const autoSave = (field: keyof SiteSettings, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (debounceTimers.current[field]) {
      window.clearTimeout(debounceTimers.current[field]);
    }
    debounceTimers.current[field] = window.setTimeout(() => {
      updateMutation.mutate(
        { [field]: value } as Partial<SiteSettings>,
        {
          onSuccess: () => {
            setSavingFlash((s) => ({ ...s, [field]: true }));
            setTimeout(
              () => setSavingFlash((s) => ({ ...s, [field]: false })),
              1500,
            );
          },
          onError: () => toast.error("Erreur de sauvegarde"),
        },
      );
    }, 600);
  };

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((t) =>
        window.clearTimeout(t),
      );
    };
  }, []);

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    toast.success("Copié !");
  };

  // Immediate (non-debounced) save — used for the verify token so what you paste into Meta
  // is guaranteed to be the value already stored in the DB.
  const saveNow = async (field: keyof SiteSettings, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (debounceTimers.current[field]) {
      window.clearTimeout(debounceTimers.current[field]);
    }
    try {
      await updateMutation.mutateAsync({ [field]: value } as Partial<SiteSettings>);
      setSavingFlash((s) => ({ ...s, [field]: true }));
      setTimeout(
        () => setSavingFlash((s) => ({ ...s, [field]: false })),
        1500,
      );
    } catch {
      toast.error("Erreur de sauvegarde");
    }
  };

  const generateVerifyToken = async () => {
    const t = crypto.randomUUID();
    await saveNow("whatsapp_verify_token", t);
    toast.info("Token généré et sauvegardé");
  };

  const testWebhookHandshake = async () => {
    const token = (form.whatsapp_verify_token ?? "").trim();
    if (!token) {
      toast.error("Générez ou saisissez un Verify Token d'abord");
      return;
    }
    setLoadingHandshake(true);
    setHandshakeCheck(null);
    const challenge = `test_${Date.now()}`;
    try {
      const res = await fetch(
        `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(
          token,
        )}&hub.challenge=${challenge}`,
      );
      const body = await res.text();
      if (res.status === 200 && body === challenge) {
        setHandshakeCheck({
          ok: true,
          message: "Handshake réussi — Meta peut maintenant vérifier ce webhook.",
        });
        toast.success("Webhook prêt !");
      } else if (res.status === 404) {
        setHandshakeCheck({
          ok: false,
          message:
            "Webhook introuvable (404). La fonction n'est pas encore déployée — réessayez dans quelques secondes.",
        });
        toast.error("Webhook 404");
      } else {
        setHandshakeCheck({
          ok: false,
          message: `Échec (HTTP ${res.status}) : ${body.slice(0, 150)}`,
        });
        toast.error("Échec du handshake");
      }
    } catch (e: any) {
      setHandshakeCheck({
        ok: false,
        message: e?.message ?? "Erreur réseau",
      });
      toast.error("Erreur réseau");
    } finally {
      setLoadingHandshake(false);
    }
  };

  const runDiagnostic = async (
    payload: Record<string, unknown>,
    setter: (r: CheckResult) => void,
    setLoading: (b: boolean) => void,
  ) => {
    setLoading(true);
    setter(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "whatsapp-diagnostic",
        { body: payload },
      );
      if (error) throw error;
      setter({ ok: !!data?.ok, message: data?.message ?? "" });
      if (data?.ok) toast.success(data.message);
      else toast.error(data?.message ?? "Échec de la vérification");
    } catch (e: any) {
      setter({ ok: false, message: e?.message ?? "Erreur réseau" });
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: "creds", label: "Vérifier les credentials Meta", done: tokenCheck?.ok === true },
    { key: "waba", label: "WhatsApp Business Account ID", done: !!form.whatsapp_business_account_id && wabaCheck?.ok === true },
    { key: "phone", label: "Phone Number ID", done: !!form.whatsapp_phone_number_id && phoneCheck?.ok === true },
    { key: "webhook", label: "Webhook & Verify Token", done: !!form.whatsapp_verify_token && subCheck?.ok === true },
    { key: "bot", label: "Configuration du bot", done: !!form.whatsapp_bot_welcome_message },
    { key: "test", label: "Envoyer un message test", done: testCheck?.ok === true },
  ];
  const completed = steps.filter((s) => s.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  const StepBadge = ({ index, done }: { index: number; done: boolean }) => (
    <span
      className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
        done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
      }`}
    >
      {done ? <Check size={14} /> : index + 1}
    </span>
  );

  const SaveFlash = ({ field }: { field: string }) =>
    savingFlash[field] ? (
      <span className="text-xs text-green-600 flex items-center gap-1 animate-fade-in">
        <Check size={12} /> Enregistré
      </span>
    ) : null;

  const ResultLine = ({ result }: { result: CheckResult }) =>
    result ? (
      <div
        className={`flex items-start gap-2 text-sm ${
          result.ok ? "text-green-600" : "text-destructive"
        }`}
      >
        {result.ok ? (
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
        ) : (
          <XCircle size={16} className="shrink-0 mt-0.5" />
        )}
        <span className="break-words">{result.message}</span>
      </div>
    ) : null;

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
      <div className="flex items-center gap-3">
        <MessageCircle className="text-primary" size={22} />
        <h2 className="font-semibold text-lg">WhatsApp Business — Configuration</h2>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="bg-secondary rounded-lg p-3">
          <div className="text-muted-foreground">Token</div>
          <div className="font-medium">
            {tokenCheck?.ok ? "✓ Valide" : "À vérifier"}
          </div>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <div className="text-muted-foreground">WABA ID</div>
          <div className="font-medium truncate">
            {form.whatsapp_business_account_id || "—"}
          </div>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <div className="text-muted-foreground">Numéro</div>
          <div className="font-medium truncate">
            {form.whatsapp_phone_number_id || "—"}
          </div>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <div className="text-muted-foreground">Bot</div>
          <div className="font-medium">
            {form.whatsapp_bot_enabled ? "Activé" : "Désactivé"}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium">
            {completed}/{steps.length} étapes
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Accordion type="single" collapsible className="space-y-2" defaultValue="creds">
        {/* Step 1 — Credentials check */}
        <AccordionItem value="creds" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={0} done={steps[0].done} />
              <span className="font-medium text-sm text-left">{steps[0].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="bg-secondary rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">Réutilisation des credentials Facebook Lead Ads</p>
              <p className="text-muted-foreground">
                Vous avez déjà fourni un <strong>token système permanent</strong> et un{" "}
                <strong>App Secret</strong> pour Lead Ads. WhatsApp utilise les mêmes valeurs.
                Assurez-vous que votre token a aussi les permissions{" "}
                <code className="bg-muted px-1 rounded text-xs">whatsapp_business_messaging</code> et{" "}
                <code className="bg-muted px-1 rounded text-xs">whatsapp_business_management</code>.
              </p>
              <a
                href="https://business.facebook.com/settings/system-users"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                Ouvrir Business Settings → System Users <ExternalLink size={12} />
              </a>
            </div>
            <Button
              size="sm"
              onClick={() =>
                runDiagnostic({ check: "token" }, setTokenCheck, setLoadingToken)
              }
              disabled={loadingToken}
              className="gap-2"
            >
              {loadingToken ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldCheck size={14} />
              )}
              Vérifier le token
            </Button>
            <ResultLine result={tokenCheck} />
          </AccordionContent>
        </AccordionItem>

        {/* Step 2 — WABA ID */}
        <AccordionItem value="waba" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={1} done={steps[1].done} />
              <span className="font-medium text-sm text-left">{steps[1].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="bg-secondary rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Trouver votre WhatsApp Business Account ID</p>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                <li>
                  Ouvrez{" "}
                  <a
                    href="https://business.facebook.com/wa/manage/home"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline inline-flex items-center gap-1"
                  >
                    WhatsApp Manager <ExternalLink size={12} />
                  </a>
                </li>
                <li>Sélectionnez votre compte WhatsApp Business en haut</li>
                <li>
                  Cliquez ⚙ <strong>Paramètres</strong> →{" "}
                  <strong>Informations sur le compte</strong>
                </li>
                <li>
                  Copiez l'<strong>ID du compte WhatsApp Business</strong>
                </li>
              </ol>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>WhatsApp Business Account ID</Label>
                <SaveFlash field="whatsapp_business_account_id" />
              </div>
              <Input
                value={form.whatsapp_business_account_id ?? ""}
                onChange={(e) =>
                  autoSave("whatsapp_business_account_id", e.target.value.trim())
                }
                placeholder="123456789012345"
                className="font-mono text-sm"
              />
            </div>
            <Button
              size="sm"
              onClick={() =>
                runDiagnostic(
                  { check: "waba", waba_id: form.whatsapp_business_account_id },
                  setWabaCheck,
                  setLoadingWaba,
                )
              }
              disabled={loadingWaba || !form.whatsapp_business_account_id}
              className="gap-2"
            >
              {loadingWaba ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldCheck size={14} />
              )}
              Vérifier
            </Button>
            <ResultLine result={wabaCheck} />
          </AccordionContent>
        </AccordionItem>

        {/* Step 3 — Phone Number ID */}
        <AccordionItem value="phone" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={2} done={steps[2].done} />
              <span className="font-medium text-sm text-left">{steps[2].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="bg-secondary rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Trouver votre Phone Number ID</p>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                <li>
                  Ouvrez{" "}
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline inline-flex items-center gap-1"
                  >
                    Meta for Developers <ExternalLink size={12} />
                  </a>{" "}
                  → votre app
                </li>
                <li>
                  Menu de gauche → <strong>WhatsApp</strong> → <strong>API Setup</strong>
                </li>
                <li>
                  Sous <strong>"From"</strong>, copiez le <strong>Phone Number ID</strong>{" "}
                  (PAS le numéro affiché)
                </li>
              </ol>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Phone Number ID</Label>
                <SaveFlash field="whatsapp_phone_number_id" />
              </div>
              <Input
                value={form.whatsapp_phone_number_id ?? ""}
                onChange={(e) =>
                  autoSave("whatsapp_phone_number_id", e.target.value.trim())
                }
                placeholder="123456789012345"
                className="font-mono text-sm"
              />
            </div>
            <Button
              size="sm"
              onClick={() =>
                runDiagnostic(
                  { check: "phone", phone_id: form.whatsapp_phone_number_id },
                  setPhoneCheck,
                  setLoadingPhone,
                )
              }
              disabled={loadingPhone || !form.whatsapp_phone_number_id}
              className="gap-2"
            >
              {loadingPhone ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldCheck size={14} />
              )}
              Vérifier
            </Button>
            <ResultLine result={phoneCheck} />
          </AccordionContent>
        </AccordionItem>

        {/* Step 4 — Webhook */}
        <AccordionItem value="webhook" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={3} done={steps[3].done} />
              <span className="font-medium text-sm text-left">{steps[3].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>URL du Webhook (à coller dans Meta)</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  readOnly
                  value={WEBHOOK_URL}
                  className="font-mono text-xs flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copy(WEBHOOK_URL)}
                  className="gap-1.5 flex-shrink-0"
                >
                  <Copy size={14} /> Copier
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Verify Token</Label>
                <SaveFlash field="whatsapp_verify_token" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={form.whatsapp_verify_token ?? ""}
                  onChange={(e) =>
                    autoSave("whatsapp_verify_token", e.target.value)
                  }
                  placeholder="Cliquez Générer →"
                  className="font-mono text-xs flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateVerifyToken}
                  className="gap-1.5 flex-shrink-0"
                >
                  <RefreshCw size={14} /> Générer
                </Button>
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">Étapes dans Meta :</p>
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                <li>Votre app → <strong>WhatsApp → Configuration</strong></li>
                <li>Section <strong>Webhook</strong> → <strong>Modifier</strong></li>
                <li>Collez l'<strong>URL du Webhook</strong> ci-dessus</li>
                <li>Collez le <strong>Verify Token</strong> ci-dessus</li>
                <li>Cliquez <strong>Vérifier et enregistrer</strong></li>
                <li>
                  Sous <strong>Webhook fields</strong> → abonnez-vous à{" "}
                  <code className="bg-muted px-1 rounded">messages</code>
                </li>
                <li>Revenez ici et cliquez <strong>Vérifier l'abonnement</strong></li>
              </ol>
            </div>

            <Button
              size="sm"
              onClick={() =>
                runDiagnostic(
                  {
                    check: "subscription",
                    waba_id: form.whatsapp_business_account_id,
                  },
                  setSubCheck,
                  setLoadingSub,
                )
              }
              disabled={loadingSub || !form.whatsapp_business_account_id}
              className="gap-2"
            >
              {loadingSub ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldCheck size={14} />
              )}
              Vérifier l'abonnement
            </Button>
            <ResultLine result={subCheck} />
          </AccordionContent>
        </AccordionItem>

        {/* Step 5 — Bot config */}
        <AccordionItem value="bot" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={4} done={steps[4].done} />
              <span className="font-medium text-sm text-left">{steps[4].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Activer le bot automatique</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Répond automatiquement aux nouveaux messages WhatsApp
                </p>
              </div>
              <Switch
                checked={form.whatsapp_bot_enabled ?? false}
                onCheckedChange={(v) => autoSave("whatsapp_bot_enabled", v)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Message de bienvenue</Label>
                <SaveFlash field="whatsapp_bot_welcome_message" />
              </div>
              <Textarea
                value={form.whatsapp_bot_welcome_message ?? ""}
                onChange={(e) =>
                  autoSave("whatsapp_bot_welcome_message", e.target.value)
                }
                placeholder="Bonjour {name} 👋..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Variable disponible : <code className="bg-muted px-1 rounded">{"{name}"}</code>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Mot-clé pour parler à un agent</Label>
                <SaveFlash field="whatsapp_bot_handoff_keyword" />
              </div>
              <Input
                value={form.whatsapp_bot_handoff_keyword ?? ""}
                onChange={(e) =>
                  autoSave(
                    "whatsapp_bot_handoff_keyword",
                    e.target.value.toUpperCase(),
                  )
                }
                placeholder="AGENT"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Quand le client envoie ce mot, le bot s'arrête et un admin prend le relais.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Step 6 — Test */}
        <AccordionItem value="test" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <StepBadge index={5} done={steps[5].done} />
              <span className="font-medium text-sm text-left">{steps[5].label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Envoie le template <code className="bg-muted px-1 rounded">hello_world</code>{" "}
              (pré-approuvé par Meta) au numéro indiqué. Confirme que votre token + Phone ID
              fonctionnent.
            </p>
            <div className="space-y-2">
              <Label>Numéro destinataire (avec indicatif, sans +)</Label>
              <Input
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                placeholder="212600000000"
                className="font-mono"
              />
            </div>
            <Button
              size="sm"
              onClick={() =>
                runDiagnostic(
                  {
                    check: "send_test",
                    phone_id: form.whatsapp_phone_number_id,
                    to: testNumber,
                  },
                  setTestCheck,
                  setLoadingTest,
                )
              }
              disabled={
                loadingTest || !form.whatsapp_phone_number_id || !testNumber
              }
              className="gap-2"
            >
              {loadingTest ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Envoyer le test
            </Button>
            <ResultLine result={testCheck} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
