import { useState, useEffect } from 'react';
import { Play, Building2, Rocket } from 'lucide-react';
import { SectionTopBar, SectionProgress, ChapterShell, ChapterRecap } from './ChapterShell';
import { EuropeActorsMap } from './EuropeActorsMap';
import { EUROPEAN_SPACE_COMPANIES } from '../data/europeanSpaceCompanies';
import { useSession } from '../contexts/SessionContext';

/* ════════════════════════════════════════════════════════════════════
 * EntreprisesSpatialesSection — Session 2, après ExplorationSection
 *
 * 4 chapitres :
 *   0. Carte interactive des acteurs du spatial européen
 *   1. Startups vs entreprises historiques (comparaison neutre)
 *   2. Les métiers en action (placeholders vidéo CEO / RH / commercial)
 *   3. Récap
 * ════════════════════════════════════════════════════════════════════ */

const SECTION = 'entreprises_spatiales';
const TOTAL_CHAPTERS = 4;

// ── Données comparaison startups vs historiques ───────────────────────
const COMPARISON = [
  {
    aspect: 'Taille de l\'équipe',
    startup: 'Petites équipes (souvent moins de 200 personnes). Tout le monde se connaît, les décisions se prennent vite.',
    historical: 'Très grandes entreprises (parfois plus de 50 000 salariés). Il existe des équipes, des départements, des divisions.',
  },
  {
    aspect: 'D\'où vient l\'argent',
    startup: 'Des investisseurs privés qui parient sur l\'idée. Si ça ne décolle pas, l\'entreprise peut fermer.',
    historical: 'Des contrats avec des États ou des agences spatiales (ESA, CNES...). Les revenus sont stables et prévisibles.',
  },
  {
    aspect: 'Vitesse d\'avancement',
    startup: 'On peut passer d\'une idée à un prototype en 1 ou 2 ans. On teste, on rate, on recommence.',
    historical: 'Les projets durent souvent 5 à 15 ans. Chaque étape est vérifiée plusieurs fois avant de passer à la suivante.',
  },
  {
    aspect: 'Sécurité de l\'emploi',
    startup: 'L\'entreprise grandit vite, mais son avenir est incertain. Le salaire peut inclure des parts dans la société.',
    historical: 'La plupart des postes sont en CDI avec un salaire fixe et connu dès le départ. Tu peux aussi changer de poste, d\'équipe ou même de pays tout en restant dans la même entreprise : c\'est ce qu\'on appelle la mobilité interne.',
  },
  {
    aspect: 'Comment on travaille',
    startup: 'On touche à tout, on prend des initiatives, on monte vite en responsabilité. Ambiance souvent informelle.',
    historical: 'On devient expert dans son domaine progressivement. Il y a des processus stricts, mais aussi des formations solides.',
  },
];

// ── Vidéos métiers ───────────────────────────────────────────────────
type VideoCategory = 'Direction' | 'RH & Talent' | 'Commercial' | 'Ingénierie' | 'Technique' | 'Juridique & Finance';

interface VideoCard {
  role: string;
  profile: string;
  category: VideoCategory;
}

