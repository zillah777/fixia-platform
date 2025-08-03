import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SimpleBookingFlowProps {
  professionalName: string;
  serviceName: string;
  servicePrice: number;
  onComplete: (requestData: any) => void;
  onCancel: () => void;
}

export function SimpleBookingFlow({ 
  professionalName, 
  serviceName, 
  servicePrice, 
  onComplete, 
  onCancel 
}: SimpleBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Qué necesitas
    description: '',
    urgency: 'normal',
    
    // Step 2: Cuándo y dónde
    preferredDate: '',
    preferredTime: '',
    address: '',
    contactPhone: '',
    
    // Step 3: Confirmación
    additionalNotes: ''
  });

  const steps = [
    {
      number: 1,
      title: "¿Qué necesitas?",
      subtitle: "Cuéntanos qué problema tienes"
    },
    {
      number: 2,
      title: "¿Cuándo y dónde?",
      subtitle: "Cuándo te viene bien y dónde lo hacemos"
    },
    {
      number: 3,
      title: "¡Casi listo!",
      subtitle: "Revisa y confirma tu solicitud"
    }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onComplete({
      ...formData,
      serviceName,
      professionalName,
      servicePrice
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.description.trim().length > 10;
      case 2:
        return formData.preferredDate && formData.address.trim() && formData.contactPhone.trim();
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass border-white/20">
          <CardHeader className="text-center relative">
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <CardTitle className="text-2xl text-white mb-2">
              Solicitar: {serviceName}
            </CardTitle>
            <p className="text-white/80">
              con {professionalName} • ${servicePrice.toLocaleString()}
            </p>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mt-6">
              {steps.map((step) => (
                <div key={step.number} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step.number 
                      ? 'bg-primary text-white' 
                      : 'bg-white/20 text-white/60'
                    }
                  `}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  {step.number < 3 && (
                    <div className={`
                      w-8 h-0.5 mx-2
                      ${currentStep > step.number ? 'bg-primary' : 'bg-white/20'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium text-white">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-white/70 text-sm">
                {steps[currentStep - 1].subtitle}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: ¿Qué necesitas? */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <Label className="text-white/90 text-base mb-3 block">
                      Describe qué problema tienes o qué necesitas arreglar
                    </Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ejemplo: Se me rompió la canilla de la cocina y gotea mucho. No puedo cerrarla bien..."
                      className="glass border-white/20 focus:border-primary/50 min-h-24 text-white placeholder:text-white/60"
                      rows={4}
                    />
                    <p className="text-white/60 text-sm mt-2">
                      Mientras más detalles nos des, mejor podrá ayudarte {professionalName}
                    </p>
                  </div>

                  <div>
                    <Label className="text-white/90 text-base mb-3 block">
                      ¿Qué tan urgente es?
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { value: 'low', label: 'No es urgente', desc: 'Puedo esperar unos días', color: 'green' },
                        { value: 'normal', label: 'Normal', desc: 'Esta semana estaría bien', color: 'blue' },
                        { value: 'urgent', label: 'Urgente', desc: 'Lo necesito pronto', color: 'orange' },
                        { value: 'emergency', label: 'Emergencia', desc: 'Es una emergencia', color: 'red' }
                      ].map((option) => (
                        <label key={option.value} className="cursor-pointer">
                          <div className={`
                            p-4 rounded-lg border-2 transition-all
                            ${formData.urgency === option.value 
                              ? 'border-primary bg-primary/20' 
                              : 'border-white/20 bg-white/5 hover:border-white/30'
                            }
                          `}>
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="urgency"
                                value={option.value}
                                checked={formData.urgency === option.value}
                                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                                className="text-primary"
                              />
                              <div className="flex-1">
                                <div className="text-white font-medium">{option.label}</div>
                                <div className="text-white/70 text-sm">{option.desc}</div>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: ¿Cuándo y dónde? */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/90 text-base mb-3 block">
                        <Calendar className="inline w-4 h-4 mr-2" />
                        ¿Qué día te viene bien?
                      </Label>
                      <Input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                        className="glass border-white/20 focus:border-primary/50 text-white"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <Label className="text-white/90 text-base mb-3 block">
                        <Clock className="inline w-4 h-4 mr-2" />
                        ¿A qué hora? (opcional)
                      </Label>
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                        className="w-full p-3 glass border-white/20 rounded-lg text-white bg-transparent"
                      >
                        <option value="">Cualquier horario</option>
                        <option value="morning">Mañana (8:00 - 12:00)</option>
                        <option value="afternoon">Tarde (12:00 - 18:00)</option>
                        <option value="evening">Noche (18:00 - 20:00)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/90 text-base mb-3 block">
                      <MapPin className="inline w-4 h-4 mr-2" />
                      ¿Dónde está el problema? (dirección completa)
                    </Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Av. San Martín 1234, Rawson, Chubut"
                      className="glass border-white/20 focus:border-primary/50 text-white placeholder:text-white/60"
                    />
                    <p className="text-white/60 text-sm mt-2">
                      Incluye la dirección completa para que {professionalName} pueda llegar
                    </p>
                  </div>

                  <div>
                    <Label className="text-white/90 text-base mb-3 block">
                      <Phone className="inline w-4 h-4 mr-2" />
                      Tu número de teléfono
                    </Label>
                    <Input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="2965 123456 (WhatsApp preferible)"
                      className="glass border-white/20 focus:border-primary/50 text-white placeholder:text-white/60"
                    />
                    <p className="text-white/60 text-sm mt-2">
                      Para que {professionalName} pueda contactarte y coordinar
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmación */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="glass-light rounded-lg p-6 space-y-4">
                    <h4 className="text-white font-medium text-lg mb-4">Resumen de tu solicitud:</h4>
                    
                    <div className="space-y-3 text-white/90">
                      <div className="flex justify-between">
                        <span>Trabajo:</span>
                        <span className="font-medium">{serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profesional:</span>
                        <span className="font-medium">{professionalName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precio estimado:</span>
                        <span className="font-medium text-green-400">${servicePrice.toLocaleString()}</span>
                      </div>
                      {formData.preferredDate && (
                        <div className="flex justify-between">
                          <span>Fecha preferida:</span>
                          <span className="font-medium">
                            {new Date(formData.preferredDate).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Urgencia:</span>
                        <span className="font-medium">
                          {formData.urgency === 'low' && 'No urgente'}
                          {formData.urgency === 'normal' && 'Normal'}
                          {formData.urgency === 'urgent' && 'Urgente'}
                          {formData.urgency === 'emergency' && 'Emergencia'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/90 text-base mb-3 block">
                      ¿Algo más que quieras agregar? (opcional)
                    </Label>
                    <Textarea
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                      placeholder="Cualquier detalle adicional que pueda ser útil..."
                      className="glass border-white/20 focus:border-primary/50 text-white placeholder:text-white/60"
                      rows={3}
                    />
                  </div>

                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="text-blue-100 text-sm">
                        <p className="font-medium mb-1">¿Qué pasa después?</p>
                        <p>
                          1. {professionalName} recibirá tu solicitud por WhatsApp<br/>
                          2. Se comunicará contigo para confirmar detalles<br/>
                          3. Acordarán el día y hora final<br/>
                          4. ¡Listo! {professionalName} irá a solucionar tu problema
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-white/10">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? onCancel : handleBack}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? 'Cancelar' : 'Volver'}
              </Button>

              <Button
                onClick={currentStep === 3 ? handleSubmit : handleNext}
                disabled={!canProceed()}
                className="liquid-gradient hover:opacity-90 disabled:opacity-50"
              >
                {currentStep === 3 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    ¡Enviar Solicitud!
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}