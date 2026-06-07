// Full phosphor icon registry — every icon the library ships (~1500).
// This module is intentionally HEAVY and is only ever loaded lazily (admin icon
// picker, or the public page's fallback for an uncommon icon) so it never lands
// in the critical bundle. See serviceIcons.ts for the light synchronous path.
//
// We deliberately import the SSR icon variant: the rest of the app uses the CSR
// icons (the bare "@phosphor-icons/react" specifier), so importing SSR here
// keeps this module's graph disjoint from the app's. That disjointness is what
// lets the bundler keep the whole 1500-icon barrel in this dynamic-only chunk
// instead of hoisting it into the shared entry chunk. The icons render
// identically client-side.
import * as PhosphorIcons from "@phosphor-icons/react/ssr";
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
