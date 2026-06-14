import { useEffect, useMemo, useState } from 'react';
import { ISSViewer } from './ISSViewer';
import { ChevronLeft, ChevronRight, CheckCircle, ExternalLink, Rocket, Satellite, Trophy, Users } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { ChapterShell, SectionTopBar, SectionProgress } from './ChapterShell';
import { YouTubeEmbed } from './YouTubeEmbed';

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

const TOTAL_CHAPTERS = 5;

interface ImpactTerrestreSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function ImpactTerrestreSection({ onComplete, onHome }: ImpactTerrestreSectionProps) {
  const { saveResponse, getResponses, session } = useSession();
  const [chapter, setChapter] = useState(0);
  const [satellites, setSatellites] = useState(0);
  const [flipsCount, setFlipsCount] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [linkVisited, setLinkVisited] = useState(false);
  const [docAnswer, setDocAnswer] = useState('');
  const [collaboGame, setCollaboGame] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from supabase — depends on session.id so it waits for auth to resolve
  useEffect(() => {
    if (!session) return;
    (async () => {
      const r = await getResponses('impact_terrestre');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.satellites) setSatellites(parseInt(r.satellites, 10) || 0);
      if (r.flips) setFlipsCount(parseInt(r.flips, 10) || 0);
      if (r.quiz_score) setQuizScore(parseInt(r.quiz_score, 10));
      if (r.link_visited === 'true') setLinkVisited(true);
      if (r.doc_answer) setDocAnswer(r.doc_answer);
      if (r.collabo_game === 'true') setCollaboGame(true);
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

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

  const handleLinkVisit = async () => {
    setLinkVisited(true);
    if (hydrated) await saveResponse('impact_terrestre', 'link_visited', 'true');
  };

  const handleDocAnswer = async (v: string) => {
    setDocAnswer(v);
    if (hydrated) await saveResponse('impact_terrestre', 'doc_answer', v);
  };

  const handleCollaboGame = async () => {
    setCollaboGame(true);
    if (hydrated) await saveResponse('impact_terrestre', 'collabo_game', 'true');
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
        label="Session 1 · Chapitre 1 sur 4 · L'espace au quotidien"
        onHome={onHome}
      />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} />

      {/* Stage */}
      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">
        {chapter === 0 && (
          <ChapterShell
            kicker="01" title="L'espace dans ta vie" titleAccent="chaque instant de ta journée."
            titlePrefix="Le spatial façonne"
            lede="Clique sur chaque moment de ta journée pour voir combien de satellites travaillent pour toi. Puis retourne les cartes : parmi ces 9 inventions, saueras-tu distinguer les vraies retombées spatiales ?"
            onPrev={null} onNext={() => goTo(1)}
            nextEnabled={satellites > 0 && linkVisited && docAnswer.trim().length >= 20 && flipsCount >= TOTAL_CARDS}
            nextLabel={
              satellites === 0
                ? "Explore ta journée d'abord"
                : !linkVisited
                  ? "Consulte le document CNES d'abord"
                  : docAnswer.trim().length < 20
                    ? "Réponds à la question du document"
                    : flipsCount < TOTAL_CARDS
                      ? `Retourne toutes les cartes (${flipsCount}/${TOTAL_CARDS})`
                      : "Continue · Le regard de Copernicus →"
            }
          >
            <div className="flex flex-col gap-10">
              {/* Intro : accroche quotidienne */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { app: 'Google Maps · Waze · Snapchat', detail: 'La géoloc de toutes ces applis repose sur Galileo ou GPS : des dizaines de satellites calculant ta position en moins d\'une seconde.' },
                  { app: 'La météo sur ton téléphone', detail: 'Les prévisions viennent de satellites Meteosat qui photographient l\'Europe toutes les 15 minutes depuis 36 000 km.' },
                  { app: 'YouTube · Twitch · appels vidéo', detail: 'Les vidéos en direct depuis l\'étranger et les appels internationaux transitent par des satellites de télécommunications en orbite.' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.04] border border-white/10 rounded-xl p-5 flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-magenta leading-[1.3]">{item.app}</span>
                    <p className="text-[12.5px] text-white/65 leading-[1.55] m-0">{item.detail}</p>
                  </div>
                ))}
              </div>

              {/* Day counter */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Ta journée</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <DayCounter onComplete={handleSatellites} initial={satellites} />
              </div>

              <div className="h-px bg-white/10" />

              {/* CNES document + question */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Document à consulter</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className={`rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 border transition-all duration-300 ${linkVisited ? 'border-magenta/30 bg-magenta/[0.03]' : 'border-magenta bg-magenta/[0.07]'}`}>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-magenta mb-1">CNES · Dossier officiel</div>
                    <h3 className="text-[17px] font-semibold m-0 mb-2">Les applications des satellites</h3>
                    <p className="text-[13px] text-white/70 m-0 leading-[1.5]">
                      Lis ce dossier avant de continuer. Tu y trouveras des utilisations concrètes des satellites que tu n'aurais pas soupçonnées.
                    </p>
                  </div>
                  <a
                    href="https://cnes.fr/dossiers/applications-satellites"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkVisit}
                    className={`inline-flex items-center gap-2 rounded-lg px-5 py-3.5 text-[14px] font-semibold transition flex-shrink-0 ${
                      linkVisited
                        ? 'bg-white/10 text-white/55 cursor-default'
                        : 'bg-magenta text-white hover:bg-magenta-700'
                    }`}
                  >
                    {linkVisited
                      ? <><CheckCircle className="w-4 h-4" /> Document consulté</>
                      : <><ExternalLink className="w-4 h-4" /> Ouvrir le document</>
                    }
                  </a>
                </div>

                {linkVisited && (
                  <div className="mt-4 flex flex-col gap-3 animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)]">
                    <label className="text-[14px] font-semibold leading-[1.4]">
                      D'après ce document, cite une application des satellites que tu ne connaissais pas avant.
                    </label>
                    <textarea
                      value={docAnswer}
                      onChange={(e) => handleDocAnswer(e.target.value)}
                      placeholder="Décris l'application en quelques phrases…"
                      maxLength={500}
                      rows={3}
                      className="bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white text-[14px] leading-[1.55] focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 resize-none placeholder-white/30 transition"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-white/45">
                        {docAnswer.trim().length >= 20
                          ? 'Réponse enregistrée.'
                          : `Écris au moins 20 caractères (${docAnswer.trim().length}/20).`}
                      </span>
                      <span className="text-[11px] text-white/30">{docAnswer.length}/500</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Spinoff flip cards */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Spatial ou pas ?</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <p className="text-[14px] text-white/65 leading-[1.55] mb-5">
                  Retourne chaque carte. Certaines sont des retombées du spatial, d'autres non. Sauras-tu faire la différence ?
                </p>
                <SpinoffGame initial={flipsCount} onCount={handleFlips} />
              </div>
            </div>
          </ChapterShell>
        )}

        {chapter === 1 && (
          <ChapterShell
            kicker="02" title="Le regard de Copernicus" titleAccent="vu depuis l'orbite."
            titlePrefix="Le climat de la Terre"
            lede="Le programme européen Copernicus met à disposition de tous, gratuitement, des images de la Terre en temps quasi-réel. Quatre satellites Sentinel, les enjeux climatiques qu'ils révèlent, et le métier de ceux qui traitent ces images chaque jour."
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextEnabled={true}
            nextLabel="Continue · Pilotage international →"
          >
            <div className="flex flex-col gap-14">
              <CopernicusCarousel />
              <div className="h-px bg-white/10" />
              <ClimateBlock />
              <div className="h-px bg-white/10" />
              <OceanScientistSpotlight />
            </div>
          </ChapterShell>
        )}

        {chapter === 2 && (
          <ChapterShell
            kicker="03" title="Pilotage international" titleAccent="qui pilotent l'espace."
            titlePrefix="Les équipes invisibles"
            lede="Chaque satellite en orbite est surveillé et commandé depuis la Terre, vingt-quatre heures sur vingt-quatre. Explore les astronautes français qui ont porté cette aventure, puis reconstitue l'équipe internationale de l'ISS."
            onPrev={() => goTo(1)} onNext={() => goTo(3)}
            nextEnabled={collaboGame}
            nextLabel={collaboGame ? "Continue · Quiz éclair →" : "Termine le jeu de collaboration"}
          >
            <OpsBlock onGameComplete={handleCollaboGame} gameCompleted={collaboGame} />
          </ChapterShell>
        )}

        {chapter === 3 && (
          <ChapterShell
            kicker="04" title="Quiz éclair" titleAccent="valider la partie."
            titlePrefix="Six questions pour"
            lede="Une réponse par question. Lis bien l'explication après chaque réponse, puis clique pour avancer. Pas de mauvaise réponse définitive : l'objectif, c'est d'apprendre."
            onPrev={() => goTo(2)} onNext={() => goTo(4)} nextEnabled={quizScore !== null}
            nextLabel={quizScore !== null ? "Termine le chapitre →" : "Réponds à toutes les questions"}
          >
            <Quiz onDone={handleQuizScore} initial={quizScore} />
          </ChapterShell>
        )}

        {chapter === 4 && (
          <Recap
            satellites={satellites}
            flips={flipsCount}
            quizScore={quizScore ?? 0}
            onContinue={onComplete}
            onPrev={() => goTo(3)}
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
    activity: "Tu consultes la météo et les news sur ton téléphone.",
    add: 4,
    reveal: "La météo vient de satellites Meteosat en orbite géostationnaire. Les titres d'actu sont distribués via des satellites télécom : millions d'articles, images et vidéos envoyés en temps réel depuis le monde entier.",
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
    activity: "Les légumes dans ton assiette ont poussé dans des champs pilotés depuis l'orbite.",
    add: 2,
    reveal: "Le programme Copernicus surveille les cultures avec Sentinel-2 : rendement, stress hydrique, risque de gel. Les agriculteurs ajustent irrigation et récolte grâce aux images satellite.",
  },
  {
    moment: '20h00 · Soirée',
    label: 'Tu regardes des vidéos',
    activity: "Streaming, appel vidéo, match en direct. Les données passent par l'orbite.",
    add: 3,
    reveal: "Les constellations télécom (Starlink, Eutelsat, SES) relaient des milliards de gigaoctets chaque jour. Sans elles, pas de streaming ni d'appel vidéo avec quelqu'un à l'autre bout du monde.",
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onComplete(total); }, [total]);

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
 *  Chapter 2 — Copernicus: carousel + climate + career
 * ────────────────────────────────────────────────────────*/
const SLIDES = [
  {
    img: 'https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2016/05/piton_de_la_fournaise/15985095-1-eng-GB/Piton_de_la_Fournaise.jpg',
    tag: 'Sentinel-1 · Île de La Réunion',
    title: 'Le Piton de la Fournaise en éruption',
    desc: "Sentinel-1 voit avec un radar qui traverse les nuages et fonctionne de nuit. Le volcan est cartographié en temps réel pendant chaque éruption pour évaluer la coulée de lave et alerter les habitants.",
    stats: [{ v: '5 j', k: 'Cycle de revisite Sentinel-1' }, { v: '24/7', k: 'Imagerie radar, jour ou nuit' }],
    credit: 'Image : ESA / Copernicus Sentinel-1, 2016',
  },
  {
    img: 'https://eu-space.europa.eu/sites/default/files/styles/wide/public/images/iotd/20240515_PhytoplanktonBlom.webp?itok=1_QEMbSK',
    tag: 'Sentinel-3 · Atlantique Nord',
    title: "La couleur de l'océan révèle le vivant",
    desc: "Sentinel-3 mesure la couleur de la mer pour cartographier le phytoplancton — la base de toute la chaîne alimentaire marine. Ces données alertent sur les zones sans oxygène et les proliférations d'algues.",
    stats: [{ v: '300 m', k: 'Résolution des images Sentinel-3' }, { v: '2×/j', k: 'Couverture océanique mondiale' }],
    credit: 'Image : ESA / Copernicus Sentinel-3, 2020',
  },
  {
    img: 'https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/01/sulphur_dioxide_from_tonga_eruption_spreads_over_australia/23907503-1-eng-GB/Sulphur_dioxide_from_Tonga_eruption_spreads_over_Australia_card_full.jpg',
    tag: 'Sentinel-5P · Janvier 2022',
    title: "Le nuage de soufre de l'éruption de Tonga",
    desc: "Sentinel-5P TROPOMI détecte les gaz invisibles à l'œil nu. Ici, le dioxyde de soufre rejeté par l'éruption volcanique de Tonga se propage au-dessus de l'Australie.",
    stats: [{ v: '7', k: 'Polluants atmosphériques suivis' }, { v: '100 %', k: 'Couverture terrestre quotidienne' }],
    credit: 'Image : ESA / Copernicus Sentinel-5P, 2022',
  },
  {
    img: 'https://www.copernicus.eu/system/files/styles/image_of_the_day/private/2024-12/image_day/20241231_Seine%20river.png?itok=Zg_IUmBQ',
    tag: 'Sentinel-2 · La Seine, France',
    title: "Ta ville vue de l'espace",
    desc: "Copernicus propose chaque jour une image différente de la Terre. Voici la Seine vue par Sentinel-2 en optique multispectrale. Les mêmes images servent à l'agriculture, l'urbanisme et la gestion des inondations.",
    stats: [{ v: '20', k: 'Satellites Sentinel dans la flotte' }, { v: '0 €', k: 'Données gratuites pour tous' }],
    credit: 'Image : ESA / Copernicus Sentinel-2, 2024',
  },
];

function CopernicusCarousel() {
  const [idx, setIdx] = useState(0);
  const n = SLIDES.length;
  const set = (i: number) => setIdx((i + n) % n);

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-white/10 relative bg-black/30">
        {/* translateX is % of the element itself (n×100% wide), so divide by n */}
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${idx * 100 / n}%)`, width: `${n * 100}%` }}
        >
          {SLIDES.map((s, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr]" style={{ width: `${100 / n}%` }}>
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

function ClimateBlock() {
  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Enjeux climatiques</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <p className="text-[14px] text-white/70 leading-[1.65] m-0 max-w-[760px]">
          Le spatial est l'un des rares outils capables de mesurer le changement climatique à l'échelle planétaire et en continu. Sans les satellites, les scientifiques travailleraient à l'aveugle sur les grands équilibres de la Terre.
        </p>
      </div>

      {/* 3 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
          <div className="text-[40px] font-bold text-magenta leading-none tracking-[-0.02em]">+4 mm</div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-white/55 mt-1">par an · hausse du niveau des mers</div>
          <p className="text-[12.5px] text-white/60 leading-[1.55] m-0 mt-1">
            Mesuré en continu depuis 1993 par les satellites altimétriques TOPEX, Jason et aujourd'hui Sentinel-6. Une donnée impossible à obtenir avec des marégraphes seuls.
          </p>
          <span className="text-[10.5px] italic text-white/35 mt-auto pt-2">Source : CNES / Copernicus · 2024</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
          <div className="text-[40px] font-bold text-magenta leading-none tracking-[-0.02em]">-75 %</div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-white/55 mt-1">glace arctique pluriannuelle depuis 1984</div>
          <p className="text-[12.5px] text-white/60 leading-[1.55] m-0 mt-1">
            Sentinel-1 radar cartographie la banquise chaque semaine, même sous les nuages arctiques. C'est la seule façon de suivre la perte de glace permanente dans cette région hostile.
          </p>
          <span className="text-[10.5px] italic text-white/35 mt-auto pt-2">Source : ESA CCI Sea Ice · 2024</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
          <div className="text-[40px] font-bold text-magenta leading-none tracking-[-0.02em]">423 ppm</div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-white/55 mt-1">CO₂ atmosphérique · record 2024</div>
          <p className="text-[12.5px] text-white/60 leading-[1.55] m-0 mt-1">
            Sentinel-5P TROPOMI et les satellites de la série OCO mesurent la concentration de CO₂ partout sur Terre, permettant de localiser les sources d'émissions et de vérifier les engagements des États.
          </p>
          <span className="text-[10.5px] italic text-white/35 mt-auto pt-2">Source : NOAA / Copernicus C3S · 2024</span>
        </div>
      </div>

      {/* Link cards — CNES + gouvernement.fr */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://cnes.fr/scientifiques/sciences-terre-environnement"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white/[0.04] border border-magenta/25 hover:border-magenta rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex bg-magenta/15 text-magenta text-[10px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 py-0.5 mb-2">CNES</span>
              <h4 className="text-[16px] font-semibold m-0 mb-1.5 leading-[1.3]">Terre et Environnement · portail officiel</h4>
              <p className="text-[12.5px] text-white/65 leading-[1.55] m-0">
                Le portail dédié de l'agence spatiale française : missions, données et applications au service du climat, des océans et de l'environnement.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-magenta/60 flex-shrink-0 mt-1 group-hover:text-magenta transition" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-white/35 italic">cnes.fr/scientifiques/sciences-terre-environnement</span>
        </a>

        <a
          href="https://climate.copernicus.eu/"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white/[0.04] border border-white/10 hover:border-magenta rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex bg-white/10 text-white/60 text-[10px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 py-0.5 mb-2">Copernicus C3S</span>
              <h4 className="text-[16px] font-semibold m-0 mb-1.5 leading-[1.3]">Service Changement Climatique</h4>
              <p className="text-[12.5px] text-white/65 leading-[1.55] m-0">
                Les données climatiques officielles de l'Union Européenne : températures, niveau des mers, concentration de CO₂, état de la banquise — toutes librement téléchargeables.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-white/30 flex-shrink-0 mt-1 group-hover:text-magenta transition" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-white/35 italic">climate.copernicus.eu</span>
        </a>

        <a
          href="https://www.ecologie.gouv.fr/sites/default/files/falc/changement_climatique_FALC.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white/[0.04] border border-white/10 hover:border-magenta rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex bg-white/10 text-white/60 text-[10px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 py-0.5 mb-2">Gouvernement · MTECT</span>
              <h4 className="text-[16px] font-semibold m-0 mb-1.5 leading-[1.3]">Politiques publiques · Climat</h4>
              <p className="text-[12.5px] text-white/65 leading-[1.55] m-0">
                Le cadre réglementaire français face au changement climatique : Plan Climat, Stratégie Nationale Bas-Carbone, et comment les données spatiales alimentent les décisions publiques.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-white/30 flex-shrink-0 mt-1 group-hover:text-magenta transition" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-white/35 italic">ecologie.gouv.fr · PDF</span>
        </a>

        <a
          href="https://www.ifremer.fr/fr/ocean-climat"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white/[0.04] border border-white/10 hover:border-magenta rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex bg-white/10 text-white/60 text-[10px] font-bold tracking-[0.1em] uppercase rounded-full px-2.5 py-0.5 mb-2">IFREMER</span>
              <h4 className="text-[16px] font-semibold m-0 mb-1.5 leading-[1.3]">Océan et Climat</h4>
              <p className="text-[12.5px] text-white/65 leading-[1.55] m-0">
                L'Institut Français de Recherche pour l'Exploitation de la Mer : comment les données satellites Sentinel-3 et 6 alimentent la recherche sur les océans et leur rôle dans le climat global.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-white/30 flex-shrink-0 mt-1 group-hover:text-magenta transition" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-white/35 italic">ifremer.fr</span>
        </a>
      </div>
    </div>
  );
}

function OceanScientistSpotlight() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Métier du spatial</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-0 rounded-2xl overflow-hidden border border-magenta/25 bg-white/[0.03]">
        {/* Photo côté gauche */}
        <div className="relative min-h-[280px] bg-black">
          <img
            src="https://dataspace.copernicus.eu/sites/default/files/styles/teaser_mini/public/media/images/2026-02/sentinel-3_sharkbay-australia_truecolor_19012026_clean_2.jpg"
            alt="Shark Bay, Australie — eaux turquoise vues par Sentinel-3"
            className="w-full h-full object-cover"
            style={{ minHeight: 280 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60 md:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:hidden" />
          <span className="absolute bottom-3 left-3 text-[10px] italic text-white/40">Image : Copernicus / Sentinel-3 · Shark Bay, Australie, 2026</span>
        </div>

        {/* Contenu côté droit */}
        <div className="p-8 flex flex-col gap-5">
          <div>
            <span className="inline-flex bg-magenta text-white rounded-full px-3 py-0.5 text-[11px] font-bold tracking-[0.08em] uppercase mb-3">Océanographe satellite</span>
            <h3 className="text-[24px] font-bold leading-[1.15] m-0 mb-2">
              Lire l'océan depuis <span className="text-magenta">l'orbite</span>
            </h3>
            <p className="text-[13.5px] text-white/75 leading-[1.65] m-0">
              L'océanographe satellite traite les images envoyées par des satellites comme Sentinel-3 ou Sentinel-6 pour mesurer la température de surface, la couleur de l'eau, la hauteur des vagues et le niveau de la mer. Ses analyses alimentent les modèles climatiques, la gestion des pêches et la sécurité maritime.
            </p>
          </div>

          {/* Tâches quotidiennes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Traitement d\'images', detail: 'Des logiciels spécialisés corrigent et calibrent les images brutes envoyées par le satellite pour les rendre exploitables.' },
              { label: 'Détection d\'anomalies', detail: 'Repérer les proliférations d\'algues, les zones sans oxygène, les marées noires sur des millions de km² d\'océan.' },
              { label: 'Modélisation', detail: 'Intégrer les données satellite dans des modèles océaniques globaux (MERCATOR OCÉAN) pour prédire les courants.' },
              { label: 'Publication & veille', detail: 'Rédiger des bulletins scientifiques pour les pêcheurs, armateurs, États côtiers et organismes climatiques.' },
            ].map((t, i) => (
              <div key={i} className="bg-white/[0.04] border border-white/8 rounded-xl p-4">
                <div className="text-[12px] font-semibold text-magenta mb-1">{t.label}</div>
                <p className="text-[12px] text-white/60 leading-[1.5] m-0">{t.detail}</p>
              </div>
            ))}
          </div>

          {/* Où travailler */}
          <div>
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-2">Où exercer ce métier</div>
            <div className="flex flex-wrap gap-2">
              {['CNES · Toulouse', 'IFREMER · Brest', 'MERCATOR OCÉAN', 'CLS · Collecte Localisation Satellites', 'ESA · ESRIN', 'Météo-France'].map(org => (
                <span key={org} className="bg-white/[0.06] border border-white/10 rounded-full px-3 py-1 text-[11.5px] font-medium text-white/70">{org}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 3 — Spinoff flip-card game
 * ────────────────────────────────────────────────────────*/
interface CardItem {
  name: string;
  isSpatial: boolean;
  badge: string;
  source?: string;
  title: string;
  desc: string;
  img: string;
}

const SPINOFFS: CardItem[] = [
  { name: 'Matelas à mémoire de forme', isSpatial: true,  badge: 'NASA · 1966',  source: 'Apollo, sièges de capsule',       title: 'Mousse à mémoire de forme',         desc: "Inventée pour absorber les chocs au décollage et protéger les astronautes. Aujourd'hui dans nos matelas, sièges auto, équipements anti-escarres.",                               img: 'https://guideliterie.com/wp-content/uploads/2018/12/matelas-memoire-de-forme.jpeg' },
  { name: 'Velcro',                     isSpatial: true,  badge: 'NASA · 1960s', source: 'Apollo, ISS',                     title: 'Velcro et fixations sans pesanteur', desc: "Aucune vis ne peut être serrée à la main en apesanteur sans s'envoler. Le velcro est devenu indispensable à bord. Puis dans nos chaussures, sacs, matériel médical.", img: 'https://live.staticflickr.com/65535/55180852205_ecf572f1df_c.jpg' },
  { name: 'Capteur photo smartphone',   isSpatial: true,  badge: 'JPL · 1993',   source: 'Sondes interplanétaires',         title: 'Capteur CMOS',                      desc: "Inventé au JPL de la NASA pour les sondes interplanétaires. Cœur de chaque appareil photo de smartphone, des milliards produits chaque année.",                          img: 'https://images.pexels.com/photos/1828109/pexels-photo-1828109.jpeg' },
  { name: 'GPS de ton téléphone',       isSpatial: true,  badge: 'DoD · 1973',   source: '24 satellites en orbite moyenne', title: 'GPS et géolocalisation',             desc: "Conçu par l'armée américaine pour guider missiles et troupes. Ouvert au civil en 1983. L'Europe a depuis développé son propre système, Galileo.",                        img: 'https://images.pexels.com/photos/9966011/pexels-photo-9966011.jpeg' },
  { name: 'Imagerie médicale IRM',      isSpatial: true,  badge: 'NASA · 1970s', source: "Traitement d'image sondes lunaires", title: 'IRM, imagerie médicale',          desc: "Les algorithmes de traitement d'image développés pour les sondes lunaires ont inspiré les premières IRM. Outil de diagnostic le plus puissant de la médecine moderne.", img: 'https://images.pexels.com/photos/7089017/pexels-photo-7089017.jpeg' },
  { name: 'Plaque vitrocéramique',      isSpatial: true,  badge: 'NASA · 1970s', source: 'Bouclier thermique navette',       title: 'Céramiques haute performance',       desc: "Pour résister à 1 600 °C lors de la rentrée atmosphérique. Aujourd'hui dans nos plaques de cuisson, implants dentaires, freins de TGV.",                                  img: 'https://images.pexels.com/photos/8055154/pexels-photo-8055154.jpeg' },
];

const DISTRACTORS: CardItem[] = [
  { name: 'Machine à laver', isSpatial: false, badge: 'Hamilton Smith · 1858', title: 'Pas une invention spatiale', desc: "Inventée par Hamilton Smith en 1858, un siècle avant Spoutnik. Née du besoin de mécaniser les corvées ménagères — aucun lien avec les missions spatiales.",                                                 img: 'https://images.pexels.com/photos/5591581/pexels-photo-5591581.jpeg' },
  { name: 'Réfrigérateur',   isSpatial: false, badge: 'Jacob Perkins · 1834',  title: 'Pas une invention spatiale', desc: "Le premier système de réfrigération mécanique date de 1834, 123 ans avant le lancement de Spoutnik. Jacob Perkins a breveté une machine à compression de vapeur pour conserver les aliments.", img: 'https://images.pexels.com/photos/2343467/pexels-photo-2343467.jpeg' },
  { name: 'Aspirateur',      isSpatial: false, badge: 'H.C. Booth · 1901',     title: 'Pas une invention spatiale', desc: "Hubert Cecil Booth a breveté le premier aspirateur électrique en 1901, 56 ans avant Spoutnik. Né du besoin de nettoyer les wagons de chemin de fer — aucun lien avec les missions spatiales.",             img: 'https://images.pexels.com/photos/38325/vacuum-cleaner-carpet-cleaner-housework-housekeeping-38325.jpeg' },
];

// Fixed interleaved order so distractors are spread across each row of 3
const ALL_CARDS: CardItem[] = [
  SPINOFFS[0], DISTRACTORS[0], SPINOFFS[1],
  SPINOFFS[2], DISTRACTORS[1], SPINOFFS[3],
  SPINOFFS[4], DISTRACTORS[2], SPINOFFS[5],
];
const TOTAL_CARDS = ALL_CARDS.length;

function SpinoffGame({ initial, onCount }: { initial: number; onCount: (n: number) => void }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const count = flipped.size;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onCount(Math.max(count, initial || 0)); }, [count]);

  return (
    <div>
      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 mb-6 flex items-center justify-between gap-6 flex-wrap">
        <div className="text-[14px] text-white/85 leading-[1.5] flex-1 min-w-[280px]">
          Certaines de ces inventions sont des <strong>retombées</strong> (<em>spinoffs</em>) du spatial — nées des missions avant d'entrer dans nos vies. D'autres n'ont rien à voir avec l'espace. Retourne pour découvrir.
        </div>
        <div className="text-[13px] text-white/60 inline-flex items-center gap-2.5">
          <span className="text-[28px] font-bold text-magenta leading-none">{count}</span>
          sur {TOTAL_CARDS} retournées
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ALL_CARDS.map((s, i) => {
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
                {/* Front — même pour toutes les cartes */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden] bg-gradient-to-br from-deepspace-soft to-magenta/20 border border-white/10 hover:border-magenta p-5 flex flex-col justify-between">
                  <div className="text-[11px] font-medium tracking-[0.12em] uppercase text-white/55">Spatial ou pas ?</div>
                  <div className="font-extrabold text-[72px] text-magenta/40 leading-none -mt-2">?</div>
                  <div className="text-[17px] font-semibold leading-[1.2]">{s.name}</div>
                </div>

                {s.isSpatial ? (
                  /* Dos — retombée spatiale (magenta) */
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] bg-cover bg-center border border-magenta flex flex-col justify-end"
                    style={{ backgroundImage: `url('${s.img}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                    <div className="relative p-4 text-white">
                      <span className="inline-flex bg-magenta text-white rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.08em] mb-1.5">{s.badge}</span>
                      {s.source && <div className="text-[11px] text-white/70 mb-1">{s.source}</div>}
                      <h4 className="text-[15px] font-bold m-0 mb-1.5 leading-[1.2]">{s.title}</h4>
                      <p className="text-[11.5px] text-white/85 leading-[1.45] m-0">{s.desc}</p>
                    </div>
                  </div>
                ) : (
                  /* Dos — invention non spatiale (neutre) */
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] bg-cover bg-center border border-white/25 flex flex-col justify-end"
                    style={{ backgroundImage: `url('${s.img}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/10" />
                    <div className="relative p-4 text-white">
                      <span className="inline-flex bg-white/20 text-white/90 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.08em] mb-1.5">{s.badge}</span>
                      <h4 className="text-[15px] font-bold m-0 mb-1.5 leading-[1.2]">{s.title}</h4>
                      <p className="text-[11.5px] text-white/85 leading-[1.45] m-0">{s.desc}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Chapter 3 — astronautes français + jeu collaboration + ESOC
 * ────────────────────────────────────────────────────────*/

const FR_ASTRONAUTS = [
  {
    name: 'Thomas Pesquet',
    role: 'Astronaute ESA · Commandant ISS',
    missions: 'Proxima (2016–2017) · Alpha (2021)',
    videoId: '9r8GCYvLtQ0',
    videoNote: '',
  },
  {
    name: 'Claudie Haigneré',
    role: "Astronaute ESA · 1ʳᵉ Européenne dans l'ISS",
    missions: 'Cassiopée / Mir (1996) · Andromède / ISS (2001)',
    videoId: 'WZjY7a8lukI',
    videoNote: '',
  },
  {
    name: 'Sophie Adenot',
    role: 'Astronaute ESA · Promotion 2022',
    missions: 'Sélectionnée en 2022 · En formation active',
    videoId: 'CMnzsSnUGeE',
    videoNote: '',
  },
];

const ISS_PAIRS = [
  {
    id: 'zarya', module: 'Zarya',
    moduleDesc: 'Premier module lancé en 1998. Structure porteuse initiale de la station.',
    country: 'ru', countryName: 'Russie', agency: 'Roscosmos',
    svgX: 18, svgY: 94, svgW: 82, svgH: 36,
  },
  {
    id: 'destiny', module: 'Laboratoire Destiny',
    moduleDesc: 'Principal laboratoire, lancé en 2001 par la navette Atlantis.',
    country: 'us', countryName: 'États-Unis', agency: 'NASA',
    svgX: 126, svgY: 94, svgW: 96, svgH: 36,
  },
  {
    id: 'canadarm', module: 'Canadarm2',
    moduleDesc: 'Bras robotique de 17 m pour les assemblages et sorties extra-véhiculaires.',
    country: 'ca', countryName: 'Canada', agency: 'ASC',
    svgX: 248, svgY: 46, svgW: 22, svgH: 48,
  },
  {
    id: 'columbus', module: 'Laboratoire Columbus',
    moduleDesc: "Laboratoire scientifique, lancé en 2008 par la navette Atlantis.",
    country: 'eu', countryName: 'Europe', agency: 'ESA',
    svgX: 282, svgY: 64, svgW: 94, svgH: 36,
  },
  {
    id: 'kibo', module: 'Module Kibo',
    moduleDesc: "Le plus grand module de l'ISS. Laboratoire avec sas extérieur.",
    country: 'jp', countryName: 'Japon', agency: 'JAXA',
    svgX: 282, svgY: 130, svgW: 94, svgH: 36,
  },
]
function ISSPlan() {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden mb-6">
      <div className="px-4 pt-4 text-[10px] font-bold tracking-[0.16em] uppercase text-white/30 mb-1">
        Station spatiale internationale · Modèle 3D
      </div>
      <ISSViewer className="w-full h-[480px]" />
      <p className="px-4 pb-3 text-[10.5px] italic text-white/45 m-0">
        Modèle 3D : NASA / Visualization Technology Applications and Development (VTAD), 2019
      </p>
    </div>
  );
}

function CollaboGame({ onComplete, initial }: { onComplete: () => void; initial: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched]   = useState<Set<string>>(new Set());
  const [wrongId, setWrongId]   = useState<string | null>(null);
  const [done, setDone]         = useState(initial);

  const [countries] = useState(() =>
    [...ISS_PAIRS.map(p => ({ code: p.country, name: p.countryName }))]
      .sort(() => Math.random() - 0.5)
  );

  const handleModuleClick = (id: string) => {
    if (matched.has(id)) return;
    setSelected(selected === id ? null : id);
    setWrongId(null);
  };

  const handleCountryClick = (code: string) => {
    if (!selected) return;
    const pair = ISS_PAIRS.find(p => p.id === selected)!;
    if (pair.country === code) {
      const next = new Set(matched);
      next.add(selected);
      setMatched(next);
      setSelected(null);
      if (next.size === ISS_PAIRS.length) { setDone(true); onComplete(); }
    } else {
      setWrongId(selected);
      setSelected(null);
      setTimeout(() => setWrongId(null), 800);
    }
  };

  if (done) {
    return (
      <div className="bg-magenta/[0.06] border border-magenta/25 rounded-2xl p-8 text-center animate-[chapterIn_480ms_cubic-bezier(.2,0,0,1)]">
        <Users className="w-12 h-12 text-magenta mx-auto mb-3" strokeWidth={1.75} />
        <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-magenta mb-2">Jeu terminé</div>
        <p className="text-[17px] font-semibold m-0">Tu as reconstitué l'équipe internationale de l'ISS.</p>
        <p className="text-[13px] text-white/65 m-0 mt-2 max-w-md mx-auto">
          5 pays, 1 station. C'est ça la collaboration spatiale : chacun apporte ce qu'il sait faire le mieux.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ISSPlan />
      <p className="text-[13.5px] text-white/65 mb-5 leading-[1.55]">
        Chaque module a été construit par un pays différent. Clique sur un module, puis sur le drapeau du pays qui l'a construit.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Left — modules */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/40 mb-1">Modules de l'ISS</span>
          {ISS_PAIRS.map(p => {
            const isMatched  = matched.has(p.id);
            const isSelected = selected === p.id;
            const isWrong    = wrongId === p.id;
            if (isMatched) {
              return (
                <div key={p.id} className="rounded-xl px-4 py-3.5 border border-magenta/40 bg-magenta/[0.06] flex items-center justify-between gap-2 animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)]">
                  <div>
                    <div className="text-[14px] font-semibold">{p.module}</div>
                    <div className="text-[12px] text-white/55 mt-0.5 leading-[1.4]">{p.moduleDesc}</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-magenta flex-shrink-0" strokeWidth={1.75} />
                </div>
              );
            }
            return (
              <button
                key={p.id}
                onClick={() => handleModuleClick(p.id)}
                className={
                  'text-left rounded-xl px-4 py-3.5 border transition-all duration-150 ' +
                  (isSelected
                    ? 'bg-magenta/15 border-magenta shadow-[0_0_0_2px_rgba(200,37,122,0.25)]'
                    : isWrong
                      ? 'bg-red-400/10 border-red-400/50'
                      : 'bg-white/[0.04] border-white/10 hover:border-white/30 hover:-translate-y-0.5')
                }
              >
                <div className="text-[14px] font-semibold">{p.module}</div>
                <div className="text-[12px] text-white/55 mt-0.5 leading-[1.4]">{p.moduleDesc}</div>
              </button>
            );
          })}
        </div>

        {/* Right — countries (flag + name only, no agency) */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/40 mb-1">Pays</span>
          {countries.map(c => {
            const isMatched = ISS_PAIRS.some(p => matched.has(p.id) && p.country === c.code);
            return (
              <button
                key={c.code}
                onClick={() => handleCountryClick(c.code)}
                disabled={isMatched || !selected}
                className={
                  'rounded-xl px-4 py-3.5 border transition-all duration-150 ' +
                  (isMatched
                    ? 'bg-magenta/10 border-magenta/40 opacity-55 cursor-default'
                    : selected
                      ? 'bg-white/[0.04] border-white/20 hover:border-magenta hover:bg-magenta/[0.06] hover:-translate-y-0.5 cursor-pointer'
                      : 'bg-white/[0.04] border-white/10 opacity-35 cursor-default')
                }
              >
                <div className="flex items-center gap-3">
                  <img src={`https://flagcdn.com/w40/${c.code}.png`} alt="" width={32} height={24} className="rounded-sm object-cover flex-shrink-0" />
                  <span className="text-[14px] font-semibold flex-1 text-left">{c.name}</span>
                  {isMatched && <CheckCircle className="w-4 h-4 text-magenta flex-shrink-0" strokeWidth={1.75} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-[12px] text-white/45 min-h-[18px]">
        {matched.size > 0
          ? `${matched.size} / ${ISS_PAIRS.length} associations correctes`
          : selected
            ? 'Sélectionne maintenant le drapeau du pays qui a construit ce module.'
            : 'Clique sur un module pour le sélectionner.'}
      </div>
    </div>
  );
}
const AGENCIES = [
  { name: 'ESA', flag: 'eu', desc: '22 États membres. Ariane, Copernicus, Galileo, James Webb.' },
  { name: 'NASA', flag: 'us', desc: 'Artemis, James Webb, Perseverance, ISS.' },
  { name: 'JAXA', flag: 'jp', desc: 'Module Kibô, Hayabusa, lanceur H3.' },
  { name: 'Roscosmos', flag: 'ru', desc: "Soyouz, Progress, segment russe de l'ISS." },
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

function OpsBlock({ onGameComplete, gameCompleted }: { onGameComplete: () => void; gameCompleted: boolean }) {
  const [hovered, setHovered] = useState<string>('');
  return (
    <div className="flex flex-col gap-14">

      <p className="text-[14px] text-white/70 leading-[1.6] max-w-[760px]">
        Un satellite ne se contente pas de voler tout seul : des équipes d'ingénieurs et d'astronautes le surveillent,
        le commandent et l'entretiennent depuis le sol, en permanence. Cette coordination réunit des dizaines de pays
        autour de centres de contrôle, d'agences spatiales et d'une station habitée en continu depuis plus de 25 ans.
      </p>

      {/* French astronaut videos */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Astronautes français</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <p className="text-[13px] text-white/60 leading-[1.55] mb-5 max-w-[760px]">
          Depuis les années 1980, plusieurs astronautes français ont participé à des missions spatiales internationales,
          souvent à bord de la Station spatiale internationale. Voici trois d'entre eux.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FR_ASTRONAUTS.map(a => (
            <div key={a.name} className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
              <div className="aspect-video bg-black/70 relative">
                {a.videoId ? (
                  <YouTubeEmbed videoId={a.videoId} title={`${a.name} — présentation`} nocookie />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
                    <Rocket className="w-9 h-9 text-white/15" strokeWidth={1.5} />
                    <p className="text-[12px] text-white/30 text-center max-w-[220px] leading-[1.5] m-0 px-4">
                      {a.videoNote}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-white/10 flex flex-col gap-1 flex-1">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-magenta">Présentation</span>
                <h4 className="text-[15px] font-bold m-0 leading-[1.2]">{a.name}</h4>
                <p className="text-[12px] text-white/55 m-0 leading-[1.4]">{a.role}</p>
                <p className="text-[11px] text-white/40 m-0 mt-1">{a.missions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* ESOC + agences */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Centre de contrôle</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <p className="text-[13px] text-white/60 leading-[1.55] mb-5 max-w-[760px]">
          Derrière chaque astronaute, des centaines de personnes travaillent au sol pour suivre les satellites et les
          vaisseaux jour et nuit. En Europe, ce travail est centralisé à l'ESOC, où les ingénieurs collaborent avec
          les autres grandes agences spatiales du monde.
        </p>
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
      </div>

      <div className="h-px bg-white/10" />

      {/* Drapeaux ISS */}
      <p className="text-[13px] text-white/60 leading-[1.55] max-w-[760px]">
        Tous ces centres de contrôle convergent vers un même symbole de la coopération spatiale : la Station spatiale
        internationale. Construite et exploitée conjointement par plusieurs agences, elle accueille en permanence des
        équipages venus de différents pays.
      </p>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
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
        <div className="mt-3 text-[12px] font-medium text-magenta tracking-[0.04em] min-h-[18px]">{hovered || ' '}</div>
      </div>

      <div className="h-px bg-white/10" />

      {/* Jeu collaboration */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Jeu · Qui a construit l'ISS ?</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <p className="text-[13px] text-white/60 leading-[1.55] mb-4 max-w-[760px]">
          Chaque module de l'ISS a été conçu, construit puis lancé par un pays différent avant d'être assemblé en
          orbite. À toi de retrouver qui a apporté quoi.
        </p>
        <p className="text-[15px] font-semibold mb-4">La construction de l'ISS est une oeuvre collective.</p>
        <CollaboGame onComplete={onGameComplete} initial={gameCompleted} />
      </div>

      <div className="h-px bg-white/10" />

      {/* ISS spotter */}
      <div className="border border-[1.5px] border-magenta rounded-lg p-5 flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-magenta/10 flex items-center justify-center">
          <Satellite className="w-5 h-5 text-magenta" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-magenta m-0 mb-1">Observer l'ISS depuis chez toi</p>
          <p className="text-[14px] font-semibold m-0 mb-1.5 leading-[1.3]">L'ISS est visible à l'oeil nu, plusieurs fois par semaine.</p>
          <p className="text-[13px] text-white/65 m-0 mb-4 leading-[1.55]">
            Elle apparaît comme un point lumineux qui traverse le ciel en 3 à 6 minutes, plus brillant que n'importe quelle étoile.
            Le site <strong className="text-white/85">Spot the Station</strong> (NASA) indique les prochains passages au-dessus de ta ville, avec l'heure exacte et la direction à regarder.
          </p>
          <a
            href="https://spotthestation.nasa.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-magenta hover:bg-magenta-700 text-white rounded-lg px-5 py-3 text-[13.5px] font-semibold transition-colors duration-150"
          >
            Voir les prochains passages
            <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
          </a>
        </div>
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
    q: "Parmi ces objets du quotidien, lequel a été inventé pour les missions spatiales avant d'arriver dans ta vie ?",
    options: [
      { t: 'Le vélo électrique', ok: false },
      { t: 'La mousse à mémoire de forme', ok: true },
      { t: 'Le réfrigérateur', ok: false },
      { t: 'Le téléphone fixe', ok: false },
    ],
    e: "La mousse à mémoire de forme a été inventée par la NASA en 1966 pour absorber les chocs au décollage. Aujourd'hui dans nos matelas, sièges auto et équipements médicaux. Ces innovations nées du spatial qui entrent dans nos vies s'appellent des retombées — spinoffs.",
  },
  {
    q: "Quelle est la taille de la plus grande antenne de radiotélécommunications du monde ?",
    img: 'https://www.nasa.gov/wp-content/uploads/2020/03/dsn-stadium-final.jpg?resize=900,900',
    imgCredit: 'NASA/JPL-Caltech',
    options: [
      { t: '30 mètres', ok: false },
      { t: '50 mètres', ok: false },
      { t: '70 mètres', ok: true },
      { t: '100 mètres', ok: false },
    ],
    e: "L'antenne DSS-14 à Goldstone (Californie) mesure 70 mètres de diamètre. Appartenant au réseau Deep Space Network (DSN) de la NASA, elle communique avec des sondes aux confins du système solaire, comme Voyager 1 — à plus de 23 milliards de kilomètres de la Terre.",
  },
  {
    q: "Combien d'astronautes français ont voyagé dans l'espace depuis le début de l'exploration spatiale ?",
    options: [
      { t: '4', ok: false },
      { t: '6', ok: false },
      { t: '10', ok: true },
      { t: '15', ok: false },
    ],
    e: "10 Français ont décollé vers l'espace depuis 1982, quand Jean-Loup Chrétien est devenu le premier. Parmi eux : Patrick Baudry, Jean-François Clervoy, Thomas Pesquet — parti en 2016 et 2021. La France est le pays non-américain et non-russe ayant envoyé le plus d'astronautes dans l'espace.",
  },
  {
    q: "À quelle altitude orbite la Station spatiale internationale (ISS) ?",
    options: [
      { t: 'Environ 200 km', ok: false },
      { t: 'Environ 400 km', ok: true },
      { t: 'Environ 800 km', ok: false },
      { t: 'À 36 000 km (géostationnaire)', ok: false },
    ],
    e: "L'ISS se trouve à environ 400 km d'altitude, en orbite basse (LEO). Elle effectue une révolution complète autour de la Terre en 90 minutes, soit 16 orbites par jour, à 27 600 km/h. À cette hauteur, les astronautes voient un lever de soleil toutes les 45 minutes.",
  },
  {
    q: "Quel programme européen met à disposition de tous, gratuitement, des images satellite de la Terre ?",
    options: [
      { t: 'Galileo', ok: false },
      { t: 'Ariane', ok: false },
      { t: 'Copernicus', ok: true },
      { t: 'Starlink', ok: false },
    ],
    e: "Copernicus est le programme d'observation de la Terre de l'Union Européenne, géré par l'ESA. Ses données sont accessibles gratuitement à tous : gouvernements, scientifiques, entreprises, citoyens. Les satellites Sentinel génèrent chaque jour des téraoctets d'images couvrant l'intégralité du globe.",
  },
];

function Quiz({ onDone, initial }: { onDone: (score: number) => void; initial: number | null }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(QUESTIONS.map(() => null));
  const [chosen, setChosen] = useState<number | null>(null);
  const [done, setDone] = useState(initial !== null);

  const answer = (i: number) => {
    if (chosen !== null) return;
    const ok = QUESTIONS[step].options[i].ok;
    setChosen(i);
    const next = [...answers]; next[step] = ok; setAnswers(next);
  };

  const goNext = () => {
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
      setChosen(null);
    } else {
      const finalScore = answers.filter(a => a === true).length;
      setDone(true);
      onDone(finalScore);
    }
  };

  if (done) {
    const finalScore = initial !== null ? initial : answers.filter(a => a === true).length;
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <Trophy className="w-14 h-14 text-magenta mx-auto mb-4" />
        <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-magenta mb-2">Quiz terminé</div>
        <div className="text-[36px] font-bold mb-2">
          {finalScore} <span className="text-white/40">/ {QUESTIONS.length}</span>
        </div>
        <p className="text-white/65 max-w-md mx-auto m-0">
          {finalScore >= QUESTIONS.length
            ? "Parfait. Tu as tout retenu."
            : finalScore >= Math.ceil(QUESTIONS.length / 2)
              ? "Bien joué. Tu en sais plus qu'hier."
              : "Pas grave, le but est d'apprendre. Tu peux revenir aux chapitres précédents."}
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
      {QUESTIONS[step].img && (
        <div className="relative mb-5 rounded-xl overflow-hidden">
          <img
            src={QUESTIONS[step].img}
            alt=""
            className="w-full max-h-56 object-cover"
          />
          <span className="absolute bottom-2 right-3 text-[10.5px] italic text-white/45">
            Image : {QUESTIONS[step].imgCredit}
          </span>
        </div>
      )}
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
        <>
          <div className="mt-5 px-5 py-4 bg-magenta/[0.06] border border-magenta/25 rounded-xl text-[13.5px] leading-[1.55] text-white/85 animate-[chapterIn_320ms]">
            <div className="font-semibold text-magenta uppercase text-[11px] tracking-[0.1em] mb-1.5">À retenir</div>
            {QUESTIONS[step].e}
          </div>
          <div className="mt-4 flex justify-end animate-[chapterIn_320ms]">
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 bg-magenta text-white rounded-lg px-5 py-3.5 text-[14px] font-semibold hover:bg-magenta-700 transition"
            >
              {step + 1 < QUESTIONS.length ? 'Question suivante' : 'Voir les résultats'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
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
          <RecapStat v={flips} t="cartes retournées dans le jeu" />
          <RecapStat v={`${quizScore} / ${QUESTIONS.length}`} t="réponses correctes au quiz" />
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
