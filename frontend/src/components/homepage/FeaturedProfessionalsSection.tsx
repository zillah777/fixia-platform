/**
 * Featured Professionals Section - Showcase top professionals
 * @fileoverview Displays featured professionals with ratings and services
 */
import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { FEATURED_PROFESSIONALS } from '@/data/homepage';
import StarRating from '@/components/common/StarRating';
import Button from '@/components/ui/Button';

const FeaturedProfessionalsSection: React.FC = () => {
  return (
    <section id="profesionales" className="py-20 bg-surface-50 dark:bg-neutral-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
            Especialistas de Elite
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Profesionales excepcionales que han sido rigurosamente evaluados y que consistentemente superan expectativas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_PROFESSIONALS.map((professional) => (
            <div 
              key={professional.id} 
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-neutral-900 dark:bg-neutral-100 rounded-2xl flex items-center justify-center mr-4">
                  <UserGroupIcon className="h-8 w-8 text-white dark:text-neutral-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {professional.name}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {professional.profession}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <StarRating rating={Math.round(professional.rating)} size="md" />
                  <span className="ml-2 text-sm font-medium text-neutral-900 dark:text-white">
                    {professional.rating}
                  </span>
                  <span className="ml-1 text-sm text-neutral-500 dark:text-neutral-400">
                    ({professional.reviews} reseñas)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {professional.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs rounded-full font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{professional.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/explorador/navegar-profesionales">
            <Button variant="primary" size="lg" rightIcon={<ArrowRightIcon className="h-5 w-5" />}>
              Ver Todos los Especialistas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProfessionalsSection;