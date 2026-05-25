import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "#lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-white/20 bg-white/10 text-white/60",
        primary:
          "border-primary/30 bg-primary/15 text-primary",
        outline:
          "border-white/10 text-white/30",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-400",
        amber:
          "bg-amber-500/15 text-amber-400 border-amber-500/30",
        blue:
          "bg-blue-500/15 text-blue-400 border-blue-500/30",
        emerald:
          "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        violet:
          "bg-violet-500/15 text-violet-400 border-violet-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
