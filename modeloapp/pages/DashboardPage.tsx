import { FixiaNavigation } from "../components/FixiaNavigation";
import { FixiaHeroPanel } from "../components/FixiaHeroPanel";
import { FixiaSummaryCards } from "../components/FixiaSummaryCards";
import { FixiaServicesTable } from "../components/FixiaServicesTable";
import { motion } from "motion/react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <FixiaNavigation />
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-12">
        {/* Hero Panel */}
        <FixiaHeroPanel />
        
        {/* Summary Cards */}
        <FixiaSummaryCards />
        
        {/* Services Table */}
        <FixiaServicesTable />
        
        {/* Footer with Fixia branding */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="text-center py-8 border-t border-white/10"
        >
          <div className="glass-medium rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="h-8 w-8 liquid-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <div>
                <div className="font-semibold">Fixia</div>
                <div className="text-xs text-muted-foreground">Conecta. Confía. Resuelve.</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu tiempo vale. Fixia lo cuida. Marketplace de microservicios diseñado para conectar 
              profesionales altamente calificados con usuarios que necesitan soluciones efectivas.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-muted-foreground">
              <span>© 2025 Fixia</span>
              <span>•</span>
              <span>Profesionales reales, resultados concretos</span>
              <span>•</span>
              <span>Transparencia líquida</span>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}