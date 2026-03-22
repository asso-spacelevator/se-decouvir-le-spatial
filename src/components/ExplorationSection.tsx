import { useState, useEffect } from 'react';
import { Telescope, ChevronRight, CheckCircle, Moon, Sparkles } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';
import { Quiz } from './Quiz';

interface ExplorationSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function ExplorationSection({ onComplete, onHome, onBack }: ExplorationSectionProps) {
  const { saveResponse, getResponses, saveQuizScore } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('exploration');
      setResponses(savedResponses);
      if (savedResponses.selectedTopic) {
        setSelectedTopic(parseInt(savedResponses.selectedTopic));
      }
    };
    loadResponses();
  }, []);

  const explorationTopics = [
    {
      name: 'James Webb Space Telescope',
      icon: <Telescope className="w-8 h-8" />,
      description: 'Le plus puissant télescope spatial jamais construit',
      details: 'Lancé en 2021, JWST observe l\'univers dans l\'infrarouge. Son miroir de 6,5 mètres de diamètre, composé de 18 segments en béryllium plaqués or, capte la lumière des premières galaxies formées il y a 13,5 milliards d\'années. Positionné à 1,5 million de km de la Terre au point de Lagrange L2, il révolutionne notre compréhension de l\'univers.',
      achievements: 'Découverte des galaxies les plus anciennes, analyse d\'atmosphères d\'exoplanètes, images spectaculaires de nébuleuses',
      future: 'Recherche de biosignatures dans les atmosphères d\'exoplanètes habitables',
      funFact: '🥶 Fun Fact : James Webb doit rester à -233°C pour fonctionner ! Son bouclier solaire, de la taille d\'un court de tennis, protège ses instruments de la chaleur du Soleil.',
      videoUrl: '',
      videoTitle: 'Interview : Astrophysicien James Webb'
    },
    {
      name: 'Exploration Lunaire',
      icon: <Moon className="w-8 h-8" />,
      description: 'Le retour de l\'humanité sur la Lune',
      details: 'Le programme Artemis vise à établir une présence humaine durable sur la Lune d\'ici 2030. La station Gateway orbitera autour de la Lune, servant de relais pour les missions de surface. L\'objectif : exploiter les ressources lunaires (eau glacée aux pôles), tester les technologies pour Mars, et établir une base permanente.',
      achievements: 'Mission Artemis I (2022) réussie, sélection des sites d\'atterrissage au pôle Sud lunaire',
      future: 'Première femme et première personne de couleur sur la Lune (Artemis III, ~2026), base lunaire permanente',
      funFact: '🌙 Fun Fact : La Lune s\'éloigne de la Terre de 3,8 cm par an ! Dans 600 millions d\'années, les éclipses totales de Soleil ne seront plus possibles.',
      videoUrl: '',
      videoTitle: 'Interview : Chef de Mission Artemis'
    },
    {
      name: 'Astronomie Moderne',
      icon: <Sparkles className="w-8 h-8" />,
      description: 'Percer les mystères de l\'univers',
      details: 'L\'astronomie moderne combine télescopes terrestres géants (ELT, 39m de diamètre), télescopes spatiaux (JWST, Hubble), et détecteurs d\'ondes gravitationnelles (LIGO). Ces instruments détectent des exoplanètes, étudient la matière noire, observent les trous noirs et remontent aux origines de l\'univers. Plus de 5 000 exoplanètes ont été découvertes.',
      achievements: 'Première image d\'un trou noir (2019), détection d\'ondes gravitationnelles (2015), découverte de planètes habitables',
      future: 'Télescope géant ELT (2028), recherche de vie extraterrestre, cartographie complète de l\'univers proche',
      funFact: '🕳️ Fun Fact : Quand LIGO a détecté les premières ondes gravitationnelles en 2015, il a mesuré une déformation de l\'espace 10 000 fois plus petite que le diamètre d\'un proton !',
      videoUrl: '',
      videoTitle: 'Interview : Astronome Chercheur d\'Exoplanètes'
    },
    {
      name: 'Mars : La Prochaine Frontière',
      icon: <div className="text-3xl">🔴</div>,
      description: 'Destination Mars dans les prochaines décennies',
      details: 'Mars est la prochaine grande étape de l\'exploration humaine. Les rovers Perseverance et Curiosity y cherchent des traces de vie passée. Les défis sont immenses : voyage de 6-9 mois, radiations, gravité réduite (38% de la Terre), températures extrêmes (-60°C en moyenne). Production de carburant sur place (ISRU) et construction d\'habitats avec ressources locales seront essentiels.',
      achievements: 'Helicopter Ingenuity (premier vol sur une autre planète), découverte d\'eau liquide passée, analyse du sol martien',
      future: 'Missions habitées (années 2030-2040), établissement d\'une colonie permanente, terraformation (très long terme)',
      funFact: '🚁 Fun Fact : Ingenuity, le premier hélicoptère martien, doit tourner ses pales 5 fois plus vite que sur Terre à cause de l\'atmosphère ultra-fine de Mars (1% de la densité terrestre) !',
      videoUrl: '',
      videoTitle: 'Interview : Ingénieur Mission Mars'
    }
  ];

  const quizQuestions = [
    {
      id: 'exploration_q1',
      question: 'À quelle température doit fonctionner le télescope spatial James Webb ?',
      options: [
        { id: 'a', text: '-50°C', isCorrect: false },
        { id: 'b', text: '-100°C', isCorrect: false },
        { id: 'c', text: '-233°C', isCorrect: true },
        { id: 'd', text: '-273°C', isCorrect: false }
      ],
      explanation: 'Le télescope James Webb doit rester à -233°C pour fonctionner correctement ! Son bouclier solaire, de la taille d\'un court de tennis, protège ses instruments ultra-sensibles de la chaleur du Soleil.'
    }
  ];

  const handleTopicSelect = async (index: number) => {
    setSelectedTopic(index);
    await saveResponse('exploration', 'selectedTopic', String(index));
  };

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('exploration', id, value);
  };

  const handleQuizScoreUpdate = async (points: number) => {
    const currentQuestion = quizQuestions.find(() => true);
    if (currentQuestion) {
      await saveQuizScore('exploration', currentQuestion.id, points, points > 0);
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

  const canSubmit = quizCompleted && selectedTopic !== null && responses['dream']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-8">
          <Telescope className="w-12 h-12 text-purple-400" />
          <div>
            <div className="text-sm text-purple-400 font-semibold uppercase tracking-wider">🌌 Au-delà</div>
            <h2 className="text-4xl font-bold">Exploration Spatiale</h2>
          </div>
        </div>

        <Subsection
          title="L'Ère de l'Exploration"
          content="Nous vivons une époque extraordinaire de découvertes spatiales. Les télescopes révèlent les mystères de l'univers, les sondes explorent notre système solaire, et l'humanité se prépare à devenir une espèce multi-planétaire. Chaque mission repousse les limites de ce qui est possible."
          icon="🚀"
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Domaines d'Exploration</h3>
          <p className="text-gray-300 mb-6">
            Découvrez les grandes aventures spatiales en cours :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {explorationTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleTopicSelect(index)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedTopic === index
                    ? 'border-purple-400 bg-purple-500/20 scale-105'
                    : 'border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-purple-400">{topic.icon}</div>
                  <h4 className="font-bold text-lg">{topic.name}</h4>
                </div>
                <p className="text-sm text-gray-400">{topic.description}</p>
              </button>
            ))}
          </div>

          {selectedTopic !== null && (
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">📖 Description</h4>
                <p className="text-gray-200">{explorationTopics[selectedTopic].details}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">🏆 Réalisations</h4>
                <p className="text-gray-200">{explorationTopics[selectedTopic].achievements}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">🔮 Futur</h4>
                <p className="text-gray-200">{explorationTopics[selectedTopic].future}</p>
              </div>
              {explorationTopics[selectedTopic].funFact && (
                <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4">
                  <p className="text-purple-100">{explorationTopics[selectedTopic].funFact}</p>
                </div>
              )}
              {explorationTopics[selectedTopic].videoTitle && (
                <div>
                  <h4 className="font-semibold text-purple-400 mb-3">📹 {explorationTopics[selectedTopic].videoTitle}</h4>
                  {explorationTopics[selectedTopic].videoUrl ? (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={explorationTopics[selectedTopic].videoUrl}
                        title="Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-8 text-center">
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
          <h3 className="text-2xl font-semibold mb-6">Votre Vision de l'Avenir</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Quelle découverte ou mission spatiale vous inspire le plus, et quel rêve spatial aimeriez-vous voir se réaliser de votre vivant ?
            </label>
            <textarea
              value={responses['dream'] || ''}
              onChange={(e) => handleResponseChange('dream', e.target.value)}
              placeholder="Partagez votre vision de l'avenir de l'exploration spatiale..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={5}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitted}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              submitted
                ? 'bg-green-600 text-white'
                : canSubmit
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
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
                Continuer vers les Réseaux Sociaux 📱
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
