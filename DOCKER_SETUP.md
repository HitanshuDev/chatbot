# 🚀 Chatbot Platform - Docker Setup Guide

This guide will help you run the entire chatbot platform with a single Docker Compose command.

## Prerequisites

- **Docker** (v20.10+) - [Install Docker](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (v2.0+) - Usually comes with Docker Desktop

## Quick Start

### 1. Configure Environment Variables

First, update the `.env` file in the project root with your API keys:

```bash
# .env file location: ./chatbot/.env

# Add your OpenAI API key (required)
OPENAI_API_KEY=sk-your-actual-api-key-here

# Optional: Add Google OAuth credentials if needed
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Start the Entire Application

Run this single command from the project root:

```bash
docker compose up
```

That's it! The entire application will start with:
- ✅ MongoDB database
- ✅ Redis cache
- ✅ Backend API (running on http://localhost:3000)
- ✅ Frontend application (running on http://localhost:3001)

### 3. Access the Application

Once all services are running:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/v1
- **Health Check**: http://localhost:3000/health

## What Gets Started

### Services

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3001 | Next.js web application |
| Backend | 3000 | Express API server |
| MongoDB | 27017 | Database (internal) |
| Redis | 6379 | Cache (internal) |

### Database Access (if needed)

**MongoDB:**
- Connection String: `mongodb://root:password@localhost:27017/chatbot?authSource=admin`
- Username: `root`
- Password: `password`

**Redis:**
- Connection String: `redis://localhost:6379`

## Development Mode

The `docker-compose.yml` is configured for **development** with:
- Hot reload enabled for both frontend and backend
- Source code mounted as volumes for live changes
- Development dependencies installed
- `npm run dev` commands active

### Making Changes

While `docker compose up` is running:
1. Edit files in your IDE
2. Changes are automatically reflected in the containers
3. The applications will hot-reload

## Stopping the Application

```bash
# Stop all services
docker compose down

# Stop and remove volumes (warning: deletes all data)
docker compose down -v
```

## View Logs

```bash
# View all service logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
docker compose logs -f redis
```

## Production Deployment

For production, create a separate `docker-compose.prod.yml`:

```yaml
# Use the production build stages from Dockerfiles
services:
  backend:
    build:
      context: ./backend
      target: production
    environment:
      NODE_ENV: production
      # ... other production vars

  frontend:
    build:
      context: ./frontend
      target: production
    environment:
      NODE_ENV: production
      # ... other production vars
```

Then run:
```bash
docker compose -f docker-compose.prod.yml up
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" error, either:
1. Stop the conflicting service
2. Or change the port mapping in `docker-compose.yml`:
   ```yaml
   ports:
     - "3002:3000"  # Change 3002 to any available port
   ```

### MongoDB Connection Error

Wait a few seconds for MongoDB to start. The healthcheck ensures MongoDB is ready before other services start.

### Services Not Starting

Check logs:
```bash
docker compose logs backend
docker compose logs frontend
```

### Clear Everything and Start Fresh

```bash
docker compose down -v
docker system prune -a
docker compose up --build
```

## Architecture

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

## Environment Variables Reference

### Backend (.env)
```
# MongoDB
MONGO_URI=mongodb://root:password@mongodb:27017/chatbot?authSource=admin

# Redis
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-change-in-production

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Server
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000
```

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

## Next Steps

1. Access the frontend at http://localhost:3001
2. Create an account and start using the chatbot platform
3. Configure your bots and upload documents
4. Monitor API usage and analytics

## Support

For detailed project documentation, check:
- `backend/README.md` - Backend setup and API details
- `frontend/README.md` - Frontend setup and component guide
- `backend/SETUP_GUIDE.md` - Detailed backend configuration

---

**Happy Coding! 🎉**
