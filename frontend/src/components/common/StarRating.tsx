/**
 * Star Rating Component - Reusable star rating display
 * @fileoverview Shows star ratings with consistent styling
 */
import React from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { cn } from '@/utils/helpers';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  className
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          return (
            <StarIconSolid
              key={index}
              className={cn(
                sizeClasses[size],
                starValue <= rating 
                  ? 'text-yellow-400' 
                  : 'text-neutral-300 dark:text-neutral-600'
              )}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;