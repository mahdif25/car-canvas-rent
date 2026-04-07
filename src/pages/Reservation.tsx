import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ReservationFormData } from "@/lib/types";
import StepDates from "@/components/reservation/StepDates";
import StepVehicle from "@/components/reservation/StepVehicle";
import StepAddons from "@/components/reservation/StepAddons";
import StepDriverInfo from "@/components/reservation/StepDriverInfo";
import StepConfirmation from "@/components/reservation/StepConfirmation";
import ReservationSidebar from "@/components/reservation/ReservationSidebar";

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

  const handleConfirm = () => {
    const id = "CLX-" + Date.now().toString(36).toUpperCase();
    setConfirmationId(id);
    nextStep();
  };

  return (
    <Layout>
      <section className="py-10">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">
            <span className="text-primary">Réservation</span>
          </h1>

          {/* Step indicator */}
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
                <StepDates formData={formData} updateForm={updateForm} onNext={nextStep} />
              )}
              {currentStep === 2 && (
                <StepVehicle formData={formData} updateForm={updateForm} rentalDays={rentalDays} onNext={nextStep} onBack={prevStep} />
              )}
              {currentStep === 3 && (
                <StepAddons formData={formData} updateForm={updateForm} onNext={nextStep} onBack={prevStep} />
              )}
              {currentStep === 4 && (
                <StepDriverInfo formData={formData} updateForm={updateForm} onConfirm={handleConfirm} onBack={prevStep} rentalDays={rentalDays} />
              )}
              {currentStep === 5 && (
                <StepConfirmation formData={formData} confirmationId={confirmationId} rentalDays={rentalDays} />
              )}
            </div>

            {currentStep < 5 && (
              <div className="lg:col-span-1">
                <ReservationSidebar formData={formData} rentalDays={rentalDays} />
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Reservation;
