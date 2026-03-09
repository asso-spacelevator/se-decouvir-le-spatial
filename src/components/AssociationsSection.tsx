import { useState, useEffect } from 'react';
import { Users, ChevronRight, CheckCircle, ExternalLink, Mail } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Navigation } from './Navigation';

interface Association {
  name: string;
  description: string;
  website: string;
  email: string;
  focus: string;
  howTheyHelp: string;
  icon: string;
}

interface AssociationsSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function AssociationsSection({ onComplete, onHome, onBack }: AssociationsSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('associations');
      setResponses(savedResponses);
    };
    loadResponses();
  }, []);

  const associations: Association[] = [
    {
      name: 'Planète Sciences',
      description: 'Association d\'éducation populaire aux sciences et techniques, leader en France',
      website: 'https://www.planete-sciences.org/',
      email: 'contact@planete-sciences.org',
      focus: 'Jeunes de 8 à 25 ans',
      howTheyHelp: 'Clubs scientifiques, ateliers en classe, camps spatiaux, Concours de Fusées à Eau, accompagnement de projets (fusées expérimentales, ballons stratosphériques), formation d\'animateurs',
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
      howTheyHelp: 'Ateliers expérimentaux sur l\'espace, clubs scientifiques, animations périscolaires, stages vacances, projets collaboratifs (construction de satellites miniatures, expériences en micropesanteur)',
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
      name: 'ANSTJ (Association Nationale Sciences Techniques Jeunesse)',
      description: 'Réseau d\'éducation scientifique pour les jeunes',
      website: 'https://www.anstj.fr/',
      email: 'contact@anstj.fr',
      focus: 'Jeunes de 7 à 25 ans',
      howTheyHelp: 'Clubs scientifiques dans toute la France, projets spatiaux (CanSat, ballons sondes), séjours scientifiques, concours nationaux, accompagnement technique de projets étudiants',
      icon: '🎓'
    },
    {
      name: 'Fermat Science',
      description: 'Association toulousaine de culture scientifique',
      website: 'https://www.fermat-science.fr/',
      email: 'contact@fermat-science.com',
      focus: 'Tous niveaux scolaires',
      howTheyHelp: 'Expositions sur l\'espace, ateliers thématiques, conférences, prêt de mallettes pédagogiques, organisation de la Fête de la Science, partenariats avec le CNES et Airbus',
      icon: '🌟'
    },
    {
      name: 'APMST (Association Pour les Métiers de la Science et de la Technologie)',
      description: 'Promotion des carrières scientifiques et techniques auprès des jeunes',
      website: 'https://www.apmst.fr/',
      email: 'contact@apmst.fr',
      focus: 'Collégiens, lycéens et étudiants',
      howTheyHelp: 'Témoignages de professionnels du spatial, découverte des métiers, stages en entreprise, visites de laboratoires, conseils d\'orientation personnalisés',
      icon: '💼'
    }
  ];

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('associations', id, value);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = responses['interested']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-teal-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-8">
          <Users className="w-12 h-12 text-teal-400" />
          <div>
            <div className="text-sm text-teal-400 font-semibold uppercase tracking-wider">🤝 Ensemble</div>
            <h2 className="text-4xl font-bold">Qui pour m'accompagner ?</h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <p className="text-gray-300 mb-6 text-lg">
            De nombreuses associations peuvent vous accompagner dans votre découverte du spatial, que vous soyez lycéen, étudiant ou simplement passionné :
          </p>

          <div className="space-y-4">
            {associations.map((association, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-400/30 rounded-xl p-6 hover:scale-[1.01] transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{association.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{association.name}</h3>
                    <p className="text-gray-300 mb-2">{association.description}</p>
                    <p className="text-teal-400 text-sm font-semibold mb-2">
                      Public : {association.focus}
                    </p>
                  </div>
                </div>

                <div className="bg-teal-500/10 border border-teal-400/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-teal-300 mb-2">Comment ils accompagnent les jeunes :</h4>
                  <p className="text-gray-200 text-sm leading-relaxed">{association.howTheyHelp}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {association.website && (
                    <a
                      href={association.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 rounded-lg text-sm text-teal-300 hover:text-teal-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Site web
                    </a>
                  )}
                  {association.email && (
                    <a
                      href={`mailto:${association.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 rounded-lg text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Contact
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Votre Intérêt</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Quelle association vous intéresse le plus et pourquoi ? Ou bien, quel type d'accompagnement recherchez-vous ?
            </label>
            <textarea
              value={responses['interested'] || ''}
              onChange={(e) => handleResponseChange('interested', e.target.value)}
              placeholder="Partagez vos centres d'intérêt et vos besoins..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
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
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white'
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
                Continuer vers les Questions 💭
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
