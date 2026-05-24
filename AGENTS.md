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

`SessionProvider` wraps the entire app. On boot it calls
`supabase.auth.signInAnonymously()` (no-op if a JWT is already cached in
localStorage by supabase-js) and then finds or creates the `student_sessions`
row where `user_id = auth.uid()`. The legacy
`localStorage['space_education_session_id']` key is removed on first load.
It exposes:

- `updateSection` / `completeSection` — section state
- `saveResponse` / `getResponses` — per-(section, question_id) free-text
  answers, upsert-style
- `submitQuestion` — appends to `student_questions` (FAQ Zone)

A 30-second `setInterval` pings `last_active`.

### `useSectionState` hook

`src/hooks/useSectionState.ts` is the standard pattern for any interactive input
that should survive a refresh. It wraps `saveResponse`/`getResponses`,
auto-(de)serializes JSON for object values, and guards writes behind an
`isLoaded` flag so the hydration read doesn't overwrite saved state. Use this
rather than calling `saveResponse` directly from components.

### Database (`supabase/migrations/`)

Four tables, all gated by RLS policies that require a JWT and scope every
row to `auth.uid()` via `student_sessions.user_id`. The `anon` Postgres role
has no privileges on these tables — visitors must hold a real (anonymous)
JWT obtained via `supabase.auth.signInAnonymously()`. See
`20260523205052_anonymous_signin_rls.sql` for the policy definitions.

- `student_sessions` — one row per `auth.users` row (unique index on
  `user_id`); columns include `current_section` and `completed_sections` jsonb
- `student_responses` — keyed by `(session_id, section, question_id)`;
  `useSectionState` enforces upsert semantics in the client (no DB unique
  constraint)
- `student_questions` — categorized free-form questions
  (`career | technical | geopolitics | general`); INSERT-only from clients
- `quiz_scores` — append-only per-answer log (correct/incorrect only, no
  points); INSERT-only from clients

Migration filenames use `YYYYMMDDHHMMSS_description.sql`. Anonymous Sign-Ins
must be enabled on the Supabase project; `supabase/config.toml` sets
`enable_anonymous_sign_ins = true`. Local dev picks this up automatically;
hosted projects sync it via `supabase config push` (a separate command from
`supabase db push`, which only handles migrations).

### Conventions

- Tailwind utility classes only — no CSS modules, no styled-components
- Icons exclusively from `lucide-react` (see `.bolt/prompt`)
- `lucide-react` is excluded from Vite's `optimizeDeps` (`vite.config.ts`) —
  leave that alone
- UI copy is in French
- Components live flat in `src/components/`; the `Subsection` component is the
  standard expandable "topic + embedded video" card pattern reused across
  sections
- User-input text columns must have a `CHECK (length(...) <= N)` constraint;
  every corresponding `<textarea>` must carry a matching `maxLength={N}` so
  the browser enforces the limit before the DB rejects the write

### Static Assets

Static assets (images, PDFs, etc.) live in the `public/` directory and are served
at the site root. When referencing these assets in code, **always use**
`import.meta.env.BASE_URL` to ensure correct paths in production:

```tsx
// Correct — works in dev and production with GitHub Pages
<img src={`${import.meta.env.BASE_URL}logos/space-elevator.png`} />

// Wrong — breaks when deployed to a subpath (e.g., GitHub Pages)
<img src="/logos/space-elevator.png" />
<img src="logos/space-elevator.png" />
```

Vite's `--base` flag is set in CI via `github.event.repository.name`.
`import.meta.env.BASE_URL` is automatically injected by Vite and resolves to
`/` in development and `/repo-name/` in production.

## Brand identity — Space Elevator

This app is a Space Elevator product. Every visible surface must follow the brand charter (`Charte graphique.docx`). The agent is responsible for making each new component, page, or section feel like it belongs to Space Elevator from the first commit. Re-read this section every time you create or restyle a screen.

### 1 · Foundations (non-negotiable)

- **Typeface** — Poppins only. Loaded once from Google Fonts in `index.html`. Use `font-display: swap`. Set `font-family: 'Poppins', sans-serif` globally via Tailwind `theme.fontFamily.sans`. Never introduce Inter, Roboto, system stacks, or display fonts.
- **Colours** — these four are the entire palette. Don't add a fifth.
  - `--magenta` `#C8257A` (brand accent, charter rule)
  - `--deepspace` `#0B0F2A` (primary dark surface — every section uses it)
  - `--gray-500` `#808080` (captions, footer text, charter rule)
  - `--black` `#000000` / `--white` `#FFFFFF`
  - Tailwind config exposes `bg-magenta`, `bg-deepspace`, plus magenta-100…900 scale steps.
