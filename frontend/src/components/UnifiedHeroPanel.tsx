/**
 * Unified Hero Panel Component
 * Consolidates FixiaHeroPanel and ExplorerHeroPanel into one reusable component
 * Eliminates code duplication and provides consistent experience
 */

import { TrendingUp, Users, Star, Zap, Target, DollarSign, CheckCircle, Clock, Shield, User, Search, Heart, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { PromotionBanner } from "./PromotionBanner";

// Types for user role specific configuration
type UserType = 'provider' | 'customer';

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  icon: any; // Lucide icon component
  color: string;
  delay: number;
}

interface ActionButton {
  href: string;
  label: string;
  icon: any;
  variant: 'primary' | 'secondary' | 'tertiary';
}

interface UnifiedHeroPanelProps {
  /**
   * User type determines the panel configuration
   */
  userType?: UserType;
  /**
   * Optional user data override
   */
  userData?: {
    first_name?: string;
    stats?: Record<string, any>;
  };
  /**
   * Show promotion banner
   */
  showPromotion?: boolean;
  /**
   * Custom greeting emoji
   */
  greetingEmoji?: string;
  /**
   * Custom stats override
   */
  customStats?: StatCard[];
  /**
   * Custom action buttons
   */
  customActions?: ActionButton[];
}

