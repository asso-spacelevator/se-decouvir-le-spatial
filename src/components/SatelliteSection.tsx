import { useState, useEffect } from 'react';
import { Satellite, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';

interface SatelliteSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function SatelliteSection({ onComplete, onHome, onBack }: SatelliteSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedOrbit, setSelectedOrbit] = useState<number | null>(null);

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
      altitude: '160 - 2 000 km',
      period: '90 - 120 minutes',
      missions: 'Station Spatiale Internationale (ISS), observation de la Terre, constellations internet (Starlink)',
      advantages: 'Images haute résolution, latence faible pour communications, coût de lancement réduit',
      challenges: 'Nécessite beaucoup de satellites pour couverture globale, friction atmosphérique résiduelle',
      examples: '🛰️ ISS (408 km), Hubble (540 km), Starlink (550 km)'
    },
    {
      name: 'Orbite Moyenne (MEO)',
      altitude: '2 000 - 35 786 km',
      period: '2 - 24 heures',
      missions: 'Navigation (GPS, Galileo, GLONASS), communications',
      advantages: 'Couverture terrestre étendue, compromis entre coût et performance',
      challenges: 'Radiation Van Allen, coût de lancement élevé',
      examples: '🧭 GPS (20 200 km), Galileo (23 222 km)'
    },
    {
      name: 'Orbite Géostationnaire (GEO)',
      altitude: '35 786 km',
      period: '24 heures (synchrone avec la Terre)',
      missions: 'Météorologie, télécommunications, diffusion TV',
      advantages: 'Position fixe dans le ciel, couverture continue d\'une zone, antennes terrestres fixes',
      challenges: 'Latence importante (500ms), coût de lancement très élevé, zone encombrée',
      examples: '📡 Météosat, satellites de télécommunications Astra/Eutelsat'
    },
    {
      name: 'Orbites Spéciales',
      altitude: 'Variable',
      period: 'Variable',
      missions: 'Observation polaire, missions scientifiques, surveillance militaire',
      advantages: 'Orbites héliosynchrones (même heure locale), polaires (survol des pôles)',
      challenges: 'Complexité de maintien, consommation élevée de carburant',
      examples: '🌍 Sentinel (Copernicus), satellites d\'observation météo polaires'
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

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = selectedOrbit !== null && responses['mission_idea']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-cyan-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-8">
          <Satellite className="w-12 h-12 text-cyan-400" />
          <div>
            <div className="text-sm text-cyan-400 font-semibold uppercase tracking-wider">🛰️ En Orbite</div>
            <h2 className="text-4xl font-bold">Satellites et Orbites</h2>
          </div>
        </div>

        <Subsection
          title="Les Sentinelles de l'Espace"
          content="Plus de 8 000 satellites opérationnels orbitent autour de la Terre. Ils fournissent des services essentiels : GPS pour la navigation, télécommunications, prévisions météo, observation de la Terre, surveillance des océans, et bien plus. Sans satellites, notre monde moderne s'arrêterait."
          icon="🛰️"
        />

        <Subsection
          title="Copernicus : L'Œil Européen"
          content="Copernicus est le programme européen d'observation de la Terre le plus ambitieux au monde. Avec sa constellation de satellites Sentinel, il surveille en continu l'atmosphère, les océans, les terres émergées et le climat. Ces données ouvertes sont utilisées pour la gestion des catastrophes, l'agriculture, la surveillance environnementale et la recherche climatique."
          icon="🌍"
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Les Différentes Orbites</h3>
          <p className="text-gray-300 mb-6">
            Chaque orbite a ses caractéristiques uniques. Explorez les différentes altitudes et leurs usages :
          </p>

          <div className="space-y-4 mb-6">
            {orbits.map((orbit, index) => (
              <button
                key={index}
                onClick={() => handleOrbitSelect(index)}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                  selectedOrbit === index
                    ? 'border-cyan-400 bg-cyan-500/20 scale-[1.02]'
                    : 'border-white/10 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-xl">{orbit.name}</h4>
                  <span className="text-sm text-cyan-400 font-mono">{orbit.altitude}</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">Période orbitale : {orbit.period}</p>
                <p className="text-gray-300">{orbit.missions}</p>
              </button>
            ))}
          </div>

          {selectedOrbit !== null && (
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">✅ Avantages</h4>
                <p className="text-gray-200">{orbits[selectedOrbit].advantages}</p>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">⚠️ Défis</h4>
                <p className="text-gray-200">{orbits[selectedOrbit].challenges}</p>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">📍 Exemples</h4>
                <p className="text-gray-200">{orbits[selectedOrbit].examples}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Imaginez Votre Mission</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Si vous pouviez placer un satellite sur n'importe quelle orbite, quelle mission lui confieriez-vous et pourquoi ?
            </label>
            <textarea
              value={responses['mission_idea'] || ''}
              onChange={(e) => handleResponseChange('mission_idea', e.target.value)}
              placeholder="Décrivez votre mission spatiale idéale (observation, communication, science...)..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
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
