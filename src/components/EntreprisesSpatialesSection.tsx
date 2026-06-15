import { useState, useEffect } from 'react';
import { Building2, Rocket, ExternalLink, Telescope } from 'lucide-react';
import { SectionTopBar, SectionProgress, ChapterShell, ChapterRecap } from './ChapterShell';
import { EuropeActorsMap } from './EuropeActorsMap';
import MonteTaBoiteWidget from './MonteTaBoiteWidget';
import { YouTubeEmbed } from './YouTubeEmbed';
import { EUROPEAN_SPACE_COMPANIES } from '../data/europeanSpaceCompanies';
import { useSession } from '../contexts/SessionContext';

/* ════════════════════════════════════════════════════════════════════
 * EntreprisesSpatialesSection — Session 2, après ExplorationSection
 *
 * 5 chapitres :
 *   0. Carte interactive des acteurs du spatial européen
 *   1. Atelier « Monte ta boîte spatiale »
 *   2. Startups vs entreprises historiques (comparaison neutre)
 *   3. Les métiers en action (placeholders vidéo CEO / RH / commercial)
 *   4. Récap
 * ════════════════════════════════════════════════════════════════════ */

const SECTION = 'entreprises_spatiales';
const TOTAL_CHAPTERS = 5;

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

const CATEGORY_DESC: Record<VideoCategory, string> = {
  'Direction': 'Pilotent la stratégie de l\'entreprise et représentent ses intérêts auprès des agences spatiales et des partenaires.',
  'RH & Talent': 'Recrutent et accompagnent les profils techniques rares dont les programmes spatiaux ont besoin.',
  'Commercial': 'Construisent et entretiennent la relation avec les clients institutionnels et privés du secteur spatial.',
  'Ingénierie': 'Conçoivent, développent et qualifient les lanceurs, satellites et systèmes embarqués.',
  'Technique': 'Assemblent, testent et contrôlent les équipements spatiaux avant leur intégration ou leur lancement.',
  'Juridique & Finance': 'Sécurisent les aspects réglementaires, contractuels et financiers des projets spatiaux.',
};

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
  const [cometesVisited, setCometesVisited] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await getResponses(SECTION);
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter) || 0, TOTAL_CHAPTERS - 1));
      if (r.cometes_visited === 'true') setCometesVisited(true);
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCometesClick = async () => {
    setCometesVisited(true);
    if (hydrated) await saveResponse(SECTION, 'cometes_visited', 'true');
  };

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
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} />

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
            nextLabel="Continue · Monte ta boîte spatiale →"
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
            Chapitre 2 : Atelier « Monte ta boîte spatiale »
        ────────────────────────────────────────────────────────────── */}
        {chapter === 2 && (
          <ChapterShell
            kicker="03"
            title="À toi de jouer :"
            titleAccent="monte ta boîte spatiale."
            lede="Choisis un secteur, donne une identité à ton entreprise, puis recrute ton équipe. À la fin, l'atelier t'aide à vérifier si tu n'as oublié aucun métier clé."
            onPrev={() => goTo(1)}
            onNext={() => goTo(3)}
            nextEnabled
            nextLabel="Continue · Les métiers en action →"
          >
            <MonteTaBoiteWidget />
          </ChapterShell>
        )}

        {/* ──────────────────────────────────────────────────────────────
            Chapitre 3 : Les métiers en action
        ────────────────────────────────────────────────────────────── */}
        {chapter === 3 && (
          <ChapterShell
            kicker="04"
            title="Les métiers"
            titleAccent="en action."
            lede="Découvre la diversité des métiers du secteur, puis explore le site de Comètes pour voir à quoi ressemble une mission spatiale au quotidien."
            onPrev={() => goTo(2)}
            onNext={() => goTo(4)}
            nextEnabled={cometesVisited}
            nextLabel={cometesVisited ? 'Continue · Récap →' : 'Explore le site de Comètes pour continuer'}
          >
            {CATEGORY_ORDER.map(cat => {
              const cards = VIDEO_CARDS.filter(v => v.category === cat);
              return (
                <div key={cat} className="mb-8 last:mb-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{cat}</span>
                    <div className="flex-1 h-px bg-white/[0.07]" />
                  </div>
                  <p className="text-[12px] text-white/50 leading-[1.5] max-w-[640px] mb-3">{CATEGORY_DESC[cat]}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cards.map((v, i) => (
                      <div
                        key={i}
                        className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 hover:border-magenta/40 transition-all duration-150 hover:-translate-y-0.5"
                      >
                        <h4 className="text-[13px] font-semibold leading-snug mb-1.5">{v.role}</h4>
                        <p className="text-[11px] text-white/45 leading-[1.5]">{v.profile}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Mise en avant : Comètes */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">À explorer</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>
              <a
                href="https://cometes-spatial.fr"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCometesClick}
                className="group block rounded-2xl overflow-hidden border-[1.5px] border-magenta bg-magenta/[0.04] hover:bg-magenta/[0.08] transition-all duration-150 hover:-translate-y-0.5"
              >
                <div className="grid sm:grid-cols-[1.2fr_1fr] gap-0">
                  <div className="p-6 flex flex-col gap-3 justify-center">
                    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-magenta">
                      <Telescope className="w-4 h-4" /> Comètes · cometes-spatial.fr
                    </span>
                    <h4 className="text-[20px] font-semibold leading-snug">
                      Plonge dans une mission spatiale grandeur réelle.
                    </h4>
                    <p className="text-[13px] text-white/70 leading-[1.55]">
                      Le site de l'association Comètes présente ses projets, ses missions et les métiers qui les font vivre. Clique pour le découvrir dans un nouvel onglet.
                    </p>
                    <span className="inline-flex items-center gap-2 mt-2 bg-magenta text-white rounded-lg px-5 py-3 text-[13px] font-semibold w-fit group-hover:bg-magenta-700 transition">
                      Découvrir cometes-spatial.fr <ExternalLink className="w-4 h-4" />
                    </span>
                    {!cometesVisited && (
                      <span className="text-[11px] text-white/45 mt-1">Ouvre le site pour débloquer la suite.</span>
                    )}
                  </div>
                  <div className="relative bg-deepspace border-t sm:border-t-0 sm:border-l border-white/10 min-h-[180px] flex flex-col">
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10 bg-white/[0.03]">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                      </div>
                      <span className="ml-2 text-[10px] text-white/40 tracking-[0.06em]">cometes-spatial.fr</span>
                    </div>
                    <div className="flex-1 grid place-items-center p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-magenta/15 border border-magenta/30 grid place-items-center">
                          <Telescope className="w-6 h-6 text-magenta" />
                        </div>
                        <span className="text-[13px] font-semibold">Association Comètes</span>
                        <span className="text-[11px] text-white/45 max-w-[220px]">Missions, projets étudiants et portraits de métiers du spatial</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">Le mot d'un dirigeant</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <div className="px-5 py-3 bg-white/[0.04] border-b border-white/10">
                  <p className="text-[13px] font-semibold">Métier · diriger une entreprise du spatial</p>
                </div>
                <div className="relative aspect-video bg-black">
                  <YouTubeEmbed videoId="WfJBYx9cRe4" title="Pierre Bertrand — présentation" nocookie />
                </div>
                <p className="text-[11px] italic text-white/35 px-5 py-3 border-t border-white/10">Pierre Bertrand, président de l'association Space Elevator et fondateur de Skyhopy : ingénieur formé en France (CentraleSupélec) et au MIT, il a conçu des satellites pour des entreprises européennes et internationales avant de fonder sa propre société.</p>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <div className="px-5 py-3 bg-white/[0.04] border-b border-white/10">
                  <p className="text-[13px] font-semibold">Métier · ingénieur appel d'offres</p>
                </div>
                <div className="relative aspect-[9/16] bg-black">
                  <YouTubeEmbed videoId="BG5cHnVtj7A" title="Ingénieur appel d'offres — présentation" nocookie />
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10">
                <div className="px-5 py-3 bg-white/[0.04] border-b border-white/10">
                  <p className="text-[13px] font-semibold">Métier · responsable marketing</p>
                </div>
                <div className="relative aspect-[9/16] bg-black">
                  <YouTubeEmbed videoId="EQV0ZaiPgHE" title="Responsable marketing — présentation" nocookie />
                </div>
              </div>
            </div>
          </ChapterShell>
        )}

        {/* ──────────────────────────────────────────────────────────────
            Chapitre 4 : Récap
        ────────────────────────────────────────────────────────────── */}
        {chapter === 4 && (
          <ChapterRecap
            chapterLabel="Entreprises du spatial européen"
            summary="Tu as cartographié l'écosystème spatial européen, monté ta propre boîte spatiale, comparé les deux modèles économiques qui le structurent et découvert la diversité des métiers qui y recrutent."
            stats={[
              { v: EUROPEAN_SPACE_COMPANIES.length, t: 'acteurs cartographiés en Europe' },
              { v: VIDEO_CARDS.length, t: 'métiers présentés dans cette section' },
            ]}
            nextTitle="Accompagnement & Orientation"
            nextDesc="Quelles formations et quels parcours mènent au secteur spatial ?"
            onContinue={onComplete}
            onPrev={() => goTo(3)}
          />
        )}
      </div>
    </div>
  );
}
