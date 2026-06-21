import { createContext, useContext, useRef } from 'react';
import { ChevronLeft, Home, Trophy } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

interface ChapterTimeCtx { section: string; page: number }
export const ChapterTimeContext = createContext<ChapterTimeCtx | null>(null);

export function ChapterTimeTracker({ section, page, children }: ChapterTimeCtx & { children: React.ReactNode }) {
  return (
    <ChapterTimeContext.Provider value={{ section, page }}>
      {children}
    </ChapterTimeContext.Provider>
  );
}

/* ─── SectionCanvas ─────────────────────────────────────────────────
 * Full-screen deep-space canvas used by every section.
 * ──────────────────────────────────────────────────────────────────── */
export function SectionCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-deepspace text-white font-sans overflow-x-hidden">
      <div className="starry-background absolute inset-0" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-15 bg-magenta blur-[120px]" />
        <div className="absolute -top-32 right-24 w-[400px] h-[400px] rounded-full opacity-5 bg-magenta blur-[100px]" />
      </div>
      {children}
    </div>
  );
}

/* ─── SectionTopBar ─────────────────────────────────────────────────
 * Sticky header: logo · session label · Accueil button.
 * ──────────────────────────────────────────────────────────────────── */
interface SectionTopBarProps {
  label: string;
  onHome: () => void;
}

export function SectionTopBar({ label, onHome }: SectionTopBarProps) {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-md bg-deepspace/80 border-b border-white/5">
      <div className="max-w-[1240px] mx-auto px-8 py-4 grid grid-cols-[auto_1fr_auto] items-center gap-8">
        <img
          src={`${import.meta.env.BASE_URL}logos/space-elevator.png`}
          alt="Space Elevator"
          className="h-8 block"
        />
        <div className="text-center text-[12px] font-medium tracking-[0.16em] uppercase text-white/60">
          {label}
        </div>
        <button
          onClick={onHome}
          className="inline-flex items-center gap-1.5 border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5 text-[12px] font-medium text-white/70 hover:text-white transition-colors"
        >
          <Home className="w-3.5 h-3.5" /> Accueil
        </button>
      </div>
    </div>
  );
}

/* ─── SectionProgress ───────────────────────────────────────────────
 * Sticky progress strip: page counter · filled track · pill nav.
 * ──────────────────────────────────────────────────────────────────── */
interface SectionProgressProps {
  current: number;
  total: number;
}

