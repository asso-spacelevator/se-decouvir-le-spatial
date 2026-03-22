import { Rocket } from 'lucide-react';

interface StartPageProps {
  onStart: () => void;
}

export function StartPage({ onStart }: StartPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="starry-background absolute inset-0"></div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="mb-8 inline-block">
          <Rocket className="w-24 h-24 text-blue-400 animate-pulse" />
        </div>

        <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
          Voyage vers <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">l'Espace</span>
        </h1>

        <p className="text-xl text-gray-300 mb-4 leading-relaxed">
          Découvrez l'industrie spatiale européenne
        </p>

        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
          Embarquez pour un voyage interactif à travers les défis géopolitiques, techniques et opérationnels
          du lancement de lanceurs dans l'espace. De la stratégie au décollage.
        </p>

        <button
          onClick={onStart}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
        >
          <span className="relative z-10">Commencer le voyage</span>
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </button>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-3xl font-bold text-blue-400">4</div>
            <div className="text-sm text-gray-400">Sections</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-3xl font-bold text-purple-400">30 min</div>
            <div className="text-sm text-gray-400">Durée</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-3xl font-bold text-blue-400">Interactif</div>
            <div className="text-sm text-gray-400">Expérience</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-3xl font-bold text-purple-400">Gratuit</div>
            <div className="text-sm text-gray-400">Accès</div>
          </div>
        </div>
      </div>
    </div>
  );
}
