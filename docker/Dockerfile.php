# SoftArt Laravel Project Dockerfile (Simple & Fast)
# Uses pre-built base image for faster builds

FROM softart/php-laravel:8.2

LABEL project="Laravel Development Environment"
LABEL maintainer="SoftArt DevOps"

# Copy project-specific configurations
COPY docker/php.ini /usr/local/etc/php/conf.d/project.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set working directory
WORKDIR /var/www

# Laravel app files will be mounted as volume
# Ensure proper permissions for mounted volume
RUN chown -R laravel:laravel /var/www

# Expose PHP-FPM port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]