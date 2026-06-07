import { useEffect, useState } from "react";
import type { Icon, IconProps } from "@phosphor-icons/react";
import { COMMON_ICONS, canonicalIconName, loadIconRegistry } from "#lib/serviceIcons";

type Props = IconProps & {
  /** Stored icon value (canonical phosphor name or legacy alias). */
  icon: string | undefined;
  /** Position in the highlight list — drives the default-icon rotation. */
  index?: number;
};

/**
 * Renders a service-highlight icon. Common icons resolve synchronously; any
 * other icon from the full phosphor library is pulled from the lazily-loaded
 * registry (highlights sit below the fold, so the brief async load is unseen).
 */
export default function HighlightIcon({ icon, index = 0, ...iconProps }: Props) {
  const name = canonicalIconName(icon, index);
  const isCommon = name in COMMON_ICONS;
  const [Lazy, setLazy] = useState<Icon | null>(null);

  useEffect(() => {
    if (isCommon) return; // already available synchronously
    let active = true;
    void loadIconRegistry().then((m) => {
      if (active) setLazy(() => m.ICON_REGISTRY[name] ?? null);
    });
    return () => {
      active = false;
    };
  }, [name, isCommon]);

  const Resolved = isCommon ? COMMON_ICONS[name] : Lazy;
  if (Resolved == null) return null;
  return <Resolved {...iconProps} />;
}
