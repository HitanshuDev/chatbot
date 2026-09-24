# High-Level Design

AI Chatbot Platform — a multi-tenant service where a user creates bots, uploads
documents to ground them, chats through a dashboard, and embeds a chat widget on
their own website.

All diagrams below describe the system **as built**, including the parts that are
incomplete; those are called out rather than idealised.

---

## 1. System architecture

```mermaid
graph TB
    subgraph clients["Clients"]
        Browser["Dashboard user<br/>(browser)"]
        ThirdParty["Visitor on a customer's<br/>website (embedded widget)"]
    end

    subgraph frontend["Frontend — Next.js 16 · :3000"]
        Pages["App Router pages<br/>marketing · auth · dashboard<br/>bots · analytics · settings"]
        Stores["Zustand stores<br/>auth (localStorage) · bot"]
        ApiClient["axios client<br/>lib/api.ts · lib/chatApi.ts"]
        Pages --> Stores
        Pages --> ApiClient
    end

    subgraph backend["Backend — Express + TypeScript · :5000"]
        Routes["Routes<br/>/v1/auth · /v1/bots · /v1/conversations<br/>/v1/uploads · /v1/analytics · /v1/widget"]
        MW["Middleware<br/>authMiddleware (JWT)<br/>optionalAuthMiddleware<br/>rate limiting"]
        Ctrl["Controllers<br/>auth · bot · message<br/>upload · analytics · widget"]
        Producer["Queue producer<br/>queues/embedding.queue.ts"]
        Routes --> MW --> Ctrl
        Ctrl --> Producer
    end

    Worker["Embedding worker<br/>separate container<br/>Bull consumer"]

    subgraph data["Data stores"]
        Mongo[("MongoDB 7<br/>users · bots · conversations<br/>messages · uploads · embeddings")]
        Redis[("Redis 7<br/>response cache<br/>Bull queue backing")]
    end

    OpenAI["OpenAI API<br/>chat completions + embeddings<br/>(embeddings fall back to<br/>local stub with no key)"]

    Browser -->|HTTPS / JSON| ApiClient
    ApiClient -->|REST /v1| Routes
    ThirdParty -->|GET script.js| Routes
    ThirdParty -->|POST conversations / messages| Routes

    Ctrl --> Mongo
    Ctrl --> Redis
    Ctrl --> OpenAI
    Producer -->|enqueue job| Redis
    Redis -->|dequeue job| Worker
    Worker --> Mongo
    Worker --> OpenAI

    classDef gap stroke-dasharray: 5 5
    class ThirdParty gap
```

---

## 2. Deployment topology (Docker Compose)

Three application containers on one bridge network. Both datastores are managed
services, so there are no local database containers and no data volumes.

```mermaid
graph LR
    subgraph host["Developer machine (loopback only)"]
        direction TB
        FE["frontend<br/>127.0.0.1:3000"]
        BE["backend<br/>127.0.0.1:5000"]
        WK["embedding-worker<br/>no published port"]
    end

    subgraph managed["Managed services"]
        DB[("MongoDB Atlas<br/>via MONGO_URI")]
        RD[("Redis Cloud<br/>via REDIS_URL")]
    end

    FE -->|"NEXT_PUBLIC_API_URL"| BE
    BE --> DB
    BE --> RD
    WK --> DB
    WK --> RD

    note["Source is bind-mounted into all three,<br/>so dev servers hot-reload.<br/>node_modules lives in an<br/>anonymous volume."]
```

Because state lives outside Docker, `docker compose down -v` is no longer
destructive, and the containers are disposable.

---

## 3. Data model and tenancy

`Bot.ownerId` is the **only** real tenant boundary. Nothing below `Bot` stores a
`userId`, so authorising any nested resource means loading its bot and comparing
the owner.

