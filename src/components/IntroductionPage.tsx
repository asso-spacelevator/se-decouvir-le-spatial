import { useState, useEffect } from 'react';
import { ChevronRight, Rocket, Satellite, Globe, Star, CheckCircle, XCircle } from 'lucide-react';
import { Navigation } from './Navigation';
import { AvatarGuide } from './AvatarGuide';
import { useSession } from '../contexts/SessionContext';

const INTRO_LINES = [
  { speaker: 'girl' as const, text: "Bienvenue ! Avant de plonger dans les sections, voici un aperçu de ce qui t'attend." },
  { speaker: 'boy' as const,  text: "On va découvrir ensemble les lanceurs, les satellites et l'impact qu'il ont dans nos vies et bien plus encore !" },
  { speaker: 'girl' as const, text: "A chaque étape, répond aux questions qui te sont posées pour passer à la section suivante." },
  { speaker: 'boy' as const,  text: "À la fin de cette session, tu découvriras des sites internet à explorer et des comptes insta à suivre pour pleins di'mages et d'annecdotes au quotidien." },
];

const QUOTES_DATA = [
  {
    id: 'armstrong',
    quote: "C'est un petit pas pour l'homme, un bond de géant pour l'humanité.",
    author: 'Neil Armstrong',
    context: "Prononcée le 21 juillet 1969 lors de la mission Apollo 11, Neil Armstrong fut le premier être humain à poser le pied sur la Lune. Cette phrase, transmise en direct à des centaines de millions de téléspectateurs, reste l'une des plus célèbres de l'histoire de l'exploration spatiale.",
    source: "NASA broadcast, mission Apollo 11 — 21 juillet 1969",
    imageQuestion: `${import.meta.env.BASE_URL}citations/neil2.jpg`,
    imagePortrait: `${import.meta.env.BASE_URL}citations/neil1.jpg`,
    bgColor: 'from-yellow-800/40 to-amber-900/40',
    borderColor: 'border-yellow-500/40',
    accentColor: 'text-yellow-300',
  },
  {
    id: 'tsiolkovsky',
    quote: "La Terre est le berceau de l'humanité, mais on ne reste pas éternellement dans son berceau.",
    author: 'Konstantin Tsiolkovsky',
    context: "Konstantin Tsiolkovsky (1857-1935), mathématicien et ingénieur russe autodidacte, est considéré comme le père de l'astronautique. Sourd depuis l'enfance, il a théorisé les bases de la propulsion par réaction et imaginé les fusées multi-étages bien avant les premiers vols spatiaux.",
    source: "K. Tsiolkovsky, lettre à un correspondant, 1911",
    imageQuestion: `${import.meta.env.BASE_URL}citations/KonstantinTsiolkowsky2.jpg`,
    imagePortrait: `${import.meta.env.BASE_URL}citations/KonstantinTsiolkovsk.jpg`,
    bgColor: 'from-blue-800/40 to-indigo-900/40',
    borderColor: 'border-blue-500/40',
    accentColor: 'text-blue-300',
  },
  {
    id: 'sagan',
    quote: "Regardez encore ce point. C'est ici. C'est notre foyer. C'est nous.",
    author: 'Carl Sagan',
    context: "Carl Sagan (1934-1996), astrophysicien et vulgarisateur américain, a écrit ces mots en 1994 à propos d'une photo de la Terre prise par la sonde Voyager 1 depuis 6 milliards de kilomètres. Sur cette image, notre planète n'apparaît que comme un infime point bleu pâle — un rappel de notre fragilité et de notre responsabilité collective.",
    source: "Carl Sagan, Pale Blue Dot: A Vision of the Human Future in Space, 1994",
    imageQuestion: `${import.meta.env.BASE_URL}citations/CarlSagan2.jpg`,
    imagePortrait: `${import.meta.env.BASE_URL}citations/CarlSagan.jpg`,
    bgColor: 'from-teal-800/40 to-cyan-900/40',
    borderColor: 'border-teal-500/40',
    accentColor: 'text-teal-300',
  },
  {
    id: 'hawking',
    quote:  "Rappelez-vous de regarder les étoiles et non pas vos pieds.",
    author: 'Stephen Hawking',
    context: "Stephen Hawking (1942-2018), physicien théoricien britannique, a consacré sa vie aux mystères des trous noirs et de l'origine de l'univers, malgré la maladie de Charcot qui le condamnait à un fauteuil roulant dès l'âge de 21 ans. Cette citation résume sa philosophie : garder la curiosité et l'émerveillement comme boussoles.",
    source: "Stephen Hawking, discours à l'Université de Cambridge, 2009",
    imageQuestion: `${import.meta.env.BASE_URL}citations/hawkings%202.jpg`,
    imagePortrait: `${import.meta.env.BASE_URL}citations/hawkings1.webp`,
    bgColor: 'from-purple-800/40 to-violet-900/40',
    borderColor: 'border-purple-500/40',
    accentColor: 'text-purple-300',
  },
];

const AUTHORS_LIST = ['Neil Armstrong', 'Konstantin Tsiolkovsky', 'Carl Sagan', 'Stephen Hawking'];

