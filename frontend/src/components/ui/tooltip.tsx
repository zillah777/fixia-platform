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
>(({ className, sideOffset = 8, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      // Liquid Glass Design System "Confianza Líquida"
      "z-50 overflow-hidden rounded-xl glass-medium border border-white/20",
      "px-3 py-2 text-sm text-white font-medium backdrop-blur-xl",
      "shadow-2xl shadow-black/25",
      // Smooth animations
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3",
      "data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3",
      // Enhanced readability 
      "max-w-xs text-center leading-relaxed",
      // Glass morphism glow effect
      "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Enhanced TooltipArrow with Liquid Glass styling
const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn(
      "fill-white/10 backdrop-blur-xl drop-shadow-lg",
      className
    )}
    {...props}
  />
))
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName

// Simplified tooltip sizes for unified design
export interface TooltipVariantProps {
  size?: 'sm' | 'md' | 'lg'
}

const TooltipWithVariants = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & TooltipVariantProps
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
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

// Helper component for simple tooltips with Liquid Glass design
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
  delayDuration = 300,
  withArrow = true
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