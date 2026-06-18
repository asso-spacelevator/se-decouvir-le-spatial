import { useState, useEffect } from 'react';
import { CheckCircle, ExternalLink, Zap, X, BookOpen } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Quiz } from './Quiz';
import { Ariane6Diagram } from './Ariane6Diagram';
import { MissionSimulator } from './MissionSimulator';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterShell, ChapterRecap, ChapterTimeTracker } from './ChapterShell';
import { YouTubeEmbed } from './YouTubeEmbed';

const TOTAL_CHAPTERS = 8;

interface RocketSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

// ── Speed-sort game ──
const SPEED_ITEMS = [
  {
    id: 0,
    label: 'Avion de ligne',
    subLabel: 'Airbus A320 en croisière',
    value: 900,
    unit: 'km/h',
    context: "Un vol Paris-New York prend ~8 h à cette vitesse. Rapide pour un humain, négligeable pour l'espace.",
    imagePath: 'vitesses/a320.jpg',
    credit: null,
  },
  {
    id: 1,
    label: 'Balle de fusil',
    subLabel: 'carabine haute vélocité',
    value: 3600,
    unit: 'km/h',
    context: "Même une balle est 8 fois trop lente pour rester en orbite. L'espace exige une énergie bien supérieure.",
    imagePath: null,
    credit: null,
  },
  {
    id: 2,
    label: 'Station Spatiale Internationale',
    subLabel: 'orbite basse à 400 km',
    value: 27600,
    unit: 'km/h',
    context: "À cette vitesse, l'ISS fait le tour de la Terre en 92 minutes. C'est la vitesse minimale pour ne pas retomber.",
    imagePath: 'vitesses/iss_image.jpg',
    credit: 'NASA / Expédition 66, Domaine public',
  },
  {
    id: 3,
    label: 'Sonde New Horizons',
    subLabel: 'record de vitesse humaine',
    value: 58000,
    unit: 'km/h',
    context: "Lancée en 2006, New Horizons a atteint Pluton en 9 ans. Elle a quitté le Système solaire et ne reviendra jamais.",
    imagePath: 'vitesses/NewHorizons.jpg',
    credit: 'Johns Hopkins Univ. APL / Southwest Research Institute / NASA, Domaine public',
  },
];
// Fixed display order, deliberately not in ascending order
const SPEED_DISPLAY_ORDER = [2, 0, 3, 1];

// ── True/False game ──
const TRUE_FALSE_ITEMS = [
  {
    id: 0,
    statement: "Chaque outil entrant dans la salle blanche est répertorié et tracé.",
    isTrue: true,
    explication: "Un tournevis oublié peut provoquer un court-circuit ou un déséquilibre mécanique en orbite. La traçabilité est absolue — rien ne rentre sans être enregistré.",
  },
  {
    id: 1,
    statement: "La température peut varier de quelques degrés selon les saisons, c'est toléré.",
    isTrue: false,
    explication: "21 °C et 45 % d'humidité sont maintenus en permanence. Les matériaux de précision se dilatent avec la chaleur et les circuits réagissent aux variations hydriques.",
  },
  {
    id: 2,
    statement: "Les tests acoustiques et vibratoires d'un satellite peuvent durer plusieurs semaines à eux seuls.",
    isTrue: true,
    explication: "À l'ESTEC (Pays-Bas), une campagne complète de tests — vibrations, chocs, vide thermique, compatibilité électromagnétique — peut s'étendre sur 6 à 12 mois. Les seuls tests de vide thermique (TVAC) durent souvent 3 à 6 semaines en continu, 24 h/24.",
  },
  {
    id: 3,
    statement: "Une équipe de 10 à 15 techniciens suffit pour intégrer un grand satellite comme Gaia ou Euclid.",
    isTrue: false,
    explication: "Pour un satellite scientifique de grande envergure, l'équipe complète dépasse généralement 200 personnes : ingénieurs d'intégration, spécialistes système, experts en tests, représentants industriels. Ils ne sont pas tous présents en salle blanche simultanément, mais la coordination mobilise des centaines d'experts.",
  },
  {
    id: 4,
    statement: "L'Europe dispose d'une dizaine de grandes salles blanches capables d'accueillir un satellite de plusieurs tonnes.",
    isTrue: true,
    explication: "On dénombre en Europe une dizaine d'installations majeures : l'ESTEC aux Pays-Bas (deux grandes salles), Airbus à Toulouse et à Bremen, Thales Alenia Space à Cannes et à Rome, OHB à Bremen, IABG à Ottobrunn — auxquelles s'ajoute le Centre Spatial Guyanais à Kourou.",
  },
  {
    id: 5,
    statement: "L'ESTEC, le principal centre d'essais de l'ESA, est situé en Allemagne.",
    isTrue: false,
    explication: "L'ESTEC (European Space Research and Technology Centre) est situé à Noordwijk, aux Pays-Bas. C'est le plus grand établissement de l'ESA avec environ 2 500 personnes sur site. Il abrite les plus grandes chambres de vide thermique et de test acoustique d'Europe : presque tous les satellites européens y passent avant d'être expédiés à Kourou.",
  },
];

// ── Matching game ──
const WORLD_LAUNCHERS = [
  { id: 'ariane6', name: 'Ariane 6', agency: 'ArianeGroup · ESA', country: 'Europe' },
  { id: 'falcon9', name: 'Falcon 9', agency: 'SpaceX', country: 'États-Unis' },
  { id: 'h3', name: 'H3', agency: 'JAXA · Mitsubishi', country: 'Japon' },
  { id: 'vegac', name: 'Vega-C', agency: 'Avio · ESA', country: 'Europe' },
];
const WORLD_DESCRIPTIONS: { id: string; text: string; launcherId: string }[] = [
  { id: 'd_ariane6', text: "Lanceur lourd européen en deux configurations (A62 / A64) ; garantit l'accès autonome de l'Europe à l'espace depuis Kourou en Guyane.", launcherId: 'ariane6' },
  { id: 'd_falcon9', text: "Premier lanceur orbital réutilisable à grande échelle : son premier étage atterrit seul après chaque mission, ce qui a divisé les coûts de lancement par dix.", launcherId: 'falcon9' },
  { id: 'd_h3', text: "Successeur du H-IIA japonais, conçu pour réduire de moitié le coût par lancement et conquérir une part du marché commercial international.", launcherId: 'h3' },
  { id: 'd_vegac', text: "Lanceur léger européen dédié aux microsatellites et aux constellations en orbite basse, opéré depuis le même port spatial qu'Ariane 6.", launcherId: 'vegac' },
];
const DESC_DISPLAY_ORDER = ['d_falcon9', 'd_vegac', 'd_ariane6', 'd_h3'];

