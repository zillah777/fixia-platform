import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useAccessibilityPreferences, 
  useScreenReaderAnnouncement, 
  formatCurrencyForScreenReader,
  generateAccessibleId,
  createInteractiveDescription
} from '@/utils/accessibility';
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  TrendingUp, 
  Shield, 
  Users, 
  Calculator,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MarketplaceLayout from '@/components/layouts/MarketplaceLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { PromotionBanner } from '@/components/PromotionBanner';

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  id: 'basic' | 'professional' | 'plus';
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  features: PlanFeature[];
  cta: string;
  color: string;
  icon: any;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Plan Básico',
    price: 0,
    period: 'Gratis para siempre',
    description: 'Perfecto para comenzar y probar la plataforma',
    features: [
      { text: 'Hasta 3 servicios publicados', included: true },
      { text: 'Perfil básico de profesional', included: true },
      { text: 'Comunicación directa con clientes', included: true },
      { text: 'Acceso al marketplace', included: true },
      { text: 'Sin comisiones por transacciones', included: true, highlight: true },
      { text: 'Posición estándar en búsquedas', included: false },
      { text: 'Badge de profesional verificado', included: false },
      { text: 'Estadísticas avanzadas', included: false },
      { text: 'Soporte prioritario', included: false },
      { text: 'Promoción destacada', included: false }
    ],
    cta: 'Comenzar Gratis',
    color: 'from-gray-500 to-gray-600',
    icon: Star
  },
  {
    id: 'professional',
    name: 'Plan Profesional',
    price: 4000,
    originalPrice: 6000,
    period: 'por mes',
    description: 'La mejor opción para profesionales serios',
    badge: 'MÁS POPULAR',
    badgeColor: 'bg-primary',
    popular: true,
    features: [
      { text: 'Servicios ilimitados', included: true, highlight: true },
      { text: 'Perfil premium con portafolio', included: true },
      { text: 'Badge de profesional verificado', included: true, highlight: true },
      { text: 'Prioridad en resultados de búsqueda', included: true, highlight: true },
      { text: 'Sin comisiones por transacciones', included: true, highlight: true },
      { text: 'Estadísticas detalladas y análisis', included: true },
      { text: 'Soporte prioritario 24/7', included: true },
      { text: 'Promoción en redes sociales', included: true },
      { text: 'Acceso a clientes premium', included: true },
      { text: 'Calendario de disponibilidad avanzado', included: true }
    ],
    cta: '🎉 Obtener Promoción - 2 Meses GRATIS',
    color: 'from-primary to-primary/80',
    icon: Zap
  },
  {
    id: 'plus',
    name: 'Plan Plus',
    price: 7000,
    originalPrice: 10000,
    period: 'por mes',
    description: 'Para profesionales que buscan el máximo rendimiento',
    badge: 'VIP',
    badgeColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    features: [
      { text: 'Todo del Plan Profesional', included: true },
      { text: 'Posición preferencial garantizada', included: true, highlight: true },
      { text: 'Sin comisiones por transacciones', included: true, highlight: true },
      { text: 'Gestor de cuenta personal', included: true, highlight: true },
      { text: 'Promoción destacada semanal', included: true },
      { text: 'Acceso exclusivo a eventos VIP', included: true },
      { text: 'Certificación Fixia Premium', included: true },
      { text: 'API personalizada para integración', included: true },
      { text: 'Capacitación y mentoring gratuito', included: true },
      { text: 'Primera respuesta garantizada', included: true }
    ],
    cta: 'Convertirse en VIP',
    color: 'from-yellow-400 to-orange-500',
    icon: Crown
  }
];

const testimonials = [
  {
    name: 'Roberto Sánchez',
    role: 'Plomero en Comodoro Rivadavia',
    rating: 5,
    text: 'Empecé hace 6 meses con el plan básico. La plataforma me ayudó a conseguir mis primeros clientes digitales.',
    avatar: '/api/placeholder/64/64'
  },
  {
    name: 'Carmen López',
    role: 'Servicio de Limpieza',
    rating: 5,
    text: 'Los clientes pueden encontrarme fácil y las reseñas me ayudan a ganar más trabajos cada semana.',
    avatar: '/api/placeholder/64/64'
  },
  {
    name: 'Jorge Martín',
    role: 'Electricista Matriculado',
    rating: 4,
    text: 'Me registré hace poco pero ya tengo varios presupuestos. El sistema es fácil de usar.',
    avatar: '/api/placeholder/64/64'
  }
];

