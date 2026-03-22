import { Trophy, Rocket, Home } from 'lucide-react';

interface CompletionPageProps {
  onRestart: () => void;
}

export function CompletionPage({ onRestart }: CompletionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAKICAKICAKICAKICAKICAKICAKICAKICAKICAKICAK')]"></div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="mb-8 inline-block">
          <Trophy className="w-24 h-24 text-yellow-400 animate-bounce" />
        </div>

        <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
          Voyage <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Complété !</span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
          Félicitations d'avoir complété votre voyage à travers l'industrie spatiale européenne.
          Vous avez exploré le paysage géopolitique, les défis techniques, l'excellence manufacturière,
          et expérimenté un lancement de lanceur.
        </p>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">Ce Que Vous Avez Appris</h3>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-300 mb-2">Importance Géopolitique</h4>
              <p className="text-sm text-gray-400">Souveraineté spatiale et autonomie stratégique</p>
            </div>
            <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
              <h4 className="font-semibold text-cyan-300 mb-2">Innovation Technique</h4>
              <p className="text-sm text-gray-400">Défis d'ingénierie et solutions</p>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-300 mb-2">Fabrication Avancée</h4>
              <p className="text-sm text-gray-400">Systèmes complexes de lanceur</p>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
              <h4 className="font-semibold text-orange-300 mb-2">Opérations de Lancement</h4>
              <p className="text-sm text-gray-400">Du compte à rebours à l'orbite</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onRestart}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour au Début
          </button>
        </div>

        <div className="mt-12 text-gray-400 text-sm">
          <p>Intéressé par une carrière dans l'espace ?</p>
          <p className="mt-2">
            Visitez{' '}
            <a href="https://www.esa.int/About_Us/Careers_at_ESA" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              Carrières à l'ESA
            </a>
            {' '}pour explorer les opportunités
          </p>
        </div>
      </div>
    </div>
  );
}
