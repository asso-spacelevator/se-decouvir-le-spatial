import { useState, useEffect } from 'react';
import { ChevronRight, Rocket, Satellite, Globe, Star } from 'lucide-react';
import { Navigation } from './Navigation';
import { AvatarGuide } from './AvatarGuide';
import { useSession } from '../contexts/SessionContext';

const INTRO_LINES = [
  { speaker: 'girl' as const, text: "Bienvenue ! Avant de plonger dans les sections, voici un aperçu de ce qui t'attend." },
  { speaker: 'boy' as const,  text: "On va explorer la géopolitique, les lanceurs, les satellites et bien plus encore !" },
  { speaker: 'girl' as const, text: "N'hésite pas à répondre aux questions — il n'y a pas de mauvaises réponses." },
  { speaker: 'boy' as const,  text: "À la fin, tu découvriras des associations et ressources pour aller plus loin." },
];

interface IntroductionPageProps {
  onContinue: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function IntroductionPage({ onContinue, onHome, onBack }: IntroductionPageProps) {
  const { saveResponse, getResponses } = useSession();
  const [words, setWords] = useState<string[]>(['', '', '', '', '']);

  useEffect(() => {
    (async () => {
      const saved = await getResponses('introduction');
      if (saved.spaceWords) {
        const parsed = JSON.parse(saved.spaceWords) as string[];
        setWords(parsed);
      }
    })();
  }, []);

  const handleWordChange = async (index: number, value: string) => {
    const updated = words.map((w, i) => (i === index ? value : w));
    setWords(updated);
    await saveResponse('introduction', 'spaceWords', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="starry-background absolute inset-0"></div>

      <div className="relative z-10">
        <Navigation onHome={onHome} onBack={onBack} showBack={true} />

        <div className="max-w-5xl mx-auto px-6 py-20 mt-12">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Star className="w-20 h-20 text-yellow-300 animate-pulse" />
                <Rocket className="w-12 h-12 text-blue-400 absolute top-0 right-0 transform translate-x-4 -translate-y-2" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Bienvenue dans l'Univers du Spatial
            </h1>
            <p className="text-2xl text-blue-200">
              Un voyage éducatif pour découvrir les merveilles du spatial
            </p>
          </div>

          {/* Avatar guide intro */}
          <div className="mb-12 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <AvatarGuide lines={INTRO_LINES} interval={3800} />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform">
              <div className="flex justify-center mb-4">
                <Rocket className="w-16 h-16 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Explorer</h3>
              <p className="text-gray-200 text-center">
                Découvrez les lanceurs, satellites et technologies spatiales qui façonnent notre avenir
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
                Trouvez des associations, mentors et ressources pour poursuivre votre exploration
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-10 border border-white/20 mb-12">
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
                  <h4 className="text-xl font-semibold text-white mb-2">Les Lanceurs</h4>
                  <p className="text-gray-300">
                    Comment fonctionnent-ils ? Qui les fabrique ? Découvrez les secrets de la propulsion spatiale
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
                  <div className="w-12 h-12 rounded-full bg-teal-500/30 flex items-center justify-center border border-teal-400">
                    <span className="text-xl font-bold text-teal-300">3</span>
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

          {/* Question : 5 mots spatial */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-10">
            <p className="text-lg font-semibold text-white mb-6 text-center">
              Écris 5 mots qui te font penser au domaine du spatial
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {words.map((word, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 w-4 text-center">{i + 1}</span>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => handleWordChange(i, e.target.value)}
                    placeholder={`Mot ${i + 1}`}
                    maxLength={30}
                    className="w-36 bg-white border border-white/20 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onContinue}
              className="group bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-12 py-5 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-3 mx-auto"
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
