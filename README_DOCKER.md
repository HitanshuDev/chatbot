# AI Chatbot Platform - Full-Stack Application

A comprehensive multi-tenant AI chatbot platform with RAG (Retrieval Augmented Generation) capabilities, built with Next.js, Express, MongoDB, and OpenAI.

## 🚀 Quick Start - Run Everything with Docker

### One-Command Setup

```bash
docker compose up
```

That's it! The entire application will start with all services:
- ✅ Frontend (http://localhost:3001)
- ✅ Backend API (http://localhost:3000)
- ✅ MongoDB Database
- ✅ Redis Cache

### Or Use the Startup Scripts

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
bash start.sh
```

## 📋 Prerequisites

- Docker (v20.10+) - [Install Docker](https://www.docker.com/products/docker-desktop)
- Docker Compose (v2.0+)

## ⚙️ Configuration

Before starting, update the `.env` file in the project root:

```env
# Required: Your OpenAI API key
OPENAI_API_KEY=sk-your-actual-api-key-here

# Optional: Google OAuth
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📚 Full Documentation

For detailed information about Docker setup, see [DOCKER_SETUP.md](DOCKER_SETUP.md)

### Project Structure

```
chatbot/
├── backend/                    # Express API Server
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # MongoDB schemas
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth & custom middleware
│   │   └── utils/              # Utilities (OpenAI, Redis, etc)
│   ├── Dockerfile              # Multi-stage Docker build
│   └── package.json
│
├── frontend/                   # Next.js Web Application
│   ├── src/
│   │   ├── app/                # Pages and layouts
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   └── store/              # Zustand state management
│   ├── Dockerfile              # Multi-stage Docker build
│   └── package.json
│
├── docker-compose.yml          # Docker Compose configuration
├── .env                        # Environment variables
├── start.bat                   # Windows startup script
├── start.sh                    # Mac/Linux startup script
└── DOCKER_SETUP.md            # Detailed Docker guide
```

## 🎯 Features

- **Multi-tenant Architecture**: Each bot/user has isolated conversations
- **RAG Capabilities**: Upload documents for context-aware responses
- **Real-time Chat**: WebSocket support for live conversations
- **Analytics Dashboard**: Track bot usage and performance
- **API Key Management**: Secure API access for integrations
- **Document Upload**: Support for PDFs and text files with embedding
- **Response Caching**: Redis-backed caching for optimization
- **Beautiful UI**: Modern dashboard with Tailwind CSS & shadcn/ui

## 🔧 Available Services

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3001 | Next.js web application |
| Backend API | 3000 | Express API server |
| MongoDB | 27017 | Database (internal) |
| Redis | 6379 | Cache (internal) |

## 📖 API Documentation

The backend provides a comprehensive REST API:

- **Authentication**: `/v1/auth/*` - Login, signup, OAuth
- **Bots**: `/v1/bots/*` - Create, manage, configure bots
- **Messages**: `/v1/*` - Conversations and messaging
- **Documents**: `/v1/*` - Upload and manage documents
- **Analytics**: `/v1/*` - Usage statistics and metrics
- **Widget**: `/v1/*` - Embeddable chat widget

See `backend/README.md` for detailed API documentation.

## 🛠️ Development

### Running Without Docker

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Making Changes in Docker

All source code is mounted as volumes in Docker development mode. Changes are automatically reflected with hot reload.

## 🧪 Testing

```bash
# Backend tests
docker compose exec backend npm test

# Frontend tests
docker compose exec frontend npm test
```

## 🐛 Troubleshooting

### Port Already in Use
Modify port mappings in `docker-compose.yml`:
```yaml
ports:
  - "3002:3000"  # Change to any available port
```

### Services Won't Start
Check logs:
```bash
docker compose logs -f
```

### Clear Everything
```bash
docker compose down -v
docker system prune -a
docker compose up --build
```

## 📊 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────┐      ┌──────────────────┐    │
│  │   Frontend       │      │   Backend API    │    │
│  │  (Next.js)       │      │  (Express)       │    │
│  │  Port 3001       │      │  Port 3000       │    │
│  └────────┬─────────┘      └────────┬─────────┘    │
│           │                         │                │
│           └──────────┬──────────────┘                │
│                      │                               │
│        ┌─────────────┴─────────────┐                │
│        │                           │                │
│  ┌─────▼────────┐          ┌──────▼────────┐      │
│  │  MongoDB     │          │    Redis      │      │
│  │  Database    │          │    Cache      │      │
│  └──────────────┘          └───────────────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📦 Technology Stack

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- Zustand (State Management)
- Axios (HTTP Client)

**Backend:**
- Express.js
- TypeScript
- MongoDB
- Redis
- OpenAI SDK
- JWT Authentication

**DevOps:**
- Docker
- Docker Compose
- Multi-stage builds

## 🚢 Production Deployment

For production deployment:

1. Update `docker-compose.prod.yml` with production settings
2. Set `NODE_ENV=production`
3. Configure production database and Redis
4. Set up SSL/TLS
5. Configure domain and API endpoints
6. Deploy with your preferred orchestration platform

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions:
1. Check [DOCKER_SETUP.md](DOCKER_SETUP.md) for Docker-specific help
2. See backend/README.md and frontend/README.md for project details
3. Open an issue on GitHub

---

**Built with ❤️ for the AI community**

Start building amazing chatbots today with `docker compose up`! 🚀
