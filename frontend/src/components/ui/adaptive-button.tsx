import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useButtonGlass } from "@/hooks/useAdaptiveGlass"

const adaptiveButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "",  // Handled by useButtonGlass
        secondary: "", // Handled by useButtonGlass  
        ghost: "",    // Handled by useButtonGlass
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xs: "h-8 rounded-md px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  }
)

export interface AdaptiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof adaptiveButtonVariants> {
  asChild?: boolean
}

const AdaptiveButton = React.forwardRef<HTMLButtonElement, AdaptiveButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Get adaptive glass classes for glass variants
    const { buttonClasses, isOptimized } = useButtonGlass(variant as 'primary' | 'secondary' | 'ghost');
    
    // Use glass classes for glass variants, regular classes for others
    const useGlassVariant = variant === 'primary' || variant === 'secondary' || variant === 'ghost';
    
    return (
      <Comp
        className={cn(
          adaptiveButtonVariants({ variant: useGlassVariant ? undefined : variant, size, className }),
          useGlassVariant && buttonClasses,
          // Add touch-friendly optimizations for mobile
          isOptimized && "active:scale-95 transition-transform duration-100"
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
AdaptiveButton.displayName = "AdaptiveButton"

export { AdaptiveButton, adaptiveButtonVariants }