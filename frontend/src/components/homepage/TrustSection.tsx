/**
 * Trust Section - Why choose Fixia section
 * @fileoverview Displays trust indicators and platform benefits
 */
import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';
import { TRUST_FEATURES } from '@/data/homepage';

const TrustSection: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-neutral-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-950/50 rounded-full mb-6">
            <SparklesIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              ¿Por qué Fixia?
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-display text-neutral-900 dark:text-white mb-6">
            Marketplace de 
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Confianza</span>
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Tecnología avanzada y profesionales verificados para resultados excepcionales
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRUST_FEATURES.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card key={feature.id} variant="default" padding="xl" hover className="text-center group">
                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div className={`w-24 h-1 bg-gradient-to-r from-${feature.color}-500 to-transparent mx-auto rounded-full opacity-60`} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;