const VIDEO_CARDS: VideoCard[] = [
  { role:'Directeur général',            profile:'Vision stratégique, relations institutionnelles, levées de fonds et gouvernance.', category:'Direction' },
  { role:'Chef de projet spatial',       profile:'Coordination multi-équipes, jalons contractuels, interface client ESA et agences.', category:'Direction' },
  { role:'Responsable RH',              profile:'Recrutement de profils rares, culture d\'entreprise, gestion prévisionnelle des compétences.', category:'RH & Talent' },
  { role:'Talent Acquisition',          profile:'Sourcing d\'ingénieurs propulsion ou logiciel embarqué dans un marché très tendu.', category:'RH & Talent' },
  { role:'Business Developer',          profile:'Prospection client, réponse aux appels d\'offres ESA et institutionnels, partenariats.', category:'Commercial' },
  { role:'Responsable commercial',      profile:'Négociation de contrats long terme, prévisions, gestion de la relation client stratégique.', category:'Commercial' },
  { role:'Ingénieur propulsion',        profile:'Conception et qualification des moteurs-fusées. Thermodynamique et CFD au quotidien.', category:'Ingénierie' },
  { role:'Ingénieur systèmes',          profile:'Intégration d\'un satellite ou d\'un lanceur : coordination de tous les sous-systèmes.', category:'Ingénierie' },
  { role:'Ingénieur logiciel embarqué', profile:'Code temps-réel certifié pour le contrôle de vol. Langages C, Ada et SPARK.', category:'Ingénierie' },
  { role:'Juriste droit spatial',       profile:'Fréquences, traités orbitaux, responsabilité en cas d\'incident en orbite.', category:'Juridique & Finance' },
  { role:'Analyste financier',          profile:'Évaluation de startups spatiales, montage de dossiers de subvention, modélisation.', category:'Juridique & Finance' },
  { role:'Technicien intégration',      profile:'Assemblage et test des structures en salle blanche. Habilitation et ESD requis.', category:'Technique' },
];

const CATEGORY_ORDER: VideoCategory[] = ['Direction', 'RH & Talent', 'Commercial', 'Ingénierie', 'Technique', 'Juridique & Finance'];

