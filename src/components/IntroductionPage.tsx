import { useState, useEffect } from 'react';
import { Rocket, Satellite, Globe, CheckCircle, XCircle, Users, BookOpen, MessageCircle } from 'lucide-react';
import {
  SectionCanvas,
  SectionTopBar,
  SectionProgress,
  ChapterShell,
} from './ChapterShell';
import { AvatarGuide } from './AvatarGuide';
import { useSession } from '../contexts/SessionContext';

/* ════════════════════════════════════════════════════════════════════
 *  IntroductionPage — three-page on-boarding
 *
 *  1. Bienvenue + Le parcours  — deux sections sur une même page
 *  2. Citations                — jeu de matching auteur / citation (gating)
 *  3. À toi                   — 5 mots + CTA Commencer l'exploration
 * ═══════════════════════════════════════════════════════════════════*/

const TOTAL_PAGES = 3;

const INTRO_LINES = [
  { speaker: 'girl' as const, text: "Bienvenue. Avant de plonger dans les sections, voici un aperçu de ce qui t'attend." },
  { speaker: 'boy'  as const, text: "On va découvrir ensemble les lanceurs, les satellites et l'impact qu'ils ont dans nos vies." },
  { speaker: 'girl' as const, text: "À chaque étape, réponds aux questions pour passer à la section suivante." },
  { speaker: 'boy'  as const, text: "À la fin de cette session, tu repartiras avec plein de sites et de comptes à suivre pour aller plus loin." },
];

const SESSION1_FULL = [
  {
    num: '01',
    title: 'Les retombées terrestres',
    desc: "GPS, météo, agriculture de précision. Comment le spatial transforme ta vie au quotidien — souvent sans que tu le saches.",
    Icon: Globe,
    chapters: [
      'Une journée dans ta vie',
      'Le regard de Copernicus',
      'Le spatial dans ta poche',
      'Pilotage international',
      'Quiz éclair',
    ],
  },
  {
    num: '02',
    title: 'Les lanceurs spatiaux',
    desc: "Ariane 6, SpaceX, Rocket Lab. Comment fonctionnent les fusées et qui sont les acteurs qui structurent ce marché en plein essor.",
    Icon: Rocket,
    chapters: [
      'La fusée pas à pas',
      'Ariane 6 décortiquée',
      "Les défis de l'ingénieur",
      'Les salles blanches',
      'La séquence de lancement',
      'Quiz éclair',
      'Réflexion',
    ],
  },
  {
    num: '03',
    title: 'Références & communautés',
    desc: "Comptes à suivre, chaînes YouTube, associations et médias pour rester connecté à l'actualité spatiale après la session.",
    Icon: Satellite,
    chapters: [
      'Comptes à suivre',
      'Sites web à explorer',
      'Ton inspiration',
    ],
  },
  {
    num: '04',
    title: 'Tes questions',
    desc: "Un moment pour poser tes propres questions sur l'espace au quotidien, les lanceurs ou l'actualité spatiale.",
    Icon: MessageCircle,
    chapters: [
      'Pose ta question',
    ],
  },
];

const SESSION2_FULL = [
  {
    num: '01',
    title: 'Les satellites',
    chapters: [
      '70 ans de satellites',
      "Anatomie d'un satellite",
      'Les orbites',
      'Instruments de mesure',
      'Débris spatiaux',
      'Quiz éclair',
      'Imagine ta mission',
    ],
  },
  {
    num: '02',
    title: "L'exploration spatiale",
    chapters: [
      "L'ère de l'exploration",
      'Exploration thématique',
      'Quiz éclair',
      'Ton rêve spatial',
    ],
  },
  {
    num: '03',
    title: 'Entreprises du spatial européen',
    chapters: [
      'Carte interactive',
      'Startups vs Entreprises historiques',
      'Les métiers en action',
      'Récap',
    ],
  },
  {
    num: '04',
    title: 'Ton accompagnement',
    chapters: [
      'Associations',
      'Ressources pédagogiques',
      'Vos besoins',
    ],
  },
  {
    num: '05',
    title: 'Questions & réponses',
    chapters: [
      'Questions fréquentes',
      'Pose ta question',
    ],
  },
];

