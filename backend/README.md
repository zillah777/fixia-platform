# Fixia Backend API

Backend API para Fixia - Plataforma de servicios profesionales en Chubut.

## 🚀 Características

- **Autenticación JWT** con roles de usuario (cliente/profesional)
- **Base de datos MySQL** con schema relacional completo
- **Sistema de profesionales AS** con verificación avanzada
- **Suscripciones premium** con beneficios diferenciados
- **Ranking y reputación** basado en algoritmo inteligente
- **Verificación de identidad** con DNI y selfie
- **Sistema de reportes** y moderación
- **Chat en tiempo real** con Socket.IO
- **Sistema de reservas** con estados y validaciones
- **Sistema de reseñas** y calificaciones
- **Pagos con MercadoPago** (simulado)
- **Subida de archivos** con Multer
- **Notificaciones** push y email
- **Seguridad** con Helmet, CORS, rate limiting

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones de base de datos
npm run migrate
npm run migrate-extended

# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## 🗄️ Base de Datos

Crear base de datos MySQL:
```sql
CREATE DATABASE fixia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ejecutar migraciones:
```bash
# Migraciones básicas
npm run migrate

# Migraciones extendidas para AS
npm run migrate-extended
```

## 📋 Variables de Entorno

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fixia_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email
EMAIL_PASS=your_password

# MercadoPago
MP_ACCESS_TOKEN=your_token
MP_PUBLIC_KEY=your_key

# Google Maps
GOOGLE_MAPS_API_KEY=your_key
```

## 🛣️ API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users/profile` - Perfil actual
- `PUT /api/users/profile` - Actualizar perfil
- `POST /api/users/profile/photo` - Subir foto
- `GET /api/users/:id` - Perfil público
- `GET /api/users/search/providers` - Buscar profesionales

### Profesionales AS (Nuevos Endpoints)
- `PUT /api/professionals/complete-profile` - Completar perfil profesional
- `POST /api/professionals/verification` - Enviar documentos de verificación
- `POST /api/professionals/references` - Agregar referencia personal
- `GET /api/professionals/references` - Obtener referencias
- `DELETE /api/professionals/references/:id` - Eliminar referencia
- `POST /api/professionals/portfolio` - Agregar elemento al portafolio
- `GET /api/professionals/portfolio` - Obtener portafolio
- `DELETE /api/professionals/portfolio/:id` - Eliminar elemento del portafolio
- `POST /api/professionals/availability` - Configurar horarios
- `GET /api/professionals/availability` - Obtener horarios
- `POST /api/professionals/work-locations` - Agregar ubicación de trabajo
- `GET /api/professionals/work-locations` - Obtener ubicaciones
- `GET /api/professionals/profile-completion` - Estado de completitud

### Suscripciones
- `GET /api/subscriptions/plans` - Planes disponibles
- `GET /api/subscriptions/current` - Suscripción actual
- `POST /api/subscriptions/upgrade` - Actualizar suscripción
- `POST /api/subscriptions/confirm-payment` - Confirmar pago
- `GET /api/subscriptions/payment-history` - Historial de pagos
- `POST /api/subscriptions/cancel` - Cancelar suscripción
- `GET /api/subscriptions/benefits` - Beneficios actuales

### Reportes
- `POST /api/reports/user` - Reportar usuario
- `GET /api/reports/my-reports` - Mis reportes enviados
- `GET /api/reports/against-me` - Reportes en mi contra
- `GET /api/reports/types` - Tipos de reporte
- `PUT /api/reports/:id/response` - Responder a reporte
- `GET /api/reports/stats` - Estadísticas de reportes

### Ranking
- `GET /api/ranking/top-professionals` - Profesionales top
- `GET /api/ranking/my-ranking` - Mi ranking
- `GET /api/ranking/leaderboard` - Tabla de clasificación
- `POST /api/ranking/recalculate` - Recalcular ranking
- `GET /api/ranking/trending` - Profesionales en tendencia
- `GET /api/ranking/statistics` - Estadísticas generales

### Servicios
- `GET /api/services` - Listar servicios
- `GET /api/services/:id` - Detalle de servicio
- `POST /api/services` - Crear servicio (profesionales)
- `PUT /api/services/:id` - Actualizar servicio
- `DELETE /api/services/:id` - Eliminar servicio
- `POST /api/services/:id/images` - Subir imágenes
- `GET /api/services/categories/list` - Categorías

### Reservas
- `GET /api/bookings` - Mis reservas
- `GET /api/bookings/:id` - Detalle de reserva
- `POST /api/bookings` - Crear reserva (clientes)
- `PATCH /api/bookings/:id/status` - Cambiar estado
- `DELETE /api/bookings/:id` - Cancelar reserva
- `GET /api/bookings/stats/summary` - Estadísticas (profesionales)

### Reseñas
- `POST /api/reviews` - Crear reseña (clientes)
- `GET /api/reviews/service/:id` - Reseñas de servicio
- `GET /api/reviews/provider/:id` - Reseñas de profesional
- `GET /api/reviews/my-reviews` - Mis reseñas
- `PUT /api/reviews/:id` - Editar reseña
- `DELETE /api/reviews/:id` - Eliminar reseña
- `POST /api/reviews/:id/report` - Reportar reseña

