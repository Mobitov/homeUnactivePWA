.PHONY: start build up down logs bash clean

# Default target
start: build up logs

# Build Docker images
build:
	 docker compose build

# Start Docker containers
up:
	 docker compose up -d

# Stop Docker containers
down:
	 docker compose down

# Show container logs
logs:
	 docker compose logs -f

# Connect to container bash
bash:
	 docker compose exec web sh

# Clean up Docker resources
clean:
	 docker compose down -v
	 docker system prune -f