```mermaid
erDiagram
    USER ||--o{ BOT : "owns (ownerId)"
    BOT ||--o{ CONVERSATION : "botId"
    BOT ||--o{ UPLOAD : "botId"
    BOT ||--o{ EMBEDDING : "botId"
    BOT ||--o{ APIKEY : "botId"
    CONVERSATION ||--o{ MESSAGE : "conversationId"
    UPLOAD ||--o{ EMBEDDING : "uploadId"

    USER {
        ObjectId _id
        string email UK
        string password "bcrypt hash"
        string name
    }
    BOT {
        ObjectId _id
        ObjectId ownerId FK "tenant boundary"
        string name
        string apiKey
        string model
        string initialPrompt
        number temperature
        number maxTokens
    }
    CONVERSATION {
        ObjectId _id
        ObjectId botId FK
        string title
        ObjectId[] messages
    }
    MESSAGE {
        ObjectId _id
        ObjectId conversationId FK
        ObjectId botId FK
        string sender "user | bot"
        string content
    }
    UPLOAD {
        ObjectId _id
        ObjectId botId FK
        string fileName
        string fileType "pdf | txt | docx | url"
        number fileSize
        string content "extracted text"
        string status "pending|processing|completed|failed"
        ObjectId[] embeddingIds
        string error
    }
    EMBEDDING {
        ObjectId _id
        ObjectId botId FK
        ObjectId uploadId FK
        string text "chunk"
        number[] embedding "1536 dims"
        object metadata
    }
    APIKEY {
        ObjectId _id
        ObjectId botId FK
        ObjectId userId FK
        string key UK
        boolean isActive
        date lastUsed
    }
```

---

## 4. Authentication and authorisation

```mermaid
flowchart TD
    Req["Incoming request"] --> Which{"Which route?"}

    Which -->|"/v1/auth/*"| Public["No auth<br/>signup · login · refresh · google"]
    Which -->|"/v1/bots/*<br/>/v1/bots/:id/uploads<br/>/v1/bots/:id/usage"| JWT["authMiddleware<br/>verify Bearer JWT"]
    Which -->|"/v1/bots/:id/conversations<br/>/v1/conversations/:id/*"| Optional["optionalAuthMiddleware<br/>proceeds even with no token"]
    Which -->|"/v1/bots/:id/script.js<br/>/v1/bots/:id/config"| None["No middleware<br/>public by design (widget)"]

    JWT -->|"no / bad token"| R401["401"]
    JWT -->|"valid"| Owner{"bot.ownerId === req.userId ?"}
    Owner -->|no| R404["404 — existence not revealed"]
    Owner -->|yes| Handler["Controller runs"]

    Optional --> NoCheck["No ownership check<br/>in message.controller"]
    NoCheck --> Handler

    R401:::bad
    R404:::ok
    NoCheck:::bad
    classDef bad fill:#fdecec,stroke:#a11
    classDef ok fill:#eef7ee,stroke:#161
```

**Verified with two tenants.** Bot CRUD, uploads and analytics isolate correctly
(cross-tenant requests return 404). Conversations and messages do **not**: a
transcript is readable, and a message postable, with no token at all. The
`botAuthMiddleware` and `apiKeyRateLimit` written for per-bot API-key auth exist
but are wired to no route.

---

## 5. Chat request flow

```mermaid
sequenceDiagram
    actor U as User / widget visitor
    participant API as Express API
    participant R as Redis
    participant M as MongoDB
    participant AI as OpenAI

    U->>API: POST /v1/bots/:botId/conversations
    API->>M: create Conversation
    API-->>U: { conversation.id }

    U->>API: POST /v1/conversations/:id/messages { content }
    API->>API: sendMessageLimiter (5/min, in-memory)
    API->>M: save user Message
    API->>M: load last 10 messages (context)

    API->>R: GET response:{botId}:sha256(content)
    alt cache hit
        R-->>API: cached reply
    else cache miss
        API->>AI: chat.completions.create(model, prompt, history)
        alt success
            AI-->>API: reply
            API->>R: SETEX reply (24h)
        else no API key / error
            AI-->>API: error (logged, swallowed)
            Note over API: falls back to<br/>"I'm having trouble right now."
        end
    end

    API->>M: save bot Message
    API-->>U: { message }
```

A Redis outage is **not** tolerated on this path: the `cacheGet` call sits
outside the inner try/catch, so a failure surfaces as `500`.

---

## 6. Document ingestion (async queue)

