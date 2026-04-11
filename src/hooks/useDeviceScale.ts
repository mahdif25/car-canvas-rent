import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

const TABLET_MAX = 1024;

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsTablet(w >= 768 && w < TABLET_MAX);
    };
    check();
    const mql = window.matchMedia(`(max-width: ${TABLET_MAX - 1}px)`);
    mql.addEventListener("change", check);
    window.addEventListener("resize", check);
    return () => {
      mql.removeEventListener("change", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  return isTablet;
}

type Placement = "home" | "fleet" | "detail" | "reservation" | "sidebar";

export function useDeviceScale(vehicle: any, placement: Placement): number {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (!vehicle) return 1;

  const desktopKey = `image_scale_${placement}` as string;
  const mobileKey = `image_scale_${placement}_mobile` as string;
  const tabletKey = `image_scale_${placement}_tablet` as string;

  if (isMobile) return Number(vehicle[mobileKey] ?? 1);
  if (isTablet) return Number(vehicle[tabletKey] ?? 1);
  return Number(vehicle[desktopKey] ?? 1);
}
