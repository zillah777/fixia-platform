import React from 'react';
import { motion } from 'framer-motion';
import { TextSkeleton, Skeleton } from '../ui/skeleton';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { cn } from '@/lib/utils';

/**
 * Form Skeleton Components
 * 
 * Comprehensive form loading states including:
 * - Multi-step booking forms
 * - Profile editing forms
 * - Contact and inquiry forms
 * - Payment and checkout forms
 * - Service creation forms
 * - Mobile-optimized layouts
 */

interface FixiaFormSkeletonProps {
  /** Form type affects layout and fields */
  formType?: 'booking' | 'profile' | 'contact' | 'payment' | 'service' | 'auth';
  /** Glass effect intensity */
  variant?: 'light' | 'medium' | 'strong';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Custom className */
  className?: string;
  /** Show form header */
  showHeader?: boolean;
  /** Show progress indicator (for multi-step forms) */
  showProgress?: boolean;
  /** Number of form steps (for multi-step forms) */
  steps?: number;
  /** Current step (for multi-step forms) */
  currentStep?: number;
  /** Show action buttons */
  showActions?: boolean;
}

const FixiaFormSkeleton: React.FC<FixiaFormSkeletonProps> = ({
  formType = 'booking',
  variant = 'light',
  animation = 'shimmer',
  className,
  showHeader = true,
  showProgress = false,
  steps = 3,
  currentStep = 1,
  showActions = true
}) => {
  const { glassClasses } = useOptimizedGlass(variant);

  // Form Header
  const FormHeaderSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
      role="status"
      aria-label="Cargando cabecera del formulario"
    >
      <TextSkeleton
        width="250px"
        lineHeight="lg"
        animation={animation}
        loadingText="Cargando título del formulario"
      />
      <div className="mt-2">
        <TextSkeleton
          width="400px"
          lineHeight="sm"
          animation={animation}
          loadingText="Cargando descripción del formulario"
        />
      </div>
    </motion.div>
  );

  // Progress Indicator
  const ProgressIndicatorSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-8"
      role="status"
      aria-label="Cargando indicador de progreso"
    >
      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: steps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div className="flex items-center">
              <Skeleton
                width="32px"
                height="32px"
                radius="full"
                animation={animation}
                loadingText={`Cargando paso ${index + 1}`}
              />
              <div className="ml-2 hidden sm:block">
                <TextSkeleton
                  width="80px"
                  lineHeight="sm"
                  animation={animation}
                  loadingText={`Cargando nombre del paso ${index + 1}`}
                />
              </div>
            </div>
            {index < steps - 1 && (
              <Skeleton
                width="60px"
                height="2px"
                radius="full"
                animation={animation}
                className="mx-4"
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2">
        <Skeleton
          width={`${(currentStep / steps) * 100}%`}
          height="8px"
          radius="full"
          animation={animation}
          loadingText="Cargando barra de progreso"
        />
      </div>
    </motion.div>
  );

  // Form Field Skeleton
  const FormFieldSkeleton: React.FC<{
    fieldType: 'text' | 'select' | 'textarea' | 'date' | 'upload' | 'checkbox' | 'radio';
    label?: string;
    required?: boolean;
    index: number;
  }> = ({ fieldType, required = false, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
      className="space-y-2"
    >
      {/* Field label */}
      <div className="flex items-center space-x-1">
        <TextSkeleton
          width="120px"
          lineHeight="sm"
          animation={animation}
          loadingText="Cargando etiqueta del campo"
        />
        {required && (
          <Skeleton
            width="8px"
            height="8px"
            radius="full"
            animation={animation}
            loadingText="Cargando indicador requerido"
          />
        )}
      </div>

      {/* Field input based on type */}
      {fieldType === 'text' && (
        <Skeleton
          height="40px"
          radius="md"
          animation={animation}
          loadingText="Cargando campo de texto"
        />
      )}

      {fieldType === 'select' && (
        <Skeleton
          height="40px"
          radius="md"
          animation={animation}
          loadingText="Cargando campo de selección"
        />
      )}

      {fieldType === 'textarea' && (
        <Skeleton
          height="80px"
          radius="md"
          animation={animation}
          loadingText="Cargando área de texto"
        />
      )}

      {fieldType === 'date' && (
        <div className="flex space-x-2">
          <Skeleton
            className="flex-1"
            height="40px"
            radius="md"
            animation={animation}
            loadingText="Cargando campo de fecha"
          />
          <Skeleton
            width="40px"
            height="40px"
            radius="md"
            animation={animation}
            loadingText="Cargando icono de calendario"
          />
        </div>
      )}

      {fieldType === 'upload' && (
        <div className={cn(
          'border-2 border-dashed border-white/20 rounded-lg p-6 text-center',
          glassClasses
        )}>
          <div className="space-y-3">
            <Skeleton
              width="40px"
              height="40px"
              radius="md"
              animation={animation}
              className="mx-auto"
              loadingText="Cargando icono de subida"
            />
            <TextSkeleton
              width="200px"
              lineHeight="sm"
              animation={animation}
              loadingText="Cargando texto de subida"
            />
            <Skeleton
              width="120px"
              height="32px"
              radius="md"
              animation={animation}
              className="mx-auto"
              loadingText="Cargando botón de selección"
            />
          </div>
        </div>
      )}

      {fieldType === 'checkbox' && (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton
                width="16px"
                height="16px"
                radius="sm"
                animation={animation}
                loadingText={`Cargando checkbox ${i + 1}`}
              />
              <TextSkeleton
                width={`${60 + (i * 20)}%`}
                lineHeight="sm"
                animation={animation}
                loadingText={`Cargando opción ${i + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      {fieldType === 'radio' && (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton
                width="16px"
                height="16px"
                radius="full"
                animation={animation}
                loadingText={`Cargando radio ${i + 1}`}
              />
              <TextSkeleton
                width={`${50 + (i * 15)}%`}
                lineHeight="sm"
                animation={animation}
                loadingText={`Cargando opción ${i + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      <TextSkeleton
        width="80%"
        lineHeight="sm"
        animation={animation}
        loadingText="Cargando texto de ayuda"
      />
    </motion.div>
  );

  // Action Buttons
  const ActionButtonsSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.8 }}
      className="flex items-center justify-between pt-6 border-t border-white/10"
      role="status"
      aria-label="Cargando botones de acción"
    >
      {/* Back button (for multi-step) */}
      {showProgress && currentStep > 1 && (
        <Skeleton
          width="100px"
          height="40px"
          radius="md"
          animation={animation}
          loadingText="Cargando botón anterior"
        />
      )}

      <div className="flex space-x-3 ml-auto">
        {/* Secondary action */}
        <Skeleton
          width="80px"
          height="40px"
          radius="md"
          animation={animation}
          loadingText="Cargando botón secundario"
        />
        
        {/* Primary action */}
        <Skeleton
          width="120px"
          height="40px"
          radius="md"
          animation={animation}
          loadingText="Cargando botón principal"
        />
      </div>
    </motion.div>
  );

  // Form fields configuration based on form type
  const getFormFields = () => {
    switch (formType) {
      case 'booking':
        return [
          { type: 'select' as const, required: true },
          { type: 'date' as const, required: true },
          { type: 'textarea' as const, required: false },
          { type: 'text' as const, required: true },
          { type: 'select' as const, required: false },
          { type: 'checkbox' as const, required: false }
        ];
      
      case 'profile':
        return [
          { type: 'text' as const, required: true },
          { type: 'text' as const, required: true },
          { type: 'textarea' as const, required: false },
          { type: 'select' as const, required: true },
          { type: 'upload' as const, required: false },
          { type: 'checkbox' as const, required: false }
        ];
      
      case 'contact':
        return [
          { type: 'text' as const, required: true },
          { type: 'text' as const, required: true },
          { type: 'select' as const, required: true },
          { type: 'textarea' as const, required: true }
        ];
      
      case 'payment':
        return [
          { type: 'text' as const, required: true },
          { type: 'text' as const, required: true },
          { type: 'select' as const, required: true },
          { type: 'text' as const, required: true },
          { type: 'checkbox' as const, required: true }
        ];
      
      case 'service':
        return [
          { type: 'text' as const, required: true },
          { type: 'select' as const, required: true },
          { type: 'textarea' as const, required: true },
          { type: 'text' as const, required: true },
          { type: 'upload' as const, required: false },
          { type: 'radio' as const, required: true },
          { type: 'checkbox' as const, required: false }
        ];
      
      case 'auth':
        return [
          { type: 'text' as const, required: true },
          { type: 'text' as const, required: true },
          { type: 'checkbox' as const, required: true }
        ];
      
      default:
        return [
          { type: 'text' as const, required: true },
          { type: 'textarea' as const, required: false }
        ];
    }
  };

  const formFields = getFormFields();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 p-6',
        glassClasses,
        className
      )}
      role="status"
      aria-label={`Cargando formulario de ${formType}`}
    >
      {/* Form header */}
      {showHeader && <FormHeaderSkeleton />}

      {/* Progress indicator */}
      {showProgress && <ProgressIndicatorSkeleton />}

      {/* Form fields */}
      <div className="space-y-6">
        {formFields.map((field, index) => (
          <FormFieldSkeleton
            key={index}
            fieldType={field.type}
            required={field.required}
            index={index}
          />
        ))}
      </div>

      {/* Action buttons */}
      {showActions && <ActionButtonsSkeleton />}
    </div>
  );
};

