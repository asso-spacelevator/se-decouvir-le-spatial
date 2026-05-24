import { useEffect, useState } from 'react';
import { ChevronRight, Globe, Rocket, Wifi, Satellite, Compass, Users } from 'lucide-react';
import { GirlAvatar, BoyAvatar } from './AvatarGuide';

interface StartPageProps {
  onStartSession1: () => void;
  onStartSession2: () => void;
}

const DIALOGUE = [
  { speaker: 'girl' as const, text: "Salut ! Moi c'est Léa. Tu veux découvrir l'industrie spatiale ?" },
  { speaker: 'boy' as const,  text: "Et moi c'est Noah ! On va t'emmener dans un voyage interactif." },
  { speaker: 'girl' as const, text: "Deux sessions indépendantes — commence par celle qui t'intéresse !" },
  { speaker: 'boy' as const,  text: "A la fin de ces deux sections, on espère que tu repartiras avec plein d'idées." },
];

export function StartPage({ onStartSession1, onStartSession2 }: StartPageProps) {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [talking, setTalking] = useState(true);

  useEffect(() => {
    const talkDuration = 2200;
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

  const session1Topics = [
    { icon: <Globe className="w-4 h-4" />, label: 'Impact Terrestre', color: 'text-blue-400' },
    { icon: <Rocket className="w-4 h-4" />, label: 'Lanceurs & Ariane 6', color: 'text-orange-400' },
    { icon: <Wifi className="w-4 h-4" />, label: 'Réseaux & Social', color: 'text-pink-400' },
  ];

  const session2Topics = [
    { icon: <Satellite className="w-4 h-4" />, label: 'Satellites & Orbite', color: 'text-teal-400' },
    { icon: <Compass className="w-4 h-4" />, label: 'Exploration Lointaine', color: 'text-violet-400' },
    { icon: <Users className="w-4 h-4" />, label: 'Associations & Mentorat', color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center py-12">
      <div className="starry-background absolute inset-0" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
            Voyage vers <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">l'Espace</span>
          </h1>
          <p className="text-gray-400 text-lg">Découvrez l'industrie spatiale européenne</p>
        </div>

        {/* Avatars + dialogue */}
        <div className="flex items-end justify-center gap-4 md:gap-10 mb-8">
          <div className="flex flex-col items-center gap-3 flex-1 max-w-[160px]">
            <div className={`transition-all duration-300 ${isGirl ? 'scale-110 drop-shadow-[0_0_20px_rgba(236,72,153,0.6)]' : 'scale-95 opacity-60'}`}>
              <GirlAvatar talking={isGirl && talking} size={120} />
            </div>
            <span className="text-pink-300 font-semibold text-sm">Léa</span>
          </div>

          <div className="flex-1 max-w-sm min-h-[90px] flex items-center justify-center">
            <div className={`relative bg-white/10 backdrop-blur-md border rounded-2xl px-6 py-4 text-white text-center text-base font-medium leading-relaxed transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${isGirl ? 'border-pink-400/50' : 'border-blue-400/50'}`}>
              <div className={`absolute w-4 h-4 transform rotate-45 ${isGirl ? '-left-2 bg-pink-400/20 border-l border-b border-pink-400/50' : '-right-2 bg-blue-400/20 border-r border-b border-blue-400/50'}`} style={{ bottom: '20px' }} />
              {current.text}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 flex-1 max-w-[160px]">
            <div className={`transition-all duration-300 ${!isGirl ? 'scale-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'scale-95 opacity-60'}`}>
              <BoyAvatar talking={!isGirl && talking} size={120} />
            </div>
            <span className="text-blue-300 font-semibold text-sm">Noah</span>
          </div>
        </div>

        {/* Dialogue dots */}
        <div className="flex justify-center gap-2 mb-10">
          {DIALOGUE.map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${i === dialogueIndex ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/30'}`} />
          ))}
        </div>

        {/* Session cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Session 1 */}
          <button
            onClick={onStartSession1}
            className="group text-left bg-white/5 hover:bg-white/8 border border-white/10 hover:border-blue-400/40 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full px-3 py-1">Session 1</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">L'Espace au quotidien</h3>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">Comment le spatial influence ta vie, les lanceurs qui partent de Kourou, et où suivre l'actu spatiale.</p>
            <div className="space-y-2">
              {session1Topics.map(({ icon, label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={color}>{icon}</span>
                  <span className="text-sm text-gray-300">{label}</span>
                </div>
              ))}
            </div>
          </button>

          {/* Session 2 */}
          <button
            onClick={onStartSession2}
            className="group text-left bg-white/5 hover:bg-white/8 border border-white/10 hover:border-teal-400/40 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-400 bg-teal-400/10 border border-teal-400/20 rounded-full px-3 py-1">Session 2</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Explorer l'espace</h3>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">Les satellites en orbite, les missions lointaines vers Mars et au-delà, et comment s'orienter vers ces métiers.</p>
            <div className="space-y-2">
              {session2Topics.map(({ icon, label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={color}>{icon}</span>
                  <span className="text-sm text-gray-300">{label}</span>
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* Partner logos */}
        <div className="flex items-center justify-center gap-8 mt-8">
          <img
            src={`${import.meta.env.BASE_URL}logos/space-elevator.png`}
            alt="Space Elevator"
            className="object-contain opacity-80 hover:opacity-100 transition-opacity"
            style={{ minWidth: '85px', height: '60px' }}
          />
          <img
            src={`${import.meta.env.BASE_URL}logos/ile-de-france.png`}
            alt="Région Île-de-France"
            className="object-contain opacity-80 hover:opacity-100 transition-opacity"
            style={{ minWidth: '85px', height: '60px' }}
          />
        </div>
        <p className="text-gray-600 text-xs text-center mt-3">Par l'association Space Elevator avec le soutien de la Région Ile de France</p>
      </div>
    </div>
  );
}
