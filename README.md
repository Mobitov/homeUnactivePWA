# Makefile Commands

## General Commands

```bash
make start      # Stop , Build images, start all containers and show logs
make up         # Start all Docker containers
make down       # Stop all Docker containers
make logs       # Show all container logs
make clean      # Remove all containers, volumes, and prune system
```

## Web (Frontend) Specific Commands

```bash
make start-web  # Stop, rebuild, and start web container with logs
make up-web     # Start only web container (no rebuild)
make down-web   # Stop and remove web container
make bash-web   # Connect to web container shell
```

## API (Backend) Specific Commands

```bash
make start-api  # Stop, rebuild, and start API container with logs
make up-api     # Start only API container (no rebuild)
make down-api   # Stop and remove API container
make bash-api   # Connect to API container shell
```

## Development Workflow Examples

Start everything:

```bash
make start
```

Work on frontend only:

```bash
make start-web  # With rebuild
# or
make up-web     # Without rebuild
```

Work on backend only:

```bash
make start-api  # With rebuild
# or
make up-api     # Without rebuild
```

Clean up everything:

```bash
make clean
```
