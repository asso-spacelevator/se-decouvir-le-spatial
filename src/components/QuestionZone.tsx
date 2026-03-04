import { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Navigation } from './Navigation';

interface QuestionZoneProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function QuestionZone({ onComplete, onHome, onBack }: QuestionZoneProps) {
  const { submitQuestion, saveResponse, getResponses } = useSession();
  const [category, setCategory] = useState<'career' | 'technical' | 'geopolitics' | 'general'>('general');
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const responses = await getResponses('questions');
      if (responses.category) setCategory(responses.category as any);
      if (responses.questionText) setQuestionText(responses.questionText);
      if (responses.isAnonymous) setIsAnonymous(responses.isAnonymous === 'true');
      if (responses.submitted) setSubmitted(responses.submitted === 'true');
    };
    loadResponses();
  }, []);

  const categories = [
    { id: 'career', label: 'Carrière et Orientation', icon: '💼', color: 'blue' },
    { id: 'technical', label: 'Questions Techniques', icon: '🔧', color: 'cyan' },
    { id: 'geopolitics', label: 'Géopolitique et Stratégie', icon: '🌍', color: 'purple' },
    { id: 'general', label: 'Questions Générales', icon: '💬', color: 'emerald' }
  ];

  const exampleQuestions = [
    'Quels cursus mènent à une carrière dans l\'industrie spatiale ?',
    'Comment Ariane 6 se compare-t-elle aux fusées de SpaceX ?',
    'Quelles sont les opportunités de carrière à l\'ESA ?',
    'Pourquoi l\'Europe investit-elle dans ses propres capacités de lancement ?',
    'Quelles compétences sont les plus précieuses pour les ingénieurs spatiaux ?'
  ];

  const handleSubmit = async () => {
    if (questionText.trim()) {
      await submitQuestion(category, questionText, isAnonymous);
      await saveResponse('questions', 'category', category);
      await saveResponse('questions', 'questionText', questionText);
      await saveResponse('questions', 'isAnonymous', String(isAnonymous));
      await saveResponse('questions', 'submitted', 'true');
      setSubmitted(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const handleCategoryChange = async (newCategory: string) => {
    setCategory(newCategory as any);
    await saveResponse('questions', 'category', newCategory);
  };

  const handleQuestionTextChange = async (text: string) => {
    setQuestionText(text);
    await saveResponse('questions', 'questionText', text);
  };

  const handleAnonymousChange = async (isAnon: boolean) => {
    setIsAnonymous(isAnon);
    await saveResponse('questions', 'isAnonymous', String(isAnon));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Mail className="w-12 h-12 text-purple-400" />
          <div>
            <div className="text-sm text-purple-400 font-semibold uppercase tracking-wider">Zone de Questions</div>
            <h2 className="text-4xl font-bold">Posez Vos Questions</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Obtenez des Réponses d'Experts</h3>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Avez-vous des questions sur les carrières dans l'espace, les détails techniques, ou l'avenir des programmes spatiaux européens ?
            Soumettez vos questions ici, et les experts de l'industrie y répondront.
          </p>

          {!submitted ? (
            <>
              <div className="mb-6">
                <label className="block text-gray-300 mb-3 font-medium">Sélectionnez une Catégorie</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
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
                <label className="block text-gray-300 mb-3 font-medium">Votre Question</label>
                <textarea
                  value={questionText}
                  onChange={(e) => handleQuestionTextChange(e.target.value)}
                  placeholder="Tapez votre question ici..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={5}
                />
                <div className="mt-3 text-sm text-gray-400">
                  <span className="font-medium">Besoin d'inspiration ?</span> Essayez des questions comme :
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
                    onChange={(e) => handleAnonymousChange(e.target.checked)}
                    className="w-5 h-5 rounded border-white/10 bg-white/5 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Soumettre de façon anonyme</span>
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
                Soumettre la Question
              </button>
            </>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-400 mb-2">Question Soumise !</h3>
              <p className="text-gray-300 mb-6">
                Merci pour votre question. Les experts l'examineront et répondront très bientôt.
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20"
          >
            Terminer le Voyage
          </button>
        </div>
      </div>
    </div>
  );
}
