import { useEffect, useRef, useContext, useState } from 'react';
import { ChevronLeft, ChevronRight, Telescope, Rocket, Radio, Globe, Trophy, Sun, Plane, Lightbulb, Atom, Star, Sparkles, FlaskConical, Eye, Search, Mountain, Dna, Orbit } from 'lucide-react';
import { PerseveranceViewer } from './PerseveranceViewer';
import { PlanetCompareViewer } from './PlanetCompareViewer';
import { useSession } from '../contexts/SessionContext';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterTimeTracker, ChapterTimeContext } from './ChapterShell';
import { YouTubeEmbed } from './YouTubeEmbed';
import {
  Img,
  JWSTTrajectoryFigure,
  MissionGallery,
  MissionLog,
  MoonQuiz,
  MoonEssay,
  PlanetCompareGame,
  RoverGame,
  type GalleryItem,
  type LogEntry,
} from './ExplorationWidgets';

/* ════════════════════════════════════════════════════════════════
 *  ExplorationSection — "Exploration & missions phares"
 *
 *  Brand-aligned redesign. An intro page, four mission chapters the
 *  student moves through one at a time, then a récap:
 *    0. Introduction → aperçu des quatre missions à venir
 *    1. James Webb   → fiche technique + trajectoire animée + galerie
 *    2. Artémis      → plan de mission + trajectoire + frise + quiz + essai
 *    3. Voyager 1    → fiches + Disque d'or + héritage
 *    4. Mars         → jeu d'ordonnancement des rovers + journal Ingenuity
 *    5. Métiers      → les métiers de l'exploration spatiale + portrait vidéo
 *    6. Récap        → célébration + CTA section suivante
 *
 *  Persistence (via useSession → 'exploration'):
 *    chapter · moon_quiz · moon_essay · rover_solved
 *
 *  Same props as the original section — App.tsx needs no change.
 * ════════════════════════════════════════════════════════════════*/

const TOTAL_CHAPTERS = 7;

const MISSIONS_PREVIEW = [
  { label: 'James Webb', desc: 'Le télescope qui capte la lumière des premières galaxies de l\'Univers.', Icon: Telescope },
  { label: 'Artémis', desc: 'Le programme qui ramène des humains autour de la Lune, puis dessus.', Icon: Rocket },
  { label: 'Voyager 1', desc: 'La sonde la plus lointaine jamais construite, partie en 1977.', Icon: Radio },
  { label: 'Mars', desc: 'Les rovers et l\'hélicoptère Ingenuity, en exploration depuis 25 ans.', Icon: Globe },
] as const;

