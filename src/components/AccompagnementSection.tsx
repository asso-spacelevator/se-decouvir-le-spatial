import { useState, useEffect, type ReactNode } from 'react';
import {
  Users, ExternalLink, Mail, UserSearch, BookOpen, Wrench, Trophy,
  Lightbulb, Heart, Atom, Star, Monitor, GraduationCap, Building2, Rocket,
  TrendingUp, Calculator, Telescope, Globe, ChevronRight, Package, Satellite,
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../lib/supabase';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterShell, ChapterRecap } from './ChapterShell';

const TOTAL_CHAPTERS = 4;

interface Association {
  name: string;
  description: string;
  website: string;
  email: string;
  focus: string;
  howTheyHelp: string;
  icon: ReactNode;
}

interface Resource {
  name: string;
  description: string;
  type: 'intervention' | 'diy' | 'competition' | 'kit';
  provider: string;
  url?: string;
}

interface MentoringPlatform {
  id: string;
  name: string;
  url: string;
  target_audience: string;
  domain: string;
  supporters: string;
}

interface ScientificAssociation {
  id: string;
  name: string;
  url: string;
  category: string;
  domain: string | null;
  target_audience: string | null;
  supporters: string | null;
  activities: string | null;
  region: string | null;
}

interface AccompagnementSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

const associations: Association[] = [
  {
    name: 'Planète Sciences',
    icon: <Atom className="w-5 h-5" />,
    description: "Association d'éducation populaire aux sciences et techniques, leader en France",
    website: 'https://www.planete-sciences.org/',
    email: 'contact@planete-sciences.org',
    focus: 'Jeunes de 8 à 25 ans',
    howTheyHelp: "Clubs scientifiques, ateliers en classe, camps spatiaux, Concours de Lanceurs à Eau, accompagnement de projets (lanceurs expérimentaux, ballons stratosphériques), formation d'animateurs",
  },
  {
    name: 'Elles bougent',
    icon: <Users className="w-5 h-5" />,
    description: "Mentorat et interventions en lycée pour encourager les filles vers les sciences et l'ingénierie",
    website: 'https://www.ellesbougent.com',
    email: '',
    focus: 'Lycéennes',
    howTheyHelp: "Interventions de femmes ingénieures en lycée, événements de rencontres, mentorat individuel, modèles féminins dans les sciences",
  },
  {
    name: 'Femmes & Sciences',
    icon: <Star className="w-5 h-5" />,
    description: 'Promotion des carrières scientifiques féminines',
    website: 'https://www.femmesetsciences.fr',
    email: '',
    focus: 'Lycéennes, étudiantes, femmes',
    howTheyHelp: "Conférences, mentorat, événements de networking, promotion des parcours scientifiques pour les filles",
  },
  {
    name: 'Girls Can Code',
    icon: <Monitor className="w-5 h-5" />,
    description: 'Initiation des collégiennes à la programmation et aux métiers du numérique',
    website: 'https://girlscancode.fr',
    email: '',
    focus: 'Collégiennes',
    howTheyHelp: "Stages de programmation, ateliers ludiques, découverte des métiers du numérique et de l'informatique",
  },
  {
    name: 'Eureka',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Mentorat, ressources, événements et vulgarisation scientifique pour jeunes',
    website: 'https://association-eureka.fr/',
    email: '',
    focus: 'Lycéens et étudiants',
    howTheyHelp: "Mentorat individuel, ressources d'orientation, événements de vulgarisation scientifique, mise en réseau",
  },
  {
    name: 'Article 1',
    icon: <GraduationCap className="w-5 h-5" />,
    description: "Programme de mentorat pour accompagner l'orientation vers les études supérieures",
    website: 'https://www.mentoratverslesup.dema1n.org/',
    email: '',
    focus: 'Lycéens vers le supérieur',
    howTheyHelp: "Binômes lycéen / étudiant, accompagnement personnalisé sur l'orientation, choix de formations, dossiers d'admission",
  },
  {
    name: '1 jeune 1 mentor',
    icon: <Heart className="w-5 h-5" />,
    description: 'Dispositif national de mentorat pour les 5-30 ans',
    website: 'https://www.1jeune1mentor.fr/',
    email: '',
    focus: 'Jeunes de 5 à 30 ans',
    howTheyHelp: "Mise en relation avec un mentor pour parcours scolaire et professionnel, plateforme nationale soutenue par l'État",
  },
  {
    name: 'Télémaque',
    icon: <Building2 className="w-5 h-5" />,
    description: "Programme d'égalité des chances avec double mentorat école / entreprise",
    website: 'https://www.telemaque.org/',
    email: '',
    focus: 'Collégiens et lycéens',
    howTheyHelp: "Double mentorat par un enseignant et un professionnel d'entreprise, accompagnement sur 2 ans, réseau d'anciens",
  },
  {
    name: 'ProPulse',
    icon: <Rocket className="w-5 h-5" />,
    description: "Lycéens accompagnés par des étudiants de grandes écoles pour leur orientation",
    website: 'https://propulse-association.fr/',
    email: '',
    focus: 'Lycéens',
    howTheyHelp: "Tutorat par des étudiants de grandes écoles, aide aux devoirs, préparation aux concours, conseils d'orientation",
  },
  {
    name: 'Association Tremplin',
    icon: <TrendingUp className="w-5 h-5" />,
    description: "Accès des lycéens aux études scientifiques avec le soutien de grandes écoles",
    website: 'http://www.association-tremplin.org',
    email: '',
    focus: 'Lycéens',
    howTheyHelp: "Accompagnement vers les classes préparatoires et grandes écoles, soutien scolaire, mentorat par des élèves-ingénieurs",
  },
  {
    name: 'Les maths en scène',
    icon: <Calculator className="w-5 h-5" />,
    description: "Faire découvrir les mathématiques autrement, de façon vivante et créative",
    website: 'https://lesmathsenscene.fr',
    email: '',
    focus: 'Collégiens, lycéens',
    howTheyHelp: "Spectacles, ateliers et événements pour réconcilier les jeunes avec les mathématiques",
  },
  {
    name: 'Fondation CGénial',
    icon: <Telescope className="w-5 h-5" />,
    description: "Passerelle entre entreprises innovantes et jeunes pour déclencher des vocations scientifiques",
    website: 'https://www.cgenial.org',
    email: '',
    focus: 'Collégiens, lycéens',
    howTheyHelp: "Interventions d'ingénieurs et chercheurs en classe, Concours C'Génial, immersions en entreprise",
  },
];

const resources: Resource[] = [
  { name: 'Interventions Planète Sciences', description: 'Ateliers et interventions dans les établissements scolaires', type: 'intervention', provider: 'Planète Sciences', url: 'https://www.planete-sciences.org/' },
  { name: 'Mallettes Pédagogiques CNES', description: 'Kits éducatifs complets sur différents thèmes spatiaux', type: 'kit', provider: 'CNES', url: 'https://cnes.fr/fr/education' },
  { name: 'Construction de Lanceurs à Eau', description: 'Projet DIY pour comprendre la propulsion', type: 'diy', provider: 'Communauté' },
  { name: "Concours C'Génial", description: 'Concours scientifique pour collégiens et lycéens', type: 'competition', provider: "C'Génial", url: 'https://www.cgenial.org/' },
  { name: 'Fabrication de Satellites en Carton', description: "Comprendre les composants d'un satellite", type: 'diy', provider: 'Communauté' },
  { name: "Défis Espace de l'ESA", description: "Challenges éducatifs proposés par l'Agence Spatiale Européenne", type: 'competition', provider: 'ESA', url: 'https://www.esa.int/Education' },
];

const typeLabels: Record<Resource['type'], string> = {
  intervention: 'Interventions en Classe',
  diy: 'Projets DIY',
  competition: 'Concours',
  kit: 'Mallettes Pédagogiques',
};

const typeIcons: Record<Resource['type'], ReactNode> = {
  intervention: <BookOpen className="w-5 h-5" />,
  diy: <Wrench className="w-5 h-5" />,
  competition: <Trophy className="w-5 h-5" />,
  kit: <Package className="w-5 h-5" />,
};

const sciCategoryLabels: Record<string, string> = {
  general_science: 'Sciences Générales',
  space: 'Associations Spatiales',
  girls_in_stem: 'Encourager les Jeunes Filles dans les Sciences',
};

export function AccompagnementSection({ onComplete, onHome }: AccompagnementSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [chapter, setChapter] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [interested, setInterested] = useState('');
  const [mentoringPlatforms, setMentoringPlatforms] = useState<MentoringPlatform[]>([]);
  const [scientificAssociations, setScientificAssociations] = useState<ScientificAssociation[]>([]);

  useEffect(() => {
    (async () => {
      const r = await getResponses('accompagnement');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.interested) setInterested(r.interested);

      const { data: mentoring } = await supabase.from('mentoring_platforms').select('*').order('name');
      if (mentoring) setMentoringPlatforms(mentoring);

      const { data: assocs } = await supabase.from('scientific_associations').select('*').order('name');
      if (assocs) setScientificAssociations(assocs);

      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('accompagnement', 'chapter', String(i));
  };

  const handleInterestedChange = async (v: string) => {
    setInterested(v);
    if (hydrated) await saveResponse('accompagnement', 'interested', v);
  };

  return (
    <SectionCanvas>
      <SectionTopBar label="Session 2 · Chapitre 4 sur 5 · Accompagnement" onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Ch 0 : Associations ── */}
        {chapter === 0 && (
          <ChapterShell
            kicker="01" title="Associations"
            titlePrefix="150 000 jeunes accompagnés chaque année."
            titleAccent="Ces structures peuvent t'aider à trouver ta voie."
            lede="Associations spatiales, plateformes de mentorat, dispositifs d'orientation. Chaque fiche te donne accès à des personnes et des programmes qui peuvent t'accompagner concrètement."
            onPrev={null} onNext={() => goTo(1)} nextEnabled={true}
            nextLabel="Continue · Ressources →"
          >
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { value: '150 000', label: 'jeunes accompagnés / an' },
                { value: '12+', label: 'associations référencées' },
                { value: '13', label: 'régions couvertes' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-[28px] font-bold text-magenta leading-none">{stat.value}</div>
                  <div className="text-[11px] text-white/45 mt-1.5 leading-tight uppercase tracking-[0.08em]">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3 mb-8">
              {associations.map((a, i) => (
                <div key={i} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start gap-4 mb-3">
                    <span className="text-magenta flex-shrink-0 mt-0.5">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-[15px] mb-0.5">{a.name}</h3>
                      <p className="text-[12px] text-white/55 mb-1">{a.description}</p>
                      <p className="text-[11px] text-magenta font-semibold">Public : {a.focus}</p>
                    </div>
                  </div>
                  <div className="bg-magenta/[0.06] border border-magenta/20 rounded-lg p-3 mb-3">
                    <p className="text-[12px] text-white/70 leading-relaxed">{a.howTheyHelp}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.website && (
                      <a href={a.website} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-magenta/10 hover:bg-magenta/20 border border-magenta/30 rounded-lg text-[12px] text-magenta transition">
                        <ExternalLink className="w-3.5 h-3.5" /> Site web
                      </a>
                    )}
                    {a.email && (
                      <a href={`mailto:${a.email}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-magenta/10 hover:bg-magenta/20 border border-magenta/30 rounded-lg text-[12px] text-magenta transition">
                        <Mail className="w-3.5 h-3.5" /> Contact
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.04] border border-magenta/25 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <UserSearch className="w-6 h-6 text-magenta flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-[16px] mb-1.5">MyJobGlasses · Rencontre des professionnels</h3>
                  <p className="text-[13px] text-white/65 leading-relaxed mb-4">
                    Échange directement avec des professionnels du secteur spatial. Des ambassadeurs partagent leur quotidien et conseillent sur les parcours.
                  </p>
                  <a
                    href="https://www.myjobglasses.com/rencontrez-des-ambassadeurs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-magenta hover:bg-magenta-700 rounded-lg text-white text-[13px] font-semibold transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Découvrir les ambassadeurs
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 1 : Ressources pédagogiques ── */}
        {chapter === 1 && (
          <ChapterShell
            kicker="02" title="Ressources pédagogiques"
            titlePrefix="Interventions, concours, kits, mentorat :"
            titleAccent="tous les outils pour passer à l'action."
            lede="Des ateliers en classe aux ballons stratosphériques, en passant par les concours nationaux et les plateformes de mentorat soutenues par l'État."
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextEnabled={true}
            nextLabel="Continue · Vos besoins →"
          >
            <div className="space-y-8 mb-8">
              {(['intervention', 'kit', 'diy', 'competition'] as const).map(type => {
                const filtered = resources.filter(r => r.type === type);
                if (!filtered.length) return null;
                return (
                  <div key={type}>
                    <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/45 mb-3 flex items-center gap-2">
                      <span className="text-magenta">{typeIcons[type]}</span>
                      {typeLabels[type]}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filtered.map((res, i) => (
                        <div key={i} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                          <h4 className="font-semibold text-white text-[14px] mb-1">{res.name}</h4>
                          <p className="text-[12px] text-white/55 mb-1">{res.description}</p>
                          <p className="text-[11px] text-magenta/70 mb-3">Proposé par : {res.provider}</p>
                          {res.url && (
                            <a href={res.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[12px] text-magenta hover:underline">
                              <ExternalLink className="w-3.5 h-3.5" /> En savoir plus
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {mentoringPlatforms.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/45 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-magenta" /> Plateformes de mentorat
                </h3>
                <p className="text-[13px] text-white/55 mb-4">
                  Soutenu par le programme gouvernemental "1 jeune 1 mentor", qui accompagne déjà plus de 150 000 jeunes en France.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mentoringPlatforms.map(p => (
                    <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                      className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 hover:border-magenta hover:-translate-y-0.5 transition-all group">
                      <h4 className="font-semibold text-white group-hover:text-magenta transition-colors text-[14px] mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-magenta flex-shrink-0" /> {p.name}
                      </h4>
                      <p className="text-[12px] text-magenta/80 mb-0.5">Public : {p.target_audience}</p>
                      <p className="text-[12px] text-white/55 mb-0.5">Domaine : {p.domain}</p>
                      {p.supporters && <p className="text-[11px] text-white/35">Soutenu par : {p.supporters}</p>}
                      <div className="mt-3 flex items-center gap-1.5 text-magenta text-[12px]">
                        <ExternalLink className="w-3.5 h-3.5" /> Découvrir
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {scientificAssociations.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/45 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-magenta" /> Associations scientifiques
                </h3>
                <div className="space-y-6">
                  {(['general_science', 'space', 'girls_in_stem'] as const).map(key => {
                    const filtered = scientificAssociations.filter(a => a.category === key);
                    if (!filtered.length) return null;
                    return (
                      <div key={key}>
                        <h4 className="text-[13px] font-semibold text-white/70 mb-3 flex items-center gap-2">
                          {key === 'girls_in_stem' && <Heart className="w-4 h-4 text-magenta" />}
                          {key === 'space' && <Satellite className="w-4 h-4 text-magenta" />}
                          {key === 'general_science' && <Globe className="w-4 h-4 text-magenta" />}
                          {sciCategoryLabels[key]}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filtered.map(a => (
                            <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                              className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 hover:border-magenta hover:-translate-y-0.5 transition-all group">
                              <h5 className="font-semibold text-white group-hover:text-magenta transition-colors text-[14px] mb-2">{a.name}</h5>
                              {a.domain && <p className="text-[12px] text-magenta/80 mb-0.5">Domaine : {a.domain}</p>}
                              {a.target_audience && <p className="text-[12px] text-white/55 mb-0.5">Public : {a.target_audience}</p>}
                              {a.supporters && <p className="text-[11px] text-white/35">Soutenu par : {a.supporters}</p>}
                              <div className="mt-3 flex items-center gap-1.5 text-magenta text-[12px]">
                                <ExternalLink className="w-3.5 h-3.5" /> En savoir plus
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </ChapterShell>
        )}

        {/* ── Ch 2 : Vos besoins ── */}
        {chapter === 2 && (
          <ChapterShell
            kicker="03" title="Vos besoins"
            titlePrefix="Tu as vu ce qui existe."
            titleAccent="Qu'est-ce qui te parle vraiment ?"
            lede="Parmi tout ce que tu viens de parcourir, quelle association, ressource ou programme te donne envie d'aller plus loin ?"
            onPrev={() => goTo(1)} onNext={() => goTo(3)} nextEnabled={interested.trim().length > 0}
            nextLabel={interested.trim().length > 0 ? "Terminer le chapitre →" : "Écris ta réponse d'abord"}
          >
            <div>
              <label className="block text-[13px] font-medium text-white/70 mb-3">
                Quelle association ou ressource t'intéresse le plus, et pourquoi ?
              </label>
              <textarea
                value={interested}
                onChange={e => handleInterestedChange(e.target.value)}
                placeholder="Partage tes centres d'intérêt..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 resize-none text-[14px]"
                rows={5}
                maxLength={4000}
              />
            </div>
          </ChapterShell>
        )}

        {/* ── Récap ── */}
        {chapter === 3 && (
          <ChapterRecap
            chapterLabel="Accompagnement"
            summary="Tu as découvert les associations, ressources pédagogiques et programmes de mentorat disponibles pour te lancer dans le spatial."
            nextTitle="Zone FAQ"
            nextDesc="Pose tes questions aux professionnels du secteur spatial."
            onContinue={onComplete}
            onPrev={() => goTo(2)}
          />
        )}
      </div>
    </SectionCanvas>
  );
}
