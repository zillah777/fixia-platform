const fs = require('fs');
const path = require('path');

// Script para verificar el estado del sistema sin Playwright
async function quickHealthCheck() {
  console.log('🏥 Verificación Rápida de Salud del Sistema Fixia');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const results = {
    timestamp: new Date().toISOString(),
    frontend: { status: 'unknown', details: null },
    backend: { status: 'unknown', details: null },
    database: { status: 'unknown', details: null },
    files: { status: 'unknown', details: null }
  };

  // 1. Verificar Frontend (puerto 3000)
  try {
    console.log('🖥️ Verificando Frontend (puerto 3000)...');
    const response = await fetch('http://localhost:3000');
    results.frontend = {
      status: response.ok ? 'healthy' : 'unhealthy',
      details: `HTTP ${response.status}`
    };
    console.log(`   ✅ Frontend: ${results.frontend.details}`);
  } catch (error) {
    results.frontend = {
      status: 'down',
      details: error.message
    };
    console.log(`   ❌ Frontend: ${error.message}`);
  }

  // 2. Verificar Backend (puerto 5000)
  try {
    console.log('🔧 Verificando Backend (puerto 5000)...');
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    results.backend = {
      status: response.ok ? 'healthy' : 'unhealthy',
      details: data
    };
    console.log(`   ✅ Backend: ${JSON.stringify(data)}`);
  } catch (error) {
    results.backend = {
      status: 'down',
      details: error.message
    };
    console.log(`   ❌ Backend: ${error.message}`);
  }

  // 3. Verificar Database (indirectamente via backend)
  try {
    console.log('🗄️ Verificando Database...');
    const response = await fetch('http://localhost:5000/api/auth/check-db');
    results.database = {
      status: response.ok ? 'healthy' : 'unhealthy',
      details: `HTTP ${response.status}`
    };
    console.log(`   ✅ Database: Accesible via backend`);
  } catch (error) {
    results.database = {
      status: 'unknown',
      details: 'Cannot check via backend'
    };
    console.log(`   ⚠️ Database: No se puede verificar (${error.message})`);
  }

  // 4. Verificar archivos críticos
  console.log('📁 Verificando archivos críticos...');
  const criticalFiles = [
    '../frontend/package.json',
    '../backend/package.json',
    '../backend/.env',
    '../backend/src/config/database.js',
    '../frontend/src/pages/_app.tsx'
  ];

  let filesOk = 0;
  for (const file of criticalFiles) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      filesOk++;
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - MISSING`);
    }
  }

  results.files = {
    status: filesOk === criticalFiles.length ? 'healthy' : 'partial',
    details: `${filesOk}/${criticalFiles.length} archivos encontrados`
  };

  // 5. Generar resumen
  console.log('\\n📊 RESUMEN DE SALUD DEL SISTEMA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const services = ['frontend', 'backend', 'database', 'files'];
  let healthyCount = 0;
  
  services.forEach(service => {
    const result = results[service];
    const icon = result.status === 'healthy' ? '✅' : 
                 result.status === 'partial' ? '⚠️' : '❌';
    console.log(`${icon} ${service.toUpperCase()}: ${result.status} - ${result.details}`);
    
    if (result.status === 'healthy') healthyCount++;
  });

  const overallHealth = healthyCount === services.length ? 'EXCELENTE' :
                       healthyCount >= 3 ? 'BUENA' :
                       healthyCount >= 2 ? 'REGULAR' : 'CRÍTICA';

  console.log(`\\n🎯 SALUD GENERAL DEL SISTEMA: ${overallHealth} (${healthyCount}/${services.length})`);

  // 6. Recomendaciones
  console.log('\\n💡 RECOMENDACIONES:');
  if (results.frontend.status !== 'healthy') {
    console.log('   🔧 Ejecutar: cd frontend && npm run dev');
  }
  if (results.backend.status !== 'healthy') {
    console.log('   🔧 Ejecutar: cd backend && npm run dev');
  }
  if (results.database.status !== 'healthy') {
    console.log('   🔧 Verificar PostgreSQL: sudo service postgresql start');
  }
  if (results.files.status !== 'healthy') {
    console.log('   🔧 Verificar archivos faltantes y configuración');
  }

  // 7. Guardar reporte
  const reportPath = path.join(__dirname, 'health-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\\n📄 Reporte guardado en: ${reportPath}`);

  return results;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  quickHealthCheck().catch(error => {
    console.error('💥 Error en verificación de salud:', error);
    process.exit(1);
  });
}

module.exports = { quickHealthCheck };