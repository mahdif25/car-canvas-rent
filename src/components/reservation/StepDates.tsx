import { useState, useEffect, useRef } from "react";
import { ReservationFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Location } from "@/hooks/useLocations";
import { DateInputField } from "@/components/ui/date-input-field";
import { MapPin, Calendar, Clock } from "lucide-react";

interface Props {
  formData: ReservationFormData;
  updateForm: (u: Partial<ReservationFormData>) => void;
  onNext: () => void;
  locations: Location[];
}

const StepDates = ({ formData, updateForm, onNext, locations }: Props) => {
  const [differentDropoff, setDifferentDropoff] = useState(
    !!(formData.return_location && formData.return_location !== formData.pickup_location)
  );
  const pickupTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!formData.pickup_location) {
      const timer = setTimeout(() => {
        pickupTriggerRef.current?.click();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const isValid = formData.pickup_location && formData.pickup_date && formData.return_date && formData.pickup_date < formData.return_date;

  const handleDifferentToggle = (checked: boolean) => {
    setDifferentDropoff(checked);
    if (!checked) {
      updateForm({ return_location: "" });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dates & Lieu</h2>

      {/* Location card */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin size={16} className="text-primary" /> Lieu
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Lieu de prise en charge</label>
          <Select value={formData.pickup_location} onValueChange={(v) => updateForm({ pickup_location: v })}>
            <SelectTrigger ref={pickupTriggerRef}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              {locations.map((l) => (
                <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox checked={differentDropoff} onCheckedChange={(c) => handleDifferentToggle(c === true)} />
          <label className="text-sm font-medium cursor-pointer" onClick={() => handleDifferentToggle(!differentDropoff)}>
            Retour dans un lieu différent
          </label>
        </div>

        {differentDropoff && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Lieu de retour</label>
            <Select value={formData.return_location || ""} onValueChange={(v) => updateForm({ return_location: v })}>
              <SelectTrigger><SelectValue placeholder="Sélectionner le lieu de retour" /></SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Dates card */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Calendar size={16} className="text-primary" /> Dates
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de départ</label>
            <DateInputField
              value={formData.pickup_date}
              onChange={(v) => updateForm({ pickup_date: v })}
              placeholder="JJ/MM/AAAA"
              minDate={new Date()}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Clock size={14} className="text-primary" /> Heure de départ
            </label>
            <Input type="time" value={formData.pickup_time} onChange={(e) => updateForm({ pickup_time: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de retour</label>
            <DateInputField
              value={formData.return_date}
              onChange={(v) => updateForm({ return_date: v })}
              placeholder="JJ/MM/AAAA"
              minDate={formData.pickup_date ? new Date(formData.pickup_date) : new Date()}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Clock size={14} className="text-primary" /> Heure de retour
            </label>
            <Input type="time" value={formData.return_time} onChange={(e) => updateForm({ return_time: e.target.value })} />
          </div>
        </div>
      </div>

      <Button onClick={onNext} disabled={!isValid} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-accent rounded-xl px-8 h-12 font-semibold">
        Continuer
      </Button>
    </div>
  );
};

export default StepDates;
