import { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, CheckCircle, Search, ExternalLink, Wrench, Trophy, Users, Heart, Lightbulb } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Navigation } from './Navigation';
import { supabase } from '../lib/supabase';

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

interface SchoolResourcesSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function SchoolResourcesSection({ onComplete, onHome, onBack }: SchoolResourcesSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [searchRegion, setSearchRegion] = useState('');
  const [mentoringPlatforms, setMentoringPlatforms] = useState<MentoringPlatform[]>([]);
  const [scientificAssociations, setScientificAssociations] = useState<ScientificAssociation[]>([]);
  const [regionalAssociations, setRegionalAssociations] = useState<ScientificAssociation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const savedResponses = await getResponses('school_resources');
      setResponses(savedResponses);
      if (savedResponses.searchRegion) {
        setSearchRegion(savedResponses.searchRegion);
      }

      const { data: mentoring } = await supabase
        .from('mentoring_platforms')
        .select('*')
        .order('name');

      if (mentoring) setMentoringPlatforms(mentoring);

      const { data: associations } = await supabase
        .from('scientific_associations')
        .select('*')
        .order('name');

      if (associations) setScientificAssociations(associations);
    };
    loadData();
  }, []);

  const resources: Resource[] = [
    {
      name: 'Interventions Planète Sciences',
      description: 'Ateliers et interventions dans les établissements scolaires',
      type: 'intervention',
      provider: 'Planète Sciences',
      url: 'https://www.planete-sciences.org/',
      icon: '🎓'
    },
    {
      name: 'Mallettes Pédagogiques CNES',
      description: 'Kits éducatifs complets sur différents thèmes spatiaux',
      type: 'kit',
      provider: 'CNES',
      url: 'https://cnes.fr/fr/education',
      icon: '🧰'
    },
    {
      name: 'Construction de Lanceurs à Eau',
      description: 'Projet DIY pour comprendre la propulsion',
      type: 'diy',
      provider: 'Communauté',
      icon: '🚀'
    },
    {
      name: 'Concours C\'Génial',
      description: 'Concours scientifique pour collégiens et lycéens',
      type: 'competition',
      provider: 'C\'Génial',
      url: 'https://www.cgenial.org/',
      icon: '🏆'
    },
    {
      name: 'Fabrication de Satellites en Carton',
      description: 'Comprendre les composants d\'un satellite',
      type: 'diy',
      provider: 'Communauté',
      icon: '🛰️'
    },
    {
      name: 'Défis Espace de l\'ESA',
      description: 'Challenges éducatifs proposés par l\'Agence Spatiale Européenne',
      type: 'competition',
      provider: 'ESA',
      url: 'https://www.esa.int/Education',
      icon: '🌍'
    },
    {
      name: 'Interventions Eurêka',
      description: 'Animations scientifiques adaptées à tous les niveaux',
      type: 'intervention',
      provider: 'Eurêka',
      icon: '💡'
    },
    {
      name: 'Kit Système Solaire',
      description: 'Maquettes et supports pour découvrir notre système planétaire',
      type: 'kit',
      provider: 'Divers fournisseurs',
      icon: '🪐'
    }
  ];

  const regions = [
    'Auvergne-Rhône-Alpes',
    'Bourgogne-Franche-Comté',
    'Bretagne',
    'Centre-Val de Loire',
    'Corse',
    'Grand Est',
    'Hauts-de-France',
    'Île-de-France',
    'Normandie',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Pays de la Loire',
    'Provence-Alpes-Côte d\'Azur'
  ];

  const typeLabels = {
    intervention: 'Interventions en Classe',
    diy: 'Projets DIY',
    competition: 'Concours',
    kit: 'Mallettes Pédagogiques'
  };

  const typeIcons = {
    intervention: <BookOpen className="w-6 h-6" />,
    diy: <Wrench className="w-6 h-6" />,
    competition: <Trophy className="w-6 h-6" />,
    kit: <BookOpen className="w-6 h-6" />
  };

  const handleRegionSearch = async (region: string) => {
    setSearchRegion(region);
    await saveResponse('school_resources', 'searchRegion', region);

    if (region) {
      const { data } = await supabase
        .from('scientific_associations')
        .select('*')
        .eq('category', 'mediation')
        .eq('region', region);

      if (data) setRegionalAssociations(data);
    } else {
      setRegionalAssociations([]);
    }
  };

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('school_resources', id, value);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = responses['interest']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-8">
          <BookOpen className="w-12 h-12 text-emerald-400" />
          <div>
            <div className="text-sm text-emerald-400 font-semibold uppercase tracking-wider">📚 Ressources</div>
            <h2 className="text-4xl font-bold">L'Espace à l'École</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <p className="text-gray-300 mb-6 text-lg">
            Découvrez toutes les ressources disponibles pour apporter l'espace dans votre classe ou votre établissement :
          </p>

          <div className="space-y-8">
            {(['intervention', 'kit', 'diy', 'competition'] as const).map((type) => (
              <div key={type}>
                <h3 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                  {typeIcons[type]}
                  {typeLabels[type]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources
                    .filter((resource) => resource.type === type)
                    .map((resource, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/30 rounded-xl p-5"
                      >
                        <div className="text-3xl mb-2">{resource.icon}</div>
                        <h4 className="font-bold text-white mb-2">{resource.name}</h4>
                        <p className="text-gray-300 text-sm mb-2">{resource.description}</p>
                        <p className="text-emerald-400 text-xs mb-3">
                          Proposé par : {resource.provider}
                        </p>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            En savoir plus
                          </a>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-400" />
            Plateformes de Mentorat
          </h3>
          <p className="text-gray-300 mb-6">
            Le mentorat est soutenu par le programme gouvernemental "1 jeune 1 mentor", qui accompagne déjà plus de 150 000 jeunes en France.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {mentoringPlatforms.map((platform) => (
              <a
                key={platform.id}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-5 hover:scale-[1.02] transition-transform"
              >
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  {platform.name}
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-300">
                    <strong>Public:</strong> {platform.target_audience}
                  </p>
                  <p className="text-gray-300">
                    <strong>Domaine:</strong> {platform.domain}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Soutenu par: {platform.supporters}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2 text-blue-300 text-sm">
                  <ExternalLink className="w-4 h-4" />
                  Découvrir
                </div>
              </a>
            ))}
          </div>

          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 mt-8">
            <Lightbulb className="w-7 h-7 text-yellow-400" />
            Associations Scientifiques
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold text-green-400 mb-3">Sciences Générales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scientificAssociations
                  .filter(a => a.category === 'general_science')
                  .map((assoc) => (
                    <a
                      key={assoc.id}
                      href={assoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-5 hover:scale-[1.02] transition-transform"
                    >
                      <h5 className="font-bold text-white mb-2">{assoc.name}</h5>
                      <div className="space-y-1 text-sm">
                        {assoc.domain && <p className="text-green-300"><strong>Domaine:</strong> {assoc.domain}</p>}
                        {assoc.target_audience && <p className="text-gray-300"><strong>Public:</strong> {assoc.target_audience}</p>}
                        {assoc.supporters && <p className="text-gray-400 text-xs">Soutenu par: {assoc.supporters}</p>}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-green-300 text-sm">
                        <ExternalLink className="w-4 h-4" />
                        En savoir plus
                      </div>
                    </a>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-purple-400 mb-3">Associations Spatiales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scientificAssociations
                  .filter(a => a.category === 'space')
                  .map((assoc) => (
                    <a
                      key={assoc.id}
                      href={assoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-5 hover:scale-[1.02] transition-transform"
                    >
                      <h5 className="font-bold text-white mb-2">{assoc.name}</h5>
                      <div className="space-y-1 text-sm">
                        {assoc.activities && <p className="text-purple-300"><strong>Activités:</strong> {assoc.activities}</p>}
                        {assoc.supporters && <p className="text-gray-400 text-xs">Soutenu par: {assoc.supporters}</p>}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-purple-300 text-sm">
                        <ExternalLink className="w-4 h-4" />
                        Découvrir
                      </div>
                    </a>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-pink-400 mb-3">Encourager les Jeunes Filles dans les Sciences</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scientificAssociations
                  .filter(a => a.category === 'girls_in_stem')
                  .map((assoc) => (
                    <a
                      key={assoc.id}
                      href={assoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/30 rounded-xl p-5 hover:scale-[1.02] transition-transform"
                    >
                      <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        {assoc.name}
                      </h5>
                      <div className="space-y-1 text-sm">
                        {assoc.target_audience && <p className="text-pink-300"><strong>Public:</strong> {assoc.target_audience}</p>}
                        {assoc.supporters && <p className="text-gray-400 text-xs">Soutenu par: {assoc.supporters}</p>}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-pink-300 text-sm">
                        <ExternalLink className="w-4 h-4" />
                        En savoir plus
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Search className="w-7 h-7 text-emerald-400" />
            Médiation Scientifique par Région
          </h3>
          <p className="text-gray-300 mb-4">
            Trouvez les centres de médiation scientifique dans votre région :
          </p>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2 font-medium">
              Sélectionnez votre région :
            </label>
            <select
              value={searchRegion}
              onChange={(e) => handleRegionSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">-- Choisir une région --</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {searchRegion && regionalAssociations.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-6">
              <p className="text-emerald-200 mb-4">
                <strong>Région sélectionnée :</strong> {searchRegion}
              </p>
              <div className="space-y-3">
                {regionalAssociations.map((assoc) => (
                  <a
                    key={assoc.id}
                    href={assoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-emerald-500/20 border border-emerald-400/40 rounded-lg p-4 hover:bg-emerald-500/30 transition-colors"
                  >
                    <h5 className="font-bold text-white mb-1">{assoc.name}</h5>
                    <p className="text-emerald-300 text-sm flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Visiter le site
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {searchRegion && regionalAssociations.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-6">
              <p className="text-yellow-300">
                Aucun centre de médiation scientifique trouvé pour cette région dans notre base de données.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Vos Besoins</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Quelle ressource vous intéresse le plus pour votre classe ou votre projet ?
            </label>
            <textarea
              value={responses['interest'] || ''}
              onChange={(e) => handleResponseChange('interest', e.target.value)}
              placeholder="Décrivez le type de ressource que vous recherchez..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitted}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              submitted
                ? 'bg-green-600 text-white'
                : canSubmit
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitted ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Réponses sauvegardées !
              </>
            ) : (
              <>
                Terminer le Parcours 🎉
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