### Chat
- `GET /api/chat` - Mis chats
- `POST /api/chat/start` - Iniciar chat
- `GET /api/chat/:id/messages` - Mensajes
- `POST /api/chat/:id/messages` - Enviar mensaje
- `GET /api/chat/unread/count` - Mensajes no leídos
- `POST /api/chat/:id/mark-read` - Marcar como leído

### Pagos
- `POST /api/payments/create-intent` - Crear intención de pago
- `GET /api/payments/:id/status` - Estado de pago
- `GET /api/payments/history` - Historial de pagos
- `POST /api/payments/:id/refund` - Procesar reembolso
- `GET /api/payments/earnings/summary` - Resumen de ganancias

### Notificaciones
- `GET /api/notifications` - Mis notificaciones
- `PATCH /api/notifications/:id/read` - Marcar como leída
- `PATCH /api/notifications/read-all` - Marcar todas como leídas
- `DELETE /api/notifications/:id` - Eliminar notificación
- `GET /api/notifications/preferences` - Preferencias
- `PUT /api/notifications/preferences` - Actualizar preferencias
- `POST /api/notifications/fcm-token` - Registrar token FCM

## 🔐 Autenticación

Todas las rutas protegidas requieren header:
```
Authorization: Bearer <jwt_token>
```

## 🏆 Sistema de Ranking

El algoritmo de ranking considera:
- **Reseñas (40%)**: Promedio y cantidad de calificaciones
- **Suscripción (20%)**: Tipo de plan activo
- **Verificación (15%)**: Estado de verificación de identidad
- **Reservas completadas (10%)**: Cantidad y tasa de éxito
- **Completitud del perfil (10%)**: Porcentaje completado
- **Experiencia (5%)**: Años de experiencia declarados

### Tiers de Ranking:
- **Elite (80-100)**: 👑 Oro
- **Experto (60-79)**: ⭐ Plata  
- **Profesional (40-59)**: 🔥 Bronce
- **Iniciante (0-39)**: 🌟 Básico

## 💎 Sistema de Suscripciones

### Plan Gratuito ($0)
- Máximo 2 servicios
- Soporte básico
- 3 fotos por servicio

### Plan Básico ($5,000 ARS)
- Máximo 10 servicios
- Soporte prioritario
- Portafolio personalizado
- 10 fotos por servicio
- Badge verificado

### Plan Premium ($10,000 ARS)
- Servicios ilimitados
- Listados destacados
- Soporte prioritario
- Analytics avanzados
- Portafolio personalizado
- Fotos ilimitadas
- Badge verificado

## 🔍 Sistema de Verificación

1. **Datos personales**: Nombre, DNI, fecha nacimiento
2. **Información profesional**: Profesión, matrícula, especialización
3. **Documentos**: DNI frente y dorso
4. **Selfie con DNI**: Verificación de identidad
5. **Referencias**: Hasta 3 referencias personales

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración de BD
│   ├── middleware/      # Middleware personalizado
│   ├── routes/          # Rutas de API
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── professionals.js  # Nuevas rutas AS
│   │   ├── subscriptions.js  # Sistema de suscripciones
│   │   ├── reports.js        # Sistema de reportes
│   │   ├── ranking.js        # Sistema de ranking
│   │   ├── services.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   ├── chat.js
│   │   ├── payments.js
│   │   └── notifications.js
│   └── utils/           # Utilidades y helpers
│       ├── helpers.js
│       ├── validation.js
│       └── ranking.js    # Algoritmo de ranking
├── scripts/             # Scripts de migración
│   ├── migrate.js       # Migraciones básicas
│   └── migrate-extended.js  # Migraciones AS
├── uploads/             # Archivos subidos
│   ├── profiles/
│   ├── services/
│   ├── verifications/   # Documentos de verificación
│   └── portfolios/      # Imágenes de portafolio
└── server.js           # Punto de entrada
```

## 🧪 Testing

```bash
npm test
```

## 📝 Health Check

Endpoint de salud disponible en:
```
GET /health
```

## 🚀 Deployment

El backend está configurado para Railway con Docker.

Variables de entorno necesarias en producción:
- Todas las variables del .env.example
- `FRONTEND_URL` - URL del frontend para CORS

## 🆕 Nuevas Características para AS

### Verificación Avanzada
- Verificación de DNI con imágenes
- Selfie sosteniendo DNI
- Verificación manual por administradores
- Sistema de puntuación de confianza

### Gestión de Perfil Profesional
- Información profesional detallada
- Portafolio con imágenes
- Referencias personales verificables
- Horarios de disponibilidad
- Ubicaciones de trabajo

### Sistema de Suscripciones
- 3 niveles de suscripción
- Beneficios diferenciados
- Pagos con MercadoPago
- Gestión automática de vencimientos

### Ranking Inteligente
- Algoritmo de puntuación avanzado
- Posicionamiento basado en desempeño
- Bonificaciones por suscripción
- Sistema de tiers visuales

### Sistema de Reportes
- Reportes entre usuarios
- Tipos de reporte categorizados
- Sistema de investigación
- Respuestas del usuario reportado

Esto permite que los AS sean "tratados como reyes" con suscripción premium y tengan todas las herramientas para destacar en la plataforma.