import { useState, useEffect } from 'react';
import { Satellite, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';
import { Quiz } from './Quiz';
import { AvatarGuide } from './AvatarGuide';
import { SatelliteLabelGame } from './SatelliteLabelGame';
import { SatelliteTimeline } from './SatelliteTimeline';
import { SatelliteDistribution } from './SatelliteDistribution';

const SAT_LINES = [
  { speaker: 'boy' as const,  text: "On sait que les satellites sont utiles — mais comment est-ce qu'on les construit et où les place-t-on ?" },
  { speaker: 'girl' as const, text: "Cette section plonge dans la mécanique : orbites, conception, durée de vie, propulsion..." },
  { speaker: 'boy' as const,  text: "Explore l'animation, puis choisis une orbite pour voir ses défis d'ingénierie !" },
];

interface SatelliteSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function SatelliteSection({ onComplete, onHome, onBack }: SatelliteSectionProps) {
  const { saveResponse, getResponses, saveQuizScore } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedOrbit, setSelectedOrbit] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('satellites');
      setResponses(savedResponses);
      if (savedResponses.selectedOrbit) {
        setSelectedOrbit(parseInt(savedResponses.selectedOrbit));
      }
    };
    loadResponses();
  }, []);

  const orbits = [
    {
      name: 'Orbite Basse (LEO)',
      altitude: '160 – 2 000 km',
      period: '90 – 120 min par tour',
      engineering: 'Satellites plus petits et moins coûteux à lancer. Pour assurer une couverture continue, il faut des constellations de dizaines à des milliers de satellites (ex : Starlink compte plus de 5 000 unités). La friction atmosphérique résiduelle fait descendre progressivement l\'orbite : les satellites doivent embarquer des petits moteurs pour se maintenir et se désorbiter en fin de vie.',
      challenges: 'Collision avoidance permanent, gestion des débris spatiaux, renouvellement fréquent de la flotte',
      funFact: '👁️ Fun Fact : L\'ISS est visible à l\'œil nu ! Elle brille comme une étoile filante lente et traverse le ciel en 2 à 5 minutes. Des applications comme "Spot The Station" (NASA) ou "ISS Detector" te disent exactement à quelle heure regarder et dans quelle direction — souvent le soir ou à l\'aube, quand le Soleil l\'éclaire encore.',
      videoTitle: 'Interview : Ingénieur en constellations LEO'
    },
    {
      name: 'Orbite Moyenne (MEO)',
      altitude: '2 000 – 35 786 km',
      period: '2 – 24 heures',
      engineering: 'Zone idéale pour la navigation (GPS, Galileo). Un satellite MEO couvre une large zone terrestre avec un seul engin, contrairement au LEO. La conception doit résister aux ceintures de radiation de Van Allen — des protections spéciales (blindage, composants durcis) sont indispensables. Les satellites GPS embarquent des horloges atomiques d\'une précision de 1 nanoseconde.',
      challenges: 'Radiations Van Allen intenses, coût de lancement plus élevé, orbites encombrées par les débris',
      funFact: '⏱️ Fun Fact : Les horloges atomiques de Galileo sont si précises qu\'elles ne se décalent que d\'une seconde en 3 millions d\'années. Sans cette précision, le GPS aurait une erreur de kilomètres, pas de mètres !',
      videoTitle: 'Interview : Spécialiste des systèmes de navigation'
    },
    {
      name: 'Orbite Géostationnaire (GEO)',
      altitude: '35 786 km exactement',
      period: '24 heures – synchrone avec la Terre',
      engineering: 'Un satellite GEO pèse souvent plusieurs tonnes et coûte 300 à 500 millions d\'euros. Il doit maintenir sa position précisément (station-keeping) grâce à de petits propulseurs tout au long de ses 15 ans de vie. La chaleur est un défi majeur : d\'un côté du satellite il fait +150°C, de l\'autre -150°C. Les panneaux solaires doivent basculer pour toujours faire face au Soleil.',
      challenges: 'Orbite très encombrée (moins de 1 800 positions disponibles, régulées par l\'ITU), latence de 500ms pour les signaux',
      funFact: '📺 Fun Fact : Il n\'existe qu\'UNE SEULE orbite géostationnaire — un anneau de 36 000 km de diamètre. Les positions dessus sont si précieuses qu\'elles sont attribuées par un organisme de l\'ONU, comme des terrains à construire !',
      videoTitle: 'Interview : Ingénieur télécoms GEO'
    },
    {
      name: 'Orbites Polaires & Héliosynchrones',
      altitude: '400 – 1 000 km (variable)',
      period: 'Variable selon altitude',
      engineering: 'En inclinant l\'orbite à ~98°, le satellite survole les pôles et passe au-dessus de chaque point de la Terre une fois par jour. L\'orbite héliosynchrone est calibrée pour que le satellite passe toujours à la même heure locale solaire — garantissant un éclairage constant d\'une image à l\'autre, essentiel pour comparer des photos prises à des mois d\'intervalle.',
      challenges: 'Consommation élevée de carburant pour maintien d\'orbite, fenêtres de lancement très précises',
      funFact: '📸 Fun Fact : Les satellites Sentinel-2 de Copernicus prennent des images à 10 m de résolution, couvrent l\'intégralité des terres émergées tous les 5 jours et produisent 1,6 téraoctet de données par jour — mises en ligne gratuitement !',
      videoTitle: 'Interview : Ingénieur observation terrestre'
    }
  ];

  const quizQuestions = [
    {
      id: 'satellite_q1',
      question: 'Pourquoi les satellites GPS embarquent-ils des horloges atomiques ultra-précises ?',
      options: [
        { id: 'a', text: 'Pour économiser de l\'énergie', isCorrect: false },
        { id: 'b', text: 'Pour synchroniser les autres satellites', isCorrect: false },
        { id: 'c', text: 'Car la localisation GPS repose sur des mesures de temps à la nanoseconde', isCorrect: true },
        { id: 'd', text: 'Pour faciliter la communication avec les stations au sol', isCorrect: false }
      ],
      explanation: 'Le GPS calcule une position en mesurant le temps que met un signal radio à voyager depuis au moins 4 satellites. À la vitesse de la lumière, 1 nanoseconde d\'erreur se traduit par 30 cm d\'imprécision au sol. Une horloge ordinaire rendrait le GPS inutilisable après quelques minutes.'
    }
  ];

  const handleOrbitSelect = async (index: number) => {
    setSelectedOrbit(index);
    await saveResponse('satellites', 'selectedOrbit', String(index));
  };

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('satellites', id, value);
  };

  const handleQuizScoreUpdate = async (points: number) => {
    await saveQuizScore('satellites', 'satellite_q1', points, points > 0);
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

  const canSubmit = quizCompleted && selectedOrbit !== null && responses['mission_idea']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-cyan-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-6">
          <Satellite className="w-12 h-12 text-cyan-400" />
          <div>
            <div className="text-sm text-cyan-400 font-semibold uppercase tracking-wider">🛰️ Ingénierie Orbitale</div>
            <h2 className="text-4xl font-bold">Comment Construire et Placer un Satellite</h2>
          </div>
        </div>

        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-cyan-500/20">
          <AvatarGuide lines={SAT_LINES} interval={4000} />
        </div>

        {/* Frise chronologique */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📅</span>
            <h3 className="text-2xl font-bold text-white">70 ans de satellites</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            De Spoutnik en 1957 à plus de 7 500 satellites actifs aujourd'hui — une révolution en quelques décennies.
          </p>
          <SatelliteTimeline />
        </div>

        {/* Anatomie — contenu CNES */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🔩</span>
            <h3 className="text-2xl font-bold text-white">Anatomie d'un satellite</h3>
          </div>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Chaque satellite a une mission unique, mais tous partagent la même architecture fondamentale en deux parties — selon le dossier CNES.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Plateforme */}
            <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-5">
              <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                <span>🏗️</span> La Plateforme (Bus)
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                La plateforme fournit toutes les ressources nécessaires au fonctionnement du satellite. Elle regroupe les <strong className="text-white">servitudes</strong> qui assurent :
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                {['Navigation & contrôle d\'attitude', 'Propulsion (réservoirs + moteurs-fusées)', 'Communications avec la Terre', 'Gestion thermique (-150°C à +150°C)', 'Alimentation électrique (batteries)'].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-blue-400 flex-shrink-0 mt-0.5">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Charge utile */}
            <div className="bg-teal-500/8 border border-teal-500/20 rounded-xl p-5">
              <h4 className="font-bold text-teal-300 mb-2 flex items-center gap-2">
                <span>🎯</span> La Charge Utile
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                La charge utile, c'est <strong className="text-white">le passager à bord</strong> — les instruments qui réalisent la vraie mission :
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                {['Appareil de prise de vue (optique, radar)', 'Altimètre (mesure le niveau des océans)', 'Télescope (observation de l\'Univers)', 'Transpondeur de télécommunications', 'Horloge atomique (navigation GNSS)'].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-teal-400 flex-shrink-0 mt-0.5">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Panneaux solaires */}
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-5 mb-4">
            <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
              <span>☀️</span> Panneaux Solaires — l'énergie autonome
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Chaque satellite produit sa propre énergie. La taille des panneaux dépend de la distance au Soleil : les panneaux de la sonde <strong className="text-white">Juice</strong> (ESA, en route vers Jupiter) font <strong className="text-white">27 m de long</strong> — plus grands qu'un terrain de tennis ! À 800 millions de km du Soleil, la lumière est 25 fois plus faible qu'en orbite terrestre.
            </p>
          </div>
          {/* Matériaux */}
          <div className="bg-white/4 border border-white/10 rounded-xl p-5">
            <h4 className="font-bold text-gray-200 mb-2 flex items-center gap-2">
              <span>🛡️</span> Matériaux & Survie dans l'espace
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Chaque composant est conçu pour résister aux <strong className="text-white">débris et micro-météorites</strong>, aux <strong className="text-white">grands écarts de température</strong> (de -150°C à +150°C en quelques minutes), aux <strong className="text-white">radiations</strong> et aux vibrations du lancement. La couverture dorée caractéristique des satellites est une <strong className="text-white">couverture thermique multi-couches</strong> — elle régule la température comme une thermos.
            </p>
          </div>
          <div className="mt-4 text-right">
            <a href="https://cnes.fr/dossiers/satellites" target="_blank" rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 underline">
              Source : CNES — Dossier Les Satellites ↗
            </a>
          </div>
        </div>

        <Subsection
          title="La Mécanique Orbitale : pourquoi les satellites ne tombent-ils pas ?"
          content="Un satellite est en chute libre perpétuelle — mais il va si vite latéralement que la courbure de la Terre s'écarte aussi vite qu'il tombe. C'est l'équilibre entre la vitesse tangentielle et l'attraction gravitationnelle. Plus l'orbite est haute, plus la période s'allonge : à 400 km (LEO) il faut 7,7 km/s et 90 minutes ; à 36 000 km (GEO) seulement 3,1 km/s, mais la distance est 90 fois plus grande."
          icon="🌐"
        />

        <Subsection
          title="Durée de Vie et Fin de Mission"
          content="Un satellite est conçu pour 10 à 15 ans. Le facteur limitant n'est généralement pas la panne des instruments, mais l'épuisement du carburant de contrôle d'attitude et de station-keeping. À l'issue de sa vie, il doit être mis sur une orbite cimetière (GEO) ou désorbité pour brûler dans l'atmosphère (LEO) : c'est une exigence réglementaire pour éviter la prolifération des débris spatiaux. Aujourd'hui, plus de 27 000 objets de plus de 10 cm sont suivis en orbite."
          icon="♻️"
        />

        {/* Satellite label game */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <SatelliteLabelGame />
        </div>

        {/* Distribution par catégories */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📊</span>
            <h3 className="text-2xl font-bold text-white">Qui orbite là-haut ?</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Répartition des 7 500 satellites actifs par usage et par orbite.
          </p>
          <SatelliteDistribution />
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-2">Explorez les Défis d'Ingénierie par Orbite</h3>
          <p className="text-gray-400 mb-6">Chaque altitude impose ses propres contraintes. Sélectionnez-en une pour voir les détails techniques.</p>

          <div className="space-y-4">
            {orbits.map((orbit, index) => (
              <div key={index}>
                <button
                  onClick={() => handleOrbitSelect(index)}
                  className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                    selectedOrbit === index
                      ? 'border-cyan-400 bg-cyan-500/20 scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-xl">{orbit.name}</h4>
                    <span className="text-sm text-cyan-400 font-mono">{orbit.altitude}</span>
                  </div>
                  <p className="text-sm text-gray-400">Période orbitale : {orbit.period}</p>
                </button>

                {selectedOrbit === index && (
                  <div className="mt-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-6 space-y-4">
                    <div>
                      <h4 className="font-semibold text-cyan-300 mb-2">⚙️ Contraintes d'ingénierie</h4>
                      <p className="text-gray-200 leading-relaxed">{orbit.engineering}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-300 mb-2">⚠️ Défis principaux</h4>
                      <p className="text-gray-200">{orbit.challenges}</p>
                    </div>
                    {orbit.funFact && (
                      <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-4">
                        <p className="text-cyan-100">{orbit.funFact}</p>
                      </div>
                    )}
                    {orbit.videoTitle && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm italic">📹 {orbit.videoTitle} — vidéo à venir</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Quiz
          questions={quizQuestions}
          onScoreUpdate={handleQuizScoreUpdate}
          onComplete={handleQuizComplete}
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mt-8">
          <h3 className="text-2xl font-semibold mb-6">Imaginez Votre Mission</h3>
          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Si vous deviez concevoir un satellite, quelle orbite choisiriez-vous et quels défis techniques anticiperiez-vous ?
            </label>
            <textarea
              value={responses['mission_idea'] || ''}
              onChange={(e) => handleResponseChange('mission_idea', e.target.value)}
              placeholder="Décrivez votre choix d'orbite, la mission et les principaux défis d'ingénierie..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitted}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              submitted
                ? 'bg-green-600 text-white'
                : canSubmit
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white'
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
                Continuer vers l'Au-delà 🌌
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
