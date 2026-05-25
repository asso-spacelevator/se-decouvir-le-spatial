import { useState, useEffect } from 'react';
import { MapPin, Play, Building2, Rocket } from 'lucide-react';
import { SectionTopBar, SectionProgress, ChapterShell, ChapterRecap } from './ChapterShell';
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

// ── Secteurs — palette data-viz (exception à la charte monochrome) ────
const SECTORS = {
  propulsion:  { color: '#C8257A', label: 'Propulsion & Lanceurs' },
  electronics: { color: '#60A5FA', label: 'Électronique & Capteurs' },
  it:          { color: '#34D399', label: 'Informatique & Données' },
  telecom:     { color: '#A78BFA', label: 'Télécommunications' },
  consulting:  { color: '#FBBF24', label: 'Conseil & Finance' },
  chemistry:   { color: '#F97316', label: 'Chimie & Matériaux' },
  parts:       { color: '#94A3B8', label: 'Fournisseurs & Sous-systèmes' },
  technicians: { color: '#06B6D4', label: 'Techniciens & Formation' },
} as const;
type SectorKey = keyof typeof SECTORS;

// ── Données entreprises ───────────────────────────────────────────────
interface Company {
  id: string; name: string; country: string; sector: SectorKey;
  x: number; y: number; // % dans le conteneur carte
  description: string; employees?: string;
  isStartup?: boolean; partners?: string[];
}