// ── Engineering challenges ──
const challenges = [
  {
    name: 'Températures Extrêmes',
    problem: "Les moteurs de lanceur peuvent atteindre 3 000 °C, tandis que l'espace oscille entre -150 °C et +150 °C.",
    solution: "Utilisation de matériaux composites céramiques ultra-résistants et de systèmes de refroidissement actifs avec circulation d'hydrogène liquide.",
    innovation: "Les boucliers thermiques modernes supportent des gradients de 3 000 °C sur quelques centimètres d'épaisseur.",
    comparaison: "Ton four de cuisine monte à 250 °C au maximum. Le moteur Vulcain brûle à 3 000 °C — soit 12 fours superposés. Et il doit tenir ces températures pendant les 8 minutes que dure la montée.",
    funFact: "Le nez d'un lanceur lors de la rentrée atmosphérique chauffe tellement qu'il crée un plasma qui bloque temporairement les communications radio.",
  },
  {
    name: 'Puissance Colossale',
    problem: "Il faut générer plus de 1 000 tonnes de poussée pour vaincre la gravité terrestre.",
    solution: "Moteurs à combustion d'hydrogène et oxygène liquides, brûlant 300 kg de carburant par seconde.",
    innovation: "Un seul moteur Vulcain 2.1 produit une puissance équivalente à 1 500 voitures de F1 combinées.",
    comparaison: "300 kg de carburant brûlés chaque seconde, c'est l'équivalent d'une baignoire entière vidée en flammes toutes les secondes. En 8 minutes de vol, Ariane 6 consomme autant de carburant qu'une voiture en parcourant 800 000 km.",
    funFact: "Si on pouvait canaliser toute la puissance d'un moteur de lanceur dans une ampoule, elle brillerait 190 fois plus fort que le Soleil vu depuis la Terre.",
  },
  {
    name: 'Précision Absolue',
    problem: "Une erreur de 0,1° lors du lancement peut manquer la cible orbitale de milliers de kilomètres.",
    solution: "Systèmes de guidage inertiel couplés au GPS, avec corrections en temps réel toutes les millisecondes.",
    innovation: "Les gyroscopes laser actuels détectent des rotations de l'ordre du milliardième de degré.",
    comparaison: "0,1° d'erreur, c'est comme lancer une fléchette depuis Paris et rater la cible à New York de 400 km — soit l'équivalent de viser New York et atterrir à Boston.",
    funFact: "La précision requise est équivalente à lancer une fléchette depuis Paris et toucher le centre d'une cible à New York.",
  },
  {
    name: 'Légèreté Maximale',
    problem: "Chaque kilogramme de structure en trop réduit la charge utile possible.",
    solution: "Alliages aluminium-lithium et composites carbone ultra-légers, avec optimisation par intelligence artificielle.",
    innovation: "Les nouveaux matériaux permettent un rapport résistance/poids 5 fois supérieur à l'acier.",
    comparaison: "C'est comme préparer ton sac pour un voyage avec un quota de 20 kg : chaque kilo de sac vide économisé te permet d'emporter 100 kg de matériel utile de plus. Chaque gramme gagné sur la structure profite directement au satellite.",
    funFact: "Économiser 1 kg sur la structure d'un lanceur peut permettre de placer 100 kg supplémentaires en orbite.",
  },
  {
    name: 'Vibrations et Acoustique',
    problem: "Au décollage, les moteurs génèrent des vibrations si violentes qu'elles peuvent endommager les satellites embarqués.",
    solution: "Isolation vibratoire par des systèmes amortisseurs et des structures en nid d'abeille pour absorber les chocs.",
    innovation: "Des capteurs piézoélectriques actifs contrent les vibrations en temps réel, comme un casque antibruit géant pour satellite.",
    comparaison: "Un concert de rock c'est environ 110 dB — déjà douloureux. Au décollage, Ariane 6 atteint 165 dB : acoustiquement, c'est 100 000 fois plus intense qu'un concert. À cette puissance, les tympans humains éclateraient en moins d'une seconde.",
    funFact: "La pression acoustique au décollage atteint 165 dB. Sans protection, un satellite se briserait en vol avant même d'atteindre l'atmosphère.",
  },
];

const CLEAN_ROOM_RULES = [
  { rule: 'Électricité statique', detail: "En te frottant sur de la moquette, tu génères ~3 000 V. Un circuit satellite supporte moins de 5 V avant destruction." },
  { rule: 'Combinaison antistatique', detail: "La combinaison, les gants et le bracelet sont conducteurs pour évacuer toute charge vers la terre en permanence." },
  { rule: 'Sas de décontamination', detail: "Douche d'air comprimé à l'entrée : elle chasse les particules accrochées à la combinaison." },
  { rule: 'Traçabilité de chaque outil', detail: "Chaque tournevis et boulon entrant est répertorié. Rien ne doit être oublié à l'intérieur du satellite." },
  { rule: 'Température et humidité fixes', detail: "21 °C, humidité 45 % — les matériaux se dilatent avec la chaleur et l'humidité favorise les courts-circuits." },
  { rule: 'Zéro maquillage ni parfum', detail: "Les substances chimiques volatiles se déposent sur les optiques et capteurs, les rendant inutilisables." },
];


const quizQuestions = [
  {
    id: 'rocket_q1',
    question: 'Quelle est la température maximale que peuvent atteindre les moteurs de lanceur ?',
    options: [
      { id: 'a', text: '500 °C', isCorrect: false },
      { id: 'b', text: '1 500 °C', isCorrect: false },
      { id: 'c', text: '3 000 °C', isCorrect: true },
      { id: 'd', text: '5 000 °C', isCorrect: false },
    ],
    explanation: "Les moteurs de lanceur peuvent atteindre 3 000 °C. Des matériaux composites céramiques et des systèmes de refroidissement actifs sont indispensables.",
  },
  {
    id: 'rocket_q2',
    question: "Combien de pays contribuent à la construction d'Ariane 6 ?",
    options: [
      { id: 'a', text: '2', isCorrect: false },
      { id: 'b', text: '4', isCorrect: false },
      { id: 'c', text: '6', isCorrect: true },
      { id: 'd', text: '12', isCorrect: false },
    ],
    explanation: "Ariane 6 est le fruit de la coopération de 6 nations européennes. Plus de 600 personnes travaillent sur le chantier de construction.",
  },
  {
    id: 'rocket_q3',
    question: "Quel gaz est utilisé comme carburant principal dans le moteur Vulcain d'Ariane 6 ?",
    options: [
      { id: 'a', text: 'Kérosène', isCorrect: false },
      { id: 'b', text: 'Méthane', isCorrect: false },
      { id: 'c', text: 'Hydrogène liquide', isCorrect: true },
      { id: 'd', text: 'Propane', isCorrect: false },
    ],
    explanation: "Le moteur Vulcain brûle de l'hydrogène liquide avec de l'oxygène liquide. C'est l'un des carburants les plus énergétiques disponibles, et sa combustion ne produit que de la vapeur d'eau.",
  },
  {
    id: 'rocket_q4',
    question: "Pourquoi le Centre Spatial Guyanais à Kourou est-il idéal pour les lancements ?",
    options: [
      { id: 'a', text: "Il est proche du pôle Nord, ce qui refroidit les moteurs", isCorrect: false },
      { id: 'b', text: "Sa proximité de l'équateur donne un boost de vitesse grâce à la rotation de la Terre", isCorrect: true },
      { id: 'c', text: "Il est au bord de la mer pour faciliter la récupération des étages", isCorrect: false },
      { id: 'd', text: "Le climat tropical protège les structures des tempêtes", isCorrect: false },
    ],
    explanation: "Proche de l'équateur, Kourou bénéficie de la vitesse de rotation terrestre (environ 460 m/s). Ce bonus gratuit réduit la quantité de carburant nécessaire pour atteindre l'orbite géostationnaire.",
  },
  {
    id: 'rocket_q5',
    question: "Quelle est la principale différence entre Ariane 62 et Ariane 64 ?",
    options: [
      { id: 'a', text: "Ariane 64 est réutilisable, Ariane 62 ne l'est pas", isCorrect: false },
      { id: 'b', text: "Ariane 62 emporte 2 boosters latéraux, Ariane 64 en emporte 4", isCorrect: true },
      { id: 'c', text: "Ariane 64 vole vers la Lune, Ariane 62 reste en orbite basse", isCorrect: false },
      { id: 'd', text: "Ariane 64 utilise de l'hydrogène, Ariane 62 du kérosène", isCorrect: false },
    ],
    explanation: "Le chiffre après «Ariane 6» indique le nombre de boosters à propergol solide P120C. Ariane 62 (2 boosters) cible les orbites basses ou polaires légères ; Ariane 64 (4 boosters) vise les lourdes charges en orbite géostationnaire.",
  },
  {
    id: 'rocket_q6',
    question: "À quelle vitesse un satellite doit-il se déplacer pour rester en orbite basse (LEO) autour de la Terre ?",
    options: [
      { id: 'a', text: "1 000 km/h", isCorrect: false },
      { id: 'b', text: "5 000 km/h", isCorrect: false },
      { id: 'c', text: "11 000 km/h", isCorrect: false },
      { id: 'd', text: "28 000 km/h", isCorrect: true },
    ],
    explanation: "En orbite basse (environ 400 km d'altitude), un satellite file à près de 28 000 km/h, soit 7,7 km par seconde. À cette vitesse, la force centrifuge équilibre exactement l'attraction terrestre.",
  },
];

