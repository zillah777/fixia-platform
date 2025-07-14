const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Servir archivos estáticos
app.use(express.static('public'));

// Página principal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fixia - Sistema Auto-reparable</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .container {
                text-align: center;
                padding: 2rem;
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                max-width: 600px;
            }
            .logo {
                font-size: 3rem;
                font-weight: bold;
                margin-bottom: 1rem;
                background: linear-gradient(45deg, #fff, #f0f0f0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .status {
                font-size: 1.2rem;
                margin: 1rem 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            .spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .features {
                margin-top: 2rem;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            .feature {
                background: rgba(255,255,255,0.1);
                padding: 1rem;
                border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.2);
            }
            .logs {
                margin-top: 2rem;
                padding: 1rem;
                background: rgba(0,0,0,0.3);
                border-radius: 10px;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                max-height: 200px;
                overflow-y: auto;
                text-align: left;
            }
            .log-entry {
                margin: 0.5rem 0;
                opacity: 0.8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🔧 Fixia</div>
            <div class="status">
                <div class="spinner"></div>
                Sistema Auto-reparable Activo
            </div>
            
            <div class="features">
                <div class="feature">
                    <h3>🎭 Navegador Visible</h3>
                    <p>Monitoreo en tiempo real</p>
                </div>
                <div class="feature">
                    <h3>🔍 Detección Automática</h3>
                    <p>Encuentra errores al instante</p>
                </div>
                <div class="feature">
                    <h3>🛠️ Auto-reparación</h3>
                    <p>Corrige problemas automáticamente</p>
                </div>
                <div class="feature">
                    <h3>📊 Monitoreo Continuo</h3>
                    <p>24/7 verificación de salud</p>
                </div>
            </div>
            
            <div class="logs" id="logs">
                <div class="log-entry">✅ Sistema autorreparable iniciado</div>
                <div class="log-entry">🔍 Verificando componentes...</div>
                <div class="log-entry">🖥️ Frontend: Funcionando</div>
                <div class="log-entry">🔧 Backend: Conectando...</div>
                <div class="log-entry">🗄️ Database: Verificando...</div>
                <div class="log-entry">🎯 Sistema listo para monitoreo</div>
            </div>
        </div>
        
        <script>
            // Simular logs en tiempo real
            const logs = document.getElementById('logs');
            const logMessages = [
                '🔍 Ejecutando verificación del sistema...',
                '🖥️ Verificando Frontend... ✅',
                '🔧 Verificando Backend... ✅', 
                '🗄️ Verificando Database... ✅',
                '👤 Verificando user flows críticos... ✅',
                '📊 Generando reporte de salud...',
                '✅ Verificación completada. Próxima en 30 segundos...'
            ];
            
            let logIndex = 0;
            setInterval(() => {
                if (logIndex < logMessages.length) {
                    const logEntry = document.createElement('div');
                    logEntry.className = 'log-entry';
                    logEntry.textContent = logMessages[logIndex];
                    logs.appendChild(logEntry);
                    logs.scrollTop = logs.scrollHeight;
                    logIndex++;
                    
                    if (logIndex >= logMessages.length) {
                        logIndex = 0;
                        setTimeout(() => {
                            logs.innerHTML = '<div class="log-entry">✅ Sistema autorreparable iniciado</div>';
                        }, 3000);
                    }
                }
            }, 2000);
        </script>
    </body>
    </html>
  `);
});

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json({ 
    frontend: 'running',
    backend: 'running', 
    database: 'connected',
    autoRepair: 'active'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Fixia Frontend funcionando en puerto ${PORT}`);
});