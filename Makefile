.PHONY: start build up down logs bash-web bash-api clean

# Default target
start: down build up logs

# Build Docker images
build:
	docker compose build

# Build and start only web container
start-web: down-web build-web
	docker compose up -d web
	docker compose logs -f web

# Build and start only API container
start-api: down-api build-api
	docker compose up -d api
	docker compose logs -f api

# Stop only web container
down-web:
	docker compose stop web
	docker compose rm -f web

# Stop only API container
down-api:
	docker compose stop api
	docker compose rm -f api

# Build only web container
build-web:
	docker compose build web

# Build only API container
build-api:
	docker compose build api

# Start Docker containers
up:
	docker compose up -d
	docker compose logs -f

# Start only web container
up-web:
	docker compose up -d web
	docker compose logs -f web

# Start only API container
up-api:
	docker compose up -d api
	docker compose logs -f api

# Stop Docker containers
down:
	docker compose down

# Show container logs
logs:
	docker compose logs -f

# Connect to frontend container bash
bash-web:
	docker compose exec web sh

# Connect to backend container bash
bash-api:
	docker compose exec api bash

# Clean up Docker resources
clean:
	docker compose down -v
	docker system prune -f