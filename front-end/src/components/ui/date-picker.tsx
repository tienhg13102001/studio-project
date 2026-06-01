import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Button } from "#components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "#components/ui/popover";
import { cn } from "#lib/utils";

type Props = {
  /** Selected date as an ISO "yyyy-mm-dd" string, or "" when empty. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
};

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]; // Monday-first

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parse "yyyy-mm-dd" into a local Date (avoids UTC off-by-one). */
function parseISO(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function formatDisplay(value: string): string {
  const d = parseISO(value);
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : "";
}

/** Days (with leading blanks) for a month grid, Monday-first. */
function monthGrid(year: number, month: number): (number | null)[] {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

const MONTHS_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export function DatePicker({ value, onChange, placeholder = "Chọn ngày", id, className }: Props) {
  const selected = parseISO(value);
  const today = new Date();
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(() => selected ?? today);

  // Keep the visible month in sync when the value changes externally.
  React.useEffect(() => {
    if (selected) setView(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const cells = monthGrid(year, month);

  const isSameDay = (d: number, ref: Date | null) =>
    !!ref && ref.getFullYear() === year && ref.getMonth() === month && ref.getDate() === d;

  const goMonth = (delta: number) => setView(new Date(year, month + delta, 1));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start gap-2 font-normal",
            !value && "text-foreground/40",
            className,
          )}
        >
          <CalendarBlankIcon size={16} className="text-foreground/50 shrink-0" />
          {value ? formatDisplay(value) : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto">
        {/* Month nav */}
        <div className="mb-2 flex items-center justify-between px-1">
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => goMonth(-1)}>
            <CaretLeftIcon size={14} />
          </Button>
          <span className="text-foreground text-sm font-medium">
            {MONTHS_VI[month]} {year}
          </span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => goMonth(1)}>
            <CaretRightIcon size={14} />
          </Button>
        </div>

        {/* Weekday labels */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-foreground/40 flex h-7 items-center justify-center text-[11px] font-medium">
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={`b${i}`} className="h-8 w-8" />;
            const isSelected = isSameDay(d, selected);
            const isToday = isSameDay(d, today);
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  onChange(toISO(new Date(year, month, d)));
                  setOpen(false);
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground/80 hover:bg-foreground/10",
                  !isSelected && isToday && "border-primary/50 border",
                )}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Clear */}
        {value && (
          <div className="mt-2 flex justify-end border-t border-foreground/8 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-foreground/50 hover:text-foreground"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Xoá ngày
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
