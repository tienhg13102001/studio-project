import { useLayoutEffect, useRef } from "react";

export default function AutoTextarea({
  className,
  value,
  onChange,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      className={`${className} resize-none overflow-hidden`}
      rows={1}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}
