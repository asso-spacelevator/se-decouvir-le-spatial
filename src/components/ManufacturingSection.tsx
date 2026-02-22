import { useState } from 'react';
import { Cog, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

interface ManufacturingSectionProps {
  onComplete: () => void;
}

export function ManufacturingSection({ onComplete }: ManufacturingSectionProps) {
  const { saveResponse } = useSession();
  const [selectedSystem, setSelectedSystem] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const subsystems = [
    {
      name: 'Propulsion System',
      description: 'Liquid hydrogen and oxygen engines producing over 1,000 tons of thrust',
      details: 'The Vulcain 2.1 engine powers the main stage, burning 300kg of fuel per second at 3,000°C',
      didYouKnow: 'A single Ariane 6 engine produces power equivalent to 1,500 Formula 1 cars combined'
    },
    {
      name: 'Thermal Protection',
      description: 'Advanced ceramic composites withstanding extreme temperature variations',
      details: 'Heat shields protect sensitive components from atmospheric friction and exhaust temperatures',
      didYouKnow: 'Thermal tiles can withstand temperature gradients of 3,000°C across just a few centimeters'
    },
    {
      name: 'Structure & Materials',
      description: 'Carbon fiber composites and aluminum-lithium alloys for maximum strength-to-weight ratio',
      details: 'Every kilogram saved in structure allows one more kilogram of payload to orbit',
      didYouKnow: 'The main tank is lighter than an SUV but holds 170 tons of cryogenic propellant'
    },
    {
      name: 'Avionics & Electronics',
      description: 'Radiation-hardened computers controlling all flight systems in real-time',
      details: 'Triple-redundant flight computers process millions of calculations per second',
      didYouKnow: 'The guidance system is accurate enough to hit a target the size of a football field from 36,000km'
    },
    {
      name: 'Navigation Systems',
      description: 'Inertial measurement units and GPS for precise trajectory control',
      details: 'Gyroscopes and accelerometers track position with millimeter precision',
      didYouKnow: 'Navigation systems can detect and compensate for wind gusts in milliseconds'
    },
    {
      name: 'Telecommunications',
      description: 'High-bandwidth telemetry links transmitting thousands of parameters',
      details: 'Real-time data transmission to ground control for monitoring and decision-making',
      didYouKnow: 'The rocket sends more data to Earth in one launch than a smartphone uses in a month'
    }
  ];

  const handleResponseChange = (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (responses['reflection']?.trim()) {
      await saveResponse('manufacturing', 'system_reflection', responses['reflection']);
    }
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = responses['reflection']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Cog className="w-12 h-12 text-emerald-400" />
          <div>
            <div className="text-sm text-emerald-400 font-semibold uppercase tracking-wider">Section 3</div>
            <h2 className="text-4xl font-bold">Cutting-Edge Manufacturing</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Inside the Rocket</h3>
          <p className="text-gray-300 mb-8 leading-relaxed">
            A modern rocket is a symphony of interconnected systems, each pushing the limits of engineering.
            Explore each subsystem to understand how they work together to achieve spaceflight.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {subsystems.map((system, index) => (
              <button
                key={index}
                onClick={() => setSelectedSystem(index)}
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
                  <span className="font-semibold">Did you know?</span> {subsystems[selectedSystem].didYouKnow}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Your Reflection</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Which subsystem fascinated you the most, and why? How do these systems work together?
            </label>
            <textarea
              value={responses['reflection'] || ''}
              onChange={(e) => handleResponseChange('reflection', e.target.value)}
              placeholder="Share your thoughts on the interconnected systems..."
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
                Responses Saved!
              </>
            ) : (
              <>
                Continue to Launch Operations
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
