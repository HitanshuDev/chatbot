# 🎯 Complete User Flow: From Signup to Widget Embedding

## 📊 High-Level Flow Diagram

```
┌─────────────┐
│   USER      │
└──────┬──────┘
       │
       ├─→ [1] SIGNUP/LOGIN ──────────────┐
       │                                  │
       ├─→ [2] CREATE BOT ─────────────┐  │
       │                               │  │
       ├─→ [3] GET API KEY ◄──────────┘  │
       │                                  │
       ├─→ [4] UPLOAD DOCUMENTS (Optional)
       │        │
       │        └─→ Generate Embeddings  │
       │                                  │
       └─→ [5] GET WIDGET SCRIPT ◄───────┘
                │
                └─→ Embed on Website
                    │
                    └─→ Users chat with bot!
```

---

## 🔄 Complete Step-by-Step Flow

### **Phase 1: User Authentication**

#### Step 1.1: User Signs Up
```
USER ACTION: Signup with email & password
↓
API ENDPOINT: POST /v1/auth/signup
{
  "email": "john@company.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
↓
BACKEND PROCESS:
  1. Validate email format
  2. Check if user already exists
  3. Hash password using bcrypt (security)
  4. Create user in MongoDB
  5. Generate JWT token (valid for 7 days)
↓
RESPONSE:
{
  "user": {
    "id": "user-123",
    "email": "john@company.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
↓
CLIENT STORES: JWT token in localStorage/session
```

---

#### Step 1.2: User Logs In (Next Time)
```
USER ACTION: Login with email & password
↓
API ENDPOINT: POST /v1/auth/login
{
  "email": "john@company.com",
  "password": "SecurePass123!"
}
↓
BACKEND PROCESS:
  1. Find user by email in MongoDB
  2. Compare password using bcrypt
  3. If valid, generate new JWT token
↓
RESPONSE:
{
  "user": { ... },
  "token": "new-jwt-token..."
}
↓
CLIENT: Uses token for all subsequent requests
```

---

### **Phase 2: Bot Creation & Configuration**

#### Step 2.1: Create New Bot
```
USER ACTION: Create a bot in dashboard
↓
API ENDPOINT: POST /v1/bots
HEADERS: Authorization: Bearer {JWT_TOKEN}
{
  "name": "Customer Support Bot",
  "description": "Answers customer questions",
  "avatar": "https://example.com/bot-avatar.png",
  "initialPrompt": "You are a helpful customer support agent...",
  "temperature": 0.7,
  "maxTokens": 500,
  "model": "gpt-3.5-turbo"
}
↓
BACKEND PROCESS:
  1. Validate JWT token (middleware)
  2. Extract userId from token
  3. Validate bot data (name required, etc.)
  4. Generate unique API key for this bot
  5. Create bot document in MongoDB:
     {
       name: "Customer Support Bot",
       ownerId: "user-123",
       apiKey: "sk-abc123def456...",
       initialPrompt: "...",
       temperature: 0.7,
       model: "gpt-3.5-turbo",
       createdAt: 2026-01-19T10:00:00Z
     }
  6. Store API key in APIKey collection
↓
RESPONSE:
{
  "bot": {
    "id": "bot-abc123",
    "name": "Customer Support Bot",
    "apiKey": "sk-abc123def456...",
    "createdAt": "2026-01-19T10:00:00Z"
  }
}
↓
DATABASE STATE: 
  - Bots collection: 1 new document
  - APIKeys collection: 1 new key linked to bot
```

---

#### Step 2.2: Get Bot Configuration
```
USER ACTION: View bot settings
↓
API ENDPOINT: GET /v1/bots/{botId}/config
HEADERS: Authorization: Bearer {JWT_TOKEN}
↓
BACKEND PROCESS:
  1. Validate JWT token
  2. Find bot by ID
  3. Check if current user is owner
  4. Return bot configuration
↓
RESPONSE:
{
  "config": {
    "name": "Customer Support Bot",
    "avatar": "...",
    "theme": "light",
    "initialPrompt": "You are helpful...",
    "temperature": 0.7,
    "maxTokens": 500,
    "model": "gpt-3.5-turbo"
  }
}
```

---

### **Phase 3: Knowledge Base (Optional but Important)**

#### Step 3.1: Upload Documents
```
USER ACTION: Upload a PDF/document to bot's knowledge base
↓
API ENDPOINT: POST /v1/bots/{botId}/uploads
HEADERS: Authorization: Bearer {JWT_TOKEN}
{
  "fileName": "company-faq.pdf",
  "fileType": "pdf",
  "content": "<extracted text from PDF>"
}
↓
BACKEND PROCESS:
  1. Validate JWT and bot ownership
  2. Create Upload document in MongoDB (status: "processing")
  3. Trigger async job in Bull MQ queue
  4. Return upload ID
↓
RESPONSE:
{
  "upload": {
    "id": "upload-xyz789",
    "fileName": "company-faq.pdf",
    "status": "processing"
  }
}
↓
DATABASE STATE:
  - Uploads collection: 1 new document with status "processing"
  - Job added to Bull MQ queue
```

