import { useState } from "react";
import { Search, Plus, Bell, User, Briefcase, Shield, Menu, LogOut, Store, Images, Home, X, Crown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FixiaAvatar } from "./ui/fixia-avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { SimpleTooltip } from "./ui/tooltip";

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
    const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
    return initials || 'U';
  };

  const getAvatarSrc = (): string | undefined => {
    if (!user?.profile_image) return undefined;
    try {
      return `/api/image-proxy?url=${encodeURIComponent(user.profile_image)}`;
    } catch (error) {
      console.warn('Error encoding profile image URL:', error);
      return undefined;
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
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
          
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Navegación principal">
            <Link href={user?.user_type === 'provider' ? '/as/dashboard' : '/explorador/dashboard'}>
              <SimpleTooltip content={user?.user_type === 'provider' ? "Tu panel principal con resumen de trabajos y solicitudes" : "Tu panel principal para buscar profesionales"}>
                <Button variant="secondary">
                  <Home className="mr-2 h-4 w-4" />
                  Inicio
                </Button>
              </SimpleTooltip>
            </Link>
            {user?.user_type === 'customer' && (
              <>
                <Link href="/explorador/marketplace">
                  <SimpleTooltip content="Encuentra profesionales verificados para tu proyecto">
                    <Button variant="ghost">
                      <Search className="mr-2 h-4 w-4" />
                      Encontrar Profesional
                    </Button>
                  </SimpleTooltip>
                </Link>
              </>
            )}
            {user?.user_type === 'provider' && (
              <>
                <Link href="/as/servicios">
                  <SimpleTooltip content="Agrega, edita y gestiona los trabajos que ofreces">
                    <Button variant="ghost">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Mis Trabajos
                    </Button>
                  </SimpleTooltip>
                </Link>
                <Link href="/as/portafolio">
                  <SimpleTooltip content="Sube fotos de trabajos que hayas hecho para mostrar tu calidad">
                    <Button variant="ghost">
                      <Images className="mr-2 h-4 w-4" />
                      Mis Fotos
                    </Button>
                  </SimpleTooltip>
                </Link>
              </>
            )}
            <Link href="/planes">
              <SimpleTooltip content="Mejora tu cuenta para más beneficios">
                <Button variant="ghost" className="relative">
                  <Crown className="mr-2 h-4 w-4" />
                  Mejorar Cuenta
                  <Badge className="ml-2 bg-primary/20 text-primary text-xs border-0 animate-pulse">
                    Nuevo
                  </Badge>
                </Button>
              </SimpleTooltip>
            </Link>
          </nav>
        </div>

        {/* Search, Actions, and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={user?.user_type === 'customer' ? "Buscar en marketplace..." : "Buscar profesionales o servicios..."}
              className="w-64 xl:w-80 pl-12 glass border-white/20 focus:border-primary/50 focus:ring-primary/30 transition-all duration-300"
              aria-label={user?.user_type === 'customer' ? "Buscar servicios en marketplace" : "Buscar profesionales o servicios"}
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
          <div className="flex items-center space-x-1 sm:space-x-2">

            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="h-4 w-4" />
              {/* Badge will only show when there are real notifications */}
            </Button>
          </div>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="relative rounded-full">
                <FixiaAvatar
                  {...(getAvatarSrc() && { src: getAvatarSrc() })}
                  alt={`Avatar de ${user?.first_name || 'Usuario'}`}
                  fallbackText={getInitials()}
                  size="md"
                  variant={user?.user_type === 'provider' ? 'professional' : 'client'}
                  priority={true}
                  className="h-9 w-9 sm:h-10 sm:w-10"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <FixiaAvatar
                      {...(getAvatarSrc() && { src: getAvatarSrc() })}
                      alt={`Avatar de ${user?.first_name || 'Usuario'}`}
                      fallbackText={getInitials()}
                      size="lg"
                      variant={user?.user_type === 'provider' ? 'professional' : 'client'}
                      priority={true}
                    />
                    <div>
                      <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.user_type === 'provider' ? 'Profesional' : 'Cliente'}
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
                <DropdownMenuItem>
                  <User className="mr-3 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
              </Link>
              {user?.user_type === 'customer' && (
                <Link href="/explorador/marketplace">
                  <DropdownMenuItem>
                    <Search className="mr-3 h-4 w-4" />
                    Encontrar Profesional
                  </DropdownMenuItem>
                </Link>
              )}
              {user?.user_type === 'provider' && (
                <>
                  <Link href="/as/servicios">
                    <DropdownMenuItem>
                      <Briefcase className="mr-3 h-4 w-4" />
                      Mis Trabajos
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/as/portafolio">
                    <DropdownMenuItem>
                      <Images className="mr-3 h-4 w-4" />
                      Mis Fotos
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
              <Link href="/planes">
                <DropdownMenuItem>
                  <Crown className="mr-3 h-4 w-4" />
                  Planes Premium
                  <Badge className="ml-auto bg-primary/20 text-primary text-xs border-0">
                    Nuevo
                  </Badge>
                </DropdownMenuItem>
              </Link>
              <Link href={user?.user_type === 'provider' ? '/as/configuracion' : '/explorador/cambiar-password'}>
                <DropdownMenuItem>
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
            variant="ghost"
            size="icon"
            className="lg:hidden"
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
            <div className="container mx-auto px-4 sm:px-6 py-4">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={user?.user_type === 'customer' ? "Buscar en marketplace..." : "Buscar profesionales o servicios..."}
                  className="pl-12 glass border-white/20 focus:border-primary/50"
                  aria-label={user?.user_type === 'customer' ? "Buscar servicios en marketplace (móvil)" : "Buscar profesionales o servicios (móvil)"}
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
              <div className="space-y-2" role="navigation" aria-label="Navegación móvil">
                <Link href={user?.user_type === 'provider' ? '/as/dashboard' : '/explorador/dashboard'}>
                  <Button 
                    variant="secondary"
                    className="w-full justify-start"
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
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Search className="mr-3 h-4 w-4" />
                        Encontrar Profesional
                      </Button>
                    </Link>
                  </>
                )}

                {user?.user_type === 'provider' && (
                  <>
                    <Link href="/as/servicios">
                      <Button 
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Briefcase className="mr-3 h-4 w-4" />
                        Mis Trabajos
                      </Button>
                    </Link>
                    <Link href="/as/portafolio">
                      <Button 
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Images className="mr-3 h-4 w-4" />
                        Mis Fotos
                        <Badge className="ml-auto bg-primary/20 text-primary text-xs border-0">
                          Nuevo
                        </Badge>
                      </Button>
                    </Link>
                  </>
                )}

                <Link href="/planes">
                  <Button 
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Crown className="mr-3 h-4 w-4" />
                    Planes Premium
                    <Badge className="ml-auto bg-primary/20 text-primary text-xs border-0 animate-pulse">
                      Nuevo
                    </Badge>
                  </Button>
                </Link>

                {/* Separator */}
                <div className="border-t border-white/10 my-4"></div>

                {/* Profile Section */}
                <Link href={user?.user_type === 'provider' ? '/as/perfil' : '/explorador/perfil'}>
                  <Button 
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Mi Perfil
                  </Button>
                </Link>

                <Link href={user?.user_type === 'provider' ? '/as/configuracion' : '/explorador/cambiar-password'}>
                  <Button 
                    variant="ghost"
                    className="w-full justify-start"
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
                  variant="ghost"
                  className="w-full justify-start text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>

              {/* User Info Card */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-3 glass-light rounded-lg p-3">
                  <FixiaAvatar
                    {...(getAvatarSrc() && { src: getAvatarSrc() })}
                    alt={`Avatar de ${user?.first_name || 'Usuario'}`}
                    fallbackText={getInitials()}
                    size="md"
                    variant={user?.user_type === 'provider' ? 'professional' : 'client'}
                    priority={true}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.user_type === 'provider' ? 'Profesional' : 'Cliente'}
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