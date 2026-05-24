import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { ChapterShell, SectionTopBar, SectionProgress } from './ChapterShell';

/* ════════════════════════════════════════════════════════════════
 *  ImpactTerrestreSection — chapter-based interactive flow
 *
 *  6 chapters the student progresses through one at a time:
 *    1. "Une journée dans ta vie"  → satellite counter
 *    2. "Le regard de Copernicus"  → carousel of satellite views
 *    3. "Le spatial dans ta poche" → flip-card spinoff game
 *    4. "Pilotage international"   → ESOC photo + agencies + ISS flags
 *    5. "Quiz éclair"              → 4 questions sequential
 *    6. "Récap"                    → celebration + next CTA
 *
 *  Persistence: chapter index + quiz answers + counter total are
 *  saved through `saveResponse` so the student can resume.
 * ════════════════════════════════════════════════════════════════*/

const TOTAL_CHAPTERS = 6;

interface ImpactTerrestreSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function ImpactTerrestreSection({ onComplete, onHome }: ImpactTerrestreSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [chapter, setChapter] = useState(0);
  const [satellites, setSatellites] = useState(0);
  const [flipsCount, setFlipsCount] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from supabase
  useEffect(() => {
    (async () => {
      const r = await getResponses('impact_terrestre');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.satellites) setSatellites(parseInt(r.satellites, 10) || 0);
      if (r.flips) setFlipsCount(parseInt(r.flips, 10) || 0);
      if (r.quiz_score) setQuizScore(parseInt(r.quiz_score, 10));
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('impact_terrestre', 'chapter', String(i));
  };

  const handleSatellites = async (n: number) => {
    setSatellites(n);
    if (hydrated) await saveResponse('impact_terrestre', 'satellites', String(n));
  };
  const handleFlips = async (n: number) => {
    setFlipsCount(n);
    if (hydrated) await saveResponse('impact_terrestre', 'flips', String(n));
  };
  const handleQuizScore = async (n: number) => {
    setQuizScore(n);
    if (hydrated) await saveResponse('impact_terrestre', 'quiz_score', String(n));
  };

  return (
    <div className="relative min-h-screen bg-deepspace text-white font-sans overflow-x-hidden">
      <div className="starry-background absolute inset-0" />

      {/* Soft magenta glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-15 bg-magenta blur-[120px]" />
        <div className="absolute -top-32 right-24 w-[400px] h-[400px] rounded-full opacity-5 bg-magenta blur-[100px]" />
      </div>

      <SectionTopBar
        label="Session 1 · Chapitre 1 sur 3 · L'espace au quotidien"
        onHome={onHome}
      />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} onGoTo={goTo} />

      {/* Stage */}
      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">
        {chapter === 0 && (
          <ChapterShell
            kicker="01" title="Une journée dans ta vie" titleAccent="utilises-tu aujourd'hui ?"
            lede="Clique sur chaque moment de ta journée. À chaque fois, on compte combien de satellites travaillent pour toi sans que tu t'en rendes compte."
            onPrev={null} onNext={() => goTo(1)} nextEnabled={satellites > 0}
            nextLabel={satellites > 0 ? "Continue · Le regard de Copernicus →" : "Découvre tous les moments d'abord"}
          >
            <DayCounter onComplete={handleSatellites} initial={satellites} />
          </ChapterShell>
        )}

        {chapter === 1 && (
          <ChapterShell
            kicker="02" title="Le regard de Copernicus" titleAccent="on serait aveugles."
            titlePrefix="Sans ces yeux,"
            lede="Le programme européen Copernicus met à disposition de tous, gratuitement, des images de la Terre actualisées plusieurs fois par semaine. Voici trois exemples concrets."
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextEnabled={true}
            nextLabel="Continue · Le spatial dans ta poche →"
          >
            <CopernicusCarousel />
          </ChapterShell>
        )}

        {chapter === 2 && (
          <ChapterShell
            kicker="03" title="Le spatial dans ta poche" titleAccent="est né du spatial ?"
            titlePrefix="Quel objet du quotidien"
            lede="Retourne chaque carte. Toutes les inventions ci-dessous viennent du spatial. Combien tu en utilises au quotidien ?"
            onPrev={() => goTo(1)} onNext={() => goTo(3)} nextEnabled={flipsCount >= 6}
            nextLabel={flipsCount >= 6 ? "Continue · Pilotage international →" : "Retourne toutes les cartes d'abord"}
          >
            <SpinoffGame initial={flipsCount} onCount={handleFlips} />
          </ChapterShell>
        )}

        {chapter === 3 && (
          <ChapterShell
            kicker="04" title="Pilotage international" titleAccent="qui pilotent l'espace."
            titlePrefix="Les équipes invisibles"
            lede="Chaque satellite en orbite est surveillé et commandé depuis la Terre, vingt-quatre heures sur vingt-quatre. Le plus grand centre européen est l'ESOC, à Darmstadt en Allemagne."
            onPrev={() => goTo(2)} onNext={() => goTo(4)} nextEnabled={true}
            nextLabel="Continue vers le quiz éclair →"
          >
            <OpsBlock />
          </ChapterShell>
        )}

        {chapter === 4 && (
          <ChapterShell
            kicker="05" title="Quiz éclair" titleAccent="valider la partie."
            titlePrefix="Quatre questions pour"
            lede="Une réponse par question. Pas de mauvaise réponse définitive, tu peux te tromper. L'objectif, c'est d'apprendre."
            onPrev={() => goTo(3)} onNext={() => goTo(5)} nextEnabled={quizScore !== null}
            nextLabel={quizScore !== null ? "Termine le chapitre →" : "Réponds à toutes les questions"}
          >
            <Quiz onDone={handleQuizScore} initial={quizScore} />
          </ChapterShell>
        )}

        {chapter === 5 && (
          <Recap
            satellites={satellites}
            flips={flipsCount}
            quizScore={quizScore ?? 0}
            onContinue={onComplete}
            onPrev={() => goTo(4)}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 1 — Day counter
 * ────────────────────────────────────────────────────────*/
const DAY_TILES = [
  {
    moment: '07h30 · Réveil',
    label: 'Tu te réveilles',
    activity: "Tu consultes la météo, ton téléphone est déjà connecté.",
    add: 4,
    reveal: "GPS de tes parents (4 satellites Galileo en visibilité), réveil synchronisé avec un serveur de temps satellitaire.",
  },
  {
    moment: '08h15 · Trajet',
    label: 'Tu vas en cours',
    activity: "Bus, vélo, voiture. Le trajet est calculé depuis l'orbite.",
    add: 3,
    reveal: "GPS pour le trajet, info trafic en temps réel, Galileo (Europe) qui complète le GPS américain.",
  },
  {
    moment: '12h00 · Cantine',
    label: 'Tu déjeunes',
    activity: "Légumes du potager. Météo aux infos. Tous deux suivis depuis l'espace.",
    add: 2,
    reveal: "La nourriture servie vient de champs surveillés par Sentinel-2. Les bulletins météo utilisent les satellites Meteosat.",
  },
  {
    moment: '20h00 · Soirée',
    label: 'Tu regardes une vidéo',
    activity: "Streaming, appel international. Les ondes passent par l'orbite.",
    add: 3,
    reveal: "Vidéo en streaming via fibre + satellites de relais télécom. Tes messages avec un cousin à l'étranger transitent par des constellations comme Starlink ou Eutelsat.",
  },
];

const CAPTIONS = [
  'Continue à explorer ta journée. Le total grimpe.',
  'On y est à mi-chemin. Plus tu cliques, plus le compteur monte.',
  'Encore un moment à découvrir.',
  "C'est plus que ce que tu pensais, non ? Et on n'a pas tout compté.",
];

function DayCounter({ onComplete, initial }: { onComplete: (n: number) => void; initial: number }) {
  const [clicked, setClicked] = useState<Set<number>>(new Set());
  const [reveal, setReveal] = useState<string>('');
  const total = useMemo(() => Array.from(clicked).reduce((sum, i) => sum + DAY_TILES[i].add, 0), [clicked]);
  const allClicked = clicked.size === DAY_TILES.length;

  // Push the running total up when it changes
  useEffect(() => { onComplete(total); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [total]);

  // Restore last visible total if hydrated
  const startTotal = clicked.size === 0 && initial ? initial : total;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="grid grid-cols-2 gap-3">
        {DAY_TILES.map((t, i) => {
          const isDone = clicked.has(i);
          return (
            <button
              key={i}
              onClick={() => {
                if (isDone) return;
                const next = new Set(clicked); next.add(i); setClicked(next);
                setReveal(t.reveal);
              }}
              className={`relative text-left rounded-2xl p-5 transition-all duration-200 ${
                isDone
                  ? 'bg-magenta/10 border border-magenta'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5'
              }`}
            >
              <div className={`text-[11px] font-semibold tracking-[0.16em] uppercase mb-1 ${isDone ? 'text-magenta' : 'text-white/55'}`}>
                {t.moment}
              </div>
              <div className="text-[18px] font-semibold mb-1.5">{t.label}</div>
              <div className="text-[13px] text-white/65 leading-[1.45]">{t.activity}</div>
              <span className={`absolute top-3.5 right-3.5 bg-magenta text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all duration-300 ${
                isDone ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}>+{t.add}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-magenta/30 bg-gradient-to-br from-magenta/15 to-magenta/[0.03] p-8 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(200,37,122,0.18),transparent_60%)] pointer-events-none" />
        <span className="relative text-[11px] font-semibold tracking-[0.16em] uppercase text-magenta">Total cumulé</span>
        <div key={total} className="relative font-display font-bold text-[clamp(72px,10vw,128px)] leading-[0.9] tracking-[-0.02em] animate-[pulse_320ms_cubic-bezier(.2,0,0,1)]">
          {startTotal}
        </div>
        <p className="relative text-[14px] leading-[1.55] text-white/80 m-0">
          {allClicked
            ? "C'est plus que ce que tu pensais, non ? Et on n'a pas tout compté."
            : clicked.size === 0
              ? "Clique sur les moments de ta journée pour les découvrir."
              : CAPTIONS[clicked.size - 1] || CAPTIONS[0]}
        </p>
        {reveal && (
          <div className="relative bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-[13px] leading-[1.5] text-white/85">
            {reveal}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 2 — Copernicus carousel
 * ────────────────────────────────────────────────────────*/
const SLIDES = [
  {
    img: 'https://esa.int/var/esa/storage/images/esa_multimedia/images/2016/05/piton_de_la_fournaise/15985095-1-eng-GB/Piton_de_la_Fournaise.jpg',
    tag: 'Sentinel-1 · Île de La Réunion',
    title: 'Le Piton de la Fournaise en éruption',
    desc: "Sentinel-1 voit avec un radar qui traverse les nuages et fonctionne de nuit. Le volcan est cartographié en temps réel pendant chaque éruption pour évaluer la coulée de lave et alerter les habitants.",
    stats: [{ v: '5j', k: 'Cycle de revisite Sentinel-1' }, { v: '24/7', k: 'Imagerie radar, jour ou nuit' }],
    credit: 'Image : ESA / Copernicus Sentinel-1, 2016',
  },
  {
    img: 'https://esa.int/var/esa/storage/images/esa_multimedia/images/2022/01/sulphur_dioxide_from_tonga_eruption_spreads_over_australia/23907503-1-eng-GB/Sulphur_dioxide_from_Tonga_eruption_spreads_over_Australia_card_full.jpg',
    tag: 'Sentinel-5P · Janvier 2022',
    title: "Le nuage de soufre de l'éruption de Tonga",
    desc: "Sentinel-5P TROPOMI détecte les gaz invisibles à l'œil nu. Ici, le dioxyde de soufre rejeté par l'éruption volcanique de Tonga se propage au-dessus de l'Australie.",
    stats: [{ v: '7', k: 'Polluants suivis en continu' }, { v: '100%', k: 'Couverture terrestre quotidienne' }],
    credit: 'Image : ESA / Copernicus Sentinel-5P, 2022',
  },
  {
    img: 'https://www.copernicus.eu/system/files/styles/image_of_the_day/private/2024-12/image_day/20241231_Seine%20river.png?itok=Zg_IUmBQ',
    tag: 'Sentinel-2 · La Seine',
    title: "Ta ville vue de l'espace",
    desc: "Copernicus propose chaque jour une image différente de la Terre. Voici la Seine vue par Sentinel-2 en optique multispectrale. Les mêmes images servent à l'agriculture, l'urbanisme et la gestion des inondations.",
    stats: [{ v: '20', k: 'Satellites Sentinel dans la flotte' }, { v: '0€', k: 'Données gratuites pour tous' }],
    credit: 'Image : ESA / Copernicus Sentinel-2, 2024',
  },
];

function CopernicusCarousel() {
  const [idx, setIdx] = useState(0);
  const set = (i: number) => setIdx((i + SLIDES.length) % SLIDES.length);
  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-white/10 relative bg-black/30">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${idx * 100}%)`, width: `${SLIDES.length * 100}%` }}
        >
          {SLIDES.map((s, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] w-full" style={{ width: `${100 / SLIDES.length}%` }}>
              <div className="aspect-[4/3] bg-black bg-cover bg-center" style={{ backgroundImage: `url('${s.img}')` }} />
              <div className="p-8 flex flex-col gap-3">
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-magenta">{s.tag}</span>
                <h3 className="text-[22px] font-semibold leading-[1.2] m-0">{s.title}</h3>
                <p className="text-[14px] leading-[1.55] text-white/75 m-0">{s.desc}</p>
                <div className="mt-auto flex gap-6">
                  {s.stats.map((st, k) => (
                    <div key={k}>
                      <div className="text-[32px] font-bold text-magenta leading-none">{st.v}</div>
                      <div className="text-[11px] uppercase tracking-[0.08em] text-white/50 mt-1 max-w-[130px] leading-[1.4]">{st.k}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[10.5px] italic text-white/45 m-0 mt-3">{s.credit}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => set(idx - 1)} aria-label="Précédent" className="absolute top-1/2 left-4 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 grid place-items-center hover:bg-magenta hover:border-magenta transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => set(idx + 1)} aria-label="Suivant" className="absolute top-1/2 right-4 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 grid place-items-center hover:bg-magenta hover:border-magenta transition">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="flex gap-2 justify-center mt-5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => set(i)}
            aria-label={`Aller à la diapo ${i + 1}`}
            className={`rounded-full transition-all duration-200 ${i === idx ? 'w-7 h-2 bg-magenta' : 'w-2 h-2 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 3 — Spinoff flip-card game
 * ────────────────────────────────────────────────────────*/
const SPINOFFS = [
  { name: 'Matelas à mémoire de forme', badge: 'NASA · 1966', source: 'Apollo, sièges de capsule', title: 'Mousse à mémoire de forme', desc: "Inventée pour absorber les chocs au décollage et protéger les astronautes. Aujourd'hui dans nos matelas, sièges auto, équipements anti-escarres.", img: 'https://guideliterie.com/wp-content/uploads/2018/12/matelas-memoire-de-forme.jpeg' },
  { name: 'Velcro',                     badge: 'NASA · 1960s', source: 'Apollo, ISS',                title: 'Velcro et fixations sans pesanteur', desc: "Aucune vis ne peut être serrée à la main en apesanteur sans s'envoler. Le velcro est devenu indispensable à bord. Puis dans nos chaussures, sacs, matériel médical.", img: 'https://live.staticflickr.com/65535/55180852205_ecf572f1df_c.jpg' },
  { name: 'Capteur photo smartphone',   badge: 'JPL · 1993',  source: 'Sondes interplanétaires',   title: 'Capteur CMOS', desc: "Inventé au JPL de la NASA pour les sondes interplanétaires. Cœur de chaque appareil photo de smartphone, des milliards produits chaque année.", img: 'https://images.pexels.com/photos/1828109/pexels-photo-1828109.jpeg' },
  { name: 'GPS de ton téléphone',       badge: 'DoD · 1973',  source: '24 satellites en orbite moyenne', title: 'GPS et géolocalisation', desc: "Conçu par l'armée américaine pour guider missiles et troupes. Ouvert au civil en 1983. L'Europe a depuis développé son propre système, Galileo.", img: 'https://images.pexels.com/photos/9966011/pexels-photo-9966011.jpeg' },
  { name: 'Imagerie médicale IRM',      badge: 'NASA · 1970s', source: "Traitement d'image sondes lunaires", title: 'IRM, imagerie médicale', desc: "Les algorithmes de traitement d'image développés pour les sondes lunaires ont inspiré les premières IRM. Outil de diagnostic le plus puissant de la médecine moderne.", img: 'https://images.pexels.com/photos/7089017/pexels-photo-7089017.jpeg' },
  { name: 'Plaque vitrocéramique',      badge: 'NASA · 1970s', source: 'Bouclier thermique navette', title: 'Céramiques haute performance', desc: "Pour résister à 1 600 °C lors de la rentrée atmosphérique. Aujourd'hui dans nos plaques de cuisson, implants dentaires, freins de TGV.", img: 'https://images.pexels.com/photos/8055154/pexels-photo-8055154.jpeg' },
];

function SpinoffGame({ initial, onCount }: { initial: number; onCount: (n: number) => void }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const count = flipped.size;
  useEffect(() => { onCount(Math.max(count, initial || 0)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [count]);

  return (
    <div>
      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 mb-6 flex items-center justify-between gap-6 flex-wrap">
        <div className="text-[14px] text-white/85 leading-[1.5] flex-1 min-w-[280px]">
          Astuce : la majorité de nos technologies modernes ont d'abord été développées pour les missions spatiales avant d'être adoptées dans la vie civile. C'est ce qu'on appelle des <strong>retombées</strong>, ou <em>spinoffs</em>.
        </div>
        <div className="text-[13px] text-white/60 inline-flex items-center gap-2.5">
          <span className="text-[28px] font-bold text-magenta leading-none">{count}</span>
          sur 6 retournées
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {SPINOFFS.map((s, i) => {
          const isFlipped = flipped.has(i);
          return (
            <div
              key={i}
              onClick={() => {
                if (isFlipped) return;
                const next = new Set(flipped); next.add(i); setFlipped(next);
              }}
              className="aspect-[3/4] cursor-pointer [perspective:1000px]"
            >
              <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden] bg-gradient-to-br from-deepspace-soft to-magenta/20 border border-white/10 hover:border-magenta p-5 flex flex-col justify-between">
                  <div className="text-[11px] font-medium tracking-[0.12em] uppercase text-white/55">Question {i + 1}</div>
                  <div className="font-extrabold text-[72px] text-magenta/40 leading-none -mt-2">?</div>
                  <div className="text-[17px] font-semibold leading-[1.2]">{s.name}</div>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] bg-cover bg-center border border-magenta flex flex-col justify-end"
                  style={{ backgroundImage: `url('${s.img}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  <div className="relative p-4 text-white">
                    <span className="inline-flex bg-magenta text-white rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.08em] mb-2">{s.badge}</span>
                    <div className="text-[11px] text-white/70 mb-1">{s.source}</div>
                    <h4 className="text-[16px] font-bold m-0 mb-2 leading-[1.2]">{s.title}</h4>
                    <p className="text-[12px] text-white/85 leading-[1.45] m-0">{s.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 4 — ESOC + agencies + ISS flags
 * ────────────────────────────────────────────────────────*/
const AGENCIES = [
  { name: 'ESA', flag: 'eu', desc: '22 États membres. Ariane, Copernicus, Galileo, James Webb.' },
  { name: 'NASA', flag: 'us', desc: 'Artemis, James Webb, Perseverance, ISS.' },
  { name: 'JAXA', flag: 'jp', desc: 'Module Kibô, Hayabusa, lanceur H3.' },
  { name: 'Roscosmos', flag: 'ru', desc: 'Soyouz, Progress, segment russe de l\'ISS.' },
];

const ISS_FLAGS: { code: string; name: string }[] = [
  { code: 'us', name: 'États-Unis' }, { code: 'ru', name: 'Russie' }, { code: 'jp', name: 'Japon' },
  { code: 'de', name: 'Allemagne' }, { code: 'fr', name: 'France' }, { code: 'ca', name: 'Canada' },
  { code: 'it', name: 'Italie' }, { code: 'gb', name: 'Royaume-Uni' }, { code: 'nl', name: 'Pays-Bas' },
  { code: 'be', name: 'Belgique' }, { code: 'se', name: 'Suède' }, { code: 'dk', name: 'Danemark' },
  { code: 'es', name: 'Espagne' }, { code: 'ch', name: 'Suisse' }, { code: 'br', name: 'Brésil' },
  { code: 'kz', name: 'Kazakhstan' }, { code: 'ua', name: 'Ukraine' }, { code: 'sa', name: 'Arabie saoudite' },
  { code: 'ae', name: 'Émirats arabes unis' }, { code: 'kr', name: 'Corée du Sud' }, { code: 'no', name: 'Norvège' },
];

function OpsBlock() {
  const [hovered, setHovered] = useState<string>('');
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6">
        <div
          className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black bg-cover bg-center relative"
          style={{ backgroundImage: "url('https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2012/06/main_control_room_at_esa_s_space_operations_centre/11252253-2-eng-GB/Main_Control_Room_at_ESA_s_Space_Operations_Centre_pillars.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6">
            <span className="inline-block bg-magenta text-white text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded mb-2">ESOC · Darmstadt</span>
            <h3 className="text-[22px] font-semibold m-0 mb-1.5">European Space Operations Centre</h3>
            <p className="text-[12.5px] text-white/80 m-0 leading-[1.4]">Centre d'excellence européen pour les opérations de mission. Plus de 60 satellites pilotés depuis sa création.</p>
            <p className="text-[10.5px] italic text-white/45 m-0 mt-2">Image : ESA / ESOC, 2012</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <StatRow v="20+" k="missions ESA contrôlées en parallèle" />
          <StatRow v="24/7" k="opérations en continu, jour et nuit" />
          <StatRow v="900+" k="experts sur site, à Darmstadt" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
        {AGENCIES.map(a => (
          <div key={a.name} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:border-magenta hover:bg-magenta/[0.06] hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-2.5">
              <img src={`https://flagcdn.com/w40/${a.flag}.png`} alt="" width={28} height={20} className="rounded-sm object-cover" />
              <strong className="text-[18px] font-bold">{a.name}</strong>
            </div>
            <p className="text-[12px] text-white/65 leading-[1.45] m-0">{a.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-baseline justify-between gap-4 mb-1.5">
          <h4 className="text-[17px] font-semibold m-0">La Station spatiale internationale</h4>
          <small className="text-[12px] text-white/55">270 astronautes, 21 nationalités, depuis 1998</small>
        </div>
        <p className="text-[13px] text-white/70 m-0 mb-4">Survole les drapeaux pour découvrir qui a séjourné à bord.</p>
        <div className="flex flex-wrap gap-2">
          {ISS_FLAGS.map(f => (
            <img
              key={f.code}
              src={`https://flagcdn.com/w40/${f.code}.png`}
              alt={f.name}
              title={f.name}
              width={32}
              height={24}
              className="rounded-sm object-cover opacity-85 hover:opacity-100 hover:scale-[1.18] transition-all"
              onMouseEnter={() => setHovered(f.name)}
              onMouseLeave={() => setHovered('')}
            />
          ))}
        </div>
        <div className="mt-3 text-[12px] font-medium text-magenta tracking-[0.04em] min-h-[18px]">{hovered || '\u00A0'}</div>
      </div>
    </div>
  );
}

function StatRow({ v, k }: { v: string; k: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-baseline justify-between gap-4">
      <span className="text-[40px] font-bold text-magenta leading-none tracking-[-0.02em]">{v}</span>
      <span className="text-[12px] text-white/70 text-right leading-[1.4]">{k}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 5 — Quiz
 * ────────────────────────────────────────────────────────*/
const QUESTIONS = [
  {
    q: "Combien de satellites utilises-tu au cours d'une journée, en moyenne ?",
    options: [
      { t: 'Aucun, je ne suis pas astronaute', ok: false },
      { t: 'Entre 2 et 4', ok: false },
      { t: 'Au moins 8, souvent bien plus', ok: true },
      { t: 'Exactement 1, mon téléphone', ok: false },
    ],
    e: "Sans t'en rendre compte, tu utilises des dizaines de satellites chaque jour. Au moins 4 satellites GPS te localisent en permanence. Tes appels et internet passent par des satellites télécom. La météo, les bulletins routiers, et même les champs qui produisent ta nourriture sont suivis depuis l'espace.",
  },
  {
    q: 'Quel programme spatial européen fournit des données environnementales en accès libre à tous ?',
    options: [
      { t: 'Ariane 6', ok: false },
      { t: 'Copernicus', ok: true },
      { t: 'Artemis', ok: false },
      { t: 'Hubble', ok: false },
    ],
    e: "Copernicus est le programme européen d'observation de la Terre. Ses données sont entièrement ouvertes et gratuites. Forêts, fonte des glaces, qualité de l'air, agriculture, urbanisme : tout passe par Copernicus.",
  },
  {
    q: 'Parmi ces secteurs, lequel utilise les données Copernicus ?',
    options: [
      { t: 'Uniquement les agences spatiales', ok: false },
      { t: 'Uniquement les météorologues', ok: false },
      { t: "Agriculture, pêche, assurances, qualité de l'air", ok: true },
      { t: 'Uniquement les gouvernements européens', ok: false },
    ],
    e: "Plus de 80 % des bénéfices économiques de Copernicus sont générés en dehors du secteur spatial. Agriculteurs, assureurs, pêcheurs, autorités sanitaires : tout le monde utilise ces données ouvertes.",
  },
  {
    q: 'Quelle est la taille de la plus grande antenne au sol utilisée pour les télécommunications spatiales ?',
    options: [
      { t: '10 mètres', ok: false },
      { t: '34 mètres', ok: false },
      { t: '70 mètres', ok: true },
      { t: '120 mètres', ok: false },
    ],
    e: "L'antenne de 70 mètres de Goldstone, en Californie, fait partie du Deep Space Network de la NASA. Plus large qu'un terrain de football. Elle capte des signaux émis par des sondes situées à des milliards de kilomètres.",
  },
];

function Quiz({ onDone, initial }: { onDone: (score: number) => void; initial: number | null }) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(QUESTIONS.map(() => null));
  const [chosen, setChosen] = useState<number | null>(null);
  const [done, setDone] = useState(initial !== null);

  const answer = (i: number) => {
    if (chosen !== null) return;
    const ok = QUESTIONS[step].options[i].ok;
    setChosen(i);
    const next = [...answers]; next[step] = ok; setAnswers(next);
    if (ok) setScore(score + 1);
    setTimeout(() => {
      if (step + 1 < QUESTIONS.length) {
        setStep(step + 1);
        setChosen(null);
      } else {
        setDone(true);
        onDone(score + (ok ? 1 : 0));
      }
    }, 2200);
  };

  if (done) {
    const finalScore = initial !== null ? initial : score;
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <Trophy className="w-14 h-14 text-magenta mx-auto mb-4" />
        <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-magenta mb-2">Quiz terminé</div>
        <div className="text-[36px] font-bold mb-2">
          {finalScore} <span className="text-white/40">/ 4</span>
        </div>
        <p className="text-white/65 max-w-md mx-auto m-0">
          {finalScore >= 3 ? "Excellent. Tu as bien suivi." : finalScore >= 2 ? "Bien joué. Tu peux encore relire certains chapitres." : "Pas grave, le but est d'apprendre. Tu peux revenir aux chapitres précédents."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-9">
      <div className="flex items-center justify-between mb-6 text-[12px] font-semibold tracking-[0.14em] uppercase text-white/60">
        <span>Question <span className="text-magenta">{step + 1}</span> sur {QUESTIONS.length}</span>
        <span className="inline-flex gap-1.5 items-center">
          {answers.map((a, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full transition ${a === true ? 'bg-magenta' : a === false ? 'bg-white/30' : 'bg-white/10'}`} />
          ))}
        </span>
      </div>
      <p className="text-[22px] font-semibold leading-[1.3] m-0 mb-5">{QUESTIONS[step].q}</p>
      <div className="flex flex-col gap-2.5">
        {QUESTIONS[step].options.map((o, i) => {
          const isChosen = chosen === i;
          const showCorrect = chosen !== null && o.ok;
          const showIncorrect = isChosen && !o.ok;
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              disabled={chosen !== null}
              className={
                'rounded-xl px-5 py-4 text-[14.5px] font-medium text-left flex items-center gap-3.5 border transition-all ' +
                (showCorrect
                  ? 'bg-magenta/15 border-magenta text-white'
                  : showIncorrect
                    ? 'bg-white/[0.04] border-red-400/50 text-white/55'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-magenta')
              }
            >
              <span className={
                'w-6.5 h-6.5 rounded-full grid place-items-center text-[12px] font-bold flex-shrink-0 ' +
                (showCorrect ? 'bg-magenta text-white' : showIncorrect ? 'bg-red-400/30 text-white' : 'bg-white/10 text-white/70')
              } style={{ width: 26, height: 26 }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span>{o.t}</span>
            </button>
          );
        })}
      </div>
      {chosen !== null && (
        <div className="mt-5 px-5 py-4 bg-magenta/[0.06] border border-magenta/25 rounded-xl text-[13.5px] leading-[1.55] text-white/85 animate-[chapterIn_320ms]">
          <div className="font-semibold text-magenta uppercase text-[11px] tracking-[0.1em] mb-1.5">À retenir</div>
          {QUESTIONS[step].e}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 6 — Récap
 * ────────────────────────────────────────────────────────*/
function Recap({ satellites, flips, quizScore, onContinue, onPrev }: {
  satellites: number; flips: number; quizScore: number;
  onContinue: () => void; onPrev: () => void;
}) {
  return (
    <section className="animate-[chapterIn_480ms_cubic-bezier(.2,0,0,1)]">
      <div className="text-center pt-10">
        <div className="w-24 h-24 mx-auto mb-6 bg-magenta rounded-full grid place-items-center shadow-[0_0_0_6px_rgba(200,37,122,0.18),0_20px_40px_rgba(200,37,122,0.35)]">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="font-display font-bold uppercase tracking-[0.04em] text-[clamp(36px,5vw,56px)] m-0 mb-3">
          Chapitre 1 <span className="text-magenta">terminé.</span>
        </h1>
        <p className="text-[17px] text-white/70 max-w-[560px] mx-auto m-0 mb-9 leading-[1.55]">
          Tu as découvert comment le spatial change ta vie au quotidien, qui pilote les satellites depuis la Terre,
          et comment les nations collaborent dans l'orbite.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left mb-9">
          <RecapStat v={satellites} t="satellites utilisés aujourd'hui" />
          <RecapStat v={flips} t="retombées du spatial découvertes" />
          <RecapStat v={`${quizScore} / 4`} t="réponses correctes au quiz" />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/55">Prochain chapitre</span>
            <span className="text-[22px] font-semibold">Lanceurs et Ariane 6</span>
            <span className="text-[13px] text-white/60">Découvre comment on quitte la Terre, et qui le fait.</span>
          </div>
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-2 bg-magenta text-white rounded-lg px-6 py-4 text-[14px] font-semibold hover:bg-magenta-700 transition"
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
          <ChevronLeft className="w-4 h-4" /> Revenir au quiz
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

/* ─────────────────────────────────────────────────────────
 *  Tailwind utility additions you'll want in `index.css`:
 *
 *  @keyframes chapterIn {
 *    from { opacity: 0; transform: translateY(20px); }
 *    to   { opacity: 1; transform: translateY(0); }
 *  }
 *  @keyframes pulse {
 *    0%   { transform: scale(1); }
 *    40%  { transform: scale(1.12); color: #c8257a; }
 *    100% { transform: scale(1); }
 *  }
 * ────────────────────────────────────────────────────────*/
