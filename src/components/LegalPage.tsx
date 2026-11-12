import { ArrowLeft } from 'lucide-react';

export type LegalPageId = 'privacy' | 'terms';

const CONTACT = 'contact@spacelevator.org';

const PAGES: Record<LegalPageId, { title: string; accent: string; sections: { heading: string; body: string[] }[] }> = {
  privacy: {
    title: 'Politique de ',
    accent: 'confidentialité',
    sections: [
      {
        heading: 'Qui est responsable ?',
        body: [
          `L'association Space Elevator est responsable du traitement des données de ce site. Contact : ${CONTACT}. Adresse postale : 27 rue Caraman, 31000 Toulouse.`,
        ],
      },
      {
        heading: 'Quelles données sont collectées ?',
        body: [
          "Un identifiant de session anonyme, conservé dans le stockage local de ton navigateur. Il permet de retrouver ta progression.",
          "Tes réponses libres, les questions que tu envoies, tes résultats aux quiz (bonne ou mauvaise réponse), le temps passé sur chaque page de chapitre et les vidéos consultées.",
          "Le nom de ton établissement, uniquement si tu choisis de le renseigner.",
          "Le site ne demande ni ton nom, ni ton e-mail. Comme tout hébergeur, Supabase peut journaliser techniquement les adresses IP des requêtes. Évite d'écrire des informations personnelles dans les champs libres.",
        ],
      },
      {
        heading: 'Pourquoi et sur quelle base ?',
        body: [
          "Pour assurer le suivi pédagogique du parcours et produire des statistiques d'utilisation. La base légale est l'intérêt légitime de l'association à évaluer et améliorer son programme éducatif.",
        ],
      },
      {
        heading: 'Combien de temps ?',
        body: [
          "Le nom de l'établissement est supprimé automatiquement après 1 an. Recommencer une séance depuis l'accueil crée une nouvelle session mais ne supprime pas l'ancienne, qui reste conservée sous un identifiant anonyme. Pour la faire supprimer, écris-nous.",
        ],
      },
      {
        heading: 'Qui reçoit les données ?',
        body: [
          "Supabase, notre sous-traitant d'hébergement de base de données (région d'hébergement : Londres, Royaume-Uni (eu-west-2)).",
          "Des contenus tiers sont chargés par ton navigateur : vidéos YouTube, images de drapeaux (flagcdn) et police Google Fonts. Ces services peuvent déposer des cookies ou recevoir ton adresse IP selon leurs propres politiques.",
        ],
      },
      {
        heading: 'Tes droits',
        body: [
          `Tu peux demander l'accès, la rectification ou la suppression de tes données, et t'opposer à leur traitement, en écrivant à ${CONTACT}. Si tu es mineur, tes représentants légaux peuvent le faire pour toi. Tu peux aussi saisir la CNIL (cnil.fr).`,
        ],
      },
    ],
  },
  terms: {
    title: "Conditions d'",
    accent: 'utilisation',
    sections: [
      {
        heading: 'Objet',
        body: [
          "Ce site est un parcours pédagogique gratuit proposé par l'association Space Elevator pour découvrir l'industrie spatiale européenne.",
        ],
      },
      {
        heading: 'Usage',
        body: [
          "Le site est destiné à un usage éducatif. Tu t'engages à ne pas le détourner, à ne pas tenter d'en perturber le fonctionnement et à rester respectueux dans les questions que tu envoies.",
        ],
      },
      {
        heading: 'Crédits et propriété intellectuelle',
        body: [
          "Les images, logos et vidéos de l'ESA, du CNES, de la NASA, d'Arianespace et d'autres partenaires restent la propriété de leurs détenteurs, crédités à côté de chaque contenu. Les textes et illustrations propres au site appartiennent à l'association Space Elevator.",
        ],
      },
      {
        heading: 'Responsabilité',
        body: [
          "Le contenu est fourni à titre informatif, sans garantie d'exactitude ou de disponibilité. L'association ne peut être tenue responsable des contenus des sites tiers liés ou intégrés.",
        ],
      },
      {
        heading: 'Droit applicable',
        body: [
          `Ces conditions sont régies par le droit français. Une question ? ${CONTACT}.`,
        ],
      },
    ],
  },
};

export function LegalPage({ page, onClose }: { page: LegalPageId; onClose: () => void }) {
  const { title, accent, sections } = PAGES[page];
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-deepspace text-white font-sans overflow-x-hidden">
      <div className="relative min-h-full">
        <div className="starry-background absolute inset-0" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-15 bg-magenta blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-[800px] mx-auto px-6 py-12 flex flex-col gap-8">
          <button
            type="button"
            onClick={onClose}
            className="self-start inline-flex items-center gap-2 border border-white/10 hover:border-white/30 text-white/70 hover:text-white rounded-lg px-4 py-2.5 text-[14px] transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Retour
          </button>
          <h1 className="font-display font-bold text-[40px] leading-[1.05] tracking-[0.04em] uppercase m-0">
            {title}<span className="text-magenta">{accent}</span>
          </h1>
          {sections.map(({ heading, body }) => (
            <section key={heading} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold text-[18px] m-0 mb-3">{heading}</h2>
              {body.map((p) => (
                <p key={p} className="text-[14.5px] leading-[1.6] text-white/75 m-0 mb-2 last:mb-0">{p}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
