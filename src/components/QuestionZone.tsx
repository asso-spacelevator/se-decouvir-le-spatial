import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

interface QuestionZoneProps {
  onComplete: () => void;
}

export function QuestionZone({ onComplete }: QuestionZoneProps) {
  const { submitQuestion } = useSession();
  const [category, setCategory] = useState<'career' | 'technical' | 'geopolitics' | 'general'>('general');
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: 'career', label: 'Career & Orientation', icon: '💼', color: 'blue' },
    { id: 'technical', label: 'Technical Questions', icon: '🔧', color: 'cyan' },
    { id: 'geopolitics', label: 'Geopolitics & Strategy', icon: '🌍', color: 'purple' },
    { id: 'general', label: 'General Questions', icon: '💬', color: 'emerald' }
  ];

  const exampleQuestions = [
    'What education path leads to a career in the space industry?',
    'How does the Ariane 6 compare to SpaceX rockets?',
    'What are the career opportunities at ESA?',
    'Why is Europe investing in its own launch capabilities?',
    'What skills are most valuable for space engineers?'
  ];

  const handleSubmit = async () => {
    if (questionText.trim()) {
      await submitQuestion(category, questionText, isAnonymous);
      setSubmitted(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Mail className="w-12 h-12 text-purple-400" />
          <div>
            <div className="text-sm text-purple-400 font-semibold uppercase tracking-wider">Question Zone</div>
            <h2 className="text-4xl font-bold">Ask Your Questions</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Get Expert Answers</h3>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Have questions about careers in space, technical details, or the future of European space programs?
            Submit your questions here, and industry experts will provide answers.
          </p>

          {!submitted ? (
            <>
              <div className="mb-6">
                <label className="block text-gray-300 mb-3 font-medium">Select Category</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id as any)}
                      className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                        category === cat.id
                          ? `bg-${cat.color}-500/20 border-${cat.color}-400`
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="text-2xl mr-3">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-3 font-medium">Your Question</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={5}
                />
                <div className="mt-3 text-sm text-gray-400">
                  <span className="font-medium">Need inspiration?</span> Try questions like:
                  <ul className="mt-2 space-y-1 ml-4">
                    {exampleQuestions.slice(0, 3).map((q, i) => (
                      <li key={i} className="text-gray-500">• {q}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 rounded border-white/10 bg-white/5 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Submit anonymously</span>
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!questionText.trim()}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  questionText.trim()
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
                Submit Question
              </button>
            </>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-400 mb-2">Question Submitted!</h3>
              <p className="text-gray-300 mb-6">
                Thank you for your question. Experts will review and answer it soon.
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20"
          >
            Complete Journey
          </button>
        </div>
      </div>
    </div>
  );
}
