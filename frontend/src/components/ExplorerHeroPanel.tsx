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
          <div className="flex-1 max-w-none lg:max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent leading-tight flex items-center gap-3">
              ¡Hola {userName}!
              <Search className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-400/80" />
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-2">
              Conecta con profesionales verificados. Encuentra la solución perfecta para tu proyecto.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 sm:gap-3 lg:gap-2 xl:gap-3 w-full sm:w-auto lg:w-full xl:w-auto lg:max-w-xs xl:max-w-none">
            <Link href="/explorador/marketplace" className="flex-1 sm:flex-initial">
              <Button size="default" className="w-full liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                <Search className="mr-2 h-4 w-4" />
                Encontrar Profesional
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Solicitudes Activas",
            value: "0",
            change: "Crea tu primera solicitud",
            icon: Clock,
            color: "text-blue-400",
            delay: 0.1
          },
          {
            title: "Servicios Completados",
            value: "0",
            change: "Ningún servicio completado aún", 
            icon: CheckCircle,
            color: "text-green-400",
            delay: 0.2
          },
          {
            title: "Profesionales Conectados",
            value: "0",
            change: "Conecta con profesionales",
            icon: Star,
            color: "text-yellow-400",
            delay: 0.3
          },
          {
            title: "Proyectos Iniciados",
            value: "0",
            change: "¡Comienza tu primer proyecto!",
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
                <Clock className="h-5 w-5 text-primary" />
                <span>Actividad Reciente</span>
              </CardTitle>
              <CardDescription>
                Tus últimas interacciones con profesionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Sin actividad reciente</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Tu actividad con profesionales aparecerá aquí
                </p>
                <Link href="/explorador/marketplace">
                  <Button size="default" className="liquid-gradient hover:opacity-90 transition-all duration-300">
                    <Search className="mr-2 h-4 w-4" />
                    Encontrar Profesional
                  </Button>
                </Link>
              </div>
              {/* Commented out mock data */}
              {/* {[].map((activity, index) => (
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
              ))} */}
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
                <Target className="h-5 w-5 text-green-400" />
                <span>Recomendaciones</span>
              </CardTitle>
              <CardDescription>
                Profesionales perfectos para ti
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Sin recomendaciones aún</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Explora profesionales y recibirás recomendaciones personalizadas
                </p>
                <Link href="/explorador/marketplace">
                  <Button size="default" className="glass-medium hover:glass-strong transition-all duration-300 border border-white/20">
                    <Users className="mr-2 h-4 w-4" />
                    Ver Profesionales
                  </Button>
                </Link>
              </div>
              {/* Commented out mock data */}
              {/* {[].map((professional, index) => (
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
              ))} */}
              
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}