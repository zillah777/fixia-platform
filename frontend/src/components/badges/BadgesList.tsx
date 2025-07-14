import React from 'react';
import { Badge } from '../../types/professional';
import BadgeDisplay from './BadgeDisplay';

interface BadgesListProps {
  badges: Badge[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'grid';
  showCategories?: boolean;
}

const BadgesList: React.FC<BadgesListProps> = ({ 
  badges, 
  maxDisplay = 5, 
  size = 'md',
  layout = 'horizontal',
  showCategories = false
}) => {
  const displayedBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  if (showCategories) {
    // Group badges by category
    const groupedBadges = badges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {} as Record<string, Badge[]>);

    const categoryLabels = {
      verification: 'Verificación',
      experience: 'Experiencia',
      performance: 'Rendimiento',
      milestone: 'Hitos',
      special: 'Especiales'
    };

    return (
      <div className="space-y-6">
        {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {categoryLabels[category as keyof typeof categoryLabels] || category}
            </h3>
            <div className="flex flex-wrap gap-3">
              {categoryBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center space-y-1">
                  <BadgeDisplay badge={badge} size={size} />
                  <span className="text-xs text-gray-600 text-center max-w-16 truncate">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayedBadges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center space-y-2">
            <BadgeDisplay badge={badge} size={size} />
            <span className="text-xs text-gray-600 text-center">
              {badge.name}
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600">
              +{remainingCount}
            </div>
            <span className="text-xs text-gray-500">Más badges</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {displayedBadges.map((badge) => (
        <BadgeDisplay key={badge.id} badge={badge} size={size} />
      ))}
      {remainingCount > 0 && (
        <div 
          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600"
          title={`${remainingCount} badges adicionales`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default BadgesList;