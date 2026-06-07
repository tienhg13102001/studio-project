import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { canonicalIconName, loadIconRegistry } from "#lib/serviceIcons";
import { cn } from "#lib/utils";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "#components/ui/popover";

// Cap how many icons render at once — searching narrows the list, but an
// unfiltered 1500-icon grid would be needlessly heavy to paint.
const MAX_RESULTS = 150;

type Registry = { ICON_REGISTRY: Record<string, Icon>; ICON_NAMES: string[] };

type Props = {
  value: string;
  onChange: (name: string) => void;
};

/**
 * Searchable picker over the entire phosphor icon library. The library is heavy
 * (~1500 icons) so it's loaded lazily into its own chunk on mount — keeping it
 * out of both the public and the critical portal bundles.
 */
export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [registry, setRegistry] = useState<Registry | null>(null);

  useEffect(() => {
    let active = true;
    void loadIconRegistry().then((m) => {
      if (active) setRegistry({ ICON_REGISTRY: m.ICON_REGISTRY, ICON_NAMES: m.ICON_NAMES });
    });
    return () => {
      active = false;
    };
  }, []);

  const names = registry?.ICON_NAMES ?? [];
  const q = query.trim().toLowerCase();

  const allMatches = useMemo(
    () => (q ? names.filter((n) => n.toLowerCase().includes(q)) : names),
    [names, q],
  );
  const matches = allMatches.slice(0, MAX_RESULTS);

  // Canonicalise so legacy short keys (e.g. "film") still display correctly.
  const canonical = value ? canonicalIconName(value) : "";
  const Selected = canonical ? registry?.ICON_REGISTRY[canonical] : undefined;
  const label = canonical ? canonical.replace(/Icon$/, "") : "Pick an icon";

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
          {registry &&
            matches.map((name) => {
              const Ico = registry.ICON_REGISTRY[name];
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
          {registry && matches.length === 0 && (
            <p className="text-foreground/30 col-span-6 py-6 text-center text-xs">No icons found</p>
          )}
          {!registry && (
            <p className="text-foreground/30 col-span-6 py-6 text-center text-xs">Loading icons…</p>
          )}
        </div>
        {registry && (
          <p className="text-foreground/40 mt-1.5 text-[10px]">
            {allMatches.length > MAX_RESULTS
              ? `Showing first ${MAX_RESULTS} of ${allMatches.length} — refine your search.`
              : `${allMatches.length} icon${allMatches.length === 1 ? "" : "s"}.`}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
