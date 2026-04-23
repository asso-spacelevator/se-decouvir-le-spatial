import { useState, useEffect } from 'react';
import { Earth, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';
import { Quiz } from './Quiz';
import { AvatarGuide } from './AvatarGuide';

const IMPACT_LINES = [
  { speaker: 'girl' as const, text: "Tu sais que l'espace, c'est pas que de la science-fiction — ça change concrètement la vie sur Terre." },
  { speaker: 'boy' as const,  text: "Météo, GPS, internet, gestion des catastrophes... tout ça repose sur des satellites !" },
  { speaker: 'girl' as const, text: "Et dans cette section, on verra aussi comment les nations du monde coopèrent pour explorer ensemble." },
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
      question: 'Quelle application spatiale a le plus grand impact quotidien sur la population mondiale ?',
      options: [
        { id: 'a', text: 'Les missions habitées vers la Lune', isCorrect: false },
        { id: 'b', text: 'La navigation GPS et les télécommunications', isCorrect: true },
        { id: 'c', text: 'Les sondes interplanétaires', isCorrect: false },
        { id: 'd', text: 'Les vols touristiques suborbitaux', isCorrect: false }
      ],
      explanation: 'Les satellites de navigation (GPS, Galileo) et de télécommunications touchent des milliards de personnes chaque jour : guidage routier, appels téléphoniques, internet, transactions bancaires. Sans eux, notre monde connecté s\'arrêterait.'
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-6">
          <Earth className="w-12 h-12 text-green-400" />
          <div>
            <div className="text-sm text-green-400 font-semibold uppercase tracking-wider">🌍 Impact sur Terre</div>
            <h2 className="text-4xl font-bold">Le Spatial au Service de la Terre</h2>
          </div>
        </div>

        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <AvatarGuide lines={IMPACT_LINES} interval={4000} />
        </div>

        <Subsection
          title="Observer la Terre depuis l'Espace"
          content="Les satellites d'observation terrestre révolutionnent notre compréhension de la planète. Le programme européen Copernicus surveille les forêts, les océans, les glaciers et les zones urbaines en temps quasi-réel. Ces données sont essentielles pour lutter contre le changement climatique, gérer les ressources naturelles et anticiper les catastrophes naturelles comme les inondations ou les incendies de forêt."
          icon="🛰️"
        />

        <Subsection
          title="Météo, Agriculture et Gestion des Crises"
          content="Sans satellites météorologiques, prévoir un ouragan 5 jours à l'avance serait impossible. Les satellites Météosat de l'ESA sauvent des milliers de vies chaque année. En agriculture, des images satellites précises permettent d'optimiser l'irrigation et de détecter les maladies des cultures. Lors de catastrophes (tsunamis, séismes, inondations), les satellites guident les secours avec une précision inégalée."
          icon="🌦️"
        />

        <Subsection
          title="Communications, Connectivité et Inclusion Numérique"
          content="Plus de 3 milliards de personnes dans les zones rurales et reculées dépendent des satellites pour accéder à internet, aux services bancaires, à la télémédecine et à l'éducation. Des constellations comme Galileo (GPS européen) assurent la navigation de millions de véhicules, d'avions et de navires chaque jour. Le secteur spatial génère plus de 380 milliards d'euros par an dans l'économie mondiale."
          icon="📡"
        />

        <Subsection
          title="Collaboration Internationale : Construire l'Espace Ensemble"
          content="L'espace est l'un des rares domaines où nations rivales coopèrent. La Station Spatiale Internationale (ISS) réunit depuis 25 ans des astronautes de 19 pays : USA, Russie, Europe, Japon, Canada. L'ESA collabore avec la NASA, JAXA (Japon) et ISRO (Inde) sur des missions scientifiques majeures comme James Webb ou ExoMars. Des traités internationaux encadrent l'utilisation de l'espace pour le bien commun — un modèle unique de diplomatie scientifique."
          icon="🤝"
        />

        <Subsection
          title="L'Europe, Acteur Clé de l'Espace Mondial"
          content="L'ESA regroupe 22 États membres et coordonne les ambitions spatiales européennes : lanceurs Ariane, programme Galileo, Copernicus, missions vers Mars et la Lune. La France est le premier contributeur de l'ESA, avec le Centre Spatial Guyanais comme port de lancement de référence. Être autonome dans l'accès à l'espace, c'est garantir l'indépendance des services vitaux que les satellites fournissent aux citoyens européens."
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
              Selon vous, quel impact du spatial sur la Terre vous semble le plus important pour votre génération ?
            </label>
            <textarea
              value={responses['q1'] || ''}
              onChange={(e) => handleResponseChange('q1', e.target.value)}
              placeholder="Environnement, santé, connectivité, sécurité... partagez votre point de vue."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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
                ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
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
