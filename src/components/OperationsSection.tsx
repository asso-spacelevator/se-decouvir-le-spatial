import { useState, useEffect } from 'react';
import { Rocket, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';

interface OperationsSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function OperationsSection({ onComplete, onHome, onBack }: OperationsSectionProps) {
  const { saveResponse } = useSession();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [isLaunching, setIsLaunching] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const phases = [
    {
      time: 'T-10:00',
      title: 'Préparations Finales',
      description: 'Le directeur de lancement interroge toutes les stations. Tous les systèmes sont nominaux.',
      color: 'text-blue-400'
    },
    {
      time: 'T-03:00',
      title: 'Début de la Séquence Automatisée',
      description: 'L\'ordinateur prend le contrôle. Les réservoirs sont pressurisés. Vérifications finales terminées.',
      color: 'text-cyan-400'
    },
    {
      time: 'T-00:10',
      title: 'Compte à Rebours',
      description: 'Dernières secondes. Séquence d\'allumage initiée. Verrous de lancement prêts.',
      color: 'text-yellow-400'
    },
    {
      time: 'T+00:00',
      title: 'DÉCOLLAGE !',
      description: 'Moteurs à pleine puissance. Verrous libérés. Ariane 6 s\'élève !',
      color: 'text-orange-400'
    },
    {
      time: 'T+02:30',
      title: 'Séparation des Boosters',
      description: 'Les propulseurs d\'appoint terminent leur combustion et se séparent.',
      color: 'text-red-400'
    },
    {
      time: 'T+08:45',
      title: 'Séparation d\'Étage',
      description: 'L\'étage principal se sépare. L\'étage supérieur s\'allume pour l\'insertion orbitale.',
      color: 'text-purple-400'
    },
    {
      time: 'T+25:00',
      title: 'Insertion Orbitale',
      description: 'L\'orbite cible est atteinte. La coiffe de charge utile se sépare. Mission réussie !',
      color: 'text-emerald-400'
    }
  ];

  useEffect(() => {
    if (!isLaunching) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const phaseTimer = setInterval(() => {
        setCurrentPhase(prev => {
          if (prev < phases.length - 1) {
            return prev + 1;
          } else {
            clearInterval(phaseTimer);
            return prev;
          }
        });
      }, 3000);
      return () => clearInterval(phaseTimer);
    }
  }, [isLaunching, countdown, currentPhase]);

  const startLaunch = () => {
    setIsLaunching(true);
    setCountdown(10);
    setCurrentPhase(0);
  };

  const handleResponseChange = (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (responses['experience']?.trim()) {
      await saveResponse('operations', 'launch_experience', responses['experience']);
    }
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = currentPhase === phases.length - 1 && responses['experience']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Rocket className="w-12 h-12 text-orange-400" />
          <div>
            <div className="text-sm text-orange-400 font-semibold uppercase tracking-wider">Section 4</div>
            <h2 className="text-4xl font-bold">Opérations - Le Lancement</h2>
          </div>
        </div>

        <Subsection
          title="Le Centre de Contrôle de Mission"
          content="Des centaines d'ingénieurs et de spécialistes travaillent ensemble au centre de contrôle. Chaque étape du lancement est coordonnée avec une précision militaire. Les données de milliers de capteurs sont traitées en temps réel pour assurer la sécurité du vol."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="🎛️"
        />

        <Subsection
          title="Les Phases de Vol"
          content="De T-10:00 au décollage, puis de T+00:00 à l'insertion orbitale, chaque seconde compte. Les moteurs doivent fonctionner avec une précision extrême, les systèmes de séparation doivent se déclencher exactement au bon moment, et les charges utiles doivent être déployées dans la bonne trajectoire."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="🛸"
        />

        <Subsection
          title="Après le Décollage"
          content="Une fois en orbite, la fusée a terminé sa mission. Les satellites ou autres charges utiles se séparent et commencent leurs propres missions. Les étages de la fusée se désorbient de manière contrôlée pour limiter les débris spatiaux et protéger l'environnement orbital."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="🌌"
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Vivre le Lancement d'Ariane 6</h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Du compte à rebours final à l'insertion orbitale, expérience la séquence intense
            qui transforme une fusée posée au sol en vaisseau spatial lancé à 28 000 km/h.
          </p>

          {!isLaunching ? (
            <div className="text-center py-12">
              <button
                onClick={startLaunch}
                className="group relative px-12 py-6 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xl font-bold rounded-full hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <span className="relative z-10">LANCER LA SÉQUENCE</span>
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>
          ) : (
            <div>
              {countdown > 0 ? (
                <div className="text-center py-12">
                  <div className="text-8xl font-bold text-orange-400 animate-pulse mb-4">
                    {countdown}
                  </div>
                  <div className="text-2xl text-gray-400">COMPTE À REBOURS</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {phases.slice(0, currentPhase + 1).map((phase, index) => (
                    <div
                      key={index}
                      className={`p-5 rounded-lg border transition-all duration-500 ${
                        index === currentPhase
                          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400 shadow-lg scale-105'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xl font-bold ${phase.color}`}>{phase.time}</span>
                        {index < currentPhase && <CheckCircle className="w-6 h-6 text-green-400" />}
                        {index === currentPhase && <span className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></span>}
                      </div>
                      <h4 className="text-xl font-semibold mb-2">{phase.title}</h4>
                      <p className="text-gray-400">{phase.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {currentPhase === phases.length - 1 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-semibold mb-6">Partagez Votre Expérience</h3>

            <div className="mb-6">
              <label className="block text-gray-300 mb-3 font-medium">
                Quelle était la partie la plus passionnante de la séquence de lancement ? Qu'est-ce qui vous a surpris ?
              </label>
              <textarea
                value={responses['experience'] || ''}
                onChange={(e) => handleResponseChange('experience', e.target.value)}
                placeholder="Décrivez votre expérience du lancement virtuel..."
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
                  Continuer vers la Zone de Questions
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
