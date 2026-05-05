import { useState, useEffect } from 'react';
import { Users, ChevronRight, CheckCircle, ExternalLink, Mail, UserSearch, BookOpen, Wrench, Trophy, Search, Lightbulb, Heart } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Navigation } from './Navigation';
import { supabase } from '../lib/supabase';

interface Association {
  name: string;
  description: string;
  website: string;
  email: string;
  focus: string;
  howTheyHelp: string;
  icon: string;
}

interface Resource {
  name: string;
  description: string;
  type: 'intervention' | 'diy' | 'competition' | 'kit';
  provider: string;
  url?: string;
  icon: string;
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
    description: 'Association d\'éducation populaire aux sciences et techniques, leader en France',
    website: 'https://www.planete-sciences.org/',
    email: 'contact@planete-sciences.org',
    focus: 'Jeunes de 8 à 25 ans',
    howTheyHelp: 'Clubs scientifiques, ateliers en classe, camps spatiaux, Concours de Lanceurs à Eau, accompagnement de projets (lanceurs expérimentaux, ballons stratosphériques), formation d\'animateurs',
    icon: '🔬'
  },
  {
    name: 'GIFAS Jeunes',
    description: 'Branche jeunesse du Groupement des Industries Françaises Aéronautiques et Spatiales',
    website: 'https://www.gifas.fr/',
    email: 'communication@gifas.fr',
    focus: 'Lycéens et étudiants',
    howTheyHelp: 'Rencontres avec des professionnels, visites d\'entreprises aérospatiales, conférences métiers, informations sur les formations et débouchés, mentorat par des ingénieurs',
    icon: '✈️'
  },
  {
    name: 'Espace dans ma Ville',
    description: 'Programme du CNES pour démocratiser l\'accès à la culture spatiale',
    website: 'https://cnes.fr/',
    email: 'contact.cnes@cnes.fr',
    focus: 'Tous publics, surtout jeunes en zones prioritaires',
    howTheyHelp: 'Ateliers mobiles, animations gratuites, expositions itinérantes, interventions en établissements scolaires, prêt de matériel pédagogique, formations pour enseignants',
    icon: '🚀'
  },
  {
    name: 'Les Petits Débrouillards',
    description: 'Réseau d\'éducation populaire à la science et par la science',
    website: 'https://www.lespetitsdebrouillards.org/',
    email: 'national@lespetitsdebrouillards.org',
    focus: 'Jeunes de 4 à 18 ans',
    howTheyHelp: 'Ateliers expérimentaux sur l\'espace, clubs scientifiques, animations périscolaires, stages vacances, projets collaboratifs',
    icon: '🧪'
  },
  {
    name: 'Astronautes & Co',
    description: 'Association créée par des passionnés pour partager la culture spatiale',
    website: 'https://astronautes.co/',
    email: 'contact@astronautes.co',
    focus: 'Collégiens, lycéens et étudiants',
    howTheyHelp: 'Conférences inspirantes, mentorat par des professionnels du spatial, organisation d\'événements spatiaux, mise en relation avec des acteurs de l\'industrie, accompagnement d\'orientation',
    icon: '👨‍🚀'
  },
  {
    name: 'ANSTJ',
    description: 'Association Nationale Sciences Techniques Jeunesse — réseau d\'éducation scientifique',
    website: 'https://www.anstj.fr/',
    email: 'contact@anstj.fr',
    focus: 'Jeunes de 7 à 25 ans',
    howTheyHelp: 'Clubs scientifiques dans toute la France, projets spatiaux (CanSat, ballons sondes), séjours scientifiques, concours nationaux, accompagnement technique de projets étudiants',
    icon: '🎓'
  },
];

const resources: Resource[] = [
  { name: 'Interventions Planète Sciences', description: 'Ateliers et interventions dans les établissements scolaires', type: 'intervention', provider: 'Planète Sciences', url: 'https://www.planete-sciences.org/', icon: '🎓' },
  { name: 'Mallettes Pédagogiques CNES', description: 'Kits éducatifs complets sur différents thèmes spatiaux', type: 'kit', provider: 'CNES', url: 'https://cnes.fr/fr/education', icon: '🧰' },
  { name: 'Construction de Lanceurs à Eau', description: 'Projet DIY pour comprendre la propulsion', type: 'diy', provider: 'Communauté', icon: '🚀' },
  { name: 'Concours C\'Génial', description: 'Concours scientifique pour collégiens et lycéens', type: 'competition', provider: 'C\'Génial', url: 'https://www.cgenial.org/', icon: '🏆' },
  { name: 'Fabrication de Satellites en Carton', description: 'Comprendre les composants d\'un satellite', type: 'diy', provider: 'Communauté', icon: '🛰️' },
  { name: 'Défis Espace de l\'ESA', description: 'Challenges éducatifs proposés par l\'Agence Spatiale Européenne', type: 'competition', provider: 'ESA', url: 'https://www.esa.int/Education', icon: '🌍' },
];