const faqs = [
  {
    question: '¿Puedo cancelar mi suscripción en cualquier momento?',
    answer: 'Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de configuración. No hay compromisos a largo plazo ni penalizaciones por cancelación.'
  },
  {
    question: '¿Qué incluye la promoción de 2 meses gratis?',
    answer: 'Los primeros 200 profesionales que se suscriban al Plan Profesional recibirán 2 meses completamente gratis. Esta promoción es limitada y se aplica automáticamente al registrarte.'
  },
  {
    question: '¿Cuál es la diferencia en las comisiones?',
    answer: 'Fixia NO cobra comisiones sobre transacciones. Todos los planes permiten que conserves el 100% de tus ganancias. La diferencia entre planes está en las funcionalidades adicionales, visibilidad y herramientas profesionales.'
  },
  {
    question: '¿Cómo funciona la prioridad en búsquedas?',
    answer: 'Los profesionales con Plan Profesional y Plus aparecen primero en los resultados de búsqueda, aumentando significativamente su visibilidad y oportunidades de contratación.'
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos todos los métodos de pago locales: tarjetas de débito y crédito, transferencias bancarias, y próximamente MercadoPago y billeteras digitales.'
  }
];

export default function PlanesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [remainingSpots, setRemainingSpots] = useState(47); // Simulated countdown
  const [monthlyEarnings, setMonthlyEarnings] = useState(50000);
  
  // Accessibility features
  const accessibilityPrefs = useAccessibilityPreferences();
  const { announce, AnnouncementRegion } = useScreenReaderAnnouncement();
  const mainContentRef = useRef<HTMLElement>(null);
  const roiCalculatorId = generateAccessibleId('roi-calculator');
  const plansListId = generateAccessibleId('plans-list');
  const faqsListId = generateAccessibleId('faqs-list');

  // Simulated countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSpots(prev => {
        if (prev > 1) {
          return prev - Math.floor(Math.random() * 2); // Randomly decrease by 0 or 1
        }
        return prev;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const calculateROI = (plan: Plan) => {
    if (plan.id === 'basic') {
      // No commission - all earnings are kept
      return monthlyEarnings;
    } else if (plan.id === 'professional') {
      // No commission + 50% more earnings due to better visibility
      const increased = monthlyEarnings * 1.5;
      return increased - plan.price;
    } else {
      // No commission + 100% more earnings due to premium features
      const increased = monthlyEarnings * 2;
      return increased - plan.price;
    }
  };

  const handleSliderChange = (value: number) => {
    setMonthlyEarnings(value);
    // Announce ROI changes to screen readers
    if (accessibilityPrefs.screenReader) {
      announce({
        message: `Ingresos actualizados a ${formatCurrencyForScreenReader(value)}. Las ganancias estimadas han cambiado.`,
        priority: 'polite',
        delay: 500
      });
    }
  };

  const handleUpgrade = (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    
    if (!user) {
      announce({
        message: 'Redirigiendo a la página de registro para continuar con la suscripción.',
        priority: 'polite'
      });
      router.push('/auth/registro');
      return;
    }
    
    announce({
      message: `Has seleccionado el ${selectedPlan?.name}. Preparando proceso de pago.`,
      priority: 'assertive'
    });
    
    // Here you would integrate with your payment system
    console.log(`Upgrading to ${planId}`);
    // For now, just show success
    alert(`¡Excelente elección! Te redirigiremos al proceso de pago para el ${selectedPlan?.name}.`);
  };

  const handleFaqToggle = (index: number) => {
    const isExpanding = expandedFaq !== index;
    setExpandedFaq(isExpanding ? index : null);
    
    if (isExpanding) {
      announce({
        message: `Respuesta expandida: ${faqs[index]?.answer || 'No disponible'}`,
        priority: 'polite',
        delay: 300
      });
    }
  };

  return (
    <MarketplaceLayout>
      {/* Skip Links for Keyboard Navigation */}
      <a 
        href="#main-content" 
        className="skip-link"
        onFocus={() => announce({ message: 'Navegación rápida: saltar al contenido principal', priority: 'polite' })}
      >
        Saltar al contenido principal
      </a>
      <a 
        href={`#${roiCalculatorId}`} 
        className="skip-link"
      >
        Saltar a la calculadora de ROI
      </a>
      <a 
        href={`#${plansListId}`} 
        className="skip-link"
      >
        Saltar a los planes de suscripción
      </a>
      <a 
        href={`#${faqsListId}`} 
        className="skip-link"
      >
        Saltar a las preguntas frecuentes
      </a>
      
      <AnnouncementRegion />
      
      <main 
        id="main-content"
        ref={mainContentRef}
        className="min-h-screen"
        role="main"
        aria-label="Página de planes y precios de Fixia"
      >
        {/* Hero Section with Promotional Banner */}
        <motion.section
          initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, y: 0 }}
          className="relative overflow-hidden"
          aria-labelledby="hero-heading"
        >
          {/* Promotional Banner */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 mx-4 sm:mx-6 lg:mx-8"
          >
            <PromotionBanner variant="hero" />
          </motion.div>

          {/* Main Hero */}
          <div className="text-center px-4 sm:px-6 lg:px-8 mb-16">
            <motion.div
              initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={accessibilityPrefs.reducedMotion ? {} : { delay: 0.2 }}
            >
              <h1 
                id="hero-heading"
                className="text-4xl md:text-6xl font-bold mb-6"
                tabIndex={-1}
              >
                Potencia tu negocio con
                <span className="block liquid-text-gradient">Fixia Premium</span>
              </h1>
              <p 
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
                aria-describedby="hero-description"
              >
                <span id="hero-description">
                  Más visibilidad, mejores herramientas, mayores ingresos. 
                  Elige el plan que impulse tu carrera profesional al siguiente nivel.
                </span>
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* ROI Calculator */}
        <motion.section
          initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={accessibilityPrefs.reducedMotion ? {} : { delay: 0.3 }}
          className="mb-16 px-4 sm:px-6 lg:px-8"
          aria-labelledby="roi-calculator-heading"
        >
          <Card 
            id={roiCalculatorId}
            className="glass max-w-4xl mx-auto p-8"
            role="region"
            aria-labelledby="roi-calculator-heading"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Calculator 
                  className="h-6 w-6 text-primary" 
                  aria-hidden="true"
                />
                <h2 
                  id="roi-calculator-heading"
                  className="text-2xl font-bold"
                >
                  Calculadora de ROI
                </h2>
              </div>
              <p 
                className="text-muted-foreground"
                id="roi-calculator-description"
              >
                Descubre cuánto más podrías ganar con un plan premium
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label 
                  htmlFor="monthly-earnings-slider"
                  className="block text-sm font-medium mb-2"
                >
                  Tus ingresos mensuales actuales (ARS)
                </label>
                <input
                  id="monthly-earnings-slider"
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={monthlyEarnings}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider focus-visible"
                  aria-describedby="monthly-earnings-description roi-calculator-description"
                  aria-valuemin={10000}
                  aria-valuemax={200000}
                  aria-valuenow={monthlyEarnings}
                  aria-valuetext={`${formatCurrencyForScreenReader(monthlyEarnings)} mensuales`}
                  role="slider"
                />
                <div 
                  id="monthly-earnings-description"
                  className="flex justify-between text-sm text-muted-foreground mt-1"
                >
                  <span aria-label="Mínimo: diez mil pesos">$10,000</span>
                  <span 
                    className="font-medium"
                    aria-live="polite"
                    aria-label={`Valor actual: ${formatCurrencyForScreenReader(monthlyEarnings)}`}
                  >
                    ${monthlyEarnings.toLocaleString()}
                  </span>
                  <span aria-label="Máximo: doscientos mil pesos">$200,000</span>
                </div>
              </div>

              <div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                role="group"
                aria-label="Resultados de cálculo de retorno de inversión por plan"
              >
                {plans.map((plan) => {
                  const roi = calculateROI(plan);
                  const basicROI = plans[0] ? calculateROI(plans[0]) : 0;
                  const improvementPercentage = plan.id !== 'basic' 
                    ? Math.round(((roi - basicROI) / basicROI) * 100)
                    : 0;
                  
                  return (
                    <div 
                      key={plan.id} 
                      className="glass-light rounded-lg p-4 text-center"
                      role="group"
                      aria-labelledby={`roi-${plan.id}-title`}
                      aria-describedby={`roi-${plan.id}-details`}
                    >
                      <h3 
                        id={`roi-${plan.id}-title`}
                        className="font-semibold mb-2"
                      >
                        {plan.name}
                      </h3>
                      <div 
                        className="text-2xl font-bold text-primary mb-1"
                        aria-label={`Ganancia estimada: ${formatCurrencyForScreenReader(roi)} mensuales`}
                      >
                        ${roi.toLocaleString()}
                      </div>
                      <div 
                        id={`roi-${plan.id}-details`}
                        className="text-sm text-muted-foreground"
                      >
                        ganancia neta mensual
                      </div>
                      {plan.id !== 'basic' && (
                        <div 
                          className="text-xs text-green-400 mt-1"
                          aria-label={`Mejora del ${improvementPercentage} por ciento comparado con el Plan Básico`}
                        >
                          +{improvementPercentage}% vs Plan Básico
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Pricing Plans */}
        <section 
          className="px-4 sm:px-6 lg:px-8 mb-16"
          aria-labelledby="pricing-plans-heading"
        >
          <motion.div
            initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={accessibilityPrefs.reducedMotion ? {} : { delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 
              id="pricing-plans-heading"
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Planes diseñados para tu éxito
            </h2>
            <p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              id="pricing-plans-description"
            >
              Desde profesionales que recién comienzan hasta expertos que buscan maximizar sus ingresos
            </p>
          </motion.div>

          <div 
            id={plansListId}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            role="group"
            aria-labelledby="pricing-plans-heading"
            aria-describedby="pricing-plans-description"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, y: 50 }}
                animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={accessibilityPrefs.reducedMotion ? {} : { delay: 0.5 + index * 0.1 }}
                className={`relative ${plan.popular ? 'lg:scale-105 lg:-mt-4' : ''}`}
              >
                <Card 
                  className={`glass relative overflow-hidden h-full transition-all duration-300 hover:scale-105 focus-within:scale-105 ${
                    plan.popular ? 'ring-2 ring-primary/50 shadow-2xl shadow-primary/20' : ''
                  }`}
                  role="region"
                  aria-labelledby={`plan-${plan.id}-title`}
                  aria-describedby={`plan-${plan.id}-description plan-${plan.id}-features`}
                >
                  {plan.badge && (
                    <div 
                      className={`absolute top-0 right-0 ${plan.badgeColor} text-white px-3 py-1 text-xs font-semibold rounded-bl-lg`}
                      aria-label={`Etiqueta del plan: ${plan.badge}`}
                      role="status"
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <div 
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} mb-4`}
                        aria-hidden="true"
                      >
                        <plan.icon className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 
                        id={`plan-${plan.id}-title`}
                        className="text-2xl font-bold mb-2"
                      >
                        {plan.name}
                      </h3>
                      <p 
                        id={`plan-${plan.id}-description`}
                        className="text-muted-foreground mb-6"
                      >
                        {plan.description}
                      </p>
                      
                      <div 
                        className="mb-6"
                        role="group"
                        aria-labelledby={`plan-${plan.id}-pricing`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {plan.originalPrice && (
                            <span 
                              className="text-lg text-muted-foreground line-through"
                              aria-label={`Precio original: ${formatCurrencyForScreenReader(plan.originalPrice)}`}
                            >
                              ${plan.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span 
                            id={`plan-${plan.id}-pricing`}
                            className="text-4xl font-bold"
                            aria-label={`Precio actual: ${formatCurrencyForScreenReader(plan.price)}`}
                          >
                            ${plan.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-muted-foreground">{plan.period}</div>
                        {plan.originalPrice && (
                          <Badge 
                            className="mt-2 bg-green-100 text-green-800 border-0"
                            aria-label={`Ahorro de ${formatCurrencyForScreenReader(plan.originalPrice - plan.price)}`}
                          >
                            Ahorra ${(plan.originalPrice - plan.price).toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div 
                      className="space-y-4 mb-8"
                      role="list"
                      aria-labelledby={`plan-${plan.id}-features`}
                    >
                      <div className="sr-only">
                        <h4 id={`plan-${plan.id}-features`}>Características del {plan.name}</h4>
                      </div>
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, x: -20 }}
                          animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, x: 0 }}
                          transition={accessibilityPrefs.reducedMotion ? {} : { delay: 0.6 + featureIndex * 0.05 }}
                          className={`flex items-start space-x-3 ${feature.highlight ? 'glass-light rounded-lg p-2' : ''}`}
                          role="listitem"
                        >
                          {feature.included ? (
                            <Check 
                              className={`h-5 w-5 mt-0.5 flex-shrink-0 ${feature.highlight ? 'text-primary' : 'text-green-400'}`}
                              aria-label="Característica incluida"
                            />
                          ) : (
                            <div 
                              className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600"
                              aria-label="Característica no incluida"
                              role="img"
                            />
                          )}
                          <span 
                            className={`text-sm ${!feature.included ? 'text-muted-foreground line-through' : ''} ${feature.highlight ? 'font-medium text-primary' : ''}`}
                            aria-label={`${feature.included ? 'Incluido' : 'No incluido'}: ${feature.text}`}
                          >
                            {feature.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full h-12 text-lg font-semibold transition-all duration-300 focus-visible ${
                        plan.popular
                          ? 'liquid-gradient hover:opacity-90 shadow-lg text-white'
                          : plan.id === 'plus'
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg'
                          : 'glass-medium hover:glass-strong'
                      }`}
                      aria-describedby={`plan-${plan.id}-description plan-${plan.id}-pricing`}
                      aria-label={`${createInteractiveDescription('button', `suscribirse al ${plan.name}`)}. ${plan.cta}`}
                    >
                      {plan.cta}
                    </Button>

                    {plan.id === 'professional' && (
                      <p 
                        className="text-center text-xs text-muted-foreground mt-2"
                        aria-label="Beneficios adicionales: Activación inmediata y sin permanencia"
                      >
                        <span aria-hidden="true">⚡</span>
                        <span className="sr-only">Destacado:</span>
                        Activación inmediata - Sin permanencia
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Proof Section */}
        <motion.section
          initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={accessibilityPrefs.reducedMotion ? {} : { delay: 0.8 }}
          className="mb-16 px-4 sm:px-6 lg:px-8"
          aria-labelledby="testimonials-heading"
        >
          <div className="text-center mb-12">
            <h2 
              id="testimonials-heading"
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Lo que dicen nuestros profesionales
            </h2>
            <p 
              className="text-xl text-muted-foreground"
              id="testimonials-description"
            >
              Profesionales reales de Chubut que ya están usando Fixia
            </p>
          </div>

          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
            role="group"
            aria-labelledby="testimonials-heading"
            aria-describedby="testimonials-description"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={accessibilityPrefs.reducedMotion ? {} : { delay: 0.9 + index * 0.1 }}
              >
                <Card 
                  className="glass p-6 h-full"
                  role="article"
                  aria-labelledby={`testimonial-${index}-name`}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white font-semibold"
                      aria-hidden="true"
                    >
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <h3 
                        id={`testimonial-${index}-name`}
                        className="font-semibold"
                      >
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div 
                    className="flex text-yellow-400 mb-3"
                    role="img"
                    aria-label={`Calificación: ${testimonial.rating} de 5 estrellas`}
                  >
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <p 
                    className="text-muted-foreground"
                    aria-label={`Testimonio de ${testimonial.name}: ${testimonial.text}`}
                  >
                    {testimonial.text}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, scale: 1 }}
            transition={accessibilityPrefs.reducedMotion ? {} : { delay: 1.2 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            role="group"
            aria-label="Estadísticas de la plataforma Fixia"
          >
            {[
              { number: '200+', label: 'Profesionales registrados', ariaLabel: 'Más de doscientos profesionales registrados' },
              { number: '4.8⭐', label: 'Calificación promedio', ariaLabel: 'Calificación promedio de cuatro punto ocho estrellas' },
              { number: '150+', label: 'Trabajos completados', ariaLabel: 'Más de ciento cincuenta trabajos completados' },
              { number: '24/7', label: 'Soporte disponible', ariaLabel: 'Soporte disponible veinticuatro horas los siete días de la semana' }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center glass-light rounded-lg p-4"
                role="group"
                aria-labelledby={`stat-${index}-number`}
                aria-describedby={`stat-${index}-label`}
              >
                <div 
                  id={`stat-${index}-number`}
                  className="text-2xl md:text-3xl font-bold text-primary mb-1"
                  aria-label={stat.ariaLabel}
                >
                  {stat.number}
                </div>
                <div 
                  id={`stat-${index}-label`}
                  className="text-sm text-muted-foreground"
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={accessibilityPrefs.reducedMotion ? {} : { delay: 1.0 }}
          className="mb-16 px-4 sm:px-6 lg:px-8"
          aria-labelledby="faq-heading"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 
                id="faq-heading"
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Preguntas frecuentes
              </h2>
              <p 
                className="text-xl text-muted-foreground"
                id="faq-description"
              >
                Resolvemos todas tus dudas sobre nuestros planes premium
              </p>
            </div>

            <div 
              id={faqsListId}
              className="space-y-4"
              role="group"
              aria-labelledby="faq-heading"
              aria-describedby="faq-description"
            >
              {faqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                const faqId = generateAccessibleId(`faq-${index}`);
                const answerId = generateAccessibleId(`answer-${index}`);
                
                return (
                  <motion.div
                    key={index}
                    initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, x: -20 }}
                    animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, x: 0 }}
                    transition={accessibilityPrefs.reducedMotion ? {} : { delay: 1.1 + index * 0.1 }}
                  >
                    <Card className="glass overflow-hidden">
                      <button
                        id={faqId}
                        onClick={() => handleFaqToggle(index)}
                        className="w-full p-6 text-left flex items-center justify-between hover:glass-medium transition-all duration-300 focus-visible"
                        aria-expanded={isExpanded}
                        aria-controls={answerId}
                        aria-describedby={isExpanded ? answerId : undefined}
                        type="button"
                      >
                        <span className="font-semibold text-lg">{faq.question}</span>
                        {isExpanded ? (
                          <ChevronUp 
                            className="h-5 w-5 text-primary" 
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronDown 
                            className="h-5 w-5 text-muted-foreground" 
                            aria-hidden="true"
                          />
                        )}
                        <span className="sr-only">
                          {isExpanded ? 'Colapsar respuesta' : 'Expandir respuesta'}
                        </span>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={accessibilityPrefs.reducedMotion ? {} : { height: 0, opacity: 0 }}
                            animate={accessibilityPrefs.reducedMotion ? {} : { height: 'auto', opacity: 1 }}
                            exit={accessibilityPrefs.reducedMotion ? {} : { height: 0, opacity: 0 }}
                            transition={accessibilityPrefs.reducedMotion ? {} : { duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div 
                              id={answerId}
                              className="px-6 pb-6 text-muted-foreground"
                              role="region"
                              aria-labelledby={faqId}
                            >
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial={accessibilityPrefs.reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={accessibilityPrefs.reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={accessibilityPrefs.reducedMotion ? {} : { delay: 1.4 }}
          className="mb-16 px-4 sm:px-6 lg:px-8"
          aria-labelledby="final-cta-heading"
        >
          <Card 
            className="glass max-w-4xl mx-auto text-center p-12"
            role="region"
            aria-labelledby="final-cta-heading"
          >
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Award className="h-8 w-8 text-primary" aria-hidden="true" />
                <h2 
                  id="final-cta-heading"
                  className="text-3xl md:text-4xl font-bold"
                >
                  ¿Listo para acelerar tu carrera?
                </h2>
              </div>
              <p 
                className="text-xl text-muted-foreground mb-8"
                id="final-cta-description"
              >
                Únete a los profesionales más exitosos de Chubut y transforma tu negocio hoy mismo
              </p>
              
              <div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
                role="group"
                aria-labelledby="final-cta-heading"
                aria-describedby="final-cta-description"
              >
                <Button
                  onClick={() => handleUpgrade('professional')}
                  size="lg"
                  className="liquid-gradient hover:opacity-90 text-white shadow-lg w-full sm:w-auto px-8 py-3 text-lg font-semibold focus-visible"
                  aria-label={`${createInteractiveDescription('button', 'obtener Plan Profesional con 2 meses gratis')}`}
                >
                  <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
                  Obtener 2 Meses Gratis
                </Button>
                
                <Button
                  onClick={() => handleUpgrade('plus')}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg w-full sm:w-auto px-8 py-3 text-lg font-semibold focus-visible"
                  aria-label={`${createInteractiveDescription('button', 'obtener Plan Plus VIP')}`}
                >
                  <Crown className="mr-2 h-5 w-5" aria-hidden="true" />
                  Ir Premium VIP
                </Button>
              </div>
            </div>

            <div 
              className="flex items-center justify-center space-x-6 text-sm text-muted-foreground"
              role="list"
              aria-label="Beneficios de los planes premium"
            >
              <div className="flex items-center space-x-2" role="listitem">
                <Shield className="h-4 w-4" aria-hidden="true" />
                <span>Sin compromisos</span>
              </div>
              <div className="flex items-center space-x-2" role="listitem">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>Activación inmediata</span>
              </div>
              <div className="flex items-center space-x-2" role="listitem">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
                <span>Resultados garantizados</span>
              </div>
            </div>
          </Card>
        </motion.section>
      </main>
    </MarketplaceLayout>
  );
}