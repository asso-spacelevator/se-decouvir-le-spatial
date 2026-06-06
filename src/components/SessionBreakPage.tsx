import { Home, CheckCircle2, Rocket, Globe, MessageSquare, ChevronRight } from 'lucide-react';
import { SectionCanvas } from './ChapterShell';

interface SessionBreakPageProps {
  onContinue: () => void;
  onHome: () => void;
}

export function SessionBreakPage({ onContinue }: SessionBreakPageProps) {
  return (
    <SectionCanvas>
      <div className="relative z-[1] flex flex-col items-center justify-center min-h-screen px-6 py-16">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-magenta/30 bg-magenta/10 text-magenta text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Session 1 terminée
        </div>

        <h1 className="font-display font-bold uppercase tracking-[0.04em] text-[clamp(36px,5vw,56px)] text-center mb-4 leading-tight">
          Bravo, <span className="text-magenta">c'est fini !</span>
        </h1>
        <p className="text-white/60 text-center text-[17px] max-w-xl mb-12 leading-relaxed">
          Tu as vu comment le spatial façonne la vie au sol. La session 2 t'emmène en orbite : satellites, missions lointaines, et les structures qui peuvent t'ouvrir la porte de ce secteur.
        </p>

        {/* Recap */}
        <div className="w-full max-w-2xl mb-10">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/40 mb-4 text-center">Ce que tu as exploré</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Globe className="w-5 h-5" />, label: 'Impact Terrestre' },
              { icon: <Rocket className="w-5 h-5" />, label: 'Lanceurs' },
              { icon: <MessageSquare className="w-5 h-5" />, label: 'Réseaux & Social' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl border border-magenta/25 bg-magenta/[0.06] p-4 text-magenta"
              >
                {icon}
                <span className="text-xs font-medium text-center text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Session 2 teaser */}
        <div className="w-full max-w-2xl bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-10">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/40 mb-4">Session 2 — t'attend à l'accueil</p>
          <div className="space-y-2">
            {[
              { num: '01', title: 'Orbite', desc: '7 500 satellites actifs : leur anatomie, leurs orbites, et les débris qu\'ils laissent.' },
              { num: '02', title: 'Exploration', desc: 'James Webb, Artemis, Mars. Les missions qui repoussent ce que l\'humanité sait être possible.' },
              { num: '03', title: 'Accompagnement', desc: 'Les associations, les ressources et les personnes qui peuvent t\'ouvrir la porte de ce secteur.' },
              { num: '04', title: 'FAQ & Questions', desc: 'Tes questions, posées à des professionnels du spatial.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex items-center gap-4">
                <span className="text-xs font-mono text-white/30 w-6 flex-shrink-0">{num}</span>
                <div>
                  <span className="text-sm font-semibold text-white">{title}</span>
                  <span className="text-xs text-white/45 ml-2">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onContinue}
          className="inline-flex items-center gap-3 px-8 py-4 bg-magenta hover:bg-magenta-700 text-white transition rounded-xl text-base font-semibold"
        >
          <Home className="w-5 h-5" />
          Retour à l'accueil
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </SectionCanvas>
  );
}
