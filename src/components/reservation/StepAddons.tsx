import { ReservationFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { mockAddons } from "@/lib/mock-data";
import { Check } from "lucide-react";

interface Props {
  formData: ReservationFormData;
  updateForm: (u: Partial<ReservationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepAddons = ({ formData, updateForm, onNext, onBack }: Props) => {
  const enabledAddons = mockAddons.filter((a) => a.is_enabled);

  const toggleAddon = (id: string) => {
    const current = formData.selected_addons;
    const updated = current.includes(id) ? current.filter((a) => a !== id) : [...current, id];
    updateForm({ selected_addons: updated });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Options supplémentaires</h2>
      <p className="text-sm text-muted-foreground">Sélectionnez les options souhaitées (facultatif)</p>

      {enabledAddons.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">Aucune option disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enabledAddons.map((addon) => {
            const isSelected = formData.selected_addons.includes(addon.id);
            return (
              <div
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{addon.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-semibold">{addon.price_per_day} MAD/j</span>
                    {isSelected && <Check size={20} className="text-primary" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-pill px-8">Retour</Button>
        <Button onClick={onNext} className="bg-primary text-primary-foreground hover:bg-accent rounded-pill px-8">
          Continuer
        </Button>
      </div>
    </div>
  );
};

export default StepAddons;
