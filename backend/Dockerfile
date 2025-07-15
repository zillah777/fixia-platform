# Usar Node.js 18 como base
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (incluye devDependencies para build)
RUN npm ci

# Copiar el código fuente
COPY . .

# No ejecutar migraciones durante build - se ejecutarán al iniciar

# Crear directorio para uploads
RUN mkdir -p uploads/profiles uploads/services uploads/portfolios uploads/verifications uploads/certificates

# Limpiar devDependencies después del build
RUN npm prune --production

# Exponer el puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]