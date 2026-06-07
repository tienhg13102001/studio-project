// Full phosphor icon registry — every icon the library ships (~1500).
// This module is intentionally HEAVY and is only ever loaded lazily (admin icon
// picker, or the public page's fallback for an uncommon icon) so it never lands
// in the critical bundle. See serviceIcons.ts for the light synchronous path.
import * as PhosphorIcons from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

// The library exports each icon under its canonical "*Icon" name (e.g.
// "MicrophoneStageIcon"); non-icon exports (IconBase, IconContext, types) don't
// match the suffix and are filtered out.
export const ICON_REGISTRY: Record<string, Icon> = Object.fromEntries(
  Object.entries(PhosphorIcons).filter(
    ([name, value]) => name.endsWith("Icon") && typeof value !== "undefined",
  ),
) as Record<string, Icon>;

/** Sorted list of every icon name — used to populate the admin picker. */
export const ICON_NAMES = Object.keys(ICON_REGISTRY).sort();
