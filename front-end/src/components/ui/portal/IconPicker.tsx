import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { ICON_NAMES, ICON_REGISTRY } from "#lib/iconRegistry";
import { canonicalIconName } from "#lib/serviceIcons";
import { cn } from "#lib/utils";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "#components/ui/popover";

// Cap how many icons render at once — searching narrows the list, but an
// unfiltered 1500-icon grid would be needlessly heavy to paint.
const MAX_RESULTS = 150;

type Props = {
  value: string;
  onChange: (name: string) => void;
};

/** Searchable picker over the entire phosphor icon library. */
export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const names = q ? ICON_NAMES.filter((n) => n.toLowerCase().includes(q)) : ICON_NAMES;
    return names.slice(0, MAX_RESULTS);
  }, [query]);

  // Canonicalise so legacy short keys (e.g. "film") still display correctly.
  const canonical = value ? canonicalIconName(value) : "";
  const Selected = canonical ? ICON_REGISTRY[canonical] : undefined;
  const label = canonical ? canonical.replace(/Icon$/, "") : "Pick an icon";
  const totalMatches = query.trim()
    ? ICON_NAMES.filter((n) => n.toLowerCase().includes(query.trim().toLowerCase())).length
    : ICON_NAMES.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-foreground/10 w-full justify-start gap-2 font-normal"
        >
          {Selected && <Selected size={16} weight="duotone" className="text-primary shrink-0" />}
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <div className="relative mb-2">
          <MagnifyingGlassIcon
            size={14}
            className="text-foreground/40 absolute left-2.5 top-1/2 -translate-y-1/2"
          />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons…"
            className="h-8 pl-8"
          />
        </div>
        <div className="grid max-h-60 grid-cols-6 gap-1 overflow-y-auto">
          {matches.map((name) => {
            const Ico = ICON_REGISTRY[name];
            return (
              <button
                key={name}
                type="button"
                title={name.replace(/Icon$/, "")}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "hover:bg-foreground/10 flex aspect-square items-center justify-center rounded-md transition-colors",
                  canonical === name && "bg-primary/15 text-primary ring-primary/40 ring-1",
                )}
              >
                <Ico size={18} weight="duotone" />
              </button>
            );
          })}
          {matches.length === 0 && (
            <p className="text-foreground/30 col-span-6 py-6 text-center text-xs">
              No icons found
            </p>
          )}
        </div>
        <p className="text-foreground/40 mt-1.5 text-[10px]">
          {totalMatches > MAX_RESULTS
            ? `Showing first ${MAX_RESULTS} of ${totalMatches} — refine your search.`
            : `${totalMatches} icon${totalMatches === 1 ? "" : "s"}.`}
        </p>
      </PopoverContent>
    </Popover>
  );
}
