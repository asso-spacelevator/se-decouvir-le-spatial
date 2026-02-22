import { useState } from 'react';
import { Cpu, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

interface TechnicalSectionProps {
  onComplete: () => void;
}

export function TechnicalSection({ onComplete }: TechnicalSectionProps) {
  const { saveResponse } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const challenges = [
    {
      title: 'Extreme Temperatures',
      description: 'Rockets experience temperatures from -270°C in space to +3000°C during atmospheric reentry',
      icon: '🌡️'
    },
    {
      title: 'Massive Acceleration',
      description: 'Launch acceleration reaches 3-4G, requiring robust structural engineering',
      icon: '🚀'
    },
    {
      title: 'Precise Navigation',
      description: 'Sub-millimeter precision needed for orbital insertion and satellite deployment',
      icon: '🎯'
    },
    {
      title: 'Fuel Efficiency',
      description: 'Optimizing thrust-to-weight ratio while carrying maximum payload',
      icon: '⚡'
    }
  ];

  const questions = [
    {
      id: 'q1',
      question: 'What engineering challenge do you find most impressive, and why?',
      placeholder: 'Explain your choice...'
    },
    {
      id: 'q2',
      question: 'If you could improve one aspect of rocket design, what would it be?',
      placeholder: 'Think about efficiency, safety, cost, or environmental impact...'
    }
  ];

  const handleResponseChange = (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    for (const [questionId, response] of Object.entries(responses)) {
      if (response.trim()) {
        await saveResponse('technical', questionId, response);
      }
    }
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = Object.values(responses).some(r => r.trim().length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-900 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Cpu className="w-12 h-12 text-cyan-400" />
          <div>
            <div className="text-sm text-cyan-400 font-semibold uppercase tracking-wider">Section 2</div>
            <h2 className="text-4xl font-bold">A Technical Challenge</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Engineering the Impossible</h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Building a rocket that can escape Earth's gravity requires solving some of humanity's most complex
            engineering problems. Every component must work flawlessly under extreme conditions.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {challenges.map((challenge, index) => (
              <div key={index} className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                <div className="text-4xl mb-3">{challenge.icon}</div>
                <h4 className="font-semibold text-cyan-300 mb-2 text-lg">{challenge.title}</h4>
                <p className="text-sm text-gray-400">{challenge.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-6">
            <h4 className="font-semibold text-orange-300 mb-3">Research & Development</h4>
            <p className="text-gray-300 mb-4">
              ESA invests billions of euros annually in R&D to push the boundaries of rocket technology.
              This includes developing reusable components, more efficient propulsion systems, and
              environmentally friendly propellants.
            </p>
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-orange-500/20 rounded-full text-sm text-orange-200">Advanced Materials</span>
              <span className="px-3 py-1 bg-red-500/20 rounded-full text-sm text-red-200">AI Navigation</span>
              <span className="px-3 py-1 bg-yellow-500/20 rounded-full text-sm text-yellow-200">Green Fuels</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Your Technical Insights</h3>

          {questions.map((q) => (
            <div key={q.id} className="mb-6">
              <label className="block text-gray-300 mb-3 font-medium">{q.question}</label>
              <textarea
                value={responses[q.id] || ''}
                onChange={(e) => handleResponseChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          ))}

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
                Responses Saved!
              </>
            ) : (
              <>
                Continue to Manufacturing
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
