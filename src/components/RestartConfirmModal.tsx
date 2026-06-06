import { AlertTriangle, X } from 'lucide-react';

interface RestartConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RestartConfirmModal({ onConfirm, onCancel, isLoading }: RestartConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={isLoading ? undefined : onCancel}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-deepspace border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Fermer"
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors duration-150 disabled:opacity-30"
        >
          <X className="w-5 h-5" strokeWidth={1.75} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-magenta/10 border border-magenta/25 grid place-items-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-magenta" strokeWidth={1.75} />
        </div>

        {/* Content */}
        <div className="text-center flex flex-col gap-3">
          <h2 className="font-display font-bold text-[21px] uppercase tracking-[0.04em] m-0">
            Recommencer la <span className="text-magenta">séance</span> ?
          </h2>
          <p className="text-white/70 text-[15px] leading-[1.6] m-0">
            Toutes tes données actuelles seront perdues : ta progression, tes réponses et ton score.
          </p>

          {/* Note callout */}
          <div className="mt-1 p-4 border-[1.5px] border-magenta/30 rounded-lg bg-magenta/5 text-left">
            <p className="text-[13px] text-white/80 leading-[1.55] m-0">
              <span className="text-magenta font-semibold">Note :</span> Ta session actuelle sera
              conservée dans nos bases de données et marquée comme{' '}
              <span className="font-semibold text-white">session non terminée</span>.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 border border-white/10 hover:border-white/30 text-white/70 hover:text-white rounded-lg px-5 py-3.5 font-semibold text-[14px] transition-all duration-150 disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-magenta hover:bg-magenta-700 text-white rounded-lg px-5 py-3.5 font-semibold text-[14px] transition-all duration-150 disabled:opacity-40"
          >
            {isLoading ? 'Redémarrage...' : 'Recommencer'}
          </button>
        </div>
      </div>
    </div>
  );
}
