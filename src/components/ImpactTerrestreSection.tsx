import { useState, useEffect } from 'react';
import { Earth, ChevronRight, CheckCircle, Radio } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';
import { Quiz } from './Quiz';
import { AvatarGuide } from './AvatarGuide';

/* ─────────────────────────────────────────
   Ground Stations & Opérateurs au sol block
   ───────────────────────────────────────── */
const GROUND_JOBS = [
  {
    icon: '🖥️',
    color: 'emerald',
    title: 'Contrôleur de Vol',
    subtitle: 'Flight Controller',
    desc: 'Surveille en temps réel la santé du satellite (énergie, température, orientation, propulsion). En cas d\'alarme, il diagnostique et applique des procédures d\'urgence en quelques minutes — le médecin urgentiste du satellite.',
    example: 'Si un panneau solaire refuse de se déployer au lancement, le FC dispose de quelques minutes pour forcer le mécanisme à distance avant épuisement de la batterie.',
    tags: ['24/7', 'Procédures d\'urgence', 'Systèmes embarqués'],
  },
  {
    icon: '📐',
    color: 'sky',
    title: 'Ingénieur Trajectoire',
    subtitle: 'Orbital Mechanics Engineer',
    desc: 'Calcule et corrige l\'orbite tout au long de la vie du satellite. Prépare les manœuvres d\'évitement de débris, les corrections de cap et la déorbitisation finale avec une précision de quelques cm/s.',
    example: 'L\'ISS effectue en moyenne 2 manœuvres d\'évitement de débris par an — préparées par les équipes trajectoire de Houston et Moscou.',
    tags: ['Astrodynamique', 'Python / MATLAB', 'Physique avancée'],
  },
  {
    icon: '🗑️',
    color: 'orange',
    title: 'Spécialiste Débris Spatiaux',
    subtitle: 'Space Debris Analyst',
    desc: 'Surveille les 35 000+ objets catalogués en orbite (débris de lanceurs, satellites morts, fragments de collisions). Calcule les probabilités de collision et émet des alertes pour les opérateurs de satellites actifs.',
    example: 'Le réseau Space Fence de l\'US Space Force détecte des objets de 10 cm en LEO. En Europe, l\'ESA gère le service SST (Space Surveillance and Tracking) depuis son centre de Darmstadt.',
    tags: ['Surveillance radar', 'Modélisation', 'SST / SSA'],
  },
  {
    icon: '🚀',
    color: 'amber',
    title: 'Opérateur ISS',
    subtitle: 'ISS Flight Controller',
    desc: 'Spécialiste des systèmes de la Station Spatiale Internationale : gestion de l\'atmosphère interne, des systèmes de survie, des amarrages de vaisseaux (Dragon, Soyuz, Cygnus). Travaille en coordination avec Houston, Moscou, Toulouse et Tsukuba.',
    example: 'Lors de l\'amarrage d\'un Dragon SpaceX, jusqu\'à 6 centres de contrôle sur 3 continents communiquent simultanément pour valider chaque étape de l\'approche finale.',
    tags: ['ISS', 'Systèmes de survie', 'Multi-centres'],
  },
  {
    icon: '📡',
    color: 'teal',
    title: 'Opérateur Télécommunications Sol',
    subtitle: 'Ground Station Operator',
    desc: 'Gère les antennes paraboliques qui "parlent" au satellite : planifie les fenêtres de contact, encode les télécommandes et décode la télémétrie. Sans liaison sol, le satellite est sourd et muet.',
    example: 'Pour Mars Express, chaque session dure 8 à 10 h et doit être réservée des jours à l\'avance en fonction de la géométrie Terre–Mars et de la disponibilité des antennes du réseau DSN.',
    tags: ['RF & antennes', 'CCSDS', 'Planification de contacts'],
  },
  {
    icon: '🔭',
    color: 'violet',
    title: 'Ingénieur Charge Utile',
    subtitle: 'Payload Engineer',
    desc: 'Programme les séquences d\'observation de l\'instrument scientifique ou commercial embarqué (caméra, radar, sondeur météo…), calibre les capteurs et analyse la qualité des données reçues. Interface entre les scientifiques et le satellite.',
    example: 'Les opérateurs payload de l\'ESAC (Espagne) programment chaque semaine les pointages du télescope Cheops vers les exoplanètes prioritaires des chercheurs européens.',
    tags: ['Optique / radar', 'Traitement du signal', 'Science spatiale'],
  },
];

