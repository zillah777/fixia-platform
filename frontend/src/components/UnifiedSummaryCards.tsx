/**
 * Unified Summary Cards Component
 * Consolidates FixiaSummaryCards and ExplorerSummaryCards into one reusable component
 * Provides role-specific dashboard analytics with consistent design
 */

import { Calendar, Clock, Star, TrendingUp, Users, MessageSquare, Shield, Zap, Search, CheckCircle, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useASDashboardData } from "@/hooks/useDashboardData";
import { useOptimizedGlass } from "@/contexts/GlassOptimizationContext";
import { dashboardService } from "@/services/dashboard";
import { useState, useEffect } from "react";

// Types
type UserType = 'provider' | 'customer';

interface BaseStats {
  [key: string]: any;
}

interface ASStats extends BaseStats {
  active_services?: number;
  total_services?: number;
  pending_requests?: number;
  average_rating?: number;
  total_reviews?: number;
  total_earnings?: number;
  completed_bookings?: number;
  monthly_net_earnings?: number;
  profile_completion?: number;
}

interface ExplorerStats extends BaseStats {
  activeBookings?: number;
  completedBookings?: number;
  totalSpent?: number;
  favoriteServices?: number;
  unreadMessages?: number;
  connectedProfessionals?: number;
  projectsStarted?: number;
}

interface CardConfig {
  title: string;
  icon: any;
  colorClass: string;
  getValue: (stats: any, loading: boolean) => string | number;
  getProgress: (stats: any) => number;
  getDetails: (stats: any, loading: boolean) => Array<{
    label: string;
    value: string;
    badge?: { text: string; className: string };
  }>;
  getDescription: (stats: any, loading: boolean) => string;
  action?: {
    label: string;
    href: string;
  };
}

interface UnifiedSummaryCardsProps {
  /**
   * User type determines the cards configuration
   */
  userType?: UserType;
  /**
   * Override stats data
   */
  customStats?: BaseStats;
  /**
   * Show custom title and subtitle
   */
  title?: string;
  subtitle?: string;
  /**
   * Custom badge text
   */
  badgeText?: string;
  /**
   * Number of columns for grid layout
   */
  columns?: 2 | 3 | 4;
}

