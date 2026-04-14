import * as React from "react";
import { format, parse, isValid as isDateValid, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface DateInputFieldProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showAge?: boolean;
  className?: string;
}

function toDisplay(isoValue: string): string {
  if (!isoValue) return "";
  const d = parse(isoValue, "yyyy-MM-dd", new Date());
  return isDateValid(d) ? format(d, "dd/MM/yyyy") : "";
}

function autoFormat(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) out += "/";
    out += digits[i];
  }
  return out;
}

function parseDisplay(display: string): Date | null {
  if (display.length !== 10) return null;
  const d = parse(display, "dd/MM/yyyy", new Date());
  return isDateValid(d) ? d : null;
}

const DateInputField = ({
  value,
  onChange,
  placeholder = "JJ/MM/AAAA",
  disabled,
  minDate,
  maxDate,
  showAge,
  className,
}: DateInputFieldProps) => {
  const [open, setOpen] = React.useState(false);
  const [display, setDisplay] = React.useState(() => toDisplay(value));
  const [error, setError] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync display when value changes externally (e.g. calendar pick)
  React.useEffect(() => {
    const fromValue = toDisplay(value);
    if (fromValue !== display && (fromValue || !display)) {
      setDisplay(fromValue);
      setError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = autoFormat(e.target.value);
    setDisplay(formatted);
    setError(false);

    // Auto-commit when 10 chars (dd/MM/yyyy)
    if (formatted.length === 10) {
      const parsed = parseDisplay(formatted);
      if (parsed) {
        if (minDate && parsed < minDate) { setError(true); return; }
        if (maxDate && parsed > maxDate) { setError(true); return; }
        onChange(format(parsed, "yyyy-MM-dd"));
      } else {
        setError(true);
      }
    }
  };

  const handleBlur = () => {
    if (!display) { onChange(""); setError(false); return; }
    if (display.length !== 10) { setError(true); return; }
    const parsed = parseDisplay(display);
    if (!parsed) { setError(true); return; }
    if (minDate && parsed < minDate) { setError(true); return; }
    if (maxDate && parsed > maxDate) { setError(true); return; }
    onChange(format(parsed, "yyyy-MM-dd"));
    setError(false);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
      setDisplay(format(date, "dd/MM/yyyy"));
      setError(false);
      setOpen(false);
    }
  };

  const dateValue = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const validDate = dateValue && isDateValid(dateValue) ? dateValue : undefined;

  const age = React.useMemo(() => {
    if (!showAge || !validDate) return null;
    const years = differenceInYears(new Date(), validDate);
    return years >= 0 && years < 150 ? years : null;
  }, [showAge, validDate]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={display}
          onChange={handleInput}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error ? "border-destructive" : "border-input"
          )}
        />
        {error && (
          <p className="text-xs text-destructive mt-1 absolute">Date invalide</p>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            className="shrink-0 h-10 w-10"
          >
            <CalendarIcon className="h-4 w-4 text-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={validDate}
            onSelect={handleCalendarSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            locale={fr}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {showAge && age !== null && (
        <Badge variant="secondary" className="shrink-0 text-xs">
          {age} ans
        </Badge>
      )}
    </div>
  );
};

export { DateInputField };
