import { useState } from 'react';
import { Globe, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

interface GeopoliticalSectionProps {
  onComplete: () => void;
}

export function GeopoliticalSection({ onComplete }: GeopoliticalSectionProps) {
  const { saveResponse } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 'q1',
      question: 'Why is independent access to space important for Europe?',
      placeholder: 'Share your thoughts on European space sovereignty...'
    },
    {
      id: 'q2',
      question: 'What might happen if a country depends entirely on another nation to launch satellites?',
      placeholder: 'Consider security, economy, and strategic implications...'
    },
    {
      id: 'q3',
      question: 'Name one advantage Europe has in the global space race.',
      placeholder: 'Think about technology, cooperation, or infrastructure...'
    }
  ];

  const handleResponseChange = (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    for (const [questionId, response] of Object.entries(responses)) {
      if (response.trim()) {
        await saveResponse('geopolitical', questionId, response);
      }
    }
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = Object.keys(responses).length >= 2 &&
    Object.values(responses).some(r => r.trim().length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Globe className="w-12 h-12 text-blue-400" />
          <div>
            <div className="text-sm text-blue-400 font-semibold uppercase tracking-wider">Section 1</div>
            <h2 className="text-4xl font-bold">A Geopolitical Project</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Understanding Space as a Strategic Domain</h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Space is not just about science and exploration. It's about sovereignty, economics, and geopolitics.
            The ability to launch satellites independently determines a nation's strategic autonomy in defense,
            telecommunications, navigation, and Earth observation.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-300 mb-2">European Space Agency</h4>
              <p className="text-sm text-gray-400">22 member states collaborating on space exploration and technology</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <h4 className="font-semibold text-purple-300 mb-2">Ariane 6</h4>
              <p className="text-sm text-gray-400">Europe's next-generation heavy-lift launch vehicle</p>
            </div>
            <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
              <h4 className="font-semibold text-indigo-300 mb-2">Global Competition</h4>
              <p className="text-sm text-gray-400">Competing with USA, China, Russia, and private companies</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-200">
              <span className="font-semibold">Did you know?</span> Without independent launch capabilities,
              Europe would need to rely on other nations for critical satellite deployments, creating potential
              security vulnerabilities.
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Reflect on What You've Learned</h3>

          {questions.map((q) => (
            <div key={q.id} className="mb-6">
              <label className="block text-gray-300 mb-3 font-medium">{q.question}</label>
              <textarea
                value={responses[q.id] || ''}
                onChange={(e) => handleResponseChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
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
                Continue to Technical Challenge
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
