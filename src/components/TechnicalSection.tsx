import { useState, useEffect } from 'react';
import { Zap, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';

interface TechnicalSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function TechnicalSection({ onComplete, onHome, onBack }: TechnicalSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('technical');
      setResponses(savedResponses);
    };
    loadResponses();
  }, []);

  const questions = [
    {
      id: 'q1',
      question: 'Quel est le plus grand défi technique selon vous pour créer un lanceur ?',
      placeholder: 'Réfléchissez aux matériaux, à la précision, à l\'énergie...'
    },
    {
      id: 'q2',
      question: 'Comment les ingénieurs pourraient-ils résoudre le problème des températures extrêmes ?',
      placeholder: 'Pensez aux matériaux, aux revêtements, ou aux systèmes de refroidissement...'
    }
  ];

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('technical', id, value);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = Object.values(responses).some(r => r.trim().length > 0);

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

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
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
