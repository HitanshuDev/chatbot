# 🚀 AI Chatbot Platform - Complete Setup Guide

## Project Complete! ✅

Your AI Chatbot Platform backend has been fully implemented with all enterprise-grade features. Here's what's been built:

## ✨ What's Included

### 1. **Authentication & Authorization**
- JWT token-based authentication
- Google OAuth 2.0 integration
- API key management for bots
- User registration and login
- Token refresh functionality

### 2. **Bot Management**
- Full CRUD operations
- Bot configuration (name, avatar, theme, prompts)
- LLM model selection
- Temperature and token limit settings
- API key generation and management

### 3. **Conversation & Messaging**
- Start and manage conversations
- Multi-turn conversations with history
- Real-time message exchange
- Message deletion
- Conversation context management

### 4. **RAG & Embeddings**
- Document upload (PDF, TXT, DOCX, URLs)
- Text chunking with overlap
- Vector embedding generation via OpenAI
- Semantic search across embeddings
- Cosine similarity matching
- Document processing status tracking

### 5. **LLM Integration**
- OpenAI API integration
- Response caching (24-hour TTL)
- Temperature and token control
- Context window management
- Custom prompts and instructions

### 6. **Analytics & Metrics**
- Conversation tracking
- Message counting
- Usage statistics
- Weekly metrics
- Response time calculation
- Detailed analytics queries

### 7. **Widget Embedding**
- Standalone JavaScript widget
- Embeddable chat interface
- Real-time conversation
- Lightweight and performant
- Customizable appearance

### 8. **Async Processing**
- Bull MQ job queue setup
- Embedding generation worker
- Analytics processing worker
- Scalable background jobs

### 9. **Caching & Performance**
- Redis caching for responses
- Embedding caching
- Configuration caching
- Fast query responses

### 10. **Security**
- Tenant data isolation
- API key encryption
- JWT validation
- CORS configuration
- Error sanitization

## 📦 Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── bot.controller.ts
│   │   ├── message.controller.ts
│   │   ├── upload.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── widget.controller.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── bot.model.ts
│   │   ├── conversation.model.ts
│   │   ├── message.model.ts
│   │   ├── upload.model.ts
│   │   ├── embedding.model.ts
│   │   └── apiKey.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── bot.routes.ts
│   │   ├── message.routes.ts
│   │   ├── upload.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── widget.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── botAuth.middleware.ts
│   ├── utils/
│   │   ├── openai.ts
│   │   ├── apiKey.ts
│   │   └── redis.ts
│   ├── config/
│   │   └── index.ts
│   ├── workers/
│   │   ├── embedding.worker.ts
│   │   └── analytics.worker.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
# Create .env file with your configuration
cp .env.example .env

# Edit .env and set:
# - MONGO_URI (MongoDB connection)
# - REDIS_URL (Redis connection)
# - OPENAI_API_KEY (OpenAI API key)
# - JWT_SECRET (JWT secret key)
# - Other optional settings
```

### 3. Start Services

**Option A: Using Docker (Recommended)**
```bash
# Start MongoDB and Redis using Docker
docker run -d -p 27017:27017 --name mongodb mongo:5.0
docker run -d -p 6379:6379 --name redis redis:7.0
```

**Option B: Manual Setup**
```bash
# Ensure MongoDB is running on localhost:27017
mongod

# In another terminal, ensure Redis is running on localhost:6379
redis-server
```

### 4. Run Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 5. (Optional) Run Workers
```bash
# In separate terminals
npm run worker:embedding
npm run worker:analytics
```

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Create a Bot
```bash
curl -X POST http://localhost:3000/v1/bots \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Bot",
    "description": "Customer support chatbot",
    "avatar": "https://example.com/avatar.png",
    "initialPrompt": "You are a helpful customer support agent."
  }'
```

### 4. Start a Conversation
```bash
curl -X POST http://localhost:3000/v1/bots/YOUR_BOT_ID/conversations \
  -H "Content-Type: application/json"
```

### 5. Send a Message
```bash
curl -X POST http://localhost:3000/v1/conversations/YOUR_CONVERSATION_ID/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, how can I help you?"
  }'
```

### 6. Get Widget Script
```bash
# This returns a JavaScript snippet that can be embedded
curl http://localhost:3000/v1/bots/YOUR_BOT_ID/script.js
```

## 📊 Database Schemas

### Users Collection
- Stores user credentials and profile information
- Supports both password-based and OAuth authentication

### Bots Collection
- Stores bot configurations
- References to owner (User)
- API key for public access
- LLM parameters

### Conversations Collection
- Stores conversation sessions
- References to bot
- Metadata (user agent, IP, source)

### Messages Collection
- Individual messages in conversations
- Sender identification (user/bot)
- Token tracking for cost analysis
- Metadata (confidence, sources)

### Uploads Collection
- Document upload tracking
- Processing status
- References to embeddings
- Error logging

### Embeddings Collection
- Vector embeddings of chunked documents
- Text chunks
- Metadata (page number, source)
- Indexed for similarity search

### APIKeys Collection
- API key records
- Rate limiting per key
- Last used tracking
- Expiration dates

## 🔑 Key Features

### Multi-Tenancy
- Complete data isolation per user
- Tenant-specific API keys
- Secure bot access

### Caching Strategy
- 24-hour response caching
- 7-day embedding caching
- Redis-backed cache
- Reduces LLM costs

### Scalability
- Stateless services (ready for K8s)
- Async job processing
- Database indexing
- Horizontal scaling ready

### Performance
- Response time tracking
- Message batching
- Vector similarity search
- Optimized queries

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ |
| Language | TypeScript |
| Framework | Express.js |
| Database | MongoDB |
| Cache | Redis |
| Queue | Bull MQ |
| LLM | OpenAI API |
| Auth | JWT + OAuth |

## 📝 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Run production build
npm run test             # Run tests
npm run worker:embedding # Start embedding worker
npm run worker:analytics # Start analytics worker
```

## 🔐 Environment Variables

```env
# Database
MONGO_URI=mongodb://localhost:27017/chatbot

# Cache
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key

# LLM
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-3.5-turbo

# Server
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000
```

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'redis'"
**Solution:** Run `npm install redis`

### Issue: "MongoDB connection refused"
**Solution:** Ensure MongoDB is running on localhost:27017

### Issue: "OPENAI_API_KEY not found"
**Solution:** Set your OpenAI API key in .env file

### Issue: "JWT token invalid"
**Solution:** Ensure JWT_SECRET is set correctly and token hasn't expired

## 📚 Next Steps

1. **Frontend Development**: Build a React/Vue frontend to consume these APIs
2. **Admin Dashboard**: Create analytics dashboard for bot creators
3. **Advanced RAG**: Integrate vector databases (Pinecone, Weaviate)
4. **Multiple LLMs**: Support Claude, Cohere, etc.
5. **Streaming Responses**: Implement Server-Sent Events
6. **Payment Integration**: Add Stripe for monetization
7. **Mobile App**: Build mobile client
8. **Docker Deployment**: Containerize for production

## 🤝 Contributing

The project is fully functional and ready for:
- Feature additions
- Performance optimization
- Integration with other services
- Deployment to production

## 📞 Support

For questions or issues:
1. Check the README.md
2. Review the API documentation
3. Check database schemas
4. Review error logs

## 📄 License

MIT License - feel free to use and modify

---

**🎉 Your AI Chatbot Platform is ready to launch!**

Start the development server with `npm run dev` and begin building amazing chatbot experiences!
