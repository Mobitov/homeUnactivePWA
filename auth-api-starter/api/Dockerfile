FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    dos2unix \
    git \
    unzip \
    libzip-dev \
    zlib1g-dev \
    libssl-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_mysql zip gd

# Install and configure Memcached with all dependencies
RUN apt-get update && apt-get install -y \
    memcached \
    libmemcached-dev \
    libmemcached11 \
    libmemcachedutil2 \
    build-essential \
    && yes '' | pecl install -f memcached-3.2.0 \
    && docker-php-ext-enable memcached

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install Symfony dependencies
RUN composer install --no-scripts --no-autoloader

# Generate optimized autoloader
RUN composer dump-autoload --optimize

# Set permissions for the uploads directory
RUN mkdir -p /var/www/html/public/uploads/profile_images && \
    chown -R www-data:www-data /var/www/html/public/uploads/profile_images && \
    chmod -R 775 /var/www/html/public/uploads/profile_images

# Set permissions for the entire application directory
RUN chown -R www-data:www-data /var/www/html

# Configure Apache DocumentRoot
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copy and set up entrypoint script
COPY entrypoint.sh /usr/local/bin/
RUN dos2unix /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port 80
EXPOSE 80

# Use entrypoint script
CMD ["/usr/local/bin/entrypoint.sh"]