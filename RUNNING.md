# Running the project

Two ways to run it. **Docker is the recommended path** — it's one command and you don't
need MongoDB or Redis installed on your machine.

Mongo runs in a container; Redis is a managed instance (Redis Cloud), so its
connection string comes from `REDIS_URL`. Nothing is installed on your host.

| Service  | URL                          |
| -------- | ---------------------------- |
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:5000        |
| Health   | http://localhost:5000/health |
| MongoDB  | 127.0.0.1:27017              |
| Redis    | managed (Redis Cloud)        |

All ports bind to loopback only, so nothing is reachable from other machines on your network.

---

## Step 1 — secrets (required for both paths)

```bash
cp .env.example .env
```

Open `.env` and fill in all five values. Compose **fails to start** if any are missing —
there are no fallback defaults:

```bash
OPENAI_API_KEY=sk-...        # your key
REDIS_URL=redis://default:<password>@<host>:<port>   # from Redis Cloud
JWT_SECRET=...               # generate: openssl rand -hex 32
MONGO_USER=chatbot_dev       # anything
MONGO_PASSWORD=...           # generate: openssl rand -hex 16
```

> `MONGO_USER` / `MONGO_PASSWORD` seed the database the **first time it starts**. Changing
> them later has no effect until you run `docker compose down -v`, which wipes local data.

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

You still need Mongo, so start just that container (Redis is already managed):

```bash
docker compose up -d mongodb
```

### Backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set `OPENAI_API_KEY`, `JWT_SECRET`, and the Mongo credentials —
`MONGO_URI` has `<MONGO_USER>` / `<MONGO_PASSWORD>` placeholders you must replace with the
same values from your root `.env`:

```
MONGO_URI=mongodb://chatbot_dev:your-password@127.0.0.1:27017/chatbot?authSource=admin
```

Note the host is `127.0.0.1`, not `mongodb`. The `mongodb` hostname only resolves inside
the container network.

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

Your database lives in a named Docker volume (`chatbot_mongodb_data`), not on your host
filesystem. Accounts and bots survive restarts.

| Action                            | Your data      |
| --------------------------------- | -------------- |
| `docker compose restart`          | kept           |
| `docker compose down` then `up`   | kept           |
| Reboot your machine               | kept           |
| `docker compose down -v`          | **wiped**      |

`-v` removes volumes. It's the only way to change the Mongo credentials, but it deletes
every account and bot you've created.

---

## Inspecting the database

There's no `mongosh` on your host — Mongo only exists in the container. Query it through
`exec`. Load your credentials into the shell first, otherwise the variables below are empty:

```bash
set -a && . ./.env && set +a

docker compose exec mongodb mongosh \
  "mongodb://$MONGO_USER:$MONGO_PASSWORD@localhost:27017/chatbot?authSource=admin"
```

GUI tools like MongoDB Compass work too — connect to `127.0.0.1:27017` with the same
credentials and `authSource=admin`.

---

## Troubleshooting

**`docker compose up` exits complaining a variable is not set**
A required value is missing from `.env`. See Step 1 — all five are mandatory.

**Backend logs `MongoDB connection error` / authentication failed**
Your `MONGO_USER` / `MONGO_PASSWORD` don't match what the database was seeded with. The
credentials in `.env` only apply on first init. To reseed:
`docker compose down -v && docker compose up` (this wipes data).

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
