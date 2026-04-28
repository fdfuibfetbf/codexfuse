# CodexFuse

> Every AI service. One platform.

CodexFuse is a production-grade scaffold for an AI SaaS platform — chat, image, voice,
video, code, RAG, agents, workflows — all wired into a single dark-mode workspace
that runs against any modern AI provider.

This repo is a **monorepo**:

- `client/` — React + Vite + TypeScript + Tailwind CSS (frontend)
- `server/` — Node.js + Express + TypeScript + Prisma (backend API)

## Features

| Tool                | Status   | Providers (default → fallback)                        |
| ------------------- | -------- | ----------------------------------------------------- |
| AI chat             | ✓        | OpenAI → Anthropic → Gemini → Ollama                  |
| Image generation    | ✓        | OpenAI → Stability → Replicate                        |
| Image edit          | ✓        | OpenAI                                                |
| Text-to-speech      | ✓        | ElevenLabs → OpenAI                                   |
| Speech-to-text      | ✓        | OpenAI Whisper                                        |
| Code generator      | ✓        | Same as chat                                          |
| Templates library   | ✓ (10+)  | Same as chat                                          |
| Translation         | ✓        | Same as chat                                          |
| OCR                 | ✓        | OpenAI vision                                         |
| AI detector         | ✓        | Same as chat                                          |
| Plagiarism check    | ✓        | Same as chat                                          |
| AI search           | ✓        | DuckDuckGo + chat synthesis                           |
| Documents · RAG     | ✓        | OpenAI embeddings + chat                              |
| Custom GPT bots     | ✓        | Same as chat                                          |
| Brand voices        | ✓        | Same as chat                                          |
| AI agents           | ✓        | Same as chat (plan → execute)                         |
| Workflows           | ✓        | Same as chat (linear node executor)                   |
| Video generation    | ✓        | Replicate (`minimax/video-01`)                        |
| Music generation    | ✓        | Replicate (`meta/musicgen`)                           |
| Team workspaces     | ✓        | —                                                     |
| Admin panel         | ✓        | —                                                     |

> Each route checks the configured providers and returns a clear "not configured" error
> if no provider key is available — drop in a key in `.env` and it lights up.

## Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp server/.env.example server/.env
# Then edit server/.env and set:
#   DATABASE_URL=postgresql://...
#   JWT_SECRET=<32-byte random>
#   JWT_REFRESH_SECRET=<32-byte random>
#   OPENAI_API_KEY=...   (any one provider is enough to start)

# 3. Set up the database
cd server
npx prisma migrate dev --name init
npm run seed
cd ..

# 4. Run dev servers (client + server in parallel)
npm run dev
```

Open `http://localhost:5173` in your browser. The seed creates a SUPERADMIN account at
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults: `admin@codexfuse.app` / `ChangeMe123!`).

## Scripts

```
npm run dev          # client + server in parallel
npm run dev:client   # frontend only (Vite on :5173, proxies /api → :4000)
npm run dev:server   # backend only (Express on :4000)
npm run build        # build both
npm run lint         # lint both
npm run typecheck    # typecheck both
```

## Environment variables

See `server/.env.example`. Notable variables:

| Variable                | Purpose                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`          | Postgres connection string (Prisma)                                    |
| `JWT_SECRET`            | Used to sign access tokens                                             |
| `JWT_REFRESH_SECRET`    | Used to sign refresh tokens                                            |
| `OPENAI_API_KEY`        | OpenAI                                                                 |
| `ANTHROPIC_API_KEY`     | Anthropic Claude                                                       |
| `GEMINI_API_KEY`        | Google Gemini                                                          |
| `STABILITY_API_KEY`     | Stable Diffusion 3.5                                                   |
| `REPLICATE_API_TOKEN`   | FLUX, Minimax video, MusicGen                                          |
| `ELEVENLABS_API_KEY`    | ElevenLabs TTS                                                         |
| `HUGGINGFACE_API_KEY`   | HuggingFace Inference API                                              |
| `OLLAMA_BASE_URL`       | Local Ollama server (defaults to `http://localhost:11434`)             |
| `UPLOAD_DIR`            | Local upload directory                                                 |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Default SUPERADMIN credentials                      |

## Architecture

```
[ React Vite client ]  ─── HTTP/JSON ───▶  [ Express API ]
       │                                          │
       │  Tailwind dark-mode UI                   │  routes/*.ts
       │  React Query, Zustand                    │  ├── auth.ts (JWT)
       │  React Router                            │  ├── chat / image / voice / code …
       └────────────────────────────────────┐     │  └── admin.ts
                                            │     │
                                            ▼     ▼
                                   [ providers/* ] ──▶ OpenAI · Anthropic · Gemini ·
                                                       Stability · Replicate ·
                                                       ElevenLabs · HuggingFace ·
                                                       Ollama
                                                       │
                                                       ▼
                                                [ Prisma + Postgres ]
                                                  users, workspaces, plans,
                                                  chats, messages, docs+chunks,
                                                  bots, agents, workflows,
                                                  generations, refresh tokens,
                                                  audit logs, ...
```

The provider layer (`server/src/providers/*.ts`) implements a shared interface
(`chat`, `image`, `tts`, `stt`, `embed`, …). Each route picks the best available
provider via `pickChatProvider()` / `pickImageProvider()` / `pickTTSProvider()`,
which gracefully fall back across providers in priority order.

## Deployment

### Frontend → Vercel

```bash
# from repo root
vercel --cwd client
```

Set `VITE_API_URL` to your backend's public URL.

### Backend → Render / Railway / Fly.io

The Express + Postgres backend can be deployed to any Node host. Suggested setup:

1. Provision a Postgres database (Neon, Supabase, Railway, RDS).
2. Set the env vars from `server/.env.example` on the host.
3. Deploy the `server/` folder. Build command: `npm install && npm run build && npx prisma migrate deploy`. Start command: `node dist/index.js`.
4. Run `npm run seed` once after first deploy to create the default admin + plans + templates.

> Vercel can host the frontend, but a long-running Express server with WebSockets/cron
> is better hosted on Render/Railway/Fly. The two communicate via `VITE_API_URL`.

## Security notes

- All API routes are JWT-protected; refresh tokens are rotated on use and stored hashed.
- Provider keys never leave the server.
- Helmet, CORS, request rate-limiting (240 req/min/IP) and input validation (Zod) are on by default.
- The seed admin password is for local dev — change it in production.

## Next steps

- Add Stripe / Paddle billing on top of the existing `Plan` and `creditsUsed` model.
- Add streaming for chat (SSE) for snappier UX.
- Add object storage (S3/R2) for uploads instead of local disk.
- Wire `pgvector` for native vector search instead of in-memory cosine.
- Add SSO (SAML / OIDC) via the existing RBAC.

---

Built with ❤️ for builders. Mix-and-match every AI provider, ship under your own brand.
