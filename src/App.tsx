import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Fleet from "./pages/Fleet";
import VehicleDetail from "./pages/VehicleDetail";
import Reservation from "./pages/Reservation";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFleet from "./pages/admin/AdminFleet";
import AdminAddons from "./pages/admin/AdminAddons";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminLocations from "./pages/admin/AdminLocations";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminBroadcast from "./pages/admin/AdminBroadcast";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";
import ConditionsGenerales from "./pages/ConditionsGenerales";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CautionPolicy from "./pages/CautionPolicy";
import TrackReservation from "./pages/TrackReservation";
import Unsubscribe from "./pages/Unsubscribe";
import TrackingScripts from "./components/TrackingScripts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <TrackingScripts />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/fleet/:slug" element={<VehicleDetail />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/conditions-generales" element={<ConditionsGenerales />} />
            <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
            <Route path="/politique-caution" element={<CautionPolicy />} />
            <Route path="/suivi-reservation" element={<TrackReservation />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/fleet" element={<AdminFleet />} />
            <Route path="/admin/addons" element={<AdminAddons />} />
            <Route path="/admin/reservations" element={<AdminReservations />} />
            <Route path="/admin/locations" element={<AdminLocations />} />
            <Route path="/admin/marketing" element={<AdminMarketing />} />
            <Route path="/admin/broadcast" element={<AdminBroadcast />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
