import { useState, useEffect } from 'react';
import { Earth, ChevronRight, CheckCircle, Radio, Globe, ExternalLink, FileText } from 'lucide-react';
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
    icon: '📐',
    color: 'sky',
    title: 'Ingénieur Trajectoire & Orbitographie',
    subtitle: 'Orbital Mechanics Engineer',
    desc: "Calcule et corrige l'orbite tout au long de la vie du satellite. Prépare les manœuvres d'évitement de débris, les corrections de cap et la déorbitisation finale avec une précision de quelques cm/s.",
    example: "L'ISS effectue en moyenne 2 manœuvres d'évitement de débris par an — préparées par les équipes trajectoire de Houston et Moscou.",
    videos: [{ id: 'KfcjGFfPQi8', label: 'Témoignage : ingénieur orbitographie' }],
  },
  {
    icon: '🗑️',
    color: 'orange',
    title: 'Responsable Sauvegarde Sol / Débris Spatiaux',
    subtitle: 'Ground Safety & Space Debris',
    desc: "Surveille les 35 000+ objets catalogués en orbite (débris de lanceurs, satellites morts, fragments de collisions). Calcule les probabilités de collision et émet des alertes pour les opérateurs de satellites actifs. Gère aussi la sécurité au sol lors des lancements.",
    example: "Le réseau Space Fence de l'US Space Force détecte des objets de 10 cm en LEO. En Europe, l'ESA gère le service SST (Space Surveillance and Tracking) depuis son centre de Darmstadt.",
    videos: [{ id: '6EzPAgSw8KM', label: 'Témoignage : responsable sauvegarde sol' }],
  },
  {
    icon: '🚀',
    color: 'amber',
    title: 'Contrôleur de Vol & Ingénieur Opérations',
    subtitle: 'Flight Controller & Operations Engineer',
    desc: "Surveille en temps réel la santé du satellite (énergie, température, orientation, propulsion) et applique des procédures d'urgence en quelques minutes. Suit le déroulement des missions, coordonne avec les équipes ISS, gère les amarrages de vaisseaux (Dragon, Soyuz, Cygnus) et assure le lien entre Houston, Moscou, Toulouse et Tsukuba.",
    example: "Lors de l'amarrage d'un Dragon SpaceX, jusqu'à 6 centres de contrôle sur 3 continents communiquent simultanément pour valider chaque étape de l'approche finale.",
    videos: [{ id: 'QqkNx23Zv2s', label: 'Témoignage : ingénieur / technicien opérations' }],
  },
  {
    icon: '📡',
    color: 'teal',
    title: 'Ingénieur / Technicien Stations Sol',
    subtitle: 'Ground Station Engineer',
    desc: "Spécifie, développe, valide et maintient les antennes et équipements sol qui communiquent avec les satellites. Planifie les fenêtres de contact, encode les télécommandes et décode la télémétrie. Maîtrise des fréquences radio (RF) et des protocoles de communication spatiale.",
    example: "Pour Mars Express, chaque session dure 8 à 10 h et doit être réservée des jours à l'avance en fonction de la géométrie Terre–Mars et de la disponibilité des antennes du réseau DSN.",
    videos: [
      { id: '7ckHeYw8xAc', label: 'Témoignage : ingénieur / technicien stations sol' },
      { id: 'HZ5a0Roc3lE', label: 'Témoignage : radio fréquence – télécommunication' },
    ],
  },
  {
    icon: '🔭',
    color: 'violet',
    title: 'Ingénieur Charge Utile & Exploitation',
    subtitle: 'Payload & Exploitation Engineer',
    desc: "Programme les séquences d'observation de l'instrument scientifique ou commercial embarqué (caméra, radar, sondeur météo…), calibre les capteurs et analyse la qualité des données reçues. Interface entre les scientifiques et le satellite.",
    example: "Les opérateurs payload de l'ESAC (Espagne) programment chaque semaine les pointages du télescope Cheops vers les exoplanètes prioritaires des chercheurs européens.",
    videos: [
      { id: 'a3TsE5G_FEk', label: "Témoignage : ingénieur / technicien d'exploitation" },
      { id: 'HW7I22CXmzE', label: 'Témoignage : assemblage intégration charges utiles optiques' },
    ],
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

const SPINOFFS = [
  {
    icon: '🛏️',
    color: 'emerald',
    accent: 'border-emerald-400/30',
    source: 'NASA',
    year: '1966',
    title: 'Mousse à mémoire de forme',
    desc: "Développée par la NASA pour absorber les chocs lors des décollages et protéger les astronautes, la mousse viscoélastique a révolutionné notre façon de dormir. Ses propriétés uniques (elle épouse le corps puis reprend sa forme) en font le matériau de référence dans les matelas haut de gamme, les sièges de voiture et les équipements médicaux anti-escarres.",
    imgDaily: 'https://guideliterie.com/wp-content/uploads/2018/12/matelas-memoire-de-forme.jpeg',
    imgSpace: 'https://www.cieletespace.fr/media/cache/innergrid_xl/uploads/editorial-media/2024/09/media-jqrwv3-695acccf1cedb185956182.jpg',
    labelDaily: 'Matelas à mémoire de forme',
    labelSpace: 'Siège capsule spatiale NASA',
  },
  {
    icon: '👟',
    color: 'sky',
    accent: 'border-sky-400/30',
    source: 'NASA',
    year: 'Années 60',
    title: 'Velcro & fixations sans apesanteur',
    desc: "Dans l'espace, aucune vis ne peut être serrée à la main sans s'envoler. La NASA a massivement adopté le velcro pour fixer outils et vêtements à bord des capsules Apollo et de l'ISS. Cette adoption à grande échelle a lancé sa diffusion mondiale dans les chaussures, vêtements de sport, articles médicaux et bagages.",
    imgDaily: 'https://images.pexels.com/photos/30641951/pexels-photo-30641951.jpeg',
    imgSpace: 'https://live.staticflickr.com/65535/55180852205_ecf572f1df_c.jpg',
    labelDaily: 'Chaussures à velcro',
    labelSpace: 'Sophie Adenot attache son matériel via des velcros sur ses jambes',
  },
  {
    icon: '📸',
    color: 'amber',
    accent: 'border-amber-400/30',
    source: 'JPL',
    year: '1993',
    title: 'Capteur photo CMOS (smartphone)',
    desc: "En 1993, le JPL de la NASA développe un capteur d'image miniaturisé à faible consommation pour équiper les sondes spatiales. Cette invention constitue aujourd'hui le cœur de tous les appareils photo de smartphones — soit des milliards de capteurs produits chaque année.",
    imgDaily: 'https://images.pexels.com/photos/1828109/pexels-photo-1828109.jpeg',
    imgSpace: 'https://www.copernicus.eu/system/files/styles/image_of_the_day/private/2024-12/image_day/20241231_Seine%20river.png?itok=Zg_IUmBQ',
    labelDaily: 'Photographier avec son smartphone',
    labelSpace: "La Seine vue par Sentinel-2 — l'ESA propose de recevoir une image de votre région chaque jour",
    creditSpace: '© Union européenne, Copernicus Sentinel-2',
  },
  {
    icon: '📍',
    color: 'orange',
    accent: 'border-orange-400/30',
    source: 'DOD',
    year: '1973',
    title: 'GPS / Géolocalisation',
    desc: "Conçu par le Département de la Défense américain pour guider missiles et troupes, le GPS (24 satellites en orbite moyenne) a été ouvert au civil en 1983. Aujourd'hui fondement invisible de la navigation auto, de la logistique et de l'agriculture de précision. L'Europe a développé son propre système souverain : Galileo.",
    imgDaily: 'https://images.pexels.com/photos/9966011/pexels-photo-9966011.jpeg',
    imgSpace: 'https://images.pexels.com/photos/13315965/pexels-photo-13315965.jpeg',
    labelDaily: 'Navigation GPS sur smartphone',
    labelSpace: 'Militaires et antenne de géolocalisation',
  },
  {
    icon: '🧲',
    color: 'rose',
    accent: 'border-rose-400/30',
    source: 'NASA',
    year: 'Années 70',
    title: 'IRM — Imagerie par Résonance Magnétique',
    desc: "Les algorithmes de traitement d'image développés par la NASA pour reconstituer des photos des sondes lunaires ont directement inspiré les premières machines IRM. Aujourd'hui, l'IRM est l'outil de diagnostic le plus puissant de la médecine moderne : tumeurs, AVC, maladies neurologiques.",
    imgDaily: 'https://images.pexels.com/photos/7089017/pexels-photo-7089017.jpeg',
    imgSpace: 'https://images.pexels.com/photos/586056/pexels-photo-586056.jpeg',
    labelDaily: 'Machine IRM en milieu hospitalier',
    labelSpace: 'Satellite d\'observation en orbite',
  },
  {
    icon: '🔥',
    color: 'cyan',
    accent: 'border-cyan-400/30',
    source: 'NASA',
    year: 'Années 70–80',
    title: 'Céramique haute performance',
    desc: "Pour résister aux températures extrêmes de la rentrée atmosphérique (1 600 °C), la NASA développe des tuiles en céramique ultra-légère pour la navette spatiale. Ces recherches ont donné naissance aux implants dentaires en zircone, plaques de cuisson vitrocéramiques et systèmes de freinage TGV.",
    imgDaily: 'https://images.pexels.com/photos/8055154/pexels-photo-8055154.jpeg',
    imgSpace: 'https://images.pexels.com/photos/10652773/pexels-photo-10652773.jpeg',
    labelDaily: 'Poêle en céramique',
    labelSpace: 'Train à grande vitesse — freinage haute performance',
  },
];

const SO_COLOR: Record<string, { sideBg: string; sideText: string; yearBg: string; yearText: string; yearBorder: string }> = {
  emerald: { sideBg: 'bg-emerald-500/10', sideText: 'text-emerald-400', yearBg: 'bg-emerald-500/15', yearText: 'text-emerald-400', yearBorder: 'border-emerald-500/20' },
  sky:     { sideBg: 'bg-sky-500/10',     sideText: 'text-sky-400',     yearBg: 'bg-sky-500/15',     yearText: 'text-sky-400',     yearBorder: 'border-sky-500/20' },
  amber:   { sideBg: 'bg-amber-500/10',   sideText: 'text-amber-400',   yearBg: 'bg-amber-500/15',   yearText: 'text-amber-400',   yearBorder: 'border-amber-500/20' },
  orange:  { sideBg: 'bg-orange-500/10',  sideText: 'text-orange-400',  yearBg: 'bg-orange-500/15',  yearText: 'text-orange-400',  yearBorder: 'border-orange-500/20' },
  rose:    { sideBg: 'bg-rose-500/10',    sideText: 'text-rose-400',    yearBg: 'bg-rose-500/15',    yearText: 'text-rose-400',    yearBorder: 'border-rose-500/20' },
  cyan:    { sideBg: 'bg-cyan-500/10',    sideText: 'text-cyan-400',    yearBg: 'bg-cyan-500/15',    yearText: 'text-cyan-400',    yearBorder: 'border-cyan-500/20' },
};

function SpinOffBlock() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">🏠</span>
        <h3 className="text-2xl font-semibold">Les Objets du Quotidien Nés du Spatial</h3>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Vous utilisez chaque jour des technologies inventées pour conquérir l'espace, sans même le savoir.
     
      </p>
      <div className="space-y-4">
        {SPINOFFS.map((item, i) => {
          const c = SO_COLOR[item.color];
          const isHovered = hovered === i;
          return (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-300 overflow-hidden cursor-default ${isHovered ? `${item.accent} bg-white/8` : 'border-white/10 bg-white/3 hover:border-white/20'}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-start gap-0">
                {/* Sidebar */}
                <div className={`flex-shrink-0 w-14 flex flex-col items-center justify-start pt-5 pb-5 ${c.sideBg} border-r border-white/10`}>
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`text-xs font-bold mt-3 opacity-70 ${c.sideText}`}>{item.source}</span>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="p-5 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white text-base">{item.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.yearBg} ${c.yearText} border ${c.yearBorder}`}>{item.year}</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                  {/* Image comparison — visible on hover */}
                  <div className={`grid grid-cols-2 gap-0 transition-all duration-500 ${isHovered ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                    <div className="relative">
                      <img src={item.imgDaily} alt={item.labelDaily} className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span className="block text-xs text-gray-300 font-semibold uppercase tracking-wide mb-0.5">Quotidien</span>
                        <span className="block text-xs text-white leading-snug">{item.labelDaily}</span>
                      </div>
                    </div>
                    <div className="relative border-l border-white/10">
                      <img src={item.imgSpace} alt={item.labelSpace} className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span className="block text-xs text-gray-300 font-semibold uppercase tracking-wide mb-0.5">Origine spatiale</span>
                        <span className="block text-xs text-white leading-snug">{item.labelSpace}</span>
                        {'creditSpace' in item && (
                          <span className="block text-[10px] text-gray-400 mt-1 italic">{(item as typeof item & { creditSpace: string }).creditSpace}</span>
                        )}
                      </div>
                    </div>
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
            src="https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2012/06/main_control_room_at_esa_s_space_operations_centre/11252253-2-eng-GB/Main_Control_Room_at_ESA_s_Space_Operations_Centre_pillars.jpg"
            alt="Salle de contrôle principale de l'ESOC — European Space Operations Centre, Darmstadt"
            className="w-full object-cover h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <span className="text-xs text-gray-300 bg-black/50 px-2 py-1 rounded">
              Salle de contrôle principale — ESOC, Darmstadt (Allemagne) · © ESA
            </span>
          </div>
        </div>
        <div className="p-5">
          <p className="text-gray-400 text-xs italic leading-relaxed mb-4 border-l-2 border-white/20 pl-3">
            Centre d'excellence européen pour les opérations de mission, l'ESOC abrite les ingénieurs qui contrôlent les engins spatiaux en orbite, gèrent le réseau mondial de stations sol et conçoivent les systèmes au sol qui soutiennent les missions dans l'espace. Plus de 60 satellites appartenant à l'ESA et à ses partenaires ont été pilotés depuis Darmstadt, Allemagne. <span className="text-gray-500">— © ESA</span>
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Chaque satellite en orbite est surveillé et commandé depuis la Terre, 24 h/24. Ces centres d'opération sont équipés de serveurs de calcul et de consoles de contrôle qui échangent des milliers de commandes par jour avec l'espace. Ils sont reliés à des dizaines de <strong className="text-white">stations sol</strong> réparties dans le monde pour pouvoir contacter le plus souvent possible les satellites. Le plus grand centre européen est l'<strong className="text-white">ESOC</strong> (European Space Operations Centre) à <strong className="text-white">Darmstadt, Allemagne</strong>, qui contrôle plus de 20 missions ESA simultanément — de l'orbite basse jusqu'aux sondes interplanétaires.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            C'est dans le centre d'opération de la NASA à <strong className="text-white">Houston</strong> qu'étaient gérées les missions Apollo, avec lesquelles les astronautes étaient en communication. Aujourd'hui, les opérateurs se relayent pour les opérations à bord de l'<strong className="text-white">ISS</strong>. Ce sont ces mêmes types de centres d'opérations qui pilotent des missions lointaines comme <strong className="text-white">Perseverance</strong>, le rover de la NASA sur Mars !
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
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
                  <div className={`rounded-lg p-3 ${c.bg} border ${c.ring} mb-3`}>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      <strong className={`${c.text} block mb-1`}>Exemple concret</strong>
                      {job.example}
                    </p>
                  </div>
                  {job.videos.map((v) => (
                    <div key={v.id} className="rounded-xl overflow-hidden border border-white/10 mb-2 last:mb-0">
                      <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/>
                        </svg>
                        <span className="text-xs text-gray-400">{v.label}</span>
                      </div>
                      <div className="aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${v.id}`}
                          title={v.label}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  ))}
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
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('impact_terrestre');
      setResponses(savedResponses);
    };
    loadResponses();
  }, []);

  const quizQuestions = [
    {
      id: 'impact_q0',
      question: 'Combien de satellites utilises-tu au cours d\'une journée (en moyenne) ?',
      options: [
        { id: 'a', text: 'Aucun, je ne suis pas astronaute', isCorrect: false },
        { id: 'b', text: 'Entre 2 et 4', isCorrect: false },
        { id: 'c', text: 'Au moins 8, souvent bien plus', isCorrect: true },
        { id: 'd', text: 'Exactement 1 (mon téléphone)', isCorrect: false }
      ],
      explanation: 'Sans t\'en rendre compte, tu utilises des dizaines de satellites chaque jour ! Le matin pour aller à l\'école : au moins 4 satellites GPS te localisent. Tes appels, SMS et internet passent par des satellites télécom (+2). Tu regardes la météo ? +2 satellites météo. La nourriture de ta cantine vient de champs surveillés depuis l\'espace par des satellites agricoles. Ce n\'est qu\'une moyenne — parfois plus, parfois moins. L\'espace est partout dans ton quotidien !'
    },
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
    },
    {
      id: 'impact_q2',
      question: 'Parmi ces secteurs, lequel utilise les données Copernicus ?',
      options: [
        { id: 'a', text: 'Uniquement les agences spatiales', isCorrect: false },
        { id: 'b', text: 'Uniquement les météorologues', isCorrect: false },
        { id: 'c', text: 'Agriculture, pêche, assurances, qualité de l\'air...', isCorrect: true },
        { id: 'd', text: 'Uniquement les gouvernements européens', isCorrect: false }
      ],
      explanation: 'Plus de 80 % des bénéfices économiques de Copernicus sont générés en dehors du secteur spatial ! Les données sont utilisées dans des domaines très variés : les agriculteurs optimisent leurs récoltes, les assureurs évaluent les catastrophes naturelles, les autorités surveillent la qualité de l\'air, les pêcheurs localisent les zones poissonneuses... Ces données gratuites créent une valeur immense pour toute l\'économie.'
    },
    {
      id: 'impact_q3',
      question: 'Quelle est la taille de la plus grande antenne au sol utilisée pour les télécommunications spatiales ?',
      image: {
        src: 'https://www.nasa.gov/wp-content/uploads/2020/03/dsn-stadium-final.jpg?resize=900,900',
        alt: 'Antenne parabolique de 70 mètres de Goldstone — Deep Space Network NASA',
        credit: '© NASA / Deep Space Network'
      },
      options: [
        { id: 'a', text: '10 mètres', isCorrect: false },
        { id: 'b', text: '34 mètres', isCorrect: false },
        { id: 'c', text: '70 mètres', isCorrect: true },
        { id: 'd', text: '120 mètres', isCorrect: false }
      ],
      explanation: 'L\'antenne de 70 mètres de Goldstone, en Californie, fait partie du Deep Space Network (DSN) de la NASA — le réseau mondial d\'antennes géantes qui maintient le contact avec les sondes spatiales lointaines. Pour comparaison, elle est plus large qu\'un terrain de football ! Ce colosse peut capter des signaux émis par des sondes situées à des milliards de kilomètres de la Terre.'
    },
  ];

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('impact_terrestre', id, value);
  };

  const handleQuizScoreUpdate = async (points: number) => {
    const questionId = quizQuestions[currentQuizIndex]?.id ?? 'impact_q0';
    await saveQuizScore('impact_terrestre', questionId, points, points > 0);
    setCurrentQuizIndex(prev => prev + 1);
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

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://www.notre-environnement.gouv.fr/themes/climate/les-observations-du-changement-climatique-ressources/article/comprendre-le-changement-climatique-causes-et-impacts-en-france"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400/60 transition-all duration-200 text-sm font-medium group"
            >
              <span>🌍</span>
              <span>Comprendre le changement climatique : causes et impacts en France</span>
              <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="https://www.copernicus.eu/sites/default/files/Brochure%20Copernicus%20FR%20web.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-300 hover:bg-blue-500/25 hover:border-blue-400/60 transition-all duration-200 text-sm font-medium group"
            >
              <span>🛰️</span>
              <span>Brochure Copernicus — Programme européen d'observation de la Terre (PDF)</span>
              <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="mt-6 rounded-xl bg-blue-500/10 border border-blue-400/20 p-5">
            <p className="text-blue-200 text-sm font-semibold mb-3">Le saviez-vous ? La flotte Copernicus</p>
            <p className="text-blue-100 text-sm leading-relaxed mb-5">
              Afin d'offrir une grande quantité de données de bonne qualité, le programme Copernicus est composé d'une
              flotte de <strong className="text-white">20 satellites</strong>, dont 7 sont déjà en orbite. Tous ne
              prennent pas des images dans le spectre du visible : certains détectent des gaz invisibles à l'œil nu,
              d'autres révèlent la présence de bactéries dans l'eau !
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="rounded-lg overflow-hidden border border-white/10 aspect-[4/3] bg-black/30">
                  <img
                    src="https://esa.int/var/esa/storage/images/esa_multimedia/images/2016/05/piton_de_la_fournaise/15985095-1-eng-GB/Piton_de_la_Fournaise.jpg"
                    alt="Sentinel-1 — Piton de la Fournaise, La Réunion"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white text-xs font-semibold">Piton de la Fournaise, La Réunion</p>
                <p className="text-blue-200/70 text-xs leading-relaxed">
                  Image radar Sentinel-1 du volcan en éruption. Les satellites radar voient à travers les nuages et de nuit.
                </p>
                <p className="text-blue-200/40 text-xs">Source : ESA / Sentinel-1, 2016</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="rounded-lg overflow-hidden border border-white/10 aspect-[4/3] bg-black/30">
                  <img
                    src="https://esa.int/var/esa/storage/images/esa_multimedia/images/2022/01/sulphur_dioxide_from_tonga_eruption_spreads_over_australia/23907503-1-eng-GB/Sulphur_dioxide_from_Tonga_eruption_spreads_over_Australia_card_full.jpg"
                    alt="Sentinel-5P TROPOMI — Dioxyde de soufre de l'éruption de Tonga"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white text-xs font-semibold">Dioxyde de soufre — Éruption de Tonga</p>
                <p className="text-blue-200/70 text-xs leading-relaxed">
                  Sentinel-5P/TROPOMI détecte les gaz invisibles. Ici le nuage de SO2 de Tonga (2022) au-dessus de l'Australie.
                </p>
                <p className="text-blue-200/40 text-xs">Source : ESA / Sentinel-5P TROPOMI, 2022</p>
              </div>

            </div>
          </div>
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
        <SpinOffBlock />

        {/* ── Stations Sol & Opérations ── */}
        <GroundStationsBlock />

        {/* ── Coopération Internationale ── */}
        <div className="bg-gradient-to-br from-slate-900/60 to-blue-950/40 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Coopération Internationale : l'Espace comme Terrain de Paix</h3>
              <p className="text-gray-400 text-xs mt-0.5">Des nations rivales, un laboratoire commun</p>
            </div>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            L'exploration spatiale est l'une des rares activités humaines où les grandes puissances mondiales collaborent réellement, même en période de tensions. Quatre agences dominent la scène internationale :
          </p>

          {/* Les grandes agences */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { name: 'ESA', flagCode: 'eu', color: 'from-blue-900/40 to-blue-800/20', border: 'border-blue-500/30', text: 'text-blue-300', desc: '22 États membres — Ariane, Copernicus, Galileo, James Webb' },
              { name: 'NASA', flagCode: 'us', color: 'from-red-900/30 to-slate-900/20', border: 'border-red-500/30', text: 'text-red-300', desc: 'Artemis, James Webb, Perseverance, ISS' },
              { name: 'JAXA', flagCode: 'jp', color: 'from-rose-900/30 to-slate-900/20', border: 'border-rose-500/30', text: 'text-rose-300', desc: 'Module Kibô ISS, mission Hayabusa, lanceur H3' },
              { name: 'Roscosmos', flagCode: 'ru', color: 'from-slate-800/40 to-slate-900/20', border: 'border-slate-500/30', text: 'text-slate-300', desc: "Soyouz, Progress, segment russe de l'ISS" },
            ].map(a => (
              <div key={a.name} className={`bg-gradient-to-br ${a.color} rounded-xl p-4 border ${a.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={`https://flagcdn.com/w40/${a.flagCode}.png`}
                    srcSet={`https://flagcdn.com/w80/${a.flagCode}.png 2x`}
                    width="24"
                    height="18"
                    alt={a.name}
                    className="rounded-sm shadow-sm object-cover flex-shrink-0"
                  />
                  <span className={`font-bold text-lg ${a.text}`}>{a.name}</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>

          {/* ISS et drapeaux astronautes */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-5 mb-6">
            <h4 className="text-white font-semibold text-sm mb-1">La Station Spatiale Internationale (ISS)</h4>
            <p className="text-gray-400 text-xs mb-4">Plus de 270 astronautes de 21 nationalités différentes ont séjourné à bord depuis 1998.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { code: 'us', label: 'États-Unis' },
                { code: 'ru', label: 'Russie' },
                { code: 'jp', label: 'Japon' },
                { code: 'de', label: 'Allemagne' },
                { code: 'fr', label: 'France' },
                { code: 'ca', label: 'Canada' },
                { code: 'it', label: 'Italie' },
                { code: 'gb', label: 'Royaume-Uni' },
                { code: 'nl', label: 'Pays-Bas' },
                { code: 'be', label: 'Belgique' },
                { code: 'se', label: 'Suède' },
                { code: 'dk', label: 'Danemark' },
                { code: 'no', label: 'Norvège' },
                { code: 'es', label: 'Espagne' },
                { code: 'ch', label: 'Suisse' },
                { code: 'br', label: 'Brésil' },
                { code: 'kz', label: 'Kazakhstan' },
                { code: 'ua', label: 'Ukraine' },
                { code: 'sa', label: 'Arabie Saoudite' },
                { code: 'ae', label: 'Émirats arabes unis' },
                { code: 'kr', label: 'Corée du Sud' },
              ].map(({ code, label }) => (
                <img
                  key={code}
                  src={`https://flagcdn.com/w40/${code}.png`}
                  srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
                  width="28"
                  height="21"
                  alt={label}
                  title={label}
                  className="rounded-sm shadow-sm hover:scale-125 transition-transform cursor-default object-cover"
                />
              ))}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Depuis 1998, des astronautes américains, russes, européens, japonais et canadiens partagent ce laboratoire orbital — même aux pires moments des tensions géopolitiques. L'ISS est le projet d'ingénierie internationale le plus ambitieux jamais réalisé, assemblé pièce par pièce lors de plus de 40 missions de construction.
            </p>
          </div>

          {/* Anecdote Ukraine */}
          <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-5 mb-6">
            <p className="text-amber-200 text-sm leading-relaxed">
              <strong className="text-amber-300">La science au-dessus des conflits —</strong> En février 2022, lors du déclenchement de la guerre en Ukraine, le cosmonaute russe Oleg Artemyev se trouvait en orbite à bord de l'ISS. Malgré les tensions diplomatiques au sol, la collaboration scientifique n'a pas été interrompue : russes et américains ont continué à travailler côte à côte dans l'espace, preuve que la science peut transcender les conflits politiques.
            </p>
          </div>

          {/* Projets internationaux */}
          <div className="mb-6">
            <h4 className="text-white font-semibold text-sm mb-3">Grands projets de coopération internationale</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {/* James Webb */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col">
                <p className="text-white font-semibold text-sm mb-1">Télescope James Webb</p>
                <p className="text-blue-300 text-xs mb-2">NASA · ESA · CSA</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-3 flex-1">
                  Le plus grand télescope spatial jamais construit, fruit de 15 ans de coopération internationale. Un symbole de ce que l'humanité peut accomplir ensemble.
                </p>
                <a
                  href="https://www.esa.int/Space_in_Member_States/France/Il_y_a_un_an_le_lancement_parfait_du_telescope_spatial_James_Webb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span className="group-hover:underline">Lire l'article ESA (fr)</span>
                </a>
              </div>
              {/* ISS */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col">
                <p className="text-white font-semibold text-sm mb-2">Station Spatiale Internationale</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { flag: '🇺🇸', agency: 'NASA' },
                    { flag: '🇷🇺', agency: 'Roscosmos' },
                    { flag: '🇪🇺', agency: 'ESA' },
                    { flag: '🇯🇵', agency: 'JAXA' },
                    { flag: '🇨🇦', agency: 'CSA' },
                  ].map(({ flag, agency }) => (
                    <span key={agency} className="inline-flex items-center gap-1 bg-white/8 border border-white/10 rounded-md px-2 py-1 text-xs text-gray-300">
                      <span className="text-base leading-none">{flag}</span>
                      <span>{agency}</span>
                    </span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-3 flex-1">Laboratoire orbital habité en continu depuis novembre 2000. Symbole ultime de la coopération internationale.</p>
                <div className="flex flex-col gap-1.5">
                  <a href="https://www.futura-sciences.com/sciences/definitions/astronautique-station-spatiale-internationale-2571/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="group-hover:underline">Dossier ISS — Futura Sciences</span>
                  </a>
                  <a href="https://cnes.fr/dossiers/stations-orbitales" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="group-hover:underline">Les stations orbitales — CNES</span>
                  </a>
                </div>
              </div>
              {/* ExoMars */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col">
                <p className="text-white font-semibold text-sm mb-1">ExoMars</p>
                <p className="text-blue-300 text-xs mb-2">ESA · Roscosmos</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-3 flex-1">
                  Programme conjoint ESA–Roscosmos pour explorer Mars et rechercher des traces de vie. Preuve que la coopération scientifique peut dépasser les tensions politiques.
                </p>
                <a
                  href="https://www.esa.int/Space_in_Member_States/France/Cap_sur_la_planete_rouge_avec_la_mission_ExoMars"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span className="group-hover:underline">Lire l'article ESA (fr)</span>
                </a>
              </div>
              {/* Artemis */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col">
                <p className="text-white font-semibold text-sm mb-1">Programme Artémis</p>
                <p className="text-blue-300 text-xs mb-2">NASA · ESA · JAXA · CSA</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-3 flex-1">Retour humain sur la Lune et préparation de l'exploration de Mars. L'ESA contribue au module de service de la capsule Orion.</p>
                <div className="flex flex-col gap-1.5">
                  <a href="https://cnes.fr/actualites/programme-artemis-retour-dhumains-lune" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="group-hover:underline">Programme Artémis — CNES</span>
                  </a>
                  <a href="https://cnes.fr/actualites/artemis-ii-un-nouveau-depart-vers-lune" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="group-hover:underline">Artémis II : cap vers la Lune — CNES</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Ressource PDF */}
          <div className="mb-4">
            <a
              href="https://www.cartolycee.net/IMG/pdf/les_puissances_spatiales_dans_le_monde.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-400/30 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium group-hover:text-orange-200 transition-colors">Les puissances spatiales dans le monde</p>
                <p className="text-gray-500 text-xs mt-0.5">Cartolycée — JC Fichet · PDF · Euroconsult, UCS, Assemblée nationale</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-orange-400 flex-shrink-0 transition-colors" />
            </a>
          </div>

          {/* Traité de l'espace */}
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-5">
            <h4 className="text-blue-300 font-semibold text-sm mb-2">Le Traité de l'Espace (1967)</h4>
            <p className="text-blue-100 text-sm leading-relaxed">
              Signé en pleine Guerre froide par les États-Unis, l'URSS et le Royaume-Uni, le <strong className="text-white">Traité sur l'Espace Extra-Atmosphérique</strong> pose un principe fondateur : l'espace est le patrimoine commun de l'humanité, non appropriable par aucune nation. Il interdit les armes nucléaires en orbite et sur les corps célestes. C'est une <strong className="text-white">première brique essentielle</strong> d'une législation spatiale internationale — mais elle laisse encore de nombreuses zones grises à consolider : exploitation des ressources lunaires, trafic orbital, débris spatiaux, militarisation de l'espace. Le droit spatial international reste un chantier ouvert, plus urgent que jamais face à la multiplication des acteurs privés et étatiques.
            </p>
          </div>
        </div>

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
