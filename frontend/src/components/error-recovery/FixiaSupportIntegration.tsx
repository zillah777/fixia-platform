/**
 * FixiaSupportIntegration - Comprehensive Support Integration Component
 * Provides multiple contact channels with context-aware messaging
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Phone, 
  Mail,
  HelpCircle,
  Clock,
  User,
  MapPin,
  Send,
  Copy,
  CheckCircle,
  ExternalLink,
  X,
  MessageSquare,
  Calendar,
  FileText,
  AlertTriangle,
  Info,
  Star,
  ThumbsUp,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FixiaError } from '@/types/errors';

interface SupportIntegrationProps {
  error: FixiaError;
  onClose: () => void;
  onContactInitiated: () => void;
  userEmail?: string;
  userName?: string;
}

interface SupportChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  availability: string;
  estimatedResponse: string;
  isAvailable: boolean;
  priority: number;
  contactInfo?: {
    whatsapp?: string;
    phone?: string;
    email?: string;
    chatUrl?: string;
  };
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpfulCount: number;
  relatedToError: boolean;
}

interface TicketInfo {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  estimatedResolution: string;
}

export const FixiaSupportIntegration: React.FC<SupportIntegrationProps> = ({
  error,
  onClose,
  onContactInitiated,
  userEmail,
  userName,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketMessage, setTicketMessage] = useState('');
  const [copiedErrorInfo, setCopiedErrorInfo] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [relatedFAQs, setRelatedFAQs] = useState<FAQItem[]>([]);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);

  // Update current time every minute for availability
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Load related FAQs based on error context
  useEffect(() => {
    const faqs = getFAQsForError(error);
    setRelatedFAQs(faqs);
    
    // Generate ticket info
    const ticket = generateTicketInfo(error);
    setTicketInfo(ticket);
  }, [error]);

  const supportChannels: SupportChannel[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Respuesta rápida y personal',
      icon: <MessageCircle className="h-6 w-6 text-green-500" />,
      availability: 'Lunes a Viernes 9:00 - 18:00 (GMT-3)',
      estimatedResponse: '5-15 minutos',
      isAvailable: isChannelAvailable('whatsapp'),
      priority: 1,
      contactInfo: {
        whatsapp: '+5492965123456',
      },
    },
    {
      id: 'phone',
      name: 'Teléfono',
      description: 'Atención inmediata para casos urgentes',
      icon: <Phone className="h-6 w-6 text-blue-500" />,
      availability: 'Lunes a Viernes 9:00 - 18:00 (GMT-3)',
      estimatedResponse: 'Inmediato',
      isAvailable: isChannelAvailable('phone'),
      priority: error.severity === 'critical' ? 1 : 3,
      contactInfo: {
        phone: '+5492965123456',
      },
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Para consultas detalladas y seguimiento',
      icon: <Mail className="h-6 w-6 text-purple-500" />,
      availability: '24/7',
      estimatedResponse: '2-4 horas laborables',
      isAvailable: true,
      priority: 4,
      contactInfo: {
        email: 'soporte@fixia.com.ar',
      },
    },
    {
      id: 'chat',
      name: 'Chat en Vivo',
      description: 'Asistencia en tiempo real',
      icon: <MessageSquare className="h-6 w-6 text-orange-500" />,
      availability: 'Lunes a Viernes 9:00 - 18:00 (GMT-3)',
      estimatedResponse: '1-3 minutos',
      isAvailable: isChannelAvailable('chat'),
      priority: 2,
      contactInfo: {
        chatUrl: 'https://chat.fixia.com.ar',
      },
    },
  ];

  function isChannelAvailable(channelId: string): boolean {
    const now = currentTime;
    const hours = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Business hours: Monday-Friday 9:00-18:00 (Argentina time)
    const isBusinessHours = day >= 1 && day <= 5 && hours >= 9 && hours < 18;
    
    switch (channelId) {
      case 'whatsapp':
      case 'phone':
      case 'chat':
        return isBusinessHours;
      case 'email':
        return true;
      default:
        return false;
    }
  }

  function getFAQsForError(error: FixiaError): FAQItem[] {
    const allFAQs: FAQItem[] = [
      {
        id: 'network_troubleshoot',
        question: '¿Qué hago si tengo problemas de conexión?',
        answer: 'Verifica tu conexión WiFi o datos móviles. Si el problema persiste, intenta cambiar de red o esperar unos minutos antes de reintentar.',
        category: 'Técnico',
        helpfulCount: 245,
        relatedToError: error.category === 'network',
      },
      {
        id: 'payment_failed',
        question: '¿Por qué falló mi pago?',
        answer: 'Los pagos pueden fallar por fondos insuficientes, problemas con la tarjeta, o límites de seguridad del banco. Prueba con otro método de pago o contacta a tu banco.',
        category: 'Pagos',
        helpfulCount: 189,
        relatedToError: error.category === 'payment',
      },
      {
        id: 'session_expired',
        question: '¿Por qué se cerró mi sesión?',
        answer: 'Por seguridad, las sesiones expiran después de un período de inactividad. Simplemente inicia sesión de nuevo para continuar.',
        category: 'Cuenta',
        helpfulCount: 156,
        relatedToError: error.category === 'authentication',
      },
      {
        id: 'upload_issues',
        question: '¿Por qué no puedo subir archivos?',
        answer: 'Verifica que el archivo sea menor a 5MB y esté en formato JPG, PNG o PDF. También revisa tu conexión a internet.',
        category: 'Técnico',
        helpfulCount: 134,
        relatedToError: error.category === 'file_upload',
      },
      {
        id: 'booking_problems',
        question: '¿Qué hago si hay problemas con mi reserva?',
        answer: 'Los horarios pueden cambiar de disponibilidad rápidamente. Intenta con otros horarios o contacta directamente al profesional.',
        category: 'Reservas',
        helpfulCount: 98,
        relatedToError: error.category === 'booking',
      },
    ];
    
    // Sort by relevance to error and helpfulness
    return allFAQs
      .sort((a, b) => {
        if (a.relatedToError && !b.relatedToError) return -1;
        if (!a.relatedToError && b.relatedToError) return 1;
        return b.helpfulCount - a.helpfulCount;
      })
      .slice(0, 3);
  }

  function generateTicketInfo(error: FixiaError): TicketInfo {
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    let estimatedResolution = '24-48 horas';
    
    switch (error.severity) {
      case 'critical':
        priority = 'urgent';
        estimatedResolution = '2-4 horas';
        break;
      case 'high':
        priority = 'high';
        estimatedResolution = '4-8 horas';
        break;
      case 'medium':
        priority = 'medium';
        estimatedResolution = '24-48 horas';
        break;
      case 'low':
        priority = 'low';
        estimatedResolution = '2-3 días';
        break;
    }
    
    return {
      id: `TICKET_${Date.now()}`,
      priority,
      category: error.category,
      estimatedResolution,
    };
  }

  const handleContactChannel = (channelId: string) => {
    const channel = supportChannels.find(c => c.id === channelId);
    if (!channel) return;
    
    const errorContext = generateErrorContext();
    
    switch (channelId) {
      case 'whatsapp':
        const whatsappMessage = encodeURIComponent(
          `🆘 *Error en Fixia*\n\n` +
          `Hola! Tengo un problema y necesito ayuda.\n\n` +
          `📋 *Detalles del Error:*\n` +
          `• Tipo: ${error.category}\n` +
          `• Área: ${error.platformArea}\n` +
          `• Usuario: ${error.userContext}\n` +
          `• ID: ${error.id}\n\n` +
          `📱 *Descripción:*\n${error.userMessage}\n\n` +
          `${errorContext ? `🔍 *Contexto Adicional:*\n${errorContext}\n\n` : ''}` +
          `¿Pueden ayudarme? Gracias!`
        );
        window.open(`https://wa.me/${channel.contactInfo?.whatsapp}?text=${whatsappMessage}`, '_blank');
        break;
        
      case 'phone':
        window.open(`tel:${channel.contactInfo?.phone}`, '_blank');
        break;
        
      case 'email':
        const emailSubject = encodeURIComponent(`Error en Fixia - ${error.category} - ID: ${error.id.substr(-8)}`);
        const emailBody = encodeURIComponent(
          `Estimado equipo de soporte,\n\n` +
          `Tengo un problema en la plataforma Fixia que requiere su asistencia.\n\n` +
          `DETALLES DEL ERROR:\n` +
          `- Tipo de error: ${error.category}\n` +
          `- Área de la plataforma: ${error.platformArea}\n` +
          `- Tipo de usuario: ${error.userContext}\n` +
          `- Gravedad: ${error.severity}\n` +
          `- ID del error: ${error.id}\n` +
          `- Timestamp: ${error.timestamp}\n\n` +
          `DESCRIPCIÓN:\n${error.userMessage}\n\n` +
          `${errorContext ? `CONTEXTO ADICIONAL:\n${errorContext}\n\n` : ''}` +
          `INFORMACIÓN TÉCNICA:\n${error.technicalDetails || 'No disponible'}\n\n` +
          `Por favor, ayúdenme a resolver este problema.\n\n` +
          `Saludos,\n${userName || userEmail || 'Usuario de Fixia'}`
        );
        window.open(`mailto:${channel.contactInfo?.email}?subject=${emailSubject}&body=${emailBody}`, '_blank');
        break;
        
      case 'chat':
        if (channel.contactInfo?.chatUrl) {
          window.open(channel.contactInfo.chatUrl, '_blank');
        }
        break;
    }
    
    onContactInitiated();
  };

  const generateErrorContext = (): string => {
    const context: string[] = [];
    
    if (error.userContext === 'as') {
      context.push('Soy un profesional AS en la plataforma');
    } else if (error.userContext === 'explorador') {
      context.push('Soy un cliente buscando servicios');
    }
    
    if (error.platformArea === 'payment') {
      context.push('Estaba intentando realizar un pago');
    } else if (error.platformArea === 'chat') {
      context.push('Estaba usando el sistema de mensajería');
    } else if (error.platformArea === 'booking') {
      context.push('Estaba haciendo una reserva');
    }
    
    return context.join('. ');
  };

  const copyErrorInfo = async () => {
    const errorInfo = `Error ID: ${error.id}\nTipo: ${error.category}\nÁrea: ${error.platformArea}\nSeveridad: ${error.severity}\nTimestamp: ${error.timestamp}`;
    
    try {
      await navigator.clipboard.writeText(errorInfo);
      setCopiedErrorInfo(true);
      setTimeout(() => setCopiedErrorInfo(false), 2000);
    } catch (err) {
      console.error('Failed to copy error info:', err);
    }
  };

  const availableChannels = supportChannels
    .filter(channel => channel.isAvailable || channel.id === 'email')
    .sort((a, b) => a.priority - b.priority);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-strong rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Obtener Ayuda</h2>
              <p className="text-white/60 text-sm">Te ayudamos a resolver este problema</p>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Error Summary */}
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-red-400 font-medium">Resumen del Error</h3>
            <Button
              onClick={copyErrorInfo}
              size="sm"
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              {copiedErrorInfo ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-white/60">Tipo:</span>
              <p className="text-white">{error.category}</p>
            </div>
            <div>
              <span className="text-white/60">Gravedad:</span>
              <p className={`${
                error.severity === 'critical' ? 'text-red-400' :
                error.severity === 'high' ? 'text-orange-400' :
                error.severity === 'medium' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                {error.severity}
              </p>
            </div>
            <div>
              <span className="text-white/60">Área:</span>
              <p className="text-white">{error.platformArea}</p>
            </div>
            <div>
              <span className="text-white/60">ID:</span>
              <p className="text-white font-mono text-xs">{error.id.substr(-12)}</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        {relatedFAQs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Preguntas Frecuentes
            </h3>
            
            <div className="space-y-3">
              {relatedFAQs.map((faq) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${
                    faq.relatedToError 
                      ? 'border-green-500/30 bg-green-500/10' 
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">{faq.question}</h4>
                    {faq.relatedToError && (
                      <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">
                        Relacionado
                      </span>
                    )}
                  </div>
                  
                  <p className="text-white/70 text-sm leading-relaxed mb-2">
                    {faq.answer}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-white/50">
                    <span className="flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {faq.helpfulCount} personas encontraron esto útil
                    </span>
                    <span>{faq.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Support Channels */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-4 flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Canales de Soporte
          </h3>
          
          <div className="grid gap-3">
            {availableChannels.map((channel) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  channel.isAvailable 
                    ? 'border-green-500/30 bg-green-500/10 hover:bg-green-500/20' 
                    : 'border-white/10 bg-white/5 opacity-60'
                }`}
                onClick={() => channel.isAvailable && handleContactChannel(channel.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {channel.icon}
                    <div>
                      <h4 className="text-white font-medium flex items-center">
                        {channel.name}
                        {!channel.isAvailable && channel.id !== 'email' && (
                          <Clock className="h-4 w-4 ml-2 text-orange-400" />
                        )}
                      </h4>
                      <p className="text-white/60 text-sm">{channel.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      channel.isAvailable ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {channel.estimatedResponse}
                    </p>
                    <p className="text-white/50 text-xs">{channel.availability}</p>
                  </div>
                </div>
                
                {channel.isAvailable && (
                  <div className="mt-3 flex items-center justify-end">
                    <span className="text-green-400 text-sm flex items-center">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Contactar ahora
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ticket Information */}
        {ticketInfo && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="text-blue-400 font-medium mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Información del Ticket
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-white/60">Prioridad:</span>
                <p className={`font-medium ${
                  ticketInfo.priority === 'urgent' ? 'text-red-400' :
                  ticketInfo.priority === 'high' ? 'text-orange-400' :
                  ticketInfo.priority === 'medium' ? 'text-yellow-400' :
                  'text-blue-400'
                }`}>
                  {ticketInfo.priority}
                </p>
              </div>
              
              <div>
                <span className="text-white/60">Categoría:</span>
                <p className="text-white">{ticketInfo.category}</p>
              </div>
              
              <div>
                <span className="text-white/60">Resolución estimada:</span>
                <p className="text-white">{ticketInfo.estimatedResolution}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm">
            Nuestro equipo está aquí para ayudarte. Elige el canal que prefieras para contactarnos.
          </p>
          <p className="text-white/40 text-xs mt-1">
            Tiempo promedio de respuesta: {error.severity === 'critical' ? '30 minutos' : '2-4 horas'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};