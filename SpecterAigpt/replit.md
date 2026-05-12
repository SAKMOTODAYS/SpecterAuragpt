# AuraAI

AuraAI is a personal AI chat companion that lets users have intelligent, streaming conversations powered by OpenAI, with persistent history and a polished dark/light interface.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/aura-ai run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI via Replit AI Integrations
- Required env: `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: Replit Auth (OIDC + sessions)
- AI: OpenAI via Replit AI Integrations (streaming SSE)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- API spec: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/` (auth.ts, conversations.ts, messages.ts)
- API server routes: `artifacts/api-server/src/routes/`
- OpenAI routes: `artifacts/api-server/src/routes/openai/index.ts`
- Frontend: `artifacts/aura-ai/src/`
- Auth lib (web): `lib/replit-auth-web/`
- OpenAI server lib: `lib/integrations-openai-ai-server/`

## Architecture decisions

- Conversations are scoped per-user via `userId` foreign key — users only see their own conversations
- SSE streaming for AI responses — frontend uses raw `fetch` + `ReadableStream` (not generated hooks) since Orval can't type SSE streams
- Replit Auth replaces Firebase Auth — sessions stored in PostgreSQL, no external auth dependency
- OpenAI via Replit AI Integrations proxy — no API key required from the user
- Dark/light theme stored in localStorage, toggled via class on `document.documentElement`

## Product

- Login with Replit account (OIDC)
- Create and manage AI chat conversations
- Real-time streaming AI responses (word-by-word)
- Persistent conversation history per user
- Dark/light mode
- Sidebar with conversation history and user info

## User preferences

- Wants to use existing design (AuraAI brand: violet #7C6DFA to fuchsia #E879F9 gradient)
- Replace Firebase with Replit-native solutions

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after OpenAPI spec changes
- Always run `pnpm --filter @workspace/db run push` after DB schema changes
- SSE endpoints cannot use generated Orval hooks — use raw fetch on the frontend

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
