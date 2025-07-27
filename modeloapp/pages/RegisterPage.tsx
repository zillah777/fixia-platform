import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, Briefcase, UserCheck, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner@2.0.3";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("type") || "client");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);
    
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: activeTab as 'professional' | 'client'
      });
      
      if (success) {
        toast.success("¡Cuenta creada exitosamente!");
        toast.success("Revisa tu email para verificar tu cuenta");
        navigate("/dashboard");
      } else {
        toast.error("Error al crear la cuenta");
      }
    } catch (error) {
      toast.error("Algo salió mal. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
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

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="glass border-white/10 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
              <CardDescription>
                Únete a la comunidad de Fixia y conecta con profesionales de primer nivel.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-2 glass">
                  <TabsTrigger value="client" className="data-[state=active]:bg-primary/20">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Cliente
                  </TabsTrigger>
                  <TabsTrigger value="professional" className="data-[state=active]:bg-primary/20">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Profesional
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="client" className="mt-4">
                  <div className="glass-medium rounded-lg p-4 space-y-2">
                    <h4 className="font-medium flex items-center">
                      <UserCheck className="mr-2 h-4 w-4 text-primary" />
                      Cuenta de Cliente
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center"><Check className="mr-2 h-3 w-3 text-success" />Busca y contrata profesionales</li>
                      <li className="flex items-center"><Check className="mr-2 h-3 w-3 text-success" />Pagos seguros y protegidos</li>
                      <li className="flex items-center"><Check className="mr-2 h-3 w-3 text-success" />Soporte dedicado 24/7</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="professional" className="mt-4">
                  <div className="glass-medium rounded-lg p-4 space-y-2">
                    <h4 className="font-medium flex items-center">
                      <Briefcase className="mr-2 h-4 w-4 text-primary" />
                      Cuenta Profesional
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center"><Check className="mr-2 h-3 w-3 text-success" />Ofrece tus servicios</li>
                      <li className="flex items-center"><Check className="mr-2 h-3 w-3 text-success" />Gestiona tus proyectos</li>
                      <li className="flex items-center"><Check className="mr-2 h-3 w-3 text-success" />Comisión competitiva del 10%</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
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
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 glass border-white/20 focus:border-primary/50 focus:ring-primary/30"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
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

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                      Acepto los{" "}
                      <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                        términos y condiciones
                      </Link>{" "}
                      y la{" "}
                      <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                        política de privacidad
                      </Link>
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={acceptMarketing}
                      onCheckedChange={(checked) => setAcceptMarketing(checked as boolean)}
                    />
                    <Label htmlFor="marketing" className="text-sm text-muted-foreground">
                      Quiero recibir ofertas y novedades por email (opcional)
                    </Label>
                  </div>
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
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear Cuenta
                      {activeTab === "professional" && (
                        <Badge className="ml-2 bg-white/20 text-white text-xs">
                          Gratis
                        </Badge>
                      )}
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
            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
              Iniciar sesión
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