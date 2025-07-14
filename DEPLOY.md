# 🚀 Guía de Despliegue - Fixia.com.ar

## 📋 Pre-requisitos

1. **Cuenta de GitHub** (para alojar el código)
2. **Cuenta de Railway** (para backend + PostgreSQL)
3. **Cuenta de Vercel** (para frontend)

## 🔧 Paso 1: Subir a GitHub

### 1.1 Inicializar Git (si no está inicializado)
```bash
cd /mnt/c/xampp/htdocs/fixia.com.ar
git init
git add .
git commit -m "🎉 Initial commit - Fixia platform

✨ Features implemented:
- Complete backend API with PostgreSQL
- Explorer (client) frontend pages
- Authentication system
- Real-time chat with Socket.IO
- Mutual rating system
- Badge system
- 107 service categories for Chubut
- PWA configuration

🚀 Ready for deployment on Railway + Vercel"
```

### 1.2 Crear repositorio en GitHub
1. Ir a [github.com](https://github.com) → New Repository
2. Nombre: `fixia-platform`
3. Descripción: `Marketplace de servicios profesionales para Chubut, Argentina`
4. ✅ Public o Private (tu elección)
5. ❌ NO initializar con README (ya tienes uno)

### 1.3 Conectar y subir
```bash
git remote add origin https://github.com/TU-USUARIO/fixia-platform.git
git branch -M main
git push -u origin main
```

## 🚂 Paso 2: Desplegar Backend en Railway

### 2.1 Instalar Railway CLI
```bash
npm install -g @railway/cli
```

### 2.2 Login y configuración
```bash
railway login
cd backend
railway init
railway add postgresql
```

### 2.3 Configurar variables de entorno en Railway
En el dashboard de Railway:

```env
NODE_ENV=production
DB_HOST=[Railway te lo proporciona automáticamente]
DB_PORT=5432
DB_USER=[Railway te lo proporciona automáticamente]
DB_PASSWORD=[Railway te lo proporciona automáticamente]
DB_NAME=[Railway te lo proporciona automáticamente]
JWT_SECRET=tu_clave_secreta_jwt_super_segura_32_caracteres_minimo
JWT_EXPIRE=7d
SENDGRID_API_KEY=tu_sendgrid_api_key_aqui
SENDGRID_FROM_EMAIL=noreply@fixia.com.ar
SENDGRID_FROM_NAME=Fixia - Marketplace de Servicios
FRONTEND_URL=https://fixia.vercel.app
MP_ACCESS_TOKEN=tu_token_de_mercadopago
MP_PUBLIC_KEY=tu_public_key_de_mercadopago
GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
FCM_SERVER_KEY=tu_fcm_server_key
FCM_PROJECT_ID=tu_project_id_de_firebase
```

### 2.4 Desplegar
```bash
railway deploy
```

**Resultado**: Tu backend estará en `https://fixia-backend.railway.app`

## ⚡ Paso 3: Desplegar Frontend en Vercel

### 3.1 Instalar Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Login y configuración
```bash
vercel login
cd frontend
vercel
```

### 3.3 Configurar variables de entorno en Vercel
En el dashboard de Vercel:

```env
NEXT_PUBLIC_API_URL=https://fixia-backend.railway.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
NEXT_PUBLIC_MP_PUBLIC_KEY=tu_public_key_de_mercadopago
NEXT_PUBLIC_FCM_VAPID_KEY=tu_vapid_key_de_firebase
NEXT_PUBLIC_SITE_URL=https://fixia.vercel.app
```

### 3.4 Desplegar
```bash
vercel --prod
```

**Resultado**: Tu frontend estará en `https://fixia.vercel.app`

## 🔗 Paso 4: Conectar Frontend con Backend

### 4.1 Actualizar CORS en backend
Agregar tu dominio de Vercel a la configuración de CORS en `backend/server.js`:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://fixia.vercel.app',
    'https://tu-dominio-custom.com'
  ],
  credentials: true
};
```

### 4.2 Redeploy backend
```bash
cd backend
railway deploy
```

## ✅ Paso 5: Verificar el Despliegue

### 5.1 Verificar Backend
```bash
curl https://fixia-backend.railway.app/api/health
```

### 5.2 Verificar Base de Datos
- Revisar logs en Railway
- Verificar que las 50+ tablas se crearon automáticamente

### 5.3 Verificar Frontend
- Ir a `https://fixia.vercel.app`
- Probar navegación
- Verificar que conecta con el backend

## 🎯 URLs Finales

- **Frontend**: `https://fixia.vercel.app`
- **Backend API**: `https://fixia-backend.railway.app`
- **Admin Panel**: `https://fixia-backend.railway.app/admin` (si lo creas)

## 🔧 Comandos de Desarrollo Local

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## 📊 Monitoreo

### Railway (Backend)
- Ver logs en tiempo real
- Métricas de CPU/RAM
- Reinicio automático

### Vercel (Frontend)
- Analytics incorporado
- Performance insights
- Edge locations

## 🆘 Solución de Problemas

### Error: "Database connection failed"
```bash
# Verificar variables de entorno en Railway
railway variables

# Ver logs
railway logs
```

### Error: "CORS policy"
- Verificar que el dominio de Vercel está en `corsOptions`
- Redeploy backend después de cambios

### Error: "Build failed"
```bash
# Limpiar cache
rm -rf .next node_modules
npm install
npm run build
```

## 🚀 Próximos Pasos

1. **Configurar dominio custom**: `fixia.com.ar`
2. **Configurar SSL**: Automático en Railway y Vercel
3. **Configurar CDN**: Para uploads de imágenes
4. **Configurar monitoring**: Sentry, LogRocket
5. **Configurar backup**: PostgreSQL automático

¡Tu plataforma Fixia ya está lista en producción! 🎉