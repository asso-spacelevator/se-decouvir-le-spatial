import { Rocket, Satellite, Globe, Users, GraduationCap, MessageCircle, Building2, CheckCircle } from 'lucide-react';
import {
  SectionCanvas,
  SectionTopBar,
  SectionProgress,
  ChapterShell,
  ChapterTimeTracker,
} from './ChapterShell';
import { AvatarGuide } from './AvatarGuide';

/* ════════════════════════════════════════════════════════════════════
 *  IntroductionPage2 — Session 2 on-boarding (2 pages)
 *
 *  1. Bienvenue + Le parcours  — S1 as "déjà vu", S2 overview
 *  2. Session 2 en détail      — 5 section cards + CTA
 * ═══════════════════════════════════════════════════════════════════*/

const TOTAL_PAGES = 1;

const WELCOME_LINES = [
  { speaker: 'girl' as const, text: "Bienvenue en session 2. Tu reviens — c'est la preuve que la session 1 t'a accroché·e." },
  { speaker: 'boy'  as const, text: "Aujourd'hui on passe au cœur du secteur : les satellites, l'exploration et les acteurs qui font l'industrie." },
  { speaker: 'girl' as const, text: "Tu gardes le même format : sections progressives, questions à chaque étape." },
  { speaker: 'boy'  as const, text: "À la fin, tu repartiras avec une carte des entreprises spatiales européennes et un plan d'action pour la suite." },
];

const SESSION1_DONE = [
  { num: '01', title: 'Les retombées terrestres', Icon: Globe },
  { num: '02', title: 'Les lanceurs spatiaux',    Icon: Rocket },
  { num: '03', title: 'Références & communautés', Icon: Users },
  { num: '04', title: 'Tes questions',            Icon: MessageCircle },
];

const SESSION2_FULL = [
  {
    num: '01',
    title: 'Les satellites',
    desc: "70 ans d'histoire en orbite : anatomie, trajectoires, débris. De Spoutnik aux méga-constellations, comprendre ce qui tourne autour de nous.",
    Icon: Satellite,
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
    desc: "Lune, Mars, astéroïdes. Les grandes missions passées et futures, ce qu'elles ont appris à l'humanité, et les rêves qui restent à accomplir.",
    Icon: Globe,
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
    desc: "Carte interactive des acteurs : des institutions fondatrices aux startups qui bousculent les modèles. Qui construit quoi, où, et pourquoi.",
    Icon: Building2,
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
    desc: "Associations, programmes de mentorat et ressources pédagogiques pour continuer après la session — selon ton profil et tes ambitions.",
    Icon: GraduationCap,
    chapters: [
      'Associations',
      'Ressources pédagogiques',
      'Vos besoins',
    ],
  },
  {
    num: '05',
    title: 'Questions & réponses',
    desc: "Pose tes questions en direct à l'équipe Space Elevator. Les questions fréquentes sont déjà là ; les tiennes s'ajouteront à la liste.",
    Icon: MessageCircle,
    chapters: [
      'Questions fréquentes',
      'Pose ta question',
    ],
  },
];

interface IntroductionPage2Props {
  onContinue: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function IntroductionPage2({ onContinue, onHome, onBack }: IntroductionPage2Props) {
  const page = 0;

  /* -------------------------------------------------------------------------- */
  return (
    <ChapterTimeTracker section="introduction2" page={page}>
    <SectionCanvas>
      <SectionTopBar label="Introduction · Session 2" onHome={onHome} />
      <SectionProgress current={page} total={TOTAL_PAGES} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Page unique : Bienvenue + Le parcours ── */}
        {page === 0 && (
          <div className="flex flex-col gap-16 animate-[chapterIn_480ms_cubic-bezier(.2,0,0,1)]">

            {/* Chapter 1 — Bienvenue (no footer) */}
            <div>
              <div className="flex flex-col gap-2 mb-7">
                <div className="inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.16em] uppercase text-magenta">
                  <span className="bg-magenta text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold">01</span>
                  Bienvenue
                </div>
                <h1 className="font-display font-bold uppercase tracking-[0.04em] text-[clamp(32px,4vw,52px)] leading-[1.08] m-0">
                  Tu reviens pour<br />
                  <span className="text-magenta">la session 2</span>
                </h1>
                <p className="text-[16px] text-white/70 max-w-[720px] leading-[1.55] m-0 mt-2">
                  La session 1 t'a donné les bases : retombées terrestres, lanceurs, ressources. Aujourd'hui on entre dans le détail des satellites, de l'exploration et du tissu industriel européen.
                </p>
              </div>

              {/* Dialogue */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <AvatarGuide lines={WELCOME_LINES} interval={3800} />
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Chapter 2 — Le parcours (with footer nav → start session 2) */}
            <ChapterShell
              kicker="02"
              title="Le parcours"
              titlePrefix="Session 1 faite, voici"
              titleAccent="la suite"
              lede="Voici où tu en es dans le programme. Les sections de la session 1 sont terminées. Aujourd'hui tu attaques les cinq sections de la session 2."
              onPrev={onBack}
              onNext={onContinue}
              nextEnabled={true}
              nextLabel="Commencer →"
              nextTitle="Les satellites"
              nextDesc="70 ans d'histoire en orbite : anatomie, trajectoires, débris. De Spoutnik aux méga-constellations."
            >
              <PageJourney />
            </ChapterShell>
          </div>
        )}
      </div>
    </SectionCanvas>
    </ChapterTimeTracker>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  PageJourney — full overview with S1 done / S2 to come + S2 detail
 * ══════════════════════════════════════════════════════════════════*/
function PageJourney() {
  return (
    <div className="flex flex-col gap-12">

      {/* Full journey — both sessions */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Parcours complet</span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] text-white/35">2 sessions · 9 sections</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          {/* Session 1 — déjà vu */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="bg-white/10 text-white/45 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.08em] uppercase">Session 1</span>
              <div className="inline-flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-magenta" strokeWidth={2} />
                <span className="text-[11px] text-magenta font-semibold tracking-[0.06em] uppercase">Déjà vu</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {SESSION1_DONE.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-magenta/15 border border-magenta/30 grid place-items-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-magenta" strokeWidth={2.5} />
                  </div>
                  <span className="text-[13.5px] font-medium text-white/50 line-through decoration-white/25">{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session 2 — aujourd'hui */}
          <div className="relative overflow-hidden bg-white/[0.04] border border-magenta/30 rounded-2xl p-6">
            <div className="absolute inset-0 bg-magenta/[0.03]" />
            <div className="relative z-[1]">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="bg-magenta text-white rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.08em] uppercase">Session 2</span>
                <span className="text-[11px] text-magenta/90 font-semibold tracking-[0.08em] uppercase">Aujourd'hui</span>
              </div>
              <div className="flex flex-col gap-5">
                {SESSION2_FULL.map((s, i) => (
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
        </div>
      </div>

      {/* Session 2 detail cards */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/50">Session 2 · En détail</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <p className="text-[14px] text-white/65 leading-[1.6] m-0">
          Aujourd'hui tu explores le cœur de l'industrie spatiale : les satellites et leurs orbites, les grandes missions d'exploration, les entreprises européennes du secteur, et les ressources pour construire ton parcours après la session.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SESSION2_FULL.map((s) => (
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
              <div className="pt-1 border-t border-white/[0.08] flex flex-col gap-1.5">
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