const COMPANIES: Company[] = [
  // France
  { id:'ariane',     name:'ArianeGroup',         country:'France',          sector:'propulsion',  x:36, y:52, employees:'8 000+',   isStartup:false, partners:['safran','airbusds','avio'],    description:"Maître d'œuvre d'Ariane 6. Co-entreprise Airbus/Safran, garant de l'accès autonome de l'Europe à l'espace." },
  { id:'tas',        name:'Thales Alenia Space',  country:'France / Italie', sector:'electronics', x:41, y:57, employees:'8 500+',   isStartup:false, partners:['ariane','telespazio'],         description:"Premier fournisseur de l'ESA : satellites télécom, observation de la Terre, navigation Galileo." },
  { id:'safran',     name:'Safran',               country:'France',          sector:'propulsion',  x:30, y:54, employees:'92 000+',  isStartup:false, partners:['ariane','airbusds'],           description:"Moteur Vulcain 2.1 (cœur d'Ariane 6), propulseurs auxiliaires, systèmes embarqués." },
  { id:'kineis',     name:'Kinéis',               country:'France',          sector:'telecom',     x:27, y:49, employees:'100+',     isStartup:true,                                            description:"Constellation IoT de 25 nanosatellites. Spin-off CNES/CLS pour connecter les objets partout dans le monde." },
  { id:'latitude',   name:'Latitude',             country:'France',          sector:'propulsion',  x:34, y:63, employees:'150+',     isStartup:true,                                            description:"Microlanceur Zephyr en développement — propulsion LOX/méthane, dédié aux petits satellites." },
  { id:'loft',       name:'Loft Orbital',         country:'France / USA',    sector:'it',          x:25, y:54, employees:'200+',     isStartup:true,                                            description:"Satellites-as-a-service : hébergement de charges utiles standardisées sur des plateformes partagées." },
  // Allemagne
  { id:'airbusds',   name:'Airbus D&S',           country:'Allemagne',       sector:'parts',       x:52, y:40, employees:'35 000+',  isStartup:false, partners:['ariane','tas','sstl','tesat'], description:"Premier constructeur spatial européen : satellites haute performance, structures de lanceurs, observation." },
  { id:'ohb',        name:'OHB SE',               country:'Allemagne',       sector:'electronics', x:56, y:34, employees:'3 000+',   isStartup:false, partners:['rfa'],                         description:"Satellites scientifiques (Galileo, JUICE, Copernicus). Intégrateur de microsatellites européens." },
  { id:'isar',       name:'Isar Aerospace',       country:'Allemagne',       sector:'propulsion',  x:59, y:43, employees:'350+',     isStartup:true,                                            description:"Lanceur Spectrum en qualification : 1 000 kg en LEO, propulsion LOX/kérosène, conçu pour être réutilisable." },
  { id:'rfa',        name:'RFA',                  country:'Allemagne',       sector:'propulsion',  x:57, y:37, employees:'200+',     isStartup:true,  partners:['ohb'],                         description:"Rocket Factory Augsburg : micro-lanceur RFA ONE, filiale OHB Group, propulsion LOX/kérosène." },
  { id:'tesat',      name:'Tesat-Spacecom',       country:'Allemagne',       sector:'electronics', x:50, y:44, employees:'1 600+',   isStartup:false, partners:['airbusds'],                    description:"Leader mondial des terminaux laser inter-satellites et répéteurs RF très hautes performances." },
  { id:'mt_aero',    name:'MT Aerospace',         country:'Allemagne',       sector:'parts',       x:54, y:47, employees:'800+',     isStartup:false, partners:['ariane'],                      description:"Structures composites pour lanceurs : jupes, adaptateurs, cônes. Fournisseur critique d'ArianeGroup." },
  // Italie
  { id:'leonardo',   name:'Leonardo',             country:'Italie',          sector:'electronics', x:56, y:67, employees:'51 000+',  isStartup:false, partners:['tas','avio'],                  description:"Capteurs optiques, radar SAR, électronique embarquée haute fiabilité pour satellites civils et de défense." },
  { id:'avio',       name:'Avio',                 country:'Italie',          sector:'propulsion',  x:53, y:70, employees:'1 000+',   isStartup:false, partners:['ariane','tas'],                description:"Étage supérieur Ariane 6 (moteur VINCI), propulseur P120C, lanceur Vega-C." },
  { id:'telespazio', name:'Telespazio',            country:'Italie / France', sector:'it',          x:59, y:72, employees:'2 800+',   isStartup:false, partners:['tas','leonardo'],              description:"Opérations satellite, centres de contrôle mission, services de données Earth observation." },
  // Royaume-Uni
  { id:'sstl',       name:'SSTL',                 country:'Royaume-Uni',     sector:'parts',       x:25, y:30, employees:'500+',     isStartup:false, partners:['airbusds'],                    description:"Surrey Satellite Technology : pionniers des petits satellites commerciaux. Filiale Airbus DS." },
  { id:'orbex',      name:'Orbex',                country:'Royaume-Uni',     sector:'propulsion',  x:27, y:20, employees:'200+',     isStartup:true,                                            description:"Micro-lanceur Prime au biocarburant propane. Site de lancement : Space Hub Sutherland, Écosse." },
  { id:'inmarsat',   name:'Inmarsat',             country:'Royaume-Uni',     sector:'telecom',     x:21, y:33, employees:'2 000+',   isStartup:false,                                           description:"Opérateur mondial de connectivité maritime, aviation et gouvernement par satellite." },
  // Espagne
  { id:'gmv',        name:'GMV',                  country:'Espagne',         sector:'it',          x:19, y:67, employees:'2 800+',   isStartup:false, partners:['airbusds'],                    description:"Leader européen du software spatial : navigation GNSS, contrôle de mission, autonomie embarquée." },
  { id:'sener',      name:'SENER',                country:'Espagne',         sector:'parts',       x:16, y:62, employees:'2 000+',   isStartup:false, partners:['airbusds'],                    description:"Mécanismes de précision, antennes déployables, systèmes de pointage pour satellites ESA." },
  { id:'pld',        name:'PLD Space',            country:'Espagne',         sector:'propulsion',  x:18, y:71, employees:'150+',     isStartup:true,                                            description:"Miura 5 : premier micro-lanceur réutilisable espagnol. Site de lancement : Huelva, Andalousie." },
  // Benelux
  { id:'spacebel',   name:'Spacebel',             country:'Belgique',        sector:'it',          x:44, y:37, employees:'300+',     isStartup:false, partners:['airbusds'],                    description:"Software temps-réel embarqué pour satellites et systèmes sol ESA (GAIA, Herschel, ExoMars)." },
  { id:'ses',        name:'SES',                  country:'Luxembourg',      sector:'telecom',     x:47, y:44, employees:'2 000+',   isStartup:false,                                           description:"2ème opérateur mondial de satellites : 70+ satellites GEO & MEO, connectivité haut-débit mondiale." },
  // Scandinavie
  { id:'ssc',        name:'SSC',                  country:'Suède',           sector:'technicians', x:55, y:20, employees:'600+',     isStartup:false,                                           description:"Swedish Space Corporation : base de lancement Esrange, réseau mondial de stations sol et services." },
  { id:'gkn',        name:'GKN Aerospace',        country:'Suède',           sector:'parts',       x:51, y:22, employees:'1 500+',   isStartup:false, partners:['ariane','safran'],             description:"Structures moteurs, nacelles composites, systèmes thermiques pour lanceurs Ariane et Vega." },
];

