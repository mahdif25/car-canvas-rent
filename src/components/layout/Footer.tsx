import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { data: settings } = useSiteSettings();
  const logoH = (settings?.logo_height || 48) + 8;
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="Centre Lux Car" style={{ height: logoH }} className="w-auto brightness-200" />
            <p className="text-sm opacity-80">
              {settings?.footer_description || "Location de voitures de qualité au Maroc. Service professionnel et véhicules bien entretenus."}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Liens rapides</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm opacity-80 hover:text-primary transition-colors">Accueil</Link>
              <Link to="/fleet" className="text-sm opacity-80 hover:text-primary transition-colors">Notre Flotte</Link>
              <Link to="/reservation" className="text-sm opacity-80 hover:text-primary transition-colors">Réservation</Link>
              <Link to="/suivi-reservation" className="text-sm opacity-80 hover:text-primary transition-colors">Suivi de réservation</Link>
              <Link to="/conditions-generales" className="text-sm opacity-80 hover:text-primary transition-colors">Conditions Générales</Link>
              <Link to="/politique-confidentialite" className="text-sm opacity-80 hover:text-primary transition-colors">Politique de Confidentialité</Link>
              <Link to="/politique-caution" className="text-sm opacity-80 hover:text-primary transition-colors">Politique de Caution</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Contact</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Phone size={16} className="text-primary" />
                <span>{settings?.footer_phone || "+212 6 00 00 00 00"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Mail size={16} className="text-primary" />
                <span>{settings?.footer_email || "contact@centreluxcar.ma"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <MapPin size={16} className="text-primary" />
                <span>{settings?.footer_address || "Casablanca, Maroc"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-foreground/10">
        <div className="container py-4 text-center text-sm opacity-60">
          © {new Date().getFullYear()} {settings?.footer_copyright || "Centre Lux Car. Tous droits réservés."}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
