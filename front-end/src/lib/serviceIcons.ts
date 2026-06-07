// Light-weight icon resolution for service highlights.
//
// The public page only needs to render ONE icon per highlight, so we keep a
// small set of common icons that resolve synchronously (no extra bundle). Any
// other icon from the full library is loaded lazily via iconRegistry.ts — see
// HighlightIcon.tsx. The admin picker uses iconRegistry directly to offer all
// icons. Stored values are canonical phosphor names (e.g. "MicrophoneStageIcon").
import {
  CameraIcon,
  DeviceMobileIcon,
  FilmSlateIcon,
  LightningIcon,
  MagicWandIcon,
  MegaphoneIcon,
  MicrophoneStageIcon,
  MonitorPlayIcon,
  PaletteIcon,
  PlayCircleIcon,
  RocketLaunchIcon,
  ScissorsIcon,
  SparkleIcon,
  TrendUpIcon,
  UsersThreeIcon,
  VideoCameraIcon,
  type Icon,
} from "@phosphor-icons/react";

/** Common icons resolved synchronously — kept small to keep the public bundle light. */
const COMMON_ICONS: Record<string, Icon> = {
  MicrophoneStageIcon,
  TrendUpIcon,
  DeviceMobileIcon,
  CameraIcon,
  VideoCameraIcon,
  FilmSlateIcon,
  MonitorPlayIcon,
  PlayCircleIcon,
  ScissorsIcon,
  MagicWandIcon,
  PaletteIcon,
  SparkleIcon,
  RocketLaunchIcon,
  LightningIcon,
  MegaphoneIcon,
  UsersThreeIcon,
};

/** Back-compat: earlier data/seeds stored short alias keys → canonical names. */
const LEGACY_ALIASES: Record<string, string> = {
  microphone: "MicrophoneStageIcon",
  trend: "TrendUpIcon",
  mobile: "DeviceMobileIcon",
  camera: "CameraIcon",
  video: "VideoCameraIcon",
  film: "FilmSlateIcon",
  monitor: "MonitorPlayIcon",
  play: "PlayCircleIcon",
  scissors: "ScissorsIcon",
  magic: "MagicWandIcon",
  palette: "PaletteIcon",
  sparkle: "SparkleIcon",
  rocket: "RocketLaunchIcon",
  lightning: "LightningIcon",
  megaphone: "MegaphoneIcon",
  users: "UsersThreeIcon",
};

/** Default icon for a brand-new highlight in the admin form. */
export const DEFAULT_SERVICE_ICON = "MicrophoneStageIcon";

/** Fallback rotation when a highlight has no icon set. */
const DEFAULT_ROTATION = ["MicrophoneStageIcon", "TrendUpIcon", "DeviceMobileIcon"];

/** Normalise a stored icon value (legacy alias or canonical name) to a canonical name. */
export function canonicalIconName(key: string | undefined, index = 0): string {
  if (!key) return DEFAULT_ROTATION[index % DEFAULT_ROTATION.length];
  return LEGACY_ALIASES[key] ?? key;
}

/**
 * Resolve a stored icon to a component if it's one of the common ones. Returns
 * null when the caller must fall back to the lazily-loaded full registry.
 */
export function resolveCommonIcon(key: string | undefined, index = 0): Icon | null {
  return COMMON_ICONS[canonicalIconName(key, index)] ?? null;
}

/** Lazily load the full icon registry (heavy — code-split into its own chunk). */
export function loadIconRegistry() {
  return import("./iconRegistry");
}