---

#### Step 3.2: Background Processing - Embedding Generation
```
ASYNC WORKER PROCESS (happens in background):
↓
1. Worker picks up upload job from Bull MQ queue
↓
2. TEXT CHUNKING:
   - Split document into chunks (1000 chars each)
   - Add 200 char overlap between chunks
   - Example:
     Chunk 1: "Our company was founded in 2020..."
     Chunk 2: "...founded in 2020. We specialize in..."
↓
3. EMBEDDING GENERATION (for each chunk):
   - Send chunk to OpenAI API
   - Receive 1536-dimensional vector
   - Save to Embeddings collection in MongoDB
   - Track progress (20%, 40%, 60%...)
↓
4. UPDATE STATUS:
   - Mark Upload as "completed"
   - Link embedding IDs to upload
   - Update Bot's embeddings array
↓
DATABASE STATE:
  - Uploads collection: status changed to "completed"
  - Embeddings collection: 50+ new vectors stored
  - Bots collection: embeddings[] array updated
  - All vectors indexed for fast search
```

---

#### Step 3.3: Check Upload Status
```
USER ACTION: Check if upload is complete
↓
API ENDPOINT: GET /v1/uploads/{uploadId}/status
↓
BACKEND PROCESS:
  1. Find upload by ID
  2. Return current status and embedding count
↓
RESPONSE:
{
  "upload": {
    "id": "upload-xyz789",
    "fileName": "company-faq.pdf",
    "status": "completed",
    "embeddingCount": 52
  }
}
```

---

### **Phase 4: Widget Script Generation**

#### Step 4.1: Get Embed Script
```
USER ACTION: Click "Get Embed Code" button
↓
API ENDPOINT: GET /v1/bots/{botId}/script.js
(No authentication needed - public endpoint)
↓
BACKEND PROCESS:
  1. Find bot by ID
  2. Generate JavaScript widget code that includes:
     - Bot name & avatar
     - Styling and theme
     - API endpoint
     - Bot ID
  3. Return as JavaScript file
↓
RESPONSE: (Raw JavaScript - 5KB)
```

**Widget Code Includes:**
```javascript
(function() {
  const botId = 'bot-abc123';
  const apiUrl = 'http://localhost:3000';
  
  // Create chat widget UI (HTML + CSS)
  // Add to page bottom-right corner
  // Add send button and input field
  
  // Initialize conversation on page load
  // Send messages to backend
  // Display bot responses
  
  // Close/minimize functionality
})();
```

---

#### Step 4.2: User Embeds Script on Website
```
WEBSITE OWNER ACTION: Add script to their website
↓
IN THEIR HTML:
<html>
  <head>
    <!-- Other meta tags -->
  </head>
  <body>
    <!-- Their website content -->
    
    <!-- ADD THIS LINE BEFORE </body> -->
    <script src="http://localhost:3000/v1/bots/bot-abc123/script.js"></script>
  </body>
</html>
↓
WHAT HAPPENS ON PAGE LOAD:
  1. Browser downloads the widget script
  2. JavaScript executes
  3. Widget UI appears (bottom-right corner)
  4. Conversation is auto-initialized
  5. Users can now chat!
```

---

### **Phase 5: End-User Conversation (After Embedding)**

#### Step 5.1: Visitor Opens Chat
```
VISITOR ACTION: Click chat widget on website
↓
WIDGET PROCESS:
  1. Check if conversation already exists (localStorage)
  2. If not, create new conversation
↓
API ENDPOINT: POST /v1/bots/{botId}/conversations
↓
BACKEND PROCESS:
  1. Find bot by ID
  2. Create Conversation document:
     {
       botId: "bot-abc123",
       userId: "anonymous-user-123",
       messages: [],
       metadata: {
         userAgent: "Mozilla/5.0...",
         ipAddress: "192.168.1.1",
         source: "widget"
       }
     }
↓
RESPONSE:
{
  "conversation": {
    "id": "conv-123",
    "botId": "bot-abc123",
    "createdAt": "2026-01-19T10:30:00Z"
  }
}
↓
DATABASE STATE:
  - Conversations collection: 1 new document
```

---