const QUOTES_DATA = [
  {
    id: 'armstrong',
    quote: "C'est un petit pas pour l'homme, un bond de géant pour l'humanité.",
    author: 'Neil Armstrong',
    role: 'Astronaute · 1er homme sur la Lune',
    context: "Prononcée le 21 juillet 1969 lors de la mission Apollo 11. Neil Armstrong fut le premier être humain à poser le pied sur la Lune. Cette phrase, transmise en direct à des centaines de millions de téléspectateurs, reste l'une des plus célèbres de l'histoire spatiale.",
    source: "NASA broadcast, mission Apollo 11 · 21 juillet 1969",
    imageQuestion: `${import.meta.env.BASE_URL}citations/neil2.jpg`,
    imagePortrait: `${import.meta.env.BASE_URL}citations/neil1.jpg`,
  },
  {
    id: 'tsiolkovsky',
    quote: "La Terre est le berceau de l'humanité, mais on ne reste pas éternellement dans son berceau.",
    author: 'Konstantin Tsiolkovsky',
    role: "Mathématicien · Père de l'astronautique",
    context: "Konstantin Tsiolkovsky (1857-1935), mathématicien et ingénieur russe autodidacte, est considéré comme le père de l'astronautique. Sourd depuis l'enfance, il a théorisé les bases de la propulsion par réaction et imaginé les fusées multi-étages bien avant les premiers vols spatiaux.",
    source: "K. Tsiolkovsky, lettre à un correspondant · 1911",
    imageQuestion: `${import.meta.env.BASE_URL}citations/KonstantinTsiolkowsky2.jpg`,
    imagePortrait: `${import.meta.env.BASE_URL}citations/KonstantinTsiolkovsk.jpg`,
  },
  {
    id: 'sagan',
    quote: "Regardez encore ce point. C'est ici. C'est notre foyer. C'est nous.",
    author: 'Carl Sagan',
    role: 'Astrophysicien · Vulgarisateur scientifique',
    context: "Carl Sagan (1934-1996), astrophysicien et vulgarisateur américain, a écrit ces mots en 1994 à propos d'une photo de la Terre prise par la sonde Voyager 1 depuis 6 milliards de kilomètres. Sur cette image, notre planète n'apparaît que comme un infime point bleu pâle — un rappel de notre fragilité et de notre responsabilité collective.",
    source: "Carl Sagan, Pale Blue Dot: A Vision of the Human Future in Space · 1994",
    imageQuestion: `${import.meta.env.BASE_URL}citations/CarlSagan2.jpg`,
    imagePortrait: `${import.meta.env.BASE_URL}citations/CarlSagan.jpg`,
  },
  {
    id: 'hawking',
    quote: "Rappelez-vous de regarder les étoiles et non pas vos pieds.",
    author: 'Stephen Hawking',
    role: 'Physicien théoricien · Cosmologiste',
    context: "Stephen Hawking (1942-2018), physicien théoricien britannique, a consacré sa vie aux mystères des trous noirs et de l'origine de l'univers, malgré la maladie de Charcot qui le condamnait à un fauteuil roulant dès l'âge de 21 ans. Cette citation résume sa philosophie : garder la curiosité et l'émerveillement comme boussoles.",
    source: "Stephen Hawking, discours à l'Université de Cambridge · 2009",
    imageQuestion: `${import.meta.env.BASE_URL}citations/hawkings%202.jpg`,
    imagePortrait: `${import.meta.env.BASE_URL}citations/hawkings1.webp`,
  },
];

const AUTHORS_LIST = [...QUOTES_DATA.map(q => q.author)].sort((a, b) => a.localeCompare(b));

