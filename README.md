# Se découvrir le spatial

Interactive Ariane 6 student journey — a two-session classroom web app built
with React, Vite, TypeScript, Tailwind, and Supabase. Anonymous student sessions
are persisted via `localStorage` + Supabase so learners can resume where they
left off.

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, `lucide-react` icons
- **Backend**: Supabase (Postgres + RLS, anonymous-only policies)
- **Tooling**: ESLint flat config

## Prerequisites

- Node.js 18+ and npm
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- Docker (required by `supabase start` for the local stack)

## Setup

```bash
git clone <repo-url>
cd se-decouvir-le-spatial
npm install
cp .env.example .env
```

You now need a Supabase project (either local or hosted) to fill in `.env`.

## Running the Supabase backend

### Option A — local Supabase (recommended for development)

```bash
supabase start

# OR
npx supabase start
```

This boots a local Postgres + Studio + API stack via Docker. The first run is
slow because it pulls images. The output prints the API URL and anon key — copy
them into `.env`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key from `supabase start` output>
```

Apply the migrations under `supabase/migrations/`:

```bash
supabase db reset
```

`db reset` wipes the local database and re-runs every migration in
`supabase/migrations/` from scratch — use it whenever you add a migration or
want a clean slate. Studio is available at <http://127.0.0.1:54323>.

Stop the stack with `supabase stop`.

### Option B — hosted Supabase project

1. Create a project at <https://supabase.com/dashboard>.
2. In **Project Settings → API**, copy the project URL and `anon` public key
   into `.env`.
3. Link the CLI and push the migrations:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

## Running the frontend

```bash
npm run dev
```

Vite serves at <http://localhost:5173>. The app refuses to boot if
`VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing — see
`src/lib/supabase.ts`.
