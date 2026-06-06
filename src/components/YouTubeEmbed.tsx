import { useState, useEffect } from 'react';
import { PlayCircle, VideoOff } from 'lucide-react';

type ConsentValue = 'accepted' | 'refused';
const STORAGE_KEY = 'youtube_consent';
const CONSENT_EVENT = 'youtube-consent-changed';

function readConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'accepted' || v === 'refused') return v;
  } catch { /* ignore localStorage errors */ }
  return null;
}

function writeConsent(value: ConsentValue) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* ignore localStorage errors */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  start?: number;
  nocookie?: boolean;
}

export function YouTubeEmbed({ videoId, title, start, nocookie = false }: YouTubeEmbedProps) {
  const [consent, setConsent] = useState<ConsentValue | null>(readConsent);

  useEffect(() => {
    const onCustom = (e: Event) => setConsent((e as CustomEvent<ConsentValue>).detail);
    const onStorage = () => setConsent(readConsent());
    window.addEventListener(CONSENT_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const accept = () => writeConsent('accepted');
  const refuse = () => writeConsent('refused');

  if (consent === 'accepted') {
    const domain = nocookie ? 'www.youtube-nocookie.com' : 'www.youtube.com';
    const params = start ? `?start=${start}` : '';
    return (
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          className="absolute left-0 w-full"
          style={{ top: '-10%', height: '120%' }}
          src={`https://${domain}/embed/${videoId}${params}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  if (consent === 'refused') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-deepspace/90 px-5">
        <VideoOff className="w-7 h-7 text-white/25" strokeWidth={1.5} />
        <p className="text-[12px] text-white/40 text-center max-w-[220px] leading-relaxed">
          Vidéo bloquée : tu n'as pas accepté les cookies YouTube.
        </p>
        <button onClick={accept} className="text-[11px] text-magenta hover:underline">
          Accepter et regarder la vidéo
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-deepspace px-6">
      <div className="p-2.5 rounded-full bg-magenta/10 border border-magenta/20">
        <PlayCircle className="w-7 h-7 text-magenta" strokeWidth={1.5} />
      </div>
      <div className="text-center max-w-[280px]">
        <p className="text-[12px] font-semibold text-white mb-1.5 leading-snug">{title}</p>
        <p className="text-[11.5px] text-white/55 leading-relaxed">
          YouTube a besoin de cookies pour lire cette vidéo. Tu peux refuser et continuer sur le site.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-[260px]">
        <button
          onClick={accept}
          className="bg-magenta hover:bg-magenta-700 text-white rounded-lg px-4 py-2.5 text-[12.5px] font-semibold transition"
        >
          Accepter les cookies
        </button>
        <button
          onClick={refuse}
          className="border border-white/10 hover:border-white/30 text-white/65 hover:text-white rounded-lg px-4 py-2.5 text-[12.5px] transition"
        >
          Continuer sans accepter
        </button>
      </div>
    </div>
  );
}
