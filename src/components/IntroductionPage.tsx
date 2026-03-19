import { ChevronRight, Rocket, Satellite, Globe, Star } from 'lucide-react';
import { Navigation } from './Navigation';

interface IntroductionPageProps {
  onContinue: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function IntroductionPage({ onContinue, onHome, onBack }: IntroductionPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="starry-background absolute inset-0"></div>

      <div className="relative z-10">
        <Navigation onHome={onHome} onBack={onBack} showBack={true} />

        <div className="max-w-5xl mx-auto px-6 py-20 mt-12">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Star className="w-20 h-20 text-yellow-300 animate-pulse" />
                <Rocket className="w-12 h-12 text-blue-400 absolute top-0 right-0 transform translate-x-4 -translate-y-2" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Bienvenue dans l'Univers de l'Espace
            </h1>
            <p className="text-2xl text-blue-200">
              Un voyage éducatif pour découvrir les merveilles du spatial
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform">
              <div className="flex justify-center mb-4">
                <Rocket className="w-16 h-16 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Explorer</h3>
              <p className="text-gray-200 text-center">
                Découvrez les fusées, satellites et technologies spatiales qui façonnent notre avenir
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform">
              <div className="flex justify-center mb-4">
                <Satellite className="w-16 h-16 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Apprendre</h3>
              <p className="text-gray-200 text-center">
                Comprenez les principes scientifiques derrière les missions spatiales et l'exploration
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform">
              <div className="flex justify-center mb-4">
                <Globe className="w-16 h-16 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Connecter</h3>
              <p className="text-gray-200 text-center">
                Trouvez des associations, mentors et ressources pour poursuivre votre passion
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-md rounded-2xl p-10 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Ce que vous allez découvrir
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center border border-blue-400">
                    <span className="text-xl font-bold text-blue-300">1</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Les Fusées</h4>
                  <p className="text-gray-300">
                    Comment fonctionnent-elles ? Qui les fabrique ? Découvrez les secrets de la propulsion spatiale
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/30 flex items-center justify-center border border-cyan-400">
                    <span className="text-xl font-bold text-cyan-300">2</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Les Satellites</h4>
                  <p className="text-gray-300">
                    GPS, météo, communications... Explorez leurs applications dans notre quotidien
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center border border-purple-400">
                    <span className="text-xl font-bold text-purple-300">3</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Les Acteurs</h4>
                  <p className="text-gray-300">
                    Agences spatiales, entreprises privées et organisations mondiales
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center border border-green-400">
                    <span className="text-xl font-bold text-green-300">4</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Votre Parcours</h4>
                  <p className="text-gray-300">
                    Ressources éducatives, associations et opportunités de mentorat
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onContinue}
              className="group bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-12 py-5 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-3 mx-auto"
            >
              Commencer l'Exploration
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-gray-400 mt-6">
              Temps estimé : 15-20 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