export function UnifiedHeroPanel({ 
  userType: propUserType, 
  userData,
  showPromotion = true,
  greetingEmoji,
  customStats,
  customActions
}: UnifiedHeroPanelProps) {
  const { user } = useAuth();
  
  // Determine user type from props or context
  const userType = propUserType || (user?.user_type as UserType) || 'customer';
  const userName = userData?.first_name || user?.first_name || (userType === 'provider' ? 'Usuario' : 'Explorador');
  const emoji = greetingEmoji || (userType === 'provider' ? '👋' : '🔍');
  
  // User type specific configurations
  const config = {
    provider: {
      title: `¡Hola ${userName}! ${emoji}`,
      subtitle: "Tu tiempo vale. Fixia lo cuida. Aquí está tu resumen de actividad.",
      primaryActions: customActions || [
        { href: "/as/oportunidades", label: "Ver Oportunidades", icon: Target, variant: "primary" as const },
        { href: "/as/centro-confianza", label: "Centro de Confianza", icon: Shield, variant: "secondary" as const },
        { href: "/as/cambiar-a-explorador", label: "Cambiar a Explorador", icon: User, variant: "tertiary" as const }
      ],
      stats: customStats || [
        {
          title: "Servicios Completados",
          value: userData?.stats?.['completed_services'] || "0",
          change: "Completa tu primer servicio",
          icon: CheckCircle,
          color: "text-green-400",
          delay: 0.1
        },
        {
          title: "Ingresos Totales",
          value: userData?.stats?.['total_earnings'] ? `$${userData.stats['total_earnings']}` : "$0",
          change: "Comienza a generar ingresos",
          icon: DollarSign,
          color: "text-primary",
          delay: 0.2
        },
        {
          title: "Rating Promedio",
          value: userData?.stats?.['average_rating']?.toFixed(1) || "0.0",
          change: "Construye tu reputación",
          icon: Star,
          color: "text-yellow-400",
          delay: 0.3
        },
        {
          title: "Servicios Ofrecidos",
          value: userData?.stats?.['total_services'] || "0",
          change: "Crea tu primer servicio",
          icon: Clock,
          color: "text-blue-400",
          delay: 0.4
        }
      ],
      activitySection: {
        title: "Actividad Reciente",
        subtitle: "Tus últimas interacciones en la plataforma",
        icon: TrendingUp,
        emptyState: {
          title: "Sin actividad reciente",
          description: "Tu actividad aparecerá aquí cuando comiences a ofrecer servicios",
          actionLabel: "Crear Mi Primer Servicio",
          actionHref: "/as/servicios"
        }
      },
      sideSection: {
        title: "Logros Recientes",
        subtitle: "Tus últimos hitos en la plataforma",
        icon: Zap,
        emptyState: {
          title: "Sin logros aún",
          description: "Completa servicios y gana reputación para desbloquear logros",
          actionLabel: "Explorar Oportunidades",
          actionHref: "/as/oportunidades"
        }
      }
    },
    customer: {
      title: `¡Hola ${userName}! ${emoji}`,
      subtitle: "Conecta con profesionales verificados. Encuentra la solución perfecta para tu proyecto.",
      primaryActions: customActions || [
        { href: "/explorador/marketplace", label: "Encontrar Profesional", icon: Search, variant: "primary" as const }
      ],
      stats: customStats || [
        {
          title: "Solicitudes Activas",
          value: userData?.stats?.['active_bookings'] || "0",
          change: "Crea tu primera solicitud",
          icon: Clock,
          color: "text-blue-400",
          delay: 0.1
        },
        {
          title: "Servicios Completados",
          value: userData?.stats?.['completed_bookings'] || "0",
          change: "Ningún servicio completado aún",
          icon: CheckCircle,
          color: "text-green-400",
          delay: 0.2
        },
        {
          title: "Profesionales Conectados",
          value: userData?.stats?.['connected_professionals'] || "0",
          change: "Conecta con profesionales",
          icon: Star,
          color: "text-yellow-400",
          delay: 0.3
        },
        {
          title: "Proyectos Iniciados",
          value: userData?.stats?.['projects_started'] || "0",
          change: "¡Comienza tu primer proyecto!",
          icon: Zap,
          color: "text-purple-400",
          delay: 0.4
        }
      ],
      activitySection: {
        title: "Actividad Reciente",
        subtitle: "Tus últimas interacciones con profesionales",
        icon: Clock,
        emptyState: {
          title: "Sin actividad reciente",
          description: "Tu actividad con profesionales aparecerá aquí",
          actionLabel: "Encontrar Profesional",
          actionHref: "/explorador/marketplace"
        }
      },
      sideSection: {
        title: "Recomendaciones",
        subtitle: "Profesionales perfectos para ti",
        icon: Target,
        emptyState: {
          title: "Sin recomendaciones aún",
          description: "Explora profesionales y recibirás recomendaciones personalizadas",
          actionLabel: "Ver Profesionales",
          actionHref: "/explorador/marketplace"
        }
      }
    }
  };

  const currentConfig = config[userType];

  // Mock check for promotion eligibility
  const isPromotionActive = showPromotion && userType === 'provider';

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col space-y-3"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className={userType === 'customer' ? "flex-1 max-w-none lg:max-w-2xl" : ""}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent leading-tight">
              {currentConfig.title}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-2">
              {currentConfig.subtitle}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 sm:gap-3 lg:gap-2 xl:gap-3 w-full sm:w-auto lg:w-full xl:w-auto lg:max-w-xs xl:max-w-none">
            {currentConfig.primaryActions.map((action, index) => (
              <Link key={action.href} href={action.href} className={userType === 'customer' ? "flex-1 sm:flex-initial" : "w-full sm:w-auto"}>
                <Button className={`w-full transition-all duration-300 shadow-lg text-sm px-3 py-2 ${
                  action.variant === 'primary' 
                    ? 'liquid-gradient hover:opacity-90' 
                    : action.variant === 'secondary' 
                    ? 'glass-medium hover:glass-strong border border-white/20'
                    : 'glass-light hover:glass-medium border border-white/10 text-white/80 hover:text-white'
                }`}>
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Promotion Status Banner */}
      {isPromotionActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <PromotionBanner variant="dashboard" />
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {currentConfig.stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: stat.delay }}
          >
            <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 animate-float" 
                  style={{ animationDelay: `${stat.delay}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity and Side Section */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-8"
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <currentConfig.activitySection.icon className="h-5 w-5 text-primary" />
                <span>{currentConfig.activitySection.title}</span>
              </CardTitle>
              <CardDescription>
                {currentConfig.activitySection.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <currentConfig.activitySection.icon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{currentConfig.activitySection.emptyState.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {currentConfig.activitySection.emptyState.description}
                </p>
                <Link href={currentConfig.activitySection.emptyState.actionHref}>
                  <Button className="liquid-gradient hover:opacity-90 transition-all duration-300">
                    {userType === 'customer' && <Search className="mr-2 h-4 w-4" />}
                    {currentConfig.activitySection.emptyState.actionLabel}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-4"
        >
          <Card className="glass border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <currentConfig.sideSection.icon className={`h-5 w-5 ${userType === 'provider' ? 'text-yellow-400' : 'text-green-400'}`} />
                <span>{currentConfig.sideSection.title}</span>
              </CardTitle>
              <CardDescription>
                {currentConfig.sideSection.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <currentConfig.sideSection.icon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{currentConfig.sideSection.emptyState.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {currentConfig.sideSection.emptyState.description}
                </p>
                <Link href={currentConfig.sideSection.emptyState.actionHref}>
                  <Button className="glass-medium hover:glass-strong transition-all duration-300 border border-white/20">
                    {userType === 'customer' && <Users className="mr-2 h-4 w-4" />}
                    {currentConfig.sideSection.emptyState.actionLabel}
                  </Button>
                </Link>
              </div>
              
              {userType === 'provider' && (
                <div className="pt-4 border-t border-white/10">
                  <div className="text-center space-y-2">
                    <div className="text-sm text-muted-foreground">Próximo objetivo</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mentor Certificado</span>
                      <span className="text-xs text-muted-foreground">15/20</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-500" 
                           style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}