```mermaid
sequenceDiagram
    actor U as Dashboard user
    participant API as Express API
    participant M as MongoDB
    participant Q as Redis / Bull
    participant W as Embedding worker

    U->>API: POST /v1/bots/:botId/uploads (multipart file)
    API->>API: authMiddleware + bot ownership check
    API->>API: multer (memory, 10MB cap)
    API->>API: extract text — pdf-parse for PDF, utf8 for txt/md
    alt unsupported type or no text
        API-->>U: 400 with reason
    else ok
        API->>M: create Upload { status: pending }
        API->>Q: embeddingQueue.add({ uploadId })
        API-->>U: 201 { upload, status: pending }
    end

    Q->>W: deliver job (3 attempts, exponential backoff)
    W->>M: Upload.status = processing
    W->>W: chunkText(content, 1000, overlap 200)
    loop each chunk
        W->>W: generateEmbedding(chunk)
        Note over W: OpenAI when OPENAI_API_KEY set,<br/>else deterministic local stub (1536 dims)
        W->>M: create Embedding
        W->>Q: job.progress(%)
    end
    W->>M: Upload.status = completed + embeddingIds
    W->>M: Bot.embeddings push

    U->>API: GET /v1/bots/:botId/uploads (polled while pending)
    API-->>U: status + embeddingCount

    Note over W: on final failure →<br/>Upload.status = failed + error
```

---

## 7. Embeddable widget

```mermaid
sequenceDiagram
    actor V as Visitor
    participant Site as Customer website
    participant API as Express API
    participant M as MongoDB

    Note over Site: <script src=".../bots/:botId/script.js" async>

    Site->>API: GET /v1/bots/:botId/script.js
    API->>M: load bot (name, theme)
    API->>API: build IIFE — bot name emitted as<br/>escaped JS string, rendered via textContent
    API-->>Site: application/javascript (cached 5 min)

    Site->>Site: inject <style>, launcher button, hidden panel
    Note over Site: no conversation created yet

    V->>Site: click launcher
    Site->>API: POST /v1/bots/:botId/conversations
    API-->>Site: conversation.id — input enables
    V->>Site: type message
    Site->>API: POST /v1/conversations/:id/messages
    API-->>Site: bot reply → rendered
```

The widget is served unauthenticated, so any site that knows a bot id can embed
it and consume the owner's OpenAI quota.

---

## 8. Frontend routes

```mermaid
graph LR
    Root["/"] --> Marketing["(marketing)<br/>landing sections"]
    Root --> Login["/auth/login"]
    Root --> Signup["/auth/signup"]

    Login --> Dash["/dashboard<br/>KPI tiles + bot list"]
    Dash --> Bots["/bots<br/>bot CRUD"]
    Bots --> Detail["/bots/[id]<br/>live chat · API key · embed snippet"]
    Detail --> Config["/bots/[id]/config<br/>model + prompt settings"]
    Detail --> Convs["/bots/[id]/conversations<br/>documents + conversation list"]
    Convs --> Transcript["/bots/[id]/conversations/[conversationId]<br/>read-only transcript"]
    Dash --> Analytics["/analytics<br/>aggregate usage per bot"]
    Dash --> Settings["/settings"]
    Detail --> Preview["/widget-preview"]

    Guard["Every guarded page:<br/>hydrate auth from localStorage,<br/>redirect to /auth/login if absent"]
```

---

## 9. Known gaps

| Area | Issue |
|---|---|
| Authorisation | `message.controller` has no ownership check; transcripts readable and messages postable with no token |
| Widget auth | `script.js` and message endpoints unauthenticated; `botAuthMiddleware` / `apiKeyRateLimit` unused |
| Redis coupling | Chat path 500s if Redis is unavailable (cache lookup not guarded) |
| Rate limiting | `sendMessageLimiter` uses an in-memory store, so limits are per-process, not global |
| Retrieval | Embeddings are stored and searchable, but chat does **not** retrieve them — replies are not document-grounded |
| Vector search | Cosine similarity computed in Node over the first 100 embeddings; no vector index |
| Analytics worker | `analytics.worker.ts` defines an `analytics` queue that nothing enqueues to |
| Conversation churn | Dashboard bot page creates a conversation on mount, producing empty rows |
