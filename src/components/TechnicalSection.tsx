import { useState, useEffect } from 'react';
import { Zap, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';
import { Quiz } from './Quiz';

interface TechnicalSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function TechnicalSection({ onComplete, onHome, onBack }: TechnicalSectionProps) {
  const { saveResponse, getResponses, saveQuizScore } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('technical');
      setResponses(savedResponses);
    };
    loadResponses();
  }, []);

  const quizQuestions = [
    {
      id: 'tech_q1',
      question: 'Quelle température peut atteindre un lanceur lors de sa rentrée atmosphérique ?',
      options: [
        { id: 'a', text: 'Environ 500°C', isCorrect: false },
        { id: 'b', text: 'Environ 1 500°C', isCorrect: false },
        { id: 'c', text: 'Plus de 3 000°C', isCorrect: true },
        { id: 'd', text: 'Environ 10 000°C', isCorrect: false }
      ],
      explanation: 'Les lanceurs peuvent atteindre des températures dépassant les 3 000°C lors de leur vol. À ces températures extrêmes, les ingénieurs doivent utiliser des matériaux spécialisés comme des céramiques thermiques et des alliages avancés.'
    },
    {
      id: 'tech_q2',
      question: 'Quelle précision est nécessaire pour déployer un satellite en orbite ?',
      options: [
        { id: 'a', text: 'Précision de quelques kilomètres', isCorrect: false },
        { id: 'b', text: 'Précision millimétrique', isCorrect: true },
        { id: 'c', text: 'Précision de quelques mètres', isCorrect: false },
        { id: 'd', text: 'La précision n\'est pas importante', isCorrect: false }
      ],
      explanation: 'La précision doit être millimétrique ! Les systèmes de navigation utilisent des gyroscopes et accéléromètres de haute précision. Une erreur d\'un centimètre sur un million de kilomètres peut être catastrophique.'
    },
    {
      id: 'tech_q3',
      question: 'Pourquoi les lanceurs subissent-ils des vibrations importantes au décollage ?',
      options: [
        { id: 'a', text: 'À cause du vent', isCorrect: false },
        { id: 'b', text: 'À cause de la combustion des moteurs', isCorrect: true },
        { id: 'c', text: 'À cause de la gravité', isCorrect: false },
        { id: 'd', text: 'À cause des nuages', isCorrect: false }
      ],
      explanation: 'Les moteurs génèrent des vibrations massives lors de la combustion. Les ingénieurs conçoivent des systèmes d\'amortissement sophistiqués pour protéger les instruments scientifiques et les charges précieuses.'
    }
  ];

  const questions = [
    {
      id: 'q1',
      question: 'Selon vous, quel autre défi technique est crucial pour créer un lanceur ?',
      placeholder: 'Réfléchissez aux matériaux, à la précision, à l\'énergie...'
    }
  ];

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('technical', id, value);
  };

  const handleQuizScoreUpdate = async (points: number) => {
    const currentQuestion = quizQuestions.find(() => true);
    if (currentQuestion) {
      await saveQuizScore('technical', currentQuestion.id, points, points > 0);
    }
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = quizCompleted && Object.values(responses).some(r => r.trim().length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-orange-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Zap className="w-12 h-12 text-orange-400" />
          <div>
            <div className="text-sm text-orange-400 font-semibold uppercase tracking-wider">Section 2</div>
            <h2 className="text-4xl font-bold">Les Défis Techniques</h2>
          </div>
        </div>

        <Subsection
          title="Les Températures Extrêmes"
          content="Les lanceurs atteignent des températures dépassant les 3 000°C. À ces extrêmes, aucun matériau ordinaire ne peut survivre. Les ingénieurs doivent inventer ou développer des matériaux spécialisés comme les céramiques thermiques et les alliages avancés pour protéger la structure et les équipements délicats."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="🔥"
        />

        <Subsection
          title="La Précision Extrême"
          content="Pour atteindre l'orbite, un lanceur doit déployer ses charges utiles avec une précision millimétrique. Les systèmes de navigation utilisent des gyroscopes et accéléromètres de haute précision pour corriger continuellement la trajectoire. Une erreur d'un centimètre sur un million de kilomètres serait un échec."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="🎯"
        />

        <Subsection
          title="Les Vibrations et les Chocs"
          content="Lors du décollage, les lanceurs subissent des vibrations massives qui pourraient endommager les équipements sensibles. Les ingénieurs conçoivent des systèmes d'amortissement et d'isolation sophistiqués pour protéger les instruments scientifiques et les charges précieuses du bombardement sismique du lancement."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="📡"
        />

        <Quiz
          questions={quizQuestions}
          onScoreUpdate={handleQuizScoreUpdate}
          onComplete={handleQuizComplete}
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mt-8">
          <h3 className="text-2xl font-semibold mb-6">Réfléchissez à ce que vous avez appris</h3>

          {questions.map((q) => (
            <div key={q.id} className="mb-6">
              <label className="block text-gray-300 mb-3 font-medium">{q.question}</label>
              <textarea
                value={responses[q.id] || ''}
                onChange={(e) => handleResponseChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
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
                Continuer vers la Fabrication
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
