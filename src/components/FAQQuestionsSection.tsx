import { useState, useEffect } from 'react';
import { MessageCircle, Mail, Send, CheckCircle, ChevronRight } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Navigation } from './Navigation';

interface FAQItem {
  question: string;
  answer: string;
  answeredBy: string;
}

interface FAQQuestionsSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

const faqItems: FAQItem[] = [
  { question: 'Le spatial, c\'est un monde fermé ?', answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
  { question: 'Le spatial, c\'est que pour les gens très intelligents ?', answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
  { question: 'Faut-il forcément faire une grande école pour travailler dans le spatial ?', answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
  { question: 'Quels sont les métiers accessibles dans le spatial ?', answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
  { question: 'Comment se former au spatial en France ?', answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
  { question: 'Y a-t-il de la place pour les femmes dans le spatial ?', answer: '[Réponse à venir - à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
];

const categories = [
  { id: 'career', label: 'Carrière et Orientation', icon: '💼' },
  { id: 'technical', label: 'Questions Techniques', icon: '🔧' },
  { id: 'geopolitics', label: 'Géopolitique et Stratégie', icon: '🌍' },
  { id: 'general', label: 'Questions Générales', icon: '💬' },
];

const exampleQuestions = [
  'Quels cursus mènent à une carrière dans l\'industrie spatiale ?',
  'Comment Ariane 6 se compare-t-elle aux lanceurs de SpaceX ?',
  'Quelles sont les opportunités de carrière à l\'ESA ?',
];

export function FAQQuestionsSection({ onComplete, onHome, onBack }: FAQQuestionsSectionProps) {
  const { saveResponse, getResponses, submitQuestion } = useSession();
  const [selectedFAQ, setSelectedFAQ] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'poser'>('faq');
  const [category, setCategory] = useState<'career' | 'technical' | 'geopolitics' | 'general'>('general');
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const saved = await getResponses('faq_questions');
      if (saved.selectedFAQ) setSelectedFAQ(parseInt(saved.selectedFAQ));
      if (saved.activeTab) setActiveTab(saved.activeTab as 'faq' | 'poser');
      if (saved.category) setCategory(saved.category as 'career' | 'technical' | 'geopolitics' | 'general');
      if (saved.questionText) setQuestionText(saved.questionText);
      if (saved.isAnonymous) setIsAnonymous(saved.isAnonymous === 'true');
    };
    loadResponses();
  }, []);

  const handleFAQSelect = async (index: number) => {
    setSelectedFAQ(index);
    await saveResponse('faq_questions', 'selectedFAQ', String(index));
  };

  const handleTabChange = async (tab: 'faq' | 'poser') => {
    setActiveTab(tab);
    await saveResponse('faq_questions', 'activeTab', tab);
  };

  const handleCategoryChange = async (cat: string) => {
    setCategory(cat as 'career' | 'technical' | 'geopolitics' | 'general');
    await saveResponse('faq_questions', 'category', cat);
  };

  const handleQuestionTextChange = async (text: string) => {
    setQuestionText(text);
    await saveResponse('faq_questions', 'questionText', text);
  };

  const handleAnonymousChange = async (isAnon: boolean) => {
    setIsAnonymous(isAnon);
    await saveResponse('faq_questions', 'isAnonymous', String(isAnon));
  };

  const handleSubmit = async () => {
    if (questionText.trim()) {
      await submitQuestion(category, questionText, isAnonymous);
      setSubmitted(true);
      setTimeout(() => onComplete(), 2000);
    }
  };

  const handleFAQComplete = async () => {
    await saveResponse('faq_questions', 'faqDone', 'true');
    setActiveTab('poser');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-8">
          <MessageCircle className="w-12 h-12 text-sky-400" />
          <div>
            <div className="text-sm text-sky-400 font-semibold uppercase tracking-wider">FAQ & Questions</div>
            <h2 className="text-4xl font-bold">Vos questions sur le spatial</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 rounded-xl p-1 border border-white/10">
          {([
            { id: 'faq', label: 'Questions fréquentes', icon: <MessageCircle className="w-4 h-4" /> },
            { id: 'poser', label: 'Poser une question', icon: <Mail className="w-4 h-4" /> },
          ] as const).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'faq' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-6">
            <p className="text-gray-300 mb-6 text-lg">
              Des professionnels du spatial répondent aux questions que vous vous posez :
            </p>
            <div className="space-y-3 mb-6">
              {faqItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleFAQSelect(index)}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                    selectedFAQ === index
                      ? 'border-sky-400 bg-sky-500/15 scale-[1.01]'
                      : 'border-white/10 bg-white/5 hover:border-sky-400/50 hover:bg-white/8'
                  }`}
                >
                  <h4 className="font-bold text-white">{item.question}</h4>
                </button>
              ))}
            </div>

            {selectedFAQ !== null && (
              <div className="bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-400/30 rounded-xl p-6 space-y-4 mb-6">
                <h4 className="font-semibold text-sky-400 text-lg">{faqItems[selectedFAQ].question}</h4>
                <div className="bg-sky-500/10 border border-sky-400/20 rounded-lg p-6">
                  <p className="text-gray-300 leading-relaxed mb-3">{faqItems[selectedFAQ].answer}</p>
                  <p className="text-sm text-sky-300 italic">— {faqItems[selectedFAQ].answeredBy}</p>
                </div>
                <div className="bg-sky-500/10 border border-sky-400/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-sky-200">Les réponses complètes seront ajoutées après la collecte des interviews</p>
                </div>
              </div>
            )}

            <button
              onClick={handleFAQComplete}
              disabled={!import.meta.env.DEV && selectedFAQ === null}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                import.meta.env.DEV || selectedFAQ !== null
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Poser ma propre question <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {activeTab === 'poser' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-6">
            <h3 className="text-2xl font-semibold mb-3">Obtenez des réponses d'experts</h3>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Soumettez votre question — des professionnels de l'industrie spatiale y répondront.
            </p>

            {!submitted ? (
              <>
                <div className="mb-6">
                  <label className="block text-gray-300 mb-3 font-medium">Catégorie</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          category === cat.id
                            ? 'bg-sky-500/20 border-sky-400'
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
                  <label className="block text-gray-300 mb-3 font-medium">Votre question</label>
                  <textarea
                    value={questionText}
                    onChange={e => handleQuestionTextChange(e.target.value)}
                    placeholder="Tapez votre question ici..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    rows={5}
                    maxLength={4000}
                  />
                  <div className="mt-3 text-sm text-gray-400">
                    <span className="font-medium">Inspiration :</span>
                    <ul className="mt-2 space-y-1 ml-4">
                      {exampleQuestions.map((q, i) => <li key={i} className="text-gray-500">• {q}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={e => handleAnonymousChange(e.target.checked)}
                      className="w-5 h-5 rounded border-white/10 bg-white/5 focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="text-gray-300">Soumettre de façon anonyme</span>
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!import.meta.env.DEV && !questionText.trim()}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    import.meta.env.DEV || questionText.trim()
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" /> Soumettre la question
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-400 mb-2">Question soumise !</h3>
                <p className="text-gray-300">Merci. Les experts examineront votre question et répondront très bientôt.</p>
              </div>
            )}
          </div>
        )}

        {!submitted && (
          <div className="text-center">
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
            >
              Terminer le parcours
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