interface IntroductionPageProps {
  onContinue: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function IntroductionPage({ onContinue, onHome, onBack }: IntroductionPageProps) {
  const { saveResponse, getResponses } = useSession();

  const [page, setPage] = useState(0);
  const [words, setWords] = useState<string[]>(['', '', '', '', '']);
  const [quoteMatches, setQuoteMatches] = useState<Record<string, string>>({});
  const [quoteVerified, setQuoteVerified] = useState(false);
  const [quoteChecked, setQuoteChecked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /* Hydrate ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      const saved = await getResponses('introduction');
      if (saved.page) {
        const i = parseInt(saved.page, 10);
        if (!Number.isNaN(i)) setPage(Math.min(Math.max(i, 0), TOTAL_PAGES - 1));
      }
      if (saved.spaceWords) {
        try { setWords(JSON.parse(saved.spaceWords) as string[]); } catch { /* ignore */ }
      }
      if (saved.quoteMatches) {
        try { setQuoteMatches(JSON.parse(saved.quoteMatches) as Record<string, string>); } catch { /* ignore */ }
      }
      if (saved.quoteVerified === 'true') {
        setQuoteVerified(true);
        setQuoteChecked(true);
      }
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Navigation --------------------------------------------------------------- */
  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_PAGES) return;
    setPage(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('introduction', 'page', String(i));
  };

  /* Quote handlers ----------------------------------------------------------- */
  const handleQuoteMatch = async (quoteId: string, author: string) => {
    if (quoteVerified) return;
    const updated = { ...quoteMatches, [quoteId]: author };
    setQuoteMatches(updated);
    setQuoteChecked(false);
    await saveResponse('introduction', 'quoteMatches', JSON.stringify(updated));
  };

  const handleVerifyQuotes = async () => {
    setQuoteChecked(true);
    const allCorrect = QUOTES_DATA.every(q => quoteMatches[q.id] === q.author);
    if (allCorrect) {
      setQuoteVerified(true);
      await saveResponse('introduction', 'quoteVerified', 'true');
    }
  };

  /* Word handlers ------------------------------------------------------------ */
  const handleWordChange = async (index: number, value: string) => {
    const updated = words.map((w, i) => (i === index ? value : w));
    setWords(updated);
    await saveResponse('introduction', 'spaceWords', JSON.stringify(updated));
  };

  const filledWords = words.filter(w => w.trim().length > 0).length;
  const canStartExploration = import.meta.env.DEV || filledWords >= 3;

  /* -------------------------------------------------------------------------- */
  return (
    <SectionCanvas>
      <SectionTopBar label="Introduction · Avant de commencer" onHome={onHome} />
      <SectionProgress current={page} total={TOTAL_PAGES} onGoTo={goTo} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Page 1 : Bienvenue + Le parcours ── */}
        {page === 0 && (
          <div className="flex flex-col gap-16 animate-[chapterIn_480ms_cubic-bezier(.2,0,0,1)]">

            {/* Section 1 — Bienvenue (no footer) */}
            <div>
              <div className="flex flex-col gap-2 mb-7">
                <div className="inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.16em] uppercase text-magenta">
                  <span className="bg-magenta text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold">01</span>
                  Bienvenue
                </div>
                <h1 className="font-display font-bold uppercase tracking-[0.04em] text-[clamp(32px,4vw,52px)] leading-[1.08] m-0">
                  Bienvenue dans l'univers<br />
                  <span className="text-magenta">du spatial</span>
                </h1>
                <p className="text-[16px] text-white/70 max-w-[720px] leading-[1.55] m-0 mt-2">
                  Un parcours éducatif conçu par Space Elevator pour t'aider à te repérer dans l'industrie spatiale. En deux sessions, tu explores les technologies, les acteurs et les opportunités qui structurent ce secteur.
                </p>
              </div>
              <PageWelcome />
            </div>

            <div className="h-px bg-white/10" />

            {/* Section 2 — Le parcours (with footer nav) */}
            <ChapterShell
              kicker="02"
              title="Le parcours"
              titlePrefix="Deux sessions pour tout"
              titleAccent="explorer"
              lede="Voici comment se déroule ce programme. Aujourd'hui tu commences par la session 1 : l'impact du spatial sur ta vie, les lanceurs, et les ressources pour aller plus loin."
              onPrev={onBack}
              onNext={() => goTo(1)}
              nextEnabled={true}
              nextLabel="Continue · Citations historiques →"
            >
              <PageOverview />
            </ChapterShell>
          </div>
        )}

        {/* ── Page 2 : Citations ── */}
        {page === 1 && (
          <ChapterShell
            kicker="03"
            title="Citations"
            titlePrefix="Le spatial dans la culture"
            titleAccent="4 voix qui ont marqué l'histoire"
            lede="Tu viens de voir le programme qui t'attend. Avant de plonger dans les sections, un détour par ceux et celles qui ont posé les bases de ce secteur. Ces quatre figures ont marqué l'exploration spatiale par leurs théories, leurs missions, leurs mots. Associe chaque citation à son auteur·e pour découvrir leur portrait et leur parcours."
            onPrev={() => goTo(0)}
            onNext={() => goTo(2)}
            nextEnabled={quoteVerified}
            nextLabel={quoteVerified ? "Continue · À ton tour →" : "Relie d'abord toutes les citations"}
          >
            <PageQuotes
              matches={quoteMatches}
              checked={quoteChecked}
              verified={quoteVerified}
              onMatch={handleQuoteMatch}
              onVerify={handleVerifyQuotes}
            />
          </ChapterShell>
        )}

        {/* ── Page 3 : À toi ── */}
        {page === 2 && (
          <ChapterShell
            kicker="04"
            title="À toi"
            titlePrefix="Le spatial vu par"
            titleAccent="tes yeux"
            lede="Tu viens de croiser quatre pionniers qui ont consacré leur vie à ce secteur. Avant de te lancer dans le parcours à ton tour, arrête-toi un instant. Quels mots te viennent spontanément quand tu penses à l'espace ?"
            onPrev={() => goTo(1)}
            onNext={onContinue}
            nextEnabled={canStartExploration}
            nextLabel={canStartExploration ? "Commencer →" : `Écris au moins 3 mots (${filledWords}/3)`}
            nextTitle="Les retombées terrestres"
            nextDesc="GPS, météo, agriculture de précision. Comment le spatial transforme ta vie au quotidien."
          >
            <PageWords words={words} onChange={handleWordChange} />
          </ChapterShell>
        )}
      </div>
    </SectionCanvas>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Page 1 — Welcome
 * ══════════════════════════════════════════════════════════════════*/
