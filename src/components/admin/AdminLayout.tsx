import { ReactNode, useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Car, Settings, CalendarDays, LayoutDashboard, LogOut, MapPin, Menu, MoreHorizontal, BarChart3, Users, Tag, Puzzle, Mail, CarFront, Banknote } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

interface Props {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Flotte", path: "/admin/fleet", icon: Car },
  { label: "Parc Auto", path: "/admin/fleet-plates", icon: CarFront },
  { label: "Add-ons", path: "/admin/addons", icon: Puzzle },
  { label: "Réservations", path: "/admin/reservations", icon: CalendarDays },
  { label: "Lieux", path: "/admin/locations", icon: MapPin },
  { label: "Marketing", path: "/admin/marketing", icon: Tag },
  { label: "Broadcast", path: "/admin/broadcast", icon: Mail },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Leads", path: "/admin/leads", icon: Users },
  { label: "Finances", path: "/admin/finances", icon: Banknote },
];

const bottomNavItems = [
  navItems[0], // Dashboard
  navItems[1], // Flotte
  navItems[4], // Réservations
  navItems[9], // Leads
];

const AdminLayout = ({ children }: Props) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  const logoH = settings?.logo_height || 48;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Accès refusé</p>
          <p className="text-muted-foreground">Vous n'avez pas les droits administrateur.</p>
          <button onClick={async () => { await signOut(); window.location.href = "/"; }} className="text-primary hover:underline">Se déconnecter</button>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-secondary">
        {/* Mobile top header */}
        <header className="bg-dark text-dark-foreground flex items-center justify-between px-4 h-14 shrink-0">
          <Link to="/admin">
            <img src={logo} alt="Centre Lux Car" style={{ height: logoH }} className="brightness-200" />
          </Link>
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <button className="p-2"><Menu size={22} /></button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-dark text-dark-foreground w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="p-2 border-b border-foreground/10">
                <img src={logo} alt="Centre Lux Car" style={{ height: logoH }} className="brightness-200" />
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-foreground/5"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-foreground/10 mt-auto space-y-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === "/admin/settings"
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-foreground/5"
                  }`}
                >
                  <Settings size={18} />
                  Paramètres
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-dark-foreground/60 hover:text-dark-foreground w-full"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 pb-24 overflow-auto">
          {children}
        </main>

        {/* Bottom navigation - 5 items */}
        <nav className="fixed bottom-0 left-0 right-0 bg-dark text-dark-foreground border-t border-foreground/10 flex items-center justify-around h-[68px] z-50 pb-[env(safe-area-inset-bottom)]">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] min-h-[44px] justify-center ${
                location.pathname === item.path ? "text-primary" : "text-dark-foreground/60"
              }`}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] text-dark-foreground/60 min-h-[44px] justify-center"
          >
            <MoreHorizontal size={22} />
            <span>Plus</span>
          </button>
        </nav>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-dark text-dark-foreground flex flex-col shrink-0 overflow-hidden">
        <div className="p-2 border-b border-foreground/10">
          <Link to="/admin">
            <img src={logo} alt="Centre Lux Car" style={{ height: logoH }} className="brightness-200" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-foreground/5"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-foreground/10 space-y-1 shrink-0">
          <Link
            to="/admin/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === "/admin/settings"
                ? "bg-primary/20 text-primary"
                : "hover:bg-foreground/5"
            }`}
          >
            <Settings size={18} />
            Paramètres
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 text-sm text-dark-foreground/60 hover:text-dark-foreground w-full"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-secondary p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