// ── Composant ──────────────────────────────────────────────────────────
interface EntreprisesSpatialeSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function EntreprisesSpatialesSection({ onComplete, onHome }: EntreprisesSpatialeSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [chapter, setChapter] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await getResponses(SECTION);
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter) || 0, TOTAL_CHAPTERS - 1));
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse(SECTION, 'chapter', String(i));
  };

  return (
    <div className="relative min-h-screen bg-deepspace text-white font-sans overflow-x-hidden">
      <div className="starry-background absolute inset-0" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-15 bg-magenta blur-[120px]" />
        <div className="absolute -top-32 right-24 w-[400px] h-[400px] rounded-full opacity-5 bg-magenta blur-[100px]" />
      </div>

      <SectionTopBar label="Session 2 · Chapitre 3 sur 5 · Entreprises du spatial européen" onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} onGoTo={goTo} />

      <div className="relative z-[1] max-w-[1240px] mx-auto px-8 pt-14 pb-24">

        {/* ──────────────────────────────────────────────────────────────
            Chapitre 0 : Carte interactive
        ────────────────────────────────────────────────────────────── */}
        {chapter === 0 && (
          <ChapterShell
            kicker="01"
            title="La carte des acteurs :"
            titleAccent="l'écosystème spatial européen."
            lede="Clique sur un point pour découvrir une entreprise, ses partenaires et ses chiffres clés. Filtre par secteur pour voir qui fait quoi à travers l'Europe."
            onPrev={null}
            onNext={() => goTo(1)}
            nextEnabled
            nextLabel="Continue · Startups vs Historiques →"
          >
            <EuropeActorsMap />
          </ChapterShell>
        )}

        {/* ──────────────────────────────────────────────────────────────
            Chapitre 1 : Startups vs Entreprises historiques
        ────────────────────────────────────────────────────────────── */}
        {chapter === 1 && (
          <ChapterShell
            kicker="02"
            title="Deux modèles,"
            titleAccent="un même secteur."
            lede="Dans le spatial, il existe deux grands types d'entreprises. Elles fonctionnent très différemment, mais elles ont toutes les deux leur place. Voici comment les comparer, sans prendre parti."
            onPrev={() => goTo(0)}
            onNext={() => goTo(2)}
            nextEnabled
            nextLabel="Continue · Les métiers en action →"
          >
            {/* En-têtes colonnes */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Startups New Space', icon: <Rocket className="w-5 h-5" />, examples: 'Latitude, Isar Aerospace, PLD Space, Kinéis, Orbex', color: '#C8257A' },
                { label: 'Entreprises historiques', icon: <Building2 className="w-5 h-5" />, examples: 'Airbus D&S, Thales AS, Leonardo, Safran, ArianeGroup', color: '#60A5FA' },
              ].map(col => (
                <div key={col.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl grid place-items-center flex-shrink-0"
                      style={{ backgroundColor: `${col.color}1A` }}
                    >
                      <span style={{ color: col.color }}>{col.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold leading-tight">{col.label}</h3>
                      <p className="text-[11px] text-white/40 mt-0.5">{col.examples}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lignes de comparaison */}
            <div className="flex flex-col gap-3">
              {COMPARISON.map((row, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35 mb-2">{row.aspect}</p>
                    <p className="text-[13px] text-white/75 leading-[1.55]">{row.startup}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35 mb-2">{row.aspect}</p>
                    <p className="text-[13px] text-white/75 leading-[1.55]">{row.historical}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Callout neutre */}
            <div className="mt-6 border-[1.5px] border-magenta/30 rounded-xl p-5 bg-magenta/[0.03]">
              <p className="text-[13px] text-white/70 leading-[1.6]">
                <span className="font-semibold text-white">À retenir :</span> les deux fonctionnent ensemble. Les grandes entreprises passent souvent des commandes aux startups (pièces, logiciels, services), et les startups ont besoin des grands groupes pour tester et valider leurs technologies. Il n'y a pas un meilleur chemin que l'autre pour entrer dans le secteur spatial.
              </p>
            </div>
          </ChapterShell>
        )}

        {/* ──────────────────────────────────────────────────────────────
            Chapitre 2 : Les métiers en action
        ────────────────────────────────────────────────────────────── */}
        {chapter === 2 && (
          <ChapterShell
            kicker="03"
            title="Les métiers"
            titleAccent="en action."
            lede="Ces cartes accueilleront les témoignages vidéo de professionnels du secteur spatial. Clique sur une carte pour en savoir plus sur le métier."
            onPrev={() => goTo(1)}
            onNext={() => goTo(3)}
            nextEnabled
            nextLabel="Continue · Récap →"
          >
            {CATEGORY_ORDER.map(cat => {
              const cards = VIDEO_CARDS.filter(v => v.category === cat);
              return (
                <div key={cat} className="mb-8 last:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{cat}</span>
                    <div className="flex-1 h-px bg-white/[0.07]" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cards.map((v, i) => (
                      <div
                        key={i}
                        className="group bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden hover:border-magenta/40 transition-all duration-150 hover:-translate-y-0.5"
                      >
                        {/* Zone vidéo (placeholder 16:9) */}
                        <div className="relative bg-white/[0.02]" style={{ paddingTop: '56.25%' }}>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 grid place-items-center group-hover:border-magenta/30 transition">
                              <Play className="w-4 h-4 text-white/25 group-hover:text-magenta/50 transition" />
                            </div>
                            <span className="text-[10px] text-white/20 tracking-[0.1em] uppercase">Vidéo à venir</span>
                          </div>
                        </div>
                        {/* Info métier */}
                        <div className="p-4">
                          <h4 className="text-[13px] font-semibold leading-snug mb-1.5">{v.role}</h4>
                          <p className="text-[11px] text-white/45 leading-[1.5]">{v.profile}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </ChapterShell>
        )}

        {/* ──────────────────────────────────────────────────────────────
            Chapitre 3 : Récap
        ────────────────────────────────────────────────────────────── */}
        {chapter === 3 && (
          <ChapterRecap
            chapterLabel="Entreprises du spatial européen"
            summary="Tu as cartographié l'écosystème spatial européen, comparé les deux modèles économiques qui le structurent et découvert la diversité des métiers qui y recrutent."
            stats={[
              { v: EUROPEAN_SPACE_COMPANIES.length, t: 'acteurs cartographiés en Europe' },
              { v: VIDEO_CARDS.length, t: 'métiers présentés dans cette section' },
            ]}
            nextTitle="Accompagnement & Orientation"
            nextDesc="Quelles formations et quels parcours mènent au secteur spatial ?"
            onContinue={onComplete}
            onPrev={() => goTo(2)}
          />
        )}
      </div>
    </div>
  );
}
