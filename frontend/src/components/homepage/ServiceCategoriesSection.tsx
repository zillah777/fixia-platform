/**
 * Service Categories Section - Display available service categories
 * @fileoverview Shows main service categories with modern card design
 */
import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { SERVICE_CATEGORIES } from '@/data/homepage';

const ServiceCategoriesSection: React.FC = () => {
  return (
    <section id="servicios" className="py-20 bg-surface-50 dark:bg-neutral-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
            Servicios que Transforman
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Cada especialista es cuidadosamente seleccionado. Cada proyecto, una oportunidad de crear algo extraordinario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICE_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.id} href={`/explorador/buscar-servicio?category=${category.id}`}>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 group cursor-pointer hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300">
                  <div className="mb-6 transform group-hover:scale-105 transition-transform duration-300">
                    <div className="w-20 h-20 rounded-2xl bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
                      <IconComponent className="h-10 w-10 text-white dark:text-neutral-900" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center text-neutral-900 dark:text-white font-medium group-hover:translate-x-2 transition-transform">
                    <span>Explorar especialistas</span>
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategoriesSection;