import { Snowflake, Navigation, Bluetooth, Usb, Camera } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StructuredFeature {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const STRUCTURED_FEATURES: StructuredFeature[] = [
  { key: "has_climatisation", label: "Climatisation", icon: Snowflake },
  { key: "has_gps", label: "GPS", icon: Navigation },
  { key: "has_bluetooth", label: "Bluetooth", icon: Bluetooth },
  { key: "has_usb", label: "USB", icon: Usb },
  { key: "has_camera", label: "Caméra de recul", icon: Camera },
];

export const getActiveFeatures = (vehicle: Record<string, any>): StructuredFeature[] => {
  return STRUCTURED_FEATURES.filter((f) => vehicle[f.key] === true);
};
