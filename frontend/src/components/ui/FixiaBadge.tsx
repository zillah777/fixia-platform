'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Star, Award, Check } from 'lucide-react';

// 🎨 FIXIA BADGE COMPONENT - Trust Indicators
// Sistema de badges para mostrar verificaciones, ratings y estados

interface FixiaBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'verified' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  pulse?: boolean;
  children: React.ReactNode;
}

interface FixiaRatingBadgeProps {
  rating: number;
  reviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showReviews?: boolean;
  className?: string;
}

interface FixiaVerificationBadgeProps {
  type: 'verified' | 'premium' | 'pro' | 'top-rated';
  className?: string;
}

const FixiaBadge = React.forwardRef<HTMLSpanElement, FixiaBadgeProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    icon, 
    pulse = false, 
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'fixia-badge';
    
    const variantClasses = {
      primary: 'fixia-badge-primary',
      secondary: 'fixia-badge-secondary',
      success: 'fixia-badge-success',
      warning: 'fixia-badge-warning',
      error: 'fixia-badge-error',
      verified: 'fixia-badge-verified',
      premium: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white'
    };
    
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-xs',
      lg: 'px-4 py-1.5 text-sm'
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          pulse && 'animate-pulse',
          className
        )}
        {...props}
      >
        {icon && (
          <span className="mr-1.5 flex-shrink-0">
            {icon}
          </span>
        )}
        {children}
      </span>
    );
  }
);

const FixiaRatingBadge = React.forwardRef<HTMLDivElement, FixiaRatingBadgeProps>(
  ({ 
    rating, 
    reviews, 
    size = 'md', 
    showReviews = true, 
    className 
  }, ref) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };
    
    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    const renderStars = () => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      const emptyStars = 5 - Math.ceil(rating);

      // Full stars
      for (let i = 0; i < fullStars; i++) {
        stars.push(
          <Star
            key={`full-${i}`}
            className={cn(iconSizeClasses[size], 'text-accent-500 fill-current')}
          />
        );
      }

      // Half star
      if (hasHalfStar) {
        stars.push(
          <div key="half" className="relative">
            <Star className={cn(iconSizeClasses[size], 'text-fixia-text-muted')} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={cn(iconSizeClasses[size], 'text-accent-500 fill-current')} />
            </div>
          </div>
        );
      }

      // Empty stars
      for (let i = 0; i < emptyStars; i++) {
        stars.push(
          <Star
            key={`empty-${i}`}
            className={cn(iconSizeClasses[size], 'text-fixia-text-muted')}
          />
        );
      }

      return stars;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixia-rating flex items-center gap-1',
          sizeClasses[size],
          className
        )}
      >
        <div className="flex items-center gap-0.5">
          {renderStars()}
        </div>
        <span className="font-medium text-fixia-text-primary ml-1">
          {rating.toFixed(1)}
        </span>
        {showReviews && reviews && (
          <span className="text-fixia-text-muted">
            ({reviews.toLocaleString()})
          </span>
        )}
      </div>
    );
  }
);

const FixiaVerificationBadge = React.forwardRef<HTMLSpanElement, FixiaVerificationBadgeProps>(
  ({ type, className }, ref) => {
    const badgeConfig = {
      verified: {
        icon: <Shield className="w-3 h-3" />,
        text: 'Verificado',
        variant: 'verified' as const,
        pulse: false
      },
      premium: {
        icon: <Award className="w-3 h-3" />,
        text: 'Premium',
        variant: 'premium' as const,
        pulse: true
      },
      pro: {
        icon: <Star className="w-3 h-3 fill-current" />,
        text: 'Pro',
        variant: 'secondary' as const,
        pulse: false
      },
      'top-rated': {
        icon: <Check className="w-3 h-3" />,
        text: 'Top Rated',
        variant: 'success' as const,
        pulse: false
      }
    };

    const config = badgeConfig[type];

    return (
      <FixiaBadge
        ref={ref}
        variant={config.variant}
        icon={config.icon}
        pulse={config.pulse}
        className={className}
      >
        {config.text}
      </FixiaBadge>
    );
  }
);

// Trust Indicators Component - Combines multiple badges
interface FixiaTrustIndicatorsProps {
  verified?: boolean;
  premium?: boolean;
  topRated?: boolean;
  projectsCount?: number;
  rating?: number;
  reviews?: number;
  className?: string;
}

const FixiaTrustIndicators = React.forwardRef<HTMLDivElement, FixiaTrustIndicatorsProps>(
  ({ 
    verified, 
    premium, 
    topRated, 
    projectsCount, 
    rating, 
    reviews, 
    className 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap items-center gap-2', className)}
      >
        {verified && <FixiaVerificationBadge type="verified" />}
        {premium && <FixiaVerificationBadge type="premium" />}
        {topRated && <FixiaVerificationBadge type="top-rated" />}
        
        {projectsCount && (
          <FixiaBadge variant="primary">
            {projectsCount}+ proyectos
          </FixiaBadge>
        )}
        
        {rating && (
          <FixiaRatingBadge 
            rating={rating} 
            reviews={reviews} 
            size="sm" 
          />
        )}
      </div>
    );
  }
);

FixiaBadge.displayName = 'FixiaBadge';
FixiaRatingBadge.displayName = 'FixiaRatingBadge';
FixiaVerificationBadge.displayName = 'FixiaVerificationBadge';
FixiaTrustIndicators.displayName = 'FixiaTrustIndicators';

export { 
  FixiaBadge, 
  FixiaRatingBadge, 
  FixiaVerificationBadge, 
  FixiaTrustIndicators 
};

export type { 
  FixiaBadgeProps, 
  FixiaRatingBadgeProps, 
  FixiaVerificationBadgeProps,
  FixiaTrustIndicatorsProps 
};