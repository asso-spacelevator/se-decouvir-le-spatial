import { useState, useEffect } from 'react';
import { Telescope, Moon, Sparkles, Globe, Lightbulb } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Quiz } from './Quiz';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterShell, ChapterRecap } from './ChapterShell';

const TOTAL_CHAPTERS = 4;

interface ExplorationSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

const explorationTopics = [
  {
    name: 'James Webb Space Telescope',
    icon: <Telescope className="w-6 h-6" />,
    description: 'Le plus puissant télescope spatial jamais construit',
    details: "Lancé en 2021, JWST observe l'univers dans l'infrarouge. Son miroir de 6,5 mètres de diamètre, composé de 18 segments en béryllium plaqués or, capte la lumière des premières galaxies formées il y a 13,5 milliards d'années. Positionné à 1,5 million de km de la Terre au point de Lagrange L2, il révolutionne notre compréhension de l'univers.",
    achievements: "Découverte des galaxies les plus anciennes, analyse d'atmosphères d'exoplanètes, images spectaculaires de nébuleuses.",
    future: "Recherche de biosignatures dans les atmosphères d'exoplanètes potentiellement habitables.",
    funFact: "James Webb doit rester à -233 °C pour fonctionner. Son bouclier solaire, de la taille d'un court de tennis, protège ses instruments de la chaleur du Soleil.",
  },
  {
    name: 'Exploration Lunaire',
    icon: <Moon className="w-6 h-6" />,
    description: "Le retour de l'humanité sur la Lune",
    details: "Le programme Artemis vise à établir une présence humaine durable sur la Lune d'ici 2030. La station Gateway orbitera autour de la Lune, servant de relais pour les missions de surface. L'objectif : exploiter les ressources lunaires (eau glacée aux pôles), tester les technologies pour Mars et établir une base permanente.",
    achievements: "Mission Artemis I (2022) réussie, sélection des sites d'atterrissage au pôle Sud lunaire.",
    future: "Première femme et première personne de couleur sur la Lune (Artemis III, ~2026), base lunaire permanente.",
    funFact: "La Lune s'éloigne de la Terre de 3,8 cm par an. Dans 600 millions d'années, les éclipses totales de Soleil ne seront plus possibles.",
  },
  {
    name: 'Astronomie Moderne',
    icon: <Sparkles className="w-6 h-6" />,
    description: "Percer les mystères de l'univers",
    details: "L'astronomie moderne combine télescopes terrestres géants (ELT, 39 m de diamètre), télescopes spatiaux (JWST, Hubble) et détecteurs d'ondes gravitationnelles (LIGO). Ces instruments détectent des exoplanètes, étudient la matière noire, observent les trous noirs et remontent aux origines de l'univers. Plus de 5 000 exoplanètes ont été découvertes.",
    achievements: "Première image d'un trou noir (2019), détection d'ondes gravitationnelles (2015), découverte de planètes potentiellement habitables.",
    future: "Télescope géant ELT (2028), recherche de vie extraterrestre, cartographie complète de l'univers proche.",
    funFact: "Quand LIGO a détecté les premières ondes gravitationnelles en 2015, il a mesuré une déformation de l'espace 10 000 fois plus petite que le diamètre d'un proton.",
  },
  {
    name: 'Mars : La Prochaine Frontière',
    icon: <Globe className="w-6 h-6" />,
    description: 'Destination Mars dans les prochaines décennies',
    details: "Mars est la prochaine grande étape de l'exploration humaine. Les rovers Perseverance et Curiosity y cherchent des traces de vie passée. Les défis sont immenses : voyage de 6 à 9 mois, radiations, gravité réduite (38 % de la Terre), températures extrêmes (-60 °C en moyenne). Production de carburant sur place (ISRU) et construction d'habitats avec ressources locales seront essentiels.",
    achievements: "Hélicoptère Ingenuity (premier vol sur une autre planète), découverte d'eau liquide passée, analyse du sol martien.",
    future: "Missions habitées (années 2030-2040), établissement d'une colonie permanente, terraformation (très long terme).",
    funFact: "Ingenuity, le premier hélicoptère martien, doit tourner ses pales 5 fois plus vite que sur Terre à cause de l'atmosphère ultra-fine de Mars (1 % de la densité terrestre).",
  },
];

const quizQuestions = [
  {
    id: 'exploration_q1',
    question: 'À quelle température doit fonctionner le télescope spatial James Webb ?',
    options: [
      { id: 'a', text: '-50 °C', isCorrect: false },
      { id: 'b', text: '-100 °C', isCorrect: false },
      { id: 'c', text: '-233 °C', isCorrect: true },
      { id: 'd', text: '-273 °C', isCorrect: false },
    ],
    explanation: "Le télescope James Webb doit rester à -233 °C pour fonctionner correctement. Son bouclier solaire, de la taille d'un court de tennis, protège ses instruments ultra-sensibles de la chaleur du Soleil.",
  },
];

