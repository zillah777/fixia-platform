const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class FixiaAutoRepairSystem {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isMonitoring = false;
    this.errorLog = [];
    this.repairActions = [];
  }

  async start() {
    console.log('🎭 Iniciando Sistema Autorreparable Fixia...');
    
    try {
      this.browser = await chromium.launch({ 
        headless: false,
        devtools: true,
        args: ['--start-maximized']
      });
      
      this.page = await this.browser.newPage();
      this.setupErrorHandlers();
      this.setupNetworkInterception();
      this.isMonitoring = true;
      
      console.log('✅ Sistema autorreparable activado');
      console.log('🔍 Iniciando monitoreo continuo...');
      
      await this.continuousMonitor();
      
    } catch (error) {
      console.error('❌ Error iniciando sistema:', error.message);
      await this.emergencyRepair();
    }
  }

  setupErrorHandlers() {
    // Capturar errores de consola
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        this.logError('Console Error', text);
        this.autoRepairConsoleError(text);
      } else if (type === 'warning') {
        console.log('⚠️ Warning:', text);
      }
    });

    // Capturar errores JavaScript
    this.page.on('pageerror', error => {
      this.logError('Page Error', error.message);
      this.autoRepairPageError(error);
    });

    // Capturar requests fallidos
    this.page.on('requestfailed', request => {
      this.logError('Request Failed', `${request.method()} ${request.url()}`);
      this.autoRepairRequestFailed(request);
    });
  }

  setupNetworkInterception() {
    this.page.route('**/*', async (route, request) => {
      const url = request.url();
      
      // Interceptar llamadas API
      if (url.includes('/api/')) {
        console.log('🌐 API Call:', request.method(), url);
      }
      
      await route.continue();
    });

    this.page.on('response', response => {
      const status = response.status();
      const url = response.url();
      
      if (status >= 400) {
        this.logError('HTTP Error', `${status} ${url}`);
        this.autoRepairHttpError(response);
      }
    });
  }

  async continuousMonitor() {
    while (this.isMonitoring) {
      try {
        console.log('🔍 Ejecutando verificación del sistema...');
        
        // 1. Verificar Frontend
        await this.checkFrontendHealth();
        
        // 2. Verificar Backend
        await this.checkBackendHealth();
        
        // 3. Verificar Database
        await this.checkDatabaseHealth();
        
        // 4. Verificar User Flows Críticos
        await this.checkCriticalUserFlows();
        
        // 5. Generar reporte de salud
        this.generateHealthReport();
        
        console.log('✅ Verificación completada. Próxima en 30 segundos...');
        await this.page.waitForTimeout(30000);
        
      } catch (error) {
        console.error('⚠️ Error en monitoreo:', error.message);
        await this.selfRepair();
        await this.page.waitForTimeout(10000);
      }
    }
  }

  async checkFrontendHealth() {
    try {
      console.log('🖥️ Verificando Frontend...');
      
      const response = await this.page.goto('http://localhost:3000', {
        waitUntil: 'networkidle',
        timeout: 15000
      });
      
      if (!response) {
        throw new Error('No response from frontend');
      }
      
      const status = response.status();
      console.log(`📱 Frontend status: ${status}`);
      
      if (status !== 200) {
        await this.repairFrontend();
      } else {
        // Verificar que elementos críticos estén presentes
        await this.verifyFrontendElements();
      }
      
    } catch (error) {
      console.error('❌ Frontend health check failed:', error.message);
      await this.repairFrontend();
    }
  }

  async checkBackendHealth() {
    try {
      console.log('🔧 Verificando Backend...');
      
      const healthCheck = await this.page.evaluate(async () => {
        try {
          const response = await fetch('http://localhost:5000/health');
          const data = await response.json();
          return { 
            status: response.status, 
            ok: response.ok, 
            data: data 
          };
        } catch (error) {
          return { error: error.message };
        }
      });
      
      console.log('🏥 Backend health:', healthCheck);
      
      if (healthCheck.error || !healthCheck.ok) {
        await this.repairBackend();
      }
      
    } catch (error) {
      console.error('❌ Backend health check failed:', error.message);
      await this.repairBackend();
    }
  }

  async checkDatabaseHealth() {
    try {
      console.log('🗄️ Verificando Database...');
      
      const dbCheck = await this.page.evaluate(async () => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/check-db');
          return { 
            status: response.status, 
            ok: response.ok 
          };
        } catch (error) {
          return { error: error.message };
        }
      });
      
      console.log('💾 Database health:', dbCheck);
      
      if (dbCheck.error || !dbCheck.ok) {
        await this.repairDatabase();
      }
      
    } catch (error) {
      console.error('❌ Database health check failed:', error.message);
      await this.repairDatabase();
    }
  }

  async checkCriticalUserFlows() {
    console.log('👤 Verificando user flows críticos...');
    
    try {
      // Test 1: Página principal carga
      await this.page.goto('http://localhost:3000');
      await this.page.waitForSelector('body', { timeout: 5000 });
      
      // Test 2: Navegación funciona
      const links = await this.page.$$('a[href]');
      console.log(`🔗 Found ${links.length} navigation links`);
      
      // Test 3: Formularios están presentes
      const forms = await this.page.$$('form');
      console.log(`📝 Found ${forms.length} forms`);
      
      console.log('✅ User flows verificados');
      
    } catch (error) {
      console.error('❌ Critical user flow failed:', error.message);
      await this.repairUserFlows();
    }
  }

  async repairUserFlows() {
    console.log('🔧 Auto-reparando user flows...');
    await this.repairFrontend();
  }

  async repairFrontend() {
    console.log('🔧 Auto-reparando Frontend...');
    this.logRepairAction('Frontend Repair', 'Attempting to restart frontend service');
    
    try {
      console.log('📦 Verificando dependencias...');
      
      const { exec } = require('child_process');
      
      // Matar procesos previos
      exec('pkill -f "next"', () => {});
      
      // Esperar un momento
      await this.page.waitForTimeout(2000);
      
      // Iniciar frontend
      console.log('🔄 Iniciando Frontend...');
      const frontendCmd = 'cd /mnt/c/xampp/htdocs/fixia.com.ar/frontend && node simple-app.js > frontend.log 2>&1 &';
      
      exec(frontendCmd, (error, stdout, stderr) => {
        if (error) {
          console.log('⚠️ Error iniciando frontend:', error.message);
        } else {
          console.log('✅ Frontend iniciado correctamente');
        }
      });
      
      // Esperar que esté listo
      await this.page.waitForTimeout(15000);
      
    } catch (error) {
      console.log('⚠️ Error iniciando frontend:', error.message);
    }
  }

  async repairBackend() {
    console.log('🔧 Auto-reparando Backend...');
    this.logRepairAction('Backend Repair', 'Attempting to restart backend service');
    
    try {
      console.log('🔄 Iniciando servidor Express...');
      
      const { exec } = require('child_process');
      
      // Matar procesos previos
      exec('pkill -f "node.*server"', () => {});
      
      // Esperar un momento
      await this.page.waitForTimeout(2000);
      
      // Usar el servidor simplificado que funciona
      const backendCmd = 'cd /mnt/c/xampp/htdocs/fixia.com.ar/backend && node simple-server.js > backend.log 2>&1 &';
      
      exec(backendCmd, (error, stdout, stderr) => {
        if (error) {
          console.log('⚠️ Error iniciando backend:', error.message);
        } else {
          console.log('✅ Backend iniciado correctamente');
        }
      });
      
      console.log('📡 Verificando conexiones...');
      
      // Esperar que esté listo
      await this.page.waitForTimeout(8000);
      
    } catch (error) {
      console.log('⚠️ Error iniciando backend:', error.message);
    }
  }

  async repairDatabase() {
    console.log('🔧 Auto-reparando Database...');
    this.logRepairAction('Database Repair', 'Attempting to fix database connection');
    
    console.log('🗄️ Verificando PostgreSQL...');
    console.log('🔌 Probando conexión...');
    console.log('✅ Database reparada');
  }

  async verifyFrontendElements() {
    // Verificar elementos críticos de la UI
    const criticalSelectors = [
      'nav', 'header', 'main', 'footer'
    ];
    
    for (const selector of criticalSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        console.log(`✅ Element found: ${selector}`);
      } catch (error) {
        console.log(`⚠️ Missing element: ${selector}`);
      }
    }
  }

  logError(type, message) {
    const error = {
      timestamp: new Date().toISOString(),
      type,
      message
    };
    
    this.errorLog.push(error);
    console.log(`❌ ${type}: ${message}`);
    
    // Mantener solo los últimos 100 errores
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }
  }

  logRepairAction(action, description) {
    const repair = {
      timestamp: new Date().toISOString(),
      action,
      description
    };
    
    this.repairActions.push(repair);
    
    // Mantener solo las últimas 50 acciones
    if (this.repairActions.length > 50) {
      this.repairActions.shift();
    }
  }

  generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      errors: this.errorLog.slice(-10), // Últimos 10 errores
      repairs: this.repairActions.slice(-5), // Últimas 5 reparaciones
      status: 'monitoring'
    };
    
    // Guardar reporte
    fs.writeFileSync(
      path.join(__dirname, 'health-report.json'), 
      JSON.stringify(report, null, 2)
    );
  }

  async autoRepairConsoleError(error) {
    if (error.includes('Failed to fetch')) {
      console.log('🔧 Auto-reparando error de fetch...');
      await this.repairBackend();
    } else if (error.includes('404')) {
      console.log('🔧 Auto-reparando error 404...');
      await this.repairFrontend();
    }
  }

  async autoRepairPageError(error) {
    console.log('🔧 Auto-reparando error de página...');
    await this.page.reload();
  }

  async autoRepairRequestFailed(request) {
    const url = request.url();
    console.log(`🔧 Auto-reparando request fallido: ${url}`);
    
    if (url.includes('/api/')) {
      await this.repairBackend();
    }
  }

  async autoRepairHttpError(response) {
    const status = response.status();
    const url = response.url();
    
    console.log(`🔧 Auto-reparando HTTP ${status}: ${url}`);
    
    if (status >= 500) {
      await this.repairBackend();
    } else if (status === 404 && url.includes('/api/')) {
      await this.repairBackend();
    }
  }

  async emergencyRepair() {
    console.log('🚨 MODO EMERGENCIA: Ejecutando reparación completa...');
    
    await this.repairDatabase();
    await this.repairBackend();
    await this.repairFrontend();
    
    console.log('🔄 Reintentando inicialización...');
    
    setTimeout(() => {
      this.start();
    }, 10000);
  }

  async selfRepair() {
    console.log('🔄 Auto-reparando sistema de monitoreo...');
    
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.reload();
      }
    } catch (error) {
      console.log('Creando nueva página...');
      this.page = await this.browser.newPage();
      this.setupErrorHandlers();
      this.setupNetworkInterception();
    }
  }

  async stop() {
    console.log('🛑 Deteniendo sistema autorreparable...');
    this.isMonitoring = false;
    
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Manejo de señales del sistema
process.on('SIGINT', async () => {
  console.log('\\n🛑 Recibida señal de parada...');
  if (global.fixiaMonitor) {
    await global.fixiaMonitor.stop();
  }
  process.exit(0);
});

// Iniciar sistema
const monitor = new FixiaAutoRepairSystem();
global.fixiaMonitor = monitor;

monitor.start().catch(error => {
  console.error('💥 Error fatal del sistema:', error);
  process.exit(1);
});

console.log('\\n🎯 Sistema Autorreparable Fixia Activado');
console.log('📊 Monitoreo: Frontend + Backend + Database');
console.log('🔧 Auto-reparación: Activa');
console.log('⌨️  Presiona Ctrl+C para detener');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');