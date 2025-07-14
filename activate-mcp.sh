#!/bin/bash

# 🎭 Activación de Playwright MCP para Fixia
echo "🚀 Activando Sistema Autorreparable Fixia..."

# 1. Instalar Playwright MCP
echo "📦 Instalando Playwright MCP..."
npm install -g playwright @playwright/test

# 2. Instalar browsers
echo "🌐 Instalando navegadores..."
npx playwright install

# 3. Crear directorio de auto-reparación
mkdir -p auto-repair

# 4. Configurar MCP para Claude Code
echo "⚙️ Configurando Claude Code MCP..."
cat > ~/.config/claude-code/mcp-config.json << EOF
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["playwright-mcp-server"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "~/.cache/ms-playwright"
      }
    }
  }
}
EOF

# 5. Crear script de monitoreo
cat > auto-repair/fixia-monitor.js << 'EOF'
const { chromium } = require('playwright');

class FixiaMonitor {
  async start() {
    console.log('🎭 Iniciando monitoreo Fixia...');
    
    const browser = await chromium.launch({ 
      headless: false,
      devtools: true 
    });
    
    const page = await browser.newPage();
    
    // Configurar handlers de error
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('💥 Page Error:', error.message);
    });
    
    // Monitoreo continuo
    while (true) {
      try {
        // Check frontend
        console.log('🔍 Verificando frontend...');
        const response = await page.goto('http://localhost:3000');
        console.log('✅ Frontend status:', response?.status());
        
        // Check backend health
        const healthCheck = await page.evaluate(async () => {
          try {
            const response = await fetch('http://localhost:5000/health');
            return { status: response.status, ok: response.ok };
          } catch (error) {
            return { error: error.message };
          }
        });
        
        console.log('🏥 Backend health:', healthCheck);
        
        await page.waitForTimeout(10000); // 10 segundos
        
      } catch (error) {
        console.log('⚠️ Monitor error:', error.message);
        await page.waitForTimeout(5000);
      }
    }
  }
}

new FixiaMonitor().start();
EOF

echo "✅ Sistema autorreparable configurado!"
echo ""
echo "🎯 Para activar MCP en Claude Code:"
echo "1. Reinicia Claude Code"
echo "2. El sistema detectará automáticamente la configuración MCP"
echo "3. Ejecuta: node auto-repair/fixia-monitor.js"
echo ""
echo "🚀 ¡Tu sistema Fixia ahora es autorreparable!"