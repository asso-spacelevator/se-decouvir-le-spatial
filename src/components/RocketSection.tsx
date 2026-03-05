import { useState, useEffect } from 'react';
import { Rocket, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';

interface RocketSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function RocketSection({ onComplete, onHome, onBack }: RocketSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);

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
      problem: 'Les moteurs de fusée peuvent atteindre 3 000°C, tandis que l\'espace oscille entre -150°C et +150°C',
      solution: 'Utilisation de matériaux composites céramiques ultra-résistants et de systèmes de refroidissement actifs avec circulation d\'hydrogène liquide',
      innovation: 'Les boucliers thermiques modernes peuvent supporter des gradients de 3 000°C sur quelques centimètres d\'épaisseur',
      funFact: '🔥 Fun Fact : Le nez d\'une fusée lors de la rentrée atmosphérique chauffe tellement qu\'il crée un plasma - un quatrième état de la matière - qui bloque temporairement les communications radio !',
      videoUrl: 'https://www.youtube.com/embed/bZe5J8SVCYQ'
    },
    {
      name: 'Puissance Colossale',
      problem: 'Il faut générer plus de 1 000 tonnes de poussée pour vaincre la gravité terrestre',
      solution: 'Moteurs à combustion d\'hydrogène et oxygène liquides, brûlant 300 kg de carburant par seconde',
      innovation: 'Un seul moteur Vulcain 2.1 produit une puissance équivalente à 1 500 voitures de F1 combinées',
      funFact: '💪 Fun Fact : Si vous pouviez canaliser toute la puissance d\'un moteur de fusée dans une ampoule, elle brillerait 190 fois plus fort que le Soleil vu depuis la Terre !',
      videoUrl: 'https://www.youtube.com/embed/vYA0f6R5KAI'
    },
    {
      name: 'Précision Absolue',
      problem: 'Une erreur de 0,1° lors du lancement peut manquer la cible orbitale de milliers de kilomètres',
      solution: 'Systèmes de guidage inertiel couplés au GPS, avec corrections en temps réel toutes les millisecondes',
      innovation: 'Les gyroscopes laser actuels détectent des rotations de l\'ordre du milliardième de degré',
      funFact: '🎯 Fun Fact : La précision requise est équivalente à lancer une fléchette depuis Paris et toucher le centre d\'une cible à New York !',
      videoUrl: 'https://www.youtube.com/embed/bvim4rsNHkQ'
    },
    {
      name: 'Légèreté Maximale',
      problem: 'Chaque kilogramme de structure en trop réduit la charge utile possible',
      solution: 'Alliages aluminium-lithium et composites carbone ultra-légers, avec optimisation par intelligence artificielle',
      innovation: 'Les nouveaux matériaux permettent un rapport résistance/poids 5 fois supérieur à l\'acier',
      funFact: '⚖️ Fun Fact : Économiser 1 kg sur la structure d\'une fusée peut permettre de placer 100 kg supplémentaires en orbite. C\'est pourquoi chaque boulon est optimisé !',
      videoUrl: 'https://www.youtube.com/embed/lEr9cPpuAy8'
    }
  ];

  const influencers = [
    {
      name: 'Hugo Lisoir',
      platform: 'YouTube',
      description: 'Vulgarisation spatiale et actualités des lancements',
      url: 'https://www.youtube.com/@HugoLisoir',
      icon: '🚀'
    },
    {
      name: 'Stardust',
      platform: 'YouTube',
      description: 'La chaîne francophone de référence sur l\'espace',
      url: 'https://www.youtube.com/@StardustLab',
      icon: '⭐'
    },
    {
      name: 'Everyday Astronaut',
      platform: 'YouTube',
      description: 'Analyses techniques approfondies (EN)',
      url: 'https://www.youtube.com/@EverydayAstronaut',
      icon: '👨‍🚀'
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

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = selectedChallenge !== null && responses['reflection']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-orange-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-8">
          <Rocket className="w-12 h-12 text-orange-400" />
          <div>
            <div className="text-sm text-orange-400 font-semibold uppercase tracking-wider">🚀 Vers l'Orbite</div>
            <h2 className="text-4xl font-bold">Les Fusées : Défis et Innovation</h2>
          </div>
        </div>

        <Subsection
          title="Ariane 6 : La Nouvelle Génération"
          content="Ariane 6 est la fusée de nouvelle génération de l'Europe, conçue pour être plus flexible et économique qu'Ariane 5. Elle peut placer jusqu'à 11,5 tonnes en orbite de transfert géostationnaire. Son premier vol a eu lieu en 2024, marquant une nouvelle ère pour l'accès européen à l'espace."
          icon="🚀"
        />

        <Subsection
          title="Fabrication de Pointe"
          content="La construction d'une fusée nécessite une précision extrême. Les composants sont fabriqués dans des salles blanches avec une tolérance au micromètre. Chaque soudure, chaque boulon doit être parfait car une seule défaillance peut être catastrophique. Plus de 10 000 pièces composent une fusée moderne."
          icon="⚙️"
        />

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
              {challenges[selectedChallenge].videoUrl && (
                <div>
                  <h4 className="font-semibold text-orange-400 mb-3">📹 Vidéo Explicative</h4>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={challenges[selectedChallenge].videoUrl}
                      title="Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span>🎓</span>
            Pour Aller Plus Loin
          </h3>
          <p className="text-gray-300 mb-4">
            Découvrez ces créateurs de contenu passionnés qui expliquent l'actualité spatiale :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {influencers.map((influencer, index) => (
              <a
                key={index}
                href={influencer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-xl p-4 hover:scale-105 transition-all hover:border-orange-400 group"
              >
                <div className="text-3xl mb-2">{influencer.icon}</div>
                <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">
                  {influencer.name}
                </h4>
                <p className="text-xs text-orange-400 mb-1">{influencer.platform}</p>
                <p className="text-sm text-gray-400">{influencer.description}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Votre Réflexion</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Selon vous, quel est le défi le plus impressionnant à surmonter pour construire une fusée, et pourquoi ?
            </label>
            <textarea
              value={responses['reflection'] || ''}
              onChange={(e) => handleResponseChange('reflection', e.target.value)}
              placeholder="Partagez vos réflexions sur l'ingénierie des fusées..."
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
