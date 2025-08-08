"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      // Liquid Glass Design System styles
      "z-50 overflow-hidden rounded-lg glass-medium border border-white/20",
      "px-3 py-1.5 text-sm text-white/90 backdrop-blur-xl",
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      // Additional glass morphism effects
      "shadow-lg shadow-black/25 backdrop-saturate-150",
      "before:absolute before:inset-0 before:rounded-lg before:border before:border-white/10",
      "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r after:from-white/5 after:to-transparent after:pointer-events-none",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Enhanced TooltipArrow with glass styling
const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn(
      "fill-black/20 backdrop-blur-xl",
      className
    )}
    {...props}
  />
))
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName

// Enhanced tooltip variants for different use cases
export interface TooltipVariantProps {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

const TooltipWithVariants = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & TooltipVariantProps
>(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  const variantClasses = {
    default: 'text-white/90',
    info: 'text-blue-100 border-blue-400/20 bg-blue-500/10',
    success: 'text-green-100 border-green-400/20 bg-green-500/10',
    warning: 'text-yellow-100 border-yellow-400/20 bg-yellow-500/10',
    error: 'text-red-100 border-red-400/20 bg-red-500/10'
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <TooltipContent
      ref={ref}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
TooltipWithVariants.displayName = "TooltipWithVariants"

// Helper component for simple tooltips
interface SimpleTooltipProps {
  content: string
  children: React.ReactNode
  variant?: TooltipVariantProps['variant']
  size?: TooltipVariantProps['size']
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayDuration?: number
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  content,
  children,
  variant = 'default',
  size = 'md',
  side = 'top',
  delayDuration = 200
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipWithVariants side={side} variant={variant} size={size}>
          {content}
          <TooltipArrow />
        </TooltipWithVariants>
      </Tooltip>
    </TooltipProvider>
  )
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipArrow,
  TooltipWithVariants,
  SimpleTooltip,
}