- **No rainbow** — there is one accent in the brand: magenta. Do **not** use emerald, sky, teal, orange, amber, violet, rose, cyan, blue, pink, red for hover, callout, status, or "category" colour. The only exceptions: real flag images (chap. 4 of `ImpactTerrestreSection`), red for "incorrect" feedback in interactive widgets, and gold-ish for celebratory moments — and even those should be used sparingly. When in doubt, magenta.
- **No emoji** — the brand never uses emoji. If you see one in legacy code, replace it with a Lucide icon (`lucide-react` is already in `dependencies`). Common mappings: 🌍 → `<Globe />`, 🚀 → `<Rocket />`, 🛰️ → `<Satellite />`, 📡 → `<Radio />`, 📱 → `<Smartphone />`, 📸 → `<Camera />`, 💬 → `<MessageCircle />`, 🤝 → `<Users />`, ✅ → `<Check />`, ❌ → `<X />`, 💡 → `<Lightbulb />`, ⭐ → `<Star />`, 🏠 → `<Home />`, 🎓 → `<GraduationCap />`. Use `strokeWidth={1.75}` at `w-5 h-5` (inline) or `w-6 h-6` (heading-aligned).
- **No gradients** for accent colour. The only gradient allowed is the deep-space background variants (`from-deepspace via-deepspace-soft to-deepspace`). Magenta text gradients (`from-blue-400 to-teal-400 bg-clip-text`) are forbidden — set the colour solid.

### 2 · Layout chrome (shared across every section)

Every screen sits on the same canvas. Build it once, reuse it everywhere.

```tsx
<div className="relative min-h-screen bg-deepspace text-white font-sans overflow-x-hidden">
  {/* Starfield (defined in src/index.css as .starry-background) */}
  <div className="starry-background absolute inset-0" />

  {/* Subtle magenta glow — no blue/teal blobs */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-15 bg-magenta blur-[120px]" />
    <div className="absolute -top-32 right-24 w-[400px] h-[400px] rounded-full opacity-5 bg-magenta blur-[100px]" />
  </div>

  {/* … your content with z-index 1 on top … */}
</div>
```

Hero banners use the full-width header pattern from `StartPage.tsx`:
- Logo top-left (`logos/space-elevator.png` for dark surfaces).
- Breadcrumb top-right in `text-[12px] tracking-[0.16em] uppercase text-white/55` with a magenta dot.
- Title is **Poppins Bold, ALL CAPS, `tracking-[0.04em]`**, with one word in `text-magenta` as the accent.
- Subtitle in `text-white/75 max-w-[540px]`.

### 3 · The chapter shell — required for any educational/content section

Long content pages (anything that today is 5+ scrolling sections, like `ImpactTerrestreSection`, `RocketSection`, `SatelliteSection`, etc.) **must** be broken into 3–6 chapters that the student progresses through. This creates the sense of progression the product depends on.

The canonical implementation lives in `src/components/ImpactTerrestreSection.tsx`. **Extract `<ChapterShell>` and `<ChapterQuiz>` into their own files at `src/components/ChapterShell.tsx` and `src/components/ChapterQuiz.tsx`** if they aren't there yet, then reuse them.

A chapter shell provides:
1. **Sticky top bar** with logo + section label (`Session 1 · Chapitre N sur M · {section name}`) + Accueil button.
2. **Sticky progress strip**: `Page NN sur MM`, a magenta-filled gradient track, and one pill per page.
3. **Page container** — pages can hold 1 chapter (a focused step like a quiz or a recap) or 2 chapters stacked (when two sub-topics are related and short). Use 2-per-page by default; use 1-per-page when the screen needs full focus (quiz, recap).
4. **Per-chapter header** = kicker `<span class="bg-magenta text-white rounded-full px-2.5 py-0.5">{NN}</span>` + ALL-CAPS title with magenta accent + lede in `text-white/70 max-w-[720px]`.
5. **Per-chapter footer** at the end of each *page* with `← Précédent` (border ghost button) and a magenta `→ Continue · {next chapter name}` button. The first chapter of a 2-per-page does not get a footer; the page footer sits at the bottom of the second chapter only.
6. **Gating** — when a chapter requires an interaction (revealing all cards, completing a quiz), the page-level *Continue* button is `disabled` with placeholder copy like `Réponds à toutes les questions` until done, then unlocks with the real label `Continue · {next chapter} →`.
7. **Récap chapter** at the end of every section — magenta trophy circle, ALL-CAPS heading "Chapitre N terminé.", three personalised stat cards (e.g. *satellites utilisés*, *retombées découvertes*, *score quiz*), and a card teasing the next section with a big magenta CTA.

