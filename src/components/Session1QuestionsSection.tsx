import { useState, useEffect, type ReactNode } from 'react';
import { Globe, Rocket, Radio, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterShell } from './ChapterShell';

const TOTAL_CHAPTERS = 1;

interface QuestionCategory {
  id: 'impact_terrestre' | 'lanceurs' | 'reseaux_sociaux' | 'general';
  label: string;
  icon: ReactNode;
}

interface Session1QuestionsSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

const categories: QuestionCategory[] = [
  { id: 'impact_terrestre', label: "L'espace au quotidien", icon: <Globe className="w-4 h-4" /> },
  { id: 'lanceurs', label: 'Lanceurs et Ariane 6', icon: <Rocket className="w-4 h-4" /> },
  { id: 'reseaux_sociaux', label: 'Réseaux sociaux et actu spatiale', icon: <Radio className="w-4 h-4" /> },
  { id: 'general', label: 'Question générale', icon: <MessageCircle className="w-4 h-4" /> },
];

const exampleQuestions = [
  "À quoi sert vraiment un satellite météo dans la vie de tous les jours ?",
  "Pourquoi Ariane 6 décolle de Kourou plutôt que d'Europe ?",
  "Comment savoir si une info sur un lancement est fiable sur les réseaux sociaux ?",
];

export function Session1QuestionsSection({ onComplete, onHome }: Session1QuestionsSectionProps) {
  const { saveResponse, getResponses, submitQuestion } = useSession();
  const [hydrated, setHydrated] = useState(false);
  const [category, setCategory] = useState<QuestionCategory['id']>('general');
  const [questionText, setQuestionText] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getResponses('questions_session1');
      if (saved.category) setCategory(saved.category as QuestionCategory['id']);
      if (saved.questionText) setQuestionText(saved.questionText);
      if (saved.questionSubmitted === 'true') setQuestionSubmitted(true);
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = async (cat: QuestionCategory['id']) => {
    setCategory(cat);
    if (hydrated) await saveResponse('questions_session1', 'category', cat);
  };

  const handleQuestionTextChange = async (text: string) => {
    setQuestionText(text);
    if (hydrated) await saveResponse('questions_session1', 'questionText', text);
  };

  const handleSubmit = async () => {
    if (!questionText.trim()) return;
    await submitQuestion(category, questionText, true);
    setQuestionSubmitted(true);
    if (hydrated) await saveResponse('questions_session1', 'questionSubmitted', 'true');
  };

  return (
    <SectionCanvas>
      <SectionTopBar label="Session 1 · Chapitre 4 sur 4 · Tes questions" onHome={onHome} />
      <SectionProgress current={0} total={TOTAL_CHAPTERS} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">
        <ChapterShell
          kicker="04" title="Tes questions"
          titlePrefix="Une question sur ce que tu"
          titleAccent="viens de découvrir ?"
          lede="Avant la pause, profite-en pour poser une question sur l'espace au quotidien, les lanceurs ou les réseaux sociaux. C'est facultatif : tu peux aussi passer directement à la suite."
          onPrev={null} onNext={onComplete} nextEnabled={true}
          nextLabel="Continue · Fin de la séance →"
        >
          {!questionSubmitted ? (
            <div className="space-y-6">
              <div>
                <p className="text-[13px] font-medium text-white/70 mb-3">Catégorie</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left text-[13px] font-medium transition-all ${
                        category === cat.id
                          ? 'bg-magenta/10 border-magenta text-magenta'
                          : 'bg-white/[0.04] border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <span className={category === cat.id ? 'text-magenta' : 'text-white/40'}>{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-white/70 mb-3">Ta question</label>
                <textarea
                  value={questionText}
                  onChange={e => handleQuestionTextChange(e.target.value)}
                  placeholder="Tape ta question ici..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 resize-none text-[14px]"
                  rows={5}
                  maxLength={4000}
                />
                <div className="mt-3 text-[12px] text-white/40">
                  <span className="font-medium">Inspiration :</span>
                  <ul className="mt-1.5 space-y-1 ml-4">
                    {exampleQuestions.map((q, i) => <li key={i}>· {q}</li>)}
                  </ul>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!questionText.trim()}
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-magenta hover:bg-magenta-700 text-white text-[14px] font-semibold rounded-lg transition disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" /> Soumettre la question
              </button>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-5 bg-magenta/15 rounded-full grid place-items-center">
                <CheckCircle className="w-8 h-8 text-magenta" />
              </div>
              <h3 className="font-bold text-magenta text-[22px] mb-2">Question soumise.</h3>
              <p className="text-[14px] text-white/60 max-w-sm mx-auto leading-relaxed">
                Merci. Les experts examineront ta question et répondront très bientôt.
              </p>
            </div>
          )}
        </ChapterShell>
      </div>
    </SectionCanvas>
  );
}
