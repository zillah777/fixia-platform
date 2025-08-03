import { MoreHorizontal, Eye, MessageSquare, Calendar, Clock, Star, DollarSign } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// Services will be fetched from API - no mock data for production

const getStatusColor = (status: string) => {
  switch (status) {
    case "En Progreso":
      return "bg-blue-500/20 text-blue-400 border-0";
    case "Esperando Revisión":
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

export function FixiaServicesTable() {
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
            <Clock className="h-5 w-5 text-primary" />
            <span>Servicios Activos</span>
          </CardTitle>
          <CardDescription>
            Gestiona tus proyectos actuales y comunicación con clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.6 }}
                      className="space-y-4"
                    >
                      <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Sin servicios activos</h3>
                      <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                        Cuando tengas servicios activos, aparecerán aquí. Comienza creando tu primer servicio.
                      </p>
                      <Link href="/as/servicios">
                        <Button className="liquid-gradient hover:opacity-90 transition-all duration-300">
                          Crear Mi Primer Servicio
                        </Button>
                      </Link>
                    </motion.div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="text-sm text-muted-foreground">
              Tus servicios activos aparecerán aquí
            </div>
            <Link href="/as/servicios">
              <Button className="glass border-white/20 hover:glass-medium">
                Gestionar Servicios
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}