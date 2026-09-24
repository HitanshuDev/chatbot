# Running the project

Two ways to run it. **Docker is the recommended path** — it's one command and you don't
need MongoDB or Redis installed on your machine.

Both datastores are managed: MongoDB Atlas via `MONGO_URI` and Redis Cloud via
`REDIS_URL`. Docker only runs the application containers, so there is no local
database and no data volume.

| Service  | URL                          |
| -------- | ---------------------------- |
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:5000        |
| Health   | http://localhost:5000/health |
| MongoDB  | managed (Atlas)              |
| Redis    | managed (Redis Cloud)        |

All ports bind to loopback only, so nothing is reachable from other machines on your network.

---

## Step 1 — secrets (required for both paths)

```bash
cp .env.example .env
```

Open `.env` and fill in all four values. Compose **fails to start** if any are missing —
there are no fallback defaults:

```bash
OPENAI_API_KEY=sk-...                                # your key
MONGO_URI=mongodb+srv://...@....mongodb.net/chatbot  # from Atlas
REDIS_URL=redis://default:<password>@<host>:<port>   # from Redis Cloud
JWT_SECRET=...                                       # openssl rand -hex 32
```

> Atlas only accepts connections from allow-listed IPs. Add your current address under
> **Network Access**, and keep the `/chatbot` database name in the URI — without it the
> driver connects to `test` instead.

Without `OPENAI_API_KEY` everything still runs — the app boots and you can sign up and
create bots, but the bot replies `"I'm having trouble right now. Please try again."`
instead of a real answer.

`.env` is gitignored. Keep secrets out of commits.

---

## Path A — Docker (recommended)

```bash
docker compose up --build
```

Open http://localhost:3000. First build takes a few minutes; later starts take seconds.

Both app containers mount the source tree and run their dev servers, so your edits
hot-reload. Rebuild only when dependencies change.

### Everyday commands

```bash
docker compose up -d          # start in background
docker compose logs -f        # tail all logs
docker compose logs -f backend
docker compose restart backend   # after editing .env
docker compose down           # stop (data kept)
docker compose down -v        # stop and WIPE the database
```

### If `docker compose` doesn't work

On this machine `docker` is a Podman shim and the Compose plugin isn't wired up. Use
`podman-compose` instead — same arguments throughout this file:

```bash
podman-compose up --build
```

---

## Path B — locally, with pnpm

Useful when you want a debugger attached or faster reloads.

Needs **pnpm** and Node 20+ on your machine. The version is pinned in each `package.json`
via `packageManager`, so the simplest way to get the right one is Corepack:

```bash
corepack enable
```

Both datastores are managed, so there is nothing extra to start.

### Backend

```bash
cp backend/.env.example backend/.env
```

Copy the same `MONGO_URI`, `REDIS_URL`, `JWT_SECRET` and `OPENAI_API_KEY` values from your
root `.env` into `backend/.env`.

```bash
cd backend
pnpm install
pnpm dev           # http://localhost:5000
```

### Frontend

In a second terminal:

```bash
cp frontend/.env.example frontend/.env.local
cd frontend
pnpm install
pnpm dev           # http://localhost:3000
```

### Port conflict

Both paths use ports 3000 and 5000, so you can't run them at once. Stop the app containers
first, leaving the databases up:

```bash
docker compose stop backend frontend
```

### Background worker

Document embedding runs on a Bull queue, so the worker must be running for uploads to
finish processing. Compose starts it as the `embedding-worker` service. Running outside
Docker, start it yourself in a third terminal:

```bash
cd backend && pnpm worker:embedding
```

Without it, uploads stay at `pending` forever.

---

## Data persistence

Both datastores are hosted, so nothing lives in a Docker volume any more and
`docker compose down -v` no longer destroys anything. Your data persists in Atlas
independently of the containers.

Back up before risky changes:

```bash
mongodump --uri="$MONGO_URI" --archive=backup.archive --gzip
mongorestore --uri="$MONGO_URI" --archive=backup.archive --gzip
```

---

## Inspecting the database

There is no local Mongo container to `exec` into. Use MongoDB Compass with the Atlas
connection string, the Atlas web UI, or `mongosh` in a throwaway container:

```bash
set -a && . ./.env && set +a
docker run --rm -it mongo:7 mongosh "$MONGO_URI"
```

---

## Troubleshooting

**`docker compose up` exits complaining a variable is not set**
A required value is missing from `.env`. See Step 1 — all four are mandatory.

**Backend logs `MongoDB connection error`**
Usually one of: your IP is not allow-listed in Atlas (**Network Access**), the password in
`MONGO_URI` needs URL-encoding (`@`, `:`, `/` and `#` must be percent-encoded), or the
database user lacks read/write on the `chatbot` database.

**Bot replies "I'm having trouble right now"**
`OPENAI_API_KEY` is missing, invalid, or out of quota. Check `docker compose logs backend`
for the underlying error, then `docker compose restart backend` after fixing the key.

**Port 3000 or 5000 already in use**
Something else is bound — often the other run path. Find it with
`lsof -iTCP:5000 -sTCP:LISTEN`, or run `docker compose stop backend frontend`.

**Edits aren't hot-reloading in Docker**
Dependency changes need a rebuild: `docker compose up --build`.

**`pnpm install` fails with `ERR_PNPM_OUTDATED_LOCKFILE`**
`package.json` and `pnpm-lock.yaml` have drifted. Run `pnpm install` without
`--frozen-lockfile` locally to refresh the lockfile, then commit it. The Docker build uses
`--frozen-lockfile` deliberately so builds stay reproducible.

---

## Verifying it works

```bash
curl http://localhost:5000/health
# {"status":"OK"}
```

Then open http://localhost:3000, sign up, and create a bot. If the dashboard loads and the
bot appears, everything is wired up correctly.
