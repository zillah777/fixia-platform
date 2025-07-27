import { Calendar, Clock, Star, TrendingUp, Users, MessageSquare, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function FixiaSummaryCards() {
  const { user } = useAuth();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resumen de Actividad</h2>
          <p className="text-muted-foreground text-sm">
            Transparencia líquida: ves todo lo que necesitas saber
          </p>
        </div>
        <Badge variant="outline" className="glass border-white/20">
          Últimos 30 días
        </Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Servicios Activos */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary group-hover:animate-spin transition-all duration-300" />
                <span>Servicios Activos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">8</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">En progreso</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pendientes inicio</span>
                  <span className="font-medium">3</span>
                </div>
                <Progress value={62} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  2 entregas esta semana
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rating y Reseñas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
                <span>Reputación</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 flex items-center space-x-2">
                <span>4.9</span>
                <div className="flex text-yellow-400">
                  ★★★★★
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">127 reseñas totales</span>
                  <Badge className="bg-green-500/20 text-green-400 text-xs border-0">+12 nuevas</Badge>
                </div>
                <Progress value={98} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  98% de satisfacción del cliente
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ingresos del Mes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.1 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                <span>Ingresos del Mes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$8,940</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Meta: $10,000</span>
                  <span className="text-green-400 font-medium">89%</span>
                </div>
                <Progress value={89} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  $1,060 para alcanzar la meta
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mensajes Pendientes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-primary group-hover:animate-bounce transition-all duration-300" />
                <span>Mensajes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">12</div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sin leer</span>
                    <Badge variant="destructive" className="text-xs">7</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Consultas nuevas</span>
                    <Badge className="bg-primary/20 text-primary text-xs border-0">5</Badge>
                  </div>
                </div>
                <Link href={user?.user_type === 'provider' ? '/as/chats' : '/explorador/chats'}>
                  <Button size="sm" className="w-full glass-medium hover:glass-strong transition-all duration-300">
                    Revisar Mensajes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Próximas Entregas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.3 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
                <span>Próximas Entregas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">4</div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Esta semana</span>
                    <Badge variant="destructive" className="text-xs">2</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Próxima semana</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs border-0">2</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  1 entrega crítica mañana
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Nivel de Confianza */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400 group-hover:animate-pulse transition-all duration-300" />
                <span>Nivel de Confianza</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 flex items-center space-x-2">
                <span>95%</span>
                <Badge className="bg-green-500/20 text-green-400 text-xs border-0">Verificado</Badge>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Identidad verificada</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Métodos de pago</span>
                    <span className="text-green-400">✓</span>
                  </div>
                </div>
                <Progress value={95} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Profesional de élite verificado
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}