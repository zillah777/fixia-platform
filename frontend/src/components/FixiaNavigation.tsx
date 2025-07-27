import { Search, Plus, Bell, User, Briefcase, Shield, Menu, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

export function FixiaNavigation() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const getInitials = () => {
    const firstName = user?.first_name || '';
    const lastName = user?.last_name || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';
  };

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
            <Link href={user?.user_type === 'provider' ? '/as/dashboard' : '/explorador/dashboard'} className="flex items-center space-x-3">
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
            </Link>
          </motion.div>
          
          <nav className="hidden lg:flex items-center space-x-1">
            <Link href={user?.user_type === 'provider' ? '/as/dashboard' : '/explorador/dashboard'}>
              <Button variant="ghost" className="glass-medium hover:glass-strong transition-all duration-300">
                Inicio
              </Button>
            </Link>
            {user?.user_type === 'customer' && (
              <Link href="/explorador/buscar-servicio">
                <Button variant="ghost" className="hover:glass-medium transition-all duration-300">
                  Buscar Servicios
                </Button>
              </Link>
            )}
            {user?.user_type === 'provider' && (
              <Link href="/as/servicios">
                <Button variant="ghost" className="hover:glass-medium transition-all duration-300">
                  Mis Servicios
                </Button>
              </Link>
            )}
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
            {user?.user_type === 'customer' && (
              <Link href="/explorador/buscar-servicio">
                <Button size="sm" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Proyecto
                </Button>
              </Link>
            )}
            {user?.user_type === 'provider' && (
              <Link href="/as/servicios">
                <Button size="sm" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Servicio
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="relative hover:glass-medium transition-all duration-300">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-destructive text-xs">
                3
              </Badge>
            </Button>
          </div>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:glass-medium transition-all duration-300">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={user?.profile_image ? `/api/image-proxy?url=${encodeURIComponent(user.profile_image)}` : undefined} alt="Usuario" />
                  <AvatarFallback className="glass">{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 glass border-white/20" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.profile_image ? `/api/image-proxy?url=${encodeURIComponent(user.profile_image)}` : undefined} alt="Usuario" />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.user_type === 'provider' ? 'Profesional' : 'Explorador'}
                      </p>
                      {user?.user_type === 'provider' && (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="flex text-yellow-400">★★★★★</div>
                          <span className="text-xs text-muted-foreground">4.9</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <Link href={user?.user_type === 'provider' ? '/as/perfil' : '/explorador/perfil'}>
                <DropdownMenuItem className="hover:glass-medium">
                  <User className="mr-3 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
              </Link>
              {user?.user_type === 'provider' && (
                <Link href="/as/servicios">
                  <DropdownMenuItem className="hover:glass-medium">
                    <Briefcase className="mr-3 h-4 w-4" />
                    Mis Servicios
                  </DropdownMenuItem>
                </Link>
              )}
              <Link href={user?.user_type === 'provider' ? '/as/configuracion' : '/explorador/cambiar-password'}>
                <DropdownMenuItem className="hover:glass-medium">
                  <Shield className="mr-3 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="hover:glass-medium text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-4 w-4" />
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