interface IntroductionPageProps {
  onContinue: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function IntroductionPage({ onContinue, onHome, onBack }: IntroductionPageProps) {
  const { saveResponse, getResponses } = useSession();
  const [words, setWords] = useState<string[]>(['', '', '', '', '']);
  const [quoteMatches, setQuoteMatches] = useState<Record<string, string>>({});
  const [quoteVerified, setQuoteVerified] = useState(false);
  const [quoteChecked, setQuoteChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getResponses('introduction');
      if (saved.spaceWords) {
        const parsed = JSON.parse(saved.spaceWords) as string[];
        setWords(parsed);
      }
      if (saved.quoteMatches) {
        setQuoteMatches(JSON.parse(saved.quoteMatches) as Record<string, string>);
      }
      if (saved.quoteVerified === 'true') {
        setQuoteVerified(true);
        setQuoteChecked(true);
      }
    })();
  }, []);

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

  const handleWordChange = async (index: number, value: string) => {
    const updated = words.map((w, i) => (i === index ? value : w));
    setWords(updated);
    await saveResponse('introduction', 'spaceWords', JSON.stringify(updated));
  };

  const filledWords = words.filter(w => w.trim().length > 0).length;
  const canContinue = import.meta.env.DEV || filledWords >= 3;

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
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20  transition-transform">
              <div className="flex justify-center mb-4">
                <Rocket className="w-16 h-16 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Explorer</h3>
              <p className="text-gray-200 text-center">
                Découvrez les lanceurs, satellites et technologies spatiales qui façonnent notre avenir
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 transition-transform">
              <div className="flex justify-center mb-4">
                <Satellite className="w-16 h-16 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Apprendre</h3>
              <p className="text-gray-200 text-center">
                Comprenez les principes scientifiques derrière les missions spatiales et l'exploration
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20  transition-transform">
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

          {/* Citation matching activity */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-3 text-center">Des citations qui ont marqué l'histoire</h2>
            <p className="text-blue-200 text-center mb-8">Relie chaque citation à la personne qui l'a prononcée !</p>

            <div className="grid gap-4 mb-6">
              {QUOTES_DATA.map((q) => {
                const selected = quoteMatches[q.id] || '';
                const isCorrect = quoteChecked && selected === q.author;
                const isWrong = quoteChecked && !!selected && selected !== q.author;

                return (
                  <div key={q.id} className={`bg-gradient-to-br ${q.bgColor} backdrop-blur-sm rounded-2xl p-6 border ${q.borderColor} transition-all duration-500`}>
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Scene image — visible during question */}
                      <div className="flex-shrink-0 md:w-48">
                        <img
                          src={q.imageQuestion}
                          alt=""
                          className="w-full h-36 md:h-full object-cover rounded-xl border border-white/10"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <p className="text-lg italic text-white mb-4 leading-relaxed">« {q.quote} »</p>

                        {!quoteVerified ? (
                          <div className="flex items-center gap-3">
                            <select
                              value={selected}
                              onChange={(e) => handleQuoteMatch(q.id, e.target.value)}
                              className={`bg-white/10 text-white border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors ${
                                isCorrect ? 'border-green-400 bg-green-500/20' :
                                isWrong ? 'border-red-400 bg-red-500/20' :
                                'border-white/20'
                              }`}
                            >
                              <option value="" className="bg-gray-900">— Qui a dit cela ? —</option>
                              {AUTHORS_LIST.map(a => (
                                <option key={a} value={a} className="bg-gray-900">{a}</option>
                              ))}
                            </select>
                            {isCorrect && <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />}
                            {isWrong && <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />}
                          </div>
                        ) : (
                          <p className={`font-bold text-lg ${q.accentColor}`}>— {q.author}</p>
                        )}
                      </div>
                    </div>

                    {/* Context + portrait — revealed after all correct */}
                    {quoteVerified && (
                      <div className="mt-5 pt-5 border-t border-white/10">
                        <div className="flex gap-4 items-start">
                          <img
                            src={q.imagePortrait}
                            alt={q.author}
                            className={`flex-shrink-0 w-24 h-28 object-cover rounded-xl border ${q.borderColor}`}
                          />
                          <div>
                            <p className="text-gray-200 text-sm leading-relaxed mb-2">{q.context}</p>
                            <p className="text-xs text-white/40 italic">{q.source}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quoteVerified && (
              <div className="text-center">
                <button
                  onClick={handleVerifyQuotes}
                  disabled={QUOTES_DATA.some(q => !quoteMatches[q.id])}
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 border ${
                    QUOTES_DATA.every(q => quoteMatches[q.id])
                      ? 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50'
                      : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border-gray-600/30'
                  }`}
                >
                  Vérifier mes réponses
                </button>
                {quoteChecked && !quoteVerified && (
                  <p className="text-amber-400 mt-3 text-sm">Certaines réponses sont incorrectes. Réessaie !</p>
                )}
              </div>
            )}

            {quoteVerified && (
              <div className="text-center mt-4">
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 border border-green-400/30 rounded-full px-6 py-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Bravo ! Toutes les citations sont correctement associées !</span>
                </div>
              </div>
            )}
          </div>

          {/* Intro avant question */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Avant de commencer…</h2>
            <p className="text-blue-200 text-lg">
              Pour mieux te connaître, dis-nous ce qui te vient à l'esprit quand on parle de spatial.
            </p>
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
              disabled={!canContinue}
              className={`group px-12 py-5 rounded-full font-bold text-xl transition-all duration-300 flex items-center gap-3 mx-auto ${
                canContinue
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white transform hover:scale-105 shadow-lg hover:shadow-2xl'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Commencer l'Exploration
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            {!canContinue && (
              <p className="text-amber-400 mt-3 text-sm">
                Écris au moins 3 mots pour continuer ({filledWords}/3)
              </p>
            )}
        
          </div>
        </div>
      </div>
    </div>
  );
}
