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
      // Basic tooltip design - no special effects
      "z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white",
      "shadow-md border border-gray-700",
      // Simple animations
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      // Basic readability
      "max-w-xs text-center font-normal",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Basic TooltipArrow - simple design
const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn(
      "fill-gray-900",
      className
    )}
    {...props}
  />
))
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName

// Basic tooltip sizes - simplified
export interface TooltipVariantProps {
  size?: 'sm' | 'md' | 'lg'
}

const TooltipWithVariants = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & TooltipVariantProps
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-3 py-2 text-sm'
  }

  return (
    <TooltipContent
      ref={ref}
      className={cn(
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
TooltipWithVariants.displayName = "TooltipWithVariants"

// Helper component for simple tooltips - basic design
interface SimpleTooltipProps {
  content: string
  children: React.ReactNode
  size?: TooltipVariantProps['size']
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayDuration?: number
  withArrow?: boolean
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  content,
  children,
  size = 'md',
  side = 'top',
  delayDuration = 700,
  withArrow = false
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipWithVariants side={side} size={size}>
          {content}
          {withArrow && <TooltipArrow />}
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