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
      // Enhanced readability with solid background and high contrast
      "z-50 overflow-hidden rounded-lg border border-gray-200 shadow-lg",
      "px-3 py-1.5 text-sm text-gray-900 bg-white/95 backdrop-blur-sm",
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      // Dark mode support
      "dark:bg-gray-800/95 dark:text-gray-100 dark:border-gray-700",
      // Better contrast for accessibility
      "font-medium max-w-xs text-center",
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
    default: 'text-gray-900 dark:text-gray-100',
    info: 'text-blue-900 bg-blue-50/95 border-blue-200 dark:bg-blue-900/95 dark:text-blue-100 dark:border-blue-700',
    success: 'text-green-900 bg-green-50/95 border-green-200 dark:bg-green-900/95 dark:text-green-100 dark:border-green-700',
    warning: 'text-yellow-900 bg-yellow-50/95 border-yellow-200 dark:bg-yellow-900/95 dark:text-yellow-100 dark:border-yellow-700',
    error: 'text-red-900 bg-red-50/95 border-red-200 dark:bg-red-900/95 dark:text-red-100 dark:border-red-700'
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