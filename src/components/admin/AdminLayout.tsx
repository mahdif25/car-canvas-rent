import { ReactNode } from "react";
import { Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Car, Settings, CalendarDays, LayoutDashboard, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";

interface Props {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Flotte", path: "/admin/fleet", icon: Car },
  { label: "Options", path: "/admin/addons", icon: Settings },
  { label: "Réservations", path: "/admin/reservations", icon: CalendarDays },
];

const AdminLayout = ({ children }: Props) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
          <button onClick={async () => { await signOut(); navigate("/"); }} className="text-primary hover:underline">Se déconnecter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-dark-foreground flex flex-col shrink-0">
        <div className="p-4 border-b border-foreground/10">
          <Link to="/admin">
            <img src={logo} alt="Centre Lux Car" className="h-10 brightness-200" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
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
        <div className="p-4 border-t border-foreground/10">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/60 hover:text-foreground w-full"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-secondary p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
