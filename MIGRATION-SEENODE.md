# Migración de Fixia Backend a SeeNode.com

## 📋 Guía Completa de Migración

Esta guía te llevará paso a paso para migrar el backend de Fixia.com.ar desde Railway (o cualquier otro proveedor) a SeeNode.com de manera segura y sin downtime.

## 🎯 Pre-requisitos

### Cuentas y Servicios Necesarios
- [x] Cuenta en SeeNode.com
- [x] Acceso al repositorio GitHub de Fixia
- [x] Base de datos PostgreSQL (SeeNode add-on o externa)
- [x] Cuenta de Redis (opcional - SeeNode add-on)
- [x] Claves de servicios externos (SendGrid, Sentry, MercadoPago)

### Herramientas Requeridas
```bash
# Instalar SeeNode CLI
npm install -g @seenode/cli

# Verificar instalación
seenode --version
```

## 🚀 Paso 1: Preparación en SeeNode

### 1.1 Crear Nueva Aplicación
```bash
# Autenticarse en SeeNode
seenode login

# Crear nueva aplicación
seenode create fixia-backend \
  --runtime nodejs \
  --version 18 \
  --region us-east-1
```

### 1.2 Configurar Base de Datos
```bash
# Agregar PostgreSQL add-on
seenode addons create postgresql:standard \
  --app fixia-backend

# Obtener URL de conexión
seenode config --app fixia-backend
```

### 1.3 Configurar Redis (Opcional)
```bash
# Agregar Redis add-on
seenode addons create redis:basic \
  --app fixia-backend
```

## 🔧 Paso 2: Configuración de Variables de Entorno

### 2.1 Variables Críticas
```bash
# Variables core (REQUERIDAS)
seenode config:set DATABASE_URL="postgresql://..." --app fixia-backend
seenode config:set JWT_SECRET="your-64-char-secret" --app fixia-backend
seenode config:set NODE_ENV="production" --app fixia-backend

# Variables de integración
seenode config:set SENDGRID_API_KEY="your-key" --app fixia-backend
seenode config:set SENTRY_DSN="your-dsn" --app fixia-backend
seenode config:set MERCADOPAGO_ACCESS_TOKEN="your-token" --app fixia-backend
```

### 2.2 Variables Opcionales
```bash
# Redis (si usas el add-on)
seenode config:set REDIS_URL="redis://..." --app fixia-backend

# Dominio personalizado
seenode config:set FRONTEND_URL="https://fixia.com.ar" --app fixia-backend
seenode config:set CORS_ORIGIN="https://fixia.com.ar,https://www.fixia.com.ar" --app fixia-backend
```

## 📦 Paso 3: Deployment

### 3.1 Deployment Manual (Primera vez)
```bash
# Desde el directorio backend/
seenode deploy \
  --app fixia-backend \
  --dockerfile Dockerfile.seenode \
  --config seenode.config.js
```

### 3.2 Verificar Deployment
```bash
# Verificar estado
seenode ps --app fixia-backend

# Ver logs
seenode logs --app fixia-backend --tail

# Health check
curl https://your-app.seenode.com/health
```

## 🗄️ Paso 4: Migración de Base de Datos

### 4.1 Backup de Datos Actuales
```bash
# Desde tu proveedor actual (ej: Railway)
pg_dump $CURRENT_DATABASE_URL > fixia_backup.sql
```

### 4.2 Importar a SeeNode
```bash
# Obtener nueva DATABASE_URL de SeeNode
SEENODE_DB_URL=$(seenode config:get DATABASE_URL --app fixia-backend)

# Importar datos
psql $SEENODE_DB_URL < fixia_backup.sql
```

### 4.3 Ejecutar Migraciones
```bash
# Conectar a la aplicación y ejecutar migraciones
seenode run "npm run seenode:migrate" --app fixia-backend

# Optimizar base de datos
seenode run "npm run seenode:optimize" --app fixia-backend
```

## 🌐 Paso 5: Configuración de Dominio

### 5.1 Dominio Personalizado
```bash
# Agregar dominio
seenode domains:add api.fixia.com.ar --app fixia-backend

# Verificar DNS
seenode domains --app fixia-backend
```

### 5.2 Configurar SSL
```bash
# SeeNode auto-configura SSL
# Verificar estado SSL
seenode domains:ssl api.fixia.com.ar --app fixia-backend
```

## ⚡ Paso 6: Optimización de Performance

### 6.1 Configurar Auto-scaling
```bash
# Configurar scaling automático
seenode autoscale:enable --app fixia-backend \
  --min 2 \
  --max 10 \
  --cpu-threshold 80
```