function PageWelcome() {
  return (
    <div className="flex flex-col gap-8">
      {/* Dialogue */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
        <AvatarGuide lines={INTRO_LINES} interval={3800} />
      </div>

      {/* Context note */}
      <div className="border-l-2 border-magenta/50 pl-5">
        <p className="text-[14px] text-white/65 leading-[1.65] m-0">
          Ce programme a été conçu par Space Elevator pour les lycéens et étudiants qui souhaitent découvrir l'industrie spatiale. Tu n'as besoin d'aucune connaissance préalable : chaque section part de zéro et construit progressivement ta compréhension du secteur.
        </p>
      </div>

      {/* 3 verbs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VerbCard
          icon={<Rocket className="w-10 h-10" strokeWidth={1.75} />}
          tag="Explorer"
          desc="Les lanceurs, satellites et technologies spatiales qui façonnent notre avenir."
        />
        <VerbCard
          icon={<BookOpen className="w-10 h-10" strokeWidth={1.75} />}
          tag="Apprendre"
          desc="Les principes scientifiques derrière les missions spatiales et l'exploration."
        />
        <VerbCard
          icon={<Users className="w-10 h-10" strokeWidth={1.75} />}
          tag="Connecter"
          desc="Associations, mentors et ressources pour poursuivre ton exploration après la session."
        />
      </div>
    </div>
  );
}

function VerbCard({ icon, tag, desc }: { icon: React.ReactNode; tag: string; desc: string }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 hover:border-magenta hover:bg-magenta/[0.04] hover:-translate-y-0.5 rounded-2xl p-6 transition-all duration-200 flex flex-col gap-4">
      <span className="text-magenta">{icon}</span>
      <div>
        <h3 className="font-display font-bold text-[22px] uppercase tracking-[0.04em] m-0 mb-2">{tag}</h3>
        <p className="text-[13.5px] text-white/70 leading-[1.55] m-0">{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Page 2 — Full journey + Session 1 detail
 * ══════════════════════════════════════════════════════════════════*/
function PageOverview() {
  return (
    <div className="flex flex-col gap-12">

      {/* Full journey — both sessions with chapters */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Parcours complet</span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] text-white/35">2 sessions · 9 sections</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          {/* Session 1 */}
          <div className="relative overflow-hidden bg-white/[0.04] border border-magenta/30 rounded-2xl p-6">
            <div className="absolute inset-0 bg-magenta/[0.03]" />
            <div className="relative z-[1]">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="bg-magenta text-white rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.08em] uppercase">Session 1</span>
                <span className="text-[11px] text-magenta/90 font-semibold tracking-[0.08em] uppercase">Aujourd'hui</span>
              </div>
              <div className="flex flex-col gap-5">
                {SESSION1_FULL.map((s, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-5 h-5 rounded-full bg-magenta/20 border border-magenta/50 text-magenta text-[10px] font-bold grid place-items-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[13.5px] font-semibold text-white">{s.title}</span>
                    </div>
              
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Session 2 */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="bg-white/10 text-white/45 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.08em] uppercase">Session 2</span>
              <span className="text-[11px] text-white/35 tracking-[0.08em] uppercase">Prochaine fois</span>
            </div>
            <div className="flex flex-col gap-5">
              {SESSION2_FULL.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white/35 text-[10px] font-bold grid place-items-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[13.5px] font-medium text-white/45">{s.title}</span>
                  </div>
                 
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Session 1 detail cards */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Session 1 · En détail</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <p className="text-[14px] text-white/65 leading-[1.6] m-0">
          Aujourd'hui, tu explores les fondations de l'industrie spatiale : comment l'espace impacte notre planète, qui construit les fusées qui y accèdent, et quelles ressources suivre pour continuer à apprendre après cette session.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SESSION1_FULL.map((s) => (
            <div
              key={s.num}
              className="bg-white/[0.04] border border-white/10 hover:border-magenta hover:bg-magenta/[0.03] hover:-translate-y-0.5 rounded-2xl p-6 transition-all duration-200 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <span className="text-magenta"><s.Icon className="w-8 h-8" strokeWidth={1.75} /></span>
                <span className="text-[11px] font-bold text-white/25 tracking-[0.08em]">{s.num}</span>
              </div>
              <div>
                <h4 className="font-semibold text-[16px] m-0 mb-2">{s.title}</h4>
                <p className="text-[13px] text-white/65 leading-[1.55] m-0">{s.desc}</p>
              </div>
              <div className="pt-1 border-t border-white/8 flex flex-col gap-1.5">
                {s.chapters.map((ch, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-magenta/60 tabular-nums w-4 flex-shrink-0">{String(j + 1).padStart(2, '0')}</span>
                    <span className="text-[12px] text-white/55">{ch}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Page 3 — Quote matching game (redesigned)
 * ══════════════════════════════════════════════════════════════════*/
interface PageQuotesProps {
  matches: Record<string, string>;
  checked: boolean;
  verified: boolean;
  onMatch: (id: string, author: string) => void;
  onVerify: () => void;
}

function PageQuotes({ matches, checked, verified, onMatch, onVerify }: PageQuotesProps) {
  const allFilled = QUOTES_DATA.every(q => matches[q.id]);
  const matchedCount = Object.values(matches).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">

      {/* Intro context */}
      {!verified && (
        <div className="border border-magenta/25 bg-magenta/[0.04] rounded-xl px-5 py-4">
          <p className="text-[13.5px] text-white/80 leading-[1.6] m-0">
            Une fois toutes les correspondances correctes, les portraits se dévoilent avec leur histoire complète.
          </p>
        </div>
      )}

      {QUOTES_DATA.map(q => {
        const selected = matches[q.id] || '';
        const isCorrect = checked && selected === q.author;
        const isWrong   = checked && !!selected && selected !== q.author;

        return (
          <div
            key={q.id}
            className={`bg-white/[0.04] backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 ${
              isCorrect ? 'border-magenta' : isWrong ? 'border-red-400/60' : 'border-white/10'
            }`}
          >
            <div className="flex flex-col md:flex-row">
              {/* Photo */}
              <div className="flex-shrink-0 md:w-56">
                <img
                  src={q.imageQuestion}
                  alt=""
                  className="w-full h-52 md:h-full object-cover"
                />
              </div>

              {/* Quote + select */}
              <div className="flex-1 p-7 flex flex-col justify-between gap-6">
                <div className="relative">
                  <span className="absolute -top-3 -left-1 text-[56px] leading-none font-serif text-magenta/25 select-none">"</span>
                  <p className="text-[18px] italic text-white leading-[1.65] m-0 pl-7 pt-2">{q.quote}</p>
                  <span className="absolute -bottom-2 right-0 text-[56px] leading-none font-serif text-magenta/25 select-none rotate-180 inline-block">"</span>
                </div>

                {!verified ? (
                  <div className="flex items-center gap-3 flex-wrap pt-2">
                    <select
                      value={selected}
                      onChange={(e) => onMatch(q.id, e.target.value)}
                      className={`bg-white/[0.06] text-white border rounded-lg px-4 py-2.5 text-[13.5px] font-medium focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition ${
                        isCorrect ? 'border-magenta' : isWrong ? 'border-red-400/60' : 'border-white/20'
                      }`}
                    >
                      <option value="" className="bg-deepspace">— Qui a dit cela ? —</option>
                      {AUTHORS_LIST.map(a => (
                        <option key={a} value={a} className="bg-deepspace">{a}</option>
                      ))}
                    </select>
                    {isCorrect && <CheckCircle className="w-5 h-5 text-magenta flex-shrink-0" />}
                    {isWrong   && <XCircle    className="w-5 h-5 text-red-400 flex-shrink-0" />}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <CheckCircle className="w-4 h-4 text-magenta flex-shrink-0" />
                    <span className="text-magenta font-semibold text-[15px]">{q.author}</span>
                    <span className="text-[11px] font-medium text-white/50 border border-white/15 rounded-full px-2.5 py-0.5 tracking-[0.04em]">{q.role}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Portrait + context — revealed after all correct */}
            {verified && (
              <div className="border-t border-white/10 p-7">
                <div className="flex gap-5 items-start">
                  <img
                    src={q.imagePortrait}
                    alt={q.author}
                    className="flex-shrink-0 w-20 h-24 object-cover rounded-xl border border-magenta/30"
                  />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-[17px] m-0">{q.author}</h4>
                      <span className="text-[11px] font-medium text-white/50 border border-white/15 rounded-full px-2.5 py-0.5 tracking-[0.04em]">{q.role}</span>
                    </div>
                    <p className="text-white/80 text-[13.5px] leading-[1.65] m-0">{q.context}</p>
                    <p className="text-[11px] text-white/40 italic m-0 mt-1">{q.source}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Verify row */}
      {!verified && (
        <div className="flex items-center justify-between gap-4 flex-wrap mt-2">
          <span className="text-[12px] text-white/50">
            {allFilled
              ? "Toutes les citations sont associées. Tu peux vérifier."
              : `${matchedCount} citation${matchedCount > 1 ? 's' : ''} sur 4 associée${matchedCount > 1 ? 's' : ''}.`}
          </span>
          <button
            onClick={onVerify}
            disabled={!allFilled}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[13.5px] font-semibold bg-magenta text-white hover:bg-magenta-700 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition"
          >
            Vérifier mes réponses
          </button>
        </div>
      )}

      {checked && !verified && (
        <div className="inline-flex items-center gap-2 self-end text-[12.5px] text-red-300/90 mt-1">
          <XCircle className="w-4 h-4" />
          Certaines associations sont incorrectes. Ajuste et réessaie.
        </div>
      )}

      {verified && (
        <div className="inline-flex items-center gap-2 self-start bg-magenta/10 text-magenta border border-magenta/30 rounded-full px-4 py-2 mt-2">
          <CheckCircle className="w-4 h-4" />
          <span className="text-[12.5px] font-semibold">Parfait. Toutes les citations sont correctement associées.</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Page 4 — Five words (redesigned)
 * ══════════════════════════════════════════════════════════════════*/
function PageWords({ words, onChange }: { words: string[]; onChange: (i: number, v: string) => void }) {
  const filledCount = words.filter(w => w.trim().length > 0).length;

  return (
    <div className="flex flex-col gap-7">

      {/* Context */}
      <div className="border border-magenta/25 bg-magenta/[0.04] rounded-xl px-5 py-4 flex flex-col gap-1">
        <p className="text-[14px] text-white/85 leading-[1.65] m-0">
          Cette liste est ton point de départ ! note ce qui te vient spontanément, sans chercher à impressionner.
        </p>
        <p className="text-[13px] text-white/55 leading-[1.55] m-0 mt-1">
          Les mots que tu choisis maintenant forment une photo de ta représentation du spatial avant de tout découvrir.
        </p>
      </div>

      {/* Word inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {words.map((word, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-full grid place-items-center transition-all duration-300 ${
              word.trim()
                ? 'bg-magenta text-white shadow-[0_0_0_4px_rgba(200,37,122,0.18)]'
                : 'bg-magenta/10 border border-magenta/30 text-magenta'
            }`}>
              <span className="font-bold text-[14px]">{i + 1}</span>
            </div>
            <input
              type="text"
              value={word}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder="…"
              maxLength={30}
              className={`w-full rounded-xl px-3 py-4 text-white text-[15px] text-center font-medium placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-magenta/20 transition-all duration-200 ${
                word.trim()
                  ? 'bg-magenta/[0.08] border border-magenta/40 focus:border-magenta'
                  : 'bg-white/[0.04] border border-white/10 focus:border-magenta'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {words.map((w, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                w.trim() ? 'w-4 h-2 bg-magenta' : 'w-2 h-2 bg-white/15'
              }`}
            />
          ))}
        </div>
        <span className="text-[12px] text-white/45">
          {filledCount === 5
            ? "Parfait. Tu es prêt·e à commencer."
            : filledCount >= 3
              ? `${filledCount} mots. Tu peux continuer dès maintenant.`
              : `${filledCount} mot${filledCount > 1 ? 's' : ''} sur 5.`}
        </span>
      </div>
    </div>
  );
}
