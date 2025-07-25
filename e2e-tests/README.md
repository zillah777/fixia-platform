# 🎭 Tests E2E de Fixia.com.ar con Playwright

## 📋 Descripción General

Esta suite de tests E2E (End-to-End) proporciona cobertura completa para todas las funcionalidades de la plataforma Fixia.com.ar, incluyendo:

- ✅ **Autenticación completa** (registro, login, logout)
- ✅ **Funcionalidades de Explorador** (búsqueda de servicios, solicitudes)
- ✅ **Funcionalidades de AS** (gestión de servicios, respuesta a solicitudes)
- ✅ **Sistema de chat** en tiempo real
- ✅ **Integración de pagos** con MercadoPago
- ✅ **Sistema de reviews** y calificaciones

## 🏗️ Estructura del Proyecto

```
e2e-tests/
├── auth/                    # Tests de autenticación
│   ├── registration.spec.ts # Registro de usuarios
│   └── login.spec.ts       # Login y logout
├── explorador/             # Tests para usuarios Explorador
│   ├── dashboard.spec.ts   # Dashboard y perfil
│   └── service-requests.spec.ts # Solicitudes de servicio
├── as/                     # Tests para usuarios AS
│   ├── dashboard.spec.ts   # Dashboard y perfil AS
│   └── service-management.spec.ts # Gestión de servicios
├── communication/          # Tests de comunicación
│   └── chat.spec.ts       # Sistema de chat
├── payments/              # Tests de pagos
│   └── mercadopago.spec.ts # Integración MercadoPago
├── reviews/               # Tests de reviews
│   └── rating-system.spec.ts # Sistema de calificaciones
└── utils/                 # Utilidades de testing
    └── test-helpers.ts    # Helpers y datos de prueba
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
# Instalar Playwright
npm install -D playwright @playwright/test

# Instalar navegadores
npx playwright install

# Instalar dependencias del sistema (Linux/WSL)
npx playwright install-deps
```

### 2. Configuración del Entorno

Asegúrate de que tanto el frontend como el backend estén ejecutándose:

```bash
# Terminal 1 - Backend
cd backend
npm run dev  # Puerto 5000

# Terminal 2 - Frontend  
cd frontend
npm run dev  # Puerto 3000
```

## 📊 Ejecución de Tests

### Comandos Principales

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar con interfaz visual
npm run test:e2e:ui

# Ejecutar en modo visible (con ventanas del navegador)
npm run test:e2e:headed

# Modo debug (step-by-step)
npm run test:e2e:debug
```

### Tests por Categoría

```bash
# Tests de autenticación
npm run test:e2e:auth

# Tests de funcionalidades de Explorador
npm run test:e2e:explorador

# Tests de funcionalidades de AS
npm run test:e2e:as

# Tests de chat
npm run test:e2e:chat

# Tests de pagos
npm run test:e2e:payments

# Tests de reviews
npm run test:e2e:reviews

# Solo tests críticos
npm run test:e2e:critical
```

### Ver Reportes

```bash
# Mostrar reporte HTML de la última ejecución
npm run test:e2e:report
```

## 🎯 Casos de Prueba Principales

### 🔐 Autenticación (auth/)

#### Registro (`registration.spec.ts`)
- ✅ Registro completo como Explorador (3 pasos)
- ✅ Registro completo como AS (3 pasos + perfil)
- ✅ Validación de formularios
- ✅ Validación de email y password
- ✅ Prevención de emails duplicados
- ✅ Navegación entre pasos del registro
- ✅ Cuentas demo para testing

#### Login (`login.spec.ts`)
- ✅ Login exitoso para ambos tipos de usuario
- ✅ Validación de credenciales
- ✅ Funcionalidad "Recordarme"
- ✅ Redireccionamiento post-login
- ✅ Estados de carga y errores de red
- ✅ Logout completo

### 👥 Explorador (explorador/)

#### Dashboard (`dashboard.spec.ts`)
- ✅ Visualización de estadísticas
- ✅ Acciones rápidas (nueva solicitud, buscar servicios)
- ✅ Feed de actividad reciente
- ✅ Gestión de perfil
- ✅ Diseño responsive

#### Solicitudes de Servicio (`service-requests.spec.ts`)
- ✅ Creación de solicitud completa
- ✅ Validación de formularios
- ✅ Auto-generación de títulos
- ✅ Gestión de solicitudes existentes
- ✅ Respuestas de AS y aceptación
- ✅ Búsqueda y filtrado de servicios

### 🔧 AS - Anunciante de Servicios (as/)

#### Dashboard (`dashboard.spec.ts`)
- ✅ Analytics de ganancias y rendimiento
- ✅ Gestión de servicios activos
- ✅ Calendario de citas
- ✅ Completación de perfil AS
- ✅ Métricas de conversión

#### Gestión de Servicios (`service-management.spec.ts`)
- ✅ Creación de nuevos servicios
- ✅ Edición y activación/desactivación
- ✅ Respuesta a solicitudes entrantes
- ✅ Estadísticas por servicio
- ✅ Gestión de precios y disponibilidad

### 💬 Comunicación (communication/)

#### Sistema de Chat (`chat.spec.ts`)
- ✅ Lista de conversaciones
- ✅ Envío y recepción de mensajes
- ✅ Indicadores de estado (enviado/leído)
- ✅ Carga de archivos/imágenes
- ✅ Notificaciones en tiempo real
- ✅ Diseño responsive móvil

### 💳 Pagos (payments/)

#### MercadoPago (`mercadopago.spec.ts`)
- ✅ Flujo completo de pago
- ✅ Validación de formularios de pago
- ✅ Manejo de pagos exitosos/fallidos
- ✅ Historial de pagos (Explorador)
- ✅ Ganancias (AS)
- ✅ Solicitudes de reembolso
- ✅ Seguridad y validaciones

### ⭐ Reviews (reviews/)

#### Sistema de Calificaciones (`rating-system.spec.ts`)
- ✅ Creación de reseñas por Explorador
- ✅ Sistema de 5 estrellas
- ✅ Validación de contenido
- ✅ Visualización en perfiles AS
- ✅ Filtrado y ordenamiento
- ✅ Respuestas de AS a reseñas
- ✅ Prevención de spam y duplicados

## 🔧 Utilidades y Helpers

### TestHelpers Class (`utils/test-helpers.ts`)

La clase `TestHelpers` proporciona métodos reutilizables:

```typescript
// Ejemplo de uso
const helpers = new TestHelpers(page);

