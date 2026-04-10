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
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";
import TrackingScripts from "./components/TrackingScripts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/fleet/:slug" element={<VehicleDetail />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/fleet" element={<AdminFleet />} />
            <Route path="/admin/addons" element={<AdminAddons />} />
            <Route path="/admin/reservations" element={<AdminReservations />} />
            <Route path="/admin/locations" element={<AdminLocations />} />
            <Route path="/admin/marketing" element={<AdminMarketing />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
