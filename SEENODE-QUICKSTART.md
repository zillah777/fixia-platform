# 🚀 SeeNode Deployment - Guía Rápida para Fixia

## ✅ Pasos Inmediatos para Deployment

### 1. Crear cuenta en SeeNode
1. Ve a **https://www.seenode.com**
2. Regístrate o inicia sesión
3. Conecta tu cuenta de GitHub

### 2. Crear Nueva Aplicación
1. Click **"New App"** o **"Create Application"**
2. Configurar:
   ```
   App Name: fixia-backend
   Runtime: Node.js 18
   Repository: zillah777/fixia-platform
   Directory: /backend
   Branch: main
   ```

### 3. Configurar Build Settings
```bash
# Build Command:
npm ci --production

# Start Command:
node server.js

# Dockerfile (opcional):
Dockerfile.seenode
```

### 4. Variables de Entorno CRÍTICAS
**⚠️ Configurar ANTES del primer deployment:**

```bash
# CORE (OBLIGATORIAS):
NODE_ENV=production
PORT=5000
JWT_SECRET=tu-jwt-secret-de-64-caracteres-minimo

# DATABASE (de SeeNode PostgreSQL add-on):
DATABASE_URL=postgresql://user:pass@host:5432/db
DB_HOST=tu-postgres-host
DB_NAME=fixia_production  
DB_USER=fixia_user
DB_PASSWORD=tu-password-seguro
DB_SSL=true

# FRONTEND:
FRONTEND_URL=https://fixia.com.ar
CORS_ORIGIN=https://fixia.com.ar,https://www.fixia.com.ar
```

### 5. Add-ons Recomendados
```bash
# En SeeNode Dashboard > Add-ons:
✅ PostgreSQL (Standard) - Para base de datos
✅ Redis (Basic) - Para cache y performance (opcional)
```

### 6. Deployment
```bash
# Una vez configurado todo:
git push origin main

# SeeNode detectará el push y hará auto-deploy
# Ver progreso en Dashboard > Deployments
```

### 7. Verificación Post-Deployment
```bash
# Health check:
curl https://tu-app.seenode.com/health

# API test:
curl https://tu-app.seenode.com/api/services?limit=5

# System status:
curl https://tu-app.seenode.com/api/system/status
```

## 🔧 Configuración de Dominio Personalizado

### 1. En SeeNode Dashboard
```bash
# Domains > Add Custom Domain:
api.fixia.com.ar
```

### 2. Configurar DNS
```bash
# En tu proveedor DNS (ej: Cloudflare):
Type: CNAME
Name: api
Value: tu-app.seenode.com
TTL: Auto
```

## 🚨 Variables de Entorno Completas

**Copia y configura en SeeNode Dashboard:**

```env
# === CORE ===
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret-minimum-64-characters-long
JWT_EXPIRE=7d

# === DATABASE ===
DATABASE_URL=postgresql://user:password@host:5432/fixia_production
DB_HOST=tu-seenode-postgres-host
DB_PORT=5432
DB_NAME=fixia_production
DB_USER=fixia_user
DB_PASSWORD=tu-database-password
DB_SSL=true

# === CACHE ===
REDIS_URL=redis://user:password@host:6379
REDIS_HOST=tu-seenode-redis-host
REDIS_PORT=6379
DISABLE_REDIS=false

# === SECURITY ===
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=1000

# === FRONTEND ===
FRONTEND_URL=https://fixia.com.ar
CORS_ORIGIN=https://fixia.com.ar,https://www.fixia.com.ar

# === EMAIL ===
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@fixia.com.ar
CONTACT_EMAIL=contact@fixia.com.ar

# === MONITORING ===
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
SERVER_NAME=fixia-seenode-production

# === PAYMENTS ===
MERCADOPAGO_ACCESS_TOKEN=your-production-token
MERCADOPAGO_PUBLIC_KEY=your-public-key

# === ASSETS ===
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CDN_BASE_URL=https://cdn.fixia.com.ar

# === FEATURES ===
ENABLE_REGISTRATION=true
ENABLE_PAYMENTS=true
ENABLE_CHAT=true
ENABLE_REVIEWS=true
ENABLE_NOTIFICATIONS=true
```

## 📊 Checklist de Deployment

### Pre-Deployment
- [ ] Cuenta SeeNode creada
- [ ] Repositorio conectado
- [ ] Variables de entorno configuradas
- [ ] Add-ons PostgreSQL agregado
- [ ] Build settings configurados

### Durante Deployment
- [ ] Git push realizado
- [ ] Build exitoso (ver logs)
- [ ] Health check pasa
- [ ] APIs responden correctamente

### Post-Deployment
- [ ] Dominio personalizado configurado
- [ ] DNS actualizado
- [ ] Monitoring activo
- [ ] Performance verificada

## 🆘 Troubleshooting Rápido

### Build Fails
```bash
# Verificar:
1. package.json tiene todas las dependencias
2. Variables de entorno están configuradas
3. Dockerfile.seenode está presente
4. No hay conflictos en package-lock.json
```

### App No Inicia
```bash
# Verificar:
1. PORT=5000 en variables de entorno
2. DATABASE_URL es correcta
3. JWT_SECRET está configurado
4. Logs en SeeNode Dashboard
```

### Database Connection Error
```bash
# Verificar:
1. PostgreSQL add-on está activo
2. DATABASE_URL es correcta
3. DB_SSL=true para SeeNode
4. Firewall permite conexiones
```

## 🎯 Próximos Pasos Después del Deployment

1. **Migrar datos** desde proveedor anterior
2. **Configurar monitoring** y alertas
3. **Actualizar DNS** para go-live
4. **Configurar backups** automáticos
5. **Optimizar performance** según métricas

---

**🚀 ¡Listo! Con esta configuración tu backend de Fixia estará corriendo en SeeNode en minutos.**