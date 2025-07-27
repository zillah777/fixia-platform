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

const mockServices = [
  {
    id: "FX001",
    title: "Desarrollo de E-commerce completo",
    client: {
      name: "María González",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=32&h=32&fit=crop&crop=face",
      initials: "MG",
      rating: 4.8
    },
    status: "En Progreso",
    priority: "Alta",
    category: "Desarrollo Web",
    deadline: "2025-02-15",
    budget: "$3,500",
    progress: 75,
    messages: 3,
    deliveries: "2/4"
  },
  {
    id: "FX002", 
    title: "Diseño de identidad corporativa",
    client: {
      name: "Carlos Ruiz",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      initials: "CR",
      rating: 5.0
    },
    status: "Esperando Revisión",
    priority: "Media",
    category: "Diseño Gráfico",
    deadline: "2025-01-30",
    budget: "$1,200",
    progress: 90,
    messages: 1,
    deliveries: "3/3"
  },
  {
    id: "FX003",
    title: "Consultoría en Marketing Digital",
    client: {
      name: "Ana Torres",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
      initials: "AT",
      rating: 4.9
    },
    status: "Completado",
    priority: "Baja",
    category: "Marketing",
    deadline: "2025-01-20",
    budget: "$800",
    progress: 100,
    messages: 0,
    deliveries: "2/2"
  }
];

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
                {mockServices.map((service, index) => (
                  <motion.tr
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.6 + (index * 0.1) }}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{service.title}</div>
                        <div className="text-xs text-muted-foreground">{service.category}</div>
                        <div className="text-xs text-muted-foreground">ID: {service.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={service.client.avatar} alt={service.client.name} />
                          <AvatarFallback className="text-xs">{service.client.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{service.client.name}</div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-muted-foreground">{service.client.rating}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(service.priority)}>
                        {service.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{service.deadline}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="font-medium">{service.budget}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{service.progress}%</span>
                          <span className="text-muted-foreground">{service.deliveries}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${service.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {service.messages > 0 && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:glass-medium">
                            <MessageSquare className="h-4 w-4" />
                            <span className="sr-only">Mensajes</span>
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:glass-medium">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass border-white/20">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem className="hover:glass-medium">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:glass-medium">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Contactar cliente
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="hover:glass-medium">
                              Marcar como completado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="text-sm text-muted-foreground">
              Mostrando 3 de 8 servicios activos
            </div>
            <Link href={user?.user_type === 'provider' ? '/as/servicios' : '/explorador/mis-solicitudes'}>
              <Button variant="outline" className="glass border-white/20 hover:glass-medium">
                Ver todos los servicios
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}