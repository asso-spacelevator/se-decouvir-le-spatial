import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Check, ChevronUp, ChevronDown, GripVertical, X } from 'lucide-react';

/* ════════════════════════════════════════════════════════════════
 *  ExplorationWidgets — interactive pieces for ExplorationSection
 *
 *  Faithful React port of `exploration.js` from the standalone
 *  redesign. No external deps beyond lucide-react. Honours
 *  prefers-reduced-motion. Drop alongside ExplorationSection.tsx
 *  in `src/components/`.
 * ════════════════════════════════════════════════════════════════*/

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Striped placeholder for NASA images that fail to load ───────── */
export function ph(label?: string, tone?: string): string {
  const c = tone === 'mars' ? ['#3a1f17', '#2a1510'] : ['#0e1334', '#080b20'];
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'>" +
    "<defs><pattern id='p' width='16' height='16' patternTransform='rotate(45)' patternUnits='userSpaceOnUse'>" +
    "<rect width='16' height='16' fill='" + c[0] + "'/><rect width='8' height='16' fill='" + c[1] + "'/></pattern></defs>" +
    "<rect width='100%' height='100%' fill='url(#p)'/>" +
    "<rect x='1' y='1' width='1198' height='673' fill='none' stroke='rgba(255,255,255,.14)' stroke-width='2'/>" +
    "<text x='600' y='345' fill='rgba(255,255,255,.55)' font-family='monospace' font-size='30' text-anchor='middle'>" +
    (label || 'PHOTO · NASA') + '</text></svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* ── <Img> — hotlinked image with striped-placeholder fallback ──── */
export function Img({
  src,
  alt,
  fallback,
  tone,
  className,
}: {
  src: string;
  alt: string;
  fallback?: string;
  tone?: string;
  className?: string;
}) {
  const triesRef = useRef(0);
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src.indexOf('data:') === 0) return;
        triesRef.current += 1;
        if (triesRef.current <= 2) {
          const sep = src.indexOf('?') >= 0 ? '&' : '?';
          setTimeout(
            () => { img.src = src + sep + 'retry=' + triesRef.current; },
            480 * triesRef.current + Math.random() * 360,
          );
        } else {
          img.src = ph(fallback, tone);
        }
      }}
    />
  );
}

/* ════════════════════════════════════════════════════════════════
 *  Trajectory — animated SVG mission path with step rail + info
 * ════════════════════════════════════════════════════════════════*/
export interface TrajStep {
  short: string;
  title: string;
  date?: string;
  body: string;
  stages?: string[];
  t: number;
}
export interface TrajConfig {
  decor: string; // raw SVG markup injected into a <g>
  path: string;
  steps: TrajStep[];
}