/**
 * Quick Form Skeleton - For simple forms and modals
 */
interface FixiaQuickFormSkeletonProps {
  /** Number of fields */
  fieldCount?: number;
  /** Show title */
  showTitle?: boolean;
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Custom className */
  className?: string;
}

const FixiaQuickFormSkeleton: React.FC<FixiaQuickFormSkeletonProps> = ({
  fieldCount = 3,
  showTitle = true,
  animation = 'shimmer',
  className
}) => {
  const { glassClasses } = useOptimizedGlass('light');

  return (
    <div
      className={cn(
        'space-y-4 p-4 rounded-lg border border-white/10',
        glassClasses,
        className
      )}
      role="status"
      aria-label="Cargando formulario rápido"
    >
      {/* Title */}
      {showTitle && (
        <TextSkeleton
          width="150px"
          lineHeight="md"
          animation={animation}
          loadingText="Cargando título"
        />
      )}

      {/* Fields */}
      <div className="space-y-3">
        {Array.from({ length: fieldCount }, (_, index) => (
          <div key={index} className="space-y-1">
            <TextSkeleton
              width="80px"
              lineHeight="sm"
              animation={animation}
              loadingText={`Cargando etiqueta ${index + 1}`}
            />
            <Skeleton
              height="36px"
              radius="md"
              animation={animation}
              loadingText={`Cargando campo ${index + 1}`}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-2">
        <Skeleton
          width="80px"
          height="36px"
          radius="md"
          animation={animation}
          loadingText="Cargando botón cancelar"
        />
        <Skeleton
          className="flex-1"
          height="36px"
          radius="md"
          animation={animation}
          loadingText="Cargando botón enviar"
        />
      </div>
    </div>
  );
};

export { FixiaFormSkeleton, FixiaQuickFormSkeleton };