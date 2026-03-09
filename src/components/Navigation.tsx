import { Home, ArrowLeft } from 'lucide-react';

interface NavigationProps {
  onHome: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export function Navigation({ onHome, onBack, showBack = false }: NavigationProps) {
  return (
    <div className="fixed top-24 right-6 z-40 flex items-center gap-3">
      {showBack && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 rounded-lg transition-all duration-300"
          title="Page précédente"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour</span>
        </button>
      )}

      <button
        onClick={onHome}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg transition-all duration-300"
        title="Retour au début"
      >
        <Home className="w-4 h-4" />
        <span className="text-sm font-medium">Début</span>
      </button>
    </div>
  );
}