const COUNTRY_LABELS = [
  { name:'FRANCE',       x:33, y:70 },
  { name:'ALLEMAGNE',    x:55, y:58 },
  { name:'ITALIE',       x:56, y:80 },
  { name:'ESPAGNE',      x:18, y:80 },
  { name:'ROYAUME-UNI',  x:25, y:42 },
  { name:'BELGIQUE',     x:44, y:31 },
  { name:'LUXEMBOURG',   x:49, y:49 },
  { name:'SUÈDE',        x:54, y:28 },
];

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
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<SectorKey | null>(null);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await getResponses(SECTION);
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter) || 0, TOTAL_CHAPTERS - 1));
      if (r.viewed) {
        try { setViewed(new Set(JSON.parse(r.viewed))); } catch { /* noop */ }
      }
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

  const handleSelect = async (id: string | null) => {
    setSelected(id);
    if (id) {
      const next = new Set(viewed);
      next.add(id);
      setViewed(next);
      if (hydrated) await saveResponse(SECTION, 'viewed', JSON.stringify([...next]));
    }
  };

  const viewedCount = viewed.size;
  const selectedCompany = selected ? (COMPANIES.find(c => c.id === selected) ?? null) : null;
  const filteredCompanies = filter ? COMPANIES.filter(c => c.sector === filter) : COMPANIES;

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
            nextEnabled={viewedCount >= 4}
            nextLabel={
              viewedCount < 4
                ? `Explore encore ${4 - viewedCount} entreprise(s) pour continuer`
                : 'Continue · Startups vs Historiques →'
            }
          >
            {/* Filtres secteurs */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setFilter(null)}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-all ${
                  filter === null
                    ? 'bg-white text-deepspace border-white'
                    : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
                }`}
              >
                Tous
              </button>
              {(Object.entries(SECTORS) as [SectorKey, { color: string; label: string }][]).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => setFilter(filter === key ? null : key)}
                  className="px-3 py-1 rounded-full text-[12px] font-semibold border transition-all"
                  style={{
                    backgroundColor: filter === key ? s.color : 'transparent',
                    borderColor: s.color,
                    color: filter === key ? '#0B0F2A' : s.color,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Carte + panneau détail */}
            <div className="grid grid-cols-[1fr_300px] gap-4">
              {/*
               * Canvas carte — padding-top crée la hauteur de façon fiable même
               * quand tous les enfants sont position:absolute (minHeight ne suffit
               * pas dans ce cas en grid).
               */}
              <div className="relative" style={{ paddingTop: '62%' }}>
                <div className="absolute inset-0 bg-white/[0.025] border border-white/[0.08] rounded-2xl overflow-hidden">

                  {/* Grille géographique subtile */}
                  <div
                    className="absolute inset-0 opacity-[0.035] pointer-events-none"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                      backgroundSize: '50px 50px',
                    }}
                  />

                  {/* Labels pays */}
                  {COUNTRY_LABELS.map(cl => (
                    <span
                      key={cl.name}
                      className="absolute text-[9px] font-bold tracking-[0.22em] text-white/[0.07] select-none pointer-events-none"
                      style={{ left: `${cl.x}%`, top: `${cl.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {cl.name}
                    </span>
                  ))}

                  {/*
                   * Points entreprises — le div extérieur porte le transform positionnel,
                   * le button intérieur porte hover:scale-125 sans conflit.
                   */}
                  {filteredCompanies.map(c => {
                    const isSelected = selected === c.id;
                    const isViewed = viewed.has(c.id);
                    const s = SECTORS[c.sector];
                    return (
                      <div
                        key={c.id}
                        className="absolute"
                        style={{
                          left: `${c.x}%`,
                          top: `${c.y}%`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: isSelected ? 20 : 1,
                          opacity: filter && c.sector !== filter ? 0.2 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        <button
                          onClick={() => handleSelect(c.id === selected ? null : c.id)}
                          title={c.name}
                          className="block rounded-full border-2 border-[#0B0F2A] hover:scale-125 focus:outline-none"
                          style={{
                            width: isSelected ? 20 : 14,
                            height: isSelected ? 20 : 14,
                            backgroundColor: s.color,
                            boxShadow: isSelected
                              ? `0 0 0 4px ${s.color}33, 0 0 16px ${s.color}66`
                              : isViewed
                                ? `0 0 0 2px ${s.color}55`
                                : undefined,
                            transition: 'width 0.15s, height 0.15s, box-shadow 0.15s, transform 0.15s',
                          }}
                        />
                      </div>
                    );
                  })}

                  {/* Barre stats en bas */}
                  <div className="absolute bottom-0 left-0 right-0 bg-deepspace/70 backdrop-blur-sm border-t border-white/5 px-4 py-2 flex items-center gap-3">
                    <span className="text-[11px] text-white/35">{COMPANIES.length} entreprises cartographiées</span>
                    <span className="text-[11px] text-white/20">·</span>
                    <span className="text-[11px]">
                      <span className="text-magenta font-bold">{viewedCount}</span>
                      <span className="text-white/35"> explorée(s)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Panneau détail */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 min-h-[500px]">
                {selectedCompany ? (
                  <>
                    {/* En-tête entreprise */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: SECTORS[selectedCompany.sector].color }}
                          />
                          <span
                            className="text-[10px] font-bold tracking-[0.12em] uppercase"
                            style={{ color: SECTORS[selectedCompany.sector].color }}
                          >
                            {SECTORS[selectedCompany.sector].label}
                          </span>
                        </div>
                        <h3 className="text-[17px] font-bold leading-tight">{selectedCompany.name}</h3>
                        <p className="text-[11px] text-white/45 mt-0.5">
                          {selectedCompany.country}
                          {selectedCompany.isStartup ? ' · New Space' : ''}
                        </p>
                      </div>
                      {selectedCompany.isStartup && (
                        <span className="flex-shrink-0 text-[10px] font-bold tracking-[0.1em] uppercase bg-magenta/15 text-magenta border border-magenta/25 rounded-full px-2 py-0.5">
                          Startup
                        </span>
                      )}
                    </div>

                    <p className="text-[13px] text-white/70 leading-[1.55]">{selectedCompany.description}</p>

                    {selectedCompany.employees && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-[28px] font-bold text-magenta leading-none">{selectedCompany.employees}</span>
                        <span className="text-[12px] text-white/45">employés</span>
                      </div>
                    )}

                    {selectedCompany.partners && selectedCompany.partners.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/30 mb-2">Partenaires & Clients</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCompany.partners.map(pid => {
                            const partner = COMPANIES.find(co => co.id === pid);
                            if (!partner) return null;
                            return (
                              <button
                                key={pid}
                                onClick={() => handleSelect(pid)}
                                className="text-[11px] px-2 py-0.5 rounded border border-white/15 hover:border-white/35 text-white/55 hover:text-white transition"
                              >
                                {partner.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-12">
                    <MapPin className="w-7 h-7 text-white/20" />
                    <p className="text-[12px] text-white/30 max-w-[180px] leading-relaxed">
                      Clique sur un point de la carte pour explorer une entreprise.
                    </p>
                  </div>
                )}
              </div>
            </div>
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
              { v: viewedCount, t: 'entreprises explorées sur la carte' },
              { v: COMPANIES.length, t: 'acteurs référencés en Europe' },
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