export function UnifiedSummaryCards({
  userType: propUserType,
  customStats,
  title,
  subtitle,
  badgeText = "Últimos 30 días",
  columns = 3
}: UnifiedSummaryCardsProps) {
  const { user } = useAuth();
  const userType = propUserType || (user?.user_type as UserType) || 'customer';
  
  // Use different data hooks based on user type
  const asData = useASDashboardData();
  const [explorerStats, setExplorerStats] = useState<ExplorerStats>({});
  const [explorerLoading, setExplorerLoading] = useState(true);

  const { glassClasses: cardGlass } = useOptimizedGlass('light');
  const { glassClasses: badgeGlass } = useOptimizedGlass('medium');
  const { glassClasses: buttonGlass } = useOptimizedGlass('medium');

  // Fetch explorer stats
  useEffect(() => {
    const fetchExplorerStats = async () => {
      if (userType !== 'customer' || !user?.id) {
        setExplorerLoading(false);
        return;
      }
      
      try {
        const data = await dashboardService.getExploradorDashboardStats();
        if (data.stats) {
          setExplorerStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching explorer stats:', error);
        // Keep default stats on error
      } finally {
        setExplorerLoading(false);
      }
    };

    fetchExplorerStats();
  }, [user, userType]);

  // Get current stats and loading state
  const stats = customStats || (userType === 'provider' ? asData.stats : explorerStats);
  const loading = userType === 'provider' ? asData.loading : explorerLoading;

  // Configuration for different user types
  const cardConfigurations: Record<UserType, CardConfig[]> = {
    provider: [
      {
        title: "Servicios Activos",
        icon: Clock,
        colorClass: "text-primary",
        getValue: (stats: ASStats, loading: boolean) => loading ? "..." : (stats?.active_services || 0),
        getProgress: (stats: ASStats) => (stats?.total_services || 0) > 0 ? (stats?.active_services || 0) / (stats?.total_services || 1) * 100 : 0,
        getDetails: (stats: ASStats, loading: boolean) => [
          { label: "Total servicios", value: loading ? "..." : String(stats?.total_services || 0) },
          { label: "Solicitudes pendientes", value: loading ? "..." : String(stats?.pending_requests || 0) }
        ],
        getDescription: (stats: ASStats, loading: boolean) => 
          loading ? "Cargando..." : stats?.active_services === 0 ? "Crea tu primer servicio" : `${stats?.active_services} servicios activos`
      },
      {
        title: "Reputación",
        icon: Star,
        colorClass: "text-yellow-400",
        getValue: (stats: ASStats, loading: boolean) => loading ? "..." : (stats?.average_rating || 0).toFixed(1),
        getProgress: (stats: ASStats) => (stats?.average_rating || 0) > 0 ? ((stats?.average_rating || 0) / 5) * 100 : 0,
        getDetails: (stats: ASStats, loading: boolean) => [
          { 
            label: loading ? "..." : `${stats?.total_reviews || 0} reseñas totales`, 
            value: "",
            badge: (stats?.total_reviews || 0) > 0 
              ? { text: "Verificado", className: "bg-green-500/20 text-green-400" }
              : { text: "Sin reseñas", className: "bg-gray-500/20 text-gray-400" }
          }
        ],
        getDescription: (stats: ASStats, loading: boolean) => 
          loading ? "Cargando..." : 
          stats?.total_reviews === 0 ? "Completa servicios para recibir reseñas" :
          `${Math.round((stats?.average_rating || 0) / 5 * 100)}% de satisfacción del cliente`
      },
      {
        title: "Ingresos Reales",
        icon: TrendingUp,
        colorClass: "text-green-400",
        getValue: (stats: ASStats, loading: boolean) => loading ? "..." : `$${(stats?.total_earnings || 0).toLocaleString('es-AR')} ARS`,
        getProgress: (stats: ASStats) => (stats?.total_earnings || 0) > 0 ? Math.min(((stats?.total_earnings || 0) / 50000) * 100, 100) : 0,
        getDetails: (stats: ASStats, loading: boolean) => [
          { label: "Servicios completados", value: loading ? "..." : String(stats?.completed_bookings || 0) },
          { label: "Comisión plataforma", value: loading ? "..." : "0%" },
          { 
            label: "Ingresos netos este mes", 
            value: loading ? "..." : stats?.monthly_net_earnings ? `$${stats.monthly_net_earnings.toLocaleString('es-AR')} ARS` : "$0 ARS"
          }
        ],
        getDescription: (stats: ASStats, loading: boolean) => 
          loading ? "Cargando..." : 
          stats?.total_earnings === 0 ? "Completa tu primer servicio para generar ingresos" :
          stats && (stats?.completed_bookings || 0) > 0 ? `Promedio: $${Math.round((stats?.total_earnings || 0) / (stats?.completed_bookings || 1)).toLocaleString('es-AR')} ARS por servicio` : 
          "Conecta con clientes para generar ingresos"
      },
      {
        title: "Comunicación",
        icon: MessageSquare,
        colorClass: "text-primary",
        getValue: (stats: ASStats, loading: boolean) => loading ? "..." : "0",
        getProgress: () => 0,
        getDetails: (stats: ASStats, loading: boolean) => [
          { label: "Mensajes sin leer", value: "", badge: { text: "0", className: "bg-gray-500/20 text-gray-400" } },
          { label: "Chats activos", value: "", badge: { text: "0", className: "bg-gray-500/20 text-gray-400" } }
        ],
        getDescription: () => "",
        action: { label: "Ver Mensajes", href: "/as/chats" }
      },
      {
        title: "Perfil",
        icon: Users,
        colorClass: "text-blue-400",
        getValue: (stats: ASStats, loading: boolean) => loading ? "..." : `${stats?.profile_completion || 0}%`,
        getProgress: (stats: ASStats) => stats?.profile_completion || 0,
        getDetails: (stats: ASStats, loading: boolean) => [
          { 
            label: "Completado", 
            value: "",
            badge: {
              text: loading ? "..." : (stats?.profile_completion || 0) >= 80 ? "Completo" : "En progreso",
              className: (stats?.profile_completion || 0) >= 80 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
            }
          }
        ],
        getDescription: (stats: ASStats, loading: boolean) => 
          loading ? "Cargando..." : 
          (stats?.profile_completion || 0) < 80 ? "Completa tu perfil para más oportunidades" : "Perfil completado correctamente"
      },
      {
        title: "Confianza",
        icon: Shield,
        colorClass: "text-blue-400",
        getValue: (stats: ASStats, loading: boolean) => loading ? "..." : (stats?.total_reviews || 0) > 0 ? "85%" : "0%",
        getProgress: (stats: ASStats) => (stats?.total_reviews || 0) > 0 ? 85 : 0,
        getDetails: (stats: ASStats, loading: boolean) => [
          { label: "Nivel de confianza", value: loading ? "..." : (stats?.total_reviews || 0) > 0 ? "●" : "○" },
          { label: "Perfil completo", value: loading ? "..." : (stats?.profile_completion || 0) >= 80 ? "●" : "○" }
        ],
        getDescription: () => "",
        action: { label: "Ver Centro de Confianza", href: "/as/centro-confianza" }
      }
    ],
    customer: [
      {
        title: "Solicitudes Activas",
        icon: Search,
        colorClass: "text-primary",
        getValue: (stats: ExplorerStats, loading: boolean) => loading ? "..." : (stats?.activeBookings || 0),
        getProgress: (stats: ExplorerStats) => (stats?.activeBookings || 0) > 0 ? Math.min(((stats?.activeBookings || 0) / 10) * 100, 100) : 0,
        getDetails: (stats: ExplorerStats, loading: boolean) => [
          { label: "En proceso", value: loading ? "..." : String(Math.floor((stats?.activeBookings || 0) * 0.6)) },
          { label: "Esperando propuestas", value: loading ? "..." : String(Math.ceil((stats?.activeBookings || 0) * 0.4)) }
        ],
        getDescription: (stats: ExplorerStats, loading: boolean) => 
          loading ? "Cargando..." : `${stats?.activeBookings || 0} solicitudes activas`
      },
      {
        title: "Proyectos Completados",
        icon: CheckCircle,
        colorClass: "text-green-400",
        getValue: (stats: ExplorerStats, loading: boolean) => loading ? "..." : (stats?.completedBookings || 0),
        getProgress: (stats: ExplorerStats) => (stats?.completedBookings || 0) > 0 ? Math.min(((stats?.completedBookings || 0) / 50) * 100, 100) : 0,
        getDetails: (stats: ExplorerStats, loading: boolean) => [
          { 
            label: "Este mes", 
            value: "",
            badge: { 
              text: loading ? "..." : `+${Math.max(1, Math.floor((stats?.completedBookings || 0) * 0.2))}`,
              className: "bg-green-500/20 text-green-400"
            }
          },
          { 
            label: "Satisfacción promedio", 
            value: loading ? "..." : (stats?.completedBookings || 0) > 0 ? "4.8★" : "N/A"
          }
        ],
        getDescription: (stats: ExplorerStats, loading: boolean) => 
          loading ? "Cargando..." : `${(stats?.completedBookings || 0) > 0 ? Math.floor(((stats?.completedBookings || 0) / ((stats?.completedBookings || 0) + (stats?.activeBookings || 0) + 1)) * 100) : 0}% de proyectos exitosos`
      },
      {
        title: "Presupuesto del Mes",
        icon: TrendingUp,
        colorClass: "text-blue-400",
        getValue: (stats: ExplorerStats, loading: boolean) => loading ? "..." : `$${(stats?.totalSpent || 0).toLocaleString()}`,
        getProgress: (stats: ExplorerStats) => (stats?.totalSpent || 0) > 0 ? Math.min(((stats?.totalSpent || 0) / 10000) * 100, 100) : 0,
        getDetails: (stats: ExplorerStats, loading: boolean) => [
          { 
            label: "Total gastado", 
            value: loading ? "..." : `$${(stats?.totalSpent || 0).toLocaleString()}`
          }
        ],
        getDescription: (stats: ExplorerStats, loading: boolean) => 
          loading ? "Cargando..." : `Promedio: $${(stats?.completedBookings || 0) > 0 ? Math.floor((stats?.totalSpent || 0) / (stats?.completedBookings || 1)).toLocaleString() : 0} por proyecto`
      },
      {
        title: "Conversaciones",
        icon: MessageSquare,
        colorClass: "text-primary",
        getValue: (stats: ExplorerStats, loading: boolean) => loading ? "..." : (stats?.unreadMessages || 0),
        getProgress: () => 0,
        getDetails: (stats: ExplorerStats, loading: boolean) => [
          { 
            label: "Mensajes sin leer", 
            value: "",
            badge: { 
              text: loading ? "..." : String(stats?.unreadMessages || 0),
              className: (stats?.unreadMessages || 0) > 0 ? "bg-red-500 text-white" : "bg-gray-500/20 text-gray-400"
            }
          },
          { 
            label: "Chats activos", 
            value: "",
            badge: { 
              text: loading ? "..." : String(Math.max(stats?.activeBookings || 0, 1)),
              className: "bg-primary/20 text-primary"
            }
          }
        ],
        getDescription: () => "",
        action: { label: "Ver Mensajes", href: "/explorador/chats" }
      },
      {
        title: "Solicitudes de Servicio",
        icon: Heart,
        colorClass: "text-red-400",
        getValue: (stats: ExplorerStats, loading: boolean) => loading ? "..." : (stats?.favoriteServices || 0),
        getProgress: () => 0,
        getDetails: (stats: ExplorerStats, loading: boolean) => [
          { 
            label: "Solicitudes enviadas", 
            value: "",
            badge: { text: loading ? "..." : String(stats?.favoriteServices || 0), className: "bg-green-500/20 text-green-400" }
          },
          { 
            label: "Activos", 
            value: "",
            badge: { text: loading ? "..." : String(Math.floor((stats?.favoriteServices || 0) * 0.7)), className: "bg-blue-500/20 text-blue-400" }
          }
        ],
        getDescription: (stats: ExplorerStats, loading: boolean) => 
          loading ? "Cargando..." : `${stats?.favoriteServices || 0} solicitudes de servicio enviadas`
      },
      {
        title: "Explorar Servicios",
        icon: Search,
        colorClass: "text-purple-400",
        getValue: () => "0",
        getProgress: () => 0,
        getDetails: () => [
          { label: "Búsquedas realizadas", value: "", badge: { text: "0", className: "bg-gray-500/20 text-gray-400" } },
          { label: "Profesionales vistos", value: "", badge: { text: "0", className: "bg-gray-500/20 text-gray-400" } }
        ],
        getDescription: () => "",
        action: { label: "Explorar Marketplace", href: "/explorador/marketplace" }
      }
    ]
  };

  const currentConfig = cardConfigurations[userType];
  const displayTitle = title || (userType === 'provider' ? "Resumen de Actividad" : "Panel de Control");
  const displaySubtitle = subtitle || (userType === 'provider' 
    ? "Transparencia líquida: ves todo lo que necesitas saber" 
    : "Gestiona tus proyectos y conecta con los mejores profesionales");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{displayTitle}</h2>
          <p className="text-muted-foreground text-sm">
            {displaySubtitle}
          </p>
        </div>
        <Badge className={`${badgeGlass} border-white/20`}>
          {badgeText}
        </Badge>
      </div>
      
      <div className={`grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`}>
        {currentConfig.map((cardConfig, index) => (
          <motion.div
            key={cardConfig.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.9 + (index * 0.1) }}
          >
            <Card className={`${cardGlass} hover:glass-medium transition-all duration-300 border-white/10 group`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <cardConfig.icon className={`h-4 w-4 ${cardConfig.colorClass} group-hover:scale-110 transition-transform duration-300`} />
                  <span>{cardConfig.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {cardConfig.getValue(stats, loading)}
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    {cardConfig.getDetails(stats, loading).map((detail, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{detail.label}</span>
                        {detail.value && <span className="font-medium">{detail.value}</span>}
                        {detail.badge && (
                          <Badge className={`text-xs border-0 ${detail.badge.className}`}>
                            {detail.badge.text}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <Progress 
                    value={cardConfig.getProgress(stats)} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {cardConfig.getDescription(stats, loading)}
                  </p>
                  {cardConfig.action && (
                    <Link href={cardConfig.action.href}>
                      <Button className={`w-full text-xs ${buttonGlass} hover:glass-strong transition-all duration-300 h-8`}>
                        {cardConfig.action.label}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}