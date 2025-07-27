import { Search, Clock, MessageSquare, Heart, CheckCircle, Calendar, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function ExplorerSummaryCards() {
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
          <h2 className="text-2xl font-bold">Panel de Control</h2>
          <p className="text-muted-foreground text-sm">
            Gestiona tus proyectos y conecta con los mejores profesionales
          </p>
        </div>
        <Badge variant="outline" className="glass border-white/20">
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
              <div className="text-3xl font-bold mb-2">7</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">En proceso</span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Esperando propuestas</span>
                  <span className="font-medium">3</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  2 propuestas nuevas hoy
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
              <div className="text-3xl font-bold mb-2">23</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Este mes</span>
                  <Badge className="bg-green-500/20 text-green-400 text-xs border-0">+3</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Satisfacción promedio</span>
                  <span className="font-medium text-green-400">4.8★</span>
                </div>
                <Progress value={92} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  92% de proyectos exitosos
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
              <div className="text-3xl font-bold mb-2">$6,500</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gastado: $4,200</span>
                  <span className="text-blue-400 font-medium">65%</span>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  $2,300 disponibles este mes
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
              <div className="text-3xl font-bold mb-2">8</div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mensajes sin leer</span>
                    <Badge variant="destructive" className="text-xs">3</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chats activos</span>
                    <Badge className="bg-primary/20 text-primary text-xs border-0">5</Badge>
                  </div>
                </div>
                <Link href="/explorador/chats">
                  <Button size="sm" className="w-full glass-medium hover:glass-strong transition-all duration-300">
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
                <span>Profesionales Favoritos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">12</div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disponibles ahora</span>
                    <Badge className="bg-green-500/20 text-green-400 text-xs border-0">8</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nuevos esta semana</span>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs border-0">2</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Promedio 4.9★ de calificación
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