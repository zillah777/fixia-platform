import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useGlassSystem, useButtonGlassSystem } from "@/hooks/useGlassSystem"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "", // Handled by glass system
        secondary: "", // Handled by glass system
        ghost: "", // Handled by glass system
        outline: "", // Handled by glass system
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
        // Legacy support
        default: "", // Maps to primary
      },
      size: {
        xs: "h-8 rounded-md px-2 text-xs",
        sm: "h-9 rounded-md px-3",
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-11 w-11",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
      fullWidth: false,
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Show loading state with spinner
   */
  loading?: boolean
  /**
   * Loading text to show instead of children when loading
   */
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, loadingText, children, disabled, fullWidth, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const { tokens } = useGlassSystem()
    
    // Map legacy 'default' variant to 'primary'
    const glassVariant = variant === 'default' ? 'primary' : variant as 'primary' | 'secondary' | 'ghost' | 'outline'
    
    // Get glass classes for glass variants
    const glassClasses = useButtonGlassSystem(
      ['primary', 'secondary', 'ghost', 'outline'].includes(glassVariant) 
        ? glassVariant 
        : 'secondary'
    )
    
    // Use glass classes for glass variants, regular classes for others
    const useGlassVariant = ['primary', 'secondary', 'ghost', 'outline', 'default'].includes(variant || 'secondary')
    
    const isDisabled = disabled || loading
    
    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant: useGlassVariant ? undefined : variant, 
            size, 
            fullWidth,
            loading
          }),
          useGlassVariant && glassClasses,
          // Add loading state styling
          loading && "relative",
          className
        )}
        disabled={isDisabled}
        ref={ref}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText && <span className="sr-only">{loadingText}</span>}
          </span>
        )}
        <span className={loading ? "opacity-0" : ""}>
          {children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }