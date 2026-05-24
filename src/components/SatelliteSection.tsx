import { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { Quiz } from './Quiz';
import { SatelliteLabelGame } from './SatelliteLabelGame';
import { SatelliteTimeline } from './SatelliteTimeline';
import { SatelliteDistribution } from './SatelliteDistribution';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterShell, ChapterRecap } from './ChapterShell';

const TOTAL_CHAPTERS = 6;

interface SatelliteSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

const orbits = [
  {
    name: 'Orbite Basse (LEO)',
    altitude: '160 – 2 000 km',
    period: '90 – 120 min par tour',
    engineering: "Satellites plus petits et moins coûteux à lancer. Pour assurer une couverture continue, il faut des constellations de dizaines à des milliers de satellites (Starlink : plus de 5 000 unités). La friction atmosphérique résiduelle fait descendre progressivement l'orbite : les satellites doivent embarquer des petits moteurs pour se maintenir et se désorbiter en fin de vie.",
    challenges: "Collision avoidance permanent, gestion des débris spatiaux, renouvellement fréquent de la flotte.",
    funFact: "L'ISS est visible à l'oeil nu ! Elle traverse le ciel en 2 à 5 minutes. Des applications comme Spot The Station (NASA) indiquent exactement où et quand regarder.",
  },
  {
    name: 'Orbite Moyenne (MEO)',
    altitude: '2 000 – 35 786 km',
    period: '2 – 24 heures',
    engineering: "Zone idéale pour la navigation (GPS, Galileo). Un satellite MEO couvre une large zone terrestre. La conception doit résister aux ceintures de radiation de Van Allen — des protections spéciales sont indispensables. Les satellites GPS embarquent des horloges atomiques d'une précision de 1 nanoseconde.",
    challenges: "Radiations Van Allen intenses, coût de lancement plus élevé, orbites encombrées par les débris.",
    funFact: "Les horloges atomiques de Galileo ne se décalent que d'une seconde en 3 millions d'années. Sans cette précision, le GPS aurait une erreur de kilomètres, pas de mètres.",
  },
  {
    name: 'Orbite Géostationnaire (GEO)',
    altitude: '35 786 km exactement',
    period: '24 heures — synchrone avec la Terre',
    engineering: "Un satellite GEO pèse souvent plusieurs tonnes et coûte 300 à 500 millions d'euros. Il doit maintenir sa position précisément grâce à de petits propulseurs tout au long de ses 15 ans de vie. D'un côté du satellite il fait +150 °C, de l'autre -150 °C.",
    challenges: "Orbite très encombrée (moins de 1 800 positions disponibles, régulées par l'ITU), latence de 500 ms pour les signaux.",
    funFact: "Il n'existe qu'UNE SEULE orbite géostationnaire — un anneau de 36 000 km de diamètre. Les positions dessus sont attribuées par un organisme de l'ONU, comme des terrains à construire.",
  },
  {
    name: 'Orbites Polaires & Héliosynchrones',
    altitude: '400 – 1 000 km',
    period: 'Variable selon altitude',
    engineering: "En inclinant l'orbite à ~98°, le satellite survole les pôles et passe au-dessus de chaque point de la Terre une fois par jour. L'orbite héliosynchrone garantit un éclairage constant d'une image à l'autre, essentiel pour comparer des photos prises à des mois d'intervalle.",
    challenges: "Consommation élevée de carburant pour maintien d'orbite, fenêtres de lancement très précises.",
    funFact: "Les satellites Sentinel-2 de Copernicus prennent des images à 10 m de résolution, couvrent l'intégralité des terres émergées tous les 5 jours et produisent 1,6 To de données par jour — en accès libre.",
  },
];

const quizQuestions = [
  {
    id: 'satellite_q1',
    question: "Pourquoi les satellites GPS embarquent-ils des horloges atomiques ultra-précises ?",
    options: [
      { id: 'a', text: "Pour économiser de l'énergie", isCorrect: false },
      { id: 'b', text: "Pour synchroniser les autres satellites", isCorrect: false },
      { id: 'c', text: "Car la localisation GPS repose sur des mesures de temps à la nanoseconde", isCorrect: true },
      { id: 'd', text: "Pour faciliter la communication avec les stations au sol", isCorrect: false },
    ],
    explanation: "Le GPS calcule une position en mesurant le temps que met un signal radio à voyager depuis au moins 4 satellites. À la vitesse de la lumière, 1 nanoseconde d'erreur se traduit par 30 cm d'imprécision au sol.",
  },
  {
    id: 'satellite_q2',
    question: "Combien de débris de plus de 10 cm sont suivis en orbite ?",
    options: [
      { id: 'a', text: "Environ 500", isCorrect: false },
      { id: 'b', text: "Environ 5 000", isCorrect: false },
      { id: 'c', text: "Environ 34 000", isCorrect: true },
      { id: 'd', text: "Environ 200 000", isCorrect: false },
    ],
    explanation: "Plus de 34 000 débris de plus de 10 cm sont suivis en orbite. On estime 900 000 objets de plus d'1 cm et 128 millions de fragments de plus d'1 mm — tous potentiellement létaux à 7 km/s.",
  },
];

