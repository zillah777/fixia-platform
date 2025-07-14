import React from 'react';
import { BadgeProgress as BadgeProgressType } from '../../types/professional';

interface BadgeProgressProps {
  progress: BadgeProgressType;
  showPercentage?: boolean;
}

const BadgeProgress: React.FC<BadgeProgressProps> = ({ 
  progress, 
  showPercentage = true 
}) => {
  const percentage = progress.progress_percentage || 0;
  const isEarned = progress.is_earned;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              isEarned 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 bg-gray-50'
            }`}
            style={isEarned ? { borderColor: progress.color } : undefined}
          >
            <span className={`text-lg ${isEarned ? '' : 'grayscale'}`}>
              {progress.icon}
            </span>
          </div>
          
          <div className="flex-1">
            <h3 className={`font-semibold ${isEarned ? 'text-gray-900' : 'text-gray-600'}`}>
              {progress.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {progress.description}
            </p>
          </div>
        </div>

        {isEarned && (
          <div className="flex items-center space-x-1 text-green-600">
            <span className="text-lg">✓</span>
            <span className="text-sm font-medium">Obtenido</span>
          </div>
        )}
      </div>

      {!isEarned && progress.target_progress > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            {showPercentage && (
              <span>{percentage}%</span>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>{progress.current_progress || 0} / {progress.target_progress}</span>
            {percentage >= 100 && (
              <span className="text-green-600 font-medium">¡Listo para obtener!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeProgress;