

### General Commands

```bash
make start      # Stop , Build images, start all containers and show logs
make up         # Start all Docker containers
make down       # Stop all Docker containers
make logs       # Show all container logs
make clean      # Remove all containers, volumes, and prune system
```

### Web (Frontend) Specific Commands

```bash
make start-web  # Stop, rebuild, and start web container with logs
make up-web     # Start only web container (no rebuild)
make down-web   # Stop and remove web container
make bash-web   # Connect to web container shell
```

### API (Backend) Specific Commands

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


# HomeUnactive PWA

HomeUnactive is a Progressive Web Application (PWA) for tracking and analyzing sports training sessions. It features robust offline capabilities, device hardware integration, and a responsive design for all devices.

## Features

### Offline Functionality

The application works seamlessly offline with the following features:

- **Service Worker**: Implements advanced caching strategies for assets and API requests
- **Offline Data Storage**: Uses IndexedDB to store data when offline
- **Request Queuing**: Automatically queues API requests made while offline
- **Background Sync**: Synchronizes queued requests when connection is restored
- **Offline Authentication**: Maintains user login state even when offline
- **Reconnection System**: Automatically attempts to reconnect every 10 seconds
- **Network Status Indicators**: Clear visual feedback about connectivity status

### Device Features

The PWA integrates with device hardware capabilities:

- **Camera Access**: Capture photos/video using device cameras
- **Flash Control**: Toggle the camera flash/torch when available
- **Vibration**: Provide haptic feedback through device vibration
- **Device Test Page**: Available at `/device-test` route

## Accessing on Mobile Devices

To test the PWA on your mobile device:

1. Ensure your phone is on the same WiFi network as the development machine
2. Access the application via the local IP address (e.g., `http://IPADRESS:9999`)
3. For full PWA experience, add to home screen from your browser menu