import { Search, Plus, Bell, User, Briefcase, Heart, Shield, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";

export function FixiaNavigation() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo and Navigation Links */}
        <div className="flex items-center space-x-8">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="relative">
              <div className="h-10 w-10 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
                <motion.div
                  className="text-white font-bold text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  F
                </motion.div>
              </div>
              <div className="absolute -inset-1 liquid-gradient rounded-xl blur opacity-20 animate-pulse-slow"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold tracking-tight">Fixia</span>
              <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
            </div>
          </motion.div>
          
          <nav className="hidden lg:flex items-center space-x-1">
            <Button variant="ghost" className="glass-medium hover:glass-strong transition-all duration-300">
              Inicio
            </Button>
            <Button variant="ghost" className="hover:glass-medium transition-all duration-300">
              Buscar Servicios
            </Button>
            <Button variant="ghost" className="hover:glass-medium transition-all duration-300">
              Ofrecer Servicios
            </Button>
            <Button variant="ghost" className="hover:glass-medium transition-all duration-300 flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Centro de Confianza</span>
            </Button>
          </nav>
        </div>

        {/* Search, Actions, and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar profesionales o servicios..."
              className="w-80 pl-12 glass border-white/20 focus:border-primary/50 focus:ring-primary/30 transition-all duration-300"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button size="sm" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proyecto
            </Button>

            <Button variant="ghost" size="icon" className="relative hover:glass-medium transition-all duration-300">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-destructive text-xs">
                3
              </Badge>
            </Button>

            <Button variant="ghost" size="icon" className="hover:glass-medium transition-all duration-300">
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:glass-medium transition-all duration-300">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="Usuario" />
                  <AvatarFallback className="glass">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 glass border-white/20" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face" alt="Usuario" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Juan Desarrollador</p>
                      <p className="text-sm text-muted-foreground">Desarrollador Full Stack</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex text-yellow-400">★★★★★</div>
                        <span className="text-xs text-muted-foreground">4.9 (127 reseñas)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="hover:glass-medium">
                <User className="mr-3 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:glass-medium">
                <Briefcase className="mr-3 h-4 w-4" />
                Mis Servicios
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:glass-medium">
                <Shield className="mr-3 h-4 w-4" />
                Seguridad
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="hover:glass-medium text-destructive">
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="lg:hidden hover:glass-medium">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}