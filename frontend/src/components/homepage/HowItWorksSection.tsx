/**
 * How It Works Section - Process explanation component
 * @fileoverview Shows the 3-step process for using the platform
 */
import React from 'react';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { HOW_IT_WORKS_STEPS } from '@/data/homepage';
import Button from '@/components/ui/Button';

const HowItWorksSection: React.FC = () => {
  return (
    <section id="como-funciona" className="py-20 bg-white dark:bg-neutral-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-6">
            Tres Pasos Hacia la Excelencia
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Una metodología diseñada para garantizar que cada conexión sea perfecta, cada resultado extraordinario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.id} className="text-center">
                <div className="w-20 h-20 bg-neutral-900 dark:bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="h-8 w-8 text-white dark:text-neutral-900" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/auth/registro">
            <Button variant="primary" size="lg">
              Experimentar la Diferencia
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;