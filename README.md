# 🔧 Fixia.com.ar - Marketplace de Servicios Profesionales

> La plataforma Uber de servicios profesionales para la provincia de Chubut, Argentina.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)

## 🚀 Arquitectura del Sistema

```
├── backend/          # API REST + Socket.IO
├── frontend/         # Next.js + TypeScript
└── docs/            # Documentación
```

## 🌟 Características Principales

### 👥 **Dos Tipos de Usuario**
- **Exploradores** (Clientes): Buscan y contratan servicios
- **AS** (Profesionales): Ofrecen servicios especializados

### 🔥 **Funcionalidades Clave**
- ✅ **Búsqueda Inteligente**: "busco niñera para hoy a las 10:00 pm"
- ✅ **Sistema "LO TENGO"**: Respuesta rápida tipo Uber
- ✅ **Calificaciones Mutuas Obligatorias**: Ambas partes deben calificar
- ✅ **Chat en Tiempo Real**: Comunicación instantánea
- ✅ **Verificación DNI + Selfie**: Para profesionales AS
- ✅ **Sistema de Badges**: Reconocimientos por logros
- ✅ **107 Categorías de Servicios**: Organizadas en 12 grupos
- ✅ **Geolocalización**: Restringido a 28 localidades de Chubut
- ✅ **PWA**: Instalable en móviles

### 💳 **Sistema de Pagos**
- Integración con **MercadoPago**
- Promoción: **Primeros 200 AS + 200 Exploradores = 2 meses gratis**
- Facturación solo mensual

## 🛠️ Stack Tecnológico

### Backend
- **Node.js + Express.js**: API REST
- **PostgreSQL**: Base de datos principal
- **Socket.IO**: Chat en tiempo real
- **JWT**: Autenticación
- **Multer**: Subida de archivos
- **Sharp**: Procesamiento de imágenes

### Frontend
- **Next.js 14**: Framework React
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos modernos
- **PWA**: Progressive Web App

### Servicios Externos
- **MercadoPago**: Pagos
- **Google Maps**: Geolocalización
- **Nodemailer**: Emails
- **Firebase FCM**: Notificaciones push

## 🚀 Despliegue

### Railway (Backend + PostgreSQL)
```bash
# El proyecto está configurado para Railway
railway login
railway init
railway add postgresql
railway deploy
```

### Vercel (Frontend)
```bash
# Configuración automática para Vercel
vercel --prod
```

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/database.js       # PostgreSQL config
│   ├── routes/                  # Endpoints API
│   ├── middleware/              # Auth, validation
│   └── utils/                   # Helpers
├── scripts/migrate-postgresql.js # Migración completa
└── server.js                   # Entry point

frontend/
├── src/
│   ├── pages/
│   │   ├── explorador/         # Páginas de clientes
│   │   ├── as/                 # Páginas de profesionales
│   │   └── legal/              # Términos y privacidad
│   ├── components/             # Componentes reutilizables
│   ├── services/               # API calls
│   └── types/                  # TypeScript types
└── public/                     # Assets estáticos
```

## 🗃️ Base de Datos

**50+ Tablas** organizadas en sistemas:

- **Usuarios**: `users`, `user_verifications`, `subscriptions`
- **Servicios**: `categories`, `services`, `service_images`
- **Chat**: `chat_rooms`, `chat_messages`, `explorer_as_connections`
- **Calificaciones**: `explorer_as_reviews`, `service_completion_confirmations`
- **Geolocalización**: `chubut_localities`, `as_work_locations`
- **Promocional**: `promotional_campaigns`, `smart_search_requests`

## 🔐 Seguridad

- **Helmet**: Headers de seguridad
- **Rate Limiting**: Prevención de spam
- **CORS**: Control de origen
- **JWT**: Tokens seguros
- **Bcrypt**: Hash de contraseñas
- **Validación**: Express Validator

## 📱 Responsive + PWA

- **Diseño móvil-first**
- **Instalable como app**
- **Offline-ready**
- **Push notifications**

## 🌍 Localización

- **100% en español**
- **Cultura argentina**
- **Moneda: Pesos argentinos**
- **Zona horaria: Argentina**

## 🎯 Roadmap

- [x] Backend completo con PostgreSQL
- [x] Frontend Exploradores
- [ ] Frontend AS (profesionales)
- [ ] Testing completo
- [ ] Analytics y métricas
- [ ] App móvil nativa

## 📞 Soporte

- **Repositorio**: [GitHub](https://github.com/tu-usuario/fixia)
- **Documentación**: `/docs`
- **Issues**: GitHub Issues

---

**Fixia.com.ar** - Conectando profesionales con clientes en toda la provincia de Chubut 🇦🇷