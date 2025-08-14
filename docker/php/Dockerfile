# Build stage for common dependencies
FROM php:8.2-fpm as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Essential packages
    git \
    curl \
    zip \
    unzip \
    # PHP extension dependencies
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    # Development tools
    procps \
    net-tools \
    netcat-openbsd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* /var/tmp/*

# Install PHP extensions in single layer
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip

# Install PECL extensions
RUN pecl install redis-5.3.7 \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Create non-root user for better security
RUN groupadd -g 1000 laravel \
    && useradd -u 1000 -g laravel -m laravel \
    && usermod -aG www-data laravel

# Set working directory
WORKDIR /var/www/html

# Set proper permissions
RUN chown -R laravel:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Development stage
FROM base as development

# Install Xdebug for development
RUN pecl install xdebug-3.3.0 \
    && docker-php-ext-enable xdebug

# Copy Xdebug configuration
COPY xdebug.ini /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# Use laravel user
USER laravel

EXPOSE 9000

# Use default php-fpm command (healthcheck handled by docker-compose)
CMD ["php-fpm"]

# Production stage
FROM base as production

# Optimize for production
RUN rm -rf /usr/src/php* \
    && docker-php-source delete

# Use laravel user
USER laravel

EXPOSE 9000

CMD ["php-fpm"]