const GS_COLOR: Record<string, { ring: string; bg: string; text: string; tag: string }> = {
  emerald: { ring: 'border-emerald-400/40', bg: 'bg-emerald-500/10', text: 'text-emerald-300', tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' },
  sky:     { ring: 'border-sky-400/40',     bg: 'bg-sky-500/10',     text: 'text-sky-300',     tag: 'bg-sky-500/10 text-sky-400 border-sky-400/20' },
  orange:  { ring: 'border-orange-400/40',  bg: 'bg-orange-500/10',  text: 'text-orange-300',  tag: 'bg-orange-500/10 text-orange-400 border-orange-400/20' },
  amber:   { ring: 'border-amber-400/40',   bg: 'bg-amber-500/10',   text: 'text-amber-300',   tag: 'bg-amber-500/10 text-amber-400 border-amber-400/20' },
  teal:    { ring: 'border-teal-400/40',    bg: 'bg-teal-500/10',    text: 'text-teal-300',    tag: 'bg-teal-500/10 text-teal-400 border-teal-400/20' },
  violet:  { ring: 'border-blue-400/40',    bg: 'bg-blue-500/10',    text: 'text-blue-300',    tag: 'bg-blue-500/10 text-blue-400 border-blue-400/20' },
};

function GroundStationsBlock() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
          <Radio className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Stations Sol & Opérations Satellite</h3>
          <p className="text-gray-400 text-xs mt-0.5">Les équipes invisibles qui pilotent l'espace depuis la Terre</p>
        </div>
      </div>

      {/* Intro + photo */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-5">
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/586056/pexels-photo-586056.jpeg"
            alt="Salle de contrôle spatiale type ESOC Darmstadt"
            className="w-full object-cover h-52"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <span className="text-xs text-gray-300 bg-black/40 px-2 py-1 rounded">
              Salle d'opérations — type ESOC, Darmstadt (Allemagne) · ESA
            </span>
          </div>
        </div>
        <div className="p-5">
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Chaque satellite en orbite est surveillé et commandé depuis la Terre, 24 h/24. Ces centres —
            appelés <strong className="text-white">stations sol</strong> — sont équipés d'antennes paraboliques,
            de serveurs de calcul et de consoles de contrôle qui échangent des milliers de commandes par jour
            avec l'espace. Le plus grand centre européen est l'<strong className="text-white">ESOC</strong>{' '}
            (European Space Operations Centre) à <strong className="text-white">Darmstadt, Allemagne</strong>,
            qui contrôle plus de 20 missions ESA simultanément — de l'orbite basse jusqu'aux sondes interplanétaires.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { v: '1967', l: 'Fondation ESOC' },
              { v: '20+',  l: 'Missions contrôlées' },
              { v: '24/7', l: 'Opérations continues' },
              { v: '900+', l: 'Experts sur site' },
            ].map(s => (
              <div key={s.l} className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <div className="text-xl font-bold text-emerald-400">{s.v}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métiers */}
      <p className="text-gray-400 text-sm mb-3">Clique sur un métier pour en savoir plus.</p>
      <div className="space-y-2">
        {GROUND_JOBS.map((job, i) => {
          const c = GS_COLOR[job.color];
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? `${c.bg} ${c.ring}` : 'border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20'}`}
            >
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="text-xl flex-shrink-0">{job.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-white text-sm">{job.title}</span>
                  <span className="text-gray-500 text-xs ml-2">{job.subtitle}</span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-5 pb-5">
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">{job.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.tags.map(t => (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded-full border ${c.tag}`}>{t}</span>
                    ))}
                  </div>
                  <div className={`rounded-lg p-3 ${c.bg} border ${c.ring}`}>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      <strong className={`${c.text} block mb-1`}>Exemple concret</strong>
                      {job.example}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const IMPACT_LINES = [
  { speaker: 'girl' as const, text: "Cette section, c'est la grande question : qu'est-ce que l'espace change concrètement pour nous sur Terre ?" },
  { speaker: 'boy' as const,  text: "Pas les orbites ni la technique — ça viendra après. Ici on parle d'impact humain, social et environnemental." },
  { speaker: 'girl' as const, text: "Et on verra aussi comment les pays du monde entier collaborent malgré leurs rivalités." },
];

