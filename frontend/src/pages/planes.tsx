import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      { text: 'Comisión del 8% por transacción', included: true, highlight: true },
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
      { text: 'Comisión reducida del 5%', included: true, highlight: true },
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
    name: 'María González',
    role: 'Diseñadora Gráfica',
    rating: 5,
    text: 'Con el Plan Profesional aumenté mis ingresos un 300% en 3 meses. La visibilidad es increíble.',
    avatar: '/api/placeholder/64/64'
  },
  {
    name: 'Carlos Rodríguez',
    role: 'Plomero',
    rating: 5,
    text: 'El Plan Plus me dio acceso a clientes premium. Ahora trabajo solo en proyectos de alta gama.',
    avatar: '/api/placeholder/64/64'
  },
  {
    name: 'Ana Martínez',
    role: 'Profesora de Idiomas',
    rating: 5,
    text: 'La promoción de 2 meses gratis me convenció. Ahora soy TOP 3 en mi categoría.',
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
    answer: 'Plan Básico: 8% de comisión. Plan Profesional: 5% de comisión. Plan Plus: 0% de comisión. Esto significa que con planes premium conservas más de tus ganancias.'
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
      const commission = monthlyEarnings * 0.08;
      return monthlyEarnings - commission;
    } else if (plan.id === 'professional') {
      const commission = monthlyEarnings * 0.05;
      const increased = monthlyEarnings * 1.5; // 50% more earnings
      return increased - commission - plan.price;
    } else {
      const increased = monthlyEarnings * 2; // 100% more earnings
      return increased - plan.price;
    }
  };

  const handleUpgrade = (planId: string) => {
    if (!user) {
      router.push('/auth/registro');
      return;
    }
    
    // Here you would integrate with your payment system
    console.log(`Upgrading to ${planId}`);
    // For now, just show success
    alert(`¡Excelente elección! Te redirigiremos al proceso de pago para el ${plans.find(p => p.id === planId)?.name}.`);
  };

  return (
    <MarketplaceLayout>
      <div className="min-h-screen">
        {/* Hero Section with Promotional Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Potencia tu negocio con
                <span className="block liquid-text-gradient">Fixia Premium</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Más visibilidad, menos comisiones, mayores ingresos. 
                Elige el plan que impulse tu carrera profesional al siguiente nivel.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* ROI Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16 px-4 sm:px-6 lg:px-8"
        >
          <Card className="glass max-w-4xl mx-auto p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Calculator className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">Calculadora de ROI</h3>
              </div>
              <p className="text-muted-foreground">
                Descubre cuánto más podrías ganar con un plan premium
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tus ingresos mensuales actuales (ARS)
                </label>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={monthlyEarnings}
                  onChange={(e) => setMonthlyEarnings(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>$10,000</span>
                  <span className="font-medium">${monthlyEarnings.toLocaleString()}</span>
                  <span>$200,000</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const roi = calculateROI(plan);
                  return (
                    <div key={plan.id} className="glass-light rounded-lg p-4 text-center">
                      <h4 className="font-semibold mb-2">{plan.name}</h4>
                      <div className="text-2xl font-bold text-primary mb-1">
                        ${roi.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ganancia neta mensual
                      </div>
                      {plan.id !== 'basic' && (
                        <div className="text-xs text-green-400 mt-1">
                          +{Math.round(((roi - calculateROI(plans[0])) / calculateROI(plans[0])) * 100)}% vs Plan Básico
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pricing Plans */}
        <div className="px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planes diseñados para tu éxito
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Desde profesionales que recién comienzan hasta expertos que buscan maximizar sus ingresos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`relative ${plan.popular ? 'lg:scale-105 lg:-mt-4' : ''}`}
              >
                <Card className={`glass relative overflow-hidden h-full transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-primary/50 shadow-2xl shadow-primary/20' : ''
                }`}>
                  {plan.badge && (
                    <div className={`absolute top-0 right-0 ${plan.badgeColor} text-white px-3 py-1 text-xs font-semibold rounded-bl-lg`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                        <plan.icon className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-muted-foreground mb-6">{plan.description}</p>
                      
                      <div className="mb-6">
                        <div className="flex items-center justify-center space-x-2">
                          {plan.originalPrice && (
                            <span className="text-lg text-muted-foreground line-through">
                              ${plan.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-4xl font-bold">
                            ${plan.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-muted-foreground">{plan.period}</div>
                        {plan.originalPrice && (
                          <Badge className="mt-2 bg-green-100 text-green-800 border-0">
                            Ahorra ${(plan.originalPrice - plan.price).toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + featureIndex * 0.05 }}
                          className={`flex items-start space-x-3 ${feature.highlight ? 'glass-light rounded-lg p-2' : ''}`}
                        >
                          {feature.included ? (
                            <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${feature.highlight ? 'text-primary' : 'text-green-400'}`} />
                          ) : (
                            <div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
                          )}
                          <span className={`text-sm ${!feature.included ? 'text-muted-foreground line-through' : ''} ${feature.highlight ? 'font-medium text-primary' : ''}`}>
                            {feature.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${
                        plan.popular
                          ? 'liquid-gradient hover:opacity-90 shadow-lg text-white'
                          : plan.id === 'plus'
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg'
                          : 'glass-medium hover:glass-strong'
                      }`}
                    >
                      {plan.cta}
                    </Button>

                    {plan.id === 'professional' && (
                      <p className="text-center text-xs text-muted-foreground mt-2">
                        ⚡ Activación inmediata - Sin permanencia
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Social Proof Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lo que dicen nuestros profesionales
            </h2>
            <p className="text-xl text-muted-foreground">
              Más de 1,000 profesionales confían en Fixia para hacer crecer su negocio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <Card className="glass p-6 h-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white font-semibold">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{testimonial.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { number: '1,000+', label: 'Profesionales activos' },
              { number: '95%', label: 'Tasa de satisfacción' },
              { number: '3x', label: 'Aumento promedio de ingresos' },
              { number: '24/7', label: 'Soporte disponible' }
            ].map((stat, index) => (
              <div key={index} className="text-center glass-light rounded-lg p-4">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-xl text-muted-foreground">
                Resolvemos todas tus dudas sobre nuestros planes premium
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                >
                  <Card className="glass overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:glass-medium transition-all duration-300"
                    >
                      <span className="font-semibold text-lg">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-primary" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-muted-foreground">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mb-16 px-4 sm:px-6 lg:px-8"
        >
          <Card className="glass max-w-4xl mx-auto text-center p-12">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Award className="h-8 w-8 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold">
                  ¿Listo para acelerar tu carrera?
                </h2>
              </div>
              <p className="text-xl text-muted-foreground mb-8">
                Únete a los profesionales más exitosos de Chubut y transforma tu negocio hoy mismo
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
                <Button
                  onClick={() => handleUpgrade('professional')}
                  size="lg"
                  className="liquid-gradient hover:opacity-90 text-white shadow-lg w-full sm:w-auto px-8 py-3 text-lg font-semibold"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Obtener 2 Meses Gratis
                </Button>
                
                <Button
                  onClick={() => handleUpgrade('plus')}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg w-full sm:w-auto px-8 py-3 text-lg font-semibold"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Ir Premium VIP
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Sin compromisos</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Activación inmediata</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Resultados garantizados</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </MarketplaceLayout>
  );
}