#### Step 5.2: Visitor Sends Message
```
VISITOR ACTION: Types "How do I reset my password?" and clicks Send
↓
WIDGET SENDS:
API ENDPOINT: POST /v1/conversations/{conversationId}/messages
{
  "content": "How do I reset my password?"
}
↓
BACKEND PROCESS:
  1. Validate conversation exists
  2. Create Message document (sender: "user")
  3. Fetch conversation history (last 10 messages for context)
  4. Check Redis cache for similar queries
↓
IF CACHED RESPONSE EXISTS:
  ├─→ Return cached response (instant!)
  └─→ Skip OpenAI API call (save $$$)
↓
IF NO CACHE:
  ├─→ Build message context:
  │   [
  │     { role: "system", content: "{bot.initialPrompt}" },
  │     { role: "user", content: "Previous message 1" },
  │     { role: "assistant", content: "Bot response 1" },
  │     ...
  │     { role: "user", content: "How do I reset my password?" }
  │   ]
  │
  ├─→ (OPTIONAL) SEMANTIC SEARCH on embeddings:
  │   - Convert user message to embedding
  │   - Find similar chunks from uploaded documents
  │   - Add relevant chunks to context
  │
  ├─→ CALL OPENAI API:
  │   POST https://api.openai.com/v1/chat/completions
  │   model: "gpt-3.5-turbo"
  │   temperature: 0.7
  │   max_tokens: 500
  │   messages: [... context ...]
  │
  ├─→ OPENAI RESPONDS:
  │   "To reset your password, click the 'Forgot Password' link on the login page..."
  │
  ├─→ CACHE RESPONSE:
  │   Store in Redis with 24-hour TTL
  │
  └─→ CREATE BOT MESSAGE:
      {
        conversationId: "conv-123",
        sender: "bot",
        content: "To reset your password...",
        tokens: 45,
        metadata: {
          sources: ["company-faq.pdf"]
        }
      }
↓
DATABASE STATE:
  - Messages collection: 2 new documents (user + bot)
  - Redis cache: response cached for 24 hours
  - Conversations collection: messages[] updated
↓
RESPONSE TO WIDGET:
{
  "message": {
    "id": "msg-456",
    "sender": "bot",
    "content": "To reset your password, click the 'Forgot Password' link...",
    "createdAt": "2026-01-19T10:31:00Z"
  }
}
↓
WIDGET UPDATES:
  - Display bot message in chat
  - Show at bottom of chat window
  - Auto-scroll to show latest
  - Play notification sound (optional)
```

---

#### Step 5.3: Conversation History
```
VISITOR ACTION: Scrolls up to see previous messages
↓
WIDGET SENDS:
API ENDPOINT: GET /v1/conversations/{conversationId}/messages
?limit=50&offset=0
↓
BACKEND PROCESS:
  1. Find conversation
  2. Fetch last 50 messages
  3. Sort chronologically
  4. Return with pagination info
↓
RESPONSE:
{
  "messages": [
    { sender: "user", content: "Message 1", createdAt: "..." },
    { sender: "bot", content: "Response 1", createdAt: "..." },
    { sender: "user", content: "Message 2", createdAt: "..." },
    { sender: "bot", content: "Response 2", createdAt: "..." },
    ...
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
↓
WIDGET: Displays full conversation history
```

---

### **Phase 6: Analytics & Monitoring**

#### Step 6.1: Bot Owner Views Analytics
```
BOT OWNER ACTION: Check bot performance in dashboard
↓
API ENDPOINT: GET /v1/bots/{botId}/usage
HEADERS: Authorization: Bearer {JWT_TOKEN}
↓
BACKEND PROCESS:
  1. Count total conversations for this bot
  2. Count total messages exchanged
  3. Filter last 7 days
  4. Calculate averages
↓
RESPONSE:
{
  "usage": {
    "totalConversations": 1250,
    "totalMessages": 8750,
    "weekConversations": 280,
    "weekMessages": 1850,
    "avgMessagesPerConversation": 7
  }
}
↓
DASHBOARD SHOWS:
  - 1,250 total conversations with users
  - 8,750 messages exchanged
  - 7 messages average per conversation
  - Trending up (280 new conversations this week)
```

---

#### Step 6.2: Detailed Metrics
```
BOT OWNER ACTION: View detailed metrics for date range
↓
API ENDPOINT: GET /v1/bots/{botId}/metrics
?startDate=2026-01-01&endDate=2026-01-31
HEADERS: Authorization: Bearer {JWT_TOKEN}
↓
BACKEND PROCESS:
  1. Query conversations created in date range
  2. Query messages in date range
  3. Separate user vs bot messages
  4. Calculate average response time
  5. Calculate per-hour/per-day trends
↓
RESPONSE:
{
  "metrics": {
    "totalConversations": 1250,
    "totalMessages": 8750,
    "userMessages": 4375,
    "botMessages": 4375,
    "avgMessagesPerConversation": 7,
    "avgResponseTime": 1250, // milliseconds
    "dateRange": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    }
  }
}
```

---

## 🗄️ Database State Throughout Journey

