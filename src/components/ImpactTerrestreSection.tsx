import { useState, useEffect } from 'react';
import { Earth, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';
import { Quiz } from './Quiz';
import { AvatarGuide } from './AvatarGuide';

const IMPACT_LINES = [
  { speaker: 'girl' as const, text: "Cette section, c'est la grande question : qu'est-ce que l'espace change concrètement pour nous sur Terre ?" },
  { speaker: 'boy' as const,  text: "Pas les orbites ni la technique — ça viendra après. Ici on parle d'impact humain, social et environnemental." },
  { speaker: 'girl' as const, text: "Et on verra aussi comment les pays du monde entier collaborent malgré leurs rivalités." },
];

interface ImpactTerrestreSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function ImpactTerrestreSection({ onComplete, onHome, onBack }: ImpactTerrestreSectionProps) {
  const { saveResponse, getResponses, saveQuizScore } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('impact_terrestre');
      setResponses(savedResponses);
    };
    loadResponses();
  }, []);

  const quizQuestions = [
    {
      id: 'impact_q1',
      question: 'Quel programme spatial européen fournit des données environnementales en accès libre à tous ?',
      options: [
        { id: 'a', text: 'Ariane 6', isCorrect: false },
        { id: 'b', text: 'Copernicus', isCorrect: true },
        { id: 'c', text: 'Artemis', isCorrect: false },
        { id: 'd', text: 'Hubble', isCorrect: false }
      ],
      explanation: 'Copernicus est le programme européen d\'observation de la Terre de l\'ESA. Ses données sont entièrement ouvertes et gratuites : elles servent à surveiller les forêts, mesurer la fonte des glaces, anticiper les catastrophes naturelles et guider les agriculteurs. C\'est le programme de données spatiales le plus utilisé au monde.'
    }
  ];

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('impact_terrestre', id, value);
  };

  const handleQuizScoreUpdate = async (points: number) => {
    await saveQuizScore('impact_terrestre', 'impact_q1', points, points > 0);
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const canSubmit = quizCompleted && responses['q1']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-emerald-950 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-6">
          <Earth className="w-12 h-12 text-emerald-400" />
          <div>
            <div className="text-sm text-emerald-400 font-semibold uppercase tracking-wider">🌍 Impact sur Terre</div>
            <h2 className="text-4xl font-bold">Le Spatial au Service de l'Humanité</h2>
          </div>
        </div>

        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20">
          <AvatarGuide lines={IMPACT_LINES} interval={4000} />
        </div>

        {/* ── Surveiller la Santé de notre Planète ── */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌿</span>
            <h3 className="text-2xl font-semibold">Surveiller la Santé de notre Planète</h3>
          </div>

          <p className="text-gray-300 leading-relaxed mb-6">
            Ces dernières années, les scientifiques analysent l'évolution des écosystèmes de la planète Terre pour y
            surveiller l'état de la faune, de la flore, du climat et des océans. La planète Terre est un système dont
            l'équilibre est fragile : un dérèglement d'un des piliers, et les autres paramètres s'emballent.
          </p>
          <p className="text-gray-300 leading-relaxed mb-6">
            Le programme européen Copernicus met à disposition de tous — gratuitement — des images satellites de la
            Terre entière, actualisées plusieurs fois par semaine. Des scientifiques, des gouvernements et des ONG
            s'en servent pour mesurer la fonte des glaces polaires, suivre la déforestation en Amazonie, cartographier
            les zones inondées après un cyclone, ou estimer les rendements agricoles d'un pays. Sans cette vue depuis
            l'espace, nous serions aveugles face au changement climatique.
          </p>

          {/* Infographie limites planétaires */}
          <div className="rounded-xl overflow-hidden border border-white/10 mb-5">
            <img
              src="/image.png"
              alt="Les 9 limites planétaires — CGDD 2025"
              className="w-full object-contain bg-white"
            />
          </div>
          <p className="text-xs text-gray-500 text-center mb-6">
            Source : CGDD, 2025 — d'après le Stockholm Resilience Centre
          </p>

          <a
            href="https://www.notre-environnement.gouv.fr/themes/climate/les-observations-du-changement-climatique-ressources/article/comprendre-le-changement-climatique-causes-et-impacts-en-france"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400/60 transition-all duration-200 text-sm font-medium group"
          >
            <span>🌍</span>
            <span>Comprendre le changement climatique : causes et impacts en France</span>
            <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* ── Surveillance des Océans ── */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌊</span>
            <h3 className="text-2xl font-semibold">Surveiller la Santé de l'Océan</h3>
          </div>

          <p className="text-gray-300 leading-relaxed mb-4">
            L'océan couvre plus de 70 % de la surface terrestre et régule le climat de la planète entière : il absorbe
            près de 30 % du CO₂ émis par les activités humaines et redistribue la chaleur entre les pôles et les
            tropiques. Pourtant, il reste l'un des environnements les moins connus et les moins surveillés de la Terre.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            C'est là qu'interviennent les satellites d'altimétrie, de température de surface et de couleur de l'eau.
            Combinés à des bouées dérivantes, des gliders autonomes et des capteurs embarqués sur des navires, ils
            permettent de mesurer en continu la montée des eaux, le réchauffement des couches superficielles,
            l'acidification, et la distribution du phytoplancton — base de toute vie marine. Ces données sont
            essentielles pour anticiper les phénomènes El Niño, la montée du niveau des mers et l'évolution des
            pêcheries mondiales.
          </p>
          <p className="text-gray-300 leading-relaxed mb-6">
            Des acteurs comme <strong className="text-white">CLS (Collecte Localisation Satellites)</strong>, filiale
            du CNES, développent des solutions d'observation opérationnelle de l'océan au service des gouvernements,
            des scientifiques et de l'industrie maritime.
          </p>

          <a
            href="https://www.youtube.com/watch?v=placeholder_fabien_lefevre"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-300 hover:bg-blue-500/25 hover:border-blue-400/60 transition-all duration-200 text-sm font-medium group"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.582 7.186a2.506 2.506 0 0 0-1.768-1.768C18.254 5 12 5 12 5s-6.254 0-7.814.418a2.506 2.506 0 0 0-1.768 1.768C2 8.746 2 12 2 12s0 3.254.418 4.814a2.506 2.506 0 0 0 1.768 1.768C5.746 19 12 19 12 19s6.254 0 7.814-.418a2.506 2.506 0 0 0 1.768-1.768C22 15.254 22 12 22 12s0-3.254-.418-4.814zM10 15V9l5.2 3-5.2 3z" />
            </svg>
            <div className="text-left">
              <div className="font-medium">Vidéo : Fabien LeFevre — Océanographie CLS</div>
              <div className="text-xs text-blue-400/70">Surveillance de la santé de l'océan</div>
            </div>
            <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <Subsection
          title="Sauver des Vies : Gestion des Catastrophes"
          content="Lors d'un tremblement de terre, d'une inondation ou d'un incendie de forêt, les satellites d'observation deviennent une bouée de sauvetage. En quelques heures, des images à haute résolution permettent d'identifier les zones détruites, de guider les convois de secours vers les zones coupées du monde et d'évaluer les dégâts. Le service Copernicus Emergency Management a été activé plus de 700 fois depuis sa création — pour des catastrophes en Europe et sur tous les continents."
          icon="🚨"
        />

        <Subsection
          title="Connecter les Oubliés du Numérique"
          content="Aujourd'hui encore, 2,6 milliards de personnes n'ont pas accès à internet. Dans les zones rurales d'Afrique, d'Asie centrale ou d'Amazonie, les satellites sont souvent la seule option réaliste. Au-delà d'internet, ils permettent la télémédecine (consultation médicale à distance), l'éducation en ligne pour des milliers d'élèves isolés, et des transactions bancaires dans des régions sans infrastructure. L'espace est un vecteur d'équité mondiale."
          icon="📶"
        />

        <Subsection
          title="Coopération Internationale : l'Espace comme Terrain de Paix"
          content="La Station Spatiale Internationale est le symbole le plus fort de ce que des nations rivales peuvent accomplir ensemble. Depuis 1998, des astronautes américains, russes, européens, japonais et canadiens partagent ce laboratoire orbital — même aux pires moments des tensions géopolitiques. L'ESA collabore avec la NASA (James Webb, mission Mars), JAXA (Japon) et ISRO (Inde) sur des projets qui dépassent les frontières. Le Traité de l'Espace de 1967 pose un principe fondateur : l'espace est le patrimoine commun de l'humanité."
          icon="🤝"
        />

        <Subsection
          title="L'Europe Indépendante dans un Monde Interdépendant"
          content="L'ESA réunit 22 États membres autour d'un principe : pour peser dans les grandes décisions spatiales internationales — normes, orbites, fréquences, exploitation des ressources — il faut une capacité propre. Avoir ses propres lanceurs (Ariane), ses propres satellites de navigation (Galileo) et d'observation (Copernicus) garantit que l'Europe peut décider seule de l'utilisation de ces services vitaux, sans être soumise aux choix politiques d'une autre puissance."
          icon="🇪🇺"
        />

        <Quiz
          questions={quizQuestions}
          onScoreUpdate={handleQuizScoreUpdate}
          onComplete={handleQuizComplete}
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mt-8">
          <h3 className="text-2xl font-semibold mb-6">Réfléchissez à ce que vous avez appris</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Parmi tous les impacts du spatial sur Terre évoqués ici, lequel vous touche le plus personnellement et pourquoi ?
            </label>
            <textarea
              value={responses['q1'] || ''}
              onChange={(e) => handleResponseChange('q1', e.target.value)}
              placeholder="Environnement, inclusion numérique, gestion des crises, coopération internationale..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitted}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              submitted
                ? 'bg-green-600 text-white'
                : canSubmit
                ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white'
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
                Continuer vers les Lanceurs 🚀
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
