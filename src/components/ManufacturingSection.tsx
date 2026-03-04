import { useState, useEffect } from 'react';
import { Cog, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';

interface ManufacturingSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function ManufacturingSection({ onComplete, onHome, onBack }: ManufacturingSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [selectedSystem, setSelectedSystem] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('manufacturing');
      setResponses(savedResponses);
      if (savedResponses.selectedSystem) {
        setSelectedSystem(parseInt(savedResponses.selectedSystem));
      }
      if (savedResponses.submitted === 'true') {
        setSubmitted(true);
      }
    };
    loadResponses();
  }, []);

  const subsystems = [
    {
      name: 'Système de Propulsion',
      description: 'Moteurs à hydrogène et oxygène liquides produisant plus de 1 000 tonnes de poussée',
      details: 'Le moteur Vulcain 2.1 alimente l\'étage principal, brûlant 300 kg de carburant par seconde à 3 000°C',
      didYouKnow: 'Un seul moteur Ariane 6 produit une puissance équivalente à 1 500 voitures de Formule 1 réunies'
    },
    {
      name: 'Protection Thermique',
      description: 'Composites céramiques avancés résistant à des variations de température extrêmes',
      details: 'Les boucliers thermiques protègent les composants sensibles de la friction atmosphérique et des gaz d\'échappement',
      didYouKnow: 'Les tuiles thermiques peuvent résister à des gradients de température de 3 000°C sur quelques centimètres'
    },
    {
      name: 'Structure et Matériaux',
      description: 'Composites en fibre de carbone et alliages aluminium-lithium pour le meilleur rapport poids-force',
      details: 'Chaque kilogramme économisé dans la structure permet un kilogramme supplémentaire de charge utile en orbite',
      didYouKnow: 'Le réservoir principal est plus léger qu\'un SUV mais contient 170 tonnes de carburant cryogénique'
    },
    {
      name: 'Avionique et Électronique',
      description: 'Ordinateurs durcis contre les radiations contrôlant tous les systèmes de vol en temps réel',
      details: 'Les ordinateurs de vol triple-redondants exécutent des millions de calculs par seconde',
      didYouKnow: 'Le système de guidage est assez précis pour frapper une cible de la taille d\'un terrain de football à 36 000 km'
    },
    {
      name: 'Systèmes de Navigation',
      description: 'Unités de mesure inertielle et GPS pour un contrôle de trajectoire précis',
      details: 'Les gyroscopes et accéléromètres suivi la position avec une précision millimétrique',
      didYouKnow: 'Les systèmes de navigation peuvent détecter et compenser les rafales de vent en millisecondes'
    },
    {
      name: 'Télécommunications',
      description: 'Liaisons de télémétrie haut débit transmettant des milliers de paramètres',
      details: 'Transmission de données en temps réel au contrôle au sol pour la surveillance et la prise de décision',
      didYouKnow: 'La fusée envoie plus de données à la Terre lors d\'un lancement qu\'un smartphone n\'en utilise en un mois'
    }
  ];

  const handleSystemSelect = async (index: number) => {
    setSelectedSystem(index);
    await saveResponse('manufacturing', 'selectedSystem', String(index));
  };

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('manufacturing', id, value);
  };

  const handleSubmit = async () => {
    await saveResponse('manufacturing', 'submitted', 'true');
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = responses['reflection']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Cog className="w-12 h-12 text-emerald-400" />
          <div>
            <div className="text-sm text-emerald-400 font-semibold uppercase tracking-wider">Section 3</div>
            <h2 className="text-4xl font-bold">Fabrication de Pointe</h2>
          </div>
        </div>

        <Subsection
          title="L'Assemblage et l'Intégration"
          content="L'assemblage d'une fusée est un processus hautement coordonné impliquant des milliers de techniciens et d'ingénieurs. Chaque composant doit être intégré avec une précision extrême. Les tests de compatibilité et d'intégration prennent des mois pour assurer que tous les systèmes fonctionnent harmonieusement."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="🔧"
        />

        <Subsection
          title="Les Tests et Validation"
          content="Avant le lancement, les fusées subissent des centaines de tests : tests d'environnement thermique, tests de vibration, tests de pression, et simulations du vol. Chaque test doit être réussi pour garantir la sécurité et le succès de la mission. Les standards de qualité sont extraordinairement rigoureux."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="✓"
        />

        <Subsection
          title="La Qualité et la Sécurité"
          content="Dans l'industrie spatiale, même une infime défaillance peut être catastrophique. Les normes de qualité sont parmi les plus strictes au monde. Chaque composant est tracé et documenté, et toute déviation des spécifications doit être justifiée et approuvée par les experts de la qualité."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="🛡️"
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Explorez les Sous-systèmes</h3>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Une fusée moderne est une symphonie de systèmes interconnectés, chacun repoussant les limites de l'ingénierie.
            Explorez chaque sous-système pour comprendre comment ils travaillent ensemble pour réaliser le vol spatial.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {subsystems.map((system, index) => (
              <button
                key={index}
                onClick={() => handleSystemSelect(index)}
                className={`text-left p-5 rounded-lg border transition-all duration-300 ${
                  selectedSystem === index
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 border-white/10 hover:border-emerald-400/50 hover:bg-white/10'
                }`}
              >
                <h4 className="font-semibold text-lg mb-2">{system.name}</h4>
                <p className="text-sm text-gray-400">{system.description}</p>
              </button>
            ))}
          </div>

          {selectedSystem !== null && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-6 animate-in fade-in duration-300">
              <h4 className="text-2xl font-bold text-emerald-300 mb-3">
                {subsystems[selectedSystem].name}
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                {subsystems[selectedSystem].details}
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  <span className="font-semibold">Le saviez-vous ?</span> {subsystems[selectedSystem].didYouKnow}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Votre Réflexion</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Quel sous-système vous a fasciné le plus, et pourquoi ? Comment ces systèmes travaillent-ils ensemble ?
            </label>
            <textarea
              value={responses['reflection'] || ''}
              onChange={(e) => handleResponseChange('reflection', e.target.value)}
              placeholder="Partagez vos réflexions sur les systèmes interconnectés..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
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
                ? 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white'
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
                Continuer vers les Opérations de Lancement
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
