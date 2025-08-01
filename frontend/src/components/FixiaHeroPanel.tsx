import { TrendingUp, Users, Star, Zap, Target, DollarSign, CheckCircle, Clock, Shield, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export function FixiaHeroPanel() {
  const { user } = useAuth();
  
  const userName = user?.first_name || 'Usuario';

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col space-y-3"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              ¡Hola {userName}! 👋
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Tu tiempo vale. Fixia lo cuida. Aquí está tu resumen de actividad.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Link href="/as/oportunidades" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg text-sm px-3 py-2">
                <Target className="mr-2 h-4 w-4" />
                Ver Oportunidades
              </Button>
            </Link>
            <Link href="/as/centro-confianza" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto glass-medium hover:glass-strong transition-all duration-300 shadow-lg border border-white/20 text-sm px-3 py-2">
                <Shield className="mr-2 h-4 w-4" />
                Centro de Confianza
              </Button>
            </Link>
            <Link href="/as/cambiar-a-explorador" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto glass-light hover:glass-medium transition-all duration-300 shadow-lg border border-white/10 text-white/80 hover:text-white text-sm px-3 py-2">
                <User className="mr-2 h-4 w-4" />
                Cambiar a Explorador
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Servicios Completados",
            value: "127",
            change: "+23% este mes",
            icon: CheckCircle,
            color: "text-green-400",
            delay: 0.1
          },
          {
            title: "Ingresos Totales",
            value: "$33,640",
            change: "+38% este mes", 
            icon: DollarSign,
            color: "text-primary",
            delay: 0.2
          },
          {
            title: "Rating Promedio",
            value: "4.9",
            change: "Excelente reputación",
            icon: Star,
            color: "text-yellow-400",
            delay: 0.3
          },
          {
            title: "Tiempo de Respuesta",
            value: "2.3h",
            change: "30% más rápido",
            icon: Clock,
            color: "text-blue-400",
            delay: 0.4
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: stat.delay }}
          >
            <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 animate-float" 
                  style={{ animationDelay: `${stat.delay}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity and Achievements */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-8"
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Actividad Reciente</span>
              </CardTitle>
              <CardDescription>
                Tus últimas interacciones en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  time: "Hace 2 horas",
                  action: "Servicio completado",
                  description: "Desarrollo de landing page para StartupTech",
                  status: "Completado",
                  amount: "$850"
                },
                {
                  time: "Hace 5 horas", 
                  action: "Nueva solicitud",
                  description: "App móvil para tienda de ropa",
                  status: "En revisión",
                  amount: "$1,200"
                },
                {
                  time: "Ayer",
                  action: "Pago recibido",
                  description: "Sistema de gestión de inventario",
                  status: "Pagado",
                  amount: "$2,100"
                }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
                  className="flex items-center justify-between p-4 rounded-lg glass-medium hover:glass-strong transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{activity.action}</span>
                      <Badge className={`text-xs ${
                        activity.status === 'Completado' ? 'bg-green-500/20 text-green-400' :
                        activity.status === 'Pagado' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      } border-0`}>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{activity.amount}</div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-4"
        >
          <Card className="glass border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span>Logros Recientes</span>
              </CardTitle>
              <CardDescription>
                Tus últimos hitos en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "🎯 Meta Alcanzada",
                  description: "100 servicios completados",
                  badge: "Nuevo",
                  color: "bg-green-500/20 text-green-400"
                },
                {
                  title: "⭐ Súper Profesional",
                  description: "Rating 4.9+ por 3 meses",
                  badge: "Logro",
                  color: "bg-yellow-500/20 text-yellow-400"
                },
                {
                  title: "🚀 Crecimiento Rápido",
                  description: "+200% en ingresos",
                  badge: "Tendencia",
                  color: "bg-primary/20 text-primary"
                },
                {
                  title: "💎 Top Vendedor",
                  description: "En categoría Desarrollo",
                  badge: "Élite",
                  color: "bg-purple-500/20 text-purple-400"
                }
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + (index * 0.1) }}
                  className="flex items-start space-x-3 p-3 rounded-lg glass-medium hover:glass-strong transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{achievement.title}</span>
                      <Badge className={`text-xs ${achievement.color} border-0`}>
                        {achievement.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
              
              <div className="pt-4 border-t border-white/10">
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">Próximo objetivo</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mentor Certificado</span>
                    <span className="text-xs text-muted-foreground">15/20</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-500" 
                         style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}