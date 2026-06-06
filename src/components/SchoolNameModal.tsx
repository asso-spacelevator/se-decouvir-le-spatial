import { useState, useEffect, FormEvent } from 'react';
import { School } from 'lucide-react';

interface SchoolNameModalProps {
  onSubmit: (schoolName: string) => Promise<void>;
}

export function SchoolNameModal({ onSubmit }: SchoolNameModalProps) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Block Escape key — the modal cannot be dismissed without submitting
  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', block, { capture: true });
    return () => window.removeEventListener('keydown', block, { capture: true });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setSubmitting(true);
    await onSubmit(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-deepspace/90 backdrop-blur-sm"
      // Swallow clicks on the backdrop so nothing behind can receive focus or events
      onClick={e => e.stopPropagation()}
    >
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 bg-magenta blur-[120px]" />
        <div className="absolute -top-24 right-16 w-[350px] h-[350px] rounded-full opacity-5 bg-magenta blur-[100px]" />
      </div>

      <div
        className="relative w-full max-w-md mx-4 bg-white/[0.04] border border-white/10 rounded-2xl p-8"
        style={{ animation: 'chapterIn 0.45s cubic-bezier(0.2,0,0,1) both' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}logos/space-elevator.png`}
            alt="Space Elevator"
            className="h-8 object-contain"
          />
        </div>

        {/* Icon + heading */}
        <div className="flex flex-col items-center text-center mb-6 gap-3">
          <div className="w-12 h-12 rounded-full bg-magenta/15 border border-magenta/30 flex items-center justify-center">
            <School className="w-5 h-5 text-magenta" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-[0.04em] text-white">
              Ton <span className="text-magenta">établissement</span>
            </h2>
            <p className="mt-1 text-sm text-white/60 max-w-xs">
              Indique le nom de ton lycée ou école avant de commencer.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            maxLength={150}
            placeholder="Ex : Lycée Louis-le-Grand, Paris"
            autoFocus
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-colors"
          />

          <button
            type="submit"
            disabled={!value.trim() || submitting}
            className="w-full bg-magenta hover:bg-magenta-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-5 py-3.5 font-semibold text-sm transition-colors"
          >
            {submitting ? 'Enregistrement...' : 'Commencer'}
          </button>
        </form>
      </div>
    </div>
  );
}
