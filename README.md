# AI Chatbot Platform

Multi-tenant chatbot platform. Create bots, upload documents for retrieval, and chat
against them through a dashboard or an embeddable widget.

- **Backend** — Express + TypeScript, MongoDB (Mongoose), Redis (caching + rate limits), OpenAI, Bull queues
- **Frontend** — Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui, Zustand

## Prerequisites

- Docker (or Podman) with a Compose provider
- An OpenAI API key — without one the app runs, but the bot replies with a fallback message

## Setup

```bash
cp .env.example .env
```

Fill in `.env` — every value below is required before the first start, and Compose will
refuse to start rather than fall back to a default:

```bash
OPENAI_API_KEY=sk-...                      # your key
JWT_SECRET=$(openssl rand -hex 32)         # any long random string
MONGO_USER=chatbot_dev                     # anything
MONGO_PASSWORD=$(openssl rand -hex 16)     # anything
```

`MONGO_USER` / `MONGO_PASSWORD` seed the database the first time it starts, so set them
before your first `up`. Changing them later requires `docker compose down -v` to
reinitialize, which wipes local data.

`.env` is gitignored — keep secrets out of commits.

```bash
docker compose up --build
```

| Service  | URL                          |
| -------- | ---------------------------- |
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:5000        |
| Health   | http://localhost:5000/health |
| MongoDB  | localhost:27017              |
| Redis    | localhost:6379               |

Both app containers mount the source tree and run their dev servers, so edits hot-reload
without a rebuild. Rebuild only when dependencies change.

Using Podman without the `docker` alias? Substitute `podman-compose` for `docker compose`.

### Common commands

```bash
docker compose up -d          # background
docker compose logs -f        # tail logs
docker compose down           # stop
docker compose down -v        # stop and wipe Mongo/Redis data
```

## Running without Docker

Mongo and Redis are still required. Start just those in containers:

```bash
docker compose up -d mongodb redis
```

Then run each app against them:

```bash
cp backend/.env.example backend/.env       # set OPENAI_API_KEY
cd backend && npm install && npm run dev   # :5000

cp frontend/.env.example frontend/.env.local
cd frontend && npm install && npm run dev  # :3000
```

Document embedding runs inline on upload. To process it on the Bull queue instead, run a
worker alongside the backend:

```bash
cd backend && npm run worker:embedding
```

## API

Base path `/v1`. Dashboard routes authenticate with `Authorization: Bearer <jwt>`;
widget routes use a per-bot `x-api-key`.

| Method                 | Path                                   | Purpose                        |
| ---------------------- | -------------------------------------- | ------------------------------ |
| `POST`                 | `/auth/signup`, `/auth/login`          | Issue a JWT                    |
| `POST`                 | `/auth/refresh`, `/auth/logout`        | Session management             |
| `POST`                 | `/auth/google`                         | Google login (optional)        |
| `GET` `POST`           | `/bots`                                | List / create bots             |
| `GET` `PATCH` `DELETE` | `/bots/:botId`                         | Read / update / delete a bot   |
| `GET`                  | `/bots/:botId/config`                  | Bot config                     |
| `GET` `POST`           | `/bots/:botId/conversations`           | List / start conversations     |
| `GET`                  | `/conversations/:id`                   | Single conversation            |
| `GET` `POST`           | `/conversations/:id/messages`          | Read / send messages           |
| `DELETE`               | `/messages/:messageId`                 | Delete a message               |
| `GET` `POST`           | `/bots/:botId/uploads`                 | List / upload documents        |
| `DELETE`               | `/bots/:botId/uploads/:uploadId`       | Delete an upload               |
| `GET`                  | `/uploads/:uploadId/status`            | Embedding progress             |
| `POST`                 | `/bots/:botId/search`                  | Similarity search              |
| `GET`                  | `/bots/:botId/usage`, `/metrics`       | Analytics                      |
| `GET`                  | `/bots/:botId/script.js`               | Embeddable widget loader       |

## Environment variables

Compose reads the root `.env` and passes these to the backend. When running outside
Docker, `backend/.env` supplies them instead.

| Variable                                | Required | Notes                                        |
| --------------------------------------- | -------- | -------------------------------------------- |
| `OPENAI_API_KEY`                        | yes      | Chat completions and embeddings              |
| `OPENAI_MODEL`                          | no       | Defaults to `gpt-4o-mini`                    |
| `JWT_SECRET`                            | yes      | Signs auth tokens; use a real secret in prod |
| `MONGO_USER` / `MONGO_PASSWORD`         | yes      | Seed the local database on first start       |
| `MONGO_URI`                             | yes      | Assembled by Compose from the two above      |
| `REDIS_URL` / `REDIS_HOST` `REDIS_PORT` | yes      | Set by Compose; `REDIS_HOST`/`PORT` for Bull |
| `PORT`                                  | no       | Backend port, defaults to `5000`             |
| `GOOGLE_CLIENT_ID` / `_SECRET`          | no       | Only for Google login                        |
| `NEXT_PUBLIC_API_URL`                   | yes      | Frontend → backend base URL, includes `/v1`  |

## Project layout

```
backend/src
  app.ts, server.ts     Express app and entrypoint
  routes/               Route definitions per resource
  controllers/          Request handlers
  models/               Mongoose schemas
  middleware/           JWT auth, bot API-key auth, rate limits
  workers/              Bull queue consumers
  utils/                OpenAI, Redis, API-key helpers
  config/               Env-backed config objects

frontend/src
  app/                  App Router pages
  components/           UI, landing, dashboard, layout
  lib/                  API clients
  store/                Zustand stores
  types/                Shared types
```

## Notes

- No credentials are committed. Compose reads them from `.env` and fails fast if they are
  missing, so nothing falls back to a shared default.
- Mongo, Redis, and both dev servers bind to `127.0.0.1` only — they are not reachable from
  other machines on your network.
- `backend/Dockerfile` has `development`, `builder`, and `production` targets. Compose uses
  `development`; `npm run build` then `npm start` covers the production path.
