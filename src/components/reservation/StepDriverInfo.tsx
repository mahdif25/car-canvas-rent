import { ReservationFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Phone, CreditCard, Globe, CalendarDays } from "lucide-react";
import { Vehicle } from "@/hooks/useVehicles";

interface Props {
  formData: ReservationFormData;
  updateForm: (u: Partial<ReservationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  rentalDays: number;
  vehicle: Vehicle | undefined;
  analytics?: {
    captureLeadField: (fields: Record<string, string>, step: number) => void;
    trackFieldCapture: (fields: Record<string, string>) => void;
  };
}

const StepDriverInfo = ({ formData, updateForm, onNext, onBack, analytics }: Props) => {
  const handleBlur = (field: string, value: string) => {
    if (!value || !analytics) return;
    const fields: Record<string, string> = { [field]: value };
    if (formData.first_name) fields.first_name = formData.first_name;
    if (formData.last_name) fields.last_name = formData.last_name;
    if (formData.email) fields.email = formData.email;
    if (formData.phone) fields.phone = formData.phone;
    if (formData.license_number) fields.license_number = formData.license_number;
    analytics.captureLeadField(fields, 3);
    analytics.trackFieldCapture(fields);
  };

  const isValid =
    formData.first_name &&
    formData.last_name &&
    formData.email &&
    formData.phone &&
    formData.license_number &&
    formData.terms_accepted;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Informations du conducteur</h2>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User size={16} className="text-primary" /> Informations personnelles
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prénom *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={formData.first_name} onChange={(e) => updateForm({ first_name: e.target.value })} onBlur={(e) => handleBlur("first_name", e.target.value)} placeholder="Votre prénom" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={formData.last_name} onChange={(e) => updateForm({ last_name: e.target.value })} onBlur={(e) => handleBlur("last_name", e.target.value)} placeholder="Votre nom" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" type="email" value={formData.email} onChange={(e) => updateForm({ email: e.target.value })} onBlur={(e) => handleBlur("email", e.target.value)} placeholder="email@exemple.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Téléphone *</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={formData.phone} onChange={(e) => updateForm({ phone: e.target.value })} onBlur={(e) => handleBlur("phone", e.target.value)} placeholder="+212 6 00 00 00 00" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">N° Permis de conduire *</label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={formData.license_number} onChange={(e) => updateForm({ license_number: e.target.value })} onBlur={(e) => handleBlur("license_number", e.target.value)} placeholder="Numéro du permis" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nationalité</label>
            <div className="relative">
              <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={formData.nationality} onChange={(e) => updateForm({ nationality: e.target.value })} placeholder="Marocaine" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de naissance</label>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" type="date" value={formData.dob} onChange={(e) => updateForm({ dob: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          checked={formData.terms_accepted}
          onCheckedChange={(checked) => updateForm({ terms_accepted: checked === true })}
        />
        <label className="text-sm">
          J'accepte les <span className="text-primary font-medium cursor-pointer hover:underline">conditions générales de location</span> et la politique de confidentialité.
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-xl px-8 w-full sm:w-auto">Retour</Button>
        <Button onClick={onNext} disabled={!isValid} className="bg-primary text-primary-foreground hover:bg-accent rounded-xl px-8 h-12 font-semibold w-full sm:w-auto">
          Continuer
        </Button>
      </div>
    </div>
  );
};

export default StepDriverInfo;
