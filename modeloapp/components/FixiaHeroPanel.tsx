import { TrendingUp, Users, Star, Zap, Target, DollarSign, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Area, AreaChart } from "recharts";
import { motion } from "motion/react";

const serviceData = [
  { month: "Ene", servicios: 156, ingresos: 12400, satisfaccion: 4.8 },
  { month: "Feb", servicios: 189, ingresos: 15600, satisfaccion: 4.7 },
  { month: "Mar", servicios: 234, ingresos: 18900, satisfaccion: 4.9 },
  { month: "Abr", servicios: 298, ingresos: 24200, satisfaccion: 4.8 },
  { month: "May", servicios: 356, ingresos: 28800, satisfaccion: 4.9 },
  { month: "Jun", servicios: 412, ingresos: 33600, satisfaccion: 4.9 },
];

const chartConfig = {
  servicios: {
    label: "Servicios",
    color: "#667eea",
  },
  ingresos: {
    label: "Ingresos",
    color: "#764ba2",
  },
  satisfaccion: {
    label: "Satisfacción",
    color: "#51cf66",
  },
};

export function FixiaHeroPanel() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              ¡Hola Juan! 👋
            </h1>
            <p className="text-muted-foreground">
              Tu tiempo vale. Fixia lo cuida. Aquí está tu resumen de actividad.
            </p>
          </div>
          <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
            <Target className="mr-2 h-4 w-4" />
            Ver Oportunidades
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Servicios Completados",
            value: "127",
            change: "+23% este mes",
            icon: CheckCircle,
            color: "text-success",
            delay: 0.1
          },
          {
            title: "Ingresos Totales",
            value: "$33,640",
            change: "+38% este mes",
            icon: DollarSign,
            color: "text-primary",
            delay: 0.2
          },
          {
            title: "Rating Promedio",
            value: "4.9",
            change: "Excelente reputación",
            icon: Star,
            color: "text-warning",
            delay: 0.3
          },
          {
            title: "Tiempo de Respuesta",
            value: "2.3h",
            change: "30% más rápido",
            icon: Clock,
            color: "text-accent-foreground",
            delay: 0.4
          }
        ].map((stat, index) => (
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

      {/* Charts and Activity */}
      <div className="grid gap-6 md:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="md:col-span-8"
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Crecimiento de Servicios</span>
              </CardTitle>
              <CardDescription>
                Progreso mensual de servicios completados e ingresos generados
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={serviceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorServicios" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#764ba2" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Area
                      type="monotone"
                      dataKey="servicios"
                      stroke="#667eea"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorServicios)"
                    />
                    <Area
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#764ba2"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIngresos)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="md:col-span-4"
        >
          <Card className="glass border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-warning" />
                <span>Logros Recientes</span>
              </CardTitle>
              <CardDescription>
                Tus últimos hitos en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "🎯 Meta Alcanzada",
                  description: "100 servicios completados",
                  badge: "Nuevo",
                  color: "bg-success/20 text-success"
                },
                {
                  title: "⭐ Súper Profesional",
                  description: "Rating 4.9+ por 3 meses",
                  badge: "Logro",
                  color: "bg-warning/20 text-warning"
                },
                {
                  title: "🚀 Crecimiento Rápido",
                  description: "+200% en ingresos",
                  badge: "Tendencia",
                  color: "bg-primary/20 text-primary"
                },
                {
                  title: "💎 Top Vendedor",
                  description: "En categoría Desarrollo",
                  badge: "Élite",
                  color: "bg-purple-500/20 text-purple-400"
                }
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + (index * 0.1) }}
                  className="flex items-start space-x-3 p-3 rounded-lg glass-medium hover:glass-strong transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{achievement.title}</span>
                      <Badge className={`text-xs ${achievement.color} border-0`}>
                        {achievement.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
              
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}