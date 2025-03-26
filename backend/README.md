# Auth API Starter

## Table of Contents

- [Project Setup](#project-setup)
    - [Docker Deployment](#docker-deployment)
    - [Manual Installation](#manual-installation)
    - [Default Users](#default-users)
- [Authentication Endpoints](#authentication-endpoints)
    - [User Registration](#1-user-registration)
        - [Basic User Registration](#basic-user-registration)
        - [Registration with Profile Picture](#registration-with-profile-picture)
        - [Email Confirmation](#email-confirmation)
    - [User Authentication](#2-user-authentication)
        - [Login](#login)
        - [Logout](#logout)
    - [User Management](#3-user-management)
        - [Get User by ID](#get-user-by-id)
        - [Get All Users](#get-all-users)
        - [Update User](#update-user)
        - [Update User with Profile Picture](#update-user-with-profile-picture)
    - [Account Recovery](#4-account-recovery)
        - [Forgot Password](#forgot-password)
        - [Reset Password](#reset-password)
    - [Account Deletion](#5-account-deletion)
        - [Send Delete Code](#send-delete-code)
        - [Delete User](#delete-user)
- [Development Tools](#development-tools)
    - [PHP CS Fixer](#php-cs-fixer)
    - [PHPStan Static Analysis](#phpstan-static-analysis)
- [CORS Configuration](#cors-configuration)

## Project Setup

### Docker Deployment

```bash
docker compose up --build or make start
```

- **Endpoint:** http://localhost:1111/

### Manual Installation

```bash
sh instalation.sh
symfony server:start 
```

- **Endpoint:** http://127.0.0.1:8000/

### Default Users

- User:
    - Username: user
    - Email: user@example.com
    - Roles: ROLE_USER
    - Password: user

- Admin:
    - Username: admin
    - Email: admin@example.com
    - Roles: ROLE_ADMIN, ROLE_USER
    - Password: admin

## Authentication Endpoints

### 1. User Registration

#### Basic User Registration

- Register a new user with a username, password, and email.

```bash
curl -X POST http://localhost:1111/api/register \
     -H "Content-Type: application/json" \
     -d '{
         "username": "newuser",
         "password": "StrongPass123!",
         "email": "newuser@example.com"
     }'
```

#### Registration with Profile Picture

- Register a new user with a username, password, email, and profile picture.

```bash
curl -X POST http://127.0.0.1:8000/api/register \
     -H "Content-Type: multipart/form-data" \
     -F 'json={"username":"johndoe","password":"SecurePass456!","email":"johndoe@example.com"}' \
     -F 'profileImage=@/path/to/profile/picture.jpg'
```

#### Email Confirmation

- Allow the user to confirm their email address.
- After registration, the user receives an email with a confirmation link .
- The confirmation link contains a token that is used to confirm the email.
- Exp: http://localhost/confirm?token=19ea2aa31472c3a53e99a50404da04bfb47a43f7e4ba95660adade8a626426a2

```bash
curl -X POST http://localhost:1111/api/confirm/YOUR_CONFIRMATION_TOKEN \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" 
```

### 2. User Authentication

#### Login

```bash
curl -X POST http://localhost:1111/api/login \
     -H "Content-Type: application/json" \
     -d '{
         "identifier": "username",
         "password": "password"
     }'
```

#### Logout

- Logs out the user by clearing the token from the cookie.

```bash
curl -X POST http://localhost:1111/api/logout \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. User Management

#### Get User by ID

- Retrieves the user information by passing the user ID.
- If user have role `ROLE_ADMIN` can get all users.
- If user have role `ROLE_USER` can get only his information.

```bash
curl -X GET http://localhost:1111/api/get-user/999 \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get All Users

- Retrieves all users information.
- Only user with role `ROLE_ADMIN` can get all users.

```bash
curl -X GET http://localhost:1111/api/get-all-users \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Update User

- Updates the user information by passing the user ID.
- If user have role `ROLE_ADMIN` can update all users.
- If user have role `ROLE_USER` can update only his information.

```bash
curl -X POST http://localhost:1111/api/update-user/999 \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "username": "updatedusername",
         "email": "newemail@example.com"
     }'
```

#### Update User with Profile Picture

- Updates the user information with profile pic by passing the user ID.
- If user have role `ROLE_ADMIN` can update all users.
- If user have role `ROLE_USER` can update only his information.

```bash
curl -X POST http://127.0.0.1:8000/api/update-user/999 \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: multipart/form-data" \
     -F 'json={"username":"newusername","email":"updated@example.com"}' \
     -F 'profileImage=@/path/to/new/profile/picture.jpg'
```

### 4. Account Recovery

#### Forgot Password

- Validates the email.
- Generates a reset token.
- Sends a reset email

```bash
curl -X POST http://localhost:1111/api/forgot-password \
     -H "Content-Type: application/json" \
     -d '{
         "email": "user@example.com"
     }'
```

#### Reset Password

- Validates the reset token.
- Checks token expiration.
- Updates the user's password.

```bash
curl -X POST http://localhost:1111/api/reset-password \
     -H "Content-Type: application/json" \
     -d '{
         "token": "YOUR_RESET_TOKEN",
         "password": "NewSecurePassword123!"
     }'
```

### 5. Account Deletion

#### Send Delete Code

- Sends a code to the user's email for account deletion.

```bash
curl -X GET http://127.0.0.1:8000/api/send-delete-code/999 \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Delete User

- Deletes the user account by passing the delete code received in the email.

```bash
curl -X DELETE http://localhost:1111/api/delete-user/999 \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "code": "667892"
     }'
```

## Development Tools

### PHP CS Fixer

Fix coding standards:

```bash
# Fix with allowed risky changes
./vendor/bin/php-cs-fixer fix --allow-risky=yes --config=.php-cs-fixer.dist.php -vvv

# Dry run (check without modifying)
./vendor/bin/php-cs-fixer fix --allow-risky=yes --dry-run --config=.php-cs-fixer.dist.php -vvv
```

### PHPStan Static Analysis

```bash
./vendor/bin/phpstan analyse -c phpstan.dist.neon --memory-limit 1G
```

**Note:** Replace `YOUR_ACCESS_TOKEN` with the actual JWT token received during login.

## CORS Configuration

The API uses the Nelmio CORS Bundle to handle Cross-Origin Resource Sharing (CORS). The configuration allows requests
from specific origins.

### Configuration File

- **Location:** `api/config/packages/nelmio_cors.yaml`

### Allowed Origins

- `http://localhost`
- `http://127.0.0.1`

### Environment Variable

In `.env` file:

```bash
# CORS configuration
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
```

**Note:** This configuration restricts API access to localhost and 127.0.0.1 origins.


# Makefile Commands

## Docker Commands (Root Makefile)
```bash
make start      # Start Docker Containers and Show Logs

make build      # Build Docker Images
make up         # Start Docker Containers  
make down       # Stop Docker Containers
make logs       # Show Live Logs
make bash       # Connect to the specified service container via bash (exp: make bash api)
```

## Composer Commands (Makefile in api folder)
```bash
make composer c='your_command'  # Run Composer Command
```

## Symfony Commands (Makefile  in api folder))
```bash
make sf c='your_command'  # Run Symfony Command
make cc                   # Clear Cache
```

## Coding Standards Commands (Makefile  in api folder))
```bash
make stan      # Run PHPStan
make lint-php  # Lint PHP Files
make fix-php   # Fix PHP Files
```

## Testing Commands (Makefile  in api folder))
```bash
make test      # Run PHPUnit Tests
```