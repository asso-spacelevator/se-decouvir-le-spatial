import { Trophy, Home, Star } from 'lucide-react';
import { AvatarGuide } from './AvatarGuide';

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
          Vous avez exploré les enjeux géopolitiques, les lanceurs, les satellites, l'exploration spatiale et bien plus encore.
        </p>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">Ce Que Vous Avez Exploré</h3>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-300 mb-2">🌍 Géopolitique</h4>
              <p className="text-sm text-gray-400">Enjeux stratégiques et souveraineté spatiale</p>
            </div>
            <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
              <h4 className="font-semibold text-cyan-300 mb-2">🚀 Lanceurs</h4>
              <p className="text-sm text-gray-400">Technologies de propulsion et missions</p>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-300 mb-2">🛰️ Satellites</h4>
              <p className="text-sm text-gray-400">Applications et systèmes orbitaux</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <h4 className="font-semibold text-purple-300 mb-2">🌌 Exploration</h4>
              <p className="text-sm text-gray-400">Missions scientifiques et découvertes</p>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
              <h4 className="font-semibold text-orange-300 mb-2">📱 Réseaux</h4>
              <p className="text-sm text-gray-400">Communauté et ressources spatiales</p>
            </div>
            <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
              <h4 className="font-semibold text-pink-300 mb-2">🤝 Accompagnement</h4>
              <p className="text-sm text-gray-400">Associations et opportunités</p>
            </div>
          </div>
        </div>

        <div className="mb-8 max-w-xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <AvatarGuide
            lines={[
              { speaker: 'girl', text: "Bravo ! Tu as parcouru tout le voyage spatial avec nous." },
              { speaker: 'boy',  text: "J'espère que tu repars avec de nouvelles idées et peut-être une vocation !" },
              { speaker: 'girl', text: "N'hésite pas à rejoindre une association ou à contacter des pros du secteur." },
              { speaker: 'boy',  text: "À bientôt, et qui sait — peut-être qu'on se retrouvera dans l'espace un jour !" },
            ]}
            interval={4200}
          />
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onRestart}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-lg font-semibold rounded-full hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour au Début
          </button>
        </div>

        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-w-xl mx-auto">
          <div className="flex items-start gap-3">
            <Star className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="text-left">
              <p className="text-gray-300 font-semibold mb-2">Passionné par l'espace ?</p>
              <p className="text-gray-400 text-sm">
                Visitez{' '}
                <a href="https://www.esa.int/About_Us/Careers_at_ESA" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">
                  Carrières à l'ESA
                </a>
                {' '}pour explorer les opportunités professionnelles dans le secteur spatial européen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
