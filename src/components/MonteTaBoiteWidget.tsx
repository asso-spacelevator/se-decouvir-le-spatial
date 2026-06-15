import { useState } from 'react';

interface MonteTaBoiteWidgetProps {
  src?: string;
  height?: number | string;
  bare?: boolean;
  maxWidth?: number | string;
}

export default function MonteTaBoiteWidget({
  src = `${import.meta.env.BASE_URL}monte-ta-boite/index.html?embed=1`,
  height = 'clamp(540px, 80vh, 900px)',
  bare = false,
  maxWidth = '64rem',
}: MonteTaBoiteWidgetProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="mx-auto w-full" style={{ maxWidth }}>
      <div
        className={`relative overflow-hidden rounded-[20px] border border-white/10 bg-white ${bare ? '' : 'shadow-2xl'}`}
        style={{ height }}
      >
        {!bare && (
          <div className="flex items-center gap-2 border-b border-black/10 bg-white/95 px-4 py-2.5">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-magenta/30" />
              <span className="h-2.5 w-2.5 rounded-full bg-magenta/30" />
              <span className="h-2.5 w-2.5 rounded-full bg-magenta/30" />
            </span>
            <span className="text-[11px] uppercase tracking-[0.08em] text-black/45">
              Atelier · Monte ta boîte spatiale
            </span>
          </div>
        )}

        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <span className="text-[11px] uppercase tracking-[0.08em] text-black/45">Chargement de l'atelier…</span>
          </div>
        )}

        <iframe
          src={src}
          title="Atelier Monte ta boîte spatiale"
          className="h-full w-full border-0"
          style={{ height: bare ? '100%' : 'calc(100% - 41px)' }}
          scrolling="yes"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
