import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Telescope, Rocket, Radio, Globe, Trophy, Box } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { SectionCanvas, SectionTopBar, SectionProgress } from './ChapterShell';
import {
  Img,
  Trajectory,
  MissionGallery,
  MoonQuiz,
  MoonEssay,
  RoverGame,
  type TrajConfig,
  type GalleryItem,
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
 *    5. Récap        → célébration + CTA section suivante
 *
 *  Persistence (via useSession → 'exploration'):
 *    chapter · moon_quiz · moon_essay · rover_solved
 *
 *  Same props as the original section — App.tsx needs no change.
 * ════════════════════════════════════════════════════════════════*/

const TOTAL_CHAPTERS = 6;

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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await getResponses('exploration');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.moon_quiz) setMoonQuiz(parseInt(r.moon_quiz, 10));
      if (r.moon_essay) setMoonEssay(r.moon_essay);
      if (r.rover_solved === '1') setRoverSolved(true);
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

  return (
    <SectionCanvas>
      <SectionTopBar label={`Session 3 · Chapitre ${chapter + 1} sur ${TOTAL_CHAPTERS} · Exploration`} onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} onGoTo={goTo} />

      <main className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-12 pb-24">
        {chapter === 0 && <Intro onNext={() => goTo(1)} />}
        {chapter === 1 && (
          <MissionShell
            num="02" kicker="Télescope spatial · observation"
            title={<>James&nbsp;Webb — voir la<br /><span className="text-magenta">première lumière de l'Univers.</span></>}
            lede="Le plus grand et le plus puissant télescope spatial jamais lancé. Replié comme un origami, déployé à 1,5 million de km, refroidi à l'extrême — pour capter une lumière vieille de 13,5 milliards d'années."
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextLabel="Continue · Artémis →"
          >
            <JamesWebb />
          </MissionShell>
        )}
        {chapter === 2 && (
          <MissionShell
            num="03" kicker="Vols habités · retour sur la Lune"
            title={<>Artémis — bientôt,<br /><span className="text-magenta">marcher de nouveau sur la Lune.</span></>}
            lede="Depuis Apollo 11 et le premier pas sur la Lune en 1969, le rêve d'y retourner — et peut-être d'y vivre un jour — n'a jamais disparu. Artémis en est la suite : un programme américain qui ramène des astronautes autour de la Lune, puis sur sa surface, vers le pôle Sud."
            onPrev={() => goTo(1)} onNext={() => goTo(3)} nextEnabled={moonQuiz !== null}
            nextLabel={moonQuiz !== null ? 'Continue · Voyager 1 →' : 'Réponds au quiz pour continuer'}
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
            onPrev={() => goTo(2)} onNext={() => goTo(4)} nextLabel="Continue · Mars →"
          >
            <Voyager />
          </MissionShell>
        )}
        {chapter === 4 && (
          <MissionShell
            num="05" kicker="Rovers & hélicoptère · planète Mars"
            title={<>Mars — vingt-cinq ans<br /><span className="text-magenta">de rovers sur une autre planète.</span></>}
            lede="De la petite Sojourner à Perseverance et son hélicoptère Ingenuity : remets les rovers dans l'ordre, puis explore le premier engin à avoir volé sur une autre planète."
            onPrev={() => goTo(3)} onNext={() => goTo(5)} nextEnabled={roverSolved}
            nextLabel={roverSolved ? 'Voir le récap →' : 'Reconstitue la photo de famille'}
          >
            <Mars solved={roverSolved} onSolved={handleRoverSolved} />
          </MissionShell>
        )}
        {chapter === 5 && (
          <Recap moonQuiz={moonQuiz} roverSolved={roverSolved} onContinue={onComplete} onPrev={() => goTo(4)} />
        )}
      </main>
    </SectionCanvas>
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
  const enabled = props.nextEnabled ?? true;
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
          onClick={props.onNext}
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
const JWST_TRAJ: TrajConfig = {
  decor:
    "<circle cx='90' cy='280' r='34' fill='#1d4ed8'/><circle cx='90' cy='280' r='34' fill='none' stroke='rgba(255,255,255,.25)' stroke-width='1.5'/><text x='90' y='332' fill='rgba(255,255,255,.55)' font-family='monospace' font-size='12' text-anchor='middle'>TERRE</text>" +
    "<circle cx='700' cy='90' r='4' fill='#c8257a'/><circle cx='700' cy='90' r='13' fill='none' stroke='rgba(200,37,122,.5)' stroke-width='1.5' stroke-dasharray='3 4'/><text x='700' y='66' fill='rgba(255,255,255,.6)' font-family='monospace' font-size='12' text-anchor='middle'>POINT L2</text><text x='700' y='118' fill='rgba(255,255,255,.4)' font-family='monospace' font-size='10' text-anchor='middle'>1,5 M km</text>" +
    "<circle cx='250' cy='235' r='9' fill='#9ca3af'/><text x='250' y='262' fill='rgba(255,255,255,.4)' font-family='monospace' font-size='10' text-anchor='middle'>Lune</text>",
  path: 'M 90 280 C 220 250, 300 210, 420 170 S 620 110, 700 90',
  steps: [
    { short: 'Lancement', title: 'Décollage façon origami', date: '25 déc. 2021', t: 0.0, body: 'Lancement par une fusée Ariane 5 depuis le Centre spatial guyanais (Kourou). Le télescope voyage plié — un pliage « origami » pour tenir dans la coiffe.' },
    { short: 'Vers L2', title: 'Un mois de voyage vers L2', date: 'déc. 2021 – janv. 2022', t: 0.42, body: 'Cap sur le point de Lagrange L2, à 1,5 million de km de la Terre (4× la distance Terre–Lune), avec de fines corrections de trajectoire.' },
    { short: 'Déploiement', title: 'Le déploiement le plus complexe', date: '1er mois', t: 0.66, body: "Au fil du premier mois, une séquence pilotée point par point (~344 mécanismes) déplie l'observatoire.", stages: ['Antenne', 'Bouclier solaire déplié', 'Bouclier tendu', 'Miroir secondaire', 'Ailes du miroir primaire'] },
    { short: 'Orbite L2', title: 'Insertion en orbite autour de L2', date: '~29 jours après', t: 0.9, body: 'Environ 29 jours après le lancement (fin janvier 2022), une dernière poussée place Webb en orbite autour de L2.' },
    { short: 'Science', title: 'Mise en service, puis premières images', date: 'juillet 2022', t: 1.0, body: 'Six mois de réglages (refroidissement, alignement des 18 segments au nanomètre), puis les premières images scientifiques en juillet 2022.' },
  ],
};

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
      <div className="mb-12"><Trajectory {...JWST_TRAJ} /></div>

      <SectionLabel>Pourquoi il change tout</SectionLabel>
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
const ARTEMIS_TRAJ: TrajConfig = {
  decor:
    "<circle cx='120' cy='260' r='40' fill='#1d4ed8'/><circle cx='120' cy='260' r='40' fill='none' stroke='rgba(255,255,255,.25)' stroke-width='1.5'/><text x='120' y='320' fill='rgba(255,255,255,.55)' font-family='monospace' font-size='12' text-anchor='middle'>TERRE</text>" +
    "<circle cx='660' cy='110' r='26' fill='#9ca3af'/><circle cx='660' cy='110' r='26' fill='none' stroke='rgba(255,255,255,.25)' stroke-width='1.5'/><text x='660' y='62' fill='rgba(255,255,255,.6)' font-family='monospace' font-size='12' text-anchor='middle'>LUNE</text>",
  path: 'M 120 300 C 180 320, 250 300, 300 250 C 380 175, 520 120, 620 130 C 700 138, 690 90, 640 86 C 560 80, 470 150, 360 210 C 260 264, 175 250, 150 300',
  steps: [
    { short: 'Orbite Terre', title: 'Orbite terrestre', date: 'J+0', t: 0.04, body: 'Le SLS place Orion en orbite basse. Vérifications des systèmes avant de viser la Lune.' },
    { short: 'Injection', title: 'Injection translunaire (TLI)', date: 'J+0', t: 0.22, body: "Une poussée envoie Orion sur sa trajectoire vers la Lune — c'est le Module de service européen (ESM) qui fournit la propulsion." },
    { short: 'Survol Lune', title: 'Survol et orbite lunaire', date: 'J+4 à J+10', t: 0.5, body: 'Orion contourne la Lune, en visant à terme la région du pôle Sud, riche en glace d\'eau.' },
    { short: 'Retour', title: 'Retour vers la Terre', date: 'fin de mission', t: 0.78, body: "Nouvelle poussée pour quitter l'influence lunaire et revenir vers la Terre." },
    { short: 'Amerrissage', title: 'Rentrée et amerrissage', date: 'fin de mission', t: 1.0, body: 'Rentrée atmosphérique à grande vitesse, boucliers thermiques à l\'épreuve, puis amerrissage sous parachutes dans le Pacifique.' },
  ],
};

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
      <div className="mb-12"><Trajectory {...ARTEMIS_TRAJ} /></div>

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

      <div className="rounded-2xl border border-magenta/25 bg-gradient-to-br from-magenta/[0.10] to-transparent p-6 sm:p-7 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-magenta/15 border border-magenta/30 rounded-full text-magenta text-[12px] font-semibold mb-3">
          <span className="w-3.5 h-3.5 rounded-sm bg-magenta inline-block" /> Quiz
        </div>
        <h4 className="m-0 text-[20px] font-bold text-white mb-1">Combien de personnes ont marché sur la Lune ?</h4>
        <p className="m-0 text-[13px] text-white/60 leading-relaxed mb-5">Choisis ta réponse — elle est conservée même si tu reviens plus tard.</p>
        <MoonQuiz initial={moonQuiz} onAnswer={onMoonQuiz} />
      </div>

      <MoonEssay initial={moonEssay} onSave={onMoonEssay} />

      <div className="text-[11px] text-white/40 mt-4">⚠ Dates Artémis à reconfirmer à la publication (nasa.gov / esa.int). Crédits images : NASA / NASA-JPL (domaine public) ; visuels ESA en CC BY-SA 3.0 IGO si utilisés.</div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 3 — Voyager 1
 * ────────────────────────────────────────────────────────*/
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

      <div className="rounded-2xl border border-magenta/25 bg-gradient-to-br from-magenta/[0.10] to-transparent p-6 sm:p-7 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-magenta/15 border border-magenta/30 rounded-full text-magenta text-[12px] font-semibold mb-3">
          <span className="w-3.5 h-3.5 rounded-sm bg-magenta inline-block" /> Mini-jeu · la photo de famille
        </div>
        <h4 className="m-0 text-[20px] font-bold text-white mb-4">Remets les rovers dans l'ordre chronologique</h4>
        <RoverGame solved={solved} onSolved={onSolved} />
      </div>
      <p className="text-[11px] text-white/40 mb-12">Les 5 rovers de la NASA. À noter : le rover <strong className="text-white/60">Zhurong</strong> (Chine, CNSA, 2021) a aussi opéré sur Mars.</p>

      <SectionLabel>Zoom · Perseverance en 3D</SectionLabel>
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 mb-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-magenta/15 border border-magenta/30 grid place-items-center mb-3">
          <Box className="w-5 h-5 text-magenta" />
        </div>
        <p className="m-0 text-[15px] font-bold text-white">Emplacement du modèle 3D <span className="font-mono text-white/50">perseverance.glb</span></p>
        <p className="m-0 text-[12.5px] text-white/55 leading-relaxed mt-1.5 max-w-[560px] mx-auto">Brancher ici le modèle GLB officiel NASA/JPL (~4,8 Mo) via <span className="font-mono text-white/70">&lt;model-viewer&gt;</span>, comme l'emplacement déjà en place pour l'ISS. Auteur du modèle : Brian Kumanchik, NASA/JPL-Caltech.</p>
      </div>

      <SectionLabel>Ingenuity · journal de vol</SectionLabel>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
          <h4 className="m-0 text-[18px] font-bold text-white">Le premier vol motorisé sur une autre planète</h4>
          <span className="text-[12px] text-white/45">19 avril 2021 → 18 janvier 2024</span>
        </div>
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
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 5 — Récap
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
          <ChevronLeft className="w-4 h-4" /> Revenir à Mars
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
