
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-primary-foreground shadow-md hover:shadow-[0_0_15px_3px_hsl(var(--accent)/0.7),_0_0_8px_1px_hsl(var(--accent)/0.5)] hover:brightness-110 active:brightness-90 transform hover:scale-[1.02] active:scale-[0.98]",
        "mystic-glow":
          "border border-accent/40 bg-background text-accent font-semibold shadow-[0_0_12px_1px_hsl(var(--accent)/0.3)] transform hover:scale-[1.03] hover:font-bold hover:shadow-[0_0_20px_4px_hsl(var(--accent)/0.5)] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[0_0_15px_hsl(var(--destructive)/0.6)]",
        outline:
          "border border-input bg-transparent text-foreground shadow-sm hover:bg-accent/10 hover:text-accent hover:shadow-[0_0_8px_1px_hsl(var(--accent)/0.4)] active:bg-accent/20",
        secondary:
          "bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--accent)/70)] text-secondary-foreground shadow-md hover:shadow-[0_0_15px_3px_hsl(var(--primary)/0.6),_0_0_8px_1px_hsl(var(--primary)/0.4)] hover:brightness-110 active:brightness-90",
        ghost:
          "bg-transparent text-foreground hover:bg-accent/10 hover:text-accent active:bg-accent/20",
        link: "text-primary underline-offset-4 hover:underline hover:text-[hsl(var(--accent))] active:text-[hsl(var(--accent)/80)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base", // Increased text size for lg
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
