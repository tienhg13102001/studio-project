import { useEffect, useRef, useState } from "react";
import { cn } from "#lib/utils";

type Props = {
  text: string;
  className?: string;
  /** ms per character */
  speed?: number;
  /** show a blinking caret */
  caret?: boolean;
};

/**
 * Types `text` out one character at a time on mount. Renders the full string
 * immediately under reduced-motion, and clears its timer on unmount — so it's
 * safe inside short-lived screens like the preloader (which may unmount
 * mid-type without leaking a running interval).
 */
export default function TextType({ text, className, speed = 90, caret = true }: Props) {
  const [count, setCount] = useState(0);
  const idxRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    idxRef.current = 0;
    setCount(0);
    const id = window.setInterval(() => {
      idxRef.current += 1;
      setCount(idxRef.current);
      if (idxRef.current >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  const done = count >= text.length;

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {caret && (
        <span aria-hidden="true" className={cn("ml-0.5 inline-block", !done && "animate-pulse")}>
          |
        </span>
      )}
    </span>
  );
}
