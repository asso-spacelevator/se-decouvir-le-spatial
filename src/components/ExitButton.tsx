import { X } from 'lucide-react';

interface ExitButtonProps {
  onExit: () => void;
}

export function ExitButton({ onExit }: ExitButtonProps) {
  return (
    <button
      onClick={onExit}
      className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 rounded-lg transition-all duration-300"
      title="Quitter la session"
    >
      <X className="w-4 h-4" />
      <span className="text-sm font-medium">Quitter</span>
    </button>
  );
}
