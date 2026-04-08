import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ReservationFormData } from "@/lib/types";
import { useVehicles, usePricingTiers, useAddons, getDailyRateFromTiers } from "@/hooks/useVehicles";
import { useLocations, getDeliveryFee } from "@/hooks/useLocations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StepDates from "@/components/reservation/StepDates";
import StepVehicle from "@/components/reservation/StepVehicle";
import StepAddons from "@/components/reservation/StepAddons";
import StepDriverInfo from "@/components/reservation/StepDriverInfo";
import StepConfirmation from "@/components/reservation/StepConfirmation";
import ReservationSidebar from "@/components/reservation/ReservationSidebar";
import { Skeleton } from "@/components/ui/skeleton";

const steps = [
  { label: "Dates & Lieu", number: 1 },
  { label: "Véhicule", number: 2 },
  { label: "Options", number: 3 },
  { label: "Informations", number: 4 },
  { label: "Confirmation", number: 5 },
];

const Reservation = () => {
  const [searchParams] = useSearchParams();
  const preselectedVehicle = searchParams.get("vehicle") || "";

  const [currentStep, setCurrentStep] = useState(preselectedVehicle ? 2 : 1);
  const [formData, setFormData] = useState<ReservationFormData>({
    pickup_location: searchParams.get("location") || "",
    pickup_date: searchParams.get("pickup") || "",
    pickup_time: "09:00",
    return_location: "",
    return_date: searchParams.get("return") || "",
    return_time: "09:00",
    vehicle_id: preselectedVehicle,
    selected_addons: [],
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    license_number: "",
    nationality: "",
    dob: "",
    terms_accepted: false,
  });

  const [confirmationId, setConfirmationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: vehicles = [], isLoading: loadingVehicles } = useVehicles();
  const { data: pricingTiers = [], isLoading: loadingTiers } = usePricingTiers();
  const { data: addons = [], isLoading: loadingAddons } = useAddons();
  const { data: locations = [], isLoading: loadingLocations } = useLocations();

  const updateForm = (updates: Partial<ReservationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const rentalDays = useMemo(() => {
    if (!formData.pickup_date || !formData.return_date) return 0;
    const diff = new Date(formData.return_date).getTime() - new Date(formData.pickup_date).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [formData.pickup_date, formData.return_date]);

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicle_id);

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const tiers = pricingTiers.filter((t) => t.vehicle_id === formData.vehicle_id);
      const dailyRate = getDailyRateFromTiers(tiers, rentalDays);
      const vehicleTotal = dailyRate * rentalDays;
      const addonsTotal = formData.selected_addons.reduce((sum, id) => {
        const addon = addons.find((a) => a.id === id);
        return sum + (addon ? Number(addon.price_per_day) * rentalDays : 0);
      }, 0);
      const deliveryFee = getDeliveryFee(
        locations,
        formData.pickup_location,
        formData.return_location || formData.pickup_location
      );
      const totalPrice = vehicleTotal + addonsTotal + deliveryFee;
      const depositAmount = selectedVehicle ? Number(selectedVehicle.security_deposit) : 0;

      const { data: reservation, error } = await supabase
        .from("reservations")
        .insert({
          vehicle_id: formData.vehicle_id,
          pickup_date: formData.pickup_date,
          return_date: formData.return_date,
          pickup_time: formData.pickup_time,
          return_time: formData.return_time,
          pickup_location: formData.pickup_location,
          return_location: formData.return_location || formData.pickup_location,
          customer_first_name: formData.first_name,
          customer_last_name: formData.last_name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_license: formData.license_number,
          customer_nationality: formData.nationality || null,
          customer_dob: formData.dob || null,
          total_price: totalPrice,
          deposit_amount: depositAmount,
          delivery_fee: deliveryFee,
        })
        .select()
        .single();

      if (error) throw error;

      if (formData.selected_addons.length > 0) {
        const addonRows = formData.selected_addons.map((addon_id) => ({
          reservation_id: reservation.id,
          addon_id,
        }));
        const { error: addonError } = await supabase.from("reservation_addons").insert(addonRows);
        if (addonError) console.error("Addon insert error:", addonError);
      }

      setConfirmationId(reservation.id.slice(0, 8).toUpperCase());
      nextStep();
    } catch (err: any) {
      console.error("Reservation error:", err);
      toast.error("Erreur lors de la réservation. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loadingVehicles || loadingTiers || loadingAddons || loadingLocations;

  if (isLoading) {
    return (
      <Layout>
        <section className="py-10">
          <div className="container">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-10">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">
            <span className="text-primary">Réservation</span>
          </h1>

          {currentStep < 5 && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto">
              {steps.slice(0, 4).map((step) => (
                <div key={step.number} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                      currentStep >= step.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-sm whitespace-nowrap ${
                      currentStep >= step.number ? "font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.number < 4 && (
                    <div className={`w-8 h-px ${currentStep > step.number ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={currentStep < 5 ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : ""}>
            <div className={currentStep < 5 ? "lg:col-span-2" : ""}>
              {currentStep === 1 && (
                <StepDates formData={formData} updateForm={updateForm} onNext={nextStep} locations={locations} />
              )}
              {currentStep === 2 && (
                <StepVehicle formData={formData} updateForm={updateForm} rentalDays={rentalDays} onNext={nextStep} onBack={prevStep} vehicles={vehicles} pricingTiers={pricingTiers} />
              )}
              {currentStep === 3 && (
                <StepAddons formData={formData} updateForm={updateForm} onNext={nextStep} onBack={prevStep} addons={addons} />
              )}
              {currentStep === 4 && (
                <StepDriverInfo formData={formData} updateForm={updateForm} onConfirm={handleConfirm} onBack={prevStep} rentalDays={rentalDays} vehicle={selectedVehicle} />
              )}
              {currentStep === 5 && (
                <StepConfirmation formData={formData} confirmationId={confirmationId} rentalDays={rentalDays} vehicle={selectedVehicle} pricingTiers={pricingTiers} addons={addons} locations={locations} />
              )}
            </div>

            {currentStep < 5 && (
              <div className="lg:col-span-1">
                <ReservationSidebar formData={formData} rentalDays={rentalDays} vehicles={vehicles} pricingTiers={pricingTiers} addons={addons} locations={locations} />
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Reservation;
