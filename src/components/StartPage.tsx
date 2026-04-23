import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface StartPageProps {
  onStart: () => void;
}

const DIALOGUE = [
  { speaker: 'girl', text: "Salut ! Moi c'est Léa. Tu veux découvrir l'industrie spatiale ?" },
  { speaker: 'boy',  text: "Et moi c'est Noah ! On va t'emmener dans un voyage interactif." },
  { speaker: 'girl', text: "Lanceurs, satellites, géopolitique... on a tout prévu !" },
  { speaker: 'boy',  text: "Environ 20 minutes, et tu repartiras avec plein d'idées." },
  { speaker: 'girl', text: "Tu es prêt(e) ? Clique sur 'Commencer' — on y va !" },
];

function GirlAvatar({ talking }: { talking: boolean }) {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="30" y="95" width="60" height="65" rx="10" fill="#E91E8C" />
      {/* Collar */}
      <path d="M50 95 Q60 108 70 95" fill="#C2185B" />
      {/* Neck */}
      <rect x="52" y="82" width="16" height="16" rx="4" fill="#FDBCB4" />
      {/* Head */}
      <ellipse cx="60" cy="65" rx="28" ry="30" fill="#FDBCB4" />
      {/* Hair top */}
      <ellipse cx="60" cy="42" rx="30" ry="14" fill="#4A2C0A" />
      {/* Hair sides */}
      <ellipse cx="34" cy="62" rx="8" ry="18" fill="#4A2C0A" />
      <ellipse cx="86" cy="62" rx="8" ry="18" fill="#4A2C0A" />
      {/* Hair ponytail */}
      <ellipse cx="86" cy="50" rx="6" ry="18" fill="#4A2C0A" transform="rotate(20,86,50)" />
      {/* Eyes */}
      <ellipse cx="50" cy="64" rx="5" ry="6" fill="white" />
      <ellipse cx="70" cy="64" rx="5" ry="6" fill="white" />
      <ellipse cx="51" cy="65" rx="3" ry="4" fill="#2C1A0E" />
      <ellipse cx="71" cy="65" rx="3" ry="4" fill="#2C1A0E" />
      <circle cx="52" cy="64" r="1" fill="white" />
      <circle cx="72" cy="64" r="1" fill="white" />
      {/* Eyebrows */}
      <path d="M44 57 Q50 54 56 57" stroke="#4A2C0A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M64 57 Q70 54 76 57" stroke="#4A2C0A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Blush */}
      <ellipse cx="43" cy="72" rx="7" ry="4" fill="#F48FB1" opacity="0.5" />
      <ellipse cx="77" cy="72" rx="7" ry="4" fill="#F48FB1" opacity="0.5" />
      {/* Mouth */}
      {talking ? (
        <ellipse cx="60" cy="80" rx="8" ry="5" fill="#C62828" />
      ) : (
        <path d="M52 79 Q60 85 68 79" stroke="#C62828" strokeWidth="2" fill="none" strokeLinecap="round"/>
      )}
      {/* Arms */}
      <rect x="10" y="100" width="22" height="12" rx="6" fill="#E91E8C" />
      <rect x="88" y="100" width="22" height="12" rx="6" fill="#E91E8C" />
      <ellipse cx="20" cy="106" rx="7" ry="6" fill="#FDBCB4" />
      <ellipse cx="100" cy="106" rx="7" ry="6" fill="#FDBCB4" />
    </svg>
  );
}

function BoyAvatar({ talking }: { talking: boolean }) {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="28" y="95" width="64" height="65" rx="10" fill="#1565C0" />
      {/* Collar */}
      <path d="M48 95 L60 110 L72 95" fill="white" />
      <path d="M60 110 L60 130" stroke="#90CAF9" strokeWidth="3" />
      {/* Neck */}
      <rect x="52" y="82" width="16" height="16" rx="4" fill="#D4A373" />
      {/* Head */}
      <ellipse cx="60" cy="65" rx="28" ry="30" fill="#D4A373" />
      {/* Hair */}
      <ellipse cx="60" cy="40" rx="29" ry="12" fill="#1A1A2E" />
      <path d="M32 50 Q30 40 36 36 Q50 30 60 32 Q70 30 84 36 Q90 40 88 50" fill="#1A1A2E" />
      {/* Eyes */}
      <ellipse cx="50" cy="64" rx="5" ry="6" fill="white" />
      <ellipse cx="70" cy="64" rx="5" ry="6" fill="white" />
      <ellipse cx="51" cy="65" rx="3" ry="4" fill="#1A1A2E" />
      <ellipse cx="71" cy="65" rx="3" ry="4" fill="#1A1A2E" />
      <circle cx="52" cy="64" r="1" fill="white" />
      <circle cx="72" cy="64" r="1" fill="white" />
      {/* Eyebrows */}
      <path d="M44 56 Q50 53 56 56" stroke="#1A1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M64 56 Q70 53 76 56" stroke="#1A1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Mouth */}
      {talking ? (
        <ellipse cx="60" cy="80" rx="8" ry="5" fill="#8B4513" />
      ) : (
        <path d="M52 79 Q60 85 68 79" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round"/>
      )}
      {/* Arms */}
      <rect x="8" y="100" width="22" height="12" rx="6" fill="#1565C0" />
      <rect x="90" y="100" width="22" height="12" rx="6" fill="#1565C0" />
      <ellipse cx="18" cy="106" rx="7" ry="6" fill="#D4A373" />
      <ellipse cx="102" cy="106" rx="7" ry="6" fill="#D4A373" />
    </svg>
  );
}

export function StartPage({ onStart }: StartPageProps) {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [talking, setTalking] = useState(true);

  useEffect(() => {
    const talkDuration = 2200;
    const pauseDuration = 600;

    const talkTimer = setTimeout(() => {
      setTalking(false);
    }, talkDuration);

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

      {/* Ambient glow */}
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
              style={{ width: 120, height: 160 }}
            >
              <GirlAvatar talking={isGirl && talking} />
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
              {/* Arrow */}
              <div
                className={`absolute bottom-0 w-4 h-4 transform rotate-45 ${
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
              style={{ width: 120, height: 160 }}
            >
              <BoyAvatar talking={!isGirl && talking} />
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
