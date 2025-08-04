import { Calendar, Clock, Star, TrendingUp, Users, MessageSquare, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useASDashboardData } from "@/hooks/useDashboardData";

export function FixiaSummaryCards() {
  const { user } = useAuth();
  const { stats, loading, error } = useASDashboardData();

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
        <Badge className="glass border-white/20">
          Últimos 30 días
        </Badge>
      </div>
      
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="text-3xl font-bold mb-2">
                {loading ? "..." : (stats?.active_services || 0)}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total servicios</span>
                  <span className="font-medium">
                    {loading ? "..." : (stats?.total_services || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Solicitudes pendientes</span>
                  <span className="font-medium">
                    {loading ? "..." : (stats?.pending_requests || 0)}
                  </span>
                </div>
                <Progress 
                  value={stats && stats.total_services > 0 ? (stats.active_services / stats.total_services) * 100 : 0} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  {loading ? "Cargando..." : stats?.active_services === 0 ? "Crea tu primer servicio" : `${stats?.active_services} servicios activos`}
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
                <span>{loading ? "..." : (stats?.average_rating || 0).toFixed(1)}</span>
                <div className="flex text-yellow-400">
                  {stats && stats.average_rating > 0 ? "★★★★★" : "☆☆☆☆☆"}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {loading ? "..." : `${stats?.total_reviews || 0} reseñas totales`}
                  </span>
                  {stats && stats.total_reviews > 0 ? (
                    <Badge className="bg-green-500/20 text-green-400 text-xs border-0">Verificado</Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-400 text-xs border-0">Sin reseñas</Badge>
                  )}
                </div>
                <Progress 
                  value={stats && stats.average_rating > 0 ? (stats.average_rating / 5) * 100 : 0} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  {loading ? "Cargando..." : 
                   stats?.total_reviews === 0 ? "Completa servicios para recibir reseñas" :
                   `${Math.round((stats?.average_rating || 0) / 5 * 100)}% de satisfacción del cliente`}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ingresos Totales */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.1 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                <span>Ingresos Reales</span>
              </CardTitle>
              {stats && stats.total_earnings > 0 && (
                <Badge className="bg-green-500/20 text-green-400 text-xs border-0">
                  {stats.completed_bookings > 10 ? "Top Performer" : "En Crecimiento"}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 flex items-center space-x-2">
                <span>
                  {loading ? "..." : `$${(stats?.total_earnings || 0).toLocaleString('es-AR')} ARS`}
                </span>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Servicios completados</span>
                    <span className="text-green-400 font-medium">
                      {loading ? "..." : (stats?.completed_bookings || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Comisión plataforma</span>
                    <span className="text-green-400 font-medium">
                      {loading ? "..." : "0%"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ingresos netos este mes</span>
                    <span className="text-green-400 font-medium">
                      {loading ? "..." : 
                       stats?.monthly_net_earnings ? `$${stats.monthly_net_earnings.toLocaleString('es-AR')} ARS` : 
                       "$0 ARS"}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={stats && stats.total_earnings > 0 ? Math.min((stats.total_earnings / 50000) * 100, 100) : 0} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  {loading ? "Cargando..." : 
                   stats?.total_earnings === 0 ? "Completa tu primer servicio para generar ingresos" :
                   stats && stats.completed_bookings > 0 ? `Promedio: $${Math.round(stats.total_earnings / stats.completed_bookings).toLocaleString('es-AR')} ARS por servicio` : 
                   "Conecta con clientes para generar ingresos"}
                </p>
                {stats && stats.total_earnings === 0 && (
                  <div className="mt-3 p-2 bg-blue-500/10 rounded-lg">
                    <p className="text-xs text-blue-400">
                      🎆 Sin comisiones: El 100% de tus ingresos son para ti
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mensajes y Comunicación */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-primary group-hover:animate-bounce transition-all duration-300" />
                <span>Comunicación</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {loading ? "..." : "0"}
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mensajes sin leer</span>
                    <Badge className="text-xs bg-gray-500/20 text-gray-400 border-0">0</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chats activos</span>
                    <Badge className="bg-gray-500/20 text-gray-400 text-xs border-0">0</Badge>
                  </div>
                </div>
                <Link href={user?.user_type === 'provider' ? '/as/chats' : '/explorador/chats'}>
                  <Button className="w-full glass-medium hover:glass-strong transition-all duration-300 h-9 px-3">
                    Ver Mensajes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progreso del Perfil */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.3 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                <span>Perfil</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {loading ? "..." : `${stats?.profile_completion || 0}%`}
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completado</span>
                    <Badge className={`text-xs border-0 ${(stats?.profile_completion || 0) >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {loading ? "..." : (stats?.profile_completion || 0) >= 80 ? "Completo" : "En progreso"}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={stats?.profile_completion || 0} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  {loading ? "Cargando..." : 
                   (stats?.profile_completion || 0) < 80 ? "Completa tu perfil para más oportunidades" :
                   "Perfil completado correctamente"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Centro de Confianza */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-400 group-hover:animate-pulse transition-all duration-300" />
                <span>Confianza</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 flex items-center space-x-2">
                <span>{loading ? "..." : (stats?.total_reviews || 0) > 0 ? "85%" : "0%"}</span>
                <Badge className={`text-xs border-0 ${(stats?.total_reviews || 0) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {loading ? "..." : (stats?.total_reviews || 0) > 0 ? "Activo" : "Nuevo"}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nivel de confianza</span>
                    <span className={`${(stats?.total_reviews || 0) > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {loading ? "..." : (stats?.total_reviews || 0) > 0 ? "●" : "○"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Perfil completo</span>
                    <span className={`${(stats?.profile_completion || 0) >= 80 ? 'text-green-400' : 'text-gray-400'}`}>
                      {loading ? "..." : (stats?.profile_completion || 0) >= 80 ? "●" : "○"}
                    </span>
                  </div>
                </div>
                <Progress value={(stats?.total_reviews || 0) > 0 ? 85 : 0} className="h-2" />
                <Link href="/as/centro-confianza" className="block">
                  <Button className="w-full text-xs glass-medium hover:glass-strong transition-all duration-300 h-8">
                    Ver Centro de Confianza
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}