### 6.2 Configurar Monitoring
```bash
# Habilitar métricas
seenode metrics:enable --app fixia-backend

# Configurar alertas
seenode alerts:add \
  --metric cpu \
  --threshold 90 \
  --email tu-email@fixia.com.ar \
  --app fixia-backend
```

## 🔄 Paso 7: CI/CD Integration

### 7.1 GitHub Secrets
Agregar estos secrets en tu repositorio GitHub:

```
SEENODE_TOKEN=your-seenode-api-token
SEENODE_APP_ID=fixia-backend
SEENODE_DEPLOYMENT_URL=https://your-app.seenode.com
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
SENDGRID_API_KEY=your-sendgrid-key
SENTRY_DSN=your-sentry-dsn
REDIS_URL=redis://... (opcional)
MERCADOPAGO_ACCESS_TOKEN=your-mp-token
```

### 7.2 Habilitar Auto-deploy
```bash
# Conectar GitHub repository
seenode github:connect --app fixia-backend \
  --repo zillah777/fixia-platform \
  --branch main
```

## 🧪 Paso 8: Testing y Validación

### 8.1 Tests de Funcionalidad
```bash
# Health check
curl https://your-app.seenode.com/health

# API endpoints
curl https://your-app.seenode.com/api/services?limit=5

# Sistema status
curl https://your-app.seenode.com/api/system/status
```

### 8.2 Tests de Performance
```bash
# Load testing básico
ab -n 100 -c 10 https://your-app.seenode.com/health

# Monitoreo de métricas
seenode metrics --app fixia-backend
```

## 🔄 Paso 9: Cambio de DNS (Go Live)

### 9.1 Actualizar DNS
```bash
# Cambiar A record de api.fixia.com.ar
# De: old-provider-ip
# A: seenode-ip (obtenido del dashboard)

# Verificar propagación
dig api.fixia.com.ar
```

### 9.2 Testing Post-cambio
```bash
# Verificar nuevo endpoint
curl https://api.fixia.com.ar/health

# Verificar todas las funcionalidades
curl https://api.fixia.com.ar/api/system/status
```

## 📊 Paso 10: Monitoreo Post-migración

### 10.1 Monitoreo Inmediato (24h)
- [x] Verificar logs cada hora
- [x] Monitorear métricas de performance
- [x] Verificar funcionamiento de todas las APIs
- [x] Confirmar funcionamiento de webhooks

### 10.2 Monitoreo a Largo Plazo
```bash
# Configurar dashboards
seenode dashboard:create fixia-production --app fixia-backend

# Alertas críticas
seenode alerts:add --metric error-rate --threshold 5 --app fixia-backend
seenode alerts:add --metric response-time --threshold 2000 --app fixia-backend
```

## 🚨 Plan de Rollback

### En caso de problemas críticos:

1. **Rollback DNS inmediato**
   ```bash
   # Cambiar DNS de vuelta al proveedor anterior
   # TTL bajo permite cambio rápido
   ```

2. **Verificar proveedor anterior**
   ```bash
   # Asegurar que el servicio anterior sigue funcionando
   curl https://old-provider-url/health
   ```

3. **Comunicar el rollback**
   ```bash
   # Notificar al equipo y usuarios si es necesario
   ```

## ✅ Checklist de Migración

### Pre-migración
- [ ] Backup completo de base de datos
- [ ] Lista de todas las variables de entorno
- [ ] Documentación de servicios externos
- [ ] Plan de rollback definido

### Durante la migración
- [ ] Aplicación desplegada en SeeNode
- [ ] Base de datos migrada y validada
- [ ] Variables de entorno configuradas
- [ ] Tests de funcionalidad pasando
- [ ] Performance acceptable

### Post-migración
- [ ] DNS actualizado
- [ ] Monitoring configurado
- [ ] Alertas activas
- [ ] Team notificado
- [ ] Documentación actualizada

## 📞 Soporte y Recursos

### SeeNode Resources
- Dashboard: https://dashboard.seenode.com
- Documentación: https://docs.seenode.com
- Support: support@seenode.com

### Comandos Útiles
```bash
# Ver estado general
seenode status --app fixia-backend

# Logs en tiempo real
seenode logs --app fixia-backend --tail

# Escalar manualmente
seenode scale --app fixia-backend --replicas 3

# Reiniciar aplicación
seenode restart --app fixia-backend

# Ejecutar comandos
seenode run "npm run db:stats" --app fixia-backend
```

---

**🎉 ¡Listo! Tu backend de Fixia ahora está corriendo en SeeNode.com con todas las optimizaciones implementadas.**