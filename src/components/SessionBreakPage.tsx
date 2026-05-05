import { ChevronRight, Clock, CheckCircle2, Rocket, Globe, MessageSquare } from 'lucide-react';

interface SessionBreakPageProps {
  onContinue: () => void;
  onHome: () => void;
}

export function SessionBreakPage({ onContinue, onHome }: SessionBreakPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center px-6 py-16">
      {/* Session 1 completed badge */}
      <div className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4" />
        Session 1 terminée
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 leading-tight">
        Bravo, c'est la pause !
      </h1>
      <p className="text-gray-400 text-center text-lg max-w-xl mb-12 leading-relaxed">
        Vous avez couvert l'impact terrestre du spatial, les lanceurs et les réseaux professionnels. Prenez une pause — la session 2 sera là quand vous revenez.
      </p>

      {/* Recap session 1 */}
      <div className="w-full max-w-2xl mb-10">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 text-center">Ce que vous avez exploré</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Globe className="w-5 h-5" />, label: 'Impact Terrestre', color: 'text-blue-400 border-blue-500/30 bg-blue-500/8' },
            { icon: <Rocket className="w-5 h-5" />, label: 'Lanceurs', color: 'text-orange-400 border-orange-500/30 bg-orange-500/8' },
            { icon: <MessageSquare className="w-5 h-5" />, label: 'Réseaux & Social', color: 'text-pink-400 border-pink-500/30 bg-pink-500/8' },
          ].map(({ icon, label, color }) => (
            <div key={label} className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${color}`}>
              {icon}
              <span className="text-xs font-medium text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Session 2 preview */}
      <div className="w-full max-w-2xl bg-white/4 border border-white/10 rounded-2xl p-6 mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-400" />
          <p className="text-sm font-semibold text-gray-300">Session 2 — Au programme</p>
        </div>
        <div className="space-y-3">
          {[
            { num: '01', title: 'Orbite', desc: 'Les satellites et leurs usages concrets' },
            { num: '02', title: 'Au-delà', desc: 'Exploration lointaine et défis futurs' },
            { num: '03', title: 'Accompagnement', desc: 'Associations, ressources pédagogiques, mentorat' },
            { num: '04', title: 'FAQ & Questions', desc: 'Vos questions aux professionnels du spatial' },
          ].map(({ num, title, desc }) => (
            <div key={num} className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-600 w-6 flex-shrink-0">{num}</span>
              <div>
                <span className="text-sm font-semibold text-white">{title}</span>
                <span className="text-xs text-gray-500 ml-2">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={onHome}
          className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-all text-sm font-medium"
        >
          Retour à l'accueil
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-3 rounded-xl bg-white text-slate-900 hover:bg-gray-100 transition-all text-sm font-semibold flex items-center justify-center gap-2"
        >
          Commencer la session 2
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
