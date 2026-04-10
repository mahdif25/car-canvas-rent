import { useState } from "react";
import { ReservationFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Tag, Check, X, User, Mail, Phone, CreditCard, Globe, CalendarDays } from "lucide-react";
import { Vehicle } from "@/hooks/useVehicles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  formData: ReservationFormData;
  updateForm: (u: Partial<ReservationFormData>) => void;
  onConfirm: () => void;
  onBack: () => void;
  rentalDays: number;
  vehicle: Vehicle | undefined;
  analytics?: {
    captureLeadField: (fields: Record<string, string>, step: number) => void;
    trackFieldCapture: (fields: Record<string, string>) => void;
  };
}

const StepDriverInfo = ({ formData, updateForm, onConfirm, onBack, vehicle, analytics }: Props) => {
  const [promoInput, setPromoInput] = useState(formData.promo_code || "");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoApplied, setPromoApplied] = useState(!!formData.coupon_id);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", promoInput.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error("Code promo invalide ou expiré");
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error("Ce code promo a expiré");
        return;
      }

      if (data.max_uses !== null && data.current_uses >= data.max_uses) {
        toast.error("Ce code promo a atteint sa limite d'utilisation");
        return;
      }

      updateForm({
        promo_code: data.code,
        discount_amount: Number(data.discount_amount),
        coupon_id: data.id,
      });
      setPromoApplied(true);
      toast.success(`Code promo appliqué : -${Number(data.discount_amount).toLocaleString()} MAD`);
    } catch {
      toast.error("Erreur lors de la vérification du code");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    updateForm({ promo_code: "", discount_amount: 0, coupon_id: "" });
    setPromoApplied(false);
    setPromoInput("");
  };

  const handleBlur = (field: string, value: string) => {
    if (!value || !analytics) return;
    const fields: Record<string, string> = { [field]: value };
    if (formData.first_name) fields.first_name = formData.first_name;
    if (formData.last_name) fields.last_name = formData.last_name;
    if (formData.email) fields.email = formData.email;
    if (formData.phone) fields.phone = formData.phone;
    if (formData.license_number) fields.license_number = formData.license_number;
    analytics.captureLeadField(fields, 4);
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

      {vehicle && (
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
          <Shield className="text-primary shrink-0 mt-0.5" size={24} />
          <div>
            <p className="font-medium">Caution : {Number(vehicle.security_deposit).toLocaleString()} MAD</p>
            <p className="text-sm text-muted-foreground mt-1">
              Un dépôt de garantie de {Number(vehicle.security_deposit).toLocaleString()} MAD sera demandé lors de la prise en charge du véhicule. 
              Ce montant vous sera intégralement restitué après inspection du véhicule lors de la restitution.
            </p>
          </div>
        </div>
      )}

      {/* Promo code section */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <label className="text-sm font-medium flex items-center gap-1"><Tag size={14} className="text-primary" /> Code promo</label>
        {promoApplied ? (
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <Check size={16} className="text-primary" />
            <span className="text-sm font-medium">{formData.promo_code}</span>
            <span className="text-sm text-primary">-{formData.discount_amount.toLocaleString()} MAD</span>
            <button onClick={handleRemovePromo} className="ml-auto text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Entrez votre code promo" onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()} />
            <Button type="button" variant="outline" onClick={handleApplyPromo} disabled={promoLoading || !promoInput.trim()} className="shrink-0 rounded-xl">
              {promoLoading ? "..." : "Appliquer"}
            </Button>
          </div>
        )}
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
        <Button onClick={onConfirm} disabled={!isValid} className="bg-primary text-primary-foreground hover:bg-accent rounded-xl px-8 h-12 font-semibold w-full sm:w-auto">
          Confirmer la réservation
        </Button>
      </div>
    </div>
  );
};

export default StepDriverInfo;
