# =============================================================================
# BFF SEIS APP - Multi-stage Dockerfile
# =============================================================================

FROM node:18-alpine AS builder

WORKDIR /build

# Copiar package.json y lock
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript (si aplica)
RUN npm run build 2>/dev/null || true

# =============================================================================
# STAGE: Development
# =============================================================================
FROM node:18-alpine AS development

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias (incluyendo dev)
RUN npm ci

# Copiar código fuente
COPY . .

# Expose puerto
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --quiet --tries=1 --spider http://localhost:3002/health || exit 1

# Comando por defecto
CMD [ "npm", "run", "start:dev" ]

# =============================================================================
# STAGE: Production
# =============================================================================
FROM node:18-alpine AS production

WORKDIR /app

# Usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar package.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado desde builder
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/src ./src

# Cambiar propietario
RUN chown -R nodejs:nodejs /app

# Usuario nodejs
USER nodejs

# Expose puerto
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --quiet --tries=1 --spider http://localhost:3002/health || exit 1

# Comando por defecto
CMD [ "node", "dist/main.js" ]