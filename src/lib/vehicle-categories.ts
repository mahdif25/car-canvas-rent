import { Car, Truck, CircleDot, Crown, Bus, LucideIcon } from "lucide-react";

export interface CategoryInfo {
  icon: LucideIcon;
  label: string;
}

export const CATEGORY_ICON_MAP: Record<string, CategoryInfo> = {
  SUV: { icon: Truck, label: "SUV" },
  Sedan: { icon: Car, label: "Berline" },
  Compact: { icon: CircleDot, label: "Compact" },
  Luxury: { icon: Crown, label: "Luxe" },
  Minivan: { icon: Bus, label: "Minivan" },
};

export const getCategoryInfo = (category: string): CategoryInfo => {
  return CATEGORY_ICON_MAP[category] || { icon: Car, label: category };
};
