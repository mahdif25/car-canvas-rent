import { VehicleColor } from "@/hooks/useVehicleColors";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  colors: VehicleColor[];
  selectedColorId?: string;
  onSelect: (color: VehicleColor) => void;
  size?: "sm" | "md";
}

const VehicleColorPicker = ({ colors, selectedColorId, onSelect, size = "sm" }: Props) => {
  if (colors.length === 0) return null;

  const sizeClass = size === "sm" ? "w-6 h-6" : "w-7 h-7";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap gap-1.5">
        {colors.map((color) => {
          const isSelected = selectedColorId === color.id;
          return (
            <Tooltip key={color.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(color);
                  }}
                  className={`${sizeClass} rounded-full border-2 transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/30 scale-110"
                      : "border-border hover:border-primary/50 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.color_hex }}
                  aria-label={color.color_name}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {color.color_name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default VehicleColorPicker;
