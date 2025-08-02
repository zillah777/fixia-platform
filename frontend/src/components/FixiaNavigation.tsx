import { useState } from "react";
import { Search, Plus, Bell, User, Briefcase, Shield, Menu, LogOut, Store, Images, Home, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

export function FixiaNavigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <Button className="glass-medium hover:glass-strong transition-all duration-300">
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </Link>
            {user?.user_type === 'customer' && (
              <>
                <Link href="/explorador/marketplace">
                  <Button className="hover:glass-medium transition-all duration-300">
                    <Store className="mr-2 h-4 w-4" />
                    Marketplace
                  </Button>
                </Link>
                <Link href="/explorador/buscar-servicio">
                  <Button className="hover:glass-medium transition-all duration-300">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Servicios
                  </Button>
                </Link>
              </>
            )}
            {user?.user_type === 'provider' && (
              <>
                <Link href="/as/servicios">
                  <Button className="hover:glass-medium transition-all duration-300">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Mis Servicios
                  </Button>
                </Link>
                <Link href="/as/portafolio">
                  <Button className="hover:glass-medium transition-all duration-300">
                    <Images className="mr-2 h-4 w-4" />
                    Mi Portafolio
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Search, Actions, and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={user?.user_type === 'customer' ? "Buscar en marketplace..." : "Buscar profesionales o servicios..."}
              className="w-80 pl-12 glass border-white/20 focus:border-primary/50 focus:ring-primary/30 transition-all duration-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && user?.user_type === 'customer') {
                  const searchTerm = (e.target as HTMLInputElement).value;
                  if (searchTerm.trim()) {
                    router.push(`/explorador/marketplace?search=${encodeURIComponent(searchTerm)}`);
                  }
                }
              }}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {user?.user_type === 'customer' && (
              <Link href="/explorador/marketplace">
                <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg h-9 px-3">
                  <Store className="mr-2 h-4 w-4" />
                  Explorar Marketplace
                </Button>
              </Link>
            )}
            {user?.user_type === 'provider' && (
              <Link href="/as/portafolio">
                <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg h-9 px-3">
                  <Images className="mr-2 h-4 w-4" />
                  Gestionar Portafolio
                </Button>
              </Link>
            )}

            <Button className="relative hover:glass-medium transition-all duration-300 h-10 w-10">
              <Bell className="h-4 w-4" />
              {/* Badge will only show when there are real notifications */}
            </Button>
          </div>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="relative h-10 w-10 rounded-full hover:glass-medium transition-all duration-300">
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
              {user?.user_type === 'customer' && (
                <Link href="/explorador/marketplace">
                  <DropdownMenuItem className="hover:glass-medium">
                    <Store className="mr-3 h-4 w-4" />
                    Marketplace
                  </DropdownMenuItem>
                </Link>
              )}
              {user?.user_type === 'provider' && (
                <>
                  <Link href="/as/servicios">
                    <DropdownMenuItem className="hover:glass-medium">
                      <Briefcase className="mr-3 h-4 w-4" />
                      Mis Servicios
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/as/portafolio">
                    <DropdownMenuItem className="hover:glass-medium">
                      <Images className="mr-3 h-4 w-4" />
                      Mi Portafolio
                    </DropdownMenuItem>
                  </Link>
                </>
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

          {/* Mobile Menu Button */}
          <Button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden hover:glass-medium h-10 w-10"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/10"
          >
            <div className="container mx-auto px-6 py-4">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={user?.user_type === 'customer' ? "Buscar en marketplace..." : "Buscar profesionales o servicios..."}
                  className="pl-12 glass border-white/20 focus:border-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && user?.user_type === 'customer') {
                      const searchTerm = (e.target as HTMLInputElement).value;
                      if (searchTerm.trim()) {
                        setIsMobileMenuOpen(false);
                        router.push(`/explorador/marketplace?search=${encodeURIComponent(searchTerm)}`);
                      }
                    }
                  }}
                />
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link href={user?.user_type === 'provider' ? '/as/dashboard' : '/explorador/dashboard'}>
                  <Button 
                    className="w-full justify-start glass-medium hover:glass-strong transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="mr-3 h-4 w-4" />
                    Inicio
                  </Button>
                </Link>

                {user?.user_type === 'customer' && (
                  <>
                    <Link href="/explorador/marketplace">
                      <Button 
                        className="w-full justify-start hover:glass-medium transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Store className="mr-3 h-4 w-4" />
                        Marketplace
                        <Badge className="ml-auto bg-primary/20 text-primary text-xs border-0">
                          Nuevo
                        </Badge>
                      </Button>
                    </Link>
                    <Link href="/explorador/buscar-servicio">
                      <Button 
                        className="w-full justify-start hover:glass-medium transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Search className="mr-3 h-4 w-4" />
                        Buscar Servicios
                      </Button>
                    </Link>
                  </>
                )}

                {user?.user_type === 'provider' && (
                  <>
                    <Link href="/as/servicios">
                      <Button 
                        className="w-full justify-start hover:glass-medium transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Briefcase className="mr-3 h-4 w-4" />
                        Mis Servicios
                      </Button>
                    </Link>
                    <Link href="/as/portafolio">
                      <Button 
                        className="w-full justify-start hover:glass-medium transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Images className="mr-3 h-4 w-4" />
                        Mi Portafolio
                        <Badge className="ml-auto bg-primary/20 text-primary text-xs border-0">
                          Nuevo
                        </Badge>
                      </Button>
                    </Link>
                  </>
                )}

                {/* Separator */}
                <div className="border-t border-white/10 my-4"></div>

                {/* Profile Section */}
                <Link href={user?.user_type === 'provider' ? '/as/perfil' : '/explorador/perfil'}>
                  <Button 
                    className="w-full justify-start hover:glass-medium transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Mi Perfil
                  </Button>
                </Link>

                <Link href={user?.user_type === 'provider' ? '/as/configuracion' : '/explorador/cambiar-password'}>
                  <Button 
                    className="w-full justify-start hover:glass-medium transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="mr-3 h-4 w-4" />
                    Configuración
                  </Button>
                </Link>

                {/* Logout */}
                <Button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full justify-start hover:glass-medium text-destructive focus:text-destructive transition-all duration-300"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>

              {/* User Info Card */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-3 glass-light rounded-lg p-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src={user?.profile_image ? `/api/image-proxy?url=${encodeURIComponent(user.profile_image)}` : undefined} alt="Usuario" />
                    <AvatarFallback className="glass">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.user_type === 'provider' ? 'Profesional' : 'Explorador'}
                    </p>
                    {user?.user_type === 'provider' && (
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex text-yellow-400 text-xs">★★★★★</div>
                        <span className="text-xs text-muted-foreground">4.9</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}