import { useState, useEffect } from 'react';
import { Camera, Radio, Layers, Waves, Thermometer, Globe, ExternalLink, Lock, Telescope, Atom, ShieldCheck, Wrench, SatelliteDish, Map } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Quiz } from './Quiz';
import { SatelliteAnatomy } from './SatelliteAnatomy';
import { MosaiqueSatellites } from './MosaiqueSatellites';
import { SatelliteDistribution } from './SatelliteDistribution';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterShell, ChapterRecap, ChapterTimeTracker } from './ChapterShell';
import { YouTubeEmbed } from './YouTubeEmbed';

const TOTAL_CHAPTERS = 7;

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
    funFact: "Un CubeSat 1U mesure exactement 10 × 10 × 10 cm — la taille d'une brique de lait. Des lycéens européens en ont construit et lancé en orbite pour moins de 50 000 €, là où un satellite classique coûte 300 millions.",
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
    engineering: "En inclinant l'orbite à ~98°, le satellite survole les pôles. L'orbite héliosynchrone garantit que le satellite repasse au-dessus d'un même endroit toujours à la même heure solaire locale, assurant ainsi un éclairage identique d'une image à l'autre.",
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
  {
    id: 'satellite_q3',
    question: "À quelle altitude orbite la Station spatiale internationale (ISS) ?",
    options: [
      { id: 'a', text: "Environ 36 000 km", isCorrect: false },
      { id: 'b', text: "Environ 400 km", isCorrect: true },
      { id: 'c', text: "Environ 20 000 km", isCorrect: false },
      { id: 'd', text: "Environ 2 000 km", isCorrect: false },
    ],
    explanation: "L'ISS orbite en LEO à environ 400 km d'altitude, à une vitesse de 7,7 km/s. Elle effectue 15,5 orbites par jour, ce qui explique les multiples levers et couchers de soleil observés depuis le bord.",
  },
  {
    id: 'satellite_q4',
    question: "Pourquoi les satellites géostationnaires (GEO) sont-ils utiles pour la télévision et les télécoms ?",
    options: [
      { id: 'a', text: "Ils couvrent les pôles mieux que les autres orbites", isCorrect: false },
      { id: 'b', text: "Ils ont une meilleure résolution d'image", isCorrect: false },
      { id: 'c', text: "Ils consomment moins d'énergie en orbite haute", isCorrect: false },
      { id: 'd', text: "À 36 000 km, leur période orbitale est de 24 h : ils restent fixes au-dessus d'un même point", isCorrect: true },
    ],
    explanation: "En orbite géostationnaire, le satellite tourne à la même vitesse que la Terre. Il reste fixe au-dessus du même point de l'équateur, ce qui permet de pointer une antenne une seule fois. Trois satellites GEO suffisent à couvrir presque toute la surface terrestre.",
  },
  {
    id: 'satellite_q5',
    question: "Quel instrument peut cartographier les émissions de CO₂ d'une seule centrale à charbon depuis l'espace ?",
    options: [
      { id: 'a', text: "Le spectromètre atmosphérique TROPOMI (Sentinel-5P)", isCorrect: true },
      { id: 'b', text: "L'altimètre radar de Sentinel-6", isCorrect: false },
      { id: 'c', text: "L'imageur optique multispectral de Sentinel-2", isCorrect: false },
      { id: 'd', text: "Le radiomètre thermique de Sentinel-3", isCorrect: false },
    ],
    explanation: "TROPOMI (Sentinel-5P) analyse la lumière solaire réfléchie par l'atmosphère et identifie les empreintes spectrales de CO₂, NO₂, CH₄ et SO₂ avec une résolution de 3,5 × 5,5 km. C'est assez fin pour isoler la plume polluante d'une seule centrale.",
  },
  {
    id: 'satellite_q6',
    question: "Qu'est-ce que le syndrome de Kessler ?",
    options: [
      { id: 'a', text: "Un bug logiciel affectant la synchronisation des horloges GPS", isCorrect: false },
      { id: 'b', text: "Une saturation des fréquences radio utilisées par les satellites", isCorrect: false },
      { id: 'c', text: "Une réaction en chaîne où les collisions de débris génèrent toujours plus de débris, rendant une orbite inutilisable", isCorrect: true },
      { id: 'd', text: "Une panne en cascade des satellites de télécommunications", isCorrect: false },
    ],
    explanation: "Proposé par Donald Kessler en 1978 : au-delà d'une certaine densité d'objets en orbite, chaque collision produit des milliers de fragments qui percutent d'autres satellites, déclenchant une cascade incontrôlable. L'orbite basse concentre déjà la majorité des risques.",
  },
];