export function SatelliteSection({ onComplete, onHome }: SatelliteSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [chapter, setChapter] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [selectedOrbit, setSelectedOrbit] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [missionIdea, setMissionIdea] = useState('');

  useEffect(() => {
    (async () => {
      const r = await getResponses('satellites');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.selectedOrbit) setSelectedOrbit(parseInt(r.selectedOrbit, 10));
      if (r.quizCompleted === 'true') setQuizCompleted(true);
      if (r.mission_idea) setMissionIdea(r.mission_idea);
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('satellites', 'chapter', String(i));
  };

  const handleOrbitSelect = async (i: number) => {
    setSelectedOrbit(i);
    if (hydrated) await saveResponse('satellites', 'selectedOrbit', String(i));
  };

  const handleMissionIdeaChange = async (v: string) => {
    setMissionIdea(v);
    if (hydrated) await saveResponse('satellites', 'mission_idea', v);
  };

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    if (hydrated) await saveResponse('satellites', 'quizCompleted', 'true');
    goTo(5);
  };

  return (
    <SectionCanvas>
      <SectionTopBar label="Session 2 · Chapitre 1 sur 4 · Satellites & Orbites" onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} onGoTo={goTo} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Ch 1 : 70 ans de satellites ── */}
        {chapter === 0 && (
          <ChapterShell
            kicker="01" title="70 ans de satellites"
            titlePrefix="De Spoutnik à aujourd'hui,"
            titleAccent="une révolution en quelques décennies."
            lede="De Spoutnik en 1957 à plus de 7 500 satellites actifs aujourd'hui. Parcours la frise chronologique pour comprendre comment on en est arrivé là."
            onPrev={null} onNext={() => goTo(1)} nextEnabled={true}
            nextLabel="Continue · Anatomie d'un satellite →"
          >
            <SatelliteTimeline />
          </ChapterShell>
        )}

        {/* ── Ch 2 : Anatomie ── */}
        {chapter === 1 && (
          <ChapterShell
            kicker="02" title="Anatomie d'un satellite"
            titlePrefix="Comment est-il construit,"
            titleAccent="et comment survit-il dans l'espace ?"
            lede="Chaque satellite a une mission unique, mais tous partagent la même architecture fondamentale : une plateforme et une charge utile. Identifie ensuite les composants sur le schéma."
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextEnabled={true}
            nextLabel="Continue · Les orbites →"
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-magenta/[0.06] border border-magenta/20 rounded-2xl p-5">
                  <h4 className="font-bold text-magenta mb-3 text-[15px]">La Plateforme (Bus)</h4>
                  <p className="text-[13px] text-white/65 leading-relaxed mb-3">La plateforme fournit toutes les ressources nécessaires au fonctionnement du satellite :</p>
                  <ul className="space-y-1.5">
                    {["Navigation & contrôle d'attitude", "Propulsion (réservoirs + moteurs-fusées)", "Communications avec la Terre", "Gestion thermique (-150 °C à +150 °C)", "Alimentation électrique (batteries)"].map(item => (
                      <li key={item} className="flex items-start gap-2 text-[13px] text-white/75">
                        <span className="text-magenta flex-shrink-0 mt-0.5">·</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-magenta/[0.06] border border-magenta/20 rounded-2xl p-5">
                  <h4 className="font-bold text-magenta mb-3 text-[15px]">La Charge Utile</h4>
                  <p className="text-[13px] text-white/65 leading-relaxed mb-3">La charge utile, c'est le passager à bord — les instruments qui réalisent la vraie mission :</p>
                  <ul className="space-y-1.5">
                    {["Appareil de prise de vue (optique, radar)", "Altimètre (mesure le niveau des océans)", "Télescope (observation de l'Univers)", "Transpondeur de télécommunications", "Horloge atomique (navigation GNSS)"].map(item => (
                      <li key={item} className="flex items-start gap-2 text-[13px] text-white/75">
                        <span className="text-magenta flex-shrink-0 mt-0.5">·</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                <h4 className="font-semibold text-white mb-2 text-[14px]">Panneaux solaires — l'énergie autonome</h4>
                <p className="text-[13px] text-white/65 leading-relaxed">Chaque satellite produit sa propre énergie. Les panneaux de la sonde <strong className="text-white">Juice</strong> (ESA, en route vers Jupiter) font <strong className="text-white">27 m de long</strong> — plus grands qu'un terrain de tennis. À 800 millions de km du Soleil, la lumière est 25 fois plus faible qu'en orbite terrestre.</p>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-center">
                <p className="text-[13px] text-white/55 mb-4">Identifie les composants du satellite ci-dessous :</p>
                <SatelliteLabelGame />
              </div>

              <div className="text-right">
                <a href="https://cnes.fr/dossiers/satellites" target="_blank" rel="noopener noreferrer" className="text-[12px] text-magenta hover:underline">Source : CNES — Dossier Les Satellites ↗</a>
              </div>
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 3 : Les orbites ── */}
        {chapter === 2 && (
          <ChapterShell
            kicker="03" title="Les orbites"
            titlePrefix="Chaque altitude impose ses propres"
            titleAccent="contraintes d'ingénierie."
            lede="Sélectionne une orbite pour voir ses défis techniques spécifiques. La répartition des satellites actifs est visible en bas de page."
            onPrev={() => goTo(1)} onNext={() => goTo(3)} nextEnabled={selectedOrbit !== null}
            nextLabel={selectedOrbit !== null ? "Continue · Débris spatiaux →" : "Sélectionne une orbite d'abord"}
          >
            <div className="space-y-6">
              <div className="space-y-3">
                {orbits.map((orbit, i) => (
                  <div key={i}>
                    <button
                      onClick={() => handleOrbitSelect(i)}
                      className={`w-full p-5 rounded-2xl border text-left transition-all ${
                        selectedOrbit === i
                          ? 'border-magenta bg-magenta/10'
                          : 'border-white/10 bg-white/[0.04] hover:border-magenta/50 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-[17px]">{orbit.name}</h4>
                        <span className="text-[12px] text-magenta font-mono">{orbit.altitude}</span>
                      </div>
                      <p className="text-[12px] text-white/50">Période orbitale : {orbit.period}</p>
                    </button>
                    {selectedOrbit === i && (
                      <div className="mt-3 bg-magenta/[0.06] border border-magenta/25 rounded-2xl p-6 space-y-4 animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)]">
                        <div>
                          <h4 className="font-semibold text-magenta text-[11px] uppercase tracking-[0.12em] mb-2">Contraintes d'ingénierie</h4>
                          <p className="text-white/80 leading-relaxed text-[14px]">{orbit.engineering}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-magenta text-[11px] uppercase tracking-[0.12em] mb-2">Défis principaux</h4>
                          <p className="text-white/80 text-[14px]">{orbit.challenges}</p>
                        </div>
                        <div className="bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4">
                          <p className="text-[13px] text-white/70 leading-[1.55]">{orbit.funFact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-white/45 mb-4">Qui orbite là-haut ?</h3>
                <p className="text-[13px] text-white/55 mb-4">Répartition des 7 500 satellites actifs par usage et par orbite.</p>
                <SatelliteDistribution />
              </div>
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 4 : Débris spatiaux ── */}
        {chapter === 3 && (
          <ChapterShell
            kicker="04" title="Débris spatiaux"
            titlePrefix="Quand l'espace devient"
            titleAccent="une décharge à 28 000 km/h."
            lede="Un satellite est conçu pour 5 à 15 ans. Le facteur limitant n'est généralement pas la panne des instruments, mais l'épuisement du carburant. Ce qui arrive ensuite est devenu un enjeu mondial."
            onPrev={() => goTo(2)} onNext={() => goTo(4)} nextEnabled={true}
            nextLabel="Continue · Quiz →"
          >
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: '34 000', label: 'débris > 10 cm suivis' },
                  { value: '900 000', label: 'objets > 1 cm estimés' },
                  { value: '128 M', label: 'fragments > 1 mm' },
                  { value: '200', label: 'alertes collision/an (CNES)' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-[26px] font-bold text-magenta leading-none">{stat.value}</div>
                    <div className="text-[11px] text-white/45 mt-1.5 leading-tight uppercase tracking-[0.08em]">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-magenta/[0.06] border border-magenta/20 rounded-2xl p-5">
                <h4 className="font-bold text-magenta mb-3 text-[14px]">Le Syndrome de Kessler</h4>
                <p className="text-[13px] text-white/75 leading-relaxed">
                  Théorisé en 1978 par le scientifique NASA Donald Kessler : une collision génère des débris qui provoquent d'autres collisions, en cascade, jusqu'à rendre certaines orbites <strong className="text-white">inutilisables pour des siècles</strong>. Les débris se déplacent à <strong className="text-white">7 à 16 km/s</strong> — 10 fois la vitesse d'une balle de fusil.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-magenta/[0.06] border border-magenta/20 rounded-2xl p-5">
                  <h4 className="font-bold text-magenta mb-2 text-[14px]">LEO — Désorbitation</h4>
                  <p className="text-[13px] text-white/70 leading-relaxed">Les satellites en orbite basse sont guidés vers l'atmosphère où ils se désintègrent. La loi française LOS impose depuis 2024 une rentrée dans un délai de 3× la durée de mission, avec un plafond de 25 ans.</p>
                </div>
                <div className="bg-magenta/[0.06] border border-magenta/20 rounded-2xl p-5">
                  <h4 className="font-bold text-magenta mb-2 text-[14px]">GEO — Orbite cimetière</h4>
                  <p className="text-[13px] text-white/70 leading-relaxed">Les satellites géostationnaires sont poussés ~300 km au-dessus du GEO. Obligatoire : passivation complète (vidage des réservoirs, décharge des batteries) pour éviter les explosions créant des milliers de nouveaux débris.</p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10">
                <div className="px-5 py-3 bg-white/[0.04] border-b border-white/10">
                  <p className="text-[13px] font-semibold">Les éboueurs de l'espace — Active Debris Removal (ADR)</p>
                </div>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/_dFmgoCO1ww"
                    title="C'est pour quand les éboueurs de l'espace ? — CNES"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-[11px] italic text-white/35 px-5 py-3 border-t border-white/10">"C'est pour quand les éboueurs de l'espace ?" — CNES / Prodigima Films, avril 2024 (5 min 33)</p>
              </div>

              <div className="flex flex-wrap justify-end gap-4">
                <a href="https://cnes.fr/dossiers/debris-spatiaux" target="_blank" rel="noopener noreferrer" className="text-[12px] text-magenta hover:underline">Source : CNES — Débris Spatiaux ↗</a>
                <a href="https://cnes.fr/projets/t4sc" target="_blank" rel="noopener noreferrer" className="text-[12px] text-magenta hover:underline">CNES T4SC ↗</a>
              </div>
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 5 : Quiz + Mission ── */}
        {chapter === 4 && !quizCompleted && (
          <ChapterShell
            kicker="05" title="Quiz éclair"
            titlePrefix="Deux questions pour"
            titleAccent="valider le chapitre."
            lede="Une réponse par question. L'objectif, c'est d'apprendre."
            onPrev={() => goTo(3)} onNext={() => {}} nextEnabled={false}
            nextLabel="Réponds aux questions d'abord"
          >
            <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
          </ChapterShell>
        )}

        {chapter === 4 && quizCompleted && (
          <ChapterShell
            kicker="05" title="Imagine ta mission"
            titlePrefix="Si tu devais concevoir un satellite,"
            titleAccent="quelle serait ta mission ?"
            lede="Décris l'orbite que tu choisirais, l'objectif de la mission et les principaux défis d'ingénierie que tu anticiperais."
            onPrev={() => goTo(3)} onNext={() => goTo(5)} nextEnabled={missionIdea.trim().length > 0}
            nextLabel={missionIdea.trim().length > 0 ? "Terminer le chapitre →" : "Décris ta mission d'abord"}
          >
            <div>
              <label className="block text-[13px] font-medium text-white/70 mb-3">
                Quelle orbite choisirais-tu et pourquoi ? Quel problème veux-tu résoudre ?
              </label>
              <textarea
                value={missionIdea}
                onChange={e => handleMissionIdeaChange(e.target.value)}
                placeholder="Décris ta mission spatiale..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 resize-none text-[14px]"
                rows={5}
                maxLength={4000}
              />
            </div>
          </ChapterShell>
        )}

        {/* ── Récap ── */}
        {chapter === 5 && (
          <ChapterRecap
            chapterLabel="Satellites & Orbites"
            summary="Tu as exploré 70 ans d'histoire des satellites, leur anatomie, les différentes orbites et leurs contraintes, le problème des débris spatiaux, et imaginé ta propre mission."
            stats={[
              { v: selectedOrbit !== null ? orbits[selectedOrbit].name : '—', t: 'orbite explorée' },
              { v: quizCompleted ? '2 / 2' : '0 / 2', t: 'questions du quiz' },
            ]}
            nextTitle="Exploration Spatiale"
            nextDesc="James Webb, Artemis, Mars : les grandes missions qui repoussent les frontières."
            onContinue={onComplete}
            onPrev={() => goTo(4)}
          />
        )}
      </div>
    </SectionCanvas>
  );
}
