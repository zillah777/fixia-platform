import * as React from "react"
import { cn } from "@/lib/utils"
import { useCardGlass } from "@/hooks/useAdaptiveGlass"

export interface AdaptiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enable hover effects (disabled on low-end devices automatically)
   */
  hover?: boolean;
  /**
   * Make the card interactive with pointer events
   */
  interactive?: boolean;
  /**
   * Glass variant intensity
   */
  variant?: 'light' | 'medium' | 'strong';
}

const AdaptiveCard = React.forwardRef<HTMLDivElement, AdaptiveCardProps>(
  ({ className, hover = true, interactive = false, variant = 'light', ...props }, ref) => {
    const { cardClasses } = useCardGlass({ hover, interactive });
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border text-card-foreground shadow-sm",
          cardClasses,
          className
        )}
        {...props}
      />
    );
  }
);
AdaptiveCard.displayName = "AdaptiveCard";

const AdaptiveCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
AdaptiveCardHeader.displayName = "AdaptiveCardHeader";

const AdaptiveCardTitle = React.forwardRef<
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
));
AdaptiveCardTitle.displayName = "AdaptiveCardTitle";

const AdaptiveCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AdaptiveCardDescription.displayName = "AdaptiveCardDescription";

const AdaptiveCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
AdaptiveCardContent.displayName = "AdaptiveCardContent";

const AdaptiveCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
AdaptiveCardFooter.displayName = "AdaptiveCardFooter";

export { 
  AdaptiveCard, 
  AdaptiveCardHeader, 
  AdaptiveCardFooter, 
  AdaptiveCardTitle, 
  AdaptiveCardDescription, 
  AdaptiveCardContent 
};