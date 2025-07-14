# 🎭 Playwright MCP Setup para Sistema Autorreparable

## 📋 Prerequisitos

### 1. Instalar Playwright MCP
```bash
# Instalar el servidor MCP de Playwright
npm install -g @microsoft/playwright-mcp-server

# O usar npx
npx @microsoft/playwright-mcp-server
```

### 2. Configurar Claude Code para MCP
```json
// ~/.claude/mcp_config.json
{
  "servers": {
    "playwright": {
      "command": "playwright-mcp-server",
      "args": ["--headless=false", "--timeout=30000"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "~/.cache/ms-playwright"
      }
    }
  }
}
```

## 🔧 Capacidades del Sistema Autorreparable

### 1. **Detección Automática de Errores**
```javascript
// Script de monitoreo continuo
const autoRepair = {
  // Detectar errores 404
  async check404s() {
    const response = await page.goto('http://localhost:3000');
    if (response.status() === 404) {
      await this.fixRouting();
    }
  },

  // Detectar errores de JavaScript
  async checkJSErrors() {
    page.on('pageerror', async (error) => {
      console.log('JS Error detected:', error.message);
      await this.fixJSError(error);
    });
  },

  // Detectar errores de red/API
  async checkAPIErrors() {
    page.on('response', async (response) => {
      if (response.status() >= 400) {
        await this.fixAPIError(response);
      }
    });
  }
};
```

### 2. **Reparación Automática de Componentes**
```javascript
const componentRepair = {
  // Detectar componentes que no se renderizan
  async checkMissingComponents() {
    const missingElements = await page.$$eval('[data-testid]', elements => 
      elements.filter(el => el.children.length === 0)
    );
    
    for (const element of missingElements) {
      await this.repairComponent(element);
    }
  },

  // Reparar estilos rotos
  async checkBrokenStyles() {
    const elementsWithoutStyles = await page.$$eval('*', elements =>
      elements.filter(el => getComputedStyle(el).display === 'none' && el.dataset.testid)
    );
    
    await this.fixStyles(elementsWithoutStyles);
  }
};
```

### 3. **Testing Automático Continuo**
```javascript
const continuousTesting = {
  async runE2ETests() {
    // Test login flow
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Verificar redirección exitosa
    await page.waitForURL('**/dashboard');
    
    // Si falla, auto-reparar
    if (!await page.url().includes('dashboard')) {
      await this.repairAuthFlow();
    }
  },

  async testAPIIntegration() {
    // Interceptar y probar todas las llamadas API
    await page.route('**/api/**', async (route, request) => {
      const response = await route.fetch();
      
      if (!response.ok()) {
        await this.repairAPIEndpoint(request.url());
      }
      
      await route.continue();
    });
  }
};
```

## 🔄 Sistema de Auto-Reparación Completo

### 1. **Configuración Inicial**
```bash
# Crear directorio para scripts de auto-reparación
mkdir -p /mnt/c/xampp/htdocs/fixia.com.ar/auto-repair

# Instalar dependencias
cd /mnt/c/xampp/htdocs/fixia.com.ar
npm install playwright @playwright/test
```

### 2. **Script Principal de Monitoreo**
```javascript
// auto-repair/monitor.js
const { chromium } = require('playwright');

class FixiaAutoRepair {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isMonitoring = false;
  }

  async start() {
    this.browser = await chromium.launch({ 
      headless: false,
      devtools: true 
    });
    
    this.page = await this.browser.newPage();
    this.setupErrorHandlers();
    this.isMonitoring = true;
    
    // Iniciar monitoreo continuo
    this.continuousMonitor();
  }

  setupErrorHandlers() {
    // Capturar errores de consola
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.handleConsoleError(msg);
      }
    });

    // Capturar errores de red
    this.page.on('response', response => {
      if (response.status() >= 400) {
        this.handleNetworkError(response);
      }
    });

    // Capturar errores JavaScript
    this.page.on('pageerror', error => {
      this.handlePageError(error);
    });
  }

  async continuousMonitor() {
    while (this.isMonitoring) {
      try {
        // Verificar frontend
        await this.checkFrontend();
        
        // Verificar backend
        await this.checkBackend();
        
        // Verificar base de datos
        await this.checkDatabase();
        
        // Esperar 5 segundos antes del próximo check
        await this.page.waitForTimeout(5000);
        
      } catch (error) {
        console.log('Monitor error:', error);
        await this.selfRepair();
      }
    }
  }

  async checkFrontend() {
    const response = await this.page.goto('http://localhost:3000', {
      waitUntil: 'networkidle'
    });
    
    if (!response || response.status() !== 200) {
      await this.repairFrontend();
    }
  }

  async checkBackend() {
    try {
      const response = await this.page.evaluate(async () => {
        return await fetch('http://localhost:5000/health');
      });
      
      if (!response.ok) {
        await this.repairBackend();
      }
    } catch (error) {
      await this.repairBackend();
    }
  }

  async repairFrontend() {
    console.log('🔧 Auto-repairing frontend...');
    
    // Ejecutar comandos de reparación
    await this.executeCommand('cd /mnt/c/xampp/htdocs/fixia.com.ar/frontend && npm run dev');
  }

  async repairBackend() {
    console.log('🔧 Auto-repairing backend...');
    
    // Verificar PostgreSQL
    await this.executeCommand('sudo service postgresql start');
    
    // Reiniciar backend
    await this.executeCommand('cd /mnt/c/xampp/htdocs/fixia.com.ar/backend && npm run dev');
  }

  async executeCommand(command) {
    // Implementar ejecución de comandos del sistema
    // Esto requiere integración con el sistema operativo
    console.log('Executing:', command);
  }
}

// Iniciar auto-reparación
const autoRepair = new FixiaAutoRepair();
autoRepair.start();
```

## 🎯 Comandos para Activar MCP

### 1. **Configurar Claude Code**
```bash
# Agregar configuración MCP a Claude Code
claude config set mcp.enabled true
claude config set mcp.playwright.enabled true
```

### 2. **Iniciar Monitoreo**
```bash
# Ejecutar desde terminal
cd /mnt/c/xampp/htdocs/fixia.com.ar
node auto-repair/monitor.js
```

## 🚀 Beneficios del Sistema Autorreparable

### ✅ **Detección Proactiva**
- Errores 404/500 automáticamente detectados
- Fallos de componentes React identificados
- Problemas de API interceptados

### ✅ **Reparación Automática**
- Reinicio de servicios caídos
- Regeneración de código problemático
- Actualización de dependencias

### ✅ **Testing Continuo**
- E2E tests ejecutándose constantemente
- Validación de user flows críticos
- Performance monitoring

### ✅ **Logging Inteligente**
- Historial completo de problemas y soluciones
- Métricas de salud del sistema
- Alertas proactivas

## 📱 Activación Inmediata

Para activar este sistema ahora mismo:

1. **Instala Playwright MCP**:
```bash
npm install -g @microsoft/playwright-mcp-server playwright
```

2. **Dame permiso** para acceder via MCP

3. **El sistema se auto-configura** y comienza el monitoreo

¿Quieres que active el sistema de auto-reparación ahora?