export function ExplorationSection({ onComplete, onHome }: ExplorationSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [chapter, setChapter] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [dream, setDream] = useState('');

  useEffect(() => {
    (async () => {
      const r = await getResponses('exploration');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.selectedTopic !== undefined && r.selectedTopic !== '') setSelectedTopic(parseInt(r.selectedTopic, 10));
      if (r.quizCompleted === 'true') setQuizCompleted(true);
      if (r.dream) setDream(r.dream);
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('exploration', 'chapter', String(i));
  };

  const handleTopicSelect = async (index: number) => {
    setSelectedTopic(index);
    if (hydrated) await saveResponse('exploration', 'selectedTopic', String(index));
  };

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    if (hydrated) await saveResponse('exploration', 'quizCompleted', 'true');
  };

  const handleDreamChange = async (v: string) => {
    setDream(v);
    if (hydrated) await saveResponse('exploration', 'dream', v);
  };

  return (
    <SectionCanvas>
      <SectionTopBar label="Session 2 · Chapitre 2 sur 5 · Exploration" onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} onGoTo={goTo} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Ch 0 : L'ère de l'exploration ── */}
        {chapter === 0 && (
          <ChapterShell
            kicker="01" title="L'ère de l'exploration"
            titlePrefix="Nous vivons une époque"
            titleAccent="extraordinaire."
            lede="Télescopes révolutionnaires, retour sur la Lune, rover sur Mars — chaque mission repousse les limites du possible. Choisis un domaine pour plonger dedans."
            onPrev={null} onNext={() => goTo(1)} nextEnabled={selectedTopic !== null}
            nextLabel={selectedTopic !== null ? "Continue · Découvrir →" : "Sélectionne un domaine d'abord"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {explorationTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleTopicSelect(i)}
                  className={`p-5 rounded-2xl border text-left transition-all group ${
                    selectedTopic === i
                      ? 'border-magenta bg-magenta/10'
                      : 'border-white/10 bg-white/[0.04] hover:border-magenta hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`flex-shrink-0 transition-colors ${selectedTopic === i ? 'text-magenta' : 'text-magenta/60 group-hover:text-magenta'}`}>
                      {topic.icon}
                    </span>
                    <h4 className="font-semibold text-white text-[15px]">{topic.name}</h4>
                  </div>
                  <p className="text-[12px] text-white/55 leading-snug">{topic.description}</p>
                </button>
              ))}
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 1 : Deep dive ── */}
        {chapter === 1 && selectedTopic !== null && (
          <ChapterShell
            kicker="02" title={explorationTopics[selectedTopic].name}
            titlePrefix="Tout sur"
            titleAccent="ce domaine."
            lede="Ce qui a été accompli, ce qui reste à faire, et l'anecdote qui surprend tout le monde."
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextEnabled={true}
            nextLabel="Continue · Quiz →"
          >
            <div className="space-y-4">
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-5">
                <div>
                  <h4 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/45 mb-2">Description</h4>
                  <p className="text-white/80 leading-relaxed text-[14px]">{explorationTopics[selectedTopic].details}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/45 mb-2">Réalisations</h4>
                  <p className="text-white/80 leading-relaxed text-[14px]">{explorationTopics[selectedTopic].achievements}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/45 mb-2">Futur</h4>
                  <p className="text-white/80 leading-relaxed text-[14px]">{explorationTopics[selectedTopic].future}</p>
                </div>
              </div>
              <div className="border border-magenta/30 border-[1.5px] rounded-lg p-4 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-magenta flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-[13px] leading-relaxed">{explorationTopics[selectedTopic].funFact}</p>
              </div>
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 2a : Quiz ── */}
        {chapter === 2 && !quizCompleted && (
          <ChapterShell
            kicker="03" title="Quiz éclair"
            titlePrefix="Teste ce que tu viens"
            titleAccent="d'apprendre."
            lede="Une question rapide avant de partager ta vision de l'avenir."
            onPrev={() => goTo(1)} onNext={() => goTo(3)} nextEnabled={false}
            nextLabel="Réponds à la question d'abord"
          >
            <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
          </ChapterShell>
        )}

        {/* ── Ch 2b : Ton rêve spatial ── */}
        {chapter === 2 && quizCompleted && (
          <ChapterShell
            kicker="03" title="Ton rêve spatial"
            titlePrefix="Quelle mission te fait"
            titleAccent="rêver ?"
            lede="Quelle découverte ou mission spatiale t'inspire le plus ? Quel rêve spatial voudrais-tu voir se réaliser de ton vivant ?"
            onPrev={() => goTo(1)} onNext={() => goTo(3)} nextEnabled={dream.trim().length > 0}
            nextLabel={dream.trim().length > 0 ? "Terminer le chapitre →" : "Écris ta réponse d'abord"}
          >
            <div>
              <label className="block text-[13px] font-medium text-white/70 mb-3">
                Ta vision de l'avenir de l'exploration spatiale
              </label>
              <textarea
                value={dream}
                onChange={e => handleDreamChange(e.target.value)}
                placeholder="Partage ta vision..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 resize-none text-[14px]"
                rows={5}
                maxLength={4000}
              />
            </div>
          </ChapterShell>
        )}

        {/* ── Récap ── */}
        {chapter === 3 && (
          <ChapterRecap
            chapterLabel="Exploration Spatiale"
            summary="Tu as exploré les grandes missions en cours, découvert les défis de l'exploration et partagé ta vision de l'avenir."
            nextTitle="Associations et accompagnement"
            nextDesc="Comment t'engager dans le spatial : associations, ressources et mentorat."
            onContinue={onComplete}
            onPrev={() => goTo(2)}
          />
        )}
      </div>
    </SectionCanvas>
  );
}
