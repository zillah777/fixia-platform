/**
 * iOS Bottom Navigation Demo Component
 * 
 * This file demonstrates how to use the iOS-style bottom navigation
 * with different user types and configurations.
 * 
 * Usage examples for Fixia marketplace platform:
 * - AS (Provider) users: Dashboard, Services, Opportunities, Messages, Profile
 * - Explorador (Client) users: Dashboard, Search, Requests, Messages, Profile
 * - Unauthenticated users: Home, Explore, How it Works, Login
 */

import React from 'react';
import { MarketplaceLayout } from '@/components/layouts/MarketplaceLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const IOSNavigationDemo: React.FC = () => {
  return (
    <MarketplaceLayout 
      title="iOS Navigation Demo - Fixia"
      description="Demonstração da navegação iOS para dispositivos móveis"
      showBottomNav={true}
    >
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            iOS-Style Navigation Demo
          </h1>
          <p className="text-white/80 text-lg">
            Navegação móvel inspirada en iOS para la plataforma Fixia
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* AS Professional Navigation */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">Navegación AS (Profesionales)</CardTitle>
            </CardHeader>
            <CardContent className="text-white/80">
              <ul className="space-y-2">
                <li>🏠 <strong>Inicio:</strong> Panel de control principal</li>
                <li>💼 <strong>Servicios:</strong> Gestionar mis servicios</li>
                <li>👁️ <strong>Oportunidades:</strong> Ver nuevas oportunidades (con badge)</li>
                <li>💬 <strong>Mensajes:</strong> Chat con clientes (con badge)</li>
                <li>👤 <strong>Perfil:</strong> Perfil profesional</li>
              </ul>
            </CardContent>
          </Card>

          {/* Explorer Client Navigation */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">Navegación Explorador (Clientes)</CardTitle>
            </CardHeader>
            <CardContent className="text-white/80">
              <ul className="space-y-2">
                <li>🏠 <strong>Inicio:</strong> Panel de control principal</li>
                <li>🔍 <strong>Buscar:</strong> Buscar servicios profesionales</li>
                <li>📅 <strong>Mis Servicios:</strong> Solicitudes de servicio</li>
                <li>💬 <strong>Mensajes:</strong> Chat con profesionales (con badge)</li>
                <li>👤 <strong>Perfil:</strong> Perfil personal</li>
              </ul>
            </CardContent>
          </Card>

          {/* Guest Navigation */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">Navegación Invitado</CardTitle>
            </CardHeader>
            <CardContent className="text-white/80">
              <ul className="space-y-2">
                <li>🏠 <strong>Inicio:</strong> Página principal</li>
                <li>🔍 <strong>Explorar:</strong> Ver servicios disponibles</li>
                <li>⭐ <strong>Cómo Funciona:</strong> Información sobre Fixia</li>
                <li>👤 <strong>Ingresar:</strong> Login o registro</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white">Características iOS</CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">🎨 Diseño iOS Auténtico</h4>
                <ul className="text-sm space-y-1">
                  <li>• Glass morphism con blur saturado</li>
                  <li>• Transiciones suaves y naturales</li>
                  <li>• Safe area support para iPhone</li>
                  <li>• Indicador home estilo iOS</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">♿ Accesibilidad</h4>
                <ul className="text-sm space-y-1">
                  <li>• Soporte para lectores de pantalla</li>
                  <li>• Navegación por teclado</li>
                  <li>• Respeta preferencias de movimiento reducido</li>
                  <li>• Etiquetas ARIA descriptivas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📱 Optimización Móvil</h4>
                <ul className="text-sm space-y-1">
                  <li>• Solo visible en dispositivos móviles</li>
                  <li>• Auto-hide en scroll (opcional)</li>
                  <li>• Targets de toque iOS-friendly</li>
                  <li>• Vibración háptica simulada</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔔 Notificaciones</h4>
                <ul className="text-sm space-y-1">
                  <li>• Badges para mensajes nuevos</li>
                  <li>• Contadores de oportunidades</li>
                  <li>• Animaciones de entrada suaves</li>
                  <li>• Contexto dinámico por usuario</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Guide */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white">Implementación</CardTitle>
          </CardHeader>
          <CardContent className="text-white/80">
            <div className="bg-black/20 rounded-lg p-4 font-mono text-sm">
              <div className="text-green-400 mb-2">// En cualquier layout:</div>
              <div className="text-blue-300">
                {`<MarketplaceLayout showBottomNav={true}>`}
                <br />
                <span className="ml-4 text-white">{`{children}`}</span>
                <br />
                {`</MarketplaceLayout>`}
              </div>
              <br />
              <div className="text-green-400 mb-2">// O importar directamente:</div>
              <div className="text-blue-300">
                {`import { IOSBottomNavigation } from '@/components/ui';`}
                <br />
                {`<IOSBottomNavigation />`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spacer for bottom navigation */}
        <div className="h-20 md:hidden" aria-hidden="true">
          <p className="text-center text-white/60 text-sm pt-8">
            ⬇️ Navegación iOS aparece aquí en móviles
          </p>
        </div>
      </div>
    </MarketplaceLayout>
  );
};

export default IOSNavigationDemo;