import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Lightbulb,
  MessageCircle,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

interface OnboardingHelperProps {
  steps: OnboardingStep[];
  userType: 'provider' | 'customer';
  onComplete?: () => void;
  triggerText?: string;
}

const providerOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a Fixia!',
    description: 'Te ayudamos a conseguir clientes para tu trabajo. Es muy fácil, te guiamos paso a paso.',
    action: 'Empezar'
  },
  {
    id: 'add-work',
    title: 'Primero, agrega tus trabajos',
    description: 'Cuenta qué sabes hacer (plomería, electricidad, limpieza, etc.) para que los clientes te encuentren.',
    element: '[href="/as/servicios"]',
    position: 'bottom',
    action: 'Agregar mi primer trabajo'
  },
  {
    id: 'add-photos',
    title: 'Muestra fotos de tu trabajo',
    description: 'Las fotos de trabajos anteriores ayudan mucho. Los clientes confían más cuando ven tu trabajo.',
    element: '[href="/as/portafolio"]',
    position: 'bottom',
    action: 'Agregar fotos'
  },
  {
    id: 'profile',
    title: 'Completa tu perfil',
    description: 'Agrega tu información personal y de contacto. Así los clientes saben quién eres.',
    element: '[href="/as/perfil"]',
    position: 'bottom',
    action: 'Completar perfil'
  },
  {
    id: 'verification',
    title: 'Verifica tu identidad',
    description: 'Subir tu DNI te da más confianza. Los clientes prefieren profesionales verificados.',
    element: '[href="/as/verificacion-dni"]',
    position: 'bottom',
    action: 'Verificar identidad'
  },
  {
    id: 'complete',
    title: '¡Ya estás listo!',
    description: 'Los clientes ahora pueden encontrarte y contactarte. Las solicitudes llegarán por WhatsApp.',
    action: 'Entendido'
  }
];

const customerOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '¡Hola! Te ayudamos a encontrar profesionales',
    description: 'En Fixia puedes encontrar plomeros, electricistas, personal de limpieza y más cerca tuyo.',
    action: 'Empezar'
  },
  {
    id: 'search',
    title: 'Busca lo que necesitas',
    description: 'Usa el buscador para encontrar profesionales o servicios específicos en tu zona.',
    element: 'input[placeholder*="necesitas"]',
    position: 'bottom',
    action: 'Buscar ahora'
  },
  {
    id: 'browse',
    title: 'O explora todos los profesionales',
    description: 'Ve todos los profesionales disponibles, sus trabajos y fotos de lo que hacen.',
    element: '[href="/explorador/marketplace"]',
    position: 'bottom',
    action: 'Ver profesionales'
  },
  {
    id: 'contact',
    title: 'Contactar es muy fácil',
    description: 'Cuando encuentres al profesional que necesitas, solo presiona "Solicitar" y nosotros lo contactamos.',
    action: 'Entendido'
  }
];

export function OnboardingHelper({ userType, onComplete, triggerText }: OnboardingHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const steps = userType === 'provider' ? providerOnboardingSteps : customerOnboardingSteps;
  
  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(`onboarding-completed-${userType}`);
    if (completed) {
      setHasCompleted(true);
    }
  }, [userType]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`onboarding-completed-${userType}`, 'true');
    setHasCompleted(true);
    setIsOpen(false);
    setCurrentStep(0);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  const currentStepData = steps[currentStep];

  // Early return if currentStepData is undefined (should not happen in normal flow)
  if (!currentStepData) {
    return null;
  }

  if (hasCompleted && !isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40 glass border-white/20 text-white hover:bg-white/10"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        {triggerText || '¿Necesitas ayuda?'}
      </Button>
    );
  }

  if (!hasCompleted && !isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="liquid-gradient hover:opacity-90 shadow-lg animate-pulse"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          ¡Te ayudamos a empezar!
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Onboarding Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <Card className="glass border-white/20 shadow-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 liquid-gradient rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">F</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">Guía de Fixia</div>
                      <div className="text-xs text-white/70">
                        Paso {currentStep + 1} de {steps.length}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-white/70 mb-2">
                    <span>Progreso</span>
                    <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {currentStepData.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Special content for specific steps */}
                {currentStep === steps.length - 1 && userType === 'provider' && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <MessageCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div className="text-green-100 text-sm">
                        <p className="font-medium mb-1">¡Tip importante!</p>
                        <p>
                          Las solicitudes de clientes te llegan por WhatsApp. 
                          Asegúrate de tener el número bien configurado en tu perfil.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === steps.length - 1 && userType === 'customer' && (
                  <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="text-blue-100 text-sm">
                        <p className="font-medium mb-1">¿Necesitas ayuda?</p>
                        <p>
                          Si tienes alguna duda, puedes contactarnos por WhatsApp 
                          o usar el botón de ayuda que aparece en todas las páginas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={currentStep === 0 ? handleSkip : handleBack}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {currentStep === 0 ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Saltar
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="liquid-gradient hover:opacity-90"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        ¡Perfecto!
                      </>
                    ) : (
                      <>
                        {currentStepData.action || 'Siguiente'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Simple tooltip helper for contextual help
interface SimpleTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function SimpleTooltip({ content, children, position = 'top' }: SimpleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
              absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap
              ${position === 'top' && '-top-2 left-1/2 transform -translate-x-1/2 -translate-y-full'}
              ${position === 'bottom' && '-bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full'}
              ${position === 'left' && 'top-1/2 -left-2 transform -translate-x-full -translate-y-1/2'}
              ${position === 'right' && 'top-1/2 -right-2 transform translate-x-full -translate-y-1/2'}
            `}
          >
            {content}
            <div className={`
              absolute w-2 h-2 bg-gray-900 transform rotate-45
              ${position === 'top' && 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2'}
              ${position === 'bottom' && 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2'}
              ${position === 'left' && 'left-full top-1/2 transform -translate-x-1/2 -translate-y-1/2'}
              ${position === 'right' && 'right-full top-1/2 transform translate-x-1/2 -translate-y-1/2'}
            `} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}