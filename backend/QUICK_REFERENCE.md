# ⚡ Quick Reference Guide

## 🚀 Start in 30 seconds

```bash
# Install, setup, and run
npm install
cp .env.example .env
docker-compose up -d
npm run dev
```

## 📋 Essential Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Run production build

# Testing
curl http://localhost:3000/health

# Workers
npm run worker:embedding   # Start embedding worker
npm run worker:analytics   # Start analytics worker

# Docker
docker-compose up -d       # Start all services
docker-compose down        # Stop services
docker-compose logs -f     # View logs
```

## 🔑 Environment Variables

```
MONGO_URI=mongodb://localhost:27017/chatbot
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-key
PORT=3000
```

## 📚 Key Files

| File | Purpose |
|------|---------|
| `src/app.ts` | Express app setup |
| `src/server.ts` | Server entry point |
| `src/models/*` | Database schemas |
| `src/controllers/*` | Business logic |
| `src/routes/*` | API endpoints |
| `src/middleware/*` | Authentication |

## 🔌 API Quick Reference

### Auth
```bash
POST /v1/auth/signup        # Register
POST /v1/auth/login         # Login
POST /v1/auth/google        # OAuth
```

### Bots
```bash
POST /v1/bots               # Create
GET /v1/bots                # List
GET /v1/bots/:botId         # Get
PATCH /v1/bots/:botId       # Update
DELETE /v1/bots/:botId      # Delete
```

### Conversations
```bash
POST /v1/bots/:botId/conversations         # Start
GET /v1/conversations/:conversationId      # Get
```

### Messages
```bash
POST /v1/conversations/:conversationId/messages    # Send
GET /v1/conversations/:conversationId/messages     # List
```

### Analytics
```bash
GET /v1/bots/:botId/usage        # Usage stats
GET /v1/bots/:botId/metrics      # Metrics
```

### Widget
```bash
GET /v1/bots/:botId/script.js    # Embed script
```

## 🗄️ Database Collections

```javascript
// User
{ email, password, googleId, name, avatar, isVerified }

// Bot
{ name, ownerId, apiKey, theme, initialPrompt, temperature, maxTokens, model }

// Conversation
{ botId, userId, messages[], metadata }

// Message
{ conversationId, botId, sender, content, tokens }

// Upload
{ botId, fileName, fileType, status, embeddingIds[] }

// Embedding
{ botId, uploadId, text, embedding[], metadata }

// APIKey
{ botId, userId, key, isActive, rateLimit }
```

## 🔐 Authentication

```bash
# Get JWT token
Authorization: Bearer <your-jwt-token>

# API Key (for widget)
x-api-key: <your-api-key>
```

## 💾 Common Tasks

### Create a Bot
```bash
curl -X POST http://localhost:3000/v1/bots \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Bot","initialPrompt":"You are helpful."}'
```

### Start Conversation
```bash
curl -X POST http://localhost:3000/v1/bots/BOT_ID/conversations
```

### Send Message
```bash
curl -X POST http://localhost:3000/v1/conversations/CONV_ID/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello!"}'
```

### Upload Document
```bash
curl -X POST http://localhost:3000/v1/bots/BOT_ID/uploads \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"doc.pdf","fileType":"pdf","content":"..."}'
```

## 🧪 Testing Tools

- **Postman**: Import `API_COLLECTION.json`
- **cURL**: Use commands above
- **Thunder Client**: VS Code extension
- **REST Client**: VS Code extension

## 📊 Monitor Services

```bash
# MongoDB
mongo mongodb://localhost:27017/chatbot

# Redis
redis-cli
redis-cli INFO stats

# Docker
docker-compose logs -f
docker stats
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB not found | Run `mongod` or `docker-compose up` |
| Redis not found | Run `redis-server` or check Docker |
| OpenAI error | Check OPENAI_API_KEY in .env |
| JWT invalid | Token expired or wrong secret |
| CORS error | Check CORS config in app.ts |

## 📖 Documentation

- **README.md** - Full documentation
- **SETUP_GUIDE.md** - Detailed setup
- **DEPLOYMENT.md** - Production guide
- **PROJECT_SUMMARY.md** - Complete overview

## 🚀 Deploy Checklist

- [ ] NODE_ENV=production
- [ ] Strong JWT_SECRET
- [ ] OPENAI_API_KEY set
- [ ] MONGO_URI configured
- [ ] REDIS_URL configured
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] SSL/HTTPS enabled

## 📱 Frontend Integration

```javascript
// Include widget in HTML
<script src="http://localhost:3000/v1/bots/BOT_ID/script.js"></script>
```

---

**Need more help? Check the full documentation files!** 📚
