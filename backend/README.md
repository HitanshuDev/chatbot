# 🤖 AI Chatbot Platform - Backend

An enterprise-grade, multi-tenant AI chatbot platform with RAG capabilities, real-time conversations, and intelligent document processing.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Redis 6.0+

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── controllers/
│   ├── auth.controller.ts       # Authentication logic
│   ├── bot.controller.ts        # Bot CRUD operations
│   ├── message.controller.ts    # Conversations & messaging
│   ├── upload.controller.ts     # Document uploads & embeddings
│   ├── analytics.controller.ts  # Usage metrics
│   └── widget.controller.ts     # Widget embedding script
├── models/
│   ├── user.model.ts            # User schema
│   ├── bot.model.ts             # Bot configuration
│   ├── conversation.model.ts    # Conversations
│   ├── message.model.ts         # Messages
│   ├── upload.model.ts          # Uploaded documents
│   ├── embedding.model.ts       # Vector embeddings
│   └── apiKey.model.ts          # API keys
├── routes/
│   ├── auth.routes.ts
│   ├── bot.routes.ts
│   ├── message.routes.ts
│   ├── upload.routes.ts
│   ├── analytics.routes.ts
│   └── widget.routes.ts
├── middleware/
│   ├── auth.middleware.ts       # JWT validation
│   └── botAuth.middleware.ts    # API key validation
├── utils/
│   ├── openai.ts                # OpenAI client
│   ├── apiKey.ts                # API key generation
│   └── redis.ts                 # Redis caching
├── config/
│   └── index.ts                 # Configuration
├── workers/
│   ├── embedding.worker.ts      # Async embedding generation
│   └── analytics.worker.ts      # Analytics processing
├── app.ts                       # Express app setup
└── server.ts                    # Server entry point
```

## 🔌 API Endpoints

### Authentication
- `POST /v1/auth/signup` - Register new user
- `POST /v1/auth/login` - Login with credentials
- `POST /v1/auth/google` - Google OAuth login
- `POST /v1/auth/logout` - Logout
- `POST /v1/auth/refresh` - Refresh JWT token

### Bots
- `POST /v1/bots` - Create new bot
- `GET /v1/bots` - List user's bots
- `GET /v1/bots/:botId` - Get bot details
- `PATCH /v1/bots/:botId` - Update bot
- `DELETE /v1/bots/:botId` - Delete bot
- `GET /v1/bots/:botId/config` - Get bot configuration

### Conversations & Messages
- `POST /v1/bots/:botId/conversations` - Start conversation
- `GET /v1/bots/:botId/conversations` - List conversations
- `GET /v1/conversations/:conversationId` - Get conversation details
- `POST /v1/conversations/:conversationId/messages` - Send message
- `GET /v1/conversations/:conversationId/messages` - Get messages
- `DELETE /v1/messages/:messageId` - Delete message

### Documents & Embeddings
- `POST /v1/bots/:botId/uploads` - Upload document
- `GET /v1/bots/:botId/uploads` - List uploads
- `DELETE /v1/bots/:botId/uploads/:uploadId` - Delete upload
- `GET /v1/uploads/:uploadId/status` - Check upload status
- `POST /v1/bots/:botId/search` - Search embeddings

### Analytics
- `GET /v1/bots/:botId/usage` - Get usage statistics
- `GET /v1/bots/:botId/metrics` - Get detailed metrics

### Widget
- `GET /v1/bots/:botId/script.js` - Get widget embed script
- `GET /v1/bots/:botId/config` - Get widget configuration

## 🔐 Authentication

### JWT Token
Include JWT token in requests:
```bash
Authorization: Bearer <your-jwt-token>
```

### API Key (for widget)
Include API key in requests:
```
x-api-key: <your-api-key>
```

## 📊 Database Models

### User
```typescript
{
  email: string (unique)
  password?: string
  googleId?: string
  name?: string
  avatar?: string
  isVerified: boolean
  createdAt: Date
}
```

### Bot
```typescript
{
  name: string
  ownerId: ObjectId (User)
  apiKey: string (unique)
  avatar?: string
  description?: string
  theme: string (default: "light")
  initialPrompt: string
  temperature: number (0-2)
  maxTokens: number
  model: string
  embeddings: ObjectId[]
}
```

### Conversation
```typescript
{
  botId: ObjectId (Bot)
  userId: string
  title?: string
  messages: ObjectId[] (Message)
  metadata: {
    userAgent?: string
    ipAddress?: string
    source?: string
  }
}
```

### Message
```typescript
{
  conversationId: ObjectId (Conversation)
  botId: ObjectId (Bot)
  sender: "user" | "bot"
  content: string
  tokens: number
  metadata: {
    confidence?: number
    sources?: string[]
  }
}
```

## 🛠️ Development

### Run Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

### Start Workers
```bash
npm run worker:embedding
npm run worker:analytics
```

## 🚀 Features Implemented

### MVP Features
- ✅ Authentication (JWT & Google OAuth)
- ✅ API Key Generation
- ✅ Bot Configuration
- ✅ Real-time Conversations
- ✅ Message History
- ✅ LLM Integration (OpenAI)
- ✅ Embedding Generation
- ✅ Document Upload
- ✅ Vector Search
- ✅ Widget Embedding Script
- ✅ Usage Analytics

### Architecture Features
- ✅ Multi-tenant isolation
- ✅ Redis caching
- ✅ Bull MQ for async jobs
- ✅ JWT authentication
- ✅ API key management
- ✅ Rate limiting ready
- ✅ Error handling
- ✅ CORS enabled

## 📈 Scalability Features

- **Horizontal Scaling**: Stateless services for K8s deployment
- **Database Indexing**: Optimized queries
- **Caching Strategy**: Redis for response caching
- **Async Processing**: Bull MQ for heavy operations
- **Vector Search**: Cosine similarity for embeddings

## 🔒 Security Features

- JWT token validation
- API key encryption
- Tenant data isolation
- CORS configuration
- Error message sanitization

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Ensure MongoDB is running
mongod
```

### Redis Connection Error
```bash
# Ensure Redis is running
redis-server
```

### OpenAI API Error
```bash
# Check OPENAI_API_KEY in .env
echo $OPENAI_API_KEY
```

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [Bull MQ Docs](https://docs.bullmq.io/)

## 📝 License

MIT

## 👥 Support

For issues and questions, please create an issue in the repository.
