# 📋 Deployment & Testing Guide

## 🧪 Local Testing

### 1. Start Development Environment

```bash
# Option A: Using Docker Compose (Recommended)
docker-compose up -d

# Option B: Manual Setup
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Redis
redis-server

# Terminal 3: Start Backend
npm run dev
```

### 2. Verify Server is Running

```bash
curl http://localhost:3000/health
# Response: {"status":"OK"}
```

### 3. Test Authentication

```bash
# Signup
curl -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@",
    "name": "Test User"
  }'

# Response will include JWT token
# Save this token for subsequent requests
```

### 4. Test Bot Creation

```bash
# Create a bot (replace TOKEN with your JWT)
curl -X POST http://localhost:3000/v1/bots \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Bot",
    "description": "A test chatbot",
    "initialPrompt": "You are a helpful assistant."
  }'

# Response includes botId and apiKey
```

### 5. Test Conversations

```bash
# Start conversation
curl -X POST http://localhost:3000/v1/bots/BOT_ID/conversations \
  -H "Content-Type: application/json"

# Response includes conversationId
```

### 6. Test Messaging

```bash
# Send message
curl -X POST http://localhost:3000/v1/conversations/CONVERSATION_ID/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, how are you?"
  }'
```

## 🐳 Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose installed
- OpenAI API key

### Deploy Locally with Docker

```bash
# 1. Set environment variables
export OPENAI_API_KEY="sk-your-key-here"

# 2. Start services
docker-compose up -d

# 3. Check logs
docker-compose logs -f backend

# 4. Stop services
docker-compose down
```

### Push to Container Registry

```bash
# Build image
docker build -t your-registry/chatbot-backend:latest .

# Login to registry
docker login your-registry

# Push image
docker push your-registry/chatbot-backend:latest
```

## ☸️ Kubernetes Deployment

### Create Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatbot-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chatbot-backend
  template:
    metadata:
      labels:
        app: chatbot-backend
    spec:
      containers:
      - name: backend
        image: your-registry/chatbot-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: chatbot-secrets
              key: mongo-uri
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: chatbot-secrets
              key: redis-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: chatbot-secrets
              key: openai-api-key
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: chatbot-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: chatbot-backend-service
spec:
  selector:
    app: chatbot-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic chatbot-secrets \
  --from-literal=mongo-uri=$MONGO_URI \
  --from-literal=redis-url=$REDIS_URL \
  --from-literal=openai-api-key=$OPENAI_API_KEY \
  --from-literal=jwt-secret=$JWT_SECRET

# Deploy application
kubectl apply -f deployment.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/chatbot-backend

# Scale deployment
kubectl scale deployment chatbot-backend --replicas=5
```

## 🚀 Production Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS/TLS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Enable Redis persistence
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for assets
- [ ] Enable CORS for production domain
- [ ] Set up security headers
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable API rate limiting
- [ ] Set up automated tests
- [ ] Configure CI/CD pipeline

## 📊 Monitoring & Logging

### Application Logging

```bash
# View logs in development
npm run dev

# View Docker logs
docker-compose logs -f backend

# View Kubernetes logs
kubectl logs -f deployment/chatbot-backend
```

### Error Tracking (Sentry Integration)

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

### Performance Monitoring

```bash
# Monitor CPU and memory
docker stats

# Monitor database performance
# Use MongoDB Atlas monitoring

# Monitor Redis
redis-cli INFO stats
```

## 🔒 Security Checklist

- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Enable CORS restrictions
- [ ] Validate all inputs
- [ ] Sanitize error messages
- [ ] Use secure headers
- [ ] Regular dependency updates
- [ ] Implement CSRF protection
- [ ] Use strong password hashing (bcrypt)
- [ ] Rotate secrets regularly
- [ ] Enable request logging
- [ ] Implement API key rotation
- [ ] Use secure cookie settings
- [ ] Implement request signing
- [ ] Monitor for suspicious activity

## 📈 Scaling Strategy

### Horizontal Scaling
1. Run multiple instances of the backend
2. Use load balancer (nginx, HAProxy)
3. Share MongoDB and Redis across instances

### Database Optimization
```javascript
// Create indexes
db.messages.createIndex({ conversationId: 1, createdAt: -1 })
db.conversations.createIndex({ botId: 1, createdAt: -1 })
db.embeddings.createIndex({ botId: 1 })
```

### Caching Strategy
- Cache API responses (24 hours)
- Cache embeddings (7 days)
- Cache bot config (1 hour)
- Use Redis for session storage

### Worker Scaling
```bash
# Run multiple worker instances
npm run worker:embedding &
npm run worker:embedding &
npm run worker:analytics &
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongod --version

# Check connection string
echo $MONGO_URI

# Test connection
mongo "mongodb://localhost:27017"
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping

# Check connection string
echo $REDIS_URL

# Monitor Redis
redis-cli MONITOR
```

### OpenAI API Issues
```bash
# Check API key is valid
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check rate limits
# Monitor in OpenAI dashboard
```

### High Memory Usage
```bash
# Check Node.js memory
node --max-old-space-size=2048 src/server.ts

# Profile memory
node --inspect src/server.ts
# Then use Chrome DevTools
```

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MongoDB Performance](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [Redis Optimization](https://redis.io/topics/optimization)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Happy Deploying! 🚀**