const instruments = [
  {
    id: 'optical',
    Icon: Camera,
    name: 'Imageur optique multispectral',
    tagline: 'La photo de la Terre en 13 couleurs',
    detail: "Capte la lumière visible et proche infrarouge en plusieurs bandes spectrales simultanément. Sentinel-2 utilise 13 bandes pour distinguer cultures saines, forêts en stress hydrique, zones inondées et surfaces urbanisées. Résolution : 10 à 60 m selon la bande. Limite principale : inutilisable sous les nuages.",
    example: 'Sentinel-2 (ESA) · MSI — fauchée de 290 km, 12 bits',
    usage: 'Agriculture de précision, gestion des forêts, suivi des catastrophes',
  },
  {
    id: 'sar',
    Icon: Radio,
    name: 'Radar SAR',
    tagline: 'Voit de nuit et à travers les nuages',
    detail: "Le Radar à Synthèse d'Ouverture émet des impulsions micro-ondes et mesure leur écho. Indépendant du soleil et des conditions météo. Grâce à l'interférométrie (InSAR), il détecte des déformations du sol au millimètre : glissements de terrain, subsidences, activité volcanique. Repère aussi les navires et les inondations.",
    example: 'Sentinel-1 (ESA) · C-SAR — bande C, 5,4 GHz',
    usage: "Suivi du sol, détection d'inondations, surveillance maritime",
  },
  {
    id: 'spectrometer',
    Icon: Layers,
    name: 'Spectromètre atmosphérique',
    tagline: "Lire la composition de l'air depuis l'espace",
    detail: "Analyse la lumière solaire traversant ou réfléchie par l'atmosphère. Identifie les empreintes spectrales de chaque molécule : CO₂, NO₂, O₃, CH₄, SO₂. TROPOMI (Sentinel-5P) cartographie la pollution à l'échelle planétaire avec une résolution de 3,5 × 5,5 km et peut isoler la plume d'une seule centrale à charbon.",
    example: 'Sentinel-5P (ESA) · TROPOMI — couverture mondiale quotidienne',
    usage: "Qualité de l'air, suivi des émissions industrielles, bilan carbone",
  },
  {
    id: 'altimeter',
    Icon: Waves,
    name: 'Altimètre radar',
    tagline: 'Mesurer le niveau des mers au centimètre',
    detail: "Émet une impulsion radar vers la surface et mesure le temps de retour. Calcule la hauteur de la mer à 3 cm près depuis 1 300 km d'altitude. Couplé à un modèle de marées, il révèle la montée du niveau des mers (actuellement +3,6 mm/an en moyenne) et suit l'épaisseur de la banquise arctique.",
    example: 'Sentinel-6 Michael Freilich (ESA/NASA) · POSEIDON-4',
    usage: "Niveau des mers, prévision des tempêtes, épaisseur des glaces",
  },
  {
    id: 'radiometer',
    Icon: Thermometer,
    name: 'Radiomètre thermique',
    tagline: 'Prendre la température de la planète',
    detail: "Mesure l'énergie infrarouge émise par la surface terrestre et l'atmosphère. Détermine la température de surface des océans, des terres et des sommets nuageux. Ces données alimentent chaque modèle de prévision météo mondial : Météo-France, ECMWF, NOAA. Sans elles, aucune prévision au-delà de 24 h ne serait fiable.",
    example: 'Sentinel-3 (ESA) · SLSTR — 500 m à 1 km de résolution',
    usage: 'Prévision météo, suivi climatique, température des océans',
  },
  {
    id: 'gravimeter',
    Icon: Globe,
    name: 'Gradiomètre gravitationnel',
    tagline: 'Peser les glaces et les nappes phréatiques',
    detail: "Mesure les infimes variations du champ gravitationnel terrestre (à 10⁻¹⁰ g près). Une variation de gravité révèle un déplacement de masse : fonte des glaces, variation des nappes souterraines, déformation post-sismique. GRACE-FO a montré que le Groenland perd 280 milliards de tonnes de glace par an.",
    example: 'GRACE-FO (NASA/GFZ) · SuperSTAR — accéléromètres différentiels',
    usage: 'Ressources en eau souterraine, fonte des glaces, sismologie',
  },
];

