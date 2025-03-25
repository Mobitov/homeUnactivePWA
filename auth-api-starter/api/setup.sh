#!/bin/bash

# Check if .env file exists, if not copy from .env.example
if [ ! -f .env ]; then
    cp .env.example .env
fi

php -r "chmod('.env', 0777);"

## Set the JWT_PASSPHRASE variable in the .env file
#JWT_PASSPHRASE=$(openssl rand -base64 48)
#sed -i "s/^JWT_PASSPHRASE=.*/JWT_PASSPHRASE=${JWT_PASSPHRASE}/" .env

# Update the composer
composer update

# Install dependencies
composer install

# Ensure the config/jwt directory exists
mkdir -p config/jwt

# Check if JWT keys already exist
if [ ! -f config/jwt/private.pem ] || [ ! -f config/jwt/public.pem ]; then
    # Generate jwt keypair
    php bin/console lexik:jwt:generate-keypair
else
    echo "JWT keys already exist, skipping key generation."
fi