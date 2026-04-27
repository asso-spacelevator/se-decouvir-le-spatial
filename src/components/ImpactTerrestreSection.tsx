import { useState, useEffect } from 'react';
import { Earth, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';
import { Quiz } from './Quiz';
import { AvatarGuide } from './AvatarGuide';

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

        <Subsection
          title="Surveiller la Santé de notre Planète"
          content="Le programme européen Copernicus met à disposition de tous — gratuitement — des images satellites de la Terre entière, actualisées plusieurs fois par semaine. Des scientifiques, des gouvernements et des ONG s'en servent pour mesurer la fonte des glaces polaires, suivre la déforestation en Amazonie, cartographier les zones inondées après un cyclone, ou estimer les rendements agricoles d'un pays. Sans cette vue depuis l'espace, nous serions aveugles face au changement climatique."
          icon="🌿"
        />

        <Subsection
          title="Sauver des Vies : Gestion des Catastrophes"
          content="Lors d'un tremblement de terre, d'une inondation ou d'un incendie de forêt, les satellites d'observation deviennent une bouée de sauvetage. En quelques heures, des images à haute résolution permettent d'identifier les zones détruites, de guider les convois de secours vers les zones coupées du monde et d'évaluer les dégâts. Le service Copernicus Emergency Management a été activé plus de 700 fois depuis sa création — pour des catastrophes en Europe et sur tous les continents."
          icon="🚨"
        />

        <Subsection
          title="Connecter les Oubliés du Numérique"
          content="Aujourd'hui encore, 2,6 milliards de personnes n'ont pas accès à internet. Dans les zones rurales d'Afrique, d'Asie centrale ou d'Amazonie, les satellites sont souvent la seule option réaliste. Au-delà d'internet, ils permettent la télémédecine (consultation médicale à distance), l'éducation en ligne pour des milliers d'élèves isolés, et des transactions bancaires dans des régions sans infrastructure. L'espace est un vecteur d'équité mondiale."
          icon="📶"
        />

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
