# 🚀 Docker Compose Quick Reference

## One Command to Rule Them All

```bash
docker compose up
```

## Access Points

| What | URL | Port |
|------|-----|------|
| Web App | http://localhost:3001 | 3001 |
| API | http://localhost:3000/v1 | 3000 |
| Health | http://localhost:3000/health | 3000 |

## Setup (First Time Only)

```bash
# 1. Edit .env with your OpenAI API key
nano .env
# or
# OPENAI_API_KEY=sk-xxx...

# 2. Start everything
docker compose up
```

## Essential Commands

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Rebuild and start
docker compose up --build

# Fresh start (delete all data)
docker compose down -v
docker compose up
```

## Debugging

```bash
# View all logs
docker compose logs

# View specific service
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb
docker compose logs redis

# Last 100 lines
docker compose logs --tail 100

# Follow logs
docker compose logs -f

# Test backend
docker compose exec backend npm test

# Test frontend
docker compose exec frontend npm test
```

## Services

| Service | Container | Purpose |
|---------|-----------|---------|
| Frontend | chatbot-frontend | Web UI on port 3001 |
| Backend | chatbot-backend | API on port 3000 |
| MongoDB | chatbot-mongodb | Database |
| Redis | chatbot-redis | Cache |

## Ports

```
3001 → Frontend (Next.js)
3000 → Backend (Express API)
27017 → MongoDB (internal)
6379 → Redis (internal)
```

## Troubleshooting

**Port in use?**
```bash
# Change port in docker-compose.yml
# ports: ["3002:3000"]  # Use 3002 instead
```

**Services won't start?**
```bash
docker compose down -v
docker compose up
```

**Clear everything?**
```bash
docker compose down -v
docker system prune -a
docker compose up --build
```

**Check if Docker is running?**
```bash
docker --version
docker ps
```

## Environment Variables (.env)

```env
# Required - Get from OpenAI
OPENAI_API_KEY=sk-your-key-here

# Optional - For Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

## Files Created

```
root/
├── docker-compose.yml        ← Main orchestration
├── .env                      ← Your config
├── start.bat                 ← Windows launcher
├── start.sh                  ← Mac/Linux launcher
├── DOCKER_SETUP.md           ← Full guide
├── README_DOCKER.md          ← Project info
└── DOCKER_SETUP_COMPLETE.md  ← Setup summary

backend/
├── Dockerfile                ← Multi-stage build
└── .dockerignore

frontend/
├── Dockerfile                ← Multi-stage build
└── .dockerignore
```

## Architecture

```
Your Computer
    ↓
Docker Compose
    ├─ Frontend (Port 3001)
    ├─ Backend API (Port 3000)
    ├─ MongoDB
    └─ Redis
```

## Before First Run

1. ✅ Install Docker Desktop
2. ✅ Edit `.env` with API keys
3. ✅ Run `docker compose up`
4. ✅ Wait for "ready" messages
5. ✅ Open http://localhost:3001

## Pro Tips

- Changes to code auto-reload (hot reload enabled)
- All services talk to each other automatically
- Data persists in volumes even after `down`
- Use `docker compose down -v` to delete data
- Check logs to debug issues
- Services have health checks

## Need Help?

```bash
# View full documentation
cat DOCKER_SETUP.md
cat README_DOCKER.md

# See all available commands
docker compose --help
```

## Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

---

**Start now:** `docker compose up` 🚀
