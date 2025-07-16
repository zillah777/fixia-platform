# Usar Node.js 18 como base
FROM node:18-alpine

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias con manejo de errores
RUN npm ci --production=false --silent || npm install

# Copiar el código fuente
COPY . .

# Crear directorio para uploads
RUN mkdir -p uploads/profiles uploads/services uploads/portfolios uploads/verifications uploads/certificates

# Limpiar devDependencies después de la instalación
RUN npm prune --production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar ownership de los archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer el puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]