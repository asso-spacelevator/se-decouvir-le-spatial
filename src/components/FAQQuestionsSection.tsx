import { useState, useEffect, type ReactNode } from 'react';
import { MessageCircle, Send, CheckCircle, Briefcase, Wrench, Globe, ChevronDown } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterShell } from './ChapterShell';

const TOTAL_CHAPTERS = 2;

interface FAQItem {
  question: string;
  answer: string;
  answeredBy: string;
}

interface FAQCategory {
  id: 'career' | 'technical' | 'geopolitics' | 'general';
  label: string;
  icon: ReactNode;
}

interface FAQQuestionsSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

const faqItems: FAQItem[] = [
  { question: 'Le spatial, c\'est un monde fermé ?', answer: '[Réponse à venir — à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
  { question: 'Le spatial, c\'est que pour les gens très intelligents ?', answer: '[Réponse à venir — à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
  { question: 'Faut-il forcément faire une grande école pour travailler dans le spatial ?', answer: '[Réponse à venir — à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
  { question: 'Quels sont les métiers accessibles dans le spatial ?', answer: '[Réponse à venir — à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
  { question: 'Comment se former au spatial en France ?', answer: '[Réponse à venir — à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
  { question: 'Y a-t-il de la place pour les femmes dans le spatial ?', answer: '[Réponse à venir — à collecter auprès des professionnels interviewés]', answeredBy: 'À compléter' },
];

const categories: FAQCategory[] = [
  { id: 'career', label: 'Carrière et Orientation', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'technical', label: 'Questions Techniques', icon: <Wrench className="w-4 h-4" /> },
  { id: 'geopolitics', label: 'Géopolitique et Stratégie', icon: <Globe className="w-4 h-4" /> },
  { id: 'general', label: 'Questions Générales', icon: <MessageCircle className="w-4 h-4" /> },
];

const exampleQuestions = [
  "Quels cursus mènent à une carrière dans l'industrie spatiale ?",
  "Comment Ariane 6 se compare-t-elle aux lanceurs de SpaceX ?",
  "Quelles sont les opportunités de carrière à l'ESA ?",
];

export function FAQQuestionsSection({ onComplete, onHome }: FAQQuestionsSectionProps) {
  const { saveResponse, getResponses, submitQuestion } = useSession();
  const [chapter, setChapter] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<number | null>(null);
  const [category, setCategory] = useState<FAQCategory['id']>('general');
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getResponses('faq_questions');
      if (saved.chapter) setChapter(Math.min(parseInt(saved.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (saved.selectedFAQ !== undefined && saved.selectedFAQ !== '') setSelectedFAQ(parseInt(saved.selectedFAQ, 10));
      if (saved.category) setCategory(saved.category as FAQCategory['id']);
      if (saved.questionText) setQuestionText(saved.questionText);
      if (saved.isAnonymous) setIsAnonymous(saved.isAnonymous === 'true');
      if (saved.questionSubmitted === 'true') setQuestionSubmitted(true);
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('faq_questions', 'chapter', String(i));
  };

  const handleFAQSelect = async (index: number) => {
    const next = selectedFAQ === index ? null : index;
    setSelectedFAQ(next);
    if (hydrated) await saveResponse('faq_questions', 'selectedFAQ', next !== null ? String(next) : '');
  };

  const handleCategoryChange = async (cat: FAQCategory['id']) => {
    setCategory(cat);
    if (hydrated) await saveResponse('faq_questions', 'category', cat);
  };

  const handleQuestionTextChange = async (text: string) => {
    setQuestionText(text);
    if (hydrated) await saveResponse('faq_questions', 'questionText', text);
  };

  const handleAnonymousChange = async (isAnon: boolean) => {
    setIsAnonymous(isAnon);
    if (hydrated) await saveResponse('faq_questions', 'isAnonymous', String(isAnon));
  };

  const handleSubmit = async () => {
    if (!questionText.trim()) return;
    await submitQuestion(category, questionText, isAnonymous);
    setQuestionSubmitted(true);
    if (hydrated) await saveResponse('faq_questions', 'questionSubmitted', 'true');
  };

  return (
    <SectionCanvas>
      <SectionTopBar label="Session 2 · Chapitre 4 sur 4 · Zone FAQ" onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} onGoTo={goTo} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Ch 0 : Questions fréquentes ── */}
        {chapter === 0 && (
          <ChapterShell
            kicker="01" title="Questions fréquentes"
            titlePrefix="Des professionnels répondent"
            titleAccent="à vos questions."
            lede="Clique sur une question pour voir la réponse d'un expert du secteur spatial."
            onPrev={null} onNext={() => goTo(1)} nextEnabled={selectedFAQ !== null}
            nextLabel={selectedFAQ !== null ? "Continue · Pose ta question →" : "Sélectionne une question d'abord"}
          >
            <div className="space-y-2">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => handleFAQSelect(index)}
                    className={`w-full flex items-center justify-between gap-3 p-5 text-left transition-colors ${
                      selectedFAQ === index ? 'border-b border-white/10' : ''
                    }`}
                  >
                    <h4 className={`font-semibold text-[14px] transition-colors ${selectedFAQ === index ? 'text-magenta' : 'text-white'}`}>
                      {item.question}
                    </h4>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 text-white/40 transition-transform ${selectedFAQ === index ? 'rotate-180' : ''}`} />
                  </button>

                  {selectedFAQ === index && (
                    <div className="px-5 pb-5 pt-4">
                      <p className="text-[13px] text-white/70 leading-relaxed mb-2">{item.answer}</p>
                      <p className="text-[11px] text-white/40 italic">— {item.answeredBy}</p>
                      <div className="mt-3 bg-white/[0.03] border border-white/8 rounded-lg px-4 py-2.5">
                        <p className="text-[11px] text-white/40">Les réponses complètes seront ajoutées après la collecte des interviews.</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 1 : Pose ta question ── */}
        {chapter === 1 && (
          <ChapterShell
            kicker="02" title="Pose ta question"
            titlePrefix="Une question pour les"
            titleAccent="professionnels ?"
            lede="Soumets ta question — des experts de l'industrie spatiale y répondront. C'est facultatif : tu peux aussi passer directement à la fin du parcours."
            onPrev={() => goTo(0)} onNext={onComplete} nextEnabled={true}
            nextLabel="Terminer le parcours →"
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

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => handleAnonymousChange(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/[0.04] accent-magenta focus:ring-2 focus:ring-magenta"
                  />
                  <span className="text-[13px] text-white/65">Soumettre de façon anonyme</span>
                </label>

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
        )}
      </div>
    </SectionCanvas>
  );
}
