import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, Users, Briefcase, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { PromotionBanner } from '@/components/PromotionBanner';

const Registro: NextPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'customer' as 'customer' | 'provider'
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPromotionEligible, setIsPromotionEligible] = useState(false);
  const { register, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const type = router.query['type'];
    const promo = router.query['promo'];
    
    if (type === 'provider' || type === 'customer') {
      setFormData(prev => ({ ...prev, user_type: type as 'provider' | 'customer' }));
    }
    
    // Check if user is eligible for the 200 primeras cuentas promotion
    if (promo === '200-primeras') {
      setIsPromotionEligible(true);
    }
  }, [router.query['type'], router.query['promo']]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.user_type === 'provider') {
        router.push('/as/dashboard');
      } else {
        router.push('/explorador/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones para poder crear tu cuenta.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las dos contraseñas no son iguales. Por favor, escribe la misma contraseña en ambos campos.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Tu contraseña es muy corta. Debe tener al menos 6 letras o números.');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
    } catch (err: any) {
      setError('Hubo un problema al crear tu cuenta. ¿Puedes intentar de nuevo? Si el problema continúa, contáctanos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Registro | Fixia</title>
        <meta name="description" content="Crea tu cuenta en Fixia" />
      </Head>

      <div className="min-h-screen flex items-center justify-center p-6">
        {/* Background */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative w-full max-w-lg z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="h-12 w-12 liquid-gradient rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div className="absolute -inset-1 liquid-gradient rounded-2xl blur opacity-30"></div>
              </div>
              <div className="text-left">
                <div className="text-xl font-semibold">Fixia</div>
                <div className="text-xs text-muted-foreground">Conecta. Confía. Resuelve.</div>
              </div>
            </Link>
          </motion.div>

          {/* Promotion Banner */}
          {isPromotionEligible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <div className="glass-strong border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-amber-500/20 rounded-xl">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      ¡Felicitaciones! Tienes acceso a la promoción
                    </h3>
                    <p className="text-sm text-white/80 mb-1">
                      Plan Profesional GRATIS por 2 meses • Valor: $8,000 ARS
                    </p>
                    <p className="text-xs text-amber-300">
                      ✓ Se aplicará automáticamente al completar tu registro
                    </p>
                  </div>
                  <Gift className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: isPromotionEligible ? 0.2 : 0.1 }}
          >
            <Card className="glass border-white/10 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                <CardDescription>
                  {isPromotionEligible ? (
                    <span className="text-amber-300">
                      🎉 Registrándote con promoción • 2 meses gratis incluidos
                    </span>
                  ) : (
                    `Únete a ${formData.user_type === 'provider' ? 'profesionales' : 'clientes'} en Fixia`
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <div className="mb-6 p-4 glass-medium border-red-500/20 rounded-lg">
                    <span className="text-red-400 text-sm">⚠ {error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Account Type Selection */}
                  <div className="space-y-3">
                    <Label>Tipo de cuenta</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <label className="flex items-center space-x-3 p-4 glass border-white/20 rounded-lg cursor-pointer hover:glass-medium transition-all">
                        <input
                          type="radio"
                          value="customer"
                          checked={formData.user_type === 'customer'}
                          onChange={(e) => setFormData(prev => ({ ...prev, user_type: e.target.value as 'customer' | 'provider' }))}
                          className="w-4 h-4 text-primary"
                        />
                        <Users className="h-5 w-5 text-blue-400" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Cliente</div>
                          <div className="text-white/60 text-sm">Necesito contratar trabajos (plomería, electricidad, limpieza, etc.)</div>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 glass border-white/20 rounded-lg cursor-pointer hover:glass-medium transition-all">
                        <input
                          type="radio"
                          value="provider"
                          checked={formData.user_type === 'provider'}
                          onChange={(e) => setFormData(prev => ({ ...prev, user_type: e.target.value as 'customer' | 'provider' }))}
                          className="w-4 h-4 text-primary"
                        />
                        <Briefcase className="h-5 w-5 text-green-400" />
                        <div className="flex-1">
                          <div className="text-white font-medium">Profesional</div>
                          <div className="text-white/60 text-sm">Tengo un oficio y quiero conseguir clientes (plomero, electricista, etc.)</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Tu nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="first_name"
                          type="text"
                          placeholder="Escribe tu nombre aquí"
                          value={formData.first_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                          className="pl-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Tu apellido</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="last_name"
                          type="text"
                          placeholder="Escribe tu apellido aquí"
                          value={formData.last_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                          className="pl-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Tu email (donde te enviaremos mensajes)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@gmail.com (por ejemplo)"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Crea una contraseña (mínimo 6 caracteres)</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Elige una contraseña fácil de recordar"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Repite tu contraseña (para estar seguros)</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Escribe la misma contraseña otra vez"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 pr-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Terms and Conditions Acceptance */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 glass border-white/20 rounded-lg">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-4 h-4 text-primary bg-transparent border-white/30 rounded focus:ring-primary/30 focus:ring-2 focus:border-primary/50 mt-0.5"
                        required
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                        <span className="text-white/90">
                          Al crear tu cuenta, aceptas nuestros{" "}
                          <Link 
                            href="/legal/terms" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline transition-colors"
                          >
                            Términos y Condiciones
                          </Link>
                          {" "}y{" "}
                          <Link 
                            href="/legal/privacy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline transition-colors"
                          >
                            Política de Privacidad
                          </Link>
                          . Estos documentos explican cómo funciona Fixia y cómo protegemos tu información.
                        </span>
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className={`w-full transition-all duration-300 shadow-lg ${
                      isPromotionEligible 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                        : 'liquid-gradient hover:opacity-90'
                    } ${!acceptedTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading || !acceptedTerms}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isPromotionEligible ? 'Aplicando tu promoción...' : 'Creando tu cuenta...'}
                      </>
                    ) : (
                      <>
                        {isPromotionEligible && <Gift className="mr-2 h-4 w-4" />}
                        {isPromotionEligible ? '¡Crear mi Cuenta GRATIS con Promoción!' : '¡Crear mi Cuenta GRATIS!'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-6"
          >
            <p className="text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-4"
          >
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Registro;