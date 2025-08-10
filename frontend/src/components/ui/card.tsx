import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useCardGlassSystem } from "@/hooks/useGlassSystem"

const cardVariants = cva(
  "rounded-lg text-card-foreground",
  {
    variants: {
      variant: {
        default: "", // Handled by glass system
        interactive: "", // Handled by glass system
        elevated: "", // Handled by glass system
        outline: "border-2 border-white/30 bg-transparent",
        solid: "bg-card border shadow-sm",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
      hover: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: true,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Make the card interactive with pointer events
   */
  interactive?: boolean
  /**
   * Enable hover effects (disabled on low-end devices automatically)
   */
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover = true, interactive = false, ...props }, ref) => {
    // Map variant to glass system variant
    const glassVariant = variant === 'default' ? 'default' : 
                        interactive ? 'interactive' :
                        variant === 'elevated' ? 'elevated' : 'default'
    
    // Get glass classes for glass variants
    const glassClasses = useCardGlassSystem(
      ['default', 'interactive', 'elevated'].includes(variant || 'default')
        ? glassVariant as 'default' | 'interactive' | 'elevated'
        : 'default'
    )
    
    // Use glass classes for glass variants, regular classes for others
    const useGlassVariant = ['default', 'interactive', 'elevated'].includes(variant || 'default')
    
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ 
            variant: useGlassVariant ? undefined : variant, 
            padding, 
            hover 
          }),
          useGlassVariant && glassClasses,
          interactive && "cursor-pointer",
          className
        )}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }