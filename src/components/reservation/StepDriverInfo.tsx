import { ReservationFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import { Vehicle } from "@/hooks/useVehicles";

interface Props {
  formData: ReservationFormData;
  updateForm: (u: Partial<ReservationFormData>) => void;
  onConfirm: () => void;
  onBack: () => void;
  rentalDays: number;
  vehicle: Vehicle | undefined;
}

const StepDriverInfo = ({ formData, updateForm, onConfirm, onBack, vehicle }: Props) => {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Prénom *</label>
          <Input value={formData.first_name} onChange={(e) => updateForm({ first_name: e.target.value })} placeholder="Votre prénom" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Nom *</label>
          <Input value={formData.last_name} onChange={(e) => updateForm({ last_name: e.target.value })} placeholder="Votre nom" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email *</label>
          <Input type="email" value={formData.email} onChange={(e) => updateForm({ email: e.target.value })} placeholder="email@exemple.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Téléphone *</label>
          <Input value={formData.phone} onChange={(e) => updateForm({ phone: e.target.value })} placeholder="+212 6 00 00 00 00" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">N° Permis de conduire *</label>
          <Input value={formData.license_number} onChange={(e) => updateForm({ license_number: e.target.value })} placeholder="Numéro du permis" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Nationalité</label>
          <Input value={formData.nationality} onChange={(e) => updateForm({ nationality: e.target.value })} placeholder="Marocaine" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Date de naissance</label>
          <Input type="date" value={formData.dob} onChange={(e) => updateForm({ dob: e.target.value })} />
        </div>
      </div>

      {vehicle && (
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
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

      <div className="flex items-start gap-3">
        <Checkbox
          checked={formData.terms_accepted}
          onCheckedChange={(checked) => updateForm({ terms_accepted: checked === true })}
        />
        <label className="text-sm">
          J'accepte les <span className="text-primary font-medium cursor-pointer hover:underline">conditions générales de location</span> et la politique de confidentialité.
        </label>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-pill px-8">Retour</Button>
        <Button onClick={onConfirm} disabled={!isValid} className="bg-primary text-primary-foreground hover:bg-accent rounded-pill px-8">
          Confirmer la réservation
        </Button>
      </div>
    </div>
  );
};

export default StepDriverInfo;
