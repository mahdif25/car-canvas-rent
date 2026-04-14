import { useEffect, useRef, useState, useCallback } from "react";
import { ReservationFormData, AdditionalDriver } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, CreditCard, Globe, CalendarDays, UserPlus, FileText } from "lucide-react";
import { Vehicle } from "@/hooks/useVehicles";
import { Link } from "react-router-dom";
import { DateInputField } from "@/components/ui/date-input-field";

interface Props {
  formData: ReservationFormData;
  updateForm: (u: Partial<ReservationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  rentalDays: number;
  vehicle: Vehicle | undefined;
  leadCaptureMode?: string;
  analytics?: {
    captureLeadField: (fields: Record<string, string>, step: number, capi_allowed?: boolean) => void;
    trackFieldCapture: (fields: Record<string, string>) => void;
    trackFacebookEvent: (eventName: string, customData?: Record<string, any>) => void;
    trackTikTokEvent: (eventName: string, params?: Record<string, any>) => void;
    trackGAEvent: (eventName: string, params?: Record<string, any>) => void;
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;

const AUTOFILL_FIELDS = [
  { name: "fname", key: "first_name" },
  { name: "lname", key: "last_name" },
  { name: "email", key: "email" },
  { name: "phone", key: "phone" },
] as const;

const NATIONALITIES = [
  "Marocaine",
  "Algérienne",
  "Allemande",
  "Américaine",
  "Belge",
  "Britannique",
  "Canadienne",
  "Chinoise",
  "Égyptienne",
  "Émiratie",
  "Espagnole",
  "Française",
  "Indienne",
  "Italienne",
  "Jordanienne",
  "Koweïtienne",
  "Libanaise",
  "Libyenne",
  "Mauritanienne",
  "Néerlandaise",
  "Nigériane",
  "Portugaise",
  "Qatarie",
  "Saoudienne",
  "Sénégalaise",
  "Suisse",
  "Tunisienne",
  "Turque",
  "Autre",
];

const StepDriverInfo = ({ formData, updateForm, onNext, onBack, analytics, leadCaptureMode = "blur" }: Props) => {
  const prevFieldsRef = useRef<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const isMoroccan = formData.nationality === "Marocaine";
  const addIsMoroccan = formData.additional_driver.nationality === "Marocaine";

  // Autofill detection
  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (!formRef.current || attempts > 6) { clearInterval(interval); return; }
      const updates: Partial<ReservationFormData> = {};
      let found = false;
      for (const { name, key } of AUTOFILL_FIELDS) {
        const input = formRef.current.querySelector<HTMLInputElement>(`[name="${name}"]`);
        if (input && input.value && input.value !== (formData as any)[key]) {
          (updates as any)[key] = input.value;
          found = true;
        }
      }
      if (found) { updateForm(updates); clearInterval(interval); }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const watched = ["first_name", "last_name", "email", "phone"] as const;
    const prev = prevFieldsRef.current;
    const nowFilled: Record<string, string> = {};
    let newlyFilledCount = 0;
    for (const key of watched) {
      const val = formData[key];
      if (val) { nowFilled[key] = val; if (!prev[key]) newlyFilledCount++; }
    }
    prevFieldsRef.current = nowFilled;
    if (newlyFilledCount >= 2 && analytics) {
      const allFields = collectAllFields();
      const capiAllowed = leadCaptureMode !== "submit";
      analytics.captureLeadField(allFields, 3, capiAllowed);
      analytics.trackFieldCapture(allFields);
    }
  }, [formData.first_name, formData.last_name, formData.email, formData.phone]);

  const collectAllFields = (): Record<string, string> => {
    const fields: Record<string, string> = {};
    if (formData.first_name) fields.first_name = formData.first_name;
    if (formData.last_name) fields.last_name = formData.last_name;
    if (formData.email) fields.email = formData.email;
    if (formData.phone) fields.phone = formData.phone;
    if (formData.license_number) fields.license_number = formData.license_number;
    if (formData.nationality) fields.nationality = formData.nationality;
    if (formData.dob) fields.dob = formData.dob;
    if (formData.cin) fields.cin = formData.cin;
    if (formData.passport) fields.passport = formData.passport;
    if (formData.license_delivery_date) fields.license_delivery_date = formData.license_delivery_date;
    return fields;
  };

  const validateEmail = (value: string, fieldKey: string) => {
    if (!value) { setErrors(p => { const n = { ...p }; delete n[fieldKey]; return n; }); return; }
    if (!EMAIL_REGEX.test(value)) {
      setErrors(p => ({ ...p, [fieldKey]: "Format invalide. Exemple : nom@domaine.com" }));
    } else {
      setErrors(p => { const n = { ...p }; delete n[fieldKey]; return n; });
    }
  };

  const validatePhone = (value: string, fieldKey: string) => {
    if (!value) { setErrors(p => { const n = { ...p }; delete n[fieldKey]; return n; }); return; }
    const cleaned = value.replace(/[\s\-\.]/g, "");
    if (!PHONE_REGEX.test(cleaned)) {
      setErrors(p => ({ ...p, [fieldKey]: "Format invalide. Exemples : 0600000000 ou +212600000000" }));
    } else {
      setErrors(p => { const n = { ...p }; delete n[fieldKey]; return n; });
    }
  };

  const handleBlur = (field: string, value: string) => {
    if (field === "email") validateEmail(value, "email");
    if (field === "phone") validatePhone(value, "phone");
    if (!value || !analytics) return;
    const fields: Record<string, string> = { [field]: value, ...collectAllFields() };
    const capiAllowed = leadCaptureMode !== "submit";
    analytics.captureLeadField(fields, 3, capiAllowed);
    analytics.trackFieldCapture(fields);
  };

  const updateAdditionalDriver = (updates: Partial<AdditionalDriver>) => {
    updateForm({ additional_driver: { ...formData.additional_driver, ...updates } });
  };

  const handleNext = () => {
    if (analytics) {
      const fields = collectAllFields();
      if (Object.keys(fields).length > 0) {
        analytics.captureLeadField(fields, 3, true);
        analytics.trackFieldCapture(fields);
      }
    }
    if (formData.email) sessionStorage.setItem("fb_em", formData.email);
    if (formData.first_name) sessionStorage.setItem("fb_fn", formData.first_name);
    if (formData.last_name) sessionStorage.setItem("fb_ln", formData.last_name);
    if (formData.phone) sessionStorage.setItem("fb_ph", formData.phone);

    if (analytics) {
      analytics.trackFacebookEvent("Lead", { content_name: "reservation_driver_info" });
      analytics.trackTikTokEvent("SubmitForm");
      analytics.trackGAEvent("generate_lead", { event_category: "reservation" });
    }

    onNext();
  };

  const additionalDriverValid = !formData.has_additional_driver || (
    formData.additional_driver.first_name &&
    formData.additional_driver.last_name &&
    formData.additional_driver.phone &&
    formData.additional_driver.license_number &&
    (addIsMoroccan ? formData.additional_driver.cin : formData.additional_driver.passport) &&
    !errors.add_email && !errors.add_phone
  );

  const idValid = isMoroccan ? !!formData.cin : !!formData.passport;

  const isValid =
    formData.first_name &&
    formData.last_name &&
    formData.email &&
    formData.phone &&
    formData.license_number &&
    formData.terms_accepted &&
    idValid &&
    !errors.email && !errors.phone &&
    additionalDriverValid;

  const ErrorMsg = ({ field }: { field: string }) => errors[field] ? (
    <p className="text-xs text-destructive mt-1">{errors[field]}</p>
  ) : null;

  return (
    <form ref={formRef} autoComplete="on" onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <h2 className="text-xl font-semibold">Informations du conducteur</h2>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User size={16} className="text-primary" /> Conducteur principal
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prénom *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" name="fname" autoComplete="given-name" value={formData.first_name} onChange={(e) => updateForm({ first_name: e.target.value })} placeholder="Votre prénom" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" name="lname" autoComplete="family-name" value={formData.last_name} onChange={(e) => updateForm({ last_name: e.target.value })} placeholder="Votre nom" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" type="email" name="email" autoComplete="email" value={formData.email} onChange={(e) => updateForm({ email: e.target.value })} onBlur={(e) => handleBlur("email", e.target.value)} placeholder="email@exemple.com" />
            </div>
            <ErrorMsg field="email" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Téléphone *</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" name="phone" autoComplete="tel" value={formData.phone} onChange={(e) => updateForm({ phone: e.target.value })} onBlur={(e) => handleBlur("phone", e.target.value)} placeholder="+212 6 00 00 00 00" />
            </div>
            <ErrorMsg field="phone" />
          </div>

          {/* Nationality dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nationalité *</label>
            <Select value={formData.nationality} onValueChange={(v) => {
              updateForm({ nationality: v, cin: "", passport: "" });
            }}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Sélectionner" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {NATIONALITIES.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional CIN / Passport — NO CIN expiry */}
          {isMoroccan ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">N° CIN *</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={formData.cin} onChange={(e) => updateForm({ cin: e.target.value })} placeholder="Ex: AB123456" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">N° Passeport *</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={formData.passport} onChange={(e) => updateForm({ passport: e.target.value })} placeholder="Numéro de passeport" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">N° Permis de conduire *</label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" name="license" autoComplete="off" value={formData.license_number} onChange={(e) => updateForm({ license_number: e.target.value })} placeholder="Numéro du permis" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de délivrance du permis</label>
            <DateInputField
              value={formData.license_delivery_date}
              onChange={(v) => updateForm({ license_delivery_date: v })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de naissance</label>
            <DateInputField
              value={formData.dob}
              onChange={(v) => updateForm({ dob: v })}
              showAge
              maxDate={new Date()}
            />
          </div>
        </div>
      </div>

      {/* Additional driver toggle */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={formData.has_additional_driver}
            onCheckedChange={(checked) => updateForm({ has_additional_driver: checked === true })}
          />
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-primary" />
            <span className="text-sm font-medium">Ajouter un conducteur supplémentaire</span>
          </div>
        </label>

        {formData.has_additional_driver && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prénom *</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={formData.additional_driver.first_name} onChange={(e) => updateAdditionalDriver({ first_name: e.target.value })} placeholder="Prénom" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom *</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={formData.additional_driver.last_name} onChange={(e) => updateAdditionalDriver({ last_name: e.target.value })} placeholder="Nom" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" type="email" value={formData.additional_driver.email} onChange={(e) => updateAdditionalDriver({ email: e.target.value })} onBlur={(e) => validateEmail(e.target.value, "add_email")} placeholder="email@exemple.com" />
              </div>
              <ErrorMsg field="add_email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Téléphone *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={formData.additional_driver.phone} onChange={(e) => updateAdditionalDriver({ phone: e.target.value })} onBlur={(e) => validatePhone(e.target.value, "add_phone")} placeholder="+212 6 00 00 00 00" />
              </div>
              <ErrorMsg field="add_phone" />
            </div>

            {/* Additional driver nationality */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nationalité *</label>
              <Select value={formData.additional_driver.nationality} onValueChange={(v) => {
                updateAdditionalDriver({ nationality: v, cin: "", passport: "" });
              }}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Sélectionner" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITIES.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional driver CIN / Passport — NO CIN expiry */}
            {addIsMoroccan ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">N° CIN *</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" value={formData.additional_driver.cin} onChange={(e) => updateAdditionalDriver({ cin: e.target.value })} placeholder="Ex: AB123456" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">N° Passeport *</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" value={formData.additional_driver.passport} onChange={(e) => updateAdditionalDriver({ passport: e.target.value })} placeholder="Numéro de passeport" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">N° Permis de conduire *</label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={formData.additional_driver.license_number} onChange={(e) => updateAdditionalDriver({ license_number: e.target.value })} placeholder="Numéro du permis" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de délivrance du permis</label>
              <DateInputField
                value={formData.additional_driver.license_delivery_date}
                onChange={(v) => updateAdditionalDriver({ license_delivery_date: v })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de naissance</label>
              <DateInputField
                value={formData.additional_driver.dob}
                onChange={(v) => updateAdditionalDriver({ dob: v })}
                showAge
                maxDate={new Date()}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          checked={formData.terms_accepted}
          onCheckedChange={(checked) => updateForm({ terms_accepted: checked === true })}
        />
        <label className="text-sm">
          J'accepte les{" "}
          <Link to="/conditions-generales" target="_blank" className="text-primary font-medium hover:underline">
            conditions générales de location
          </Link>
          , la politique de confidentialité, et je consens à recevoir des offres et promotions par email.
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-xl px-8 w-full sm:w-auto">Retour</Button>
        <Button onClick={handleNext} disabled={!isValid} className="bg-primary text-primary-foreground hover:bg-accent rounded-xl px-8 h-12 font-semibold w-full sm:w-auto">
          Continuer
        </Button>
      </div>
    </form>
  );
};

export default StepDriverInfo;
