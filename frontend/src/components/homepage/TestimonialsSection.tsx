/**
 * Testimonials Section - Customer testimonials and reviews
 * @fileoverview Displays customer testimonials with ratings and comments
 */
import React from 'react';
import { TESTIMONIALS } from '@/data/homepage';
import StarRating from '@/components/common/StarRating';

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-neutral-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-6">
            Historias de Transformación
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Cada testimonio es una prueba de que cuando la innovación encuentra la experiencia, surgen resultados extraordinarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300"
            >
              <div className="text-center mb-6">
                <StarRating rating={testimonial.rating} size="md" />
              </div>
              
              <div className="mb-6">
                <p className="text-neutral-900 dark:text-white font-medium text-center italic">
                  "{testimonial.comment}"
                </p>
              </div>
              
              <div className="text-center">
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {testimonial.name}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {testimonial.service}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;