import { MoreHorizontal, Eye, MessageSquare, Calendar, Clock, Star, DollarSign, User, Search, Users } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// Real requests will be fetched from API
const mockRequests: any[] = [];

const getStatusColor = (status: string) => {
  switch (status) {
    case "En Progreso":
      return "bg-blue-500/20 text-blue-400 border-0";
    case "Esperando Propuesta":
      return "bg-yellow-500/20 text-yellow-400 border-0";
    case "Completado":
      return "bg-green-500/20 text-green-400 border-0";
    default:
      return "bg-gray-500/20 text-gray-400 border-0";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Alta":
      return "bg-red-500/20 text-red-400 border-0";
    case "Media":
      return "bg-yellow-500/20 text-yellow-400 border-0";
    case "Baja":
      return "bg-green-500/20 text-green-400 border-0";
    default:
      return "bg-gray-500/20 text-gray-400 border-0";
  }
};

export function ExplorerRequestsTable() {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.5 }}
    >
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Mis Solicitudes</span>
          </CardTitle>
          <CardDescription>
            Gestiona tus proyectos y comunicación con profesionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No tienes solicitudes aún</h3>
              <p className="text-muted-foreground text-base mb-6 max-w-md mx-auto">
                Crea tu primera solicitud de servicio para conectar con profesionales verificados.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/explorador/buscar-servicio">
                  <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Servicios
                  </Button>
                </Link>
                <Link href="/explorador/navegar-profesionales">
                  <Button className="glass border-white/20 hover:glass-medium transition-all duration-300">
                    <Users className="mr-2 h-4 w-4" />
                    Ver Profesionales
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Profesional</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Real requests will be populated from API */}
                </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="text-sm text-muted-foreground">
                  {mockRequests.length === 0 ? "Sin solicitudes activas" : `Mostrando ${mockRequests.length} solicitudes`}
                </div>
                <Link href="/explorador/mis-solicitudes">
                  <Button className="glass border-white/20 hover:glass-medium">
                    Ver todas las solicitudes
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}