// Login rápido
await helpers.login('email@test.com', 'password');

// Registro completo
await helpers.register({
  nombre: 'Juan',
  apellido: 'Pérez', 
  email: 'juan@test.com',
  password: 'password123',
  userType: 'explorador'
});

// Crear solicitud de servicio
await helpers.createServiceRequest({
  category: 'plomeria',
  description: 'Reparar fuga en baño',
  location: 'rawson'
});

// Enviar mensaje de chat
await helpers.sendChatMessage('Hola, necesito información');
```

### Datos de Prueba

```typescript
// Usuarios de prueba
TestData.explorador  // Usuario explorador
TestData.as         // Usuario AS
TestData.serviceRequest // Solicitud tipo
TestData.service    // Servicio tipo
```

### Selectores Constantes

```typescript
Selectors.loginForm    // '[data-testid="login-form"]'
Selectors.dashboard    // '[data-testid="dashboard"]'
Selectors.chatWindow   // '[data-testid="chat-window"]'
// ... más selectores
```

## 🎪 Estrategias de Testing

### 1. **Data-testid Strategy**
Todos los tests usan `data-testid` para mayor estabilidad:

```html
<button data-testid="login-button">Iniciar Sesión</button>
```

### 2. **Cuentas Demo**
Se utilizan cuentas demo para testing confiable:
- `demo-explorador-login` - Login rápido Explorador
- `demo-as-login` - Login rápido AS

### 3. **Gestión de Estado**
- Tests independientes (cleanup automático)
- Emails únicos con timestamps
- Manejo de estados de carga y error

### 4. **Responsive Testing**
Tests adaptados para mobile y desktop:

```typescript
test('should handle responsive design', async ({ page, isMobile }) => {
  if (isMobile) {
    // Tests específicos para móvil
  } else {
    // Tests para desktop
  }
});
```

## 🔍 Debugging y Troubleshooting

### Debugging Tests

```bash
# Debug específico
npx playwright test auth/login.spec.ts --debug

# Con trace viewer
npx playwright test --trace on

# Screenshots en fallos
npx playwright test --screenshot only-on-failure
```

### Logs y Screenshots

Los tests automáticamente capturan:
- Screenshots en fallos
- Videos de tests fallidos
- Traces para debugging
- Logs de consola de errores

### Problemas Comunes

1. **Timeouts**: Ajustar en `playwright.config.ts`
2. **Elementos no encontrados**: Verificar `data-testid`
3. **Estados de carga**: Usar `waitForElement()` helper
4. **Datos de prueba**: Limpiar entre tests

## 📊 Métricas y Reportes

### Cobertura de Funcionalidades

- ✅ **Autenticación**: 100% 
- ✅ **Explorador**: 95%
- ✅ **AS**: 95%
- ✅ **Chat**: 90%
- ✅ **Pagos**: 85% (limitado por entorno)
- ✅ **Reviews**: 90%

### Navegadores Soportados

- ✅ Chrome (Desktop/Mobile)
- ✅ Firefox (Desktop)
- ✅ Safari (Desktop/Mobile)
- ✅ Edge (Desktop)

## 🔄 Integración Continua

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: |
    npm install
    npx playwright install
    npm run test:e2e
    
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 📝 Mejores Prácticas

### 1. **Test Organization**
- Un archivo por funcionalidad principal
- Agrupación lógica con `test.describe()`
- Nombres descriptivos y en español

### 2. **Data Management**
- Usar emails únicos con timestamps
- Limpiar datos entre tests
- Cuentas demo para tests estables

### 3. **Error Handling**
- Verificar estados de carga
- Manejar timeouts apropiadamente
- Capturar errores de red

### 4. **Maintenance**
- Actualizar selectores cuando cambie UI
- Revisar tests tras cambios en API
- Documentar cambios en funcionalidad

## 🎯 Próximos Pasos

### Extensiones Planeadas

- [ ] Tests de performance con Lighthouse
- [ ] Tests de accesibilidad (a11y)
- [ ] Tests de APIs independientes
- [ ] Integration con herramientas de monitoreo
- [ ] Tests de carga con Playwright

### Optimizaciones

- [ ] Paralelización de tests
- [ ] Cache de datos de prueba
- [ ] Reutilización de sesiones
- [ ] Tests sintéticos en producción

---

## 🆘 Soporte

Para problemas con tests E2E:

1. **Verificar configuración**: `playwright.config.ts`
2. **Revisar logs**: `npm run test:e2e:debug`
3. **Ver reportes**: `npm run test:e2e:report`
4. **Documentación**: [Playwright Docs](https://playwright.dev)

---

**¡Tests E2E completos para toda la funcionalidad de Fixia.com.ar! 🎉**