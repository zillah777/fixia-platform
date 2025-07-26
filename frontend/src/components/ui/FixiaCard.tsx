'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// 🎨 FIXIA CARD COMPONENT - "Professional Showcase"
// Sistema de cards con efectos hover avanzados y diferentes variantes

interface FixiaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'provider' | 'glass' | 'elevated';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

interface FixiaCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface FixiaCardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface FixiaCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface FixiaCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface FixiaCardSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const FixiaCard = React.forwardRef<HTMLDivElement, FixiaCardProps>(
  ({ className, variant = 'default', hover = true, padding = 'md', children, ...props }, ref) => {
    const baseClasses = 'fixia-card';
    
    const variantClasses = {
      default: '',
      provider: 'fixia-provider-card',
      glass: 'fixia-glass-card',
      elevated: 'shadow-2xl'
    };
    
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          !hover && 'hover:transform-none hover:shadow-sm',
          padding !== 'none' && paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const FixiaCardHeader = React.forwardRef<HTMLDivElement, FixiaCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('fixia-card-header', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const FixiaCardBody = React.forwardRef<HTMLDivElement, FixiaCardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('fixia-card-body', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const FixiaCardFooter = React.forwardRef<HTMLDivElement, FixiaCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('fixia-card-footer', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const FixiaCardTitle = React.forwardRef<HTMLHeadingElement, FixiaCardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('fixia-card-title', className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

const FixiaCardSubtitle = React.forwardRef<HTMLParagraphElement, FixiaCardSubtitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('fixia-card-subtitle', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

FixiaCard.displayName = 'FixiaCard';
FixiaCardHeader.displayName = 'FixiaCardHeader';
FixiaCardBody.displayName = 'FixiaCardBody';
FixiaCardFooter.displayName = 'FixiaCardFooter';
FixiaCardTitle.displayName = 'FixiaCardTitle';
FixiaCardSubtitle.displayName = 'FixiaCardSubtitle';

export { 
  FixiaCard, 
  FixiaCardHeader, 
  FixiaCardBody, 
  FixiaCardFooter, 
  FixiaCardTitle, 
  FixiaCardSubtitle 
};

export type { 
  FixiaCardProps, 
  FixiaCardHeaderProps, 
  FixiaCardBodyProps, 
  FixiaCardFooterProps,
  FixiaCardTitleProps,
  FixiaCardSubtitleProps 
};