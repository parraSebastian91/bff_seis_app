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
RUN npm run build

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
FROM node:20-alpine AS production

WORKDIR /app

# curl + jq: los usa entrypoint-with-vault.sh; dumb-init: manejo de señales
RUN apk add --no-cache curl jq bash dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /build/dist ./dist

COPY --chown=nodejs:nodejs entrypoint-with-vault.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3002/health || exit 1

# Secrets desde Vault (mismo lineamiento que ms-identity y ms-core)
ENTRYPOINT ["/entrypoint.sh"]
CMD ["dumb-init", "--", "node", "dist/src/main.js"]
