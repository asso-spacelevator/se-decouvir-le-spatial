import { useEffect, useState } from 'react';

export type AvatarSpeaker = 'girl' | 'boy';

interface Line {
  speaker: AvatarSpeaker;
  text: string;
}

interface AvatarGuideProps {
  lines: Line[];
  /** If true, cycles through lines automatically. Default: true */
  autoPlay?: boolean;
  /** ms per line. Default 3500 */
  interval?: number;
  className?: string;
}

export function GirlAvatar({ talking, size = 80 }: { talking: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 120 160" width={size} height={(size * 160) / 120} xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="95" width="60" height="65" rx="10" fill="#E91E8C" />
      <path d="M50 95 Q60 108 70 95" fill="#C2185B" />
      <rect x="52" y="82" width="16" height="16" rx="4" fill="#FDBCB4" />
      <ellipse cx="60" cy="65" rx="28" ry="30" fill="#FDBCB4" />
      <ellipse cx="60" cy="42" rx="30" ry="14" fill="#4A2C0A" />
      <ellipse cx="34" cy="62" rx="8" ry="18" fill="#4A2C0A" />
      <ellipse cx="86" cy="62" rx="8" ry="18" fill="#4A2C0A" />
      <ellipse cx="86" cy="50" rx="6" ry="18" fill="#4A2C0A" transform="rotate(20,86,50)" />
      <ellipse cx="50" cy="64" rx="5" ry="6" fill="white" />
      <ellipse cx="70" cy="64" rx="5" ry="6" fill="white" />
      <ellipse cx="51" cy="65" rx="3" ry="4" fill="#2C1A0E" />
      <ellipse cx="71" cy="65" rx="3" ry="4" fill="#2C1A0E" />
      <circle cx="52" cy="64" r="1" fill="white" />
      <circle cx="72" cy="64" r="1" fill="white" />
      <path d="M44 57 Q50 54 56 57" stroke="#4A2C0A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M64 57 Q70 54 76 57" stroke="#4A2C0A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="43" cy="72" rx="7" ry="4" fill="#F48FB1" opacity="0.5" />
      <ellipse cx="77" cy="72" rx="7" ry="4" fill="#F48FB1" opacity="0.5" />
      {talking ? (
        <ellipse cx="60" cy="80" rx="8" ry="5" fill="#C62828" />
      ) : (
        <path d="M52 79 Q60 85 68 79" stroke="#C62828" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      <rect x="10" y="100" width="22" height="12" rx="6" fill="#E91E8C" />
      <rect x="88" y="100" width="22" height="12" rx="6" fill="#E91E8C" />
      <ellipse cx="20" cy="106" rx="7" ry="6" fill="#FDBCB4" />
      <ellipse cx="100" cy="106" rx="7" ry="6" fill="#FDBCB4" />
    </svg>
  );
}

export function BoyAvatar({ talking, size = 80 }: { talking: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 120 160" width={size} height={(size * 160) / 120} xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="95" width="64" height="65" rx="10" fill="#1565C0" />
      <path d="M48 95 L60 110 L72 95" fill="white" />
      <path d="M60 110 L60 130" stroke="#90CAF9" strokeWidth="3" />
      <rect x="52" y="82" width="16" height="16" rx="4" fill="#D4A373" />
      <ellipse cx="60" cy="65" rx="28" ry="30" fill="#D4A373" />
      <ellipse cx="60" cy="40" rx="29" ry="12" fill="#1A1A2E" />
      <path d="M32 50 Q30 40 36 36 Q50 30 60 32 Q70 30 84 36 Q90 40 88 50" fill="#1A1A2E" />
      <ellipse cx="50" cy="64" rx="5" ry="6" fill="white" />
      <ellipse cx="70" cy="64" rx="5" ry="6" fill="white" />
      <ellipse cx="51" cy="65" rx="3" ry="4" fill="#1A1A2E" />
      <ellipse cx="71" cy="65" rx="3" ry="4" fill="#1A1A2E" />
      <circle cx="52" cy="64" r="1" fill="white" />
      <circle cx="72" cy="64" r="1" fill="white" />
      <path d="M44 56 Q50 53 56 56" stroke="#1A1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M64 56 Q70 53 76 56" stroke="#1A1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {talking ? (
        <ellipse cx="60" cy="80" rx="8" ry="5" fill="#8B4513" />
      ) : (
        <path d="M52 79 Q60 85 68 79" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      <rect x="8" y="100" width="22" height="12" rx="6" fill="#1565C0" />
      <rect x="90" y="100" width="22" height="12" rx="6" fill="#1565C0" />
      <ellipse cx="18" cy="106" rx="7" ry="6" fill="#D4A373" />
      <ellipse cx="102" cy="106" rx="7" ry="6" fill="#D4A373" />
    </svg>
  );
}

export function AvatarGuide({ lines, autoPlay = true, interval = 3500, className = '' }: AvatarGuideProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [talking, setTalking] = useState(true);

  useEffect(() => {
    if (!autoPlay || lines.length <= 1) return;

    const talkTimer = setTimeout(() => setTalking(false), interval - 800);

    const cycleTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % lines.length);
        setVisible(true);
        setTalking(true);
      }, 280);
    }, interval);

    return () => {
      clearTimeout(talkTimer);
      clearTimeout(cycleTimer);
    };
  }, [index, autoPlay, interval, lines.length]);

  const current = lines[index];
  const isGirl = current.speaker === 'girl';

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      {/* Girl */}
      <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${isGirl ? 'scale-105' : 'scale-90 opacity-50'}`}>
        <GirlAvatar talking={isGirl && talking} size={64} />
        <span className="text-pink-300 text-xs font-semibold">Léa</span>
      </div>

      {/* Bubble */}
      <div
        className={`relative flex-1 min-h-[60px] flex items-center transition-all duration-280 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
      >
        <div
          className={`relative w-full rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed text-white border ${
            isGirl
              ? 'bg-pink-900/30 border-pink-500/40'
              : 'bg-blue-900/30 border-blue-500/40'
          }`}
        >
          {/* tail toward active speaker */}
          <div
            className={`absolute bottom-4 w-3 h-3 rotate-45 ${
              isGirl
                ? '-left-1.5 bg-pink-900/30 border-l border-b border-pink-500/40'
                : '-right-1.5 bg-blue-900/30 border-r border-b border-blue-500/40'
            }`}
          />
          <span className={`font-bold mr-1 ${isGirl ? 'text-pink-300' : 'text-blue-300'}`}>
            {isGirl ? 'Léa :' : 'Noah :'}
          </span>
          {current.text}
        </div>
      </div>

      {/* Boy */}
      <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${!isGirl ? 'scale-105' : 'scale-90 opacity-50'}`}>
        <BoyAvatar talking={!isGirl && talking} size={64} />
        <span className="text-blue-300 text-xs font-semibold">Noah</span>
      </div>
    </div>
  );
}
