import { useState, useEffect } from "react";
import { Search, Clock, MessageSquare, Heart, CheckCircle, Calendar, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface ExplorerStats {
  activeBookings: number;
  completedBookings: number;
  totalSpent: number;
  favoriteServices: number;
  unreadMessages: number;
}

export function ExplorerSummaryCards() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ExplorerStats>({
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    favoriteServices: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplorerStats = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/dashboard/explorer-stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.stats) {
            setStats(data.data.stats);
          }
        } else {
          console.error('Error fetching explorer stats:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching explorer stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplorerStats();
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Panel de Control</h2>
          <p className="text-muted-foreground text-sm">
            Gestiona tus proyectos y conecta con los mejores profesionales
          </p>
        </div>
        <Badge className="glass border-white/20">
          Últimos 30 días
        </Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Búsquedas y Solicitudes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span>Solicitudes Activas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {loading ? "..." : stats.activeBookings}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">En proceso</span>
                  <span className="font-medium">{loading ? "..." : Math.floor(stats.activeBookings * 0.6)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Esperando propuestas</span>
                  <span className="font-medium">{loading ? "..." : Math.ceil(stats.activeBookings * 0.4)}</span>
                </div>
                <Progress 
                  value={stats.activeBookings > 0 ? Math.min((stats.activeBookings / 10) * 100, 100) : 0} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  {loading ? "Cargando..." : `${stats.activeBookings} solicitudes activas`}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Proyectos Completados */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400 group-hover:animate-pulse transition-all duration-300" />
                <span>Proyectos Completados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {loading ? "..." : stats.completedBookings}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Este mes</span>
                  <Badge className="bg-green-500/20 text-green-400 text-xs border-0">
                    {loading ? "..." : `+${Math.max(1, Math.floor(stats.completedBookings * 0.2))}`}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Satisfacción promedio</span>
                  <span className="font-medium text-green-400">
                    {loading ? "..." : stats.completedBookings > 0 ? "4.8★" : "N/A"}
                  </span>
                </div>
                <Progress 
                  value={stats.completedBookings > 0 ? Math.min((stats.completedBookings / 50) * 100, 100) : 0} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  {loading ? "Cargando..." : `${stats.completedBookings > 0 ? Math.floor((stats.completedBookings / (stats.completedBookings + stats.activeBookings + 1)) * 100) : 0}% de proyectos exitosos`}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Presupuesto del Mes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.1 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span>Presupuesto del Mes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {loading ? "..." : `$${stats.totalSpent.toLocaleString()}`}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total gastado</span>
                  <span className="text-blue-400 font-medium">
                    {loading ? "..." : `$${stats.totalSpent.toLocaleString()}`}
                  </span>
                </div>
                <Progress 
                  value={stats.totalSpent > 0 ? Math.min((stats.totalSpent / 10000) * 100, 100) : 0} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  {loading ? "Cargando..." : `Promedio: $${stats.completedBookings > 0 ? Math.floor(stats.totalSpent / stats.completedBookings).toLocaleString() : 0} por proyecto`}
                </p>
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
                <span>Conversaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {loading ? "..." : stats.unreadMessages}
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mensajes sin leer</span>
                    <Badge className={`text-xs ${stats.unreadMessages > 0 ? 'bg-red-500 text-white' : 'bg-gray-500/20 text-gray-400'}`}>
                      {loading ? "..." : stats.unreadMessages}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chats activos</span>
                    <Badge className="bg-primary/20 text-primary text-xs border-0">
                      {loading ? "..." : Math.max(stats.activeBookings, 1)}
                    </Badge>
                  </div>
                </div>
                <Link href="/explorador/chats">
                  <Button className="w-full glass-medium hover:glass-strong transition-all duration-300 h-9 px-3">
                    Ver Mensajes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profesionales Favoritos */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.3 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-400 group-hover:animate-pulse transition-all duration-300" />
                <span>Solicitudes de Servicio</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {loading ? "..." : stats.favoriteServices}
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Solicitudes enviadas</span>
                    <Badge className="bg-green-500/20 text-green-400 text-xs border-0">
                      {loading ? "..." : stats.favoriteServices}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Activos</span>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs border-0">
                      {loading ? "..." : Math.floor(stats.favoriteServices * 0.7)}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Cargando..." : `${stats.favoriteServices} solicitudes de servicio enviadas`}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Próximas Reuniones */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        >
          <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
                <span>Próximas Reuniones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">3</div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Esta semana</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs border-0">2</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Próxima semana</span>
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs border-0">1</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reunión importante mañana 2:00 PM
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}