const typeLabels = { intervention: 'Interventions en Classe', diy: 'Projets DIY', competition: 'Concours', kit: 'Mallettes Pédagogiques' };
const typeIcons = {
  intervention: <BookOpen className="w-5 h-5" />,
  diy: <Wrench className="w-5 h-5" />,
  competition: <Trophy className="w-5 h-5" />,
  kit: <BookOpen className="w-5 h-5" />,
};

const regions = [
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire',
  'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie',
  'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', "Provence-Alpes-Côte d'Azur",
];

export function AccompagnementSection({ onComplete, onHome, onBack }: AccompagnementSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'associations' | 'ressources'>('associations');
  const [searchRegion, setSearchRegion] = useState('');
  const [mentoringPlatforms, setMentoringPlatforms] = useState<MentoringPlatform[]>([]);
  const [scientificAssociations, setScientificAssociations] = useState<ScientificAssociation[]>([]);
  const [regionalAssociations, setRegionalAssociations] = useState<ScientificAssociation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const savedResponses = await getResponses('accompagnement');
      setResponses(savedResponses);
      if (savedResponses.searchRegion) setSearchRegion(savedResponses.searchRegion);
      if (savedResponses.activeTab) setActiveTab(savedResponses.activeTab as any);

      const { data: mentoring } = await supabase.from('mentoring_platforms').select('*').order('name');
      if (mentoring) setMentoringPlatforms(mentoring);

      const { data: assocs } = await supabase.from('scientific_associations').select('*').order('name');
      if (assocs) setScientificAssociations(assocs);
    };
    loadData();
  }, []);

  const handleRegionSearch = async (region: string) => {
    setSearchRegion(region);
    await saveResponse('accompagnement', 'searchRegion', region);
    if (region) {
      const { data } = await supabase.from('scientific_associations').select('*').eq('category', 'mediation').eq('region', region);
      if (data) setRegionalAssociations(data);
    } else {
      setRegionalAssociations([]);
    }
  };

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('accompagnement', id, value);
  };

  const handleTabChange = async (tab: 'associations' | 'ressources') => {
    setActiveTab(tab);
    await saveResponse('accompagnement', 'activeTab', tab);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => onComplete(), 1500);
  };

  const canSubmit = responses['interested']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-teal-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-8">
          <Users className="w-12 h-12 text-teal-400" />
          <div>
            <div className="text-sm text-teal-400 font-semibold uppercase tracking-wider">Accompagnement</div>
            <h2 className="text-4xl font-bold">Ressources & Associations</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 rounded-xl p-1 border border-white/10">
          {([
            { id: 'associations', label: 'Associations', icon: <Users className="w-4 h-4" /> },
            { id: 'ressources', label: 'Ressources pédagogiques', icon: <BookOpen className="w-4 h-4" /> },
          ] as const).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'associations' && (
          <>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
              <p className="text-gray-300 mb-6 text-lg">
                De nombreuses associations peuvent vous accompagner dans votre découverte du spatial :
              </p>
              <div className="space-y-4">
                {associations.map((association, index) => (
                  <div key={index} className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-400/30 rounded-xl p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">{association.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{association.name}</h3>
                        <p className="text-gray-300 mb-1">{association.description}</p>
                        <p className="text-teal-400 text-sm font-semibold">Public : {association.focus}</p>
                      </div>
                    </div>
                    <div className="bg-teal-500/10 border border-teal-400/20 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-teal-300 mb-2">Comment ils accompagnent les jeunes :</h4>
                      <p className="text-gray-200 text-sm leading-relaxed">{association.howTheyHelp}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {association.website && (
                        <a href={association.website} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 rounded-lg text-sm text-teal-300 transition-colors">
                          <ExternalLink className="w-4 h-4" /> Site web
                        </a>
                      )}
                      {association.email && (
                        <a href={`mailto:${association.email}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 rounded-lg text-sm text-cyan-300 transition-colors">
                          <Mail className="w-4 h-4" /> Contact
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MyJobGlasses */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-4 mb-5">
                <UserSearch className="w-10 h-10 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">MyJobGlasses — Rencontrez des Professionnels</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Échangez directement avec des professionnels du secteur spatial. Des ambassadeurs partagent leur quotidien et conseillent sur les parcours.
                  </p>
                </div>
              </div>
              <a href="https://www.myjobglasses.com/rencontrez-des-ambassadeurs/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-xl text-white font-semibold transition-all hover:scale-105">
                <ExternalLink className="w-5 h-5" />
                Découvrir les ambassadeurs
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </>
        )}

        {activeTab === 'ressources' && (
          <>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
              <p className="text-gray-300 mb-6 text-lg">
                Toutes les ressources disponibles pour apporter l'espace dans votre classe :
              </p>
              <div className="space-y-8">
                {(['intervention', 'kit', 'diy', 'competition'] as const).map((type) => (
                  <div key={type}>
                    <h3 className="text-lg font-semibold text-teal-400 mb-3 flex items-center gap-2">
                      {typeIcons[type]} {typeLabels[type]}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {resources.filter(r => r.type === type).map((resource, i) => (
                        <div key={i} className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-400/30 rounded-xl p-5">
                          <div className="text-3xl mb-2">{resource.icon}</div>
                          <h4 className="font-bold text-white mb-1">{resource.name}</h4>
                          <p className="text-gray-300 text-sm mb-1">{resource.description}</p>
                          <p className="text-teal-400 text-xs mb-3">Proposé par : {resource.provider}</p>
                          {resource.url && (
                            <a href={resource.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-teal-300 hover:text-teal-200 transition-colors">
                              <ExternalLink className="w-4 h-4" /> En savoir plus
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plateformes de mentorat */}
            {mentoringPlatforms.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-7 h-7 text-blue-400" /> Plateformes de Mentorat
                </h3>
                <p className="text-gray-300 mb-5 text-sm">
                  Soutenu par le programme gouvernemental "1 jeune 1 mentor", qui accompagne déjà plus de 150 000 jeunes en France.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {mentoringPlatforms.map(platform => (
                    <a key={platform.id} href={platform.url} target="_blank" rel="noopener noreferrer"
                      className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-5 hover:scale-[1.02] transition-transform">
                      <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" /> {platform.name}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-blue-300"><strong>Public:</strong> {platform.target_audience}</p>
                        <p className="text-gray-300"><strong>Domaine:</strong> {platform.domain}</p>
                        <p className="text-gray-400 text-xs">Soutenu par: {platform.supporters}</p>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-blue-300 text-sm">
                        <ExternalLink className="w-4 h-4" /> Découvrir
                      </div>
                    </a>
                  ))}
                </div>

                {scientificAssociations.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="w-6 h-6 text-yellow-400" /> Associations Scientifiques
                    </h3>
                    <div className="space-y-5">
                      {[
                        { key: 'general_science', label: 'Sciences Générales', color: 'green' },
                        { key: 'space', label: 'Associations Spatiales', color: 'blue' },
                        { key: 'girls_in_stem', label: 'Encourager les Jeunes Filles dans les Sciences', color: 'pink' },
                      ].map(({ key, label, color }) => {
                        const filtered = scientificAssociations.filter(a => a.category === key);
                        if (!filtered.length) return null;
                        return (
                          <div key={key}>
                            <h4 className={`text-lg font-semibold text-${color}-400 mb-3 flex items-center gap-2`}>
                              {key === 'girls_in_stem' && <Heart className="w-5 h-5" />}
                              {label}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {filtered.map(assoc => (
                                <a key={assoc.id} href={assoc.url} target="_blank" rel="noopener noreferrer"
                                  className={`bg-gradient-to-br from-${color}-500/10 to-${color}-600/10 border border-${color}-400/30 rounded-xl p-5 hover:scale-[1.02] transition-transform`}>
                                  <h5 className="font-bold text-white mb-2">{assoc.name}</h5>
                                  <div className="space-y-1 text-sm">
                                    {assoc.domain && <p className={`text-${color}-300`}><strong>Domaine:</strong> {assoc.domain}</p>}
                                    {assoc.target_audience && <p className="text-gray-300"><strong>Public:</strong> {assoc.target_audience}</p>}
                                    {assoc.supporters && <p className="text-gray-400 text-xs">Soutenu par: {assoc.supporters}</p>}
                                  </div>
                                  <div className={`mt-3 flex items-center gap-2 text-${color}-300 text-sm`}>
                                    <ExternalLink className="w-4 h-4" /> En savoir plus
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Médiation par région */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Search className="w-6 h-6 text-teal-400" /> Médiation Scientifique par Région
              </h3>
              <p className="text-gray-300 mb-4 text-sm">Trouvez les centres de médiation scientifique dans votre région :</p>
              <select
                value={searchRegion}
                onChange={e => handleRegionSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
              >
                <option value="">-- Choisir une région --</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {searchRegion && regionalAssociations.length > 0 && (
                <div className="bg-teal-500/10 border border-teal-400/30 rounded-lg p-5 space-y-3">
                  {regionalAssociations.map(assoc => (
                    <a key={assoc.id} href={assoc.url} target="_blank" rel="noopener noreferrer"
                      className="block bg-teal-500/20 border border-teal-400/40 rounded-lg p-4 hover:bg-teal-500/30 transition-colors">
                      <h5 className="font-bold text-white mb-1">{assoc.name}</h5>
                      <p className="text-teal-300 text-sm flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Visiter le site</p>
                    </a>
                  ))}
                </div>
              )}
              {searchRegion && regionalAssociations.length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-5">
                  <p className="text-yellow-300 text-sm">Aucun centre trouvé pour cette région dans notre base de données.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Réponse libre + bouton */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Vos besoins</h3>
          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Quelle association ou ressource vous intéresse le plus, et pourquoi ?
            </label>
            <textarea
              value={responses['interested'] || ''}
              onChange={e => handleResponseChange('interested', e.target.value)}
              placeholder="Partagez vos centres d'intérêt et vos besoins..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={4}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitted}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              submitted ? 'bg-green-600 text-white' : canSubmit
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitted ? (
              <><CheckCircle className="w-5 h-5" /> Réponses sauvegardées !</>
            ) : (
              <>Continuer vers FAQ & Questions <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
