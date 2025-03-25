# Executables (local)
DOCKER_COMP = docker compose -f ../docker-compose.yml

# Docker containers
API_CONT = $(DOCKER_COMP) exec api

# Executables
PHP      = $(API_CONT) php
COMPOSER = $(API_CONT) composer
SYMFONY  = $(PHP) bin/console

# Executables: vendors
PHPUNIT = ./vendor/bin/phpunit
PHPSTAN = ./vendor/bin/phpstan
PHP_CS_FIXER = ./vendor/bin/php-cs-fixer


## —— 🎵 🐳 The Symfony Docker Makefile 🐳 🎵 ——————————————————————————————————
help: ## Outputs this help screen
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

bash: ## Connect to the FrankenPHP container via bash so up and down arrows go to previous commands
	@$(API_CONT) bash


## —— Composer 🧙 ——————————————————————————————————————————————————————————————
composer: ## Run composer, pass the parameter "c=" to run a given command, example: make composer c='req symfony/orm-pack'
	@$(eval c ?=)
	@$(COMPOSER) $(c)

vendor: ## Install vendors according to the current composer.lock file
vendor: c=install --prefer-dist --no-dev --no-progress --no-scripts --no-interaction
vendor: composer

vendor-dev: ## Install vendors according to the current composer.lock file
vendor-dev: c=install --prefer-dist --no-progress --no-scripts --no-interaction
vendor-dev: composer

## —— Symfony 🎵 ———————————————————————————————————————————————————————————————
sf: ## List all Symfony commands or pass the parameter "c=" to run a given command, example: make sf c=about
	@$(eval c ?=)
	@$(SYMFONY) $(c)

cc: c=c:c ## Clear the cache
cc: sf

## —— Coding standards ✨ ——————————————————————————————————————————————————————
stan: ## Run PHPStan
	@$(PHPSTAN) analyse -c phpstan.dist.neon --memory-limit 1G

lint-php: ## Lint files with php-cs-fixer
	@$(PHP_CS_FIXER) fix --allow-risky=yes --dry-run --config=.php-cs-fixer.dist.php -vvv

fix-php: ## Fix files with php-cs-fixer
	@PHP_CS_FIXER_IGNORE_ENV=1 $(PHP_CS_FIXER) fix --allow-risky=yes --config=.php-cs-fixer.dist.php -vvv