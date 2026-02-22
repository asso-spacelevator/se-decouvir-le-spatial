import { useState, useEffect } from 'react';
import { Rocket, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

interface OperationsSectionProps {
  onComplete: () => void;
}

export function OperationsSection({ onComplete }: OperationsSectionProps) {
  const { saveResponse } = useSession();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [isLaunching, setIsLaunching] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const phases = [
    {
      time: 'T-10:00',
      title: 'Final Preparation',
      description: 'Launch director polls all stations for go/no-go decision. All systems nominal.',
      color: 'text-blue-400'
    },
    {
      time: 'T-03:00',
      title: 'Automated Sequence Start',
      description: 'Computer takes control. Fuel tanks pressurized. Final health checks complete.',
      color: 'text-cyan-400'
    },
    {
      time: 'T-00:10',
      title: 'Countdown',
      description: 'Final seconds. Engine ignition sequence initiated. Clamps ready to release.',
      color: 'text-yellow-400'
    },
    {
      time: 'T+00:00',
      title: 'LIFTOFF!',
      description: 'Main engines at full thrust. Launch clamps released. Ariane 6 rises!',
      color: 'text-orange-400'
    },
    {
      time: 'T+02:30',
      title: 'Booster Separation',
      description: 'Solid rocket boosters complete burn and separate. Main stage continues.',
      color: 'text-red-400'
    },
    {
      time: 'T+08:45',
      title: 'Stage Separation',
      description: 'Main stage separates. Upper stage ignites for orbital insertion.',
      color: 'text-purple-400'
    },
    {
      time: 'T+25:00',
      title: 'Orbital Insertion',
      description: 'Target orbit achieved. Payload fairing separates. Mission success!',
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Rocket className="w-12 h-12 text-orange-400" />
          <div>
            <div className="text-sm text-orange-400 font-semibold uppercase tracking-wider">Section 4</div>
            <h2 className="text-4xl font-bold">Operations - Relive the Launch</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Experience an Ariane 6 Launch</h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            From the final countdown to orbital insertion, experience the intense sequence of events
            that transform a grounded rocket into a spacecraft hurtling through the sky at 28,000 km/h.
          </p>

          {!isLaunching ? (
            <div className="text-center py-12">
              <button
                onClick={startLaunch}
                className="group relative px-12 py-6 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xl font-bold rounded-full hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <span className="relative z-10">INITIATE LAUNCH SEQUENCE</span>
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
                  <div className="text-2xl text-gray-400">COUNTDOWN TO LIFTOFF</div>
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
            <h3 className="text-2xl font-semibold mb-6">Share Your Experience</h3>

            <div className="mb-6">
              <label className="block text-gray-300 mb-3 font-medium">
                What was the most exciting part of the launch sequence? What surprised you?
              </label>
              <textarea
                value={responses['experience'] || ''}
                onChange={(e) => handleResponseChange('experience', e.target.value)}
                placeholder="Describe your experience of the virtual launch..."
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
                  Responses Saved!
                </>
              ) : (
                <>
                  Continue to Question Zone
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
