import { MoreHorizontal, ArrowUpDown, Eye, MessageSquare, Calendar, Clock, Star, DollarSign } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "motion/react";

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
      name: "Ana López",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
      initials: "AL",
      rating: 4.9
    },
    status: "Completado",
    priority: "Media",
    category: "Marketing",
    deadline: "2025-01-20",
    budget: "$800",
    progress: 100,
    messages: 0,
    deliveries: "2/2"
  },
  {
    id: "FX004",
    title: "Aplicación móvil iOS/Android",
    client: {
      name: "Tech Startup SL",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
      initials: "TS",
      rating: 4.7
    },
    status: "Iniciando",
    priority: "Alta",
    category: "Desarrollo Móvil",
    deadline: "2025-03-30",
    budget: "$8,500",
    progress: 15,
    messages: 8,
    deliveries: "0/6"
  },
  {
    id: "FX005",
    title: "Optimización SEO y Analytics",
    client: {
      name: "Roberto Fernández",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face",
      initials: "RF",
      rating: 4.6
    },
    status: "Pausado",
    priority: "Baja",
    category: "SEO",
    deadline: "2025-02-28",
    budget: "$600",
    progress: 40,
    messages: 2,
    deliveries: "1/3"
  }
];

function getStatusVariant(status: string) {
  switch (status) {
    case "Completado":
      return "bg-success/20 text-success border-success/30";
    case "En Progreso":
      return "bg-primary/20 text-primary border-primary/30";
    case "Esperando Revisión":
      return "bg-warning/20 text-warning border-warning/30";
    case "Iniciando":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Pausado":
      return "bg-muted/20 text-muted-foreground border-muted/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
  }
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case "Alta":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "Media":
      return "bg-warning/20 text-warning border-warning/30";
    case "Baja":
      return "bg-muted/20 text-muted-foreground border-muted/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
  }
}

export function FixiaServicesTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.5 }}
    >
      <Card className="glass border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>Mis Servicios Activos</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Profesionales reales, resultados concretos. Gestiona todos tus proyectos desde aquí.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="glass-medium border-white/20">
                {mockServices.length} servicios
              </Badge>
              <Button size="sm" className="liquid-gradient hover:opacity-90 transition-all duration-300">
                Nuevo Servicio
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-white/5 border-white/10">
                <TableHead>
                  <Button variant="ghost" className="h-auto p-0 hover:text-primary transition-colors">
                    Servicio
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>
                  <Button variant="ghost" className="h-auto p-0 hover:text-primary transition-colors">
                    Estado
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>
                  <Button variant="ghost" className="h-auto p-0 hover:text-primary transition-colors">
                    Entrega
                    <Calendar className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockServices.map((service, index) => (
                <motion.tr
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.6 + (index * 0.1) }}
                  className="hover:bg-white/5 border-white/10 transition-colors duration-200"
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{service.title}</div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs glass border-white/20">
                          #{service.id}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityVariant(service.priority)}`}>
                          {service.priority}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 ring-2 ring-white/10">
                        <AvatarImage src={service.client.avatar} alt={service.client.name} />
                        <AvatarFallback className="glass text-xs">{service.client.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{service.client.name}</div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-warning fill-current" />
                          <span className="text-xs text-muted-foreground">{service.client.rating}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusVariant(service.status)}>
                      {service.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{service.category}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{service.deadline}</div>
                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Entregas: {service.deliveries}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${service.progress}%` }}
                          transition={{ duration: 1, delay: 1.7 + (index * 0.1) }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        {service.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-success">{service.budget}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {service.messages > 0 && (
                        <Badge className="bg-primary/20 text-primary text-xs flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{service.messages}</span>
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:glass-medium transition-all duration-300">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-white/20">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem className="hover:glass-medium transition-all duration-200">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:glass-medium transition-all duration-200">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Enviar Mensaje
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:glass-medium transition-all duration-200">
                          <Calendar className="mr-2 h-4 w-4" />
                          Programar Entrega
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-warning hover:glass-medium transition-all duration-200">
                          Pausar Servicio
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}