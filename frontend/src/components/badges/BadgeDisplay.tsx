import React from 'react';
import { Badge } from '../../types/professional';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ 
  badge, 
  size = 'md', 
  showTooltip = true 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full border-2 ${sizeClasses[size]} group`}
      style={{ 
        backgroundColor: badge.color + '20',
        borderColor: badge.color 
      }}
      title={showTooltip ? badge.description : undefined}
    >
      <span className={textSizes[size]}>{badge.icon}</span>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
          <div className="font-semibold">{badge.name}</div>
          <div className="text-gray-300">{badge.description}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;