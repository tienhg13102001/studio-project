import { type CSSProperties } from "react";
import { cn } from "#lib/utils";

type Props = {
  children: string;
  className?: string;
  /** Seconds for one shine sweep. Omit to use the CSS default (4.5s). */
  speed?: number;
};

/**
 * Brand-gold text with a light sweep travelling across it — reserved for the
 * single most important line on a screen (e.g. the hero brand name). The
 * gradient + animation live in `.text-shiny` (index.css) so reduced-motion is
 * honoured globally alongside the other brand animations.
 */
export default function ShinyText({ children, className, speed }: Props) {
  const style: CSSProperties | undefined = speed
    ? { animationDuration: `${speed}s` }
    : undefined;
  return (
    <span className={cn("text-shiny", className)} style={style}>
      {children}
    </span>
  );
}
