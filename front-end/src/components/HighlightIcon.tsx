import { useEffect, useState } from "react";
import type { Icon, IconProps } from "@phosphor-icons/react";
import { canonicalIconName, loadIconRegistry, resolveCommonIcon } from "#lib/serviceIcons";

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
  const common = resolveCommonIcon(icon, index);
  const [lazy, setLazy] = useState<Icon | null>(null);

  useEffect(() => {
    if (common) return; // already resolved synchronously
    let active = true;
    const name = canonicalIconName(icon, index);
    void loadIconRegistry().then((m) => {
      if (active) setLazy(() => m.ICON_REGISTRY[name] ?? null);
    });
    return () => {
      active = false;
    };
  }, [icon, index, common]);

  const Resolved = common ?? lazy;
  if (!Resolved) return null;
  return <Resolved {...iconProps} />;
}
