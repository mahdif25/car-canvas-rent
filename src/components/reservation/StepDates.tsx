import { ReservationFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locations } from "@/lib/mock-data";

interface Props {
  formData: ReservationFormData;
  updateForm: (u: Partial<ReservationFormData>) => void;
  onNext: () => void;
}

const StepDates = ({ formData, updateForm, onNext }: Props) => {
  const isValid = formData.pickup_location && formData.pickup_date && formData.return_date && formData.pickup_date < formData.return_date;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dates & Lieu</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Lieu de prise en charge</label>
          <Select value={formData.pickup_location} onValueChange={(v) => updateForm({ pickup_location: v })}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Lieu de retour</label>
          <Select value={formData.return_location || formData.pickup_location} onValueChange={(v) => updateForm({ return_location: v })}>
            <SelectTrigger><SelectValue placeholder="Même lieu" /></SelectTrigger>
            <SelectContent>
              {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date de départ</label>
          <Input type="date" value={formData.pickup_date} onChange={(e) => updateForm({ pickup_date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Heure de départ</label>
          <Input type="time" value={formData.pickup_time} onChange={(e) => updateForm({ pickup_time: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date de retour</label>
          <Input type="date" value={formData.return_date} onChange={(e) => updateForm({ return_date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Heure de retour</label>
          <Input type="time" value={formData.return_time} onChange={(e) => updateForm({ return_time: e.target.value })} />
        </div>
      </div>

      <Button onClick={onNext} disabled={!isValid} className="bg-primary text-primary-foreground hover:bg-accent rounded-pill px-8">
        Continuer
      </Button>
    </div>
  );
};

export default StepDates;
