/**
 * CTA Section - Call to action for user registration
 * @fileoverview Final call-to-action section encouraging user registration
 */
import React from 'react';
import Link from 'next/link';
import { 
  FireIcon, 
  UserGroupIcon, 
  BriefcaseIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-neutral-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-neutral-800 rounded-2xl">
            <FireIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              ¡Únete a la Revolución!
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
            Tu Proyecto Excepcional Te Espera
          </h2>
          
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Únete a la comunidad de visionarios que han elegido la excelencia como estándar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth/registro?type=customer">
              <Button 
                variant="primary"
                size="lg"
                leftIcon={<UserGroupIcon className="h-6 w-6" />}
                rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                className="min-w-[250px]"
              >
                Soy Explorador
              </Button>
            </Link>
            <Link href="/auth/registro?type=provider">
              <Button 
                variant="outline"
                size="lg"
                leftIcon={<BriefcaseIcon className="h-6 w-6" />}
                rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                className="min-w-[250px]"
              >
                Soy Especialista
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;