const jobs = [
  {
    id: 'opticien',
    category: 'Conception',
    title: 'Ingénieur·e optronique',
    tagline: 'Concevoir les yeux du satellite',
    description: "Conçoit les télescopes, objectifs et détecteurs embarqués : choisit les matériaux des miroirs (céramique Zerodur, carbure de silicium SiC), calcule les tolérances optiques au nanomètre et simule les performances avant fabrication. Un miroir de satellite doit rester parfait après un lancement à 9 g de vibration puis fonctionner à -100 °C dans le vide pendant 15 ans.",
    skills: ['Optique physique', 'Zemax / Code V', 'Mécanique de précision', 'Bac+5 Physique · Optique'],
    employers: 'Thales Alenia Space · Airbus DS · CNES · CNRS · OHB',
    Icon: Telescope,
  },
  {
    id: 'physicien',
    category: 'Conception',
    title: 'Physicien·ne des instruments',
    tagline: 'Traduire la science en spécifications',
    description: "Traduit les besoins scientifiques (« mesurer le CO₂ à ±1 ppm ») en spécifications d'ingénierie (résolution spectrale, rapport signal/bruit, taux d'échantillonnage). Pilote ensuite la calibration du capteur au sol et en orbite pour garantir que la mesure reste fiable 15 ans après le lancement, même si les détecteurs vieillissent.",
    skills: ['Radiométrie', 'Traitement du signal', 'Python · IDL', 'Doctorat en physique recommandé'],
    employers: 'ESA · CNES · DLR · IPSL · LATMOS · ICARE',
    Icon: Atom,
  },
  {
    id: 'salle_blanche',
    category: 'Fabrication',
    title: 'Technicien·ne salle blanche',
    tagline: "Assembler dans l'air le plus pur au monde",
    description: "Assemble les composants optiques et électroniques dans des salles ISO 5–ISO 7, 1 000 fois plus pures qu'une salle d'opération chirurgicale. Combinaison intégrale, gants doubles, zéro parfum : une seule particule de 1 µm sur un miroir dégrade les mesures. Utilise des microscopes de contrôle et des robots de positionnement à la micron.",
    skills: ['Métrologie', 'Procédures ISO', 'Montage de précision', 'BTS Électronique · DUT Mesures Physiques'],
    employers: 'Safran Electronics · Thales · SODERN · MBDA · sous-traitants aéro',
    Icon: ShieldCheck,
  },
  {
    id: 'integration',
    category: 'Fabrication',
    title: 'Ingénieur·e intégration & test',
    tagline: "Prouver que le satellite survivra au lancement",
    description: "Vérifie que l'instrument survit aux conditions les plus extrêmes avant de quitter la Terre : tests de vibration (simulation du lancement), choc pyrotechnique (séparation d'étage), cycles thermiques en chambre à vide (-150 °C / +150 °C sous 10⁻⁶ mbar). Si quelque chose casse ici, on peut encore réparer. Une fois en orbite, c'est impossible.",
    skills: ['Mécanique vibratoire', 'Thermique spatiale', 'Normes ECSS', 'Bac+5 Génie mécanique · aérospatial'],
    employers: 'ArianeGroup · Airbus DS · CNES · OHB · Thales · Arianespace',
    Icon: Wrench,
  },
  {
    id: 'mission_controller',
    category: 'Exploitation',
    title: 'Contrôleur·se de mission',
    tagline: "Piloter un satellite depuis le sol",
    description: "Pilote les satellites depuis les centres de contrôle (ESOC pour l'ESA à Darmstadt, CNES à Toulouse). Programme les fenêtres d'acquisition, met à jour les paramètres des instruments, gère les anomalies en temps réel. En cas de panne, quelques heures peuvent suffire à sauver ou perdre un satellite à 700 millions d'euros.",
    skills: ['Systèmes satellitaires', 'Télécommunications', 'Gestion d\'anomalies', 'Bac+5 Aérospatial · Télécoms'],
    employers: 'ESA / ESOC · CNES · DLR · Eumetsat · SES · Eutelsat',
    Icon: SatelliteDish,
  },
  {
    id: 'teledetection',
    category: 'Exploitation',
    title: 'Scientifique en télédétection',
    tagline: "Transformer des pixels en connaissance",
    description: "Transforme des paquets de données brutes en cartes exploitables : cartographie d'inondations après une catastrophe, suivi de la déforestation en Amazonie, bilan de la fonte des glaces arctiques. Développe des algorithmes de traitement d'images et de machine learning pour extraire l'information des téraoctets que les satellites produisent chaque jour.",
    skills: ['Python · Google Earth Engine', 'Traitement d\'images', 'Machine learning', 'Bac+5 Géographie · Physique'],
    employers: 'ESA / Copernicus · Météo-France · ONGs · collectivités · start-ups GeoAI',
    Icon: Map,
  },
];

