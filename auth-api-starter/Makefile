# Executables (local)
DOCKER_COMP = docker-compose

# Docker containers
PHP_CONT = $(DOCKER_COMP) exec php

# Services
API_CONT = $(DOCKER_COMP) exec api

## —— 🎵 🐳 The Auth api starter Makefile 🐳 🎵 ——————————————————————————————————

help: ## Outputs this help screen
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

## —— Docker 🐳 ————————————————————————————————————————————————————————————————

build: ## Builds the Docker images
	@$(DOCKER_COMP) build --pull --no-cache

up: ## Start the docker hub in detached mode (no logs)
	@$(DOCKER_COMP) up --detach

start: build up logs ## Build and start the containers, then show logs

down: ## Stop the docker hub
	@$(DOCKER_COMP) down --remove-orphans

logs: ## Show live logs
	@$(DOCKER_COMP) logs --tail=0 --follow

bash: ## Connect to the specified service container via bash
	@$(eval s = $(word 2, $(MAKECMDGOALS)))  # Get the second word from the Makefile command (service name)
	@if [ "$(s)" = "api" ]; then \
		$(API_CONT) bash; \
	else \
		echo "Invalid service name: $(s). Valid options are: api."; \
		exit 1; \
	fi