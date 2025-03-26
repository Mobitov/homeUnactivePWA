#!/bin/bash

# Run the setup.sh script
bash setup.sh

php bin/console doctrine:database:drop --if-exists --force
php bin/console doctrine:database:create
php bin/console doctrine:schema:update --force

# Load fixtures if they exist
if [ -f src/DataFixtures/AppFixtures.php ]; then
    echo "📥 Loading fixtures..."
    php bin/console doctrine:fixtures:load --no-interaction
    echo "✅ Fixtures loaded successfully"
fi

# Clear cache
php bin/console cache:clear

# Start Apache
apache2-foreground