import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "fixia-input", // Using fixia-input class for proper readability
        error: "fixia-input border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
        success: "fixia-input border-green-500/50 focus:border-green-500 focus:ring-green-500/20",
        solid: "border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring",
      },
      size: {
        sm: "h-9 px-2 text-xs",
        default: "h-10 px-3 py-2",
        lg: "h-12 px-4 text-base",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: true,
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Input state for styling
   */
  state?: 'default' | 'error' | 'success'
  /**
   * Show error state
   */
  error?: boolean
  /**
   * Show success state
   */
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, fullWidth, state, error, success, ...props }, ref) => {
    // Determine input state for proper variant selection
    const inputVariant = error ? 'error' : success ? 'success' : variant || 'default'
    
    return (
      <input
        type={type}
        className={cn(
          inputVariants({
            variant: inputVariant,
            size,
            fullWidth,
          }),
          className
        )}
        ref={ref}
        aria-invalid={error}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }