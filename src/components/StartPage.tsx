import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { GirlAvatar, BoyAvatar } from './AvatarGuide';

interface StartPageProps {
  onStart: () => void;
}

const DIALOGUE = [
  { speaker: 'girl' as const, text: "Salut ! Moi c'est Léa. Tu veux découvrir l'industrie spatiale ?" },
  { speaker: 'boy' as const,  text: "Et moi c'est Noah ! On va t'emmener dans un voyage interactif." },
  { speaker: 'girl' as const, text: "Lanceurs, satellites, géopolitique... on a tout prévu !" },
  { speaker: 'boy' as const,  text: "Environ 20 minutes, et tu repartiras avec plein d'idées." },
  { speaker: 'girl' as const, text: "Tu es prêt(e) ? Clique sur 'Commencer' — on y va !" },
];

export function StartPage({ onStart }: StartPageProps) {
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

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      <div className="starry-background absolute inset-0" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
            Voyage vers <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">l'Espace</span>
          </h1>
          <p className="text-gray-400 text-lg">Découvrez l'industrie spatiale européenne</p>
        </div>

        {/* Avatars + dialogue */}
        <div className="flex items-end justify-center gap-4 md:gap-10 mb-10">
          {/* Girl avatar */}
          <div className="flex flex-col items-center gap-3 flex-1 max-w-[160px]">
            <div
              className={`transition-all duration-300 ${isGirl ? 'scale-110 drop-shadow-[0_0_20px_rgba(236,72,153,0.6)]' : 'scale-95 opacity-60'}`}
            >
              <GirlAvatar talking={isGirl && talking} size={120} />
            </div>
            <span className="text-pink-300 font-semibold text-sm">Léa</span>
          </div>

          {/* Speech bubble */}
          <div className="flex-1 max-w-sm min-h-[90px] flex items-center justify-center">
            <div
              className={`relative bg-white/10 backdrop-blur-md border rounded-2xl px-6 py-4 text-white text-center text-base font-medium leading-relaxed transition-all duration-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              } ${isGirl ? 'border-pink-400/50' : 'border-blue-400/50'}`}
            >
              <div
                className={`absolute w-4 h-4 transform rotate-45 ${
                  isGirl
                    ? '-left-2 bg-pink-400/20 border-l border-b border-pink-400/50'
                    : '-right-2 bg-blue-400/20 border-r border-b border-blue-400/50'
                }`}
                style={{ bottom: '20px' }}
              />
              {current.text}
            </div>
          </div>

          {/* Boy avatar */}
          <div className="flex flex-col items-center gap-3 flex-1 max-w-[160px]">
            <div
              className={`transition-all duration-300 ${!isGirl ? 'scale-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'scale-95 opacity-60'}`}
            >
              <BoyAvatar talking={!isGirl && talking} size={120} />
            </div>
            <span className="text-blue-300 font-semibold text-sm">Noah</span>
          </div>
        </div>

        {/* Dialogue dots */}
        <div className="flex justify-center gap-2 mb-8">
          {DIALOGUE.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === dialogueIndex ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-teal-500/30"
          >
            Commencer le voyage
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-gray-500 text-sm mt-4">Environ 20 minutes · Gratuit · Interactif</p>
        </div>
      </div>
    </div>
  );
}