export function SectionProgress({ current, total }: SectionProgressProps) {
  return (
    <div className="sticky top-[57px] z-10 backdrop-blur-md bg-deepspace/75 border-b border-white/5">
      <div className="max-w-[1240px] mx-auto px-8 py-3.5 flex items-center gap-3.5">
        <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/55 whitespace-nowrap">
          Page <span className="text-magenta">{String(current + 1).padStart(2, '0')}</span> sur {String(total).padStart(2, '0')}
        </div>
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-magenta to-magenta-700 transition-all duration-500"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => {
            const isCurrent = i === current;
            const isDone = i < current;
            return (
              <div
                key={i}
                className={
                  'w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold transition-all ' +
                  (isCurrent
                    ? 'bg-magenta text-white scale-110 shadow-[0_0_0_3px_rgba(200,37,122,0.25)]'
                    : isDone
                      ? 'bg-magenta/15 text-magenta border border-magenta'
                      : 'bg-white/5 text-white/55 border border-white/10')
                }
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── ChapterShell ──────────────────────────────────────────────────
 * Per-chapter wrapper: kicker pill + ALL CAPS title + lede + body + nav footer.
 * ──────────────────────────────────────────────────────────────────── */
export interface ChapterShellProps {
  kicker: string;
  title: string;
  titleAccent: string;
  titlePrefix?: string;
  lede: string;
  onPrev: (() => void) | null;
  onNext: () => void;
  nextEnabled: boolean;
  nextLabel: string;
  nextTitle?: string;
  nextDesc?: string;
  children: React.ReactNode;
}

export function ChapterShell(props: ChapterShellProps) {
  const { logChapterTime } = useSession();
  const ctx = useContext(ChapterTimeContext);
  const mountedAt = useRef(Date.now());

  const handleNext = () => {
    if (ctx) {
      const elapsed = Math.round((Date.now() - mountedAt.current) / 1000);
      console.log('[time] continue clicked', ctx.section, 'page', ctx.page, elapsed + 's');
      logChapterTime(ctx.section, ctx.page, elapsed);
    } else {
      console.warn('[time] no ChapterTimeTracker context found');
    }
    props.onNext();
  };

  return (
    <section className="animate-[chapterIn_480ms_cubic-bezier(.2,0,0,1)]">
      <div className="flex flex-col gap-2 mb-7">
        <div className="inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.16em] uppercase text-magenta">
          <span className="bg-magenta text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold">{props.kicker}</span>
          {props.title}
        </div>
        <h1 className="font-display font-bold uppercase tracking-[0.04em] text-[clamp(32px,4vw,52px)] leading-[1.08] m-0">
          {props.titlePrefix && <>{props.titlePrefix}<br /></>}
          <span className="text-magenta">{props.titleAccent}</span>
        </h1>
        <p className="text-[16px] text-white/70 max-w-[720px] leading-[1.55] m-0 mt-2">{props.lede}</p>
      </div>

      {props.children}

      {props.nextTitle && (
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/55">Prochaine section</span>
            <span className="text-[22px] font-semibold">{props.nextTitle}</span>
            {props.nextDesc && <span className="text-[13px] text-white/60">{props.nextDesc}</span>}
          </div>
          <button
            onClick={handleNext}
            disabled={!props.nextEnabled}
            className="inline-flex items-center gap-2 bg-magenta text-white rounded-lg px-6 py-4 text-[14px] font-semibold hover:bg-magenta-700 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition whitespace-nowrap"
          >
            {props.nextLabel}
          </button>
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
        {props.onPrev ? (
          <button
            onClick={props.onPrev}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3.5 text-[14px] font-semibold border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" /> Précédent
          </button>
        ) : <div />}

        {!props.nextTitle && (
          <button
            onClick={handleNext}
            disabled={!props.nextEnabled}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3.5 text-[14px] font-semibold bg-magenta text-white hover:bg-magenta-700 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition"
          >
            {props.nextLabel}
          </button>
        )}
      </div>
    </section>
  );
}

/* ─── ChapterRecap ──────────────────────────────────────────────────
 * Celebratory final chapter: trophy + personal stats + next section card.
 * ──────────────────────────────────────────────────────────────────── */
interface RecapStatItem { v: string | number; t: string }

interface ChapterRecapProps {
  chapterLabel: string;
  summary: string;
  stats?: RecapStatItem[];
  nextTitle: string;
  nextDesc: string;
  onContinue: () => void;
  onPrev: () => void;
}

export function ChapterRecap({
  chapterLabel, summary, stats = [], nextTitle, nextDesc, onContinue, onPrev,
}: ChapterRecapProps) {
  const { logChapterTime } = useSession();
  const ctx = useContext(ChapterTimeContext);
  const mountedAt = useRef(Date.now());

  const handleContinue = () => {
    if (ctx) logChapterTime(ctx.section, ctx.page, Math.round((Date.now() - mountedAt.current) / 1000));
    onContinue();
  };

  return (
    <section className="animate-[chapterIn_480ms_cubic-bezier(.2,0,0,1)]">
      <div className="text-center pt-10">
        <div className="w-24 h-24 mx-auto mb-6 bg-magenta rounded-full grid place-items-center shadow-[0_0_0_6px_rgba(200,37,122,0.18),0_20px_40px_rgba(200,37,122,0.35)]">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="font-display font-bold uppercase tracking-[0.04em] text-[clamp(36px,5vw,56px)] m-0 mb-3">
          {chapterLabel} <span className="text-magenta">terminé.</span>
        </h1>
        <p className="text-[17px] text-white/70 max-w-[560px] mx-auto m-0 mb-9 leading-[1.55]">{summary}</p>

        {stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left mb-9">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-magenta">Tes statistiques</span>
                <span className="text-[32px] font-bold text-magenta leading-none">{s.v}</span>
                <span className="text-[15px] font-medium leading-[1.35]">{s.t}</span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/55">Prochain chapitre</span>
            <span className="text-[22px] font-semibold">{nextTitle}</span>
            <span className="text-[13px] text-white/60">{nextDesc}</span>
          </div>
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-2 bg-magenta text-white rounded-lg px-6 py-4 text-[14px] font-semibold hover:bg-magenta-700 transition whitespace-nowrap"
          >
            Continuer la session →
          </button>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 flex">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-3.5 text-[14px] font-semibold border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" /> Précédent
        </button>
      </div>
    </section>
  );
}
