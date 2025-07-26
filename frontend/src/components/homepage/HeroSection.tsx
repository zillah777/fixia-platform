/**
 * Hero Section - Main landing page hero component
 * @fileoverview Clean, modular hero section with consistent theming
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  BoltIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

import Logo from '@/components/Logo';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const HeroSection: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explorador/buscar-servicio?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/20 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-12 animate-fade-in">
            
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Marketplace de Servicios Profesionales
              </span>
            </div>

            {/* Hero Logo & Title */}
            <div className="space-y-8">
              <div className="flex justify-center animate-scale-in">
                <Logo size="2xl" variant="primary" animated showText={false} />
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-neutral-900 dark:text-white leading-tight">
                  <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Fixia
                  </span>
                  <br />
                  <span className="text-neutral-600 dark:text-neutral-400 text-3xl md:text-4xl lg:text-5xl">
                    Conecta. Confía. Resuelve.
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-4xl mx-auto leading-relaxed">
                  El marketplace que conecta a los mejores profesionales con clientes que buscan 
                  <span className="font-semibold text-primary-600 dark:text-primary-400"> calidad excepcional</span>.
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-success-500" />
                  <span className="text-sm font-medium">Verificado</span>
                </div>
                <div className="flex items-center gap-2">
                  <BoltIcon className="h-5 w-5 text-warning-500" />
                  <span className="text-sm font-medium">Sin comisiones</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-secondary-500" />
                  <span className="text-sm font-medium">4.9/5 rating</span>
                </div>
              </div>
            </div>

            {/* Search Card */}
            <div className="max-w-3xl mx-auto">
              <Card variant="glass" padding="lg" className="backdrop-blur-md">
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      ¿Qué servicio necesitas?
                    </h3>
                    
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ej: Plomero, electricista, limpieza..."
                      variant="filled"
                      inputSize="lg"
                      leftIcon={<MagnifyingGlassIcon className="h-6 w-6" />}
                      fullWidth
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={!searchQuery.trim()}
                    leftIcon={<RocketLaunchIcon className="h-5 w-5" />}
                  >
                    Buscar Profesionales
                  </Button>
                </form>
              </Card>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/auth/registro?type=customer">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<UserGroupIcon className="h-6 w-6" />}
                  rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                  className="min-w-[200px]"
                >
                  Soy Cliente
                </Button>
              </Link>
              <Link href="/auth/registro?type=provider">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<BriefcaseIcon className="h-6 w-6" />}
                  rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                  className="min-w-[200px]"
                >
                  Soy Profesional
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;