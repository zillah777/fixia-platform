import { Search, Target, MapPin, Star, Users, Clock, CheckCircle, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function ExplorerHeroPanel() {
  const { user } = useAuth();
  
  const userName = user?.first_name || 'Explorador';

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
              ¡Hola {userName}! 🔍
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Conecta con profesionales verificados. Encuentra la solución perfecta para tu proyecto.
            </p>
          </div>
          <Link href="/explorador/buscar-servicio" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg text-sm px-4 py-2">
              <Search className="mr-2 h-4 w-4" />
              Buscar Servicios
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Solicitudes Activas",
            value: "5",
            change: "2 nuevas esta semana",
            icon: Clock,
            color: "text-blue-400",
            delay: 0.1
          },
          {
            title: "Servicios Completados",
            value: "23",
            change: "+3 este mes", 
            icon: CheckCircle,
            color: "text-green-400",
            delay: 0.2
          },
          {
            title: "Profesionales Favoritos",
            value: "12",
            change: "Siempre disponibles",
            icon: Star,
            color: "text-yellow-400",
            delay: 0.3
          },
          {
            title: "Promedio de Respuesta",
            value: "1.2h",
            change: "Respuestas rápidas",
            icon: Zap,
            color: "text-purple-400",
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

      {/* Activity and Discovery */}
      <div className="grid gap-6 md:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="md:col-span-8"
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Actividad Reciente</span>
              </CardTitle>
              <CardDescription>
                Tus últimas interacciones con profesionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  time: "Hace 1 hora",
                  action: "Nueva propuesta recibida",
                  description: "Desarrollo de aplicación móvil - React Native",
                  status: "Pendiente revisión",
                  professional: "Carlos Mendoza",
                  price: "$2,500"
                },
                {
                  time: "Hace 3 horas", 
                  action: "Servicio completado",
                  description: "Diseño de logo y branding corporativo",
                  status: "Completado",
                  professional: "Ana García",
                  price: "$800"
                },
                {
                  time: "Ayer",
                  action: "Nuevo mensaje",
                  description: "Consulta sobre desarrollo web",
                  status: "Respondido",
                  professional: "Luis Torres",
                  price: "Consulta gratuita"
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
                        activity.status === 'Respondido' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      } border-0`}>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{activity.professional}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{activity.price}</div>
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
          className="md:col-span-4"
        >
          <Card className="glass border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-400" />
                <span>Recomendaciones</span>
              </CardTitle>
              <CardDescription>
                Profesionales perfectos para ti
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "María Rodríguez",
                  specialty: "Diseño UX/UI",
                  rating: "4.9",
                  location: "Buenos Aires",
                  badge: "Recomendado",
                  color: "bg-green-500/20 text-green-400"
                },
                {
                  name: "Andrés Silva",
                  specialty: "Desarrollo Full Stack",
                  rating: "4.8",
                  location: "Córdoba",
                  badge: "Popular",
                  color: "bg-blue-500/20 text-blue-400"
                },
                {
                  name: "Carmen López",
                  specialty: "Marketing Digital",
                  rating: "5.0",
                  location: "Rosario",
                  badge: "Top Rated",
                  color: "bg-yellow-500/20 text-yellow-400"
                },
                {
                  name: "Diego Fernández",
                  specialty: "Fotografía Profesional",
                  rating: "4.7",
                  location: "Mendoza",
                  badge: "Nuevo",
                  color: "bg-purple-500/20 text-purple-400"
                }
              ].map((professional, index) => (
                <motion.div
                  key={professional.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + (index * 0.1) }}
                  className="flex items-start space-x-3 p-3 rounded-lg glass-medium hover:glass-strong transition-all duration-300 cursor-pointer"
                >
                  <div className="h-10 w-10 liquid-gradient rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {professional.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{professional.name}</span>
                      <Badge className={`text-xs ${professional.color} border-0`}>
                        {professional.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{professional.specialty}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-muted-foreground">{professional.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{professional.location}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <div className="pt-4 border-t border-white/10">
                <Link href="/explorador/navegar-profesionales">
                  <Button className="w-full glass border-white/20 hover:glass-medium">
                    Ver más profesionales
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}