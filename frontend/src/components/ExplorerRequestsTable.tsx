import { MoreHorizontal, Eye, MessageSquare, Calendar, Clock, Star, DollarSign, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const mockRequests = [
  {
    id: "REQ001",
    title: "Desarrollo de aplicación móvil",
    professional: {
      name: "Carlos Mendoza",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      initials: "CM",
      rating: 4.9,
      specialty: "Desarrollo Mobile"
    },
    status: "En Progreso",
    priority: "Alta",
    category: "Desarrollo",
    deadline: "2025-02-20",
    budget: "$3,200",
    progress: 45,
    messages: 5,
    created: "2025-01-15"
  },
  {
    id: "REQ002", 
    title: "Diseño de branding corporativo",
    professional: {
      name: "Ana García",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=32&h=32&fit=crop&crop=face",
      initials: "AG",
      rating: 5.0,
      specialty: "Diseño Gráfico"
    },
    status: "Completado",
    priority: "Media",
    category: "Diseño",
    deadline: "2025-01-25",
    budget: "$1,500",
    progress: 100,
    messages: 8,
    created: "2025-01-10"
  },
  {
    id: "REQ003",
    title: "Consultoría en marketing digital",
    professional: {
      name: "Luis Torres",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
      initials: "LT",
      rating: 4.8,
      specialty: "Marketing Digital"
    },
    status: "Esperando Propuesta",
    priority: "Baja",
    category: "Marketing",
    deadline: "2025-02-10",
    budget: "$800",
    progress: 0,
    messages: 2,
    created: "2025-01-20"
  }
];

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
                {mockRequests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.6 + (index * 0.1) }}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{request.title}</div>
                        <div className="text-xs text-muted-foreground">{request.category}</div>
                        <div className="text-xs text-muted-foreground">ID: {request.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.professional.avatar} alt={request.professional.name} />
                          <AvatarFallback className="text-xs">{request.professional.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{request.professional.name}</div>
                          <div className="text-xs text-muted-foreground">{request.professional.specialty}</div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-muted-foreground">{request.professional.rating}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{request.deadline}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="font-medium">{request.budget}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{request.progress}%</span>
                          <span className="text-muted-foreground">
                            {request.status === 'Completado' ? 'Finalizado' : 
                             request.status === 'En Progreso' ? 'En curso' : 'Pendiente'}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${request.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {request.messages > 0 && (
                          <Link href={`/explorador/chat/${request.id}`}>
                            <Button className="h-8 w-8 p-0 hover:glass-medium relative">
                              <MessageSquare className="h-4 w-4" />
                              {request.messages > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-xs text-white">
                                  {request.messages}
                                </span>
                              )}
                              <span className="sr-only">Mensajes</span>
                            </Button>
                          </Link>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="h-8 w-8 p-0 hover:glass-medium">
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
                              Contactar profesional
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {request.status === 'Completado' && (
                              <DropdownMenuItem className="hover:glass-medium">
                                <Star className="mr-2 h-4 w-4" />
                                Calificar servicio
                              </DropdownMenuItem>
                            )}
                            {request.status !== 'Completado' && (
                              <DropdownMenuItem className="hover:glass-medium text-red-400 focus:text-red-400">
                                Cancelar solicitud
                              </DropdownMenuItem>
                            )}
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
              Mostrando 3 de 7 solicitudes activas
            </div>
            <Link href="/explorador/mis-solicitudes">
              <Button className="glass border-white/20 hover:glass-medium">
                Ver todas las solicitudes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}