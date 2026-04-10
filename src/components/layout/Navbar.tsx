import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const navLinks = [
  { label: "Accueil", path: "/" },
  { label: "Flotte", path: "/fleet" },
  { label: "Réservation", path: "/reservation" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  const logoH = settings?.logo_height || 48;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container flex items-center justify-between" style={{ minHeight: Math.max(64, logoH + 16) }}>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Centre Lux Car" style={{ height: logoH }} className="w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.path
                  ? "text-primary"
                  : "text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/reservation"
            className="bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold rounded-pill hover:bg-accent transition-colors"
          >
            Réserver
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium ${
                location.pathname === link.path
                  ? "text-primary"
                  : "text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/reservation"
            onClick={() => setMobileOpen(false)}
            className="block bg-primary text-primary-foreground text-center px-6 py-2 text-sm font-semibold rounded-pill hover:bg-accent transition-colors"
          >
            Réserver
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
