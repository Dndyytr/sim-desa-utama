###############################################
# Stage 1: Build (PHP deps + Vite frontend)
###############################################
FROM php:8.4-fpm-alpine AS builder

RUN apk add --no-cache \
    zip unzip libzip-dev curl git bash \
    nodejs npm \
    icu-dev linux-headers

RUN docker-php-ext-install pdo pdo_mysql zip pcntl bcmath opcache intl

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www

# Install PHP dependencies first (Docker layer cache)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress --no-scripts

# Install Node dependencies (Docker layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Run composer scripts that need full source (package:discover, etc.)
RUN composer dump-autoload --optimize

# Build Vite frontend assets inside the pipeline
RUN npm run build

# Cleanup — node_modules not needed in production
RUN rm -rf node_modules


###############################################
# Stage 2: Production image (lean PHP-FPM)
###############################################
FROM php:8.4-fpm-alpine AS production

LABEL maintainer="sim-desa-utama"

RUN apk add --no-cache \
    libzip zip bash icu-libs

RUN docker-php-ext-install pdo pdo_mysql zip pcntl bcmath opcache intl

# PHP production tuning (OPcache + JIT)
RUN { \
    echo "opcache.enable=1"; \
    echo "opcache.memory_consumption=128"; \
    echo "opcache.interned_strings_buffer=16"; \
    echo "opcache.max_accelerated_files=10000"; \
    echo "opcache.validate_timestamps=0"; \
    echo "opcache.save_comments=1"; \
    echo "opcache.jit=1255"; \
    echo "opcache.jit_buffer_size=64M"; \
    } > /usr/local/etc/php/conf.d/opcache-prod.ini

# Redis PHP extension
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

WORKDIR /var/www

# Copy built application from builder stage
COPY --from=builder /var/www /var/www

# Fix permissions for Laravel
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Copy entrypoint
COPY docker/production/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# PHP-FPM listens on port 9000
EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
