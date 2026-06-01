import * as React from "react"
import { cn } from "#lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm text-foreground transition-colors",
          "placeholder:text-foreground/30",
          "focus:border-primary/50 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
