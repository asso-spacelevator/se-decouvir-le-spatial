# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build (`dist/`)
- `npm run preview` — preview the built bundle
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run typecheck` — `tsc --noEmit -p tsconfig.app.json` (no test runner is
  configured)

Supabase env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are required
at boot — `src/lib/supabase.ts` throws on missing values, so the app won't start
without an `.env`.

## Architecture

Single-page React/TypeScript app (Vite + Tailwind) — an "Interactive Ariane 6
Student Journey" delivered in two classroom sessions. There is no router; the
entire navigation model lives in `src/App.tsx`.

### Section state machine (`src/App.tsx`)

The `Section` union in `src/lib/supabase.ts` is the source of truth for every
screen. `App.tsx` keeps `currentView` in local state and renders exactly one
section component per value. Section transitions go through three coordinated
helpers:

- `navigate(section)` — sets local view + persists `current_section` to Supabase
- `completeSection(name)` — appends to `completed_sections` jsonb array
- `handleSectionComplete(next)` — completes current then navigates to next

Sessions are split: `SESSION1_STEPS` (impact_terrestre → rockets → social) and
`SESSION2_STEPS` (satellites → exploration → accompagnement → faq_questions).
The `session_break` screen ends session 1 by routing back to `start`;
`faq_questions` ends session 2 via `handleSession2End` → `completed`. The
`ProgressBar` only renders inside the two step arrays.

When adding a new section: extend the `Section` type, add it to `sectionOrder`,
add to the appropriate `SESSIONx_STEPS` array if it should show progress, and
render it in `App.tsx`.

### Session persistence (`src/contexts/SessionContext.tsx`)

`SessionProvider` wraps the entire app and creates/restores an anonymous
Supabase row in `student_sessions` keyed by
`localStorage['space_education_session_id']`. It exposes:

- `updateSection` / `completeSection` — section state
- `saveResponse` / `getResponses` — per-(section, question_id) free-text
  answers, upsert-style
- `submitQuestion` — appends to `student_questions` (FAQ Zone)
- `saveQuizScore` / `getTotalQuizScore` — `quiz_scores` rows + running
  `total_quiz_score` on the session

A 30-second `setInterval` pings `last_active`.

### `useSectionState` hook

`src/hooks/useSectionState.ts` is the standard pattern for any interactive input
that should survive a refresh. It wraps `saveResponse`/`getResponses`,
auto-(de)serializes JSON for object values, and guards writes behind an
`isLoaded` flag so the hydration read doesn't overwrite saved state. Use this
rather than calling `saveResponse` directly from components.

### Database (`supabase/migrations/`)

Four tables, all with anonymous RLS policies (anyone can insert/select/update):

- `student_sessions` — one row per browser, identified via localStorage
- `student_responses` — keyed by `(session_id, section, question_id)`;
  `useSectionState` enforces upsert semantics in the client (no DB unique
  constraint)
- `student_questions` — categorized free-form questions
  (`career | technical | geopolitics | general`)
- `quiz_scores` — append-only per-answer log, mirrored as `total_quiz_score` on
  the session

Migration filenames use `YYYYMMDDHHMMSS_description.sql`.

### Conventions

- Tailwind utility classes only — no CSS modules, no styled-components
- Icons exclusively from `lucide-react` (see `.bolt/prompt`)
- `lucide-react` is excluded from Vite's `optimizeDeps` (`vite.config.ts`) —
  leave that alone
- UI copy is in French
- Components live flat in `src/components/`; the `Subsection` component is the
  standard expandable "topic + embedded video" card pattern reused across
  sections
