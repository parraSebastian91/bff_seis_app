#!/bin/bash
# entrypoint-with-vault.sh
# Carga secrets de Vault y ejecuta app (mismo lineamiento que ms-identity y ms-core)

set -e

echo "🔐 Cargando secrets desde Vault..."

VAULT_ADDR="${VAULT_ADDR:-http://vault_server:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-}"

if [ -z "$VAULT_TOKEN" ]; then
    echo "❌ VAULT_TOKEN no configurado"
    exit 1
fi

# Función helper (KV v2)
vault_get() {
    local path=$1
    local field=$2
    curl -sf -H "X-Vault-Token: $VAULT_TOKEN" \
        "$VAULT_ADDR/v1/$path" | \
        jq -r ".data.data.$field // empty"
}

load_redis(){
    echo "  🔑 Cargando secrets de Redis..."
    local path="secret/data/flowis/redis"
    export REDIS_HOST=$(vault_get "$path" "REDIS_HOST")
    export REDIS_PORT=$(vault_get "$path" "REDIS_PORT")
    export REDIS_DB=$(vault_get "$path" "REDIS_DB")
    export REDIS_TTL=$(vault_get "$path" "REDIS_TTL")
}

load_JWT(){
    echo "  🔑 Cargando secrets de JWT..."
    local path="secret/data/flowis/jwt"
    export JWT_ACCESS_SECRET=$(vault_get "$path" "JWT_ACCESS_SECRET")
    export JWT_ACCESS_EXPIRES_IN=$(vault_get "$path" "JWT_ACCESS_EXPIRES_IN")
    export JWT_REFRESH_SECRET=$(vault_get "$path" "JWT_REFRESH_SECRET")
    export JWT_REFRESH_EXPIRES_IN=$(vault_get "$path" "JWT_REFRESH_EXPIRES_IN")
    export JWT_ACCESS_ADMIN_EXPIRES_IN=$(vault_get "$path" "JWT_ACCESS_ADMIN_EXPIRES_IN")
}

load_storage_minio(){
    echo "  🔑 Cargando secrets de MinIO..."
    local path="secret/data/flowis/storage_minio"
    export MINIO_ROOT_USER=$(vault_get "$path" "MINIO_ROOT_USER")
    export MINIO_ROOT_PASSWORD=$(vault_get "$path" "MINIO_ROOT_PASSWORD")
    local endpoint=$(vault_get "$path" "MINIO_ENDPOINT")
    export MINIO_ENDPOINT="${endpoint%%:*}"
    export MINIO_PORT="${endpoint##*:}"
}

load_rabbit_env(){
    echo "  🔑 Cargando secrets de RabbitMQ..."
    local path="secret/data/flowis/rabbit"
    export RABBITMQ_HOST=$(vault_get "$path" "RABBITMQ_HOST")
    export RABBITMQ_PORT=$(vault_get "$path" "RABBITMQ_PORT")
    export RABBITMQ_QUEUE=$(vault_get "$path" "RABBITMQ_QUEUE")
    export RABBITMQ_ROUTING_KEY=$(vault_get "$path" "RABBITMQ_ROUTING_KEY")
    export RABBITMQ_EXCHANGE=$(vault_get "$path" "RABBITMQ_EXCHANGE")
}

load_config_endpoint_services(){
    echo "  🔑 Cargando endpoints de servicios externos..."
    local path="secret/data/flowis/external_services"
    export STORAGE_SERVICE_URL=$(vault_get "$path" "STORAGE_SERVICE_BASE_URL")
    export CORE_SERVICE_BASE_URL=$(vault_get "$path" "CORE_SERVICE_BASE_URL")
    export STORAGE_SERVICE_TIMEOUT=$(vault_get "$path" "STORAGE_SERVICE_TIMEOUT")
    export CORE_SERVICE_TIMEOUT=$(vault_get "$path" "CORE_SERVICE_TIMEOUT")
}

load_service_env(){
    SERVICE_NAME="${SERVICE_NAME:-bff-seis-app}"
    echo "  📦 Cargando secrets para $SERVICE_NAME..."
    load_redis
    load_JWT
    load_storage_minio
    load_rabbit_env
    load_config_endpoint_services
    local path_service="secret/data/flowis/$SERVICE_NAME"
    export NODE_ENV=$(vault_get "$path_service" "NODE_ENV")
    export PORT=$(vault_get "$path_service" "PORT")
    export PORT="${PORT:-3002}"
    export MIN_LOG_LEVEL=$(vault_get "$path_service" "MIN_LOG_LEVEL")
    export RABBITMQ_USER=$(vault_get "$path_service" "RABBITMQ_USER")
    export RABBITMQ_PASS=$(vault_get "$path_service" "RABBITMQ_PASS")
    export FRONTEND_ORIGIN=$(vault_get "$path_service" "FRONTEND_ORIGIN")
    export FRONTEND_URL=$(vault_get "$path_service" "FRONTEND_URL")
}

load_service_env
echo "🚀 Iniciando aplicación..."
echo ""

exec "$@"
