/**
 * FixiaPaymentError - Payment Error Handler with MercadoPago Integration
 * Handles payment failures with alternative payment methods and recovery options
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Building,
  Smartphone,
  Wallet,
  ExternalLink,
  Info,
  ArrowRight,
  Copy,
  Phone,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentError } from '@/types/errors';

interface PaymentErrorProps {
  error: PaymentError;
  onRetryPayment?: () => void;
  onSelectAlternativeMethod?: (method: string) => void;
  onContactSupport?: () => void;
  onCancelPayment?: () => void;
  showTransactionDetails?: boolean;
  enableAlternativeMethods?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  processingTime: string;
  fees?: string;
  requirements?: string[];
}

interface TransactionInfo {
  id: string;
  amount: number;
  currency: string;
  serviceName?: string;
  providerName?: string;
  timestamp: string;
  status: 'failed' | 'cancelled' | 'pending' | 'processing';
}

export const FixiaPaymentError: React.FC<PaymentErrorProps> = ({
  error,
  onRetryPayment,
  onSelectAlternativeMethod,
  onContactSupport,
  onCancelPayment,
  showTransactionDetails = true,
  enableAlternativeMethods = true,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showMethodDetails, setShowMethodDetails] = useState<string | null>(null);
  const [copiedTransactionId, setCopiedTransactionId] = useState(false);
  const [transactionInfo, setTransactionInfo] = useState<TransactionInfo | null>(null);

  // Payment methods available in Argentina
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mercadopago_wallet',
      name: 'MercadoPago',
      description: 'Billetera digital más popular en Argentina',
      icon: <Wallet className="h-6 w-6 text-blue-500" />,
      available: true,
      processingTime: 'Inmediato',
      fees: 'Sin costo adicional',
      requirements: ['Cuenta de MercadoPago', 'Saldo disponible o tarjeta vinculada'],
    },
    {
      id: 'credit_card',
      name: 'Tarjeta de Crédito',
      description: 'Visa, Mastercard, American Express',
      icon: <CreditCard className="h-6 w-6 text-green-500" />,
      available: true,
      processingTime: 'Inmediato',
      fees: 'Según tu banco',
      requirements: ['Tarjeta válida', 'Fondos disponibles'],
    },
    {
      id: 'debit_card',
      name: 'Tarjeta de Débito',
      description: 'Débito inmediato desde tu cuenta bancaria',
      icon: <CreditCard className="h-6 w-6 text-purple-500" />,
      available: true,
      processingTime: 'Inmediato',
      fees: 'Sin costo adicional',
      requirements: ['Tarjeta de débito válida', 'Saldo en cuenta'],
    },
    {
      id: 'bank_transfer',
      name: 'Transferencia Bancaria',
      description: 'CBU o Alias desde cualquier banco',
      icon: <Building className="h-6 w-6 text-orange-500" />,
      available: true,
      processingTime: '24-48 horas',
      fees: 'Según tu banco',
      requirements: ['Cuenta bancaria', 'CBU o Alias de destino'],
    },
    {
      id: 'rapipago',
      name: 'RapiPago / PagoFácil',
      description: 'Pago en efectivo en locales',
      icon: <Smartphone className="h-6 w-6 text-red-500" />,
      available: true,
      processingTime: '2-4 horas',
      fees: 'Comisión del local',
      requirements: ['Código de pago', 'Efectivo'],
    },
  ];

  useEffect(() => {
    // Extract transaction information from error
    const transaction: TransactionInfo = {
      id: error.transactionId || error.paymentId || `TXN_${Date.now()}`,
      amount: error.amount || 0,
      currency: error.currency || 'ARS',
      timestamp: error.timestamp,
      status: 'failed',
    };
    
    setTransactionInfo(transaction);
  }, [error]);

  const handleRetryPayment = async () => {
    if (!onRetryPayment) return;
    
    setIsRetrying(true);
    try {
      await onRetryPayment();
    } catch (error) {
      console.error('Payment retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    if (onSelectAlternativeMethod) {
      onSelectAlternativeMethod(methodId);
    }
  };

  const copyTransactionId = async () => {
    if (!transactionInfo?.id) return;
    
    try {
      await navigator.clipboard.writeText(transactionInfo.id);
      setCopiedTransactionId(true);
      setTimeout(() => setCopiedTransactionId(false), 2000);
    } catch (err) {
      console.error('Failed to copy transaction ID:', err);
    }
  };

  const getPaymentErrorIcon = () => {
    switch (error.paymentMethod) {
      case 'mercadopago':
        return <Wallet className="h-8 w-8 text-blue-400" />;
      case 'credit_card':
        return <CreditCard className="h-8 w-8 text-red-400" />;
      case 'bank_transfer':
        return <Building className="h-8 w-8 text-orange-400" />;
      default:
        return <DollarSign className="h-8 w-8 text-red-400" />;
    }
  };

  const getErrorTitle = () => {
    switch (error.declineReason) {
      case 'insufficient_funds':
        return 'Fondos Insuficientes';
      case 'card_declined':
        return 'Tarjeta Rechazada';
      case 'expired_card':
        return 'Tarjeta Vencida';
      case 'invalid_card':
        return 'Tarjeta Inválida';
      case 'processing_error':
        return 'Error de Procesamiento';
      default:
        return 'Error en el Pago';
    }
  };

  const getErrorDescription = () => {
    switch (error.declineReason) {
      case 'insufficient_funds':
        return 'No hay suficiente saldo en tu cuenta para completar el pago.';
      case 'card_declined':
        return 'Tu banco rechazó la transacción. Puede ser por límites de seguridad.';
      case 'expired_card':
        return 'La tarjeta que intentaste usar está vencida.';
      case 'invalid_card':
        return 'Los datos de la tarjeta no son correctos.';
      case 'processing_error':
        return 'Hubo un problema técnico procesando el pago. Tu dinero está seguro.';
      default:
        return error.userMessage;
    }
  };

  const getRecoveryTips = () => {
    const tips: string[] = [];
    
    switch (error.declineReason) {
      case 'insufficient_funds':
        tips.push('Verifica el saldo de tu cuenta bancaria');
        tips.push('Considera usar una tarjeta de crédito en su lugar');
        tips.push('Puedes hacer una transferencia bancaria que tarda 24-48hs');
        break;
      case 'card_declined':
        tips.push('Contacta a tu banco para verificar límites');
        tips.push('Intenta con otra tarjeta si tienes');
        tips.push('Usa MercadoPago como alternativa segura');
        break;
      case 'expired_card':
        tips.push('Actualiza los datos de tu tarjeta');
        tips.push('Usa otra tarjeta válida');
        tips.push('Considera transferencia bancaria');
        break;
      case 'invalid_card':
        tips.push('Verifica el número de tarjeta');
        tips.push('Revisa la fecha de vencimiento');
        tips.push('Confirma el código de seguridad');
        break;
      default:
        tips.push('Intenta de nuevo en unos minutos');
        tips.push('Verifica tu conexión a internet');
        tips.push('Prueba con otro método de pago');
    }
    
    return tips;
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-medium rounded-xl p-8 border border-red-500/30 bg-red-500/20">
        {/* Error Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mb-4"
          >
            {getPaymentErrorIcon()}
          </motion.div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            {getErrorTitle()}
          </h3>
          
          <p className="text-white/80 text-lg leading-relaxed max-w-lg mx-auto">
            {getErrorDescription()}
          </p>
        </div>

        {/* Transaction Details */}
        {showTransactionDetails && transactionInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <h4 className="text-white font-medium mb-3 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Detalles de la Transacción
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Monto:</span>
                <p className="text-white font-medium">
                  {formatAmount(transactionInfo.amount, transactionInfo.currency)}
                </p>
              </div>
              
              <div>
                <span className="text-white/60">Estado:</span>
                <p className="text-red-400 font-medium flex items-center">
                  <XCircle className="h-4 w-4 mr-1" />
                  Falló
                </p>
              </div>
              
              <div>
                <span className="text-white/60">ID de Transacción:</span>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-mono text-xs">
                    {transactionInfo.id}
                  </p>
                  <Button
                    onClick={copyTransactionId}
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                  >
                    {copiedTransactionId ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div>
                <span className="text-white/60">Hora:</span>
                <p className="text-white text-xs">
                  {new Date(transactionInfo.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {error.mercadopagoErrorCode && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className="text-white/60 text-xs">Código MercadoPago:</span>
                <p className="text-orange-400 font-mono text-xs">
                  {error.mercadopagoErrorCode}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Recovery Tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
        >
          <h4 className="text-blue-400 font-medium mb-3 text-sm">
            Posibles Soluciones:
          </h4>
          <ul className="space-y-2">
            {getRecoveryTips().map((tip, index) => (
              <li key={index} className="text-white/70 text-sm flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-400 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Primary Actions */}
        <div className="space-y-3 mb-6">
          {error.canRetryPayment && onRetryPayment && (
            <Button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium h-12"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reintentando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar Mismo Método
                </>
              )}
            </Button>
          )}
        </div>

        {/* Alternative Payment Methods */}
        {enableAlternativeMethods && error.alternativeMethods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <h4 className="text-white font-medium mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Métodos de Pago Alternativos
            </h4>
            
            <div className="space-y-3">
              {paymentMethods
                .filter(method => error.alternativeMethods.includes(method.id) || method.available)
                .map((method) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedMethod === method.id
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => handleSelectMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {method.icon}
                        <div>
                          <h5 className="text-white font-medium">{method.name}</h5>
                          <p className="text-white/60 text-sm">{method.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white/80 text-xs">{method.processingTime}</p>
                        {method.fees && (
                          <p className="text-white/60 text-xs">{method.fees}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Method Details */}
                    <AnimatePresence>
                      {selectedMethod === method.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-white/10"
                        >
                          {method.requirements && (
                            <div>
                              <p className="text-white/80 text-sm font-medium mb-1">
                                Requisitos:
                              </p>
                              <ul className="space-y-1">
                                {method.requirements.map((req, index) => (
                                  <li key={index} className="text-white/60 text-xs flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <Button
                            onClick={() => handleSelectMethod(method.id)}
                            className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Usar {method.name}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Support and Cancel Actions */}
        <div className="flex space-x-3">
          {onContactSupport && (
            <Button
              onClick={onContactSupport}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Ayuda
            </Button>
          )}
          
          {onCancelPayment && (
            <Button
              onClick={onCancelPayment}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-center space-x-2 text-white/60 text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>Tu dinero está seguro. Ningún cargo fue realizado.</span>
          </div>
          <p className="text-center text-white/40 text-xs mt-1">
            Error ID: {error.id.substr(-8)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};