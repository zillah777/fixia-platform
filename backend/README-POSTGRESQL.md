# 🐘 Fixia PostgreSQL Setup Guide

## 📋 Requisitos Previos

- **Node.js** 18.0.0 o superior
- **PostgreSQL** 13.0 o superior
- **npm** o **yarn**

## 🚀 Instalación de PostgreSQL

### En Windows
1. Descargar PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Ejecutar el instalador y seguir las instrucciones
3. Anotar la contraseña del usuario `postgres`
4. Asegurarse de que el puerto 5432 esté disponible

### En macOS
```bash
# Con Homebrew
brew install postgresql
brew services start postgresql

# Crear usuario postgres si no existe
createuser -s postgres
```

### En Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar contraseña para postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'tu_password';"
```

## 🔧 Configuración del Proyecto

### 1. Instalar Dependencias
```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus datos
nano .env
```

### 3. Configuración de .env
```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=fixia_db

# JWT Configuration
JWT_SECRET=tu_clave_secreta_jwt_minimo_32_caracteres
JWT_EXPIRES_IN=7d

# Otros...
```

## 🗃️ Configuración de Base de Datos

### 1. Crear Base de Datos
```bash
# Conectar a PostgreSQL
psql -U postgres -h localhost

# Crear la base de datos
CREATE DATABASE fixia_db;

# Verificar la creación
\l

# Salir
\q
```

### 2. Ejecutar Migraciones
```bash
# Ejecutar la migración completa de PostgreSQL
npm run db:setup

# O usar el comando específico
npm run migrate-postgresql
```

### 3. Verificar Instalación
```bash
# Iniciar el servidor
npm run dev

# Deberías ver:
# ✅ PostgreSQL Database connected successfully
# 📅 Server time: 2024-01-15T10:30:00.000Z
# 🚀 Server running on port 5000
```

## 📊 Verificación de Tablas

### Conectar a la Base de Datos
```bash
psql -U postgres -d fixia_db
```

### Comandos Útiles de PostgreSQL
```sql
-- Ver todas las tablas
\dt

-- Describir una tabla específica
\d users

-- Ver cantidad de registros en cada tabla
SELECT 
  schemaname,
  tablename,
  n_tup_ins as "Total Rows"
FROM pg_stat_user_tables
ORDER BY tablename;

-- Ver las categorías de servicios
SELECT * FROM categories LIMIT 10;

-- Ver las localidades de Chubut
SELECT * FROM chubut_localities;
```

## 🎯 Estructura de la Base de Datos

### Tablas Principales Creadas

#### 👥 **Gestión de Usuarios**
- `users` - Usuarios principales (Exploradores y AS)
- `user_verifications` - Verificaciones de identidad
- `subscriptions` - Planes de suscripción
- `subscription_payments` - Pagos de suscripciones

#### 🛠️ **Sistema de Servicios**
- `categories` - 107 categorías de servicios
- `services` - Servicios ofrecidos por AS
- `service_images` - Imágenes de servicios
- `explorer_service_requests` - Solicitudes de Exploradores
- `as_service_interests` - Respuestas "LO TENGO" de AS

#### 💬 **Sistema de Chat**
- `chat_rooms` - Salas de chat
- `chat_messages` - Mensajes del chat
- `explorer_as_connections` - Conexiones Explorer-AS

#### ⭐ **Sistema de Calificaciones**
- `explorer_as_reviews` - Reseñas de Exploradores a AS
- `explorer_review_obligations` - Calificaciones obligatorias
- `as_review_obligations` - Calificaciones obligatorias de AS
- `service_completion_confirmations` - Confirmación mutua

#### 🏆 **Sistema de Insignias**
- `badges` - Definiciones de insignias
- `user_badges` - Insignias ganadas

#### 📍 **Geolocalización**
- `chubut_localities` - 28 localidades de Chubut
- `as_work_locations` - Ubicaciones de trabajo de AS

#### 🎁 **Sistema Promocional**
- `promotional_campaigns` - Campañas promocionales
- `user_promotional_subscriptions` - Suscripciones promocionales
- `smart_search_requests` - Búsquedas inteligentes

## 🔍 Comandos de Desarrollo

```bash
# Desarrollo con recarga automática
npm run dev

# Ejecutar migraciones
npm run migrate-postgresql

# Restablecer base de datos (cuando esté disponible)
npm run db:reset

# Ejecutar tests
npm test

# Iniciar en producción
npm start
```

## 🛠️ Herramientas Recomendadas

### Clientes de PostgreSQL
- **pgAdmin** - Interfaz gráfica oficial
- **DBeaver** - Cliente universal gratuito
- **TablePlus** - Cliente moderno (macOS/Windows)
- **DataGrip** - IDE de JetBrains (pago)

### Extensiones de VSCode
- **PostgreSQL** por Microsoft
- **Database Client JDBC** para consultas

## 🔧 Solución de Problemas

### Error: "database does not exist"
```bash
# Crear la base de datos manualmente
createdb -U postgres fixia_db
```

### Error: "password authentication failed"
```bash
# Resetear contraseña de postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'nueva_password';"
```

### Error: "could not connect to server"
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Iniciar PostgreSQL si está parado
sudo systemctl start postgresql
```

### Error: "port 5432 already in use"
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :5432

# Cambiar puerto en .env si es necesario
DB_PORT=5433
```

## 📈 Monitoreo y Performance

### Verificar Conexiones Activas
```sql
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  query
FROM pg_stat_activity
WHERE datname = 'fixia_db';
```

### Ver Tamaño de la Base de Datos
```sql
SELECT 
  pg_size_pretty(pg_database_size('fixia_db')) as database_size;
```

### Estadísticas de Tablas
```sql
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

## 🚀 Próximos Pasos

1. **Verificar la instalación** ejecutando `npm run dev`
2. **Poblar datos de prueba** (opcional)
3. **Configurar el frontend** para conectar con la API
4. **Configurar el deployment** en Railway u otro servicio

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs del servidor
2. Verifica la configuración de .env
3. Asegúrate de que PostgreSQL esté corriendo
4. Consulta la documentación oficial de PostgreSQL

¡Tu plataforma Fixia ya está lista para funcionar con PostgreSQL! 🎉