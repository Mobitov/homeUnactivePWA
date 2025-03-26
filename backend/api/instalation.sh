#!/bin/bash

# Check if .env file exists, if not copy from .env.example
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Set the JWT_PASSPHRASE variable in the .env file
JWT_PASSPHRASE=$(openssl rand -base64 48)
sed -i "s/^JWT_PASSPHRASE=.*/JWT_PASSPHRASE=${JWT_PASSPHRASE}/" .env

# Update the composer
composer update

# Install dependencies
composer install

# Generate jwt keypair
php bin/console lexik:jwt:generate-keypair

# Install Memcached
sudo apt-get install -y memcached

# Enable and start Memcached
sudo systemctl enable memcached
sudo systemctl start memcached

# Install PHP Memcached extension
sudo apt-get install -y php-memcached

# Enable the Memcached extension for PHP
sudo phpenmod memcached

# Restart Apache to load the new extension
sudo systemctl restart apache2