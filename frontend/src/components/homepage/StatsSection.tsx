/**
 * Stats Section - Platform statistics and achievements
 * @fileoverview Displays key platform metrics and achievements
 */
import React from 'react';
import { PLATFORM_STATS } from '@/data/homepage';

const StatsSection: React.FC = () => {
  return (
    <section className="py-20 bg-surface-50 dark:bg-neutral-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Resultados que Hablan
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Números que demuestran nuestra excelencia
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {PLATFORM_STATS.map((stat) => (
            <div 
              key={stat.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 text-center hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300"
            >
              <div className="text-5xl font-bold text-neutral-900 dark:text-white mb-3">
                {stat.value}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;