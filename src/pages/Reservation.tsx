import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ReservationFormData } from "@/lib/types";
import { useVehicles, usePricingTiers, useAddons, getDailyRateFromTiers, type Vehicle } from "@/hooks/useVehicles";
import { useLocations, getDeliveryFee } from "@/hooks/useLocations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StepDates from "@/components/reservation/StepDates";
import StepVehicle from "@/components/reservation/StepVehicle";
import StepDriverInfo from "@/components/reservation/StepDriverInfo";
import StepSummary from "@/components/reservation/StepSummary";
import StepConfirmation from "@/components/reservation/StepConfirmation";
import ReservationSidebar from "@/components/reservation/ReservationSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Check } from "lucide-react";

const STORAGE_KEY = "reservation_form";
const STEP_KEY = "reservation_step";

const steps = [
  { label: "Dates", number: 1 },
  { label: "Véhicule", number: 2 },
  { label: "Infos", number: 3 },
  { label: "Résumé", number: 4 },
];

const defaultFormData: ReservationFormData = {
  pickup_location: "",
  pickup_date: "",
  pickup_time: "09:00",
  return_location: "",
  return_date: "",
  return_time: "09:00",
  vehicle_id: "",
  selected_addons: [],
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  license_number: "",
  nationality: "Marocaine",
  dob: "",
  terms_accepted: false,
  promo_code: "",
  discount_amount: 0,
  coupon_id: "",
  has_additional_driver: false,
  selected_color_id: "",
  cin: "",
  passport: "",
  license_delivery_date: "",
  cin_expiry_date: "",
  additional_driver: {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    license_number: "",
    nationality: "Marocaine",
    dob: "",
    cin: "",
    passport: "",
    license_delivery_date: "",
    cin_expiry_date: "",
  },
};

function getInitialState(searchParams: URLSearchParams) {
  const savedForm = sessionStorage.getItem(STORAGE_KEY);
  const savedStep = sessionStorage.getItem(STEP_KEY);

  const urlLocation = searchParams.get("location") || "";
  const urlPickup = searchParams.get("pickup") || "";
  const urlReturn = searchParams.get("return") || "";
  const urlVehicle = searchParams.get("vehicle") || "";
  const urlColor = searchParams.get("color") || "";
  const hasUrlParams = urlLocation || urlPickup || urlReturn || urlVehicle;

  let formData = { ...defaultFormData };
  let step = 1;

  if (savedForm) {
    try {
      formData = { ...defaultFormData, ...JSON.parse(savedForm) };
      step = savedStep ? parseInt(savedStep, 10) || 1 : 1;
    } catch { /* ignore */ }
  }

  // URL params override stored values when present
  if (hasUrlParams) {
    if (urlLocation) formData.pickup_location = urlLocation;
    if (urlPickup) formData.pickup_date = urlPickup;
    if (urlReturn) formData.return_date = urlReturn;
    if (urlVehicle) formData.vehicle_id = urlVehicle;
    if (urlColor) formData.selected_color_id = urlColor;
  }

  return { formData, step };
}

const Reservation = () => {
  const [searchParams] = useSearchParams();

  const [initialized] = useState(() => getInitialState(searchParams));
  const [currentStep, setCurrentStep] = useState(initialized.step);
  const [formData, setFormData] = useState<ReservationFormData>(initialized.formData);

  const [confirmationId, setConfirmationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const analytics = useAnalytics();
  const { data: siteSettings } = useSiteSettings();

  // Persist form data and step to sessionStorage
  useEffect(() => {
    if (currentStep < 5) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      sessionStorage.setItem(STEP_KEY, String(currentStep));
    }
  }, [formData, currentStep]);

  useEffect(() => {
    analytics.trackReservationStep(currentStep, {
      vehicle_id: formData.vehicle_id || undefined,
      pickup_location: formData.pickup_location || undefined,
    });

    // Multi-platform events per step
    if (currentStep === 2) {
      analytics.trackFacebookEvent("ViewContent", { content_ids: [formData.vehicle_id] });
      analytics.trackTikTokEvent("ViewContent", { content_id: formData.vehicle_id });
      analytics.trackGAEvent("view_item", { items: [{ item_id: formData.vehicle_id }] });
    }
    if (currentStep === 3) {
      analytics.trackFacebookEvent("InitiateCheckout", {
        currency: "MAD",
        content_ids: [formData.vehicle_id],
      });
      analytics.trackTikTokEvent("InitiateCheckout", { content_id: formData.vehicle_id });
      analytics.trackGAEvent("begin_checkout", { items: [{ item_id: formData.vehicle_id }] });
    }
    if (currentStep === 4) {
      analytics.trackFacebookEvent("AddPaymentInfo", { currency: "MAD" });
      analytics.trackTikTokEvent("AddPaymentInfo");
      analytics.trackGAEvent("add_payment_info");
    }
  }, [currentStep]);

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

  const handleChangeVehicle = () => setCurrentStep(2);

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
      const totalPrice = vehicleTotal + addonsTotal + deliveryFee - formData.discount_amount;
      const finalTotal = Math.max(0, totalPrice);
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
          customer_cin: formData.cin || null,
          customer_passport: formData.passport || null,
          customer_license_delivery_date: formData.license_delivery_date || null,
          customer_cin_expiry_date: formData.cin_expiry_date || null,
          total_price: finalTotal,
          deposit_amount: depositAmount,
          delivery_fee: deliveryFee,
          coupon_id: formData.coupon_id || null,
          discount_amount: formData.discount_amount,
          marketing_consent: true,
          selected_color_id: formData.selected_color_id || null,
        } as any)
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

      if (formData.coupon_id) {
        await supabase.from("coupon_usages").insert({
          coupon_id: formData.coupon_id,
          reservation_id: reservation.id,
          customer_email: formData.email,
          discount_applied: formData.discount_amount,
        });
      }

      if (formData.has_additional_driver && formData.additional_driver.first_name) {
        const { error: addDriverErr } = await supabase.from("additional_drivers").insert({
          reservation_id: reservation.id,
          first_name: formData.additional_driver.first_name,
          last_name: formData.additional_driver.last_name,
          email: formData.additional_driver.email || null,
          phone: formData.additional_driver.phone || null,
          license_number: formData.additional_driver.license_number,
          nationality: formData.additional_driver.nationality || null,
          dob: formData.additional_driver.dob || null,
          cin: formData.additional_driver.cin || null,
          passport: formData.additional_driver.passport || null,
          license_delivery_date: formData.additional_driver.license_delivery_date || null,
          cin_expiry_date: formData.additional_driver.cin_expiry_date || null,
        } as any);
        if (addDriverErr) console.error("Additional driver insert error:", addDriverErr);
      }

      const confId = reservation.id.slice(0, 8).toUpperCase();
      setConfirmationId(confId);
      analytics.markLeadCompleted(reservation.id);
      analytics.trackFacebookEvent("Purchase", {
        currency: "MAD",
        value: finalTotal,
        content_ids: [formData.vehicle_id],
      });
      analytics.trackTikTokEvent("CompletePayment", {
        content_id: formData.vehicle_id,
        currency: "MAD",
        value: finalTotal,
      });
      analytics.trackGAEvent("purchase", {
        currency: "MAD",
        value: finalTotal,
        items: [{ item_id: formData.vehicle_id }],
      });

      // Clear session storage on success
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STEP_KEY);

      const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
      const addonDetails = formData.selected_addons.map((id) => {
        const addon = addons.find((a) => a.id === id);
        return addon ? { name: `${addon.name} (${rentalDays}j)`, total: Number(addon.price_per_day) * rentalDays } : null;
      }).filter(Boolean);

      const emailData = {
        customerName: formData.first_name,
        confirmationId: confId,
        vehicleName: selectedVehicle?.name || "",
        pickupDate: fmtDate(formData.pickup_date),
        returnDate: fmtDate(formData.return_date),
        pickupLocation: formData.pickup_location,
        returnLocation: formData.return_location || formData.pickup_location,
        rentalDays,
        dailyRate,
        vehicleTotal,
        addonsDetails: addonDetails,
        deliveryFee,
        discountAmount: formData.discount_amount,
        depositAmount,
        totalPrice: finalTotal,
      };

      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "reservation-confirmation",
          recipientEmail: formData.email,
          idempotencyKey: `res-confirm-${reservation.id}`,
          templateData: emailData,
        },
      }).catch(console.error);

      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "welcome-email",
          recipientEmail: formData.email,
          idempotencyKey: `welcome-${reservation.id}`,
          templateData: { customerName: formData.first_name },
        },
      }).catch(console.error);

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
      <section className="py-10 pb-28 lg:pb-10">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">
            <span className="text-primary">Réservation</span>
          </h1>

          {currentStep <= 4 && (
            <div className="flex items-center justify-center mb-10 px-4">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        currentStep > step.number
                          ? "bg-primary text-primary-foreground"
                          : currentStep === step.number
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? <Check size={18} /> : step.number}
                    </div>
                    <span
                      className={`text-xs mt-2 hidden sm:block ${
                        currentStep >= step.number ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                    {currentStep === step.number && (
                      <span className="text-xs mt-1 font-semibold sm:hidden">{step.label}</span>
                    )}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                        currentStep > step.number ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={currentStep <= 4 ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : ""}>
            <div className={currentStep <= 4 ? "lg:col-span-2" : ""}>
              {currentStep === 1 && (
                <StepDates formData={formData} updateForm={updateForm} onNext={nextStep} locations={locations} />
              )}
              {currentStep === 2 && (
                <StepVehicle formData={formData} updateForm={updateForm} rentalDays={rentalDays} onNext={nextStep} onBack={prevStep} vehicles={vehicles} pricingTiers={pricingTiers} />
              )}
              {currentStep === 3 && (
                <StepDriverInfo formData={formData} updateForm={updateForm} onNext={nextStep} onBack={prevStep} rentalDays={rentalDays} vehicle={selectedVehicle} analytics={analytics} leadCaptureMode={siteSettings?.lead_capture_mode || "blur"} />
              )}
              {currentStep === 4 && (
                <StepSummary formData={formData} updateForm={updateForm} onConfirm={handleConfirm} onBack={prevStep} rentalDays={rentalDays} vehicles={vehicles} pricingTiers={pricingTiers} addons={addons} locations={locations} isSubmitting={isSubmitting} />
              )}
              {currentStep === 5 && (
                <StepConfirmation formData={formData} confirmationId={confirmationId} rentalDays={rentalDays} vehicle={selectedVehicle} pricingTiers={pricingTiers} addons={addons} locations={locations} />
              )}
            </div>

            {currentStep <= 4 && (
              <div className="lg:col-span-1">
                <ReservationSidebar formData={formData} rentalDays={rentalDays} vehicles={vehicles} pricingTiers={pricingTiers} addons={addons} locations={locations} currentStep={currentStep} onChangeVehicle={handleChangeVehicle} />
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Reservation;
