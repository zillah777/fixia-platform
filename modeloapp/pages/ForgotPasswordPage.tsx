import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, ArrowLeft, Loader2, Check, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner@2.0.3";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmailSent(true);
      toast.success("Correo de recuperación enviado");
    } catch (error) {
      toast.error("Error al enviar el correo. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Correo reenviado");
    } catch (error) {
      toast.error("Error al reenviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
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

        {/* Forgot Password Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="glass border-white/10 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {emailSent ? "Revisa tu correo" : "Recuperar contraseña"}
              </CardTitle>
              <CardDescription>
                {emailSent 
                  ? "Te hemos enviado un enlace para restablecer tu contraseña"
                  : "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!emailSent ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Introduce el correo asociado a tu cuenta de Fixia
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar enlace de recuperación
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Success Message */}
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 liquid-gradient rounded-full flex items-center justify-center">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium">Correo enviado a:</p>
                      <p className="text-primary font-mono bg-primary/10 px-3 py-2 rounded-lg">
                        {email}
                      </p>
                    </div>
                    
                    <div className="glass-medium rounded-lg p-4 space-y-2">
                      <h4 className="font-medium text-sm">Próximos pasos:</h4>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Revisa tu bandeja de entrada y spam</li>
                        <li>Haz clic en el enlace del correo</li>
                        <li>Crea una nueva contraseña segura</li>
                        <li>Inicia sesión con tu nueva contraseña</li>
                      </ol>
                    </div>
                  </div>

                  {/* Resend Button */}
                  <Button
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full glass border-white/20 hover:glass-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reenviando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reenviar correo
                      </>
                    )}
                  </Button>

                  {/* Login Redirect */}
                  <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-sm text-muted-foreground mb-3">
                      ¿Ya tienes acceso a tu cuenta?
                    </p>
                    <Link to="/login">
                      <Button className="liquid-gradient hover:opacity-90 transition-all duration-300">
                        Iniciar Sesión
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-6 space-y-4"
        >
          {!emailSent && (
            <p className="text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Iniciar sesión
              </Link>
            </p>
          )}
          
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    </div>
  );
}