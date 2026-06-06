import { useState, useEffect } from 'react';
import { Telescope, Moon, Sparkles, Globe, Lightbulb, ChevronLeft } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Quiz } from './Quiz';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterShell, ChapterRecap } from './ChapterShell';

const TOTAL_CHAPTERS = 3;

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
  const [viewingTopic, setViewingTopic] = useState<number | null>(null);
  const [exploredTopics, setExploredTopics] = useState<Set<number>>(new Set());
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [dream, setDream] = useState('');

  useEffect(() => {
    (async () => {
      const r = await getResponses('exploration');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.exploredTopics) {
        try {
          setExploredTopics(new Set(JSON.parse(r.exploredTopics) as number[]));
        } catch { /* ignore malformed */ }
      }
      if (r.quizCompleted === 'true') setQuizCompleted(true);
      if (r.dream) setDream(r.dream);
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    setViewingTopic(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('exploration', 'chapter', String(i));
  };

  const handleTopicOpen = async (index: number) => {
    setViewingTopic(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!exploredTopics.has(index)) {
      const newExplored = new Set(exploredTopics).add(index);
      setExploredTopics(newExplored);
      if (hydrated) await saveResponse('exploration', 'exploredTopics', JSON.stringify([...newExplored]));
    }
  };

  const handleTopicClose = () => {
    setViewingTopic(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    if (hydrated) await saveResponse('exploration', 'quizCompleted', 'true');
  };

  const handleDreamChange = async (v: string) => {
    setDream(v);
    if (hydrated) await saveResponse('exploration', 'dream', v);
  };

  const allExplored = exploredTopics.size >= explorationTopics.length;

  return (
    <SectionCanvas>
      <SectionTopBar label="Session 2 · Chapitre 2 sur 5 · Exploration" onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} onGoTo={goTo} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Ch 0 : Menu des missions ── */}
        {chapter === 0 && viewingTopic === null && (
          <ChapterShell
            kicker="01" title="L'ère de l'exploration"
            titlePrefix="À 1,5 million de kilomètres d'ici,"
            titleAccent="un télescope voit des étoiles nées il y a 13,5 milliards d'années."
            lede="James Webb, Artemis, Perseverance. Explore les 4 missions pour découvrir les enjeux de cette décennie d'exploration."
            onPrev={null} onNext={() => goTo(1)} nextEnabled={allExplored}
            nextLabel={allExplored ? "Continue · Quiz →" : `Explore ${exploredTopics.size}/${explorationTopics.length} missions d'abord`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {explorationTopics.map((topic, i) => {
                const explored = exploredTopics.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => handleTopicOpen(i)}
                    className={`p-5 rounded-2xl border text-left transition-all group ${
                      explored
                        ? 'border-magenta/50 bg-magenta/[0.07]'
                        : 'border-white/10 bg-white/[0.04] hover:border-magenta hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`flex-shrink-0 transition-colors ${explored ? 'text-magenta' : 'text-magenta/60 group-hover:text-magenta'}`}>
                        {topic.icon}
                      </span>
                      <h4 className="font-semibold text-white text-[15px] flex-1 text-left">{topic.name}</h4>
                      {explored && (
                        <span className="text-[10px] text-magenta border border-magenta/40 rounded-full px-2 py-0.5 shrink-0">vu</span>
                      )}
                    </div>
                    <p className="text-[12px] text-white/55 leading-snug">{topic.description}</p>
                  </button>
                );
              })}
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 0 : Détail d'une mission ── */}
        {chapter === 0 && viewingTopic !== null && (
          <div className="animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)] space-y-8">
            <button
              onClick={handleTopicClose}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[14px] font-semibold border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Retour aux missions
            </button>

            <div>
              <span className="bg-magenta text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-[0.12em] uppercase">Mission</span>
              <h1 className="font-display font-bold uppercase tracking-[0.04em] text-[clamp(28px,4vw,48px)] leading-[1.08] mt-3">
                <span className="text-magenta">{explorationTopics[viewingTopic].name}</span>
              </h1>
              <p className="text-[16px] text-white/70 max-w-[720px] leading-[1.55] mt-2">
                {explorationTopics[viewingTopic].description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-5">
                <div>
                  <h4 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/45 mb-2">Description</h4>
                  <p className="text-white/80 leading-relaxed text-[14px]">{explorationTopics[viewingTopic].details}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/45 mb-2">Réalisations</h4>
                  <p className="text-white/80 leading-relaxed text-[14px]">{explorationTopics[viewingTopic].achievements}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/45 mb-2">Futur</h4>
                  <p className="text-white/80 leading-relaxed text-[14px]">{explorationTopics[viewingTopic].future}</p>
                </div>
              </div>
              <div className="border-[1.5px] border-magenta/30 rounded-lg p-4 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-magenta flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-white/80 text-[13px] leading-relaxed">{explorationTopics[viewingTopic].funFact}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Ch 1a : Quiz ── */}
        {chapter === 1 && !quizCompleted && (
          <ChapterShell
            kicker="02" title="Quiz éclair"
            titlePrefix="Une question."
            titleAccent="Elle sépare ceux qui ont lu vite de ceux qui ont vraiment retenu."
            lede="Une seule réponse. L'objectif, c'est l'apprentissage."
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextEnabled={false}
            nextLabel="Réponds à la question d'abord"
          >
            <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
          </ChapterShell>
        )}

        {/* ── Ch 1b : Ton rêve spatial ── */}
        {chapter === 1 && quizCompleted && (
          <ChapterShell
            kicker="02" title="Ton rêve spatial"
            titlePrefix="Des équipes de milliers de personnes"
            titleAccent="construisent les missions que tu viens de voir."
            lede="Et toi, quelle mission te fait rêver ? Quelle découverte voudrais-tu voir se réaliser de ton vivant ?"
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextEnabled={dream.trim().length > 0}
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
        {chapter === 2 && (
          <ChapterRecap
            chapterLabel="Exploration Spatiale"
            summary="Tu as exploré les grandes missions en cours, découvert les défis de l'exploration et partagé ta vision de l'avenir."
            nextTitle="Associations et accompagnement"
            nextDesc="Comment t'engager dans le spatial : associations, ressources et mentorat."
            onContinue={onComplete}
            onPrev={() => goTo(1)}
          />
        )}
      </div>
    </SectionCanvas>
  );
}
