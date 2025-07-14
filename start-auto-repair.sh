#!/bin/bash

echo "🎭 Iniciando Sistema Autorreparable Fixia..."

# Verificar que Playwright esté instalado
if ! command -v npx playwright &> /dev/null; then
    echo "❌ Playwright no encontrado. Instalando..."
    npm install -g playwright
    npx playwright install
fi

# Ir al directorio de auto-reparación
cd /mnt/c/xampp/htdocs/fixia.com.ar/auto-repair

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo "🚀 Iniciando monitoreo visual..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 El navegador se abrirá automáticamente"
echo "📱 Verás la aplicación Fixia en tiempo real"
echo "🔧 Auto-reparación activada"
echo "⌨️  Presiona Ctrl+C para detener"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Iniciar el sistema de monitoreo
node fixia-monitor.js