export function Trajectory({ decor, path, steps }: TrajConfig) {
  const baseRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const lenRef = useRef(0);
  const curFrac = useRef(0);
  const raf = useRef(0);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const place = (frac: number) => {
    const base = baseRef.current, trail = trailRef.current, marker = markerRef.current;
    if (!base || !trail || !marker) return;
    const len = lenRef.current;
    trail.style.strokeDasharray = String(len);
    trail.style.strokeDashoffset = String(len * (1 - frac));
    const pt = base.getPointAtLength(len * frac);
    marker.setAttribute('transform', `translate(${pt.x},${pt.y})`);
  };

  const animateTo = (frac: number) => {
    cancelAnimationFrame(raf.current);
    if (REDUCED) { curFrac.current = frac; place(frac); return; }
    const start = curFrac.current;
    const t0 = performance.now();
    const d = 760;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / d);
      const e = 1 - Math.pow(1 - k, 3);
      curFrac.current = start + (frac - start) * e;
      place(curFrac.current);
      if (k < 1) raf.current = requestAnimationFrame(step);
      else curFrac.current = frac;
    };
    raf.current = requestAnimationFrame(step);
  };

  // Measure path + place initial marker once mounted
  useEffect(() => {
    if (baseRef.current) lenRef.current = baseRef.current.getTotalLength();
    curFrac.current = steps[0].t;
    place(steps[0].t);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate whenever the active step changes
  useEffect(() => { animateTo(steps[idx].t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [idx]);

  // Auto-play loop
  useEffect(() => {
    if (!playing) return;
    if (idx >= steps.length - 1) { setPlaying(false); return; }
    const id = setTimeout(() => setIdx((i) => Math.min(i + 1, steps.length - 1)), REDUCED ? 0 : 2300);
    return () => clearTimeout(id);
  }, [playing, idx, steps.length]);

  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    if (idx >= steps.length - 1) setIdx(0);
    setPlaying(true);
  };
  const reset = () => { setPlaying(false); setIdx(0); };

  const s = steps[idx];
  const atEnd = idx >= steps.length - 1;

  return (
    <div>
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#05071a]">
        <svg viewBox="0 0 800 360" className="w-full block" style={{ aspectRatio: '800 / 360' }} aria-hidden="true">
          <g dangerouslySetInnerHTML={{ __html: decor }} />
          <path ref={baseRef} d={path} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={2} strokeDasharray="5 7" />
          <path ref={trailRef} d={path} fill="none" stroke="#c8257a" strokeWidth={3.5} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(200,37,122,.7))' }} />
          <g ref={markerRef}>
            <circle r={13} fill="rgba(200,37,122,.25)" />
            <circle r={6.5} fill="#fff" />
            <circle r={6.5} fill="none" stroke="#c8257a" strokeWidth={2} />
          </g>
        </svg>
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="inline-flex items-center gap-2 rounded-lg bg-magenta hover:bg-magenta-700 text-white text-[12px] font-semibold px-3 py-1.5 transition"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? 'Pause' : atEnd ? 'Rejouer' : "Lancer l'animation"}
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 hover:border-white/35 text-white/70 hover:text-white text-[12px] font-medium px-2.5 py-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reprendre
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {steps.map((st, i) => (
          <button
            key={i}
            onClick={() => { setPlaying(false); setIdx(i); }}
            aria-current={i === idx ? 'true' : 'false'}
            className={
              'text-[12px] font-medium rounded-lg px-3 py-1.5 transition border ' +
              (i === idx
                ? 'bg-magenta border-magenta text-white'
                : 'border-white/12 text-white/65 hover:text-white hover:border-white/30')
            }
          >
            {i + 1}. {st.short}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-magenta">
            Étape {idx + 1} / {steps.length}
          </span>
          {s.date && (
            <span className="text-[11px] font-semibold text-white/80 bg-white/8 border border-white/12 rounded-full px-2 py-0.5">
              {s.date}
            </span>
          )}
        </div>
        <p className="m-0 text-[15px] font-bold text-white">{s.title}</p>
        <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-1">{s.body}</p>
        {s.stages && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {s.stages.map((g, k) => (
              <span key={k} className="text-[11px] text-white/75 bg-magenta/12 border border-magenta/25 rounded-md px-2 py-1">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
 *  JWSTTrajectoryFigure — ESA diagram + milestone cards
 * ════════════════════════════════════════════════════════════════*/
interface JWSTMilestone {
  day: string;
  title: string;
  body: string;
}

const JWST_MILESTONES: JWSTMilestone[] = [
  { day: 'Jour 0', title: 'Lancement', body: "Décollage depuis Kourou à bord d'une fusée Ariane 5 — le télescope voyage replié, façon origami, dans la coiffe." },
  { day: 'Jour 3', title: 'Déploiement du bouclier solaire', body: 'Les cinq couches du pare-soleil se déploient puis se tendent, plongeant les instruments dans le noir et le froid.' },
  { day: 'Jour 13', title: 'Déploiement du miroir primaire', body: 'Les deux ailes du miroir primaire de 6,5 m se déplient et se verrouillent, complétant les 18 segments dorés.' },
  { day: 'Jour 30', title: 'Déploiement du miroir secondaire', body: 'Le miroir secondaire se déploie au bout de son tripode : la silhouette du télescope est désormais complète.' },
  { day: 'Jour ~29', title: 'Arrivée au point L2', body: 'Une dernière poussée place Webb en orbite de halo autour de L2, à 1,5 million de km de la Terre, côté nuit.' },
];

export function JWSTTrajectoryFigure() {
  return (
    <div>
      <figure className="m-0 rounded-xl overflow-hidden border border-white/10 bg-[#03030f]">
        <Img
          src="https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/01/webb_trajectory_diagram/23914393-1-eng-GB/Webb_trajectory_diagram.jpg"
          alt="Schéma de la trajectoire de Webb depuis la Terre jusqu'à son orbite de halo autour du point de Lagrange L2"
          fallback="TRAJECTOIRE TERRE → L2"
          className="w-full block"
        />
        <figcaption className="px-4 py-3">
          <p className="m-0 text-[10.5px] italic text-white/45">Image : ESA / NASA, 2022 — vue d'artiste de la trajectoire et de l'orbite de halo de Webb autour de L2.</p>
        </figcaption>
      </figure>

      <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
        {JWST_MILESTONES.map((m, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-magenta">{m.day}</span>
            <p className="m-0 text-[14px] font-bold text-white mt-1">{m.title}</p>
            <p className="m-0 text-[12.5px] text-white/65 leading-relaxed mt-1">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
 *  MissionGallery — credited image grid
 * ════════════════════════════════════════════════════════════════*/
export interface GalleryItem {
  img: string;
  alt: string;
  fallback: string;
  title: string;
  credit: string;
}
export function MissionGallery({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((g, i) => (
        <figure key={i} className="m-0 rounded-xl overflow-hidden border border-white/10 bg-black">
          <div className="aspect-[4/3]">
            <Img src={g.img} alt={g.alt} fallback={g.fallback} className="w-full h-full object-cover" />
          </div>
          <figcaption className="p-3">
            <p className="m-0 text-[13px] font-semibold text-white">{g.title}</p>
            <p className="m-0 text-[11px] text-white/45">{g.credit}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
 *  MissionLog — day-by-day flight log, displayed as a timeline
 * ════════════════════════════════════════════════════════════════*/
export interface LogEntry {
  day: string;
  date: string;
  title: string;
  body: string;
  stat?: { value: string; label: string };
}
export function MissionLog({ entries }: { entries: LogEntry[] }) {
  return (
    <ol className="m-0 p-0 list-none flex flex-col">
      {entries.map((e, i) => (
        <li key={i} className="grid grid-cols-[28px_1fr] gap-4">
          <div className="flex flex-col items-center">
            <span className="w-[11px] h-[11px] rounded-full bg-magenta border-2 border-deepspace shrink-0 mt-2" />
            {i < entries.length - 1 && <span className="w-px flex-1 bg-white/12 my-1" />}
          </div>
          <div className={`bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 ${i < entries.length - 1 ? 'mb-5' : ''}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-magenta">{e.day}</span>
              <span className="text-[11px] text-white/45">{e.date}</span>
            </div>
            <p className="m-0 text-[15px] font-bold text-white">{e.title}</p>
            <p className="m-0 text-[13.5px] text-white/65 leading-relaxed mt-1.5">{e.body}</p>
            {e.stat && (
              <div className="inline-flex items-baseline gap-2 mt-3.5 rounded-lg bg-magenta/[0.08] border border-magenta/25 px-3 py-1.5">
                <span className="text-[17px] font-bold text-magenta leading-none">{e.stat.value}</span>
                <span className="text-[11px] text-white/55 uppercase tracking-wide">{e.stat.label}</span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ════════════════════════════════════════════════════════════════
 *  MoonQuiz — single-answer, persisted via callback
 * ════════════════════════════════════════════════════════════════*/
const MOON_OPTS = [6, 12, 24, 50];
const MOON_ANSWER = 12;

export function MoonQuiz({
  initial,
  onAnswer,
}: {
  initial: number | null;
  onAnswer: (v: number) => void;
}) {
  const [picked, setPicked] = useState<number | null>(initial);
  const locked = picked !== null;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MOON_OPTS.map((v) => {
          const isAnswer = v === MOON_ANSWER;
          const isPicked = v === picked;
          let cls = 'border-white/14 bg-white/[0.04] text-white';
          if (locked) {
            if (isAnswer) cls = 'border-emerald-400/60 bg-emerald-400/[0.10] text-emerald-200';
            else if (isPicked) cls = 'border-magenta bg-magenta/[0.10]';
            else cls = 'border-white/14 bg-white/[0.04] text-white opacity-45';
          }
          return (
            <button
              key={v}
              disabled={locked}
              onClick={() => { setPicked(v); onAnswer(v); }}
              className={`rounded-xl border ${cls} ${locked ? '' : 'hover:border-white/35'} text-[18px] font-bold py-3 transition`}
            >
              {v}
            </button>
          );
        })}
      </div>
      {locked && (
        <div className="mt-3 rounded-xl border border-magenta/25 bg-magenta/[0.07] p-4">
          <p className="m-0 text-[13.5px] text-white/80 leading-relaxed">
            <strong className="text-white">12 personnes</strong> ont marché sur la Lune — toutes lors du programme{' '}
            <strong className="text-white">Apollo, entre 1969 et 1972</strong>. Le dernier, Eugene Cernan (Apollo 17), a
            quitté la surface en décembre 1972. Avec Artémis, d'autres marcheront bientôt de nouveau là-haut.
          </p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
 *  MoonEssay — persisted free-text
 * ════════════════════════════════════════════════════════════════*/
export function MoonEssay({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (text: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  const t = useRef<number>();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h4 className="m-0 text-[18px] font-bold text-white">Aimerais-tu aller sur la Lune ? Explique ton choix.</h4>
        <span className={`text-[11px] font-semibold text-emerald-300 transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>
          Enregistré
        </span>
      </div>
      <textarea
        rows={4}
        value={value}
        placeholder="Écris ta réponse ici… (30 caractères)"
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          onSave(v);
          setSaved(true);
          window.clearTimeout(t.current);
          t.current = window.setTimeout(() => setSaved(false), 1400);
        }}
        className="w-full rounded-xl bg-deepspace/60 border border-white/12 focus:border-magenta focus:outline-none text-[14px] text-white placeholder-white/30 p-4 leading-relaxed resize-y"
      />
      <p className="m-0 text-[11px] text-white/40 mt-2">Ta réponse est sauvegardée et tu peux y revenir plus tard.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
 *  PlanetCompareGame — guess the Mars/Earth ratio, fill in a number
 * ════════════════════════════════════════════════════════════════*/
interface CompareQuestion {
  id: string;
  prompt: string;
  unit?: string;
  answer: number;
  tolerance: number;
  explanation: string;
}

const COMPARE_QUESTIONS: CompareQuestion[] = [
  {
    id: 'gravity',
    prompt: 'La gravité à la surface de Mars est environ ___ fois plus faible que sur Terre.',
    unit: '× plus faible',
    answer: 2.6,
    tolerance: 0.7,
    explanation: "Mars est plus petite et moins massive : on y pèserait environ 38 % de son poids terrestre, soit une gravité environ 2,6 fois plus faible. Un objet de 10 kg sur Terre ne pèserait qu'environ 3,8 kg sur Mars.",
  },
  {
    id: 'atmosphere',
    prompt: "L'atmosphère de Mars est environ ___ fois moins dense (en pression au sol) que celle de la Terre.",
    unit: '× moins dense',
    answer: 100,
    tolerance: 45,
    explanation: "La pression au sol sur Mars représente moins de 1 % de la pression terrestre — environ une centaine de fois plus fine. C'est pour cela que le son y porte moins loin et que l'eau liquide s'y évapore presque aussitôt.",
  },
  {
    id: 'diameter',
    prompt: 'Le diamètre de Mars est environ ___ fois plus petit que celui de la Terre.',
    unit: '× plus petit',
    answer: 1.9,
    tolerance: 0.5,
    explanation: "Mars mesure environ 6 779 km de diamètre contre 12 742 km pour la Terre — un peu plus de la moitié, soit presque deux fois plus petite.",
  },
  {
    id: 'year',
    prompt: 'Une année sur Mars (un tour complet autour du Soleil) dure environ ___ fois plus longtemps qu\'une année terrestre.',
    unit: '× plus longue',
    answer: 1.9,
    tolerance: 0.4,
    explanation: "Mars met environ 687 jours terrestres à faire le tour du Soleil — soit près de deux années terrestres pour une seule année martienne.",
  },
  {
    id: 'temperature',
    prompt: 'La température moyenne à la surface de Mars avoisine ___ °C.',
    unit: '°C',
    answer: -63,
    tolerance: 17,
    explanation: "En moyenne, il fait environ -63 °C sur Mars (contre +15 °C sur Terre) : son atmosphère trop fine ne retient presque pas la chaleur, et les nuits peuvent descendre sous les -100 °C.",
  },
];

export function PlanetCompareGame() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const setValue = (id: string, v: string) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    if (checked) setChecked(false);
  };

  const allFilled = COMPARE_QUESTIONS.every((q) => values[q.id]?.trim());
  const score = checked
    ? COMPARE_QUESTIONS.filter((q) => {
        const v = parseFloat(values[q.id]);
        return !Number.isNaN(v) && Math.abs(v - q.answer) <= q.tolerance;
      }).length
    : 0;

  return (
    <div>
      <div className="flex flex-col gap-3">
        {COMPARE_QUESTIONS.map((q) => {
          const raw = values[q.id] ?? '';
          const v = parseFloat(raw);
          const close = checked && !Number.isNaN(v) && Math.abs(v - q.answer) <= q.tolerance;
          const wrong = checked && !close;
          return (
            <div
              key={q.id}
              className={
                'rounded-xl border bg-white/[0.04] p-4 sm:p-5 transition ' +
                (close ? 'border-emerald-400/50' : wrong ? 'border-magenta/60' : 'border-white/12')
              }
            >
              <p className="m-0 text-[14px] text-white/85 leading-relaxed">{q.prompt}</p>
              <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                <input
                  type="number"
                  inputMode="decimal"
                  value={raw}
                  disabled={checked}
                  onChange={(e) => setValue(q.id, e.target.value)}
                  placeholder="?"
                  className="w-24 rounded-lg bg-deepspace/60 border border-white/15 focus:border-magenta focus:outline-none text-[16px] font-bold text-white text-center py-2 disabled:opacity-60"
                />
                {q.unit && <span className="text-[12.5px] text-white/50">{q.unit}</span>}
                {close && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-300">
                    <Check className="w-4 h-4" /> Bonne estimation — réponse : {q.answer}
                  </span>
                )}
                {wrong && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-magenta">
                    <X className="w-4 h-4" /> La vraie valeur est environ {q.answer}
                  </span>
                )}
              </div>
              {checked && (
                <p className="m-0 text-[12.5px] text-white/60 leading-relaxed mt-2.5">{q.explanation}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        {!checked ? (
          <button
            onClick={() => setChecked(true)}
            disabled={!allFilled}
            className="inline-flex items-center gap-1.5 rounded-lg bg-magenta hover:bg-magenta-700 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white text-[12px] font-semibold px-4 py-2.5 transition"
          >
            <Check className="w-3.5 h-3.5" /> Vérifier mes estimations
          </button>
        ) : (
          <>
            <span className="text-[13px] font-semibold text-white">{score} / {COMPARE_QUESTIONS.length} estimations proches de la réalité</span>
            <button
              onClick={() => { setValues({}); setChecked(false); }}
              className="rounded-lg border border-white/15 hover:border-white/35 text-white/70 hover:text-white text-[12px] font-medium px-3 py-2 transition"
            >
              Recommencer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
 *  RoverGame — order the 5 NASA rovers chronologically
 * ════════════════════════════════════════════════════════════════*/
interface Rover {
  id: string; name: string; mission: string; date: string; year: number; img: string; fb: string;
}
const ROVERS: Rover[] = [
  { id: 'sojourner', name: 'Sojourner', mission: 'Mars Pathfinder', date: '4 juillet 1997', year: 1997, img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sojourner%20on%20Mars%20PIA01122.jpg?width=400', fb: 'SOJOURNER · NASA/JPL' },
  { id: 'spirit', name: 'Spirit', mission: 'MER-A', date: 'janvier 2004', year: 2004.0, img: 'https://commons.wikimedia.org/wiki/Special:FilePath/NASA%20Mars%20Rover.jpg?width=400', fb: 'SPIRIT · NASA/JPL' },
  { id: 'opportunity', name: 'Opportunity', mission: 'MER-B', date: 'janvier 2004', year: 2004.1, img: 'https://commons.wikimedia.org/wiki/Special:FilePath/NASA%20Mars%20Rover.jpg?width=400', fb: 'OPPORTUNITY · NASA/JPL' },
  { id: 'curiosity', name: 'Curiosity', mission: 'MSL', date: 'août 2012', year: 2012, img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Curiosity%20rover%20first%20selfie%20at%20Rocknest%20Sol%2085%20(53095922486).jpg?width=400', fb: 'CURIOSITY · NASA/JPL' },
  { id: 'perseverance', name: 'Perseverance', mission: 'Mars 2020', date: '18 février 2021', year: 2021, img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Perseverance%20selfie%20Sol%2046.jpg?width=400', fb: 'PERSEVERANCE · NASA/JPL' },
];
const CORRECT = ROVERS.slice().sort((a, b) => a.year - b.year).map((r) => r.id);

function shuffled(): Rover[] {
  const list = ROVERS.slice();
  do {
    for (let i = list.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [list[i], list[j]] = [list[j], list[i]];
    }
  } while (list.map((r) => r.id).join() === CORRECT.join());
  return list;
}

export function RoverGame({
  solved,
  onSolved,
}: {
  solved: boolean;
  onSolved: () => void;
}) {
  const [list, setList] = useState<Rover[]>(() => (solved ? ROVERS.slice().sort((a, b) => a.year - b.year) : shuffled()));
  const [checked, setChecked] = useState(solved);
  const [ok, setOk] = useState(solved);
  const dragId = useRef<string | null>(null);

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = list.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
  };
  const drop = (to: number) => {
    const from = list.findIndex((x) => x.id === dragId.current);
    if (from < 0 || from === to) return;
    const next = list.slice();
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    setList(next);
  };
  const shuffle = () => { setList(shuffled()); setChecked(false); setOk(false); };
  const check = () => {
    const got = list.map((r) => r.id);
    const good = got.join() === CORRECT.join();
    setChecked(true);
    setOk(good);
    if (good) onSolved();
  };
  const got = list.map((r) => r.id);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <p className="m-0 text-[12.5px] text-white/55">
          Range les rovers <strong className="text-white/80">du plus ancien au plus récent</strong> — glisse les cartes ou utilise les flèches.
        </p>
        <div className="flex gap-2">
          <button onClick={check} className="inline-flex items-center gap-1.5 rounded-lg bg-magenta hover:bg-magenta-700 text-white text-[12px] font-semibold px-3.5 py-2 transition">
            <Check className="w-3.5 h-3.5" /> Valider l'ordre
          </button>
          <button onClick={shuffle} className="rounded-lg border border-white/15 hover:border-white/35 text-white/70 hover:text-white text-[12px] font-medium px-3 py-2 transition">
            Mélanger
          </button>
        </div>
      </div>

      <ol className="grid gap-2 list-none m-0 p-0">
        {list.map((r, i) => {
          const good = checked && got[i] === CORRECT[i];
          const bad = checked && got[i] !== CORRECT[i];
          return (
            <li
              key={r.id}
              draggable
              onDragStart={() => { dragId.current = r.id; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); drop(i); }}
              className={
                'group flex items-center gap-3 rounded-xl border bg-white/[0.04] p-2.5 pr-3 cursor-grab transition ' +
                (good ? 'border-emerald-400/60' : bad ? 'border-magenta' : 'border-white/12')
              }
            >
              <span className={
                'w-7 h-7 shrink-0 rounded-lg grid place-items-center text-[12px] font-bold ' +
                (good ? 'bg-emerald-400/15 border border-emerald-400/40 text-emerald-300' : 'bg-magenta/15 border border-magenta/30 text-magenta')
              }>
                {i + 1}
              </span>
              <Img src={r.img} alt={`Le rover ${r.name} sur Mars`} fallback={r.fb} tone="mars" className="w-14 h-12 rounded-md object-cover border border-white/10 bg-[#2a1510]" />
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[14px] font-bold text-white leading-tight">{r.name}</p>
                <p className="m-0 text-[11px] text-white/45">
                  {r.mission}
                  {checked && <span className="text-white/65"> · {r.date}</span>}
                </p>
              </div>
              <GripVertical className="w-4 h-4 text-white/25 shrink-0" />
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => move(i, -1)} aria-label="Monter" className="w-7 h-6 rounded-md border border-white/12 hover:border-white/35 text-white/60 hover:text-white grid place-items-center">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => move(i, 1)} aria-label="Descendre" className="w-7 h-6 rounded-md border border-white/12 hover:border-white/35 text-white/60 hover:text-white grid place-items-center">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {checked && (
        <div className="mt-3">
          {ok ? (
            <>
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.08] p-4">
                <p className="m-0 text-[14px] font-bold text-emerald-300">Photo de famille au complet.</p>
                <p className="m-0 text-[12.5px] text-white/65 mt-1">
                  Cinq rovers de la NASA, dans l'ordre — de la petite Sojourner (1997, la taille d'un four à micro-ondes) à
                  Perseverance (2021, le poids d'une voiture).
                </p>
              </div>
              <div className="mt-3 rounded-xl overflow-hidden border border-white/10" style={{ background: 'linear-gradient(180deg,#3a1f17,#23120d)' }}>
                <div className="px-4 pt-3 text-[11px] font-mono uppercase tracking-wide text-white/45">
                  Photo de famille · ordre chronologique
                </div>
                <div className="flex items-end gap-3 overflow-x-auto px-4 py-4">
                  {ROVERS.slice().sort((a, b) => a.year - b.year).map((r) => (
                    <figure key={r.id} className="m-0 shrink-0 w-[120px]">
                      <Img src={r.img} alt={r.name} fallback={r.fb} tone="mars" className="w-full h-[84px] object-cover rounded-md border border-white/15 bg-[#2a1510]" />
                      <figcaption className="mt-1.5 text-center">
                        <span className="block text-[12px] font-bold text-white leading-tight">{r.name}</span>
                        <span className="block text-[11px] text-white/50 font-mono">{Math.floor(r.year)}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-magenta/30 bg-magenta/[0.08] p-4">
              <p className="m-0 text-[14px] font-bold text-white">Pas tout à fait.</p>
              <p className="m-0 text-[12.5px] text-white/65 mt-1">Les cartes en vert sont bien placées. Compare les dates affichées et réessaie.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
