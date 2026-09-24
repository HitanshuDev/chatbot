# AI Chatbot Platform

Multi-tenant chatbot platform. Create bots, upload documents for retrieval, and chat
against them through a dashboard or an embeddable widget.

- **Backend** — Express + TypeScript, MongoDB Atlas (Mongoose), managed Redis (caching + Bull queues), OpenAI
- **Frontend** — Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui, Zustand

## Quick start

Requires Docker (or Podman) with a Compose provider, plus an OpenAI API key.

```bash
cp .env.example .env     # then fill in all four values
docker compose up --build
```

Open http://localhost:3000. The backend is on http://localhost:5000.

**See [RUNNING.md](RUNNING.md)** for the full guide — running locally with pnpm instead of
Docker, data persistence, inspecting the database, and troubleshooting.

This project uses **pnpm** (pinned via the `packageManager` field). Don't use `npm` or
`yarn` — it will produce a conflicting lockfile.

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
| `MONGO_URI`                             | yes      | MongoDB Atlas connection string              |
| `REDIS_URL`                             | yes      | Managed Redis (Redis Cloud); cache + Bull    |
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
- Both dev servers bind to `127.0.0.1` only. MongoDB and Redis are managed services, so
  treat `MONGO_URI` and `REDIS_URL` as secrets — they embed credentials.
- `backend/Dockerfile` has `development`, `builder`, and `production` targets. Compose uses
  `development`; `pnpm build` then `pnpm start` covers the production path.
