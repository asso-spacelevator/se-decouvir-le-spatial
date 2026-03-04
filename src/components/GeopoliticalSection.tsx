import { useState, useEffect } from 'react';
import { Globe, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';

interface GeopoliticalSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function GeopoliticalSection({ onComplete, onHome, onBack }: GeopoliticalSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('geopolitical');
      setResponses(savedResponses);
      if (savedResponses.submitted === 'true') {
        setSubmitted(true);
      }
    };
    loadResponses();
  }, []);

  const questions = [
    {
      id: 'q1',
      question: 'Pourquoi l\'accès indépendant à l\'espace est-il important pour l\'Europe ?',
      placeholder: 'Partagez vos réflexions sur la souveraineté spatiale européenne...'
    },
    {
      id: 'q2',
      question: 'Que pourrait-il se passer si un pays dépendait entièrement d\'une autre nation pour lancer des satellites ?',
      placeholder: 'Considérez la sécurité, l\'économie et les implications stratégiques...'
    },
    {
      id: 'q3',
      question: 'Citez un avantage que l\'Europe possède dans la course spatiale mondiale.',
      placeholder: 'Pensez à la technologie, la coopération ou l\'infrastructure...'
    }
  ];

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('geopolitical', id, value);
  };

  const handleSubmit = async () => {
    await saveResponse('geopolitical', 'submitted', 'true');
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = Object.keys(responses).length >= 2 &&
    Object.values(responses).some(r => r.trim().length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Globe className="w-12 h-12 text-blue-400" />
          <div>
            <div className="text-sm text-blue-400 font-semibold uppercase tracking-wider">Section 1</div>
            <h2 className="text-4xl font-bold">Un Projet Géopolitique</h2>
          </div>
        </div>

        <Subsection
          title="L'Agence Spatiale Européenne (ESA)"
          content="L'ESA est une organisation internationale regroupant 22 États membres européens. Elle est responsable de la coordination et du financement des activités spatiales civiles en Europe. Fondée en 1975, l'ESA est devenue l'une des agences spatiales les plus avancées au monde."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="🇪🇺"
        />

        <Subsection
          title="L'Espace comme Domaine Stratégique"
          content="L'espace n'est pas seulement un domaine scientifique - c'est un enjeu stratégique majeur. Les satellites sont essentiels pour la défense, les télécommunications, la navigation (GPS), et l'observation de la Terre. Sans capacités de lancement indépendantes, une nation dépend d'autres pour accéder à cet espace critique."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="🛰️"
        />

        <Subsection
          title="La Compétition Mondiale"
          content="Europe est en concurrence avec les États-Unis, la Chine, la Russie et les entreprises privées comme SpaceX. L'indépendance européenne en matière de lancement est cruciale pour maintenir sa compétitivité économique et sa souveraineté technologique dans un secteur en croissance rapide."
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          icon="🌍"
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
                Réponses sauvegardées !
              </>
            ) : (
              <>
                Continuer vers les Défis Techniques
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
