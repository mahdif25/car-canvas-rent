import { useEffect, useState } from "react";
import type { VehicleColor } from "./useVehicleColors";

type Placement = "home" | "fleet" | "detail" | "reservation" | "sidebar";

function getDeviceType(width: number): "mobile" | "tablet" | "desktop" {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function useDeviceType() {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(() =>
    typeof window !== "undefined" ? getDeviceType(window.innerWidth) : "desktop"
  );

  useEffect(() => {
    const handler = () => setDevice(getDeviceType(window.innerWidth));
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return device;
}

export function getScaleForDevice(vehicle: any, placement: Placement, device: "mobile" | "tablet" | "desktop"): number {
  if (!vehicle) return 1;
  if (device === "mobile") return Number(vehicle[`image_scale_${placement}_mobile`] ?? 1);
  if (device === "tablet") return Number(vehicle[`image_scale_${placement}_tablet`] ?? 1);
  return Number(vehicle[`image_scale_${placement}`] ?? 1);
}

export function getScaleForColorOnDevice(color: VehicleColor | undefined, placement: Placement, device: "mobile" | "tablet" | "desktop"): number {
  if (!color) return 1;
  if (device === "mobile") return Number((color as any)[`image_scale_${placement}_mobile`] ?? 1);
  if (device === "tablet") return Number((color as any)[`image_scale_${placement}_tablet`] ?? 1);
  return Number((color as any)[`image_scale_${placement}`] ?? 1);
}

export function useDeviceScale(vehicle: any, placement: Placement): number {
  const device = useDeviceType();
  return getScaleForDevice(vehicle, placement, device);
}
