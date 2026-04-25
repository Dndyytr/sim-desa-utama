#!/bin/bash
set -e

role=${CONTAINER_ROLE:-app}

echo "==> Starting container with role: $role"

# Wait for essential services (MySQL, Redis) to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local max_retries=30
    local retry=0

    echo "Waiting for $host:$port..."
    while ! php -r "try { \$c = @fsockopen('$host', $port, \$e, \$m, 2); if(\$c){fclose(\$c); exit(0);} exit(1); } catch(\Throwable \$e){ exit(1); }" 2>/dev/null; do
        retry=$((retry + 1))
        if [ $retry -ge $max_retries ]; then
            echo "WARNING: $host:$port not reachable after $max_retries attempts, continuing anyway..."
            return 0
        fi
        echo "  Attempt $retry/$max_retries — waiting..."
        sleep 2
    done
    echo "$host:$port is ready!"
}

if [ "$role" = "app" ]; then
    echo "Running as APP (PHP-FPM)..."

    # Wait for MySQL ready
    wait_for_service "${DB_HOST:-mysql}" "${DB_PORT:-3306}"
    # Wait for Redis ready
    wait_for_service "${REDIS_HOST:-redis}" "${REDIS_PORT:-6379}"

    exec php-fpm

elif [ "$role" = "queue" ]; then
    echo "Running as QUEUE WORKER..."

    wait_for_service "${DB_HOST:-mysql}" "${DB_PORT:-3306}"
    wait_for_service "${REDIS_HOST:-redis}" "${REDIS_PORT:-6379}"

    exec php artisan queue:work --verbose --tries=3 --timeout=90

elif [ "$role" = "scheduler" ]; then
    echo "Running as SCHEDULER..."

    wait_for_service "${DB_HOST:-mysql}" "${DB_PORT:-3306}"

    exec php artisan schedule:work --verbose

else
    echo "ERROR: Unknown container role '$role'"
    exit 1
fi
