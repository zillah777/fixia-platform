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
  steps?: OnboardingStep[];
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

export function OnboardingHelper({ steps: propSteps, userType, onComplete, triggerText }: OnboardingHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const steps = propSteps || (userType === 'provider' ? providerOnboardingSteps : customerOnboardingSteps);
  
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
    // Mark as completed when user skips/closes so it doesn't show again
    localStorage.setItem(`onboarding-completed-${userType}`, 'true');
    setHasCompleted(true);
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
        className="fixed bottom-4 right-2 sm:right-4 z-40 glass border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm px-2 sm:px-3 py-2"
      >
        <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">{triggerText || '¿Necesitas ayuda?'}</span>
        <span className="sm:hidden">Ayuda</span>
      </Button>
    );
  }

  if (!hasCompleted && !isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-4 right-2 sm:right-4 z-40"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="liquid-gradient hover:opacity-90 shadow-lg animate-pulse text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3"
        >
          <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">¡Te ayudamos a empezar!</span>
          <span className="sm:hidden">¡Ayuda!</span>
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

          {/* Onboarding Modal - SIMPLIFICADO */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80 max-w-[calc(100vw-2rem)]">
            <Card className="glass border-white/20 shadow-2xl">
              <CardContent className="p-4">
                {/* Header compacto */}
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm font-semibold text-white">
                    Paso {currentStep + 1} de {steps.length}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-white/60 hover:text-white h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Contenido */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    {currentStepData.title}
                  </h3>
                  <p className="text-xs text-white/80">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Botones SIEMPRE VISIBLES */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={currentStep === 0 ? handleSkip : handleBack}
                    className="border-white/20 text-white hover:bg-white/10 px-3 py-2 text-xs flex-1"
                  >
                    {currentStep === 0 ? 'Saltar' : 'Volver'}
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="liquid-gradient hover:opacity-90 px-3 py-2 text-xs flex-1"
                  >
                    {currentStep === steps.length - 1 ? '¡Listo!' : 'Siguiente'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
              absolute z-50 px-3 py-1.5 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-md whitespace-nowrap
              ${position === 'top' && '-top-2 left-1/2 transform -translate-x-1/2 -translate-y-full'}
              ${position === 'bottom' && '-bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full'}
              ${position === 'left' && 'top-1/2 -left-2 transform -translate-x-full -translate-y-1/2'}
              ${position === 'right' && 'top-1/2 -right-2 transform translate-x-full -translate-y-1/2'}
            `}
          >
            {content}
            <div className={`
              absolute w-2 h-2 bg-gray-900 border border-gray-700 transform rotate-45
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