# HomeUnactive - Sports Training Journal PWA

HomeUnactive is a Progressive Web App (PWA) designed to help users track and analyze their sports training sessions. With a modern, mobile-first interface and powerful features, HomeUnactive makes it easy to record workouts, monitor progress, and stay motivated.

## Features

- **PWA Capabilities**: Install on any device, use offline, and receive push notifications
- **Training Management**: Create, view, edit, and delete workout sessions
- **Voice Recognition**: Record workout details hands-free using speech input
- **Statistics and Progress Tracking**: Visualize your training progress over time
- **AI-Powered Motivation Quotes**: Stay motivated with dynamic quotes
- **Modern UI with Dark Mode**: Enjoy a sleek interface that's easy on the eyes
- **Mobile-First Design**: Optimized for use on smartphones and tablets

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Symfony - api
- **Authentication**: Custom authentication system
- **Deployment**: Docker containerization

## Voice Recognition Feature

The voice recognition feature allows users to record workout details using speech input. This hands-free approach makes it easier to log workouts during active training sessions.

### How to Use Voice Recognition

1. Navigate to the "New Workout" page
2. Click the microphone icon next to the input field you want to fill using voice
3. Speak clearly to record your workout details
4. The app will process your speech and extract relevant information

### Voice Commands Examples

- For exercise names: "Développé couché" or "Squat"
- For sets and reps: "4 séries de 12 répétitions"
- For weight: "80 kilos"

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Docker and Docker Compose (for containerized deployment)
- MySQL (if running locally without Docker)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/HomeUnactive.git
   cd HomeUnactive
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and other settings
   ```

4. Run database migrations

   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server

   ```bash
   npm run dev
   ```

### Docker Deployment

```bash
# Build and start containers
make build
make up

# View logs
make logs

# Stop containers
make down

# Connect to container shell
make bash
```

## Browser Compatibility

The voice recognition feature works best on Chrome, Edge, and Safari. Firefox requires enabling the `media.webspeech.recognition.enable` flag in `about:config`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
