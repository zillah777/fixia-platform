import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FixiaServiceCardSkeleton,
  FixiaDashboardSkeleton,
  FixiaProfileSkeleton,
  FixiaChatSkeleton,
  FixiaSearchSkeleton,
  FixiaFormSkeleton,
  SkeletonProvider,
  useSkeleton,
  useSkeletonLoading
} from '../skeletons';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

/**
 * Skeleton Usage Examples
 * 
 * Comprehensive examples showing how to integrate Fixia skeleton components
 * with real loading states, React Query, and various use cases.
 */

// Example 1: Service marketplace with skeleton loading
const ServiceMarketplaceExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const { skeletonProps } = useSkeletonLoading(isLoading);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setServices([
        { id: 1, title: 'Plomería Residencial', provider: 'Juan Pérez' },
        { id: 2, title: 'Electricidad Comercial', provider: 'María González' },
        { id: 3, title: 'Jardinería y Paisajismo', provider: 'Carlos López' }
      ]);
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Servicios Disponibles</h2>
        <Button onClick={() => setIsLoading(!isLoading)}>
          {isLoading ? 'Mostrar Datos' : 'Mostrar Skeleton'}
        </Button>
      </div>

      {isLoading ? (
        <FixiaServiceCardSkeleton
          count={6}
          variant="grid"
          {...skeletonProps}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="glass hover:glass-medium transition-all duration-300">
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Proveedor: {service.provider}</p>
                  <Badge className="mt-2">Disponible</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// Example 2: Dashboard with skeleton states
const DashboardExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDashboardData({
        activeServices: 12,
        totalEarnings: 25000,
        avgRating: 4.8,
        completedJobs: 45
      });
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard AS</h2>
        <Button onClick={() => setIsLoading(!isLoading)}>
          {isLoading ? 'Mostrar Datos' : 'Mostrar Skeleton'}
        </Button>
      </div>

      {isLoading ? (
        <FixiaDashboardSkeleton
          cardCount={6}
          showHeader={true}
          animation="shimmer"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle>Servicios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.activeServices}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader>
              <CardTitle>Ingresos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${dashboardData.totalEarnings.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader>
              <CardTitle>Calificación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.avgRating} ⭐</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// Example 3: Profile loading with different layouts
const ProfileExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState<'full' | 'card' | 'compact'>('full');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Perfil de Profesional</h2>
        <div className="flex space-x-2">
          <Button
            variant={layout === 'full' ? 'default' : 'outline'}
            onClick={() => setLayout('full')}
          >
            Completo
          </Button>
          <Button
            variant={layout === 'card' ? 'default' : 'outline'}
            onClick={() => setLayout('card')}
          >
            Tarjeta
          </Button>
          <Button onClick={() => setIsLoading(!isLoading)}>
            Toggle Loading
          </Button>
        </div>
      </div>

      {isLoading ? (
        <FixiaProfileSkeleton
          layout={layout}
          profileType="provider"
          showPortfolio={layout === 'full'}
          showReviews={layout === 'full'}
          animation="shimmer"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass p-6">
            <CardContent>
              <div className="text-center">
                <h3 className="text-xl font-bold">Juan Carlos Martínez</h3>
                <p className="text-muted-foreground">Plomero Profesional</p>
                <p className="mt-2">Especialista en instalaciones residenciales y comerciales</p>
                <Badge className="mt-2">Verificado</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// Example 4: Chat interface loading
const ChatExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chatLayout, setChatLayout] = useState<'list' | 'conversation' | 'fullscreen'>('conversation');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Interface de Chat</h2>
        <div className="flex space-x-2">
          <Button
            variant={chatLayout === 'list' ? 'default' : 'outline'}
            onClick={() => setChatLayout('list')}
          >
            Lista
          </Button>
          <Button
            variant={chatLayout === 'conversation' ? 'default' : 'outline'}
            onClick={() => setChatLayout('conversation')}
          >
            Conversación
          </Button>
          <Button onClick={() => setIsLoading(!isLoading)}>
            Toggle Loading
          </Button>
        </div>
      </div>

      <div className="h-96 border border-white/10 rounded-lg overflow-hidden">
        {isLoading ? (
          <FixiaChatSkeleton
            layout={chatLayout}
            count={chatLayout === 'list' ? 5 : 8}
            showTyping={chatLayout === 'conversation'}
            animation="shimmer"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full glass p-4 flex items-center justify-center"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold">Chat Interface Loaded</h3>
              <p className="text-muted-foreground">Ready for real-time messaging</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Example 5: Search with filters
const SearchExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchLayout, setSearchLayout] = useState<'full' | 'results-only' | 'compact'>('full');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Búsqueda de Servicios</h2>
        <div className="flex space-x-2">
          <Button
            variant={searchLayout === 'full' ? 'default' : 'outline'}
            onClick={() => setSearchLayout('full')}
          >
            Completa
          </Button>
          <Button
            variant={searchLayout === 'results-only' ? 'default' : 'outline'}
            onClick={() => setSearchLayout('results-only')}
          >
            Solo Resultados
          </Button>
          <Button onClick={() => setIsLoading(!isLoading)}>
            Toggle Loading
          </Button>
        </div>
      </div>

      {isLoading ? (
        <FixiaSearchSkeleton
          layout={searchLayout}
          resultCount={6}
          showFilters={searchLayout === 'full'}
          showSort={true}
          resultsLayout="grid"
          animation="shimmer"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass p-6">
            <CardContent>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Resultados de Búsqueda</h3>
                <p className="text-muted-foreground">Se encontraron 24 servicios en Chubut</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// Example 6: Form loading
const FormExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [formType, setFormType] = useState<'booking' | 'profile' | 'contact'>('booking');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Formularios</h2>
        <div className="flex space-x-2">
          <Button
            variant={formType === 'booking' ? 'default' : 'outline'}
            onClick={() => setFormType('booking')}
          >
            Reserva
          </Button>
          <Button
            variant={formType === 'profile' ? 'default' : 'outline'}
            onClick={() => setFormType('profile')}
          >
            Perfil
          </Button>
          <Button onClick={() => setIsLoading(!isLoading)}>
            Toggle Loading
          </Button>
        </div>
      </div>

      {isLoading ? (
        <FixiaFormSkeleton
          formType={formType}
          showHeader={true}
          showProgress={formType === 'booking'}
          steps={3}
          currentStep={1}
          animation="shimmer"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass p-6">
            <CardContent>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Formulario de {formType}</h3>
                <p className="text-muted-foreground">Formulario cargado y listo para usar</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// Main example component with skeleton provider
const SkeletonUsageExamples: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0);

  const examples = [
    { name: 'Marketplace', component: ServiceMarketplaceExample },
    { name: 'Dashboard', component: DashboardExample },
    { name: 'Perfil', component: ProfileExample },
    { name: 'Chat', component: ChatExample },
    { name: 'Búsqueda', component: SearchExample },
    { name: 'Formularios', component: FormExample }
  ];

  const ActiveComponent = examples[activeExample].component;

  return (
    <SkeletonProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Fixia Skeleton Components</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive skeleton loading states with Liquid Glass design system integration.
              Performance-optimized and accessibility-compliant.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-2">
            {examples.map((example, index) => (
              <Button
                key={example.name}
                variant={activeExample === index ? 'default' : 'outline'}
                onClick={() => setActiveExample(index)}
                className="glass hover:glass-medium"
              >
                {example.name}
              </Button>
            ))}
          </div>

          {/* Active Example */}
          <motion.div
            key={activeExample}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ActiveComponent />
          </motion.div>

          {/* Performance Info */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Performance Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold">Optimizations</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Reduced motion support</li>
                    <li>Mobile performance optimization</li>
                    <li>Hardware acceleration</li>
                    <li>Staggered animations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Accessibility</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Screen reader announcements</li>
                    <li>ARIA labels and roles</li>
                    <li>High contrast support</li>
                    <li>Loading timeouts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SkeletonProvider>
  );
};

export default SkeletonUsageExamples;