import type { LegalPageId } from './LegalPage';

export function LegalFooter({ onOpen }: { onOpen: (page: LegalPageId) => void }) {
  const link = 'text-white/55 hover:text-white hover:underline';
  return (
    <footer className="bg-deepspace text-[11px] text-white/55 text-center py-4 flex justify-center gap-4">
      <button type="button" onClick={() => onOpen('privacy')} className={link}>Confidentialité</button>
      <button type="button" onClick={() => onOpen('terms')} className={link}>Conditions d'utilisation</button>
    </footer>
  );
}
