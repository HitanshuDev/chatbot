# Docker Setup - Visual Quick Start Guide

## 🎯 The Simplest Path to Running Your App

### Step 1️⃣: Edit Configuration (5 minutes)

```
📁 chatbot/ (root folder)
   └─ .env  ← EDIT THIS FILE
      
      Add your OpenAI API key:
      OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 2️⃣: Start Everything (1 command)

**Windows:**
```powershell
start.bat
```

**Mac/Linux:**
```bash
bash start.sh
```

**Or Everywhere:**
```bash
docker compose up
```

### Step 3️⃣: Wait for Services to Start (30-60 seconds)

Look for these messages:
```
✅ MongoDB: "MongoDB connected"
✅ Redis: "Ready to accept connections"
✅ Backend: "✅ Server running on port 3000"
✅ Frontend: "ready - started server on"
```

### Step 4️⃣: Open Your Browser

```
http://localhost:3001
```

🎉 **Done! You're running the full app!**

---

## 📊 What's Running Behind The Scenes

```
┌─────────────────────────────────────────────┐
│         Your Computer - Port Forward        │
├─────────────────────────────────────────────┤
│                                              │
│  3001 ──→ Frontend (Next.js)                │
│           http://localhost:3001             │
│                                              │
│  3000 ──→ Backend API (Express)             │
│           http://localhost:3000/v1          │
│                                              │
│           ↓                                  │
│           Docker Network                    │
│           ↓                                  │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │
│  │   Backend Container                 │  │
│  │   - Node.js                         │  │
│  │   - Express API                     │  │
│  │   - OpenAI Integration              │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│           ↓ ↓ ↓ ↓ ↓                        │
│  ┌──────────────────────────────────────┐  │
│  │   MongoDB    │    Redis             │  │
│  │   Database   │    Cache             │  │
│  │              │                       │  │
│  └──────────────────────────────────────┘  │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 🔍 At a Glance: What You Get

| Component | Status | Access |
|-----------|--------|--------|
| Web UI | ✅ Running | http://localhost:3001 |
| API | ✅ Running | http://localhost:3000/v1 |
| Database | ✅ Running | Internal |
| Cache | ✅ Running | Internal |
| **Total** | **✅ ALL GO!** | **Ready to Use** |

---

## 📝 File You Need to Know

```
chatbot/
├── 📄 00_START_HERE.md ← Read this first!
├── 📄 QUICK_DOCKER_REFERENCE.md ← Commands cheat sheet
├── 📄 DOCKER_SETUP.md ← Full detailed guide
│
├── 🐳 docker-compose.yml ← The magic file (orchestrates everything)
├── 📋 .env ← Your configuration (ADD YOUR API KEY HERE!)
├── 📋 start.bat ← Windows launcher
├── 📋 start.sh ← Mac/Linux launcher
│
├── 📁 backend/
│   └── 🐳 Dockerfile
│
├── 📁 frontend/
│   └── 🐳 Dockerfile
```

---

## 🚨 Common Issues & Quick Fixes

### ❌ "Port 3000 already in use"
```bash
# Edit docker-compose.yml, change:
# FROM:  ports: ["3000:3000"]
# TO:    ports: ["3001:3000"]
```

### ❌ "Docker not found"
- Install Docker Desktop: https://www.docker.com/products/docker-desktop

### ❌ "Services won't start"
```bash
docker compose down -v
docker compose up
```

### ❌ "Can't connect to database"
Wait 10-15 seconds, then refresh. MongoDB takes time to start.

---

## 📚 Documentation Map

```
START HERE
    ↓
00_START_HERE.md (this overview)
    ↓
    ├─→ Quick commands? QUICK_DOCKER_REFERENCE.md
    ├─→ More details? DOCKER_SETUP.md
    └─→ How it works? README_DOCKER.md
```

---

## ⏱️ Timeline

```
docker compose up
    ↓
[⏳ 10 seconds] Services starting...
    ↓
[⏳ 20 seconds] MongoDB health check...
    ↓
[⏳ 30 seconds] Redis health check...
    ↓
[⏳ 40 seconds] Backend starting...
    ↓
[⏳ 50 seconds] Frontend building...
    ↓
[✅ 60 seconds] READY! Open http://localhost:3001
```

---

## 🎮 Control Your App

```bash
# See what's running
docker ps

# View logs
docker compose logs -f

# Stop everything (keeps data)
docker compose down

# Stop and delete everything (fresh start)
docker compose down -v

# Restart a service
docker compose restart backend

# Enter a container (debugging)
docker compose exec backend sh
```

---

## ✅ Checklist Before Starting

- [ ] Docker installed? (`docker --version`)
- [ ] In project root folder? (`chatbot/`)
- [ ] .env file edited? (OpenAI key added)
- [ ] Ports free? (3001, 3000)
- [ ] Ready to go? (Run `docker compose up`)

---

## 🚀 The One Command You Need

```bash
docker compose up
```

Then visit: http://localhost:3001

---

## 📞 Lost? Need Help?

1. **Quick commands?** → `QUICK_DOCKER_REFERENCE.md`
2. **Problems?** → `DOCKER_SETUP.md` (Troubleshooting section)
3. **Architecture?** → `README_DOCKER.md`
4. **See logs?** → `docker compose logs -f`

---

## 🎉 You're All Set!

**Everything is configured and ready.**

Just run:
```bash
docker compose up
```

**That's it!**

Your full-stack chatbot app will be running in minutes.

🚀 Happy building!