interface ExplorationSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function ExplorationSection({ onComplete, onHome }: ExplorationSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [chapter, setChapter] = useState(0);
  const [moonQuiz, setMoonQuiz] = useState<number | null>(null);
  const [moonEssay, setMoonEssay] = useState('');
  const [roverSolved, setRoverSolved] = useState(false);
  const [jwstReflection, setJwstReflection] = useState('');
  const [voyagerAnswer, setVoyagerAnswer] = useState<'true' | 'false' | null>(null);
  const [metierAnswer, setMetierAnswer] = useState<'true' | 'false' | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await getResponses('exploration');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.moon_quiz) setMoonQuiz(parseInt(r.moon_quiz, 10));
      if (r.moon_essay) setMoonEssay(r.moon_essay);
      if (r.rover_solved === '1') setRoverSolved(true);
      if (r.jwst_reflection) setJwstReflection(r.jwst_reflection);
      if (r.voyager_answer === 'true' || r.voyager_answer === 'false') setVoyagerAnswer(r.voyager_answer);
      if (r.metier_answer === 'true' || r.metier_answer === 'false') setMetierAnswer(r.metier_answer);
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('exploration', 'chapter', String(i));
  };
  const handleMoonQuiz = async (v: number) => {
    setMoonQuiz(v);
    if (hydrated) await saveResponse('exploration', 'moon_quiz', String(v));
  };
  const handleMoonEssay = async (text: string) => {
    setMoonEssay(text);
    if (hydrated) await saveResponse('exploration', 'moon_essay', text);
  };
  const handleRoverSolved = async () => {
    setRoverSolved(true);
    if (hydrated) await saveResponse('exploration', 'rover_solved', '1');
  };
  const handleJwstReflection = async (text: string) => {
    setJwstReflection(text);
    if (hydrated) await saveResponse('exploration', 'jwst_reflection', text);
  };
  const handleVoyagerAnswer = async (v: 'true' | 'false') => {
    setVoyagerAnswer(v);
    if (hydrated) await saveResponse('exploration', 'voyager_answer', v);
  };
  const handleMetierAnswer = async (v: 'true' | 'false') => {
    setMetierAnswer(v);
    if (hydrated) await saveResponse('exploration', 'metier_answer', v);
  };

  return (
    <ChapterTimeTracker section="exploration" page={chapter}>
    <SectionCanvas>
      <SectionTopBar label={`Session 3 · Chapitre ${chapter + 1} sur ${TOTAL_CHAPTERS} · Exploration`} onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} />

      <main className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-12 pb-24">
        {chapter === 0 && <Intro onNext={() => goTo(1)} />}
        {chapter === 1 && (
          <MissionShell
            num="02" kicker="Télescope spatial · observation"
            title={<>James&nbsp;Webb — voir la<br /><span className="text-magenta">première lumière de l'Univers.</span></>}
            lede="Le plus grand et le plus puissant télescope spatial jamais lancé. Replié comme un origami, déployé à 1,5 million de km, refroidi à l'extrême — pour capter une lumière vieille de 13,5 milliards d'années."
            onPrev={() => goTo(0)} onNext={() => goTo(2)}
            nextEnabled={jwstReflection.trim().length >= 10}
            nextLabel={jwstReflection.trim().length >= 10 ? "Continue · Artémis →" : "Réponds à la question pour continuer"}
          >
            <JamesWebb />
            <div className="mt-10 border-t border-white/10 pt-8">
              <label className="block text-[13px] font-semibold text-white mb-2">
                Parmi les 4 applications de James Webb, laquelle te semble la plus importante, et pourquoi ? 
              </label>
              <textarea
                value={jwstReflection}
                onChange={e => handleJwstReflection(e.target.value)}
                placeholder="Écris ta réponse ici... (30 caractères)"
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 resize-none text-[14px]"
                rows={4}
                maxLength={2000}
              />
            </div>
          </MissionShell>
        )}
        {chapter === 2 && (
          <MissionShell
            num="03" kicker="Vols habités · retour sur la Lune"
            title={<>Artémis — bientôt,<br /><span className="text-magenta">marcher de nouveau sur la Lune.</span></>}
            lede="Depuis Apollo 11 et le premier pas sur la Lune en 1969, le rêve d'y retourner — et peut-être d'y vivre un jour — n'a jamais disparu. Artémis en est la suite : un programme américain qui ramène des astronautes autour de la Lune, puis sur sa surface, vers le pôle Sud."
            onPrev={() => goTo(1)} onNext={() => goTo(3)}
            nextEnabled={moonQuiz !== null && moonEssay.trim().length >= 10}
            nextLabel={
              moonQuiz === null ? 'Réponds au quiz pour continuer'
              : moonEssay.trim().length < 10 ? 'Complète ta réponse pour continuer'
              : 'Continue · Voyager 1 →'
            }
          >
            <Artemis
              moonQuiz={moonQuiz} onMoonQuiz={handleMoonQuiz}
              moonEssay={moonEssay} onMoonEssay={handleMoonEssay}
            />
          </MissionShell>
        )}
        {chapter === 3 && (
          <MissionShell
            num="04" kicker="Sonde interstellaire · 1977 →"
            title={<>Voyager 1 — l'objet<br /><span className="text-magenta">le plus lointain jamais construit.</span></>}
            lede="Lancée en 1977, elle a survolé Jupiter et Saturne, puis quitté le système solaire. Elle emporte un disque d'or : un message de l'humanité, pour qui le trouvera."
            onPrev={() => goTo(2)} onNext={() => goTo(4)}
            nextEnabled={voyagerAnswer !== null}
            nextLabel={voyagerAnswer !== null ? "Continue · Mars →" : "Réponds à la question pour continuer"}
          >
            <Voyager />
            <div className="mt-10 border-t border-white/10 pt-8">
              <div className="rounded-2xl border border-magenta/25 bg-magenta/[0.06] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-magenta mb-3">Vrai ou Faux ?</p>
                <p className="text-[17px] font-bold text-white mb-5">
                  Le disque d'or embarqué sur Voyager 1 a été conçu sous la direction de Carl Sagan.
                </p>
                <div className="flex gap-3">
                  {(['true', 'false'] as const).map(val => {
                    const selected = voyagerAnswer === val;
                    const isCorrect = val === 'true';
                    const showFeedback = voyagerAnswer !== null;
                    return (
                      <button
                        key={val}
                        onClick={() => handleVoyagerAnswer(val)}
                        disabled={voyagerAnswer !== null}
                        className={`flex-1 rounded-lg px-5 py-3 text-[14px] font-semibold transition border ${
                          selected
                            ? isCorrect
                              ? 'bg-green-900/40 border-green-500 text-green-300'
                              : 'bg-red-900/40 border-red-500 text-red-300'
                            : showFeedback && isCorrect
                              ? 'bg-green-900/20 border-green-500/50 text-green-400'
                              : 'border-white/15 text-white/70 hover:border-magenta/50 hover:text-white disabled:opacity-50'
                        }`}
                      >
                        {val === 'true' ? 'Vrai' : 'Faux'}
                      </button>
                    );
                  })}
                </div>
                {voyagerAnswer !== null && (
                  <p className={`mt-4 text-[13px] leading-relaxed ${voyagerAnswer === 'true' ? 'text-green-300' : 'text-red-300'}`}>
                    {voyagerAnswer === 'true'
                      ? 'Exact. Carl Sagan a présidé le comité qui a conçu le disque d\'or — il a sélectionné les sons, les images et les musiques pour représenter l\'humanité.'
                      : 'Pas tout à fait. C\'est bien Carl Sagan qui a dirigé la conception du disque d\'or, avec un comité qu\'il présidait.'}
                  </p>
                )}
              </div>
            </div>
          </MissionShell>
        )}
        {chapter === 4 && (
          <MissionShell
            num="05" kicker="Rovers & hélicoptère · planète Mars"
            title={<>Mars — vingt-cinq ans<br /><span className="text-magenta">de rovers sur une autre planète.</span></>}
            lede="Explore la planète rouge, son rover et son hélicoptère, puis termine en remettant les rovers dans l'ordre chronologique."
            onPrev={() => goTo(3)} onNext={() => goTo(5)} nextEnabled={roverSolved}
            nextLabel={roverSolved ? 'Continue · Les métiers →' : 'Termine la photo de famille'}
          >
            <Mars solved={roverSolved} onSolved={handleRoverSolved} />
          </MissionShell>
        )}
        {chapter === 5 && (
          <MissionShell
            num="06" kicker="Carrières · exploration spatiale"
            title={<>Quels métiers<br /><span className="text-magenta">derrière ces missions ?</span></>}
            lede="Avant qu'une sonde ne décolle ou qu'un télescope ne s'ouvre, des centaines de spécialistes ont conçu, testé et analysé pendant des années. Voici quelques métiers qui font avancer l'exploration spatiale."
            onPrev={() => goTo(4)} onNext={() => goTo(6)}
            nextEnabled={metierAnswer !== null}
            nextLabel={metierAnswer !== null ? "Voir le récap →" : "Réponds à la question pour continuer"}
          >
            <Metiers answer={metierAnswer} onAnswer={handleMetierAnswer} />
          </MissionShell>
        )}
        {chapter === 6 && (
          <Recap moonQuiz={moonQuiz} roverSolved={roverSolved} onContinue={onComplete} onPrev={() => goTo(5)} />
        )}
      </main>
    </SectionCanvas>
    </ChapterTimeTracker>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 0 — Introduction
 * ────────────────────────────────────────────────────────*/
function Intro({ onNext }: { onNext: () => void }) {
  return (
    <section className="animate-[chapterIn_480ms_cubic-bezier(.2,0,0,1)]">
      <div className="flex flex-col gap-2 mb-9">
        <div className="inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.16em] uppercase text-magenta">
          <span className="bg-magenta text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold">01</span>
          Introduction · exploration spatiale
        </div>
        <h1 className="font-display font-bold uppercase tracking-[0.02em] text-[clamp(30px,4vw,50px)] leading-[1.06] m-0">
          À 1,5 million de kilomètres d'ici,<br />
          <span className="text-magenta">un télescope voit des étoiles nées il y a 13,5 milliards d'années.</span>
        </h1>
        <p className="text-[16px] text-white/70 max-w-[720px] leading-[1.55] m-0 mt-1">
          James Webb, Artémis, Voyager 1, Mars. Quatre missions qui repoussent les frontières de l'exploration spatiale — découvre-les une par une dans les pages qui suivent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
        {MISSIONS_PREVIEW.map((m) => (
          <div key={m.label} className="p-5 rounded-2xl border border-white/10 bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex-shrink-0 text-magenta/70"><m.Icon className="w-6 h-6" /></span>
              <h4 className="font-semibold text-white text-[15px] flex-1 text-left m-0">{m.label}</h4>
            </div>
            <p className="m-0 text-[12px] text-white/55 leading-snug">{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
        <div />
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-3.5 text-[14px] font-semibold bg-magenta text-white hover:bg-magenta-700 transition"
        >
          Commencer · James Webb <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  MissionShell — chrome around each mission chapter
 * ────────────────────────────────────────────────────────*/
function MissionShell(props: {
  num: string;
  kicker: string;
  title: React.ReactNode;
  lede: string;
  onPrev: (() => void) | null;
  onNext: () => void;
  nextEnabled?: boolean;
  nextLabel: string;
  children: React.ReactNode;
}) {
  const { logChapterTime } = useSession();
  const ctx = useContext(ChapterTimeContext);
  const mountedAt = useRef(Date.now());
  const enabled = props.nextEnabled ?? true;

  const handleNext = () => {
    if (ctx) logChapterTime(ctx.section, ctx.page, Math.round((Date.now() - mountedAt.current) / 1000));
    props.onNext();
  };

  return (
    <section className="animate-[chapterIn_480ms_cubic-bezier(.2,0,0,1)]">
      <div className="flex flex-col gap-2 mb-7">
        <div className="inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.16em] uppercase text-magenta">
          <span className="bg-magenta text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold">{props.num}</span>
          {props.kicker}
        </div>
        <h1 className="font-display font-bold uppercase tracking-[0.02em] text-[clamp(30px,4vw,50px)] leading-[1.06] m-0">
          {props.title}
        </h1>
        <p className="text-[16px] text-white/70 max-w-[720px] leading-[1.55] m-0 mt-1">{props.lede}</p>
      </div>

      {props.children}

      <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
        {props.onPrev ? (
          <button onClick={props.onPrev} className="inline-flex items-center gap-2 rounded-lg px-5 py-3.5 text-[14px] font-semibold border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition">
            <ChevronLeft className="w-4 h-4" /> Précédent
          </button>
        ) : <div />}
        <button
          onClick={handleNext}
          disabled={!enabled}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-3.5 text-[14px] font-semibold bg-magenta text-white hover:bg-magenta-700 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition"
        >
          {props.nextLabel} {enabled && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Shared presentational helpers
 * ────────────────────────────────────────────────────────*/
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[12px] font-bold tracking-[0.18em] uppercase text-white/45">{children}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function Hero({ src, alt, fallback, credit, tone }: { src: string; alt: string; fallback: string; credit: string; tone?: string }) {
  return (
    <figure className="m-0 mb-3">
      <div className="rounded-2xl overflow-hidden border border-white/12 bg-black aspect-[16/9]">
        <Img src={src} alt={alt} fallback={fallback} tone={tone} className="w-full h-full object-cover" />
      </div>
      <figcaption className="mt-2 flex items-center gap-2 text-[11px] text-white/45">
        <span className="font-mono uppercase tracking-wide text-magenta-300">Crédit</span>
        {credit}
      </figcaption>
    </figure>
  );
}

function FlagStrip({ flags }: { flags: { code: string; label: string; title: string }[] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-10">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mr-1">Participants</span>
      {flags.map((f) => (
        <span key={f.label} title={f.title} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/10 pl-1 pr-2.5 py-1">
          <img src={`https://flagcdn.com/${f.code}.svg`} alt={f.title} className="w-5 h-3.5 rounded-[2px] object-cover" />
          <span className="text-[12px] text-white/80">{f.label}</span>
        </span>
      ))}
    </div>
  );
}

function StatCard({ big, title, body }: { big: string; title: string; body: React.ReactNode }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
      <div className="text-[34px] font-bold text-magenta leading-none">{big}</div>
      <p className="m-0 text-[14px] font-bold text-white mt-3">{title}</p>
      <p className="m-0 text-[13px] text-white/60 leading-relaxed mt-1.5">{body}</p>
    </div>
  );
}

function InfoCard({ label, title, children }: { label: string; title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
      <p className="m-0 text-[11px] font-mono uppercase tracking-wide text-magenta-300">{label}</p>
      {title && <h4 className="m-0 text-[17px] font-bold text-white mt-1">{title}</h4>}
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 1 — James Webb
 * ────────────────────────────────────────────────────────*/
const JWST_GALLERY: GalleryItem[] = [
  { img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Webb%27s%20First%20Deep%20Field.jpg?width=700', alt: 'Premier champ profond de Webb (amas SMACS 0723)', fallback: 'CHAMP PROFOND · SMACS 0723', title: 'Premier champ profond', credit: 'Amas SMACS 0723 · NASA, ESA, CSA, STScI' },
  { img: "https://commons.wikimedia.org/wiki/Special:FilePath/Pillars%20of%20Creation%20(NIRCam%20Image).jpg?width=700", alt: "Les Piliers de la création dans la nébuleuse de l'Aigle", fallback: 'PILIERS DE LA CRÉATION', title: 'Piliers de la création', credit: "Nébuleuse de l'Aigle · NASA, ESA, CSA, STScI" },
  { img: "https://commons.wikimedia.org/wiki/Special:FilePath/Stephan's%20Quintet%20taken%20by%20James%20Webb%20Space%20Telescope.jpg?width=700", alt: 'Le Quintette de Stephan, groupe de cinq galaxies', fallback: 'QUINTETTE DE STEPHAN', title: 'Quintette de Stephan', credit: 'Cinq galaxies · NASA, ESA, CSA, STScI' },
  { img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Southern%20Ring%20Nebula%20by%20Webb%20Telescope%20(2022).jpg?width=700', alt: "La nébuleuse de l'Anneau austral", fallback: 'ANNEAU AUSTRAL', title: "Nébuleuse de l'Anneau austral", credit: 'NASA, ESA, CSA, STScI' },
  { img: 'https://commons.wikimedia.org/wiki/Special:FilePath/New%20Webb%20Image%20Captures%20Clearest%20View%20of%20Neptune%E2%80%99s%20Rings%20in%20Decades%20(cropped).png?width=700', alt: 'Neptune et ses anneaux par le télescope James Webb', fallback: 'NEPTUNE & SES ANNEAUX', title: 'Neptune et ses anneaux', credit: 'NASA, ESA, CSA, STScI' },
  { img: "https://commons.wikimedia.org/wiki/Special:FilePath/%E2%80%9CCosmic%20Cliffs%E2%80%9D%20in%20the%20Carina%20Nebula%20(NIRCam%20and%20MIRI%20Composite%20Image)%20(weic2205b).jpg?width=700", alt: 'Les Falaises cosmiques de la nébuleuse de la Carène', fallback: 'FALAISES COSMIQUES', title: 'Falaises cosmiques', credit: 'Nébuleuse de la Carène · NASA, ESA, CSA, STScI' },
];

const JWST_APPS = [
  { title: "L'univers primordial", desc: 'Observer les premières galaxies, peu après le Big Bang.' },
  { title: 'La naissance des étoiles', desc: 'Voir au travers des nuages de poussière où naissent les étoiles.' },
  { title: "Atmosphères d'exoplanètes", desc: "Analyser par spectroscopie l'air des planètes d'autres étoiles." },
  { title: 'Notre système solaire', desc: 'Des images inédites de Neptune, Jupiter et leurs anneaux.' },
];

function JamesWebb() {
  return (
    <>
      <Hero
        src="https://commons.wikimedia.org/wiki/Special:FilePath/%E2%80%9CCosmic%20Cliffs%E2%80%9D%20in%20the%20Carina%20Nebula%20(NIRCam%20and%20MIRI%20Composite%20Image)%20(weic2205b).jpg?width=1400"
        alt="Les Falaises cosmiques de la nébuleuse de la Carène, photographiées par le télescope James Webb"
        fallback="FALAISES COSMIQUES · NASA/ESA/CSA/STScI"
        credit="NASA, ESA, CSA, STScI — Falaises cosmiques (nébuleuse de la Carène). Domaine public."
      />
      <FlagStrip flags={[
        { code: 'us', label: 'NASA', title: 'États-Unis — NASA' },
        { code: 'eu', label: 'ESA', title: 'Europe — ESA' },
        { code: 'ca', label: 'CSA', title: 'Canada — CSA' },
      ]} />

      <SectionLabel>Fiche technique</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        <StatCard big="6,5 m" title="Un miroir en or, plié en orbite" body={<>18 segments hexagonaux plaqués or, dépliés puis alignés dans l'espace à une précision de l'ordre du <strong className="text-white/80">nanomètre</strong>.</>} />
        <StatCard big="13,5 Mds" title="d'années de voyage pour sa lumière" body={<>Télescope <strong className="text-white/80">infrarouge</strong> : il capte une lumière très ancienne et très décalée vers le rouge — les toutes premières galaxies.</>} />
        <StatCard big="5 couches" title="Un bouclier grand comme un court de tennis" body="Le pare-soleil maintient les instruments dans le noir et le froid extrême nécessaires à l'observation infrarouge." />
        <StatCard big="N° 1" title="Le plus grand jamais lancé" body="Le télescope spatial le plus grand et le plus puissant jamais mis en orbite — successeur de Hubble." />
      </div>

      <SectionLabel>La mission, étape par étape</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-4">Du décollage au point L2, puis le déploiement le plus complexe jamais tenté. Lance l'animation ou clique chaque étape.</p>
      <div className="mb-12"><JWSTTrajectoryFigure /></div>

      <SectionLabel>Le défi du repliage et du déploiement</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-4">Pour tenir dans la coiffe d'Ariane 5, Webb a voyagé plié comme un origami : miroir replié, pare-soleil compressé en accordéon. Une fois en route vers le point L2, environ 344 mécanismes à risque (aucune réparation possible si l'un d'eux bloque) ont dû s'ouvrir un par un, dans le bon ordre et au bon moment.</p>
      <div className="mb-12">
        <figure className="m-0 max-w-[640px] mx-auto">
          <div className="rounded-2xl overflow-hidden border border-white/12 bg-black aspect-video">
            <video
              src="https://svs.gsfc.nasa.gov/vis/a020000/a020300/a020339/WEBB_Deployment_v2_30fps_4k_h264.mp4"
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </div>
          <figcaption className="mt-2 flex items-start gap-2 text-[11px] text-white/45">
            <span className="font-mono uppercase tracking-wide text-magenta-300 shrink-0">Crédit</span>
            <span>La séquence complète, du télescope replié à sa silhouette finale en orbite (« Webb wide view deployment »). Image : NASA / Adriana Manrique Gutierrez, Jacquelyn DeMink (USRA), 2021 · NASA Scientific Visualization Studio (Goddard Space Flight Center), animations de déploiement de Webb</span>
          </figcaption>
        </figure>
      </div>

      <SectionLabel>Pourquoi il change tout</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-4">Conçu pour voir plus loin que Hubble, James Webb observe l'univers en infrarouge : il traverse les nuages de poussière, repère les galaxies les plus lointaines et analyse l'atmosphère de planètes situées autour d'autres étoiles. Chaque observation rapproche l'humanité de quelques grandes questions :</p>
      <ul className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-6 list-disc pl-5 space-y-1">
        <li>Comment se sont formées les toutes premières galaxies ?</li>
        <li>Existe-t-il des planètes semblables à la Terre ailleurs dans l'univers ?</li>
        <li>De quoi sont faits les objets les plus lointains du cosmos ?</li>
      </ul>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
        {JWST_APPS.map((a) => (
          <div key={a.title} className="bg-magenta/[0.06] border border-magenta/20 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-lg bg-magenta/15 border border-magenta/30 grid place-items-center mb-3">
              <Telescope className="w-4 h-4 text-magenta" />
            </div>
            <p className="m-0 text-[14px] font-bold text-white">{a.title}</p>
            <p className="m-0 text-[12.5px] text-white/60 leading-snug mt-1">{a.desc}</p>
          </div>
        ))}
      </div>

      <SectionLabel>Galerie</SectionLabel>
      <MissionGallery items={JWST_GALLERY} />
      <p className="text-[11px] text-white/40 mt-3">Traitement d'image : J. DePasquale, A. Koekemoer, A. Pagan (STScI). Images NASA/ESA/CSA — domaine public, à auto-héberger en production.</p>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 2 — Artémis
 * ────────────────────────────────────────────────────────*/
const ARTEMIS_GALLERY: GalleryItem[] = [
  { img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Launch%20of%20Artemis%201%20(NHQ202211160002).jpg?width=700', alt: 'Décollage de la fusée SLS avec le vaisseau Orion, mission Artemis I', fallback: 'DÉCOLLAGE · ARTEMIS I', title: 'Décollage de la fusée SLS', credit: 'Cap Canaveral, nov. 2022 · NASA' },
  { img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Artemis%20II%20Group%20Shot%20(art002e013361).jpg?width=700', alt: "L'équipage d'Artemis II réuni à bord du vaisseau Orion", fallback: 'ÉQUIPAGE · ARTEMIS II', title: "L'équipage d'Artemis II", credit: 'Reid Wiseman, Victor Glover, Christina Koch, Jeremy Hansen · NASA' },
  { img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lunar%20Flyby%20Observations%20%E2%80%93%20NASA%20astronaut%20Victor%20Glover%20(art002e016198).jpg?width=700', alt: "L'astronaute Victor Glover observe la Lune depuis le hublot d'Orion", fallback: 'OBSERVATION DE LA LUNE · ARTEMIS II', title: 'Observation lors du survol lunaire', credit: 'Victor Glover (NASA) au hublot d’Orion · NASA' },
  { img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Life%20in%20Orion%20during%20the%20Artemis%20II%20Mission%20(art002e025756).jpg?width=700', alt: "Vie quotidienne de l'équipage à bord du vaisseau Orion", fallback: 'À BORD D’ORION · ARTEMIS II', title: "La vie à bord d'Orion", credit: 'Quotidien des astronautes en vol · NASA' },
  { img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flight%20Day%2022-%20Orion%20and%20Crescent%20Earth%20(art001e002190).jpeg?width=700', alt: 'La Terre en croissant photographiée par le vaisseau Orion', fallback: 'LA TERRE VUE PAR ORION', title: 'La Terre, un croissant dans le noir', credit: "Artemis I · caméra d'Orion · NASA" },
  { img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flight%20Day%2020-%20Lunar%20Close-up%20(art001e002581).jpeg?width=700', alt: 'Gros plan sur la surface de la Lune photographiée par le vaisseau Orion', fallback: 'LA LUNE VUE PAR ORION', title: 'La Lune de tout près', credit: "Artemis I · caméra d'Orion · NASA" },
];

const ARTEMIS_LOG: LogEntry[] = [
  {
    day: 'Jour de vol 1', date: '1ᵉʳ avril 2026',
    title: 'Décollage et mise en orbite',
    body: "Décollage de nuit depuis le centre spatial Kennedy. La fusée SLS place Orion sur une première orbite elliptique, puis un allumage de l'étage ICPS l'élève au-delà de 74 000 km d'altitude. L'équipage prend ensuite les commandes pendant environ 70 minutes pour un test de pilotage manuel à proximité de l'étage, avant le déploiement de quatre nano-satellites.",
    stat: { value: '185 → 74 000 km', label: 'altitude de la deuxième orbite' },
  },
  {
    day: 'Jour de vol 2', date: '2 avril 2026',
    title: 'Cap sur la Lune',
    body: "Un allumage de moteur de six minutes, l'injection translunaire, arrache Orion à l'orbite terrestre et le place sur sa trajectoire vers la Lune.",
    stat: { value: '6 min 05', label: "durée de l'allumage translunaire" },
  },
  {
    day: 'Jours de vol 3 à 5', date: '3 – 5 avril 2026',
    title: 'Quatre jours de croisière',
    body: "Direction la Lune. L'équipage teste les liaisons vidéo avec la Terre et vérifie les systèmes de survie, de communication et de navigation. Au cinquième jour, Orion entre dans la sphère d'influence lunaire : la gravité de la Lune devient la force dominante sur sa trajectoire.",
  },
  {
    day: 'Jour de vol 6', date: '6 avril 2026',
    title: 'Le survol de la Lune',
    body: "Orion passe à 6 544 km de la surface lunaire : le premier survol habité depuis Apollo 17, en 1972. Sept heures d'observation des reliefs lunaires, une éclipse solaire vue depuis l'habitacle, puis 40 minutes de silence radio lorsque la Lune coupe le contact avec la Terre. À son point le plus éloigné, Orion dépasse de 6 600 km le record de distance d'Apollo 13.",
    stat: { value: '406 773 km', label: 'distance maximale à la Terre · record battu' },
  },
  {
    day: 'Jours de vol 7 à 9', date: '7 – 9 avril 2026',
    title: 'Le chemin du retour',
    body: "Orion quitte la sphère d'influence lunaire et entame un trajet retour de quatre jours, porté par une trajectoire dite « de retour libre » : même en cas de problème, la seule gravité de la Lune suffirait à ramener le vaisseau vers la Terre.",
  },
  {
    day: 'Jour de vol 10', date: '10 avril 2026',
    title: 'Rentrée et amerrissage',
    body: "Rentrée dans l'atmosphère à 35 fois la vitesse du son, puis amerrissage dans l'océan Pacifique, au large de San Diego. Au total : 9 jours, 1 heure et 32 minutes de vol, et plus de 1,2 million de kilomètres parcourus.",
    stat: { value: '1,2 million km', label: 'parcourus en un peu plus de neuf jours' },
  },
];

function Artemis({ moonQuiz, onMoonQuiz, moonEssay, onMoonEssay }: {
  moonQuiz: number | null; onMoonQuiz: (v: number) => void;
  moonEssay: string; onMoonEssay: (t: string) => void;
}) {
  return (
    <>
      <Hero
        src="https://commons.wikimedia.org/wiki/Special:FilePath/Orion%2C%20the%20Moon%2C%20Earth%20(art002e016277).jpg?width=1400"
        alt="Le vaisseau Orion et son module de service européen au-dessus de la Lune, mission Artemis I"
        fallback="ORION + ESM AU-DESSUS DE LA LUNE · NASA"
        credit="NASA — Orion et le Module de service européen (ESA), mission Artemis I. Domaine public."
      />
      <FlagStrip flags={[
        { code: 'us', label: 'NASA', title: 'États-Unis — NASA' },
        { code: 'eu', label: 'ESA', title: 'Europe — ESA (Module de service)' },
        { code: 'ca', label: 'CSA', title: 'Canada — CSA' },
      ]} />

      <SectionLabel>Le plan de mission</SectionLabel>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <InfoCard label="Le vaisseau Orion" title="Deux moitiés, deux continents">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2"><strong className="text-white/85">Module d'équipage</strong> américain (NASA) où vivent les astronautes, couplé au <strong className="text-white/85">Module de service européen (ESM)</strong>, fourni par l'ESA et construit par Airbus à Brême.</p>
        </InfoCard>
        <InfoCard label="Ce que l'Europe apporte" title="L'ESM fait vivre Orion">
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 list-none p-0">
            {['Propulsion', 'Énergie (panneaux solaires)', 'Air & eau', 'Contrôle thermique'].map((x) => (
              <li key={x} className="flex items-start gap-2 text-[13px] text-white/80"><span className="text-magenta mt-px">·</span>{x}</li>
            ))}
          </ul>
          <p className="m-0 text-[12.5px] text-white/55 leading-relaxed mt-3">Objectif du programme : ramener des humains sur la Lune, vers la région du <strong className="text-white/80">pôle Sud</strong>.</p>
        </InfoCard>
      </div>

      <SectionLabel>La trajectoire</SectionLabel>
      <figure className="m-0 mb-12">
        <div className="rounded-2xl overflow-hidden border border-white/12 bg-black aspect-video">
          <video
            src="https://svs.gsfc.nasa.gov/vis/a000000/a005600/a005632/a2_mission_trajectory_1080p60.mp4"
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        </div>
        <figcaption className="mt-2 flex items-center gap-2 text-[11px] text-white/45">
          <span className="font-mono uppercase tracking-wide text-magenta-300">Crédit</span>
          Image : NASA / Kel Elkins (Science and Technology Corporation), Ernie Wright (USRA), 2026 · NASA Scientific Visualization Studio, mission Artemis II
        </figcaption>
      </figure>

      <SectionLabel>La frise des vols</SectionLabel>
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2"><span className="text-[12px] font-bold text-magenta">Artemis I</span><span className="text-[11px] text-white/45">nov.–déc. 2022</span></div>
          <p className="m-0 text-[13px] text-white/70 leading-relaxed">Vol d'essai <strong className="text-white/85">sans équipage</strong> autour de la Lune — premier test de la fusée SLS et d'Orion.</p>
        </div>
        <div className="bg-magenta/[0.08] border border-magenta/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2"><span className="text-[12px] font-bold text-magenta">Artemis II</span><span className="text-[11px] text-white/55">lancée — avril 2026</span></div>
          <p className="m-0 text-[13px] text-white/75 leading-relaxed">Premier vol <strong className="text-white">habité</strong> : 4 astronautes autour de la Lune — Reid Wiseman, Victor Glover, Christina Koch (NASA) et Jeremy Hansen (CSA, Canada).</p>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2"><span className="text-[12px] font-bold text-magenta">Artemis III</span><span className="text-[11px] text-white/45">visée ~2027</span></div>
          <p className="m-0 text-[13px] text-white/70 leading-relaxed">Premier <strong className="text-white/85">alunissage habité</strong> depuis Apollo : pôle Sud, atterrisseur Starship. Deux astronautes descendent, deux restent en orbite.</p>
        </div>
      </div>

      <SectionLabel>Journal de bord · Artemis II, jour après jour</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-6">Du décollage à l'amerrissage, dix jours de vol autour de la Lune. Voici, jour après jour, ce qu'a vécu l'équipage d'Orion.</p>
      <div className="mb-12"><MissionLog entries={ARTEMIS_LOG} /></div>

      <SectionLabel>Galerie de la mission</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-4">Du décollage à l'équipage, en passant par ce qu'Orion a vu par son hublot : un aperçu en images d'Artemis I et II.</p>
      <MissionGallery items={ARTEMIS_GALLERY} />
      <p className="text-[11px] text-white/40 mt-3 mb-12">Images : NASA — domaine public.</p>

      <div className="rounded-2xl border border-magenta/25 bg-gradient-to-br from-magenta/[0.10] to-transparent p-6 sm:p-7 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-magenta/15 border border-magenta/30 rounded-full text-magenta text-[12px] font-semibold mb-3">
          <span className="w-3.5 h-3.5 rounded-sm bg-magenta inline-block" /> Quiz
        </div>
        <h4 className="m-0 text-[20px] font-bold text-white mb-1">Combien de personnes ont marché sur la Lune ?</h4>
        <p className="m-0 text-[13px] text-white/60 leading-relaxed mb-5">Choisis ta réponse — elle est conservée même si tu reviens plus tard.</p>
        <MoonQuiz initial={moonQuiz} onAnswer={onMoonQuiz} />
      </div>

      <div className="border border-magenta rounded-lg p-4 border-[1.5px] mb-12">
        <p className="m-0 text-[13px] text-white/70 leading-relaxed mb-4">
          <strong className="text-white">Le saviez-vous ?</strong> Avant d'aller explorer la Lune ou Mars, il faut comprendre ce que l'espace fait au corps humain. C'est le métier de chercheur·euse en physiologie spatiale : étudier les astronautes pour mieux comprendre des phénomènes comme le vieillissement ou l'isolement, et préparer des missions d'exploration en bonne santé.
        </p>
        <figure className="m-0 max-w-[640px]">
          <div className="relative rounded-2xl overflow-hidden border border-white/12 bg-black aspect-video">
            <YouTubeEmbed videoId="sq3eyKhe_dE" title="Jérémie Rabinot — présentation" nocookie />
          </div>
          <figcaption className="mt-2 flex items-start gap-2 text-[11px] text-white/45">
            <span className="font-mono uppercase tracking-wide text-magenta-300 shrink-0">Crédit</span>
            <span>Jérémie Rabinot, chercheur en physiologie spatiale : pourquoi étudier le corps humain en conditions extrêmes, et comment plusieurs disciplines (mathématiques, informatique, médecine) se croisent dans ce métier.</span>
          </figcaption>
        </figure>
      </div>

      <MoonEssay initial={moonEssay} onSave={onMoonEssay} />

      <div className="text-[11px] text-white/40 mt-4">Crédits images : NASA / NASA-JPL (domaine public) ; visuels ESA en CC BY-SA 3.0 IGO si utilisés.</div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 3 — Voyager 1
 * ────────────────────────────────────────────────────────*/
const DISTANCE_STEPS = [
  { label: 'Lune', factor: '× 1', distance: '384 400 km', detail: 'distance de référence' },
  { label: 'Soleil', factor: '× 390', distance: '150 millions de km', detail: '1 UA' },
  { label: 'Mars', factor: '× 585', distance: '225 millions de km', detail: '1,5 UA' },
  { label: 'Jupiter', factor: '× 1 950', distance: '750 millions de km', detail: '5 UA' },
  { label: 'Pluton', factor: '× 15 600', distance: '6 milliards de km', detail: '40 UA' },
  { label: 'Voyager 2', factor: '× 55 400', distance: '21,3 milliards de km', detail: '142 UA' },
  { label: 'Voyager 1', factor: '× 66 100', distance: '25,4 milliards de km', detail: '170 UA' },
];

function DistanceScale() {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setVisibleCount((c) => {
        if (c >= DISTANCE_STEPS.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-5 space-y-2">
      {DISTANCE_STEPS.map((s, i) => {
        const shown = i < visibleCount;
        return (
          <div
            key={s.label}
            className={`flex items-center gap-4 rounded-lg border px-4 py-2.5 transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${shown ? 'opacity-100 translate-x-0 border-magenta/30 bg-magenta/[0.06]' : 'opacity-0 -translate-x-2 border-white/5'}`}
          >
            <span className="text-[15px] font-bold text-magenta w-[92px] shrink-0">{s.factor}</span>
            <span className="text-[13px] text-white/80 flex-1">Terre ↔ {s.label}</span>
            <span className="text-[11.5px] text-white/45 whitespace-nowrap">{s.distance} · {s.detail}</span>
          </div>
        );
      })}
      <p className="m-0 text-[11px] text-white/40 mt-1">Chaque ligne montre combien de fois la distance Terre-Lune (384 400 km) tient dans la distance affichée.</p>
    </div>
  );
}

const VOYAGER_PROBES = [
  {
    name: 'Voyager 1',
    launch: 'lancée 09/1977',
    distanceKm: '25,4 milliards de km',
    distanceUA: '170 UA · espace interstellaire',
    delay: '~23 h 30 min',
    delayDesc: "pour qu'un signal arrive de la Terre",
    speed: '60 000 km/h',
    speedDesc: 'soit 17 km par seconde',
    note: "Record absolu · objet le plus loin jamais envoyé par l'Humanité",
  },
  {
    name: 'Voyager 2',
    launch: 'lancée 08/1977',
    distanceKm: '21,3 milliards de km',
    distanceUA: '142 UA · espace interstellaire',
    delay: '~19 h 30 min',
    delayDesc: "pour qu'un signal arrive de la Terre",
    speed: '55 000 km/h',
    speedDesc: 'soit 15 km par seconde',
    note: 'Seule sonde à avoir survolé Uranus et Neptune',
  },
];

const VOYAGER_COMPARISONS = [
  { Icon: Globe, line1: '× 2 000 fois la distance Terre–Lune', line2: 'pour atteindre Voyager 1', value: '× 2 000' },
  { Icon: Sun, line1: '170 fois la distance Terre–Soleil', line2: 'Voyager 1 est à 170 UA', value: '170 UA' },
  { Icon: Plane, line1: 'En avion de ligne à 900 km/h', line2: 'il faudrait 3,2 millions d\'années', value: '3,2 M ans' },
  { Icon: Lightbulb, line1: 'La lumière (300 000 km/s)', line2: 'met 23 h 30 min pour arriver', value: '23,5 h' },
];

function Voyager() {
  return (
    <>
      <Hero
        src="https://commons.wikimedia.org/wiki/Special:FilePath/Voyager%20spacecraft.jpg?width=1400"
        alt="Vue d'artiste de la sonde Voyager dans l'espace interstellaire"
        fallback="VOYAGER · VUE D'ARTISTE · NASA/JPL-CALTECH"
        credit="NASA/JPL-Caltech — Vue d'artiste de Voyager. Domaine public."
      />
      <FlagStrip flags={[{ code: 'us', label: 'NASA / JPL', title: 'États-Unis — NASA / JPL' }]} />

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7 mb-4">
        <p className="m-0 text-[11px] font-mono uppercase tracking-wide text-magenta-300">Échelle des distances</p>
        <h4 className="m-0 text-[16px] font-bold text-white mt-1">Combien de fois la distance Terre-Lune faut-il pour atteindre chaque destination ?</h4>
        <p className="m-0 text-[12.5px] text-white/55 leading-relaxed mt-1.5 max-w-[640px]">En partant de la distance Terre-Lune comme unité de mesure, la même distance s'empile encore et encore pour atteindre le Soleil, puis Mars, Jupiter, Pluton — et enfin les deux sondes Voyager.</p>
        <DistanceScale />
        <p className="m-0 text-[12px] text-white/45 mt-4">1 UA (Unité Astronomique) = distance Terre-Soleil = 150 millions de km</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {VOYAGER_PROBES.map((p) => (
          <div key={p.name} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-[15px] font-bold text-white flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-magenta inline-block" />{p.name.toUpperCase()}</p>
              <p className="m-0 text-[11px] text-white/45">{p.launch}</p>
            </div>
            <div className="border-t border-white/10 my-3" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="m-0 text-[10px] uppercase tracking-[0.08em] text-white/45">Distance</p>
                <p className="m-0 text-[15px] font-bold text-magenta mt-1 leading-tight">{p.distanceKm}</p>
                <p className="m-0 text-[11px] text-white/55 mt-0.5">{p.distanceUA}</p>
              </div>
              <div>
                <p className="m-0 text-[10px] uppercase tracking-[0.08em] text-white/45">Délai signal</p>
                <p className="m-0 text-[15px] font-bold text-magenta mt-1 leading-tight">{p.delay}</p>
                <p className="m-0 text-[11px] text-white/55 mt-0.5">{p.delayDesc}</p>
              </div>
              <div>
                <p className="m-0 text-[10px] uppercase tracking-[0.08em] text-white/45">Vitesse</p>
                <p className="m-0 text-[15px] font-bold text-magenta mt-1 leading-tight">{p.speed}</p>
                <p className="m-0 text-[11px] text-white/55 mt-0.5">{p.speedDesc}</p>
              </div>
            </div>
            <p className="m-0 text-[11.5px] text-white/60 mt-4">{p.note}</p>
          </div>
        ))}
      </div>

      <InfoCard label="Pour se représenter les distances">
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          {VOYAGER_COMPARISONS.map(({ Icon, line1, line2, value }) => (
            <div key={line1} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-magenta shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="flex-1">
                <p className="m-0 text-[12.5px] text-white/75 leading-snug">{line1}</p>
                <p className="m-0 text-[11px] text-white/45 leading-snug">{line2}</p>
              </div>
              <p className="m-0 text-[14px] font-bold text-magenta whitespace-nowrap">{value}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <div className="border border-magenta rounded-lg p-4 border-[1.5px] mt-4 mb-4 flex items-start gap-3">
        <Rocket className="w-5 h-5 text-magenta shrink-0 mt-0.5" strokeWidth={1.75} />
        <p className="m-0 text-[13px] text-white/75 leading-relaxed"><strong className="text-white">Prochain record · novembre 2026 :</strong> Voyager 1 atteindra 1 jour-lumière de la Terre (~25,9 milliards de km) — le premier objet humain à franchir cette distance.</p>
      </div>

      <p className="m-0 text-[11px] text-white/35 mb-12">Sources : NASA/JPL · données juin 2026 · 1 UA = 149,6 millions de km</p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <InfoCard label="But & lancement">
          <p className="m-0 text-[13.5px] text-white/75 leading-relaxed mt-2">Voyager 1 est lancée le <strong className="text-white">5 septembre 1977</strong> (Voyager 2 le 20 août 1977) pour explorer le système solaire externe.</p>
        </InfoCard>
        <InfoCard label="Trajectoire">
          <p className="m-0 text-[13.5px] text-white/75 leading-relaxed mt-2">Survol de <strong className="text-white">Jupiter (1979)</strong> puis <strong className="text-white">Saturne (1980)</strong>. Le survol rapproché de Titan l'a fait quitter le plan de l'écliptique — « vers le haut », hors du système solaire.</p>
        </InfoCard>
        <InfoCard label="Statut actuel">
          <p className="m-0 text-[13.5px] text-white/75 leading-relaxed mt-2">Premier objet humain à entrer dans l'<strong className="text-white">espace interstellaire (2012)</strong>, et objet construit par l'humanité le plus lointain.</p>
        </InfoCard>
        <InfoCard label="Instruments & énergie">
          <p className="m-0 text-[13.5px] text-white/75 leading-relaxed mt-2">Caméras, instruments champs & particules, détecteurs de plasma, radio-science. Alimentation par <strong className="text-white">générateurs à radio-isotopes (RTG)</strong>.</p>
        </InfoCard>
      </div>

      <div className="rounded-2xl border border-magenta/25 bg-gradient-to-br from-magenta/[0.10] to-transparent overflow-hidden mb-4">
        <div className="grid md:grid-cols-[300px_1fr]">
          <div className="bg-black/40 p-6 flex flex-col items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-white/10">
            <Img
              src="https://commons.wikimedia.org/wiki/Special:FilePath/The%20Sounds%20of%20Earth%20Record%20Cover%20-%20GPN-2000-001978.jpg?width=420"
              alt="La pochette gravée du Disque d'or de Voyager"
              fallback="POCHETTE DU DISQUE D'OR · NASA/JPL"
              className="w-[200px] h-[200px] rounded-full object-cover border border-white/15 shadow-[0_0_40px_rgba(200,37,122,.25)]"
            />
            <p className="m-0 text-[11px] text-white/45 text-center">Pochette gravée d'instructions symboliques pour lire le disque et situer son origine.<br />NASA/JPL-Caltech</p>
          </div>
          <div className="p-6 sm:p-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-magenta/15 border border-magenta/30 rounded-full text-magenta text-[12px] font-semibold mb-3">
              <span className="w-3.5 h-3.5 rounded-full bg-magenta inline-block" /> Le Disque d'or
            </div>
            <h4 className="m-0 text-[20px] font-bold text-white">Un message de l'humanité</h4>
            <p className="m-0 text-[13.5px] text-white/70 leading-relaxed mt-2">Un disque phonographique plaqué or, fixé sur la sonde, conçu par un comité présidé par <strong className="text-white/85">Carl Sagan</strong>. Il contient une représentation de l'humanité :</p>
            <div className="grid sm:grid-cols-2 gap-x-5 gap-y-1.5 mt-3">
              {['~115 images', 'Sons naturels (vent, tonnerre, oiseaux, baleines)', 'Musiques de cultures et d\'époques variées', 'Salutations parlées en 55 langues', 'Sons humains (pas, rires)', "Messages du président des É.-U. et du Secrétaire général de l'ONU"].map((x) => (
                <p key={x} className="flex items-start gap-2 text-[13px] text-white/80 m-0"><span className="text-magenta mt-px">·</span>{x}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InfoCard label="Héritage · Voyager 2">
        <p className="m-0 text-[13.5px] text-white/75 leading-relaxed mt-2 max-w-[820px]">Voyager 2 est le <strong className="text-white">seul engin à avoir survolé les 4 planètes géantes</strong> (Jupiter, Saturne, Uranus, Neptune). Elle est entrée dans l'espace interstellaire en <strong className="text-white">2018</strong> et transporte un <strong className="text-white">Disque d'or identique</strong>.</p>
      </InfoCard>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 4 — Mars & Perseverance
 * ────────────────────────────────────────────────────────*/
const INGENUITY_STATS = [
  { v: '72', k: <>vols réalisés <span className="text-white/35">(conçu pour 5)</span></>, big: true },
  { v: '~3 ans', k: <>d'activité <span className="text-white/35">(prévu : 30 jours)</span></>, big: true },
  { v: '~18 km', k: <>parcourus <span className="text-white/35">(~14× le prévu)</span></>, big: true },
  { v: '~128,8 min', k: <>de vol cumulé <span className="text-white/35">(plus de 2 h)</span></>, big: true },
  { v: '24 m', k: <>altitude max</>, big: false },
  { v: '~36 km/h', k: <>vitesse max</>, big: false },
  { v: '~1,8 kg', k: <>masse</>, big: false },
  { v: '72ᵉ', k: <>vol final — pale endommagée</>, big: false },
];

function Mars({ solved, onSolved }: { solved: boolean; onSolved: () => void }) {
  return (
    <>
      <Hero
        src="https://commons.wikimedia.org/wiki/Special:FilePath/Perseverance%20selfie%20Sol%2046.jpg?width=1400"
        alt="Selfie du rover Perseverance avec l'hélicoptère Ingenuity dans le cratère Jezero"
        fallback="PERSEVERANCE + INGENUITY · NASA/JPL-CALTECH"
        tone="mars"
        credit="NASA/JPL-Caltech — Perseverance & Ingenuity, cratère Jezero. Domaine public."
      />
      <FlagStrip flags={[
        { code: 'us', label: 'NASA / JPL', title: 'États-Unis — NASA / JPL' },
        { code: 'es', label: 'Espagne', title: 'Espagne — contributions instrumentales' },
        { code: 'fr', label: 'France', title: 'France — contributions instrumentales' },
        { code: 'no', label: 'Norvège', title: 'Norvège — contributions instrumentales' },
      ]} />

      <SectionLabel>Mars dans la culture</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-4">Bien avant les rovers, Mars peuplait déjà notre imaginaire. La planète rouge a inspiré des récits d'invasion, des rêves de civilisations disparues, et des films qui imaginent ce que serait vraiment l'exploration spatiale.</p>
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <InfoCard label="L'idée des « Martiens »" title="Une planète, un mythe">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">À la fin du XIXᵉ siècle, des astronomes croient apercevoir des « canaux » à la surface de Mars — on imagine alors une civilisation capable de les avoir creusés. Le roman <strong className="text-white/85">La Guerre des mondes</strong> de H. G. Wells (1898) invente l'image d'envahisseurs venus de Mars, reprise en 1938 dans une dramatique radio si réaliste qu'une partie du public américain l'a crue véridique. L'idée du « petit homme vert » est née de cet imaginaire — la science n'a jamais trouvé trace d'une telle vie.</p>
        </InfoCard>
        <InfoCard label="Au cinéma · 2001, l'Odyssée de l'espace" title="Imaginer l'inconnu">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Le film de Stanley Kubrick (1968) ne se déroule pas sur Mars, mais il a posé, avant les premières sondes, les grandes questions de l'exploration spatiale : comment vivre et naviguer loin de la Terre, et jusqu'où une mission peut-elle dépendre de ses machines ? Une œuvre fondatrice pour tout le cinéma spatial qui a suivi.</p>
        </InfoCard>
        <InfoCard label="Au cinéma · Seul sur Mars" title="Survivre, avec la science">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Dans le film de Ridley Scott (2015), un astronaute abandonné sur Mars doit produire sa propre eau, cultiver de la nourriture et communiquer avec la Terre pour survivre. Contrairement aux récits d'invasion, l'histoire mise sur ce que l'on sait vraiment de la planète — son atmosphère fine, son sol, ses tempêtes — pour imaginer une exploration crédible.</p>
        </InfoCard>
      </div>

      <SectionLabel>La Terre et Mars, côte à côte</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-4">Place les deux planètes côte à côte — leurs tailles respectent leur véritable rapport. Fais-les tourner pour comparer.</p>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 mb-12">
        <PlanetCompareViewer className="w-full h-[360px] sm:h-[440px] rounded-xl overflow-hidden" />
        <p className="m-0 text-[11px] text-white/40 mt-3 text-center">Modèles 3D à l'échelle relative (Mars ≈ 0,53 × le diamètre de la Terre) · clique-glisse pour tourner, molette pour zoomer.</p>
      </div>

      <SectionLabel>Pourquoi explorer Mars ?</SectionLabel>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <InfoCard label="À la recherche de l'eau — et peut-être de la vie" title="Suivre l'eau pour suivre la vie">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Sur Terre, partout où il y a de l'eau liquide, on trouve de la vie. Perseverance explore le cratère Jezero, ancien lit d'un lac et d'un delta de rivière : si Mars a un jour porté des organismes microscopiques, c'est dans ces sédiments anciens que leurs traces auraient le plus de chances d'être préservées.</p>
        </InfoCard>
        <InfoCard label="Comprendre comment naissent les planètes" title="Mars, une archive intacte">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Sans océans ni tectonique des plaques pour effacer son passé, Mars a conservé des roches vieilles de plusieurs milliards d'années. Les étudier, c'est comprendre comment les planètes rocheuses — dont la Terre — se sont formées et ont évolué au début du système solaire.</p>
        </InfoCard>
      </div>

      <SectionLabel>Mars : une planète sœur, mais pas jumelle</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-4">Les robots envoyés sur Mars révèlent le portrait d'une planète qui ressemblait autrefois à la Terre — avant de devenir le désert glacé que l'on connaît aujourd'hui.</p>
      <div className="grid sm:grid-cols-3 gap-3 mb-12">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-magenta/15 border border-magenta/30 text-magenta text-[12px] font-bold mb-2">1</span>
          <p className="m-0 text-[13.5px] font-bold text-white">Un noyau qui s'éteint</p>
          <p className="m-0 text-[12.5px] text-white/60 leading-relaxed mt-1.5">Comme la Terre, Mars possédait un noyau métallique en mouvement, générateur d'un champ magnétique. Mais une planète plus petite se refroidit plus vite : son noyau s'est figé, et le champ magnétique qui l'entourait a fini par s'éteindre, il y a environ 4 milliards d'années.</p>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-magenta/15 border border-magenta/30 text-magenta text-[12px] font-bold mb-2">2</span>
          <p className="m-0 text-[13.5px] font-bold text-white">Le vent solaire balaie l'atmosphère</p>
          <p className="m-0 text-[12.5px] text-white/60 leading-relaxed mt-1.5">Sur Terre, le champ magnétique dévie le vent solaire, ce flot de particules chargées émis par le Soleil. Privée de ce bouclier, Mars a vu son atmosphère arrachée peu à peu par ce vent, au fil de centaines de millions d'années.</p>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-magenta/15 border border-magenta/30 text-magenta text-[12px] font-bold mb-2">3</span>
          <p className="m-0 text-[13.5px] font-bold text-white">D'une planète bleue à un désert rouge</p>
          <p className="m-0 text-[12.5px] text-white/60 leading-relaxed mt-1.5">En perdant son atmosphère, Mars a perdu la pression et la chaleur nécessaires à l'eau liquide : ses rivières et ses lacs se sont asséchés ou ont gelé, laissant la planète rouge, froide et presque sans air que les rovers explorent aujourd'hui.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-magenta/25 bg-gradient-to-br from-magenta/[0.10] to-transparent p-6 sm:p-7 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-magenta/15 border border-magenta/30 rounded-full text-magenta text-[12px] font-semibold mb-3">
          <span className="w-3.5 h-3.5 rounded-sm bg-magenta inline-block" /> Jeu · Mars contre la Terre
        </div>
        <h4 className="m-0 text-[20px] font-bold text-white mb-1">À ton avis, à quel point Mars diffère-t-elle de la Terre ?</h4>
        <p className="m-0 text-[13px] text-white/60 leading-relaxed mb-5">Pour chaque comparaison, écris le chiffre qui te semble le plus juste — une estimation suffit.</p>
        <PlanetCompareGame />
      </div>

      <SectionLabel>Comment commande-t-on un rover, à des millions de kilomètres ?</SectionLabel>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <InfoCard label="Un aller-retour de plusieurs minutes" title="Pas de pilotage en direct">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Selon la position des deux planètes, un signal radio met entre <strong className="text-white/85">environ 5 et 20 minutes</strong> pour parcourir la distance Terre-Mars. Impossible donc de « conduire » le rover avec une manette : chaque ordre envoyé met de longues minutes à arriver, et la réponse tout autant à revenir.</p>
        </InfoCard>
        <InfoCard label="Le réseau Deep Space Network" title="De grandes antennes sur Terre">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Les communications passent par un réseau de grandes antennes paraboliques réparties sur le globe (États-Unis, Espagne, Australie), qui se relaient pour garder le contact avec Mars à mesure que la Terre tourne.</p>
        </InfoCard>
        <InfoCard label="Des plans de mission, pas des manettes" title="Une journée préparée à l'avance">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Chaque jour martien (un « sol »), les équipes du JPL envoient une liste d'instructions au rover : où aller, quelles roches photographier ou analyser, quels instruments utiliser. Le rover exécute ce programme tout seul, puis transmet ses résultats et ses images.</p>
        </InfoCard>
        <InfoCard label="AutoNav, l'art de se débrouiller seul" title="Un rover qui voit où il marche">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Pour avancer sans attendre un ordre à chaque pas, le rover utilise un système de navigation autonome : ses caméras repèrent les rochers et les pentes, et il choisit lui-même le chemin le plus sûr — un peu comme une voiture qui se conduirait seule, mais sur un terrain inconnu.</p>
        </InfoCard>
      </div>

      <SectionLabel>À quoi servent les instruments d'un rover ?</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-4">Perseverance n'est pas qu'une caméra sur roues : c'est un petit laboratoire de géologie et de chimie, conçu pour répondre à une question précise — Mars a-t-elle un jour pu abriter la vie ?</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-10">
        {[
          { t: 'Mastcam-Z', d: "Deux caméras zoom sur le mât du rover : elles prennent des images en couleur et en relief du paysage, pour repérer les roches intéressantes à étudier de plus près." },
          { t: 'SuperCam', d: "Tire un laser sur une roche à distance pour en analyser la composition chimique, et embarque un micro qui enregistre le son de chaque impact." },
          { t: 'PIXL & SHERLOC', d: "Deux instruments montés au bout du bras robotique : ils examinent la composition minérale et chimique des roches, à la recherche de structures qui pourraient être les traces d'une vie microbienne très ancienne." },
          { t: 'MOXIE', d: "Une expérience qui a fabriqué de l'oxygène respirable à partir du dioxyde de carbone de l'atmosphère martienne — une technologie clé pour de futures missions habitées." },
          { t: 'Système de carottage', d: "Une perceuse prélève des échantillons de roche, scellés dans des tubes posés au sol : un dépôt que de futures missions iront récupérer pour les ramener sur Terre." },
          { t: 'Microphones', d: "Deux micros embarqués captent pour la première fois les sons de Mars : le vent, le crissement des roues sur les cailloux, le vol d'Ingenuity." },
        ].map((x) => (
          <div key={x.t} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
            <p className="m-0 text-[14px] font-bold text-white">{x.t}</p>
            <p className="m-0 text-[12.5px] text-white/60 leading-relaxed mt-1.5">{x.d}</p>
          </div>
        ))}
      </div>

      <SectionLabel>Écoute Mars</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-4">Perseverance est le premier engin à avoir enregistré le son de la planète rouge. Voici un extrait capté par son microphone, alors qu'il roulait sur le sol martien.</p>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden mb-3">
        <iframe
          title="Sons de Mars enregistrés par le rover Perseverance"
          width="100%"
          height="166"
          allow="autoplay"
          src="https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fnasa%2Fsounds-of-perseverance-mars-rover-driving-sol-16-90-second-highlights&color=%23c8257a&auto_play=false&show_user=true&visual=false"
          className="block w-full"
        />
      </div>
      <p className="text-[11px] text-white/40 mb-6">Crédit : NASA/JPL-Caltech — extrait audio capté par les microphones de Perseverance, sol 16.</p>
      <div className="rounded-2xl border border-magenta/25 bg-gradient-to-br from-magenta/[0.10] to-transparent p-6 sm:p-7 mb-12">
        <h4 className="m-0 text-[18px] font-bold text-white mb-1.5">Qu'est-ce qu'on entend ?</h4>
        <p className="m-0 text-[13.5px] text-white/65 leading-relaxed">Écoute l'extrait : peux-tu reconnaître le bruit des roues du rover sur les cailloux, le souffle du vent martien, ou le bourdonnement des mécanismes du rover lui-même ? Mars a une atmosphère 100 fois plus fine que celle de la Terre — le son s'y propage différemment, plus faiblement et avec des aigus atténués.</p>
      </div>

      <SectionLabel>Zoom · Perseverance en 3D</SectionLabel>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 mb-12">
        <PerseveranceViewer className="w-full h-[420px] sm:h-[480px] rounded-xl overflow-hidden" />
        <p className="m-0 text-[11px] text-white/40 mt-3 text-center">Modèle 3D du rover Perseverance · clique-glisse pour tourner, molette pour zoomer. Modélisation : Brian Kumanchik, NASA/JPL-Caltech.</p>
      </div>

      <SectionLabel>Cartographier une autre planète</SectionLabel>
      <figure className="m-0 mb-12">
        <div className="rounded-2xl overflow-hidden border border-white/12 bg-black aspect-[16/9]">
          <Img
            src="https://commons.wikimedia.org/wiki/Special:FilePath/Mars%20topography%20(MOLA%20dataset)%20HiRes.jpg?width=1400"
            alt="Carte topographique de Mars établie à partir des données de l'altimètre laser MOLA"
            fallback="CARTE TOPOGRAPHIQUE DE MARS · MOLA / NASA"
            tone="mars"
            className="w-full h-full object-cover"
          />
        </div>
        <figcaption className="mt-2 flex items-start gap-2 text-[11px] text-white/45">
          <span className="font-mono uppercase tracking-wide text-magenta-300 shrink-0">Crédit</span>
          <span>Carte du relief de Mars construite à partir de millions de mesures laser de l'altimètre MOLA, en orbite autour de la planète entre 1997 et 2001 — du bleu (les bassins, comme Hellas) au blanc (les sommets, comme le mont Olympe). Image : NASA / MOLA Science Team / Mars Global Surveyor.</span>
        </figcaption>
      </figure>
      <p className="text-[13.5px] text-white/60 leading-relaxed max-w-[760px] mb-12">Cette carte n'a pas été dessinée à la main : elle assemble des millions de mesures de distance, prises depuis l'orbite, pour reconstituer le relief de toute une planète — montagnes, cratères et vastes plaines — bien avant que le moindre rover ne pose une roue au sol.</p>

      <SectionLabel>La météo sur Mars</SectionLabel>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <InfoCard label="Des écarts extrêmes" title="Chaud le jour, glacial la nuit">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Avec une atmosphère 100 fois plus fine que celle de la Terre, Mars retient très peu la chaleur : la température peut dépasser <strong className="text-white/85">0 °C</strong> à midi près de l'équateur et chuter sous <strong className="text-white/85">-100 °C</strong> la nuit, parfois en quelques heures.</p>
        </InfoCard>
        <InfoCard label="Des tempêtes de poussière géantes" title="Parfois, toute la planète">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Le vent soulève une fine poussière rougeâtre qui peut former des « dust devils » (tourbillons), et certaines années, des tempêtes assez puissantes pour envelopper Mars tout entière pendant plusieurs semaines.</p>
        </InfoCard>
      </div>
      <p className="text-[13.5px] text-white/60 leading-relaxed max-w-[760px] mb-12">Perseverance embarque sa propre petite station météo (l'instrument MEDA) : elle mesure chaque jour la température, la pression, le vent, l'humidité et la poussière dans l'air — un bulletin météo martien, transmis sol après sol vers la Terre.</p>

      <SectionLabel>Ingenuity · le premier vol motorisé sur une autre planète</SectionLabel>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <InfoCard label="Des pales deux fois plus grandes que prévu" title="1,2 m de bout en bout">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">Pour un appareil d'à peine <strong className="text-white/85">1,8 kg</strong>, Ingenuity porte deux rotors contrarotatifs de <strong className="text-white/85">1,2 m d'envergure</strong> — bien plus longs, à l'échelle, que ceux d'un drone terrestre comparable. Il leur fallait brasser un volume d'air énorme pour produire la moindre portance.</p>
        </InfoCard>
        <InfoCard label="Pourquoi c'était si difficile" title="Voler dans presque rien">
          <p className="m-0 text-[13px] text-white/65 leading-relaxed mt-2">L'atmosphère de Mars est environ <strong className="text-white/85">100 fois plus fine</strong> que celle de la Terre : il y a presque rien sur quoi prendre appui. Pour compenser, les pales d'Ingenuity tournent à environ <strong className="text-white/85">2 500 tours par minute</strong> — près de cinq fois plus vite qu'un hélicoptère terrestre — et l'appareil devait rester assez léger pour décoller malgré tout, tout en survivant seul à des nuits à -90 °C.</p>
        </InfoCard>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
          <h4 className="m-0 text-[18px] font-bold text-white">Journal de vol</h4>
          <span className="text-[12px] text-white/45">19 avril 2021 → 18 janvier 2024</span>
        </div>
        <figure className="m-0 mb-6">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video">
            <video
              src="https://assets.science.nasa.gov/content/dam/science/psd/mars/videos/2024/6014_20210507_HelicopterFliesOnMars-1280.m4v"
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </div>
          <figcaption className="mt-2 flex items-start gap-2 text-[11px] text-white/45">
            <span className="font-mono uppercase tracking-wide text-magenta-300 shrink-0">Crédit</span>
            <span>Ingenuity filmé en plein vol par la caméra de Perseverance, depuis le sol du cratère Jezero. Image : NASA/JPL-Caltech.</span>
          </figcaption>
        </figure>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {INGENUITY_STATS.map((s, i) => (
            <div key={i}>
              <div className={`${s.big ? 'text-[30px] text-magenta' : 'text-[24px] text-white'} font-bold leading-none`}>{s.v}</div>
              <div className="text-[12px] text-white/55 mt-1.5 leading-tight">{s.k}</div>
            </div>
          ))}
        </div>
        <p className="m-0 text-[11px] text-white/40 mt-6">Conçu pour 5 vols en 30 jours, Ingenuity en a réalisé 72 sur près de 3 ans. Crédit : NASA/JPL-Caltech.</p>
      </div>

      <div className="rounded-2xl border border-magenta/25 bg-gradient-to-br from-magenta/[0.10] to-transparent p-6 sm:p-7 mb-4 mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-magenta/15 border border-magenta/30 rounded-full text-magenta text-[12px] font-semibold mb-3">
          <span className="w-3.5 h-3.5 rounded-sm bg-magenta inline-block" /> Mini-jeu · la photo de famille
        </div>
        <h4 className="m-0 text-[20px] font-bold text-white mb-4">Remets les rovers dans l'ordre chronologique</h4>
        <RoverGame solved={solved} onSolved={onSolved} />
      </div>
      <p className="text-[11px] text-white/40">Les 5 rovers de la NASA. À noter : le rover <strong className="text-white/60">Zhurong</strong> (Chine, CNSA, 2021) a aussi opéré sur Mars.</p>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 5 — Les métiers de l'exploration spatiale
 * ────────────────────────────────────────────────────────*/
const METIERS = [
  { label: 'Physicien·ne', desc: "Étudie les lois fondamentales — gravité, lumière, matière — qui permettent de comprendre ce que les missions observent.", Icon: Atom },
  { label: 'Planétologue', desc: "Analyse la formation et l'évolution des planètes, des lunes et des astéroïdes à partir des données et échantillons rapportés.", Icon: Globe },
  { label: 'Astronome', desc: "Observe et cartographie les objets célestes — étoiles, galaxies, exoplanètes — depuis le sol ou depuis l'espace.", Icon: Star },
  { label: 'Astrophysicien·ne', desc: "Combine physique et astronomie pour expliquer les mécanismes des objets célestes : trous noirs, étoiles, origines de l'Univers.", Icon: Sparkles },
  { label: 'Laborantin·e', desc: "Prépare, analyse et conserve en laboratoire les échantillons rapportés par les missions : roches martiennes, poussières, données de capteurs.", Icon: FlaskConical },
  { label: 'Technicien·ne en optique', desc: "Conçoit, fabrique et règle les miroirs, lentilles et capteurs des télescopes et des instruments embarqués.", Icon: Eye },
] as const;

const METIERS_RECHERCHE = [
  {
    label: 'Astrogéologue',
    desc: "Étudie la structure géologique des corps célestes du système solaire — roches, cratères, volcans, glaces.",
    exemple: "Exemple concret : il analyse les roches martiennes collectées par le rover Perseverance pour reconstituer l'histoire géologique de Mars.",
    Icon: Mountain,
  },
  {
    label: 'Exobiologiste',
    desc: "Recherche les conditions et les traces possibles de vie au-delà de la Terre, notamment sur les exoplanètes.",
    exemple: "Exemple concret : il étudie les échantillons martiens à la recherche de traces de vie passée, ou les océans cachés sous la glace d'Europe et d'Encelade, des lunes de Jupiter et de Saturne.",
    Icon: Dna,
  },
  {
    label: 'Météorologue spatial',
    desc: "Étudie la météo de l'espace — vent solaire, éruptions, tempêtes magnétiques — dans notre système solaire et au-delà.",
    exemple: "Exemple concret : il surveille les éruptions solaires qui peuvent perturber les satellites, le GPS et les réseaux électriques, et provoquer des aurores polaires.",
    Icon: Orbit,
  },
] as const;

function Metiers({ answer, onAnswer }: { answer: 'true' | 'false' | null; onAnswer: (v: 'true' | 'false') => void }) {
  const { logVideoView } = useSession();
  return (
    <>
      <SectionLabel>Des métiers, pas seulement des astronautes</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-6">
        Une mission spatiale est avant tout une aventure scientifique et technique collective. Voici quelques-uns
        des métiers qui, en coulisses, conçoivent les instruments, analysent les données et percent les mystères de l'Univers.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-12">
        {METIERS.map((m) => (
          <div key={m.label} className="p-5 rounded-2xl border border-white/10 bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex-shrink-0 text-magenta/70"><m.Icon className="w-6 h-6" strokeWidth={1.75} /></span>
              <h4 className="font-semibold text-white text-[15px] flex-1 text-left m-0">{m.label}</h4>
            </div>
            <p className="m-0 text-[12px] text-white/55 leading-snug">{m.desc}</p>
          </div>
        ))}
      </div>

      <SectionLabel>Zoom · le métier de chercheur</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-3">
        Tous les spécialistes ci-dessus ont un point commun : ce sont des chercheur·euses. Un chercheur en astronomie
        ou en sciences spatiales formule des questions sur l'Univers, observe, recueille des données — avec des
        télescopes, des sondes, des rovers — puis les analyse pour construire et tester des hypothèses. Son travail
        est ensuite publié, discuté et vérifié par d'autres chercheur·euses du monde entier, afin que les connaissances
        avancent collectivement.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex-shrink-0 text-magenta/70"><Search className="w-6 h-6" strokeWidth={1.75} /></span>
            <h4 className="font-semibold text-white text-[15px] flex-1 text-left m-0">Au quotidien</h4>
          </div>
          <p className="m-0 text-[12px] text-white/55 leading-snug">
            Lire et écrire des articles scientifiques, programmer pour traiter des données, passer du temps sur de
            grands télescopes ou avec les données envoyées par des sondes, échanger avec une équipe internationale.
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex-shrink-0 text-magenta/70"><Lightbulb className="w-6 h-6" strokeWidth={1.75} /></span>
            <h4 className="font-semibold text-white text-[15px] flex-1 text-left m-0">Exemple concret</h4>
          </div>
          <p className="m-0 text-[12px] text-white/55 leading-snug">
            Une chercheuse du télescope spatial James Webb compare les spectres de lumière de différentes exoplanètes
            pour repérer des traces de vapeur d'eau ou de méthane dans leur atmosphère.
          </p>
        </div>
      </div>

      <SectionLabel>D'autres chercheur·euses au cœur de l'étude de l'Univers</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-6">
        Certains métiers de la recherche spatiale restent méconnus du grand public, mais sont essentiels pour
        comprendre la galaxie qui nous entoure.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-12">
        {METIERS_RECHERCHE.map((m) => (
          <div key={m.label} className="p-5 rounded-2xl border border-white/10 bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex-shrink-0 text-magenta/70"><m.Icon className="w-6 h-6" strokeWidth={1.75} /></span>
              <h4 className="font-semibold text-white text-[15px] flex-1 text-left m-0">{m.label}</h4>
            </div>
            <p className="m-0 text-[12px] text-white/55 leading-snug mb-2">{m.desc}</p>
            <p className="m-0 text-[11.5px] text-white/45 leading-snug italic">{m.exemple}</p>
          </div>
        ))}
      </div>

      <SectionLabel>Portrait · une astrophysicienne raconte son métier</SectionLabel>
      <p className="text-[14px] text-white/65 leading-relaxed max-w-[720px] mb-4">
        Découvre le quotidien d'une astrophysicienne : ses recherches, son parcours, et ce qui l'a menée vers ce métier.
      </p>
      <figure className="m-0 mb-3 max-w-[640px]">
        <div className="relative rounded-2xl overflow-hidden border border-white/12 bg-black aspect-video">
          <YouTubeEmbed videoId="zISjqQEh6LY" title="Ines Mertz — présentation" nocookie onView={() => logVideoView('exploration', 'zISjqQEh6LY', 'Ines Mertz — présentation')} />
        </div>
        <figcaption className="mt-2 flex items-start gap-2 text-[11px] text-white/45">
          <span className="font-mono uppercase tracking-wide text-magenta-300 shrink-0">Crédit</span>
          <span>Ines Mertz, doctorante en astrophysique à l'Observatoire de Paris : ses recherches sur Mercure et le vent solaire, et son parcours de la prépa jusqu'au JPL en Californie.</span>
        </figcaption>
      </figure>

      <div className="mt-6 rounded-2xl border border-magenta/25 bg-magenta/[0.06] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-magenta mb-3">Vrai ou Faux ? · après avoir regardé la vidéo</p>
        <p className="text-[17px] font-bold text-white mb-5">
          Inès Mertz fait sa thèse sur la planète Mercure et le vent solaire.
        </p>
        <div className="flex gap-3">
          {(['true', 'false'] as const).map(val => {
            const selected = answer === val;
            const isCorrect = val === 'true';
            const showFeedback = answer !== null;
            return (
              <button
                key={val}
                onClick={() => onAnswer(val)}
                disabled={answer !== null}
                className={`flex-1 rounded-lg px-5 py-3 text-[14px] font-semibold transition border ${
                  selected
                    ? isCorrect
                      ? 'bg-green-900/40 border-green-500 text-green-300'
                      : 'bg-red-900/40 border-red-500 text-red-300'
                    : showFeedback && isCorrect
                      ? 'bg-green-900/20 border-green-500/50 text-green-400'
                      : 'border-white/15 text-white/70 hover:border-magenta/50 hover:text-white disabled:opacity-50'
                }`}
              >
                {val === 'true' ? 'Vrai' : 'Faux'}
              </button>
            );
          })}
        </div>
        {answer !== null && (
          <p className={`mt-4 text-[13px] leading-relaxed ${answer === 'true' ? 'text-green-300' : 'text-red-300'}`}>
            {answer === 'true'
              ? 'Exact. Inès Mertz est doctorante à l\'Observatoire de Paris et travaille sur Mercure et le vent solaire — elle a aussi effectué un stage au JPL en Californie.'
              : 'Pas tout à fait. Inès Mertz fait bien sa thèse sur Mercure et le vent solaire, à l\'Observatoire de Paris.'}
          </p>
        )}
      </div>

      <div className="mt-6 border border-magenta rounded-lg p-4 border-[1.5px]">
        <p className="m-0 text-[13px] text-white/70 leading-relaxed">
          <strong className="text-white">Le saviez-vous ?</strong> Une mission comme Perseverance a mobilisé plus de 7&nbsp;000 personnes,
          ingénieur·es, scientifiques et technicien·nes, avant même son décollage. Chacun de ces métiers est une porte d'entrée possible vers le spatial.
        </p>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 6 — Récap
 * ────────────────────────────────────────────────────────*/
function Recap({ moonQuiz, roverSolved, onContinue, onPrev }: {
  moonQuiz: number | null; roverSolved: boolean;
  onContinue: () => void; onPrev: () => void;
}) {
  return (
    <section className="animate-[chapterIn_480ms_cubic-bezier(.2,0,0,1)]">
      <div className="text-center pt-10">
        <div className="w-24 h-24 mx-auto mb-6 bg-magenta rounded-full grid place-items-center shadow-[0_0_0_6px_rgba(200,37,122,0.18),0_20px_40px_rgba(200,37,122,0.35)]">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="font-display font-bold uppercase tracking-[0.04em] text-[clamp(36px,5vw,56px)] m-0 mb-3">
          Quatre missions <span className="text-magenta">explorées.</span>
        </h1>
        <p className="text-[17px] text-white/70 max-w-[600px] mx-auto m-0 mb-9 leading-[1.55]">
          De la première lumière de l'Univers captée par James Webb au retour habité vers la Lune,
          de la sonde la plus lointaine jamais construite aux rovers martiens — tu as parcouru les missions
          qui repoussent les frontières de l'exploration.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left mb-9">
          <RecapStat v="4" t="missions phares explorées" />
          <RecapStat v={moonQuiz === 12 ? 'Juste' : moonQuiz !== null ? 'Tentée' : '—'} t="réponse au quiz lunaire" />
          <RecapStat v={roverSolved ? 'Complète' : '—'} t="photo de famille des rovers" />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/55">Et maintenant</span>
            <span className="text-[22px] font-semibold">Ta place dans le spatial</span>
            <span className="text-[13px] text-white/60">Ces missions cherchent les talents de demain. Le prochain, c'est peut-être toi.</span>
          </div>
          <button onClick={onContinue} className="inline-flex items-center gap-2 bg-magenta text-white rounded-lg px-6 py-4 text-[14px] font-semibold hover:bg-magenta-700 transition">
            Continuer la session <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-white/10 flex">
        <button onClick={onPrev} className="inline-flex items-center gap-2 rounded-lg px-5 py-3.5 text-[14px] font-semibold border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition">
          <ChevronLeft className="w-4 h-4" /> Revenir aux métiers
        </button>
      </div>
    </section>
  );
}

function RecapStat({ v, t }: { v: string | number; t: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-2">
      <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-magenta">Tes statistiques</span>
      <span className="text-[32px] font-bold text-magenta leading-none">{v}</span>
      <span className="text-[15px] font-medium leading-[1.35]">{t}</span>
    </div>
  );
}