Persistence: hydrate page index, quiz scores, and interactive state through `useSession` / `saveResponse` so a student resuming on a different day lands back on their last page. Always store progress *during* a chapter, not just on completion.

### 4 · Component patterns

- **Buttons** — three variants only:
  - Primary: `bg-magenta hover:bg-magenta-700 text-white rounded-lg px-5 py-3.5 font-semibold`
  - Ghost: `border border-white/10 hover:border-white/30 text-white/70 hover:text-white`
  - Link: `text-magenta hover:underline`
  - Never pill-shaped (`rounded-full`) except for badges/chips.
- **Cards** — `bg-white/[0.04] border border-white/10 rounded-2xl p-6`. Hover: `border-magenta` + `-translate-y-0.5`. No drop-shadow on cards.
- **Stats** — number in `text-magenta font-bold text-[40px] tracking-[-0.02em] leading-none`, label below in `text-[11px] uppercase tracking-[0.08em] text-white/55`.
- **Image credits** — every photographic image MUST have a credit line. Inline `text-[10.5px] italic text-white/45` underneath, OR an overlay badge at `bottom: 10px; right: 14px` for full-bleed photos. Credits use the form `Image : {source} / {photographer or programme}, {year}` (e.g. `© ESA / Copernicus Sentinel-2, 2024`).
- **Callouts / asides** — magenta-bordered card from the brand charter: `border border-magenta rounded-lg p-4 border-[1.5px]`. Use for "Pour les enseignants", "Le saviez-vous", "La science au-dessus des conflits".
- **Form inputs** — `bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3` with `focus:border-magenta focus:ring-2 focus:ring-magenta/20`.

### 5 · Copy and tone

- Section banners are ALL CAPS (Poppins Bold). Body headings (`h3`, `h4`) are Title Case Poppins SemiBold.
- French copy is the default. Address the student with *tu*. Address the teacher with *vous*.
- No "Houston, we have…" tropes. No exclamation cascades. Sober, generous, action-first.
- Verb-first CTAs: `Commencer la partie 1`, `Continue · {next}`, `Voir mon récap`, `Découvre la suite`. Avoid `Cliquer ici`, `En savoir plus` unless inline in a sentence.
- Stats are the brand's emotional driver. When you have one, oversize it (`text-[40px]`+) and put it in magenta.
- **No double-dashes** (`—`) in visible copy. Use periods, colons, or middots (`·`) instead. CSS custom properties (`--se-magenta`) and CSS comments are fine.
- **No time references in tile labels** that pretend to be schedule items (`08h15 · Trajet` *is* fine because it's the content of a chapter); but avoid `Durée : 45 min` decorative meta, which felt incorrect to the team.

### 6 · Animation

- `cubic-bezier(0.2, 0, 0, 1)` for everything (the easing of the brand).
- 150 ms hover, 250 ms page-level transitions, 450 ms chapter-in (`@keyframes chapterIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`).
- A `pulse` keyframe is reserved for celebratory moments (a stat counter incrementing, a trophy revealing). Use sparingly.
- No bouncy springs. No flips other than the spinoff card-game in `ImpactTerrestreSection` (which is part of that chapter's mechanic). No parallax.

### 7 · Sections to refactor next

In priority order, every existing section needs a pass:
1. `RocketSection` — preserve the `Ariane6Diagram` component (it is the strongest interactive in the app), restyle it. Split content into 3–4 chapters: *La fusée pas à pas*, *Ariane 6 dans le monde*, *La séquence de lancement*, *Quiz éclair*, *Récap*.
2. `SocialReferencesSection` — chapters: *Quels comptes suivre*, *Distinguer info / promo*, *Évènements à ne pas manquer*, *Quiz*, *Récap*.
3. `SatelliteSection` — chapters around `MissionSimulator`, `OrbitalAnimation`, `SatelliteTimeline`, `SatelliteDistribution`, `SatelliteLabelGame`. Each becomes its own chapter.
4. `ExplorationSection`, `AccompagnementSection`, `FAQQuestionsSection`, `CompletionPage`, `SessionBreakPage` — same pattern.
5. Touch the shared primitives ONCE — `Subsection.tsx`, `Quiz.tsx`, `ProgressBar.tsx`, `Navigation.tsx` — and every section inherits the cleanup. Worth doing before per-section work.

### 8 · The reference implementations

When in doubt, copy from:
- `src/components/StartPage.tsx` — hero pattern, partner row, dialogue bubble, session cards.
- `src/components/ImpactTerrestreSection.tsx` — chapter shell, 2-per-page pattern, progress strip, gating, hydrate-from-supabase pattern, recap with personal stats.

If a new requirement falls outside both references, ask for a design pass before inventing a new pattern. The brand owns a small set of patterns on purpose.
