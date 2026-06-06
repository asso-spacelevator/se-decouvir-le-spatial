import { useEffect, useState, useRef } from 'react';
import { Globe, Rocket, Wifi, Satellite, Compass, Users, MessageCircle, ArrowRight, RotateCcw, Check, School, Info } from 'lucide-react';
import { GirlAvatar, BoyAvatar } from './AvatarGuide';
import { useSession } from '../contexts/SessionContext';
import { RestartConfirmModal } from './RestartConfirmModal';

interface StartPageProps {
  onStartSession1: () => void;
  onStartSession2: () => void;
}

/* ─────────────────────────────────────────────────────────
 * Dialogue cycled at top
 * ────────────────────────────────────────────────────────*/
const DIALOGUE = [
  { speaker: 'girl' as const, text: "Salut ! Moi c'est Léa. Tu veux découvrir l'industrie spatiale ?" },
  { speaker: 'boy'  as const, text: "Et moi c'est Noah ! On va t'emmener dans un voyage interactif." },
  { speaker: 'girl' as const, text: "Deux sessions indépendantes. Commence par celle qui t'intéresse." },
  { speaker: 'boy'  as const, text: "À la fin, on espère que tu repartiras avec plein d'idées." },
];

const SESSION_1_TOPICS = [
  { icon: <Globe className="w-4 h-4" />,    label: 'Impact terrestre' },
  { icon: <Rocket className="w-4 h-4" />,   label: 'Lanceurs & Ariane 6' },
  { icon: <Wifi className="w-4 h-4" />,     label: 'Réseaux & médias spatiaux' },
];

const SESSION_2_TOPICS = [
  { icon: <Satellite className="w-4 h-4" />,     label: 'Satellites & orbite' },
  { icon: <Compass className="w-4 h-4" />,       label: 'Exploration lointaine' },
  { icon: <Users className="w-4 h-4" />,         label: 'Associations & mentorat' },
  { icon: <MessageCircle className="w-4 h-4" />, label: 'FAQ & questions' },
];