export function SatelliteSection({ onComplete, onHome }: SatelliteSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [chapter, setChapter] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [selectedOrbit, setSelectedOrbit] = useState<number | null>(null);
  const [anatomyGameCompleted, setAnatomyGameCompleted] = useState(false);
  const [mosaicAnswered, setMosaicAnswered] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [missionIdea, setMissionIdea] = useState('');
  const [instrumentsExplored, setInstrumentsExplored] = useState<Set<string>>(new Set());
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [esaLinkVisited, setEsaLinkVisited] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await getResponses('satellites');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.selectedOrbit) setSelectedOrbit(parseInt(r.selectedOrbit, 10));
      if (r.anatomy_game_completed === 'true') setAnatomyGameCompleted(true);
      if (r.quizCompleted === 'true') setQuizCompleted(true);
      if (r.mission_idea) setMissionIdea(r.mission_idea);
      if (r.instruments_explored) setInstrumentsExplored(new Set(r.instruments_explored.split(',')));
      if (r.esa_link_visited === 'true') setEsaLinkVisited(true);
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

  const handleInstrumentOpen = async (id: string) => {
    setSelectedInstrument(prev => prev === id ? null : id);
    if (instrumentsExplored.has(id)) return;
    const next = new Set(instrumentsExplored);
    next.add(id);
    setInstrumentsExplored(next);
    if (hydrated) await saveResponse('satellites', 'instruments_explored', Array.from(next).join(','));
  };

  const handleEsaLinkVisit = async () => {
    setEsaLinkVisited(true);
    if (hydrated) await saveResponse('satellites', 'esa_link_visited', 'true');
  };

  const handleAnatomyGameComplete = async () => {
    setAnatomyGameCompleted(true);
    if (hydrated) await saveResponse('satellites', 'anatomy_game_completed', 'true');
  };

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    if (hydrated) await saveResponse('satellites', 'quizCompleted', 'true');
    goTo(6);
  };

  return (
    <ChapterTimeTracker section="satellites" page={chapter}>
    <SectionCanvas>
      <SectionTopBar label={`Session 2 · Chapitre ${chapter + 1} sur ${TOTAL_CHAPTERS} · Satellites & Orbites`} onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Ch 1 : 70 ans de satellites ── */}
        {chapter === 0 && (
          <ChapterShell
            kicker="01" title="70 ans de satellites"
            titlePrefix="Tout a commencé le 4 octobre 1957 :"
            titleAccent="7 500 satellites au-dessus de ta tête aujourd'hui."
            lede="En 70 ans, l'humanité est passée de zéro à une infrastructure qui conditionne chaque GPS, chaque prévision météo, chaque appel international. Parcours la frise pour voir comment cette révolution silencieuse s'est construite."
            onPrev={null} onNext={() => goTo(1)} nextEnabled={mosaicAnswered >= 10}
            nextLabel={mosaicAnswered >= 10 ? "Continue · Anatomie d'un satellite →" : `Note encore ${10 - mosaicAnswered} moment${10 - mosaicAnswered > 1 ? 's' : ''} pour continuer`}
          >
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { value: '7 500+', label: 'satellites actifs en orbite' },
                { value: '70 ans', label: 'depuis le premier satellite' },
                { value: '80+', label: 'pays opérateurs de satellites' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-[28px] font-bold text-magenta leading-none">{stat.value}</div>
                  <div className="text-[11px] text-white/45 mt-1.5 leading-tight uppercase tracking-[0.08em]">{stat.label}</div>
                </div>
              ))}
            </div>
            <MosaiqueSatellites onAnsweredCount={setMosaicAnswered} />
          </ChapterShell>
        )}

        {/* ── Ch 2 : Anatomie ── */}
        {chapter === 1 && (
          <ChapterShell
            kicker="02" title="Anatomie d'un satellite"
            titlePrefix="Une machine conçue pour fonctionner seule,"
            titleAccent="sans technicien, pendant 15 ans."
            lede="+150 °C d'un côté, -150 °C de l'autre. Radiations. Aucune réparation possible. Voilà ce qu'un satellite doit encaisser. Explore l'architecture qui rend ça possible, puis identifie les composants sur le schéma."
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextEnabled={anatomyGameCompleted}
            nextLabel={anatomyGameCompleted ? "Continue · Les orbites →" : "Complète le mini-jeu d'abord"}
          >
            <SatelliteAnatomy onGameComplete={handleAnatomyGameComplete} />
          </ChapterShell>
        )}

        {/* ── Ch 3 : Les orbites ── */}
        {chapter === 2 && (
          <ChapterShell
            kicker="03" title="Les orbites"
            titlePrefix="Pas n'importe quelle altitude :"
            titleAccent="chaque orbite a ses propres règles d'ingénierie."
            lede="Starlink en LEO pour l'internet. GPS en MEO pour la navigation. La météo et la TV en GEO. Copernicus en héliosynchrone pour les images. Ces choix ne sont pas arbitraires. Sélectionne une orbite pour voir ce que ses ingénieurs doivent résoudre."
            onPrev={() => goTo(1)} onNext={() => goTo(3)} nextEnabled={selectedOrbit !== null}
            nextLabel={selectedOrbit !== null ? "Continue · Instruments de mesure →" : "Sélectionne une orbite d'abord"}
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
                      <div className="mt-3 bg-magenta/[0.06] border border-magenta/25 rounded-2xl overflow-hidden animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)]">
                        <div className="p-6 space-y-4">
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

        {/* ── Ch 5 : Débris spatiaux ── */}
        {chapter === 4 && (
          <ChapterShell
            kicker="05" title="Débris spatiaux"
            titlePrefix="Quand l'espace devient"
            titleAccent="une décharge à 28 000 km/h."
            lede="Un satellite en fin de vie ne disparaît pas. Il reste en orbite pendant des décennies. Deux débris en collision créent des milliers de nouveaux fragments : c'est le Syndrome de Kessler, et c'est un problème que l'humanité doit résoudre maintenant."
            onPrev={() => goTo(3)} onNext={() => goTo(5)} nextEnabled={true}
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
                  <p className="text-[13px] font-semibold">Métier · surveiller les débris depuis le sol</p>
                </div>
                <div className="relative aspect-video bg-black">
                  <YouTubeEmbed videoId="UmrUc1aprB0" title="Quentin — présentation" nocookie />
                </div>
                <p className="text-[11px] italic text-white/35 px-5 py-3 border-t border-white/10">Quentin, ingénieur surveillance de l'espace chez LookUp : comment éviter qu'un satellite ne percute un débris, à coup de radars, de télescopes et de cartographie.</p>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10">
                <div className="px-5 py-3 bg-white/[0.04] border-b border-white/10">
                  <p className="text-[13px] font-semibold">Les éboueurs de l'espace — Active Debris Removal (ADR)</p>
                </div>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <YouTubeEmbed videoId="_dFmgoCO1ww" title="C'est pour quand les éboueurs de l'espace ? — CNES" />
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

        {/* ── Ch 4 : Instruments de mesure ── */}
        {chapter === 3 && (() => {
          const canContinue = instrumentsExplored.size >= 3;
          return (
            <ChapterShell
              kicker="04" title="Instruments de mesure"
              titlePrefix="Un satellite, c'est avant tout"
              titleAccent="une plateforme d'instruments scientifiques."
              lede="Chaque satellite embarque des capteurs spécialisés pour observer la Terre sous un angle précis. Commence par l'outil interactif de l'ESA, puis explore les 6 familles d'instruments."
              onPrev={() => goTo(2)} onNext={() => goTo(4)} nextEnabled={canContinue}
              nextLabel={canContinue ? "Continue · Débris spatiaux →" : "Explore au moins 3 instruments"}
            >
              <div className="space-y-6">

                {/* ESA Visuals featured link */}
                <a
                  href="https://visuals.earth.esa.int/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleEsaLinkVisit}
                  className="group flex items-center gap-5 bg-magenta/[0.10] border-[1.5px] border-magenta rounded-2xl p-5 hover:bg-magenta/[0.18] transition-all"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-magenta flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-magenta font-semibold mb-0.5">Outil interactif ESA · Étape 1</p>
                    <p className="font-bold text-white text-[16px] leading-tight group-hover:underline">visuals.earth.esa.int</p>
                    <p className="text-[13px] text-white/60 mt-1 leading-snug">Visualise en temps réel ce que chaque satellite ESA observe et quels instruments il utilise pour le mesurer.</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-magenta shrink-0 opacity-70 group-hover:opacity-100" strokeWidth={1.75} />
                </a>

                {/* Instrument cards — gated behind ESA tool visit */}
                {!esaLinkVisited ? (
                  <div className="flex flex-col items-center justify-center gap-4 border border-white/10 rounded-2xl p-10 bg-white/[0.02]">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white/30" strokeWidth={1.75} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white/50 text-[15px]">Familles d'instruments</p>
                      <p className="text-[13px] text-white/35 mt-1.5 max-w-[360px] leading-relaxed">
                        Utilise l'outil interactif ESA ci-dessus pour débloquer les 6 familles d'instruments.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)]">
                    <p className="text-[12px] uppercase tracking-[0.12em] text-white/40 font-semibold">
                      Les 6 familles d'instruments · {instrumentsExplored.size}/6 explorés
                    </p>
                    <div className="space-y-2">
                      {instruments.map(inst => {
                        const isOpen = selectedInstrument === inst.id;
                        const seen = instrumentsExplored.has(inst.id);
                        return (
                          <div key={inst.id}>
                            <button
                              onClick={() => handleInstrumentOpen(inst.id)}
                              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                                isOpen
                                  ? 'border-magenta bg-magenta/10'
                                  : 'border-white/10 bg-white/[0.04] hover:border-magenta/50 hover:bg-white/[0.07]'
                              }`}
                            >
                              <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-magenta' : 'bg-white/[0.07]'}`}>
                                <inst.Icon className="w-4.5 h-4.5" strokeWidth={1.75} style={{ width: 18, height: 18 }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-[15px] leading-tight">{inst.name}</h4>
                                  {seen && !isOpen && <span className="text-[10px] text-magenta border border-magenta/40 rounded-full px-2 py-0.5 shrink-0">vu</span>}
                                </div>
                                <p className="text-[12px] text-white/50 mt-0.5">{inst.tagline}</p>
                              </div>
                            </button>
                            {isOpen && (
                              <div className="mt-2 bg-magenta/[0.06] border border-magenta/25 rounded-2xl p-5 space-y-4 animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)]">
                                <p className="text-white/80 leading-relaxed text-[14px]">{inst.detail}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3">
                                    <p className="text-[10.5px] uppercase tracking-[0.1em] text-magenta font-semibold mb-1">Exemple concret</p>
                                    <p className="text-[13px] text-white/75">{inst.example}</p>
                                  </div>
                                  <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3">
                                    <p className="text-[10.5px] uppercase tracking-[0.1em] text-magenta font-semibold mb-1">Applications principales</p>
                                    <p className="text-[13px] text-white/75">{inst.usage}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Jobs section — only visible once instrument families are unlocked */}
                {esaLinkVisited && <div className="border-t border-white/[0.08] pt-8">
                  <div className="mb-6">
                    <span className="bg-magenta text-white rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase">Métiers</span>
                    <h3 className="font-bold text-[20px] mt-3 uppercase tracking-[0.04em]">
                      De la conception à <span className="text-magenta">l'exploitation</span>
                    </h3>
                    <p className="text-white/55 text-[14px] mt-2 max-w-[640px] leading-relaxed">
                      Les instruments embarqués font vivre des filières entières d'ingénierie et de science. Clique sur un métier pour en savoir plus.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(['Conception', 'Fabrication', 'Exploitation'] as const).map(cat => (
                      <div key={cat}>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-magenta font-semibold mb-3 pb-2 border-b border-magenta/20">{cat}</p>
                        <div className="space-y-3">
                          {jobs.filter(j => j.category === cat).map(job => {
                            const isJobOpen = selectedJob === job.id;
                            return (
                              <div key={job.id}>
                                <button
                                  onClick={() => setSelectedJob(isJobOpen ? null : job.id)}
                                  className={`w-full text-left rounded-2xl border overflow-hidden transition-all ${isJobOpen ? 'border-magenta' : 'border-white/10 hover:border-magenta/40'}`}
                                >
                                  <div className="relative h-28 flex items-center justify-center bg-magenta/[0.07] border-b border-white/10">
                                    <job.Icon className="w-9 h-9 text-magenta/70" strokeWidth={1.5} />
                                  </div>
                                  <div className="p-3">
                                    <p className="font-bold text-white text-[14px] leading-tight">{job.title}</p>
                                    <p className="text-[11px] text-white/55 mt-0.5">{job.tagline}</p>
                                  </div>
                                </button>
                                {isJobOpen && (
                                  <div className="mt-1.5 bg-white/[0.04] border border-magenta/25 rounded-2xl p-4 space-y-3 animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)]">
                                    <p className="text-[13px] text-white/78 leading-relaxed">{job.description}</p>
                                    <div>
                                      <p className="text-[10.5px] uppercase tracking-[0.1em] text-magenta font-semibold mb-2">Compétences clés</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {job.skills.map(s => (
                                          <span key={s} className="text-[11px] bg-magenta/10 border border-magenta/20 rounded-full px-2.5 py-0.5 text-magenta/90">{s}</span>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="border-t border-white/[0.07] pt-3">
                                      <p className="text-[10.5px] uppercase tracking-[0.1em] text-white/40 font-semibold mb-1">Employeurs typiques</p>
                                      <p className="text-[12px] text-white/55">{job.employers}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>}

              </div>
            </ChapterShell>
          );
        })()}

        {/* ── Ch 6 : Quiz + Mission ── */}
        {chapter === 5 && !quizCompleted && (
          <ChapterShell
            kicker="06" title="Quiz éclair"
            titlePrefix="Deux questions pour"
            titleAccent="valider le chapitre."
            lede="Une réponse par question. L'objectif, c'est d'apprendre."
            onPrev={() => goTo(4)} onNext={() => {}} nextEnabled={false}
            nextLabel="Réponds aux questions d'abord"
          >
            <Quiz questions={quizQuestions} section="satellites" onComplete={handleQuizComplete} />
          </ChapterShell>
        )}

        {chapter === 5 && quizCompleted && (
          <ChapterShell
            kicker="06" title="Imagine ta mission"
            titlePrefix="Si tu devais concevoir un satellite,"
            titleAccent="quelle serait ta mission ?"
            lede="Décris l'orbite que tu choisirais, l'objectif de la mission et les principaux défis d'ingénierie que tu anticiperais."
            onPrev={() => goTo(4)} onNext={() => goTo(6)} nextEnabled={missionIdea.trim().length > 0}
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
        {chapter === 6 && (
          <ChapterRecap
            chapterLabel="Satellites & Orbites"
            summary="Tu as exploré 70 ans d'histoire des satellites, leur anatomie, les différentes orbites et leurs contraintes, les instruments de mesure, le problème des débris spatiaux, et imaginé ta propre mission."
            stats={[
              { v: selectedOrbit !== null ? orbits[selectedOrbit].name : '—', t: 'orbite explorée' },
              { v: `${instrumentsExplored.size} / 6`, t: 'instruments découverts' },
              { v: quizCompleted ? '6 / 6' : '0 / 6', t: 'questions du quiz' },
            ]}
            nextTitle="Exploration Spatiale"
            nextDesc="James Webb, Artemis, Mars : les grandes missions qui repoussent les frontières."
            onContinue={onComplete}
            onPrev={() => goTo(5)}
          />
        )}
      </div>
    </SectionCanvas>
    </ChapterTimeTracker>
  );
}
