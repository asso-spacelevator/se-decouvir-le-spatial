import { useState, useEffect } from 'react';
import { Users, ChevronRight, CheckCircle, ExternalLink } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Navigation } from './Navigation';

interface Association {
  name: string;
  description: string;
  website: string;
  focus: string;
  icon: string;
}

interface AssociationsSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function AssociationsSection({ onComplete, onHome, onBack }: AssociationsSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('associations');
      setResponses(savedResponses);
    };
    loadResponses();
  }, []);

  const associations: Association[] = [
    {
      name: 'Planète Sciences',
      description: 'Association d\'éducation populaire aux sciences et techniques',
      website: 'https://www.planete-sciences.org/',
      focus: 'Ateliers, clubs et projets scientifiques pour jeunes',
      icon: '🔬'
    },
    {
      name: 'Space Elevator',
      description: 'Communauté passionnée par l\'espace et l\'innovation',
      website: 'https://space-elevator.org/',
      focus: 'Projets spatiaux et networking',
      icon: '🚀'
    },
    {
      name: 'ASTRE',
      description: 'Association pour le Spatial et ses Technologies',
      website: '',
      focus: 'Promotion du spatial auprès des jeunes',
      icon: '⭐'
    },
    {
      name: 'SWAN (Space Women Activation Network)',
      description: 'Réseau de femmes dans le spatial',
      website: '',
      focus: 'Diversité et inclusion dans l\'industrie spatiale',
      icon: '👩‍🚀'
    },
    {
      name: 'Eurêka',
      description: 'Association de culture scientifique',
      website: '',
      focus: 'Animations et ateliers scientifiques',
      icon: '💡'
    },
    {
      name: 'C\'est Génial',
      description: 'Promotion des métiers scientifiques et techniques',
      website: 'https://www.cgenial.org/',
      focus: 'Rencontres avec des professionnels, concours',
      icon: '🎓'
    }
  ];

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('associations', id, value);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = responses['interested']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-teal-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-8">
          <Users className="w-12 h-12 text-teal-400" />
          <div>
            <div className="text-sm text-teal-400 font-semibold uppercase tracking-wider">🤝 Ensemble</div>
            <h2 className="text-4xl font-bold">Qui pour m'accompagner ?</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <p className="text-gray-300 mb-6 text-lg">
            De nombreuses associations peuvent vous accompagner dans votre découverte du spatial, que vous soyez lycéen, étudiant ou simplement passionné :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {associations.map((association, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-400/30 rounded-xl p-6 hover:scale-105 transition-all"
              >
                <div className="text-4xl mb-3">{association.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{association.name}</h3>
                <p className="text-gray-300 mb-3 text-sm">{association.description}</p>
                <p className="text-teal-400 text-sm mb-3">
                  <strong>Focus :</strong> {association.focus}
                </p>
                {association.website && (
                  <a
                    href={association.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-teal-300 hover:text-teal-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visiter le site
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Votre Intérêt</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Quelle association vous intéresse le plus et pourquoi ? Ou bien, quel type d'accompagnement recherchez-vous ?
            </label>
            <textarea
              value={responses['interested'] || ''}
              onChange={(e) => handleResponseChange('interested', e.target.value)}
              placeholder="Partagez vos centres d'intérêt et vos besoins..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
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
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white'
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
                Continuer vers les Questions 💭
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
