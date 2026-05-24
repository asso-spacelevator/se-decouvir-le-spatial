import { Home, ArrowLeft } from 'lucide-react';

interface NavigationProps {
  onHome: () => void;
  onBack?: () => void;
  showBack?: boolean;
  label?: string;
}

export function Navigation({ onHome, onBack, showBack = false, label }: NavigationProps) {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-md bg-deepspace/80 border-b border-white/5">
      <div className="max-w-[1240px] mx-auto px-8 py-4 grid grid-cols-[auto_1fr_auto] items-center gap-8">
        <img
          src={`${import.meta.env.BASE_URL}logos/space-elevator.png`}
          alt="Space Elevator"
          className="h-8 block"
        />
        <div className="text-center text-[12px] font-medium tracking-[0.16em] uppercase text-white/60">
          {label ?? ''}
        </div>
        <div className="flex items-center gap-2">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5 text-[12px] font-medium text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
          )}
          <button
            onClick={onHome}
            className="inline-flex items-center gap-1.5 border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5 text-[12px] font-medium text-white/70 hover:text-white transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Accueil
          </button>
        </div>
      </div>
    </div>
  );
}
