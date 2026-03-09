import { useState, useEffect } from 'react';
import { Instagram, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Navigation } from './Navigation';

interface SocialReference {
  name: string;
  handle: string;
  description: string;
  category: 'astronaut' | 'agency' | 'education';
  url: string;
}

interface SocialReferencesSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function SocialReferencesSection({ onComplete, onHome, onBack }: SocialReferencesSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('social_references');
      setResponses(savedResponses);
    };
    loadResponses();
  }, []);

  const references: SocialReference[] = [
    {
      name: 'Thomas Pesquet',
      handle: '@thom_astro',
      description: 'Astronaute français de l\'ESA, partage ses missions et expériences spatiales',
      category: 'astronaut',
      url: 'https://www.instagram.com/thom_astro/'
    },
    {
      name: 'Sophie Adenot',
      handle: '@sophie.adenot',
      description: 'Nouvelle astronaute française de l\'ESA, ingénieure et pilote d\'essai',
      category: 'astronaut',
      url: 'https://www.instagram.com/sophie.adenot/'
    },
    {
      name: 'ESA France',
      handle: '@esafrance',
      description: 'Agence Spatiale Européenne - actualités des missions et découvertes',
      category: 'agency',
      url: 'https://www.instagram.com/esafrance/'
    },
    {
      name: 'CNES',
      handle: '@cnes_france',
      description: 'Centre National d\'Études Spatiales - projets spatiaux français',
      category: 'agency',
      url: 'https://www.instagram.com/cnes_france/'
    },
    {
      name: 'Rêves d\'Espace',
      handle: '@revesdespace',
      description: 'Vulgarisation spatiale passionnante et accessible à tous',
      category: 'education',
      url: 'https://www.instagram.com/revesdespace/'
    },
    {
      name: 'Cité de l\'Espace',
      handle: '@citeespace',
      description: 'Musée et centre de culture spatiale à Toulouse',
      category: 'education',
      url: 'https://www.instagram.com/citeespace/'
    },
    {
      name: 'Stardust',
      handle: '@stardust_space',
      description: 'Média de vulgarisation sur l\'espace et l\'astronomie',
      category: 'education',
      url: 'https://www.instagram.com/stardust_space/'
    }
  ];

  const categoryColors = {
    astronaut: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
    agency: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
    education: 'from-orange-500/20 to-red-500/20 border-orange-400/30'
  };

  const categoryLabels = {
    astronaut: 'Astronautes Français',
    agency: 'Agences Spatiales',
    education: 'Vulgarisation & Éducation'
  };

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('social_references', id, value);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = responses['favorite']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-pink-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-8">
          <Instagram className="w-12 h-12 text-pink-400" />
          <div>
            <div className="text-sm text-pink-400 font-semibold uppercase tracking-wider">📱 Réseaux Sociaux</div>
            <h2 className="text-4xl font-bold">En quoi ça me concerne ?</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <p className="text-gray-300 mb-6 text-lg">
            Suivez ces comptes pour rester connecté à l'actualité spatiale et découvrir des contenus inspirants au quotidien :
          </p>

          <div className="space-y-6">
            {(['astronaut', 'agency', 'education'] as const).map((category) => (
              <div key={category}>
                <h4 className="text-xl font-semibold text-white mb-3">{categoryLabels[category]}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {references
                    .filter((ref) => ref.category === category)
                    .map((ref, index) => (
                      <a
                        key={index}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`bg-gradient-to-br ${categoryColors[category]} rounded-xl p-5 hover:scale-105 transition-all border group`}
                      >
                        <div className="flex items-start gap-3">
                          <Instagram className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h5 className="font-bold text-white group-hover:text-pink-400 transition-colors">
                              {ref.name}
                            </h5>
                            <p className="text-sm text-pink-400 mb-2">{ref.handle}</p>
                            <p className="text-sm text-gray-300">{ref.description}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Votre Inspiration</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Quel compte vous inspire le plus et pourquoi ? Ou quel type de contenu spatial aimeriez-vous suivre ?
            </label>
            <textarea
              value={responses['favorite'] || ''}
              onChange={(e) => handleResponseChange('favorite', e.target.value)}
              placeholder="Partagez vos centres d'intérêt..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
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
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
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
                Continuer vers l'Accompagnement 🤝
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