// ── Resource links helper ──
function ResourceLinks({ title, links }: { title: string; links: { label: string; url: string; desc?: string }[] }) {
  return (
    <div className="mt-6 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-magenta" strokeWidth={1.75} />
        <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/55">{title}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map(({ label, url, desc }) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={desc}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:border-magenta/50 hover:bg-magenta/[0.06] text-[12px] text-white/65 hover:text-white transition-all"
          >
            {label}
            <ExternalLink className="w-3 h-3 opacity-60" strokeWidth={1.75} />
          </a>
        ))}
      </div>
    </div>
  );
}

export function RocketSection({ onComplete, onHome }: RocketSectionProps) {
  const { saveResponse, getResponses, logVideoView } = useSession();
  const [chapter, setChapter] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Ordering game state
  const [orderClicks, setOrderClicks] = useState<number[]>([]);
  const [orderWrongFlash, setOrderWrongFlash] = useState<number | null>(null);

  // True/False game state
  const [tfAnswers, setTfAnswers] = useState<Record<number, boolean | null>>({});

  // Matching game state
  const [selectedLauncher, setSelectedLauncher] = useState<string | null>(null);
  const [worldMatchPairs, setWorldMatchPairs] = useState<Record<string, string>>({});
  const [worldMatchWrong, setWorldMatchWrong] = useState(false);

  // Existing state
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [futureRocketsClicked, setFutureRocketsClicked] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [reflection, setReflection] = useState('');

  // Derived booleans
  const orderComplete = orderClicks.length === SPEED_ITEMS.length;
  const tfComplete = TRUE_FALSE_ITEMS.every(item => item.id in tfAnswers);
  const matchingComplete = WORLD_LAUNCHERS.every(l => l.id in worldMatchPairs);

  useEffect(() => {
    (async () => {
      const r = await getResponses('rockets');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.selectedChallenge) setSelectedChallenge(parseInt(r.selectedChallenge, 10));
      if (r.futureRocketsClicked === 'true') setFutureRocketsClicked(true);
      if (r.quizCompleted === 'true') setQuizCompleted(true);
      if (r.reflection) setReflection(r.reflection);
      if (r.orderClicks) setOrderClicks(JSON.parse(r.orderClicks));
      if (r.tfAnswers) setTfAnswers(JSON.parse(r.tfAnswers));
      if (r.worldMatchPairs) setWorldMatchPairs(JSON.parse(r.worldMatchPairs));
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('rockets', 'chapter', String(i));
  };

  const handleOrderClick = async (phaseId: number) => {
    if (orderClicks.includes(phaseId)) return;
    if (phaseId === orderClicks.length) {
      const next = [...orderClicks, phaseId];
      setOrderClicks(next);
      if (hydrated) await saveResponse('rockets', 'orderClicks', JSON.stringify(next));
    } else {
      setOrderWrongFlash(phaseId);
      setTimeout(() => setOrderWrongFlash(null), 700);
    }
  };

  const handleTfAnswer = async (itemId: number, answer: boolean) => {
    if (itemId in tfAnswers) return;
    const next = { ...tfAnswers, [itemId]: answer };
    setTfAnswers(next);
    if (hydrated) await saveResponse('rockets', 'tfAnswers', JSON.stringify(next));
  };

  const handleLauncherSelect = (launcherId: string) => {
    if (launcherId in worldMatchPairs) return;
    setSelectedLauncher(prev => (prev === launcherId ? null : launcherId));
  };

  const handleDescSelect = async (descId: string, descLauncherId: string) => {
    if (!selectedLauncher) return;
    if (Object.values(worldMatchPairs).includes(descId)) return;
    if (descLauncherId === selectedLauncher) {
      const next = { ...worldMatchPairs, [selectedLauncher]: descId };
      setWorldMatchPairs(next);
      setSelectedLauncher(null);
      if (hydrated) await saveResponse('rockets', 'worldMatchPairs', JSON.stringify(next));
    } else {
      setWorldMatchWrong(true);
      setSelectedLauncher(null);
      setTimeout(() => setWorldMatchWrong(false), 800);
    }
  };

  const handleFutureRocketsClick = async () => {
    setFutureRocketsClicked(true);
    if (hydrated) await saveResponse('rockets', 'futureRocketsClicked', 'true');
  };

  const handleChallengeSelect = async (i: number) => {
    setSelectedChallenge(i);
    if (hydrated) await saveResponse('rockets', 'selectedChallenge', String(i));
  };

  const handleReflectionChange = async (v: string) => {
    setReflection(v);
    if (hydrated) await saveResponse('rockets', 'reflection', v);
  };

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    if (hydrated) await saveResponse('rockets', 'quizCompleted', 'true');
    goTo(7);
  };

  return (
    <ChapterTimeTracker section="rockets" page={chapter}>
    <SectionCanvas>
      <SectionTopBar label="Session 1 · Chapitre 2 sur 4 · Lanceurs et Ariane 6" onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Ch 0 : La fusée pas à pas ── */}
        {chapter === 0 && (
          <ChapterShell
            kicker="01" title="La fusée pas à pas"
            titlePrefix="Comment on envoie un satellite"
            titleAccent="dans l'espace ?"
            lede="Pour placer un satellite en orbite, il faut lui faire atteindre 28 000 km/h — 25 fois la vitesse d'une balle de fusil. La seule machine capable de cela est un lanceur."
            onPrev={null} onNext={() => goTo(1)}
            nextEnabled={orderComplete}
            nextLabel={orderComplete ? "Continue · Ariane 6 décortiquée →" : "Trie les vitesses d'abord"}
          >
            <div className="space-y-6">
              {/* Context card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
                <div className="px-6 pt-6 pb-5 space-y-3 text-white/75 leading-relaxed text-[15px]">
                  <p>Un lanceur fonctionne par <span className="text-white font-semibold">étages</span> : chaque étage brûle son carburant puis se détache pour alléger le reste. Moins de masse à emporter, plus on peut aller vite et haut.</p>
                  <p>Le lanceur doit aussi lutter contre la résistance de l'air dans les premières dizaines de kilomètres, puis contre la gravité terrestre pendant toute la montée. La coiffe protège le satellite le temps de traverser l'atmosphère avant d'être larguée.</p>
                </div>
                <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
                  {[
                    { value: '28 000', unit: 'km/h', label: 'Vitesse orbitale minimale' },
                    { value: '600+', unit: 'personnes', label: 'Sur le chantier de construction' },
                    { value: '6', unit: 'pays', label: 'Contribuent à Ariane 6' },
                  ].map(({ value, unit, label }) => (
                    <div key={label} className="px-5 py-4 text-center">
                      <p className="text-[28px] font-bold text-magenta leading-none">{value} <span className="text-[13px] font-normal text-magenta/70">{unit}</span></p>
                      <p className="text-[11px] text-white/45 mt-1.5 leading-snug uppercase tracking-[0.08em]">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 px-6 py-5">
                  <p className="text-[13px] text-white/55 mb-3">Ariane 6 est le fruit direct de <span className="text-white font-medium">6 nations européennes</span>. Voici comment le travail est réparti :</p>
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <img
                      src="https://www.caia.net/images/upload/135/p033-001.png"
                      alt="Organisation industrielle Ariane 6 — répartition par nation"
                      className="w-full object-contain bg-white"
                    />
                  </div>
                  <p className="text-[10.5px] italic text-white/45 mt-2 mb-4 text-center">Image : ArianeGroup — Organisation industrielle Ariane 6</p>
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    {[
                      { flag: '🇫🇷', country: 'France', pct: 52, role: "Maître d'œuvre · ArianeGroup (Les Mureaux, Évry)" },
                      { flag: '🇩🇪', country: 'Allemagne', pct: 22, role: 'Étage supérieur · ArianeGroup Bremen, MT Aerospace' },
                      { flag: '🇮🇹', country: 'Italie', pct: 15, role: 'Accélérateurs P120C · Avio, Thales Alenia Space' },
                      { flag: '🇪🇸', country: 'Espagne', pct: 4, role: 'Systèmes embarqués · Indra, SENER, GMV' },
                      { flag: '🇧🇪', country: 'Belgique', pct: 4, role: 'Structures · Thales Alenia Space Belgium' },
                      { flag: '🇨🇭', country: 'Suisse', pct: 3, role: 'Coiffes et structures · RUAG Space' },
                    ].map(({ flag, country, pct, role }) => (
                      <div key={country} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.06] last:border-0">
                        <span className="text-xl leading-none w-7 shrink-0">{flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white leading-none mb-0.5">{country}</p>
                          <p className="text-[11px] text-white/45 truncate">{role}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-magenta" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[12px] font-bold text-magenta w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Speed-sort game */}
              <div className="border border-magenta/20 bg-magenta/[0.02] rounded-2xl p-6">
                <div className="mb-5">
                  <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-magenta mb-1.5">Jeu · Tri par vitesse</p>
                  <p className="text-[14px] text-white/70 leading-[1.5]">
                    {orderComplete
                      ? "Bien joué ! La vitesse orbitale est 30 fois celle d'un avion de ligne. Tu peux continuer."
                      : `Clique ces objets du plus lent au plus rapide. Prochain attendu : vitesse n°${orderClicks.length + 1} sur ${SPEED_ITEMS.length}.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {SPEED_DISPLAY_ORDER.map((itemId) => {
                    const item = SPEED_ITEMS[itemId];
                    const clickedIndex = orderClicks.indexOf(itemId);
                    const isClicked = clickedIndex !== -1;
                    const isWrong = orderWrongFlash === itemId;

                    return (
                      <div
                        key={itemId}
                        onClick={isClicked ? undefined : () => handleOrderClick(itemId)}
                        role={isClicked ? undefined : 'button'}
                        className={`rounded-xl border text-left transition-all duration-200 overflow-hidden select-none ${
                          isClicked
                            ? 'border-magenta bg-magenta/10'
                            : isWrong
                              ? 'border-red-500/60 bg-red-500/10 scale-[0.98]'
                              : 'border-white/10 bg-white/[0.04] hover:border-magenta/40 hover:bg-white/[0.07] hover:-translate-y-0.5 cursor-pointer'
                        }`}
                      >
                        {/* Image zone — fixed height so browsers never collapse it */}
                        <div className="relative w-full h-[140px] overflow-hidden bg-black/40">
                          {item.imagePath ? (
                            <img
                              src={`${import.meta.env.BASE_URL}${item.imagePath}`}
                              alt={item.label}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-[11px] text-white/15 uppercase tracking-[0.1em]">—</span>
                            </div>
                          )}
                          {item.credit && isClicked && (
                            <span className="absolute bottom-1.5 right-2 text-[9px] italic text-white/45 bg-black/60 px-1.5 py-0.5 rounded">
                              {item.credit}
                            </span>
                          )}
                        </div>

                        {/* Text zone */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all ${
                              isClicked ? 'bg-magenta text-white' : 'bg-white/10 text-white/35'
                            }`}>
                              {isClicked ? clickedIndex + 1 : '?'}
                            </span>
                            {isWrong && <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" strokeWidth={2} />}
                            {isClicked && (
                              <span className="text-[15px] font-bold text-magenta leading-none">
                                {item.value.toLocaleString('fr-FR')} <span className="text-[11px] font-normal text-magenta/70">{item.unit}</span>
                              </span>
                            )}
                          </div>
                          <p className={`text-[13px] font-semibold leading-snug ${isClicked ? 'text-white' : 'text-white/65'}`}>{item.label}</p>
                          <p className="text-[11px] text-white/35 mt-0.5">{item.subLabel}</p>
                          {isClicked && (
                            <p className="text-[11px] text-white/45 leading-[1.45] mt-2 border-t border-white/10 pt-2">{item.context}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {orderComplete && (
                  <div className="mt-4 flex items-center gap-2 text-[13px] text-magenta font-medium">
                    <CheckCircle className="w-4 h-4" strokeWidth={1.75} /> Classement correct.
                  </div>
                )}
              </div>

            </div>
          </ChapterShell>
        )}

        {/* ── Ch 1 : Ariane 6 décortiquée ── */}
        {chapter === 1 && (
          <ChapterShell
            kicker="02" title="Ariane 6 décortiquée"
            titlePrefix="Anatomie du lanceur,"
            titleAccent="de haut en bas."
            lede="Explore chaque composant d'Ariane 6 : étages, moteurs, coiffe. Clique sur les éléments du diagramme pour en savoir plus."
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextEnabled={true}
            nextLabel="Continue · Les défis de l'ingénieur →"
          >
            <div className="space-y-6">
              <Ariane6Diagram />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Deux configurations",
                    body: "A62 vole avec 2 boosters P120C (charge utile en orbite de transfert géostationnaire : 3,5 t) ; A64 en monte 4 pour les charges lourdes jusqu'à 11,5 t en orbite basse.",
                  },
                  {
                    title: "Moteur Vulcain 2.1",
                    body: "Le moteur principal du premier étage. Il brûle de l'hydrogène liquide refroidi à -252 °C dans une chambre de combustion à 3 000 °C — refroidi par l'hydrogène lui-même.",
                  },
                  {
                    title: "Moteur VINCI — étage supérieur",
                    body: "Seul moteur européen rallumable en orbite. Il permet de déposer plusieurs satellites sur des orbites différentes lors d'une même mission, sans retomber vers la Terre.",
                  },
                ].map(({ title, body }) => (
                  <div key={title} className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
                    <p className="text-[13px] font-semibold text-white mb-2">{title}</p>
                    <p className="text-[12px] text-white/55 leading-[1.55]">{body}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-5">
                <p className="text-[13px] font-semibold text-white mb-2">Les boosters P120C — une coopération unique</p>
                <p className="text-[13px] text-white/65 leading-[1.6]">
                  Les propulseurs à poudre P120C sont partagés entre Ariane 6 et Vega-C. C'est la première fois qu'un composant identique équipe deux lanceurs européens différents — une économie d'échelle industrielle inédite. Chaque P120C contient 145 tonnes de propergol solide et s'allume en même temps que le Vulcain au décollage.
                </p>
              </div>

            </div>
          </ChapterShell>
        )}

        {/* ── Ch 2 : Défis de l'ingénieur ── */}
        {chapter === 2 && (
          <ChapterShell
            kicker="03" title="Les défis de l'ingénieur"
            titlePrefix="Quel problème les équipes ont-elles dû"
            titleAccent="résoudre ?"
            lede="Sélectionne un défi pour découvrir comment les ingénieurs l'ont résolu. Chaque contrainte a généré une innovation qui profite aujourd'hui à d'autres secteurs."
            onPrev={() => goTo(1)} onNext={() => goTo(3)} nextEnabled={selectedChallenge !== null && futureRocketsClicked}
            nextLabel={
              selectedChallenge === null
                ? "Sélectionne un défi d'abord"
                : futureRocketsClicked
                  ? "Continue · Les salles blanches →"
                  : "Consulte l'article sur les fusées de demain"
            }
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => handleChallengeSelect(i)}
                    className={`p-6 rounded-2xl border text-left transition-all ${
                      selectedChallenge === i
                        ? 'border-magenta bg-magenta/10'
                        : 'border-white/10 bg-white/[0.04] hover:border-magenta/50 hover:bg-white/[0.07] hover:-translate-y-0.5'
                    }`}
                  >
                    <h4 className="font-bold text-[17px] mb-2">{c.name}</h4>
                    <p className="text-[13px] text-white/60 leading-[1.5]">{c.problem}</p>
                  </button>
                ))}
              </div>

              {selectedChallenge !== null && (
                <div className="bg-magenta/[0.06] border border-magenta/25 rounded-2xl p-6 space-y-4 animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)]">
                  <div>
                    <h4 className="font-semibold text-magenta text-[11px] uppercase tracking-[0.12em] mb-2">Solution actuelle</h4>
                    <p className="text-white/80 leading-relaxed text-[14px]">{challenges[selectedChallenge].solution}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-magenta text-[11px] uppercase tracking-[0.12em] mb-2">Innovation clé</h4>
                    <p className="text-white/80 leading-relaxed text-[14px]">{challenges[selectedChallenge].innovation}</p>
                  </div>
                  <div className="border border-white/15 bg-white/[0.04] rounded-xl px-5 py-4">
                    <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/40 mb-2">Pour te donner une idée</p>
                    <p className="text-[13px] text-white/80 leading-[1.6] italic">{challenges[selectedChallenge].comparaison}</p>
                  </div>
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4">
                    <p className="text-[13px] text-white/70 leading-[1.55]">{challenges[selectedChallenge].funFact}</p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl overflow-hidden border border-white/10">
                <div className="px-5 py-3 bg-white/[0.04] border-b border-white/10">
                  <p className="text-[13px] font-semibold">Métier · ingénieur structures pour l'hypersonique</p>
                </div>
                <div className="aspect-video bg-black/70 relative">
                  <YouTubeEmbed videoId="kUdCU-x7dKo" title="Allan Petre — présentation" nocookie onView={() => logVideoView('rockets', 'kUdCU-x7dKo', 'Allan Petre — présentation')} />
                </div>
                <p className="text-[11px] italic text-white/35 px-5 py-3 border-t border-white/10">Allan Petre, ingénieur en mécanique des fluides : dimensionner les structures de capsules, lanceurs et satellites pour qu'elles tiennent aux vitesses hypersoniques. Doctorat à l'Imperial College de Londres et passage à la NASA, à San Francisco.</p>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                <h4 className="font-semibold text-white text-[13px] uppercase tracking-[0.1em] mb-3">Pour aller plus loin avec Allan Petre</h4>
                <ul className="space-y-2 text-[13px]">
                  <li>
                    <a href="https://www.imperial.ac.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-magenta hover:underline">
                      Imperial College London — programmes doctoraux en aérodynamique <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.nasa.gov/ames/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-magenta hover:underline">
                      NASA Ames Research Center, San Francisco <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                    </a>
                  </li>
                </ul>
                <a
                  href="https://www.lesechos.fr/industrie-services/air-defense/du-93-a-la-nasa-le-merveilleux-parcours-dallan-petre-raconte-par-linteresse-2031410"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-magenta hover:-translate-y-0.5"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/45 mb-1.5">Les Échos</p>
                  <p className="text-[13px] font-semibold text-white mb-1">
                    Du 9-3 à la Nasa : le merveilleux parcours d'Allan Petre raconté par l'intéressé
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-magenta hover:underline">
                    Lire l'article <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                  </span>
                </a>
              </div>

              <a
                href="https://cnes.fr/dossiers/quoi-ressembleront-fusees-de-demain"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleFutureRocketsClick}
                className={`block rounded-2xl border-[1.5px] p-5 transition hover:-translate-y-0.5 ${
                  futureRocketsClicked ? 'border-white/10 bg-white/[0.04]' : 'border-magenta bg-magenta/[0.06] animate-pulse'
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/45 mb-1.5">CNES</p>
                <p className="text-[14px] font-semibold text-white mb-1">
                  À quoi ressembleront les fusées de demain ?
                </p>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-magenta hover:underline">
                  Lire le dossier <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                </span>
              </a>
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 3 : Salles blanches ── */}
        {chapter === 3 && (
          <ChapterShell
            kicker="04" title="Les salles blanches"
            titlePrefix="Le satellite est assemblé ici,"
            titleAccent="avant le décollage."
            lede="Avant de voir la fusée décoller, chaque satellite a été assemblé dans un endroit très particulier. Plus propre qu'un bloc opératoire, la salle blanche protège les composants de la poussière et de l'électricité statique."
            onPrev={() => goTo(2)} onNext={() => goTo(4)}
            nextEnabled={tfComplete}
            nextLabel={tfComplete ? "Continue · Ariane 6 dans le monde →" : `Réponds aux ${TRUE_FALSE_ITEMS.length} questions`}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { src: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/09/formal_opening_of_estec_s_fv_cleanroom/24451621-1-eng-GB/Formal_opening_of_ESTEC_s_FV_cleanroom.jpg", alt: "Salle blanche ESTEC — ESA" },
                  { src: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2014/01/life_physical_sciences_life_support_laboratory_clean_room/13476523-1-eng-GB/Life_Physical_Sciences_Life_Support_Laboratory_clean_room.jpg", alt: "Technicien en combinaison — ESA" },
                  { src: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2021/10/webb_telescope_in_clean_room_at_europe_s_spaceport3/23733885-2-eng-GB/Webb_telescope_in_clean_room_at_Europe_s_Spaceport.jpg", alt: "James Webb en salle blanche — Kourou" },
                  { src: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/09/esa_s_test_centre_expands/24451576-1-eng-GB/ESA_s_Test_Centre_expands.jpg", alt: "Grande salle blanche ESA" },
                ].map(({ src, alt }) => (
                  <div key={alt} className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/30">
                    <img src={src} alt={alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] italic text-white/35 text-right">Sources : ESA / Airbus Defence & Space</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLEAN_ROOM_RULES.map(({ rule, detail }) => (
                  <div key={rule} className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
                    <p className="text-[13px] font-semibold text-white mb-1">{rule}</p>
                    <p className="text-[12px] text-white/55 leading-[1.5]">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/10 border border-white/10 rounded-2xl overflow-hidden">
                {[
                  { value: '3 000 V', label: "Charge statique d'un frottement ordinaire" },
                  { value: '< 5 V', label: 'Ce que supporte un circuit satellite' },
                  { value: '20×', label: "Plus propre qu'un bloc opératoire" },
                ].map(({ value, label }) => (
                  <div key={label} className="px-5 py-4 text-center">
                    <p className="text-[22px] font-bold text-magenta">{value}</p>
                    <p className="text-[11px] text-white/45 mt-1 uppercase tracking-[0.08em] leading-snug">{label}</p>
                  </div>
                ))}
              </div>

              {/* Visite virtuelle ESTEC */}
              <div className="rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 border border-magenta bg-magenta/[0.07]">
                <div className="flex-1">
                  <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-magenta mb-1">ESA · ESTEC · Noordwijk, Pays-Bas</div>
                  <h3 className="text-[17px] font-semibold m-0 mb-2">Visite virtuelle du centre d'essais</h3>
                  <p className="text-[13px] text-white/70 m-0 leading-[1.5]">
                    Avant de répondre aux questions, explore le centre d'essais de l'ESA. Parcours les salles blanches, les chambres de vide thermique et les bancs d'essais acoustiques : c'est ici que chaque satellite européen est qualifié avant son départ pour Kourou.
                  </p>
                </div>
                <a
                  href="https://esamultimedia.esa.int/multimedia/ESTEC/virtualtour/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-magenta text-white hover:bg-magenta-700 rounded-lg px-5 py-3.5 text-[14px] font-semibold transition flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={1.75} /> Visiter l'ESTEC
                </a>
              </div>

              {/* Rêve d'espace — intégration et tests de Gaia */}
              <div className="rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-white/[0.04] border border-white/10">
                <div className="flex-1">
                  <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-magenta mb-1">Rêve d'espace · Gaia · Airbus DS / ESA</div>
                  <h3 className="text-[17px] font-semibold m-0 mb-2">Intégration et tests de Gaia</h3>
                  <p className="text-[13px] text-white/70 m-0 leading-[1.5]">
                    Suis pas à pas l'intégration du satellite Gaia en salle blanche : découvre comment les équipes Airbus DS ont assemblé ce télescope de précision et l'ont soumis à des tests extrêmes avant son lancement.
                  </p>
                </div>
                <a
                  href="https://reves-d-espace.com/gaia-un-satellite-pour-les-etoiles/les-phases-dintegration-et-de-tests/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/20 hover:border-magenta/60 hover:bg-magenta/[0.08] text-white/80 hover:text-white rounded-lg px-5 py-3.5 text-[14px] font-semibold transition flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={1.75} /> Voir le reportage
                </a>
              </div>

              {/* True/False game */}
              <div className="border border-magenta/20 bg-magenta/[0.02] rounded-2xl p-6">
                <div className="mb-5">
                  <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-magenta mb-1.5">Jeu · Vrai ou Faux</p>
                  <p className="text-[14px] text-white/70">
                    {tfComplete
                      ? "Toutes les questions répondues. Tu peux continuer."
                      : `${Object.keys(tfAnswers).length} / ${TRUE_FALSE_ITEMS.length} questions répondues.`}
                  </p>
                </div>
                <div className="space-y-4">
                  {TRUE_FALSE_ITEMS.map((item) => {
                    const answered = item.id in tfAnswers;
                    const givenAnswer = tfAnswers[item.id];
                    const isCorrect = answered && givenAnswer === item.isTrue;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-4 transition-all ${
                          answered
                            ? isCorrect
                              ? 'border-green-500/30 bg-green-500/[0.06]'
                              : 'border-red-500/30 bg-red-500/[0.06]'
                            : 'border-white/10 bg-white/[0.04]'
                        }`}
                      >
                        <p className="text-[14px] text-white/90 leading-[1.5] mb-3">{item.statement}</p>
                        {!answered ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleTfAnswer(item.id, true)}
                              className="px-4 py-2 rounded-lg border border-white/20 bg-white/[0.04] text-[13px] font-semibold text-white/70 hover:border-magenta/50 hover:bg-magenta/[0.06] hover:text-white transition-all"
                            >
                              Vrai
                            </button>
                            <button
                              onClick={() => handleTfAnswer(item.id, false)}
                              className="px-4 py-2 rounded-lg border border-white/20 bg-white/[0.04] text-[13px] font-semibold text-white/70 hover:border-magenta/50 hover:bg-magenta/[0.06] hover:text-white transition-all"
                            >
                              Faux
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {isCorrect
                                ? <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                                : <X className="w-3.5 h-3.5" strokeWidth={2} />}
                              {isCorrect ? 'Correct.' : `Incorrect — c'est ${item.isTrue ? 'Vrai' : 'Faux'}.`}
                            </div>
                            <p className="text-[12px] text-white/55 leading-[1.5]">{item.explication}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <ResourceLinks
                title="Pour aller plus loin"
                links={[
                  { label: "ESA ESTEC — Centre d'essais", url: "https://www.esa.int/Enabling_Support/Space_Engineering_Technology/Test_Centre", desc: "Le centre de test de l'ESA aux Pays-Bas" },
                ]}
              />
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 4 (nouveau) : Ariane 6 dans le monde ── */}
        {chapter === 4 && (
          <ChapterShell
            kicker="05" title="Ariane 6 dans le monde"
            titlePrefix="L'accès à l'espace,"
            titleAccent="un enjeu stratégique."
            lede="Lancer un satellite, c'est de la géopolitique autant que de la technologie. L'Europe a choisi d'avoir son propre lanceur pour ne dépendre de personne. Mais la concurrence mondiale est intense."
            onPrev={() => goTo(3)} onNext={() => goTo(5)}
            nextEnabled={matchingComplete}
            nextLabel={matchingComplete ? "Continue · La séquence de lancement →" : "Associe tous les lanceurs"}
          >
            <div className="space-y-6">

              {/* Context callout */}
              <div className="border border-magenta/25 rounded-xl p-5 space-y-3 border-[1.5px]">
                <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-magenta">Pourquoi l'Europe a besoin d'Ariane 6</p>
                <p className="text-[14px] text-white/75 leading-[1.6]">
                  La doctrine de l'ESA est claire : l'Europe doit avoir <span className="text-white font-semibold">un accès autonome à l'espace</span>, sans dépendre d'un autre pays pour lancer ses satellites militaires, climatiques ou de télécommunications. Sans lanceur propre, n'importe quelle puissance étrangère pourrait refuser de lancer un satellite européen — ou imposer ses conditions.
                </p>
                <p className="text-[14px] text-white/75 leading-[1.6]">
                  Avec SpaceX et son Falcon 9 réutilisable, le coût d'un lancement commercial a été divisé par dix en dix ans. Ariane 6 doit trouver sa place dans ce marché transformé — pas seulement en réduisant les prix, mais en garantissant <span className="text-white font-semibold">indépendance, fiabilité et souveraineté des données</span>.
                </p>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-3 divide-x divide-white/10 border border-white/10 rounded-2xl overflow-hidden">
                {[
                  { value: '1979', unit: '', label: "Première Ariane — l'Europe lance depuis 45 ans" },
                  { value: '110+', unit: '', label: 'Lancements réussis pour la famille Ariane' },
                  { value: '∼ 10×', unit: '', label: "Moins cher depuis la réutilisabilité de Falcon 9" },
                ].map(({ value, unit, label }) => (
                  <div key={label} className="px-5 py-4 text-center">
                    <p className="text-[28px] font-bold text-magenta leading-none">{value}<span className="text-[13px] font-normal text-magenta/70"> {unit}</span></p>
                    <p className="text-[11px] text-white/45 mt-1.5 leading-snug uppercase tracking-[0.08em]">{label}</p>
                  </div>
                ))}
              </div>

              {/* Matching game */}
              <div className="border border-magenta/20 bg-magenta/[0.02] rounded-2xl p-6">
                <div className="mb-5">
                  <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-magenta mb-1.5">Jeu · Associe les lanceurs</p>
                  <p className="text-[14px] text-white/70 leading-[1.5]">
                    {matchingComplete
                      ? "Toutes les associations trouvées. Tu peux continuer."
                      : selectedLauncher
                        ? `Lanceur sélectionné : ${WORLD_LAUNCHERS.find(l => l.id === selectedLauncher)?.name}. Clique maintenant sur sa description.`
                        : `${Object.keys(worldMatchPairs).length} / ${WORLD_LAUNCHERS.length} associés. Clique d'abord sur un lanceur.`}
                  </p>
                  {worldMatchWrong && (
                    <p className="text-[12px] text-red-400 mt-1.5 font-medium">Mauvaise association. Réessaie.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Launchers */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/35 mb-2">Lanceurs</p>
                    {WORLD_LAUNCHERS.map((launcher) => {
                      const isMatched = launcher.id in worldMatchPairs;
                      const isSelected = selectedLauncher === launcher.id;
                      return (
                        <button
                          key={launcher.id}
                          onClick={() => handleLauncherSelect(launcher.id)}
                          disabled={isMatched}
                          className={`w-full p-4 rounded-xl border text-left transition-all ${
                            isMatched
                              ? 'border-magenta/40 bg-magenta/[0.08] cursor-default'
                              : isSelected
                                ? 'border-magenta bg-magenta/15 scale-[1.01] shadow-[0_0_0_2px_rgba(200,37,122,0.15)]'
                                : 'border-white/10 bg-white/[0.04] hover:border-magenta/40 hover:bg-white/[0.07] hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[15px] font-bold text-white">{launcher.name}</p>
                              <p className="text-[12px] text-white/50 mt-0.5">{launcher.agency}</p>
                              <p className="text-[11px] text-white/30 mt-0.5">{launcher.country}</p>
                            </div>
                            {isMatched && <CheckCircle className="w-5 h-5 text-magenta flex-shrink-0" strokeWidth={1.75} />}
                            {isSelected && <Zap className="w-4 h-4 text-magenta flex-shrink-0" strokeWidth={1.75} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/35 mb-2">Descriptions</p>
                    {DESC_DISPLAY_ORDER.map((descId) => {
                      const desc = WORLD_DESCRIPTIONS.find(d => d.id === descId)!;
                      const isMatched = Object.values(worldMatchPairs).includes(descId);
                      const matchedLauncherId = Object.entries(worldMatchPairs).find(([, dId]) => dId === descId)?.[0];
                      const matchedLauncher = matchedLauncherId ? WORLD_LAUNCHERS.find(l => l.id === matchedLauncherId) : null;

                      return (
                        <button
                          key={descId}
                          onClick={() => handleDescSelect(descId, desc.launcherId)}
                          disabled={isMatched || !selectedLauncher}
                          className={`w-full p-4 rounded-xl border text-left transition-all ${
                            isMatched
                              ? 'border-magenta/30 bg-magenta/[0.06] cursor-default'
                              : selectedLauncher
                                ? 'border-white/20 bg-white/[0.06] hover:border-magenta/40 hover:bg-white/[0.09] cursor-pointer hover:-translate-y-0.5'
                                : 'border-white/10 bg-white/[0.04] cursor-default opacity-50'
                          }`}
                        >
                          {isMatched && matchedLauncher && (
                            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-magenta mb-1.5">{matchedLauncher.name}</p>
                          )}
                          <p className="text-[12px] text-white/70 leading-[1.55]">{desc.text}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Context: landscape */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "La réutilisabilité change tout",
                    body: "SpaceX a montré qu'un même premier étage peut voler plus de 20 fois. Ariane 6 n'est pas réutilisable dans sa version actuelle, mais l'ESA travaille déjà sur une version future (Themis) pour rattraper ce retard technologique.",
                  },
                  {
                    title: "Pas que la concurrence",
                    body: "La diversité des lanceurs mondiaux est une bonne chose pour l'humanité : si Ariane 6, Falcon 9, H3 et Soyouz disparaissaient le même jour, des milliers de satellites essentiels seraient inaccessibles. La redondance est une assurance collective.",
                  },
                ].map(({ title, body }) => (
                  <div key={title} className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
                    <p className="text-[13px] font-semibold text-white mb-2">{title}</p>
                    <p className="text-[12px] text-white/55 leading-[1.55]">{body}</p>
                  </div>
                ))}
              </div>

              <ResourceLinks
                title="Pour aller plus loin"
                links={[
                  { label: "ESA — Transport spatial", url: "https://www.esa.int/Enabling_Support/Space_Transportation", desc: "Politique de transport spatial européenne" },
                  { label: "CNES — Accès à l'espace", url: "https://cnes.fr/fr/acces-espace", desc: "Stratégie d'accès à l'espace" },
                  { label: "ArianeGroup", url: "https://www.ariane.group/", desc: "Le constructeur d'Ariane" },
                  { label: "ESA — Themis", url: "https://www.esa.int/Enabling_Support/Space_Transportation/Themis", desc: "Futur lanceur réutilisable européen" },
                ]}
              />
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 5 : Séquence de lancement (contenu original inchangé, était Ch 4) ── */}
        {chapter === 5 && (
          <ChapterShell
            kicker="06" title="La séquence de lancement"
            titlePrefix="Chaque étape compte,"
            titleAccent="de la mise à feu au déploiement."
            lede="Regarde un vrai lancement Ariane 6 (mission VA262) et retrouve les étapes clés. Le simulateur te permet ensuite de revivre chaque décision de mission."
            onPrev={() => goTo(4)} onNext={() => goTo(6)} nextEnabled={true}
            nextLabel="Continue · Quiz éclair →"
          >
            <div className="space-y-6">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <div className="px-5 py-3 bg-white/[0.04] border-b border-white/10 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-magenta/15 border border-magenta/30 grid place-items-center flex-shrink-0">
                    <svg className="w-3 h-3 text-magenta ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <p className="text-[13px] font-semibold">Replay — Vrai lancement Ariane 6 · VA262</p>
                </div>
                <div className="bg-black/40 px-5 py-3 border-b border-white/10">
                  <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-white/40 mb-3">Étapes clés</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Décollage', t: 1805, tag: 'T+0:00' },
                      { label: 'Séparation boosters', t: 2024, tag: 'T+3:39' },
                      { label: 'Largage coiffe', t: 2077, tag: 'T+4:32' },
                      { label: 'Coupure Vulcain', t: 2340, tag: 'T+8:55' },
                      { label: 'Orbite de transfert', t: 2915, tag: 'T+18:30' },
                      { label: 'Déploiement satellites', t: 7200, tag: 'T+1h31:55' },
                    ].map(({ label, t, tag }) => (
                      <a
                        key={t}
                        href={`https://www.youtube.com/watch?v=DhxJ6Z7u-YU&t=${t}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-magenta/30 bg-magenta/10 text-[11px] font-medium text-magenta hover:bg-magenta/20 transition"
                      >
                        <span className="font-mono opacity-70">{tag}</span>
                        <span>{label}</span>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <YouTubeEmbed videoId="DhxJ6Z7u-YU" title="Lancement Ariane 6 — Replay rideshare VA262" start={1805} />
                </div>
              </div>
              <MissionSimulator />

              <ResourceLinks
                title="Pour aller plus loin"
                links={[
                  { label: "CNES — Centre Spatial Guyanais", url: "https://cnes.fr/dossiers/centre-spatial-guyanais-une-porte-vers-lespace", desc: "Le port spatial de Kourou, porte vers l'espace" },
                  { label: "ArianeGroup — Ariane 6", url: "https://www.ariane.group/transport-spatial/ariane-6/", desc: "Fiche technique officielle Ariane 6" },
                ]}
              />
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 6 : Quiz éclair ── */}
        {chapter === 6 && !quizCompleted && (
          <ChapterShell
            kicker="07" title="Quiz éclair"
            titlePrefix="Six questions pour"
            titleAccent="valider le chapitre."
            lede="Une réponse par question. Pas de mauvaise réponse définitive — l'objectif c'est d'apprendre."
            onPrev={() => goTo(5)} onNext={() => {}} nextEnabled={false}
            nextLabel="Réponds aux questions d'abord"
          >
            <Quiz questions={quizQuestions} section="rockets" onComplete={handleQuizComplete} />
          </ChapterShell>
        )}

        {/* ── Ch 6 : Réflexion (après quiz) ── */}
        {chapter === 6 && quizCompleted && (
          <ChapterShell
            kicker="07" title="Réflexion"
            titlePrefix="Quel est le défi le plus impressionnant"
            titleAccent="à retenir ?"
            lede="Prends un moment pour formuler ta réponse. Elle sera transmise aux équipes de Space Elevator."
            onPrev={() => goTo(5)} onNext={() => goTo(7)} nextEnabled={reflection.trim().length > 0}
            nextLabel={reflection.trim().length > 0 ? "Terminer le chapitre →" : "Écris ta réflexion d'abord"}
          >
            <div>
              <label className="block text-[13px] font-medium text-white/70 mb-3">
                Selon toi, quel est le défi le plus impressionnant à surmonter pour construire un lanceur, et pourquoi ?
              </label>
              <textarea
                value={reflection}
                onChange={e => handleReflectionChange(e.target.value)}
                placeholder="Partage tes réflexions sur l'ingénierie des lanceurs..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 resize-none text-[14px]"
                rows={5}
                maxLength={4000}
              />
              {reflection.trim().length > 0 && (
                <div className="flex items-center gap-2 text-[13px] text-magenta mt-3">
                  <CheckCircle className="w-4 h-4" strokeWidth={1.75} /> Réflexion enregistrée
                </div>
              )}
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 7 : Récap (était Ch 6) ── */}
        {chapter === 7 && (
          <ChapterRecap
            chapterLabel="Lanceurs"
            summary="Tu as exploré comment on quitte la Terre, les défis techniques des lanceurs, les salles blanches, la concurrence mondiale et la séquence d'un vrai lancement Ariane 6."
            stats={[
              { v: selectedChallenge !== null ? challenges[selectedChallenge].name : '—', t: 'défi technique exploré' },
              { v: orderComplete ? '4 / 4' : `${orderClicks.length} / 4`, t: 'vitesses triées correctement' },
              { v: quizCompleted ? `${quizQuestions.length} / ${quizQuestions.length}` : '0 / ' + quizQuestions.length, t: 'questions du quiz' },
            ]}
            nextTitle="Réseaux Sociaux"
            nextDesc="Découvre les comptes et ressources pour rester connecté à l'actualité spatiale."
            onContinue={onComplete}
            onPrev={() => goTo(6)}
          />
        )}
      </div>
    </SectionCanvas>
    </ChapterTimeTracker>
  );
}
