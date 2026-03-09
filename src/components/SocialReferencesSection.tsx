import { Instagram } from 'lucide-react';

interface SocialReference {
  name: string;
  handle: string;
  description: string;
  category: 'astronaut' | 'agency' | 'education';
  url: string;
}

export function SocialReferencesSection() {
  const references: SocialReference[] = [
    {
      name: 'Thomas Pesquet',
      handle: '@thom_astro',
      description: 'Astronaute français de l\'ESA',
      category: 'astronaut',
      url: 'https://www.instagram.com/thom_astro/'
    },
    {
      name: 'ESA France',
      handle: '@esafrance',
      description: 'Agence Spatiale Européenne',
      category: 'agency',
      url: 'https://www.instagram.com/esafrance/'
    },
    {
      name: 'CNES',
      handle: '@cnes_france',
      description: 'Centre National d\'Études Spatiales',
      category: 'agency',
      url: 'https://www.instagram.com/cnes_france/'
    },
    {
      name: 'Rêves d\'Espace',
      handle: '@revesdespace',
      description: 'Vulgarisation spatiale passionnante',
      category: 'education',
      url: 'https://www.instagram.com/revesdespace/'
    },
    {
      name: 'Cité de l\'Espace',
      handle: '@citeespace',
      description: 'Musée et centre de culture spatiale',
      category: 'education',
      url: 'https://www.instagram.com/citeespace/'
    }
  ];

  const categoryColors = {
    astronaut: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
    agency: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
    education: 'from-orange-500/20 to-red-500/20 border-orange-400/30'
  };

  const categoryLabels = {
    astronaut: 'Astronautes',
    agency: 'Agences Spatiales',
    education: 'Vulgarisation'
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
      <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
        <Instagram className="w-8 h-8 text-pink-400" />
        En quoi ça me concerne ?
      </h3>
      <p className="text-gray-300 mb-6">
        Suivez ces comptes pour rester connecté à l'actualité spatiale et découvrir des contenus inspirants :
      </p>

      <div className="space-y-6">
        {(['astronaut', 'agency', 'education'] as const).map((category) => (
          <div key={category}>
            <h4 className="text-lg font-semibold text-white mb-3">{categoryLabels[category]}</h4>
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
                        <p className="text-sm text-pink-400 mb-1">{ref.handle}</p>
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
  );
}
