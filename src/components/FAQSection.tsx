import { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Navigation } from './Navigation';

interface FAQItem {
  question: string;
  answer: string;
  answeredBy: string;
}

interface FAQSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function FAQSection({ onComplete, onHome, onBack }: FAQSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('faq');
      setResponses(savedResponses);
      if (savedResponses.selectedQuestion) {
        setSelectedQuestion(parseInt(savedResponses.selectedQuestion));
      }
    };
    loadResponses();
  }, []);

  const faqItems: FAQItem[] = [
    {
      question: 'Le spatial, c\'est un monde fermé ?',
      answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]',
      answeredBy: 'À compléter'
    },
    {
      question: 'Le spatial, c\'est que pour les gens très intelligents ?',
      answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]',
      answeredBy: 'À compléter'
    },
    {
      question: 'Faut-il forcément faire une grande école pour travailler dans le spatial ?',
      answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]',
      answeredBy: 'À compléter'
    },
    {
      question: 'Quels sont les métiers accessibles dans le spatial ?',
      answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]',
      answeredBy: 'À compléter'
    },
    {
      question: 'Comment se former au spatial en France ?',
      answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]',
      answeredBy: 'À compléter'
    },
    {
      question: 'Y a-t-il de la place pour les femmes dans le spatial ?',
      answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]',
      answeredBy: 'À compléter'
    }
  ];

  const handleQuestionSelect = async (index: number) => {
    setSelectedQuestion(index);
    await saveResponse('faq', 'selectedQuestion', String(index));
  };

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('faq', id, value);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = selectedQuestion !== null && responses['own_question']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-8">
          <MessageCircle className="w-12 h-12 text-indigo-400" />
          <div>
            <div className="text-sm text-indigo-400 font-semibold uppercase tracking-wider">💭 Questions Fréquentes</div>
            <h2 className="text-4xl font-bold">Vos Questions sur le Spatial</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <p className="text-gray-300 mb-6 text-lg">
            Des professionnels du spatial répondent aux questions que vous vous posez :
          </p>

          <div className="space-y-4 mb-6">
            {faqItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuestionSelect(index)}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                  selectedQuestion === index
                    ? 'border-indigo-400 bg-indigo-500/20 scale-[1.02]'
                    : 'border-white/10 bg-white/5 hover:border-indigo-400/50 hover:bg-white/10'
                }`}
              >
                <h4 className="font-bold text-lg text-white">{item.question}</h4>
              </button>
            ))}
          </div>

          {selectedQuestion !== null && (
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-400/30 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-indigo-400 mb-3 text-lg">
                  {faqItems[selectedQuestion].question}
                </h4>
                <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-lg p-6">
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {faqItems[selectedQuestion].answer}
                  </p>
                  <p className="text-sm text-indigo-300 italic">
                    — {faqItems[selectedQuestion].answeredBy}
                  </p>
                </div>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-lg p-4 text-center">
                <p className="text-sm text-indigo-200">
                  📹 Les réponses complètes seront ajoutées après la collecte des interviews
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Votre Question</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Quelle question aimeriez-vous poser à un professionnel du spatial ?
            </label>
            <textarea
              value={responses['own_question'] || ''}
              onChange={(e) => handleResponseChange('own_question', e.target.value)}
              placeholder="Posez votre question ici..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
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
                Continuer vers les Ressources 📚
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