interface ImpactTerrestreSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function ImpactTerrestreSection({ onComplete, onHome, onBack }: ImpactTerrestreSectionProps) {
  const { saveResponse, getResponses, saveQuizScore } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('impact_terrestre');
      setResponses(savedResponses);
    };
    loadResponses();
  }, []);

  const quizQuestions = [
    {
      id: 'impact_q1',
      question: 'Quel programme spatial européen fournit des données environnementales en accès libre à tous ?',
      options: [
        { id: 'a', text: 'Ariane 6', isCorrect: false },
        { id: 'b', text: 'Copernicus', isCorrect: true },
        { id: 'c', text: 'Artemis', isCorrect: false },
        { id: 'd', text: 'Hubble', isCorrect: false }
      ],
      explanation: 'Copernicus est le programme européen d\'observation de la Terre de l\'ESA. Ses données sont entièrement ouvertes et gratuites : elles servent à surveiller les forêts, mesurer la fonte des glaces, anticiper les catastrophes naturelles et guider les agriculteurs. C\'est le programme de données spatiales le plus utilisé au monde.'
    }
  ];

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('impact_terrestre', id, value);
  };

  const handleQuizScoreUpdate = async (points: number) => {
    await saveQuizScore('impact_terrestre', 'impact_q1', points, points > 0);
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = quizCompleted && responses['q1']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-emerald-950 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-6">
          <Earth className="w-12 h-12 text-emerald-400" />
          <div>
            <div className="text-sm text-emerald-400 font-semibold uppercase tracking-wider">🌍 Impact sur Terre</div>
            <h2 className="text-4xl font-bold">Le Spatial au Service de l'Humanité</h2>
          </div>
        </div>

        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20">
          <AvatarGuide lines={IMPACT_LINES} interval={4000} />
        </div>

        {/* ── Surveiller la Santé de notre Planète ── */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌿</span>
            <h3 className="text-2xl font-semibold">Surveiller la Santé de notre Planète</h3>
          </div>

          <p className="text-gray-300 leading-relaxed mb-6">
            Ces dernières années, les scientifiques analysent l'évolution des écosystèmes de la planète Terre pour y
            surveiller l'état de la faune, de la flore, du climat et des océans. La planète Terre est un système dont
            l'équilibre est fragile : un dérèglement d'un des piliers, et les autres paramètres s'emballent.
          </p>
          <p className="text-gray-300 leading-relaxed mb-6">
            Le programme européen Copernicus met à disposition de tous — gratuitement — des images satellites de la
            Terre entière, actualisées plusieurs fois par semaine. Des scientifiques, des gouvernements et des ONG
            s'en servent pour mesurer la fonte des glaces polaires, suivre la déforestation en Amazonie, cartographier
            les zones inondées après un cyclone, ou estimer les rendements agricoles d'un pays. Sans cette vue depuis
            l'espace, nous serions aveugles face au changement climatique.
          </p>

          {/* Infographie limites planétaires */}
          <div className="rounded-xl overflow-hidden border border-white/10 mb-5">
            <img
              src="/image.png"
              alt="Les 9 limites planétaires — CGDD 2025"
              className="w-full object-contain bg-white"
            />
          </div>
          <p className="text-xs text-gray-500 text-center mb-6">
            Source : CGDD, 2025 — d'après le Stockholm Resilience Centre
          </p>

          <a
            href="https://www.notre-environnement.gouv.fr/themes/climate/les-observations-du-changement-climatique-ressources/article/comprendre-le-changement-climatique-causes-et-impacts-en-france"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400/60 transition-all duration-200 text-sm font-medium group"
          >
            <span>🌍</span>
            <span>Comprendre le changement climatique : causes et impacts en France</span>
            <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* ── Surveillance des Océans ── */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌊</span>
            <h3 className="text-2xl font-semibold">Surveiller la Santé de l'Océan</h3>
          </div>

          <p className="text-gray-300 leading-relaxed mb-4">
            L'océan couvre plus de 70 % de la surface terrestre et régule le climat de la planète entière : il absorbe
            près de 30 % du CO₂ émis par les activités humaines et redistribue la chaleur entre les pôles et les
            tropiques. Pourtant, il reste l'un des environnements les moins connus et les moins surveillés de la Terre.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            C'est là qu'interviennent les satellites d'altimétrie, de température de surface et de couleur de l'eau.
            Combinés à des bouées dérivantes, des gliders autonomes et des capteurs embarqués sur des navires, ils
            permettent de mesurer en continu la montée des eaux, le réchauffement des couches superficielles,
            l'acidification, et la distribution du phytoplancton — base de toute vie marine. Ces données sont
            essentielles pour anticiper les phénomènes El Niño, la montée du niveau des mers et l'évolution des
            pêcheries mondiales.
          </p>
          <p className="text-gray-300 leading-relaxed mb-6">
            Des acteurs comme <strong className="text-white">CLS (Collecte Localisation Satellites)</strong>, filiale
            du CNES, développent des solutions d'observation opérationnelle de l'océan au service des gouvernements,
            des scientifiques et de l'industrie maritime.
          </p>

          <a
            href="https://www.youtube.com/watch?v=placeholder_fabien_lefevre"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-300 hover:bg-blue-500/25 hover:border-blue-400/60 transition-all duration-200 text-sm font-medium group"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.582 7.186a2.506 2.506 0 0 0-1.768-1.768C18.254 5 12 5 12 5s-6.254 0-7.814.418a2.506 2.506 0 0 0-1.768 1.768C2 8.746 2 12 2 12s0 3.254.418 4.814a2.506 2.506 0 0 0 1.768 1.768C5.746 19 12 19 12 19s6.254 0 7.814-.418a2.506 2.506 0 0 0 1.768-1.768C22 15.254 22 12 22 12s0-3.254-.418-4.814zM10 15V9l5.2 3-5.2 3z" />
            </svg>
            <div className="text-left">
              <div className="font-medium">Vidéo : Fabien LeFevre — Océanographie CLS</div>
              <div className="text-xs text-blue-400/70">Surveillance de la santé de l'océan</div>
            </div>
            <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* ── Les objets du quotidien nés du spatial ── */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏠</span>
            <h3 className="text-2xl font-semibold">Les Objets du Quotidien Nés du Spatial</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Vous utilisez chaque jour des technologies inventées pour conquérir l'espace, sans même le savoir.
          </p>

          <div className="space-y-6">

            {/* Invention 1 — Mousse à mémoire de forme */}
            <div className="group rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 hover:border-emerald-400/30 transition-all duration-300 overflow-hidden">
              <div className="flex items-start gap-0">
                <div className="flex-shrink-0 w-14 flex flex-col items-center justify-start pt-5 pb-5 bg-emerald-500/10 border-r border-white/10">
                  <span className="text-2xl">🛏️</span>
                  <span className="text-xs text-emerald-400 font-bold mt-1 writing-mode-vertical rotate-90 mt-4 opacity-70">NASA</span>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white text-base">Mousse à mémoire de forme</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">1966</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    Développée par la NASA pour absorber les chocs lors des décollages et protéger les astronautes,
                    la mousse viscoélastique — dite "mousse à mémoire de forme" — a révolutionné notre façon de dormir.
                    Ses propriétés uniques (elle épouse le corps puis reprend sa forme) en font aujourd'hui le matériau
                    de référence dans les matelas haut de gamme, les sièges de voiture, les équipements médicaux
                    anti-escarres et les casques de protection.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Matelas', 'Sièges auto', 'Casques sport', 'Fauteuils médicaux'].map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Invention 2 — Scratch (Velcro) */}
            <div className="group rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 hover:border-sky-400/30 transition-all duration-300 overflow-hidden">
              <div className="flex items-start gap-0">
                <div className="flex-shrink-0 w-14 flex flex-col items-center justify-start pt-5 pb-5 bg-sky-500/10 border-r border-white/10">
                  <span className="text-2xl">👟</span>
                  <span className="text-xs text-sky-400 font-bold mt-1 opacity-70">NASA</span>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white text-base">Velcro & fixations sans apesanteur</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20">Années 60</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    Dans l'espace, aucune vis ne peut être serrée à la main en apesanteur sans s'envoler. La NASA a
                    massivement adopté le velcro (inventé en 1941 mais popularisé par le programme Apollo) pour fixer
                    outils, équipements et vêtements à bord des capsules et de la Station spatiale. Cette adoption
                    à grande échelle a lancé sa diffusion mondiale : chaussures, vêtements de sport, articles médicaux,
                    sacs et même les couches pour bébés lui doivent leur fermeture rapide.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Chaussures', 'Vêtements', 'Équipement médical', 'Bagages'].map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Invention 3 — Capteurs photo CMOS */}
            <div className="group rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 hover:border-amber-400/30 transition-all duration-300 overflow-hidden">
              <div className="flex items-start gap-0">
                <div className="flex-shrink-0 w-14 flex flex-col items-center justify-start pt-5 pb-5 bg-amber-500/10 border-r border-white/10">
                  <span className="text-2xl">📸</span>
                  <span className="text-xs text-amber-400 font-bold mt-1 opacity-70">JPL</span>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white text-base">Capteur photo CMOS (smartphone)</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">1993</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    En 1993, le Jet Propulsion Laboratory (JPL) de la NASA développe un capteur d'image miniaturisé
                    à faible consommation pour équiper les sondes spatiales : le capteur CMOS actif. Trop encombrants
                    et énergivores, les capteurs CCD de l'époque ne convenaient pas aux contraintes de l'espace.
                    Cette invention a ensuite été transférée vers l'industrie civile et constitue aujourd'hui le cœur
                    de <strong className="text-white">tous les appareils photo de smartphones</strong> — soit des
                    milliards de capteurs produits chaque année.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Smartphones', 'Appareils photo', 'Webcams', 'Caméras médicales'].map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Invention 4 — GPS */}
            <div className="group rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 hover:border-orange-400/30 transition-all duration-300 overflow-hidden">
              <div className="flex items-start gap-0">
                <div className="flex-shrink-0 w-14 flex flex-col items-center justify-start pt-5 pb-5 bg-orange-500/10 border-r border-white/10">
                  <span className="text-2xl">📍</span>
                  <span className="text-xs text-orange-400 font-bold mt-1 opacity-70">DOD</span>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white text-base">GPS / Géolocalisation</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">1973</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    Conçu par le Département de la Défense américain pour guider missiles et troupes, le système GPS
                    (24 satellites en orbite moyenne) a été ouvert au civil en 1983 après la catastrophe du vol
                    Korean Air 007. Aujourd'hui, il est le fondement invisible de la navigation automobile, de la
                    livraison à domicile, de l'agriculture de précision, des transactions boursières (synchronisation
                    temporelle), des urgences médicales et bien sûr de toutes les cartes mobiles. L'Europe a développé
                    son propre système souverain : <strong className="text-white">Galileo</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Navigation', 'Logistique', 'Agriculture', 'Sécurité civile', 'Finance'].map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Invention 5 — IRM */}
            <div className="group rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 hover:border-rose-400/30 transition-all duration-300 overflow-hidden">
              <div className="flex items-start gap-0">
                <div className="flex-shrink-0 w-14 flex flex-col items-center justify-start pt-5 pb-5 bg-rose-500/10 border-r border-white/10">
                  <span className="text-2xl">🧲</span>
                  <span className="text-xs text-rose-400 font-bold mt-1 opacity-70">NASA</span>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white text-base">IRM — Imagerie par Résonance Magnétique</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20">Années 70</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    Les algorithmes de traitement d'image développés par la NASA pour reconstituer des photos nettes
                    à partir des signaux bruités envoyés par les sondes lunaires (programme Apollo) ont directement
                    inspiré les premières machines IRM. Ces techniques de reconstruction numérique permettent de
                    transformer un signal radiofréquence faible en image anatomique précise — sans rayonnement
                    ionisant. Aujourd'hui, l'IRM est l'outil de diagnostic le plus puissant de la médecine moderne :
                    tumeurs, accidents vasculaires, maladies neurologiques, lésions musculaires — elle voit ce
                    qu'aucun autre examen ne peut révéler.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Neurologie', 'Oncologie', 'Cardiologie', 'Orthopédie', 'Diagnostic précoce'].map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Invention 6 — Céramique haute performance */}
            <div className="group rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 hover:border-cyan-400/30 transition-all duration-300 overflow-hidden">
              <div className="flex items-start gap-0">
                <div className="flex-shrink-0 w-14 flex flex-col items-center justify-start pt-5 pb-5 bg-cyan-500/10 border-r border-white/10">
                  <span className="text-2xl">🔥</span>
                  <span className="text-xs text-cyan-400 font-bold mt-1 opacity-70">NASA</span>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white text-base">Céramique haute performance</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">Années 70–80</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    Pour résister aux températures extrêmes de la rentrée atmosphérique (jusqu'à 1 600 °C), la NASA
                    a développé des tuiles en céramique ultra-légère pour la navette spatiale — capables d'isoler si
                    efficacement qu'on peut tenir une tuile chauffée à blanc à mains nues quelques secondes après
                    l'avoir retirée du four. Ces recherches ont donné naissance à toute une famille de céramiques
                    techniques aujourd'hui omniprésentes : revêtements de turbines d'avions, implants dentaires et
                    osseux (zircone), plaques de cuisson vitrocéramiques, blindages légers, et systèmes de freinage
                    haute performance pour véhicules de sport et trains à grande vitesse.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Implants dentaires', 'Plaques de cuisson', 'Turbines', 'Freinage TGV', 'Blindage'].map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Stations Sol & Opérations ── */}
        <GroundStationsBlock />

        <Subsection
          title="Coopération Internationale : l'Espace comme Terrain de Paix"
          content="La Station Spatiale Internationale est le symbole le plus fort de ce que des nations rivales peuvent accomplir ensemble. Depuis 1998, des astronautes américains, russes, européens, japonais et canadiens partagent ce laboratoire orbital — même aux pires moments des tensions géopolitiques. L'ESA collabore avec la NASA (James Webb, mission Mars), JAXA (Japon) et ISRO (Inde) sur des projets qui dépassent les frontières. Le Traité de l'Espace de 1967 pose un principe fondateur : l'espace est le patrimoine commun de l'humanité."
          icon="🤝"
        />

        <Subsection
          title="L'Europe Indépendante dans un Monde Interdépendant"
          content="L'ESA réunit 22 États membres autour d'un principe : pour peser dans les grandes décisions spatiales internationales — normes, orbites, fréquences, exploitation des ressources — il faut une capacité propre. Avoir ses propres lanceurs (Ariane), ses propres satellites de navigation (Galileo) et d'observation (Copernicus) garantit que l'Europe peut décider seule de l'utilisation de ces services vitaux, sans être soumise aux choix politiques d'une autre puissance."
          icon="🇪🇺"
        />

        <Quiz
          questions={quizQuestions}
          onScoreUpdate={handleQuizScoreUpdate}
          onComplete={handleQuizComplete}
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mt-8">
          <h3 className="text-2xl font-semibold mb-6">Réfléchissez à ce que vous avez appris</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Parmi tous les impacts du spatial sur Terre évoqués ici, lequel vous touche le plus personnellement et pourquoi ?
            </label>
            <textarea
              value={responses['q1'] || ''}
              onChange={(e) => handleResponseChange('q1', e.target.value)}
              placeholder="Environnement, inclusion numérique, gestion des crises, coopération internationale..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitted}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              submitted
                ? 'bg-green-600 text-white'
                : canSubmit
                ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitted ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Réponses sauvegardées !
              </>
            ) : (
              <>
                Continuer vers les Lanceurs 🚀
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