### After Signup
```
Users Collection:
  {
    _id: "user-123",
    email: "john@company.com",
    password: "hashed-password-...",
    name: "John Doe",
    isVerified: true
  }
```

### After Bot Creation
```
Bots Collection:
  {
    _id: "bot-abc123",
    name: "Customer Support Bot",
    ownerId: "user-123",
    apiKey: "sk-abc123...",
    initialPrompt: "You are helpful...",
    temperature: 0.7,
    maxTokens: 500,
    model: "gpt-3.5-turbo",
    embeddings: []
  }

APIKeys Collection:
  {
    _id: "key-123",
    botId: "bot-abc123",
    userId: "user-123",
    key: "sk-abc123...",
    isActive: true,
    rateLimit: 1000
  }
```

### After Document Upload
```
Uploads Collection:
  {
    _id: "upload-xyz789",
    botId: "bot-abc123",
    fileName: "company-faq.pdf",
    fileType: "pdf",
    status: "completed",
    embeddingIds: ["emb-1", "emb-2", ..., "emb-52"]
  }

Embeddings Collection: (50+ documents)
  {
    _id: "emb-1",
    botId: "bot-abc123",
    uploadId: "upload-xyz789",
    text: "Our company was founded in 2020...",
    embedding: [0.123, -0.456, 0.789, ...], // 1536 numbers
    metadata: { chunkIndex: 0, source: "company-faq.pdf" }
  }
  ...
```

### After Conversation Starts
```
Conversations Collection:
  {
    _id: "conv-123",
    botId: "bot-abc123",
    userId: "anonymous-user-123",
    messages: ["msg-1", "msg-2", "msg-3"],
    metadata: {
      userAgent: "Mozilla/5.0...",
      ipAddress: "192.168.1.1",
      source: "widget"
    }
  }

Messages Collection: (100+ documents per bot)
  {
    _id: "msg-1",
    conversationId: "conv-123",
    botId: "bot-abc123",
    sender: "user",
    content: "How do I reset my password?",
    tokens: 8
  },
  {
    _id: "msg-2",
    conversationId: "conv-123",
    botId: "bot-abc123",
    sender: "bot",
    content: "To reset your password, click the 'Forgot Password' link...",
    tokens: 45,
    metadata: { sources: ["company-faq.pdf"] }
  }
```

### Redis Cache During Messaging
```
Cache Key: "response:bot-abc123:How do I reset my"
Cache Value: "To reset your password, click the 'Forgot Password' link..."
TTL: 86400 seconds (24 hours)

When same/similar question asked again:
  → Return cached response instantly
  → No OpenAI API call needed
  → Save $0.002 per request
```

---

## 💰 Cost Optimization Through the Flow

| Action | Cost Impact |
|--------|------------|
| User signup | Free |
| Bot creation | Free (metadata only) |
| Document upload | Free (text extraction only) |
| Generate embeddings | $0.0001 per 1K tokens (one-time) |
| First message | $0.002 (OpenAI API call) |
| Cached messages | Free (Redis cache hit) |
| Analytics query | Free |

**Example:** 100 users, 1,000 conversations, 5,000 messages
- Embeddings: ~$1 (one-time)
- Messages (20% cached): ~$8 (80% cache hit rate)
- Total monthly: ~$9

---

## 🔐 Security Throughout Flow

```
SIGNUP
  ├─ Email validated
  ├─ Password hashed with bcrypt
  └─ Stored securely in database

BOT CREATION
  ├─ JWT token verified
  ├─ UserId extracted from token
  ├─ Bot linked to owner only
  └─ API key generated with cryptography

MESSAGING
  ├─ API key validated
  ├─ Conversation ownership verified
  ├─ Input sanitized
  └─ Rate limiting applied

ANALYTICS
  ├─ JWT token verified
  ├─ Only owner can see own bot stats
  └─ No sensitive data exposed
```

---

## 📈 Performance Timeline

| Step | Duration | Notes |
|------|----------|-------|
| Signup | 100ms | Password hashing |
| Bot creation | 50ms | Database insert |
| Document upload | 10ms | Just metadata stored |
| Embedding generation | 5-30 seconds | Background worker |
| Get script | 5ms | Read from DB |
| User starts chat | 100ms | Create conversation |
| Send message (first) | 1-2 seconds | OpenAI API call |
| Send message (cached) | 50ms | Redis cache hit |
| View analytics | 200ms | Database aggregation |

---

## 🎯 Key Takeaways

1. **Signup → Bot** = User setup (minutes)
2. **Documents → Embeddings** = Knowledge base setup (background)
3. **Widget Script** = One-line embed code
4. **User Chat** = Real-time LLM responses with caching
5. **Analytics** = Track everything

---

**This complete flow enables a fully functional AI chatbot platform! 🚀**