export function StartPage({ onStartSession1, onStartSession2 }: StartPageProps) {
  const { session, restartSession, saveSchoolName } = useSession();
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [talking, setTalking] = useState(true);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [schoolInput, setSchoolInput] = useState('');
  const [schoolSaved, setSchoolSaved] = useState(false);
  const schoolSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (session?.school_name) setSchoolInput(session.school_name);
  }, [session?.school_name]);

  const handleSchoolChange = (value: string) => {
    setSchoolInput(value);
    setSchoolSaved(false);
    if (schoolSaveTimer.current) clearTimeout(schoolSaveTimer.current);
    if (value.trim()) {
      schoolSaveTimer.current = setTimeout(async () => {
        await saveSchoolName(value.trim());
        setSchoolSaved(true);
      }, 800);
    }
  };

  const SESSION1_CHAPTERS = ['impact_terrestre', 'rockets', 'social'];
  const SESSION2_CHAPTERS = ['satellites', 'exploration', 'entreprises_spatiales', 'accompagnement', 'faq_questions'];

  const s1done = !!session?.session1_completed_at;
  const s2done = !!session?.session2_completed_at;

  const s1chapitres = session ? SESSION1_CHAPTERS.filter(s => session.completed_sections.includes(s)).length : 0;
  const s2chapitres = session ? SESSION2_CHAPTERS.filter(s => session.completed_sections.includes(s)).length : 0;

  const s1status = s1done ? 'completed' : s1chapitres > 0 ? 'in_progress' : 'not_started';
  const s2status = s2done ? 'completed' : s2chapitres > 0 ? 'in_progress' : 'not_started';

  const handleConfirmRestart = async () => {
    setIsRestarting(true);
    await restartSession();
    setIsRestarting(false);
    setShowRestartModal(false);
  };

  useEffect(() => {
    const talkDuration = 2400;
    const pauseDuration = 600;
    const talkTimer = setTimeout(() => setTalking(false), talkDuration);
    const advanceTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setDialogueIndex(i => (i + 1) % DIALOGUE.length);
        setVisible(true);
        setTalking(true);
      }, 300);
    }, talkDuration + pauseDuration);
    return () => {
      clearTimeout(talkTimer);
      clearTimeout(advanceTimer);
    };
  }, [dialogueIndex]);

  const current = DIALOGUE[dialogueIndex];
  const isGirl = current.speaker === 'girl';

  return (
    <div className="relative min-h-screen overflow-hidden bg-deepspace text-white font-sans">
      {showRestartModal && (
        <RestartConfirmModal
          onConfirm={handleConfirmRestart}
          onCancel={() => setShowRestartModal(false)}
          isLoading={isRestarting}
        />
      )}
      {/* Starry background */}
      <div className="starry-background absolute inset-0" />

      {/* Brand magenta glow + giant crescent — replaces the old blue/teal blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 -right-64 w-[900px] h-[900px] rounded-full opacity-[0.06] bg-white blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-25 bg-magenta blur-[120px]" />
        <div className="absolute -top-32 right-24 w-[420px] h-[420px] rounded-full opacity-10 bg-magenta blur-[100px]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 max-w-[1440px] mx-auto px-10 pt-8 flex items-center justify-between">
        <img
          src={`${import.meta.env.BASE_URL}logos/space-elevator.png`}
          alt="Space Elevator"
          className="h-11 block"
        />
        <div className="text-[12px] font-medium tracking-[0.16em] uppercase text-white/55 flex items-center gap-2.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-magenta" />
          Se découvrir le spatial · Région Île-de-France
        </div>
      </header>

      {/* Stage */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-10 pt-14 pb-12 flex flex-col gap-10">

        {/* Hero + avatars */}
        <section className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-16 items-center">

          {/* Hero copy */}
          <div>
            <p className="m-0 mb-4 inline-flex items-center gap-3 text-magenta text-[13px] font-medium tracking-[0.18em] uppercase">
              <span className="inline-block w-7 h-[1.5px] bg-magenta" />
              Programme Space Elevator
            </p>
            <h1 className="font-display font-bold text-[clamp(56px,6.4vw,92px)] leading-[0.95] tracking-[0.04em] uppercase m-0 mb-6">
              Voyage vers<br/>
              <span className="text-magenta">l'espace</span>
            </h1>
            <p className="text-[18px] leading-[1.55] text-white/75 max-w-[540px] m-0">
              Deux sessions interactives pour découvrir l'industrie spatiale européenne.
              Un parcours intéractif pour découvir les métiers du spatial.
            </p>
          </div>

          {/* Avatars + dialogue */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-end justify-center gap-5">
              {/* Léa */}
              <div className={`flex flex-col items-center gap-2.5 transition-all duration-300 ${isGirl ? 'scale-[1.06]' : 'scale-[0.92] opacity-55'}`}>
                <GirlAvatar talking={isGirl && talking} size={120} />
                <span className={`text-[11px] font-semibold tracking-[0.14em] uppercase ${isGirl ? 'text-white' : 'text-white/70'}`}>
                  {isGirl && <span className="inline-block w-[6px] h-[6px] rounded-full bg-magenta mr-2 align-middle shadow-[0_0_12px_rgba(200,37,122,0.7)]" />}
                  Léa
                </span>
              </div>

              {/* Bubble (white, magenta speaker name) */}
              <div className={`relative bg-white text-black rounded-2xl px-6 py-5 text-[16px] font-normal leading-[1.5] max-w-[360px] min-h-[96px] flex items-center text-left shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <span className={`absolute bottom-6 w-3.5 h-3.5 bg-white rotate-45 ${isGirl ? '-left-[7px]' : '-right-[7px]'}`} />
                <span>
                  <span className="text-magenta font-semibold mr-1.5">{isGirl ? 'Léa :' : 'Noah :'}</span>
                  {current.text}
                </span>
              </div>

              {/* Noah */}
              <div className={`flex flex-col items-center gap-2.5 transition-all duration-300 ${!isGirl ? 'scale-[1.06]' : 'scale-[0.92] opacity-55'}`}>
                <BoyAvatar talking={!isGirl && talking} size={120} />
                <span className={`text-[11px] font-semibold tracking-[0.14em] uppercase ${!isGirl ? 'text-white' : 'text-white/70'}`}>
                  {!isGirl && <span className="inline-block w-[6px] h-[6px] rounded-full bg-magenta mr-2 align-middle shadow-[0_0_12px_rgba(200,37,122,0.7)]" />}
                  Noah
                </span>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-2">
              {DIALOGUE.map((_, i) => (
                <div
                  key={i}
                  className={`h-[6px] rounded-full transition-all duration-200 ${i === dialogueIndex ? 'w-[22px] bg-magenta' : 'w-[6px] bg-white/25'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* School name — optional */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 max-w-lg flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-magenta/15 grid place-items-center flex-shrink-0">
                <School className="w-4 h-4 text-magenta" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-white leading-snug m-0">
                  Ton établissement
                </p>
                <p className="text-[12px] text-white/50 m-0 leading-snug">
                  Si tu participes avec ta classe, renseigne le nom ici
                </p>
              </div>
            </div>
            <div className="relative group/rgpd flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-white/25 hover:text-white/55 cursor-help transition-colors duration-150" strokeWidth={1.75} />
              <div className="absolute bottom-full right-0 mb-2 w-[270px] bg-[#1a1f3a] border border-white/10 rounded-xl px-3.5 py-3 text-[11px] text-white/65 leading-relaxed opacity-0 group-hover/rgpd:opacity-100 pointer-events-none transition-opacity duration-150 z-20">
                Cette information sert aux analyses d'utilisation du site et n'est conservée qu'1 an en base de données.
                <span className="absolute top-full right-3 border-4 border-transparent border-t-[#1a1f3a]" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={schoolInput}
              onChange={e => handleSchoolChange(e.target.value)}
              maxLength={150}
              placeholder="Ex : Lycée Jules Verne, Paris 19e"
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white placeholder-white/25 focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-colors"
            />
            {schoolSaved && (
              <span className="flex items-center gap-1.5 text-[11px] text-white/45 whitespace-nowrap">
                <Check className="w-3.5 h-3.5 text-magenta" strokeWidth={2.5} />
                Enregistré
              </span>
            )}
          </div>
        </div>

        {/* Sessions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SessionCard
            variant="do"
            tag="Partie 1 · 3 chapitres"
            title="L'espace au"
            titleAccent="quotidien"
            lede="Comment le spatial influence ta vie, les lanceurs qui partent de Kourou, et où suivre l'actualité spatiale."
            topics={SESSION_1_TOPICS}
            cta={s1status === 'completed' ? 'Revoir la partie 1' : s1status === 'in_progress' ? 'Reprendre la partie 1' : 'Commencer la partie 1'}
            bigNum="1"
            completionStatus={s1status}
            completedChapters={s1chapitres}
            totalChapters={SESSION1_CHAPTERS.length}
            onClick={onStartSession1}
          />
          <SessionCard
            variant="inspire"
            tag="Partie 2 · 4 chapitres"
            title="Explorer"
            titleAccent="l'espace"
            lede="Les satellites en orbite, les missions lointaines vers Mars et au-delà, et comment t'orienter vers ces métiers."
            topics={SESSION_2_TOPICS}
            cta={s2status === 'completed' ? 'Revoir la partie 2' : s2status === 'in_progress' ? 'Reprendre la partie 2' : 'Commencer la partie 2'}
            bigNum="2"
            completionStatus={s2status}
            completedChapters={s2chapitres}
            totalChapters={SESSION2_CHAPTERS.length}
            onClick={onStartSession2}
          />
        </section>

        {/* Restart session */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowRestartModal(true)}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-[13px] font-medium transition-colors duration-150"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            Recommencer une nouvelle séance
          </button>
        </div>

        {/* Partners */}
        <div className="flex flex-col items-center gap-3.5 mt-4 opacity-90">
          <div className="flex items-center gap-10">
            <img
              src={`${import.meta.env.BASE_URL}logos/space-elevator.png`}
              alt="Space Elevator"
              className="h-11 block"
            />
            <img
              src={`${import.meta.env.BASE_URL}logos/ile-de-france.png`}
              alt="Région Île-de-France"
              className="h-10 block bg-white rounded px-2 py-1"
            />
          </div>
          <p className="text-[11px] text-white/50 tracking-[0.04em]">
            Par l'association Space Elevator avec le soutien de la Région Île-de-France
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * SessionCard — two contrasting variants (white / magenta)
 * ────────────────────────────────────────────────────────*/
type CompletionStatus = 'not_started' | 'in_progress' | 'completed';

interface SessionCardProps {
  variant: 'do' | 'inspire';
  tag: string;
  title: string;
  titleAccent: string;
  lede: string;
  topics: { icon: React.ReactNode; label: string }[];
  cta: string;
  bigNum: string;
  onClick: () => void;
  completionStatus: CompletionStatus;
  completedChapters: number;
  totalChapters: number;
}

function SessionCard({ variant, tag, title, titleAccent, lede, topics, cta, bigNum, onClick, completionStatus, completedChapters, totalChapters }: SessionCardProps) {
  const isDo = variant === 'do';
  const surface  = isDo ? 'bg-white text-black hover:shadow-2xl'        : 'bg-magenta text-white hover:bg-magenta-700';
  const tagClass = isDo ? 'text-magenta'                                : 'text-white/85';
  const accent   = isDo ? 'text-magenta'                                : 'text-white';
  const numBg    = isDo ? 'bg-magenta/10 text-magenta'                  : 'bg-white/20 text-white';
  const iconCol  = isDo ? 'text-magenta'                                : 'text-white';
  const border   = isDo ? 'border-black/10'                             : 'border-white/15';
  const arrowBg  = isDo ? 'bg-black text-white'                         : 'bg-white text-magenta';
  const bigCol   = isDo ? 'text-black/[0.04]'                           : 'text-white/10';

  const badgeClass = isDo
    ? 'bg-magenta/10 text-magenta border border-magenta/25'
    : 'bg-white/20 text-white border border-white/30';
  const progressClass = isDo ? 'text-magenta/70' : 'text-white/70';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-8 pb-7 text-left flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 ${surface}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${tagClass}`}>{tag}</span>
          {completionStatus === 'completed' && (
            <span className={`inline-flex items-center gap-1.5 self-start text-[10.5px] font-semibold tracking-[0.08em] uppercase rounded-full px-2.5 py-0.5 ${badgeClass}`}>
              <Check className="w-3 h-3" strokeWidth={2.5} />
              Terminée
            </span>
          )}
          {completionStatus === 'in_progress' && (
            <span className={`text-[11px] font-medium ${progressClass}`}>
              {completedChapters}/{totalChapters} chapitres complétés
            </span>
          )}
        </div>
        <div className={`w-11 h-11 rounded-full grid place-items-center transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0 ${arrowBg}`}>
          <ArrowRight className="w-5 h-5" strokeWidth={2.25} />
        </div>
      </div>

      <h3 className="font-display font-bold text-[30px] leading-[1.05] uppercase tracking-[0.02em] m-0">
        {title}<br/><span className={accent}>{titleAccent}</span>
      </h3>

      <p className="text-[14.5px] leading-[1.55] m-0 opacity-85">{lede}</p>

      <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
        {topics.map(({ icon, label }, i) => (
          <li key={label} className="flex items-center gap-3 text-[14px] font-medium">
            <span className={`w-[22px] h-[22px] rounded-full grid place-items-center text-[11px] font-bold flex-shrink-0 ${numBg}`}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={`w-5 h-5 grid place-items-center flex-shrink-0 ${iconCol}`}>{icon}</span>
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div className={`mt-1 pt-4 border-t flex justify-end ${border}`}>
        <span className="font-semibold text-[14px] inline-flex items-center gap-2">
          {cta} →
        </span>
      </div>

      <span aria-hidden className={`absolute -bottom-8 -right-4 font-display font-extrabold text-[220px] leading-none select-none pointer-events-none ${bigCol}`}>
        {bigNum}
      </span>
    </button>
  );
}
