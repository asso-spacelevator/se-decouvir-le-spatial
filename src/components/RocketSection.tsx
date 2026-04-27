import { useState, useEffect } from 'react';
import { Rocket, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';
import { Quiz } from './Quiz';
import { AvatarGuide } from './AvatarGuide';
import { Ariane6Diagram } from './Ariane6Diagram';

const ROCKET_LINES = [
  { speaker: 'boy' as const,  text: "On arrive aux lanceurs ! C'est la partie la plus spectaculaire — des millions de chevaux-vapeur au décollage." },
  { speaker: 'girl' as const, text: "Les ingénieurs doivent résoudre des défis dingues : 3000°C, précision au millimètre, poids minimal." },
  { speaker: 'boy' as const,  text: "Choisis un défi qui t'intéresse et explore comment les équipes l'ont relevé !" },
];

interface RocketSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function RocketSection({ onComplete, onHome, onBack }: RocketSectionProps) {
  const { saveResponse, getResponses, saveQuizScore } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('rockets');
      setResponses(savedResponses);
      if (savedResponses.selectedChallenge) {
        setSelectedChallenge(parseInt(savedResponses.selectedChallenge));
      }
    };
    loadResponses();
  }, []);

  const challenges = [
    {
      name: 'Températures Extrêmes',
      problem: 'Les moteurs de lanceur peuvent atteindre 3 000°C, tandis que l\'espace oscille entre -150°C et +150°C',
      solution: 'Utilisation de matériaux composites céramiques ultra-résistants et de systèmes de refroidissement actifs avec circulation d\'hydrogène liquide',
      innovation: 'Les boucliers thermiques modernes peuvent supporter des gradients de 3 000°C sur quelques centimètres d\'épaisseur',
      funFact: '🔥 Fun Fact : Le nez d\'un lanceur lors de la rentrée atmosphérique chauffe tellement qu\'il crée un plasma - un quatrième état de la matière - qui bloque temporairement les communications radio !',
      videoUrl: '',
      videoTitle: 'Interview : Ingénieur en Matériaux Thermiques'
    },
    {
      name: 'Puissance Colossale',
      problem: 'Il faut générer plus de 1 000 tonnes de poussée pour vaincre la gravité terrestre',
      solution: 'Moteurs à combustion d\'hydrogène et oxygène liquides, brûlant 300 kg de carburant par seconde',
      innovation: 'Un seul moteur Vulcain 2.1 produit une puissance équivalente à 1 500 voitures de F1 combinées',
      funFact: '💪 Fun Fact : Si vous pouviez canaliser toute la puissance d\'un moteur de lanceur dans une ampoule, elle brillerait 190 fois plus fort que le Soleil vu depuis la Terre !',
      videoUrl: '',
      videoTitle: 'Interview : Ingénieur en Propulsion Spatiale'
    },
    {
      name: 'Précision Absolue',
      problem: 'Une erreur de 0,1° lors du lancement peut manquer la cible orbitale de milliers de kilomètres',
      solution: 'Systèmes de guidage inertiel couplés au GPS, avec corrections en temps réel toutes les millisecondes',
      innovation: 'Les gyroscopes laser actuels détectent des rotations de l\'ordre du milliardième de degré',
      funFact: '🎯 Fun Fact : La précision requise est équivalente à lancer une fléchette depuis Paris et toucher le centre d\'une cible à New York !',
      videoUrl: '',
      videoTitle: 'Interview : Spécialiste en Guidage et Navigation'
    },
    {
      name: 'Légèreté Maximale',
      problem: 'Chaque kilogramme de structure en trop réduit la charge utile possible',
      solution: 'Alliages aluminium-lithium et composites carbone ultra-légers, avec optimisation par intelligence artificielle',
      innovation: 'Les nouveaux matériaux permettent un rapport résistance/poids 5 fois supérieur à l\'acier',
      funFact: '⚖️ Fun Fact : Économiser 1 kg sur la structure d\'un lanceur peut permettre de placer 100 kg supplémentaires en orbite. C\'est pourquoi chaque boulon est optimisé !',
      videoUrl: '',
      videoTitle: 'Interview : Ingénieur en Structures Spatiales'
    }
  ];

  const quizQuestions = [
    {
      id: 'rocket_q1',
      question: 'Quelle est la température maximale que peuvent atteindre les moteurs de lanceur ?',
      options: [
        { id: 'a', text: '500°C', isCorrect: false },
        { id: 'b', text: '1 500°C', isCorrect: false },
        { id: 'c', text: '3 000°C', isCorrect: true },
        { id: 'd', text: '5 000°C', isCorrect: false }
      ],
      explanation: 'Les moteurs de lanceur peuvent atteindre des températures extrêmes de 3 000°C. Des matériaux composites céramiques ultra-résistants et des systèmes de refroidissement actifs sont nécessaires pour gérer ces températures.'
    }
  ];

  const handleChallengeSelect = async (index: number) => {
    setSelectedChallenge(index);
    await saveResponse('rockets', 'selectedChallenge', String(index));
  };

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('rockets', id, value);
  };

  const handleQuizScoreUpdate = async (points: number) => {
    const currentQuestion = quizQuestions.find(() => true);
    if (currentQuestion) {
      await saveQuizScore('rockets', currentQuestion.id, points, points > 0);
    }
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

  const canSubmit = quizCompleted && selectedChallenge !== null && responses['reflection']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-orange-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-6">
          <Rocket className="w-12 h-12 text-orange-400" />
          <div>
            <div className="text-sm text-orange-400 font-semibold uppercase tracking-wider">🚀 Vers l'Orbite</div>
            <h2 className="text-4xl font-bold">Les Lanceurs : Défis et Innovation</h2>
          </div>
        </div>

        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/20">
          <AvatarGuide lines={ROCKET_LINES} interval={4000} />
        </div>

        <Subsection
          title="Ariane 6 : La Nouvelle Génération"
          content="Ariane 6 est le lanceur de nouvelle génération de l'Europe, conçu pour être plus flexible et économique qu'Ariane 5. Il peut placer jusqu'à 11,5 tonnes en orbite de transfert géostationnaire. Son premier vol a eu lieu en 2024, marquant une nouvelle ère pour l'accès européen à l'espace."
          icon="🚀"
        />

        <Subsection
          title="Fabrication de Pointe"
          content="La construction d'un lanceur nécessite une précision extrême. Les composants sont fabriqués dans des salles blanches avec une tolérance au micromètre. Chaque soudure, chaque boulon doit être parfait car une seule défaillance peut être catastrophique. Plus de 10 000 pièces composent un lanceur moderne."
          icon="⚙️"
        />

        <div className="mb-8">
          <Ariane6Diagram />
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Les Défis Techniques Majeurs</h3>
          <p className="text-gray-300 mb-6">
            Sélectionnez un défi pour découvrir comment les ingénieurs le résolvent :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {challenges.map((challenge, index) => (
              <button
                key={index}
                onClick={() => handleChallengeSelect(index)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedChallenge === index
                    ? 'border-orange-400 bg-orange-500/20 scale-105'
                    : 'border-white/10 bg-white/5 hover:border-orange-400/50 hover:bg-white/10'
                }`}
              >
                <h4 className="font-bold text-lg mb-2">{challenge.name}</h4>
                <p className="text-sm text-gray-400">{challenge.problem}</p>
              </button>
            ))}
          </div>

          {selectedChallenge !== null && (
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-orange-400 mb-2">💡 Solution Actuelle</h4>
                <p className="text-gray-200">{challenges[selectedChallenge].solution}</p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-400 mb-2">🔬 Le Saviez-vous ?</h4>
                <p className="text-gray-200">{challenges[selectedChallenge].innovation}</p>
              </div>
              {challenges[selectedChallenge].funFact && (
                <div className="bg-orange-500/10 border border-orange-400/20 rounded-lg p-4">
                  <p className="text-orange-100">{challenges[selectedChallenge].funFact}</p>
                </div>
              )}
              {challenges[selectedChallenge].videoTitle && (
                <div>
                  <h4 className="font-semibold text-orange-400 mb-3">📹 {challenges[selectedChallenge].videoTitle}</h4>
                  {challenges[selectedChallenge].videoUrl ? (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={challenges[selectedChallenge].videoUrl}
                        title="Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-8 text-center">
                      <p className="text-gray-400 italic">Vidéo à venir</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <Quiz
          questions={quizQuestions}
          onScoreUpdate={handleQuizScoreUpdate}
          onComplete={handleQuizComplete}
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mt-8">
          <h3 className="text-2xl font-semibold mb-6">Votre Réflexion</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Selon vous, quel est le défi le plus impressionnant à surmonter pour construire un lanceur, et pourquoi ?
            </label>
            <textarea
              value={responses['reflection'] || ''}
              onChange={(e) => handleResponseChange('reflection', e.target.value)}
              placeholder="Partagez vos réflexions sur l'ingénierie des lanceurs..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
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
                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'
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
                Continuer vers l'Orbite 🛰️
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
