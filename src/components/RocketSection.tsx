import { useState, useEffect } from 'react';
import { Rocket, ChevronRight, CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Subsection } from './Subsection';
import { Navigation } from './Navigation';
import { Quiz } from './Quiz';
import { AvatarGuide } from './AvatarGuide';
import { Ariane6Diagram } from './Ariane6Diagram';
import { MissionSimulator } from './MissionSimulator';

const ROCKET_LINES = [
  { speaker: 'boy' as const,  text: "On arrive aux lanceurs ! C'est la partie la plus spectaculaire — des millions de chevaux-vapeur au décollage." },
  { speaker: 'girl' as const, text: "Les ingénieurs doivent résoudre des défis dingues : 3000°C, précision au millimètre, poids minimal." },
  { speaker: 'boy' as const,  text: "Choisis un défi qui t'intéresse et explore comment les équipes l'ont relevé !" },
];

interface RocketSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

export function RocketSection({ onComplete, onHome, onBack }: RocketSectionProps) {
  const { saveResponse, getResponses, saveQuizScore } = useSession();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      const savedResponses = await getResponses('rockets');
      setResponses(savedResponses);
      if (savedResponses.selectedChallenge) {
        setSelectedChallenge(parseInt(savedResponses.selectedChallenge));
      }
    };
    loadResponses();
  }, []);

  const challenges = [
    {
      name: 'Températures Extrêmes',
      problem: 'Les moteurs de lanceur peuvent atteindre 3 000°C, tandis que l\'espace oscille entre -150°C et +150°C',
      solution: 'Utilisation de matériaux composites céramiques ultra-résistants et de systèmes de refroidissement actifs avec circulation d\'hydrogène liquide',
      innovation: 'Les boucliers thermiques modernes peuvent supporter des gradients de 3 000°C sur quelques centimètres d\'épaisseur',
      funFact: '🔥 Fun Fact : Le nez d\'un lanceur lors de la rentrée atmosphérique chauffe tellement qu\'il crée un plasma - un quatrième état de la matière - qui bloque temporairement les communications radio !',
      videoUrl: '',
      videoTitle: 'Interview : Ingénieur en Matériaux Thermiques'
    },
    {
      name: 'Puissance Colossale',
      problem: 'Il faut générer plus de 1 000 tonnes de poussée pour vaincre la gravité terrestre',
      solution: 'Moteurs à combustion d\'hydrogène et oxygène liquides, brûlant 300 kg de carburant par seconde',
      innovation: 'Un seul moteur Vulcain 2.1 produit une puissance équivalente à 1 500 voitures de F1 combinées',
      funFact: '💪 Fun Fact : Si vous pouviez canaliser toute la puissance d\'un moteur de lanceur dans une ampoule, elle brillerait 190 fois plus fort que le Soleil vu depuis la Terre !',
      videoUrl: '',
      videoTitle: 'Interview : Ingénieur en Propulsion Spatiale'
    },
    {
      name: 'Précision Absolue',
      problem: 'Une erreur de 0,1° lors du lancement peut manquer la cible orbitale de milliers de kilomètres',
      solution: 'Systèmes de guidage inertiel couplés au GPS, avec corrections en temps réel toutes les millisecondes',
      innovation: 'Les gyroscopes laser actuels détectent des rotations de l\'ordre du milliardième de degré',
      funFact: '🎯 Fun Fact : La précision requise est équivalente à lancer une fléchette depuis Paris et toucher le centre d\'une cible à New York !',
      videoUrl: '',
      videoTitle: 'Interview : Spécialiste en Guidage et Navigation'
    },
    {
      name: 'Légèreté Maximale',
      problem: 'Chaque kilogramme de structure en trop réduit la charge utile possible',
      solution: 'Alliages aluminium-lithium et composites carbone ultra-légers, avec optimisation par intelligence artificielle',
      innovation: 'Les nouveaux matériaux permettent un rapport résistance/poids 5 fois supérieur à l\'acier',
      funFact: '⚖️ Fun Fact : Économiser 1 kg sur la structure d\'un lanceur peut permettre de placer 100 kg supplémentaires en orbite. C\'est pourquoi chaque boulon est optimisé !',
      videoUrl: '',
      videoTitle: 'Interview : Ingénieur en Structures Spatiales'
    }
  ];

  const quizQuestions = [
    {
      id: 'rocket_q1',
      question: 'Quelle est la température maximale que peuvent atteindre les moteurs de lanceur ?',
      options: [
        { id: 'a', text: '500°C', isCorrect: false },
        { id: 'b', text: '1 500°C', isCorrect: false },
        { id: 'c', text: '3 000°C', isCorrect: true },
        { id: 'd', text: '5 000°C', isCorrect: false }
      ],
      explanation: 'Les moteurs de lanceur peuvent atteindre des températures extrêmes de 3 000°C. Des matériaux composites céramiques ultra-résistants et des systèmes de refroidissement actifs sont nécessaires pour gérer ces températures.'
    }
  ];

  const handleChallengeSelect = async (index: number) => {
    setSelectedChallenge(index);
    await saveResponse('rockets', 'selectedChallenge', String(index));
  };

  const handleResponseChange = async (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    await saveResponse('rockets', id, value);
  };

  const handleQuizScoreUpdate = async (points: number) => {
    const currentQuestion = quizQuestions.find(() => true);
    if (currentQuestion) {
      await saveQuizScore('rockets', currentQuestion.id, points, points > 0);
    }
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

  const canSubmit = quizCompleted && selectedChallenge !== null && responses['reflection']?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-orange-950 to-slate-900 text-white py-16 px-6">
      <Navigation onHome={onHome} onBack={onBack} showBack={true} />

      <div className="max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 mb-6">
          <Rocket className="w-12 h-12 text-orange-400" />
          <div>
            <div className="text-sm text-orange-400 font-semibold uppercase tracking-wider">🚀 Vers l'Orbite</div>
            <h2 className="text-4xl font-bold">Les Lanceurs : Défis et Innovation</h2>
          </div>
        </div>

        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/20">
          <AvatarGuide lines={ROCKET_LINES} interval={4000} />
        </div>

        {/* Introduction : comment on lance des satellites */}
        <div className="mb-8 rounded-2xl border border-orange-500/20 bg-white/4 overflow-hidden">
          <div className="px-6 pt-6 pb-5">
            <h3 className="text-2xl font-bold text-white mb-4">Comment on envoie un satellite dans l'espace ?</h3>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Pour placer un satellite en orbite, il faut lui faire atteindre une vitesse de <span className="text-orange-300 font-semibold">28 000 km/h</span> — environ 25 fois la vitesse d'une balle de fusil. La seule machine capable de cela, c'est un <span className="text-orange-300 font-semibold">lanceur</span> : c'est le vrai nom scientifique de ce qu'on appelle souvent « fusée ».
              </p>
              <p>
                Un lanceur fonctionne par étages : chaque étage brûle son carburant puis se détache pour alléger le reste. Moins de masse à emporter, plus on peut aller vite et haut.
              </p>
            </div>
          </div>

          {/* Chiffres clés */}
          <div className="grid grid-cols-3 divide-x divide-white/8 border-t border-white/8">
            {[
              { value: '28 000', unit: 'km/h', label: 'Vitesse orbitale minimale' },
              { value: '600+', unit: 'personnes', label: 'Sur le chantier de construction' },
              { value: '6', unit: 'pays', label: 'Contribuent à Ariane 6' },
            ].map(({ value, unit, label }) => (
              <div key={label} className="px-5 py-4 text-center">
                <p className="text-2xl font-bold text-orange-300">{value} <span className="text-base font-normal text-orange-400/70">{unit}</span></p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{label}</p>
              </div>
            ))}
          </div>

          {/* Organisation industrielle */}
          <div className="border-t border-white/8 px-6 py-5">
            <p className="text-sm text-gray-400 mb-3">
              Ariane 6 est le fruit direct de <span className="text-white font-medium">6 nations européennes</span>. Rien que la construction mobilise plus de 600 personnes sur le chantier, et plusieurs milliers pour la conception. Voici comment ce travail est réparti :
            </p>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <img
                src="https://cnes.fr/sites/default/files/styles/native_format/public/2025-02/ariane-6-organisation-industrielle.png?itok=PAgtKtio"
                alt="Organisation industrielle d'Ariane 6 — répartition entre les pays européens"
                className="w-full object-contain bg-white"
              />
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">Source : CNES — Organisation industrielle Ariane 6</p>
          </div>
        </div>

        <div className="mb-8">
          <Ariane6Diagram />
        </div>

        {/* Défis Techniques Majeurs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Les Défis Techniques Majeurs</h3>
          <p className="text-gray-300 mb-6">
            Sélectionnez un défi pour découvrir comment les ingénieurs le résolvent :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {challenges.map((challenge, index) => (
              <button
                key={index}
                onClick={() => handleChallengeSelect(index)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedChallenge === index
                    ? 'border-orange-400 bg-orange-500/20 scale-105'
                    : 'border-white/10 bg-white/5 hover:border-orange-400/50 hover:bg-white/10'
                }`}
              >
                <h4 className="font-bold text-lg mb-2">{challenge.name}</h4>
                <p className="text-sm text-gray-400">{challenge.problem}</p>
              </button>
            ))}
          </div>

          {selectedChallenge !== null && (
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-orange-400 mb-2">Solution Actuelle</h4>
                <p className="text-gray-200">{challenges[selectedChallenge].solution}</p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-400 mb-2">Le Saviez-vous ?</h4>
                <p className="text-gray-200">{challenges[selectedChallenge].innovation}</p>
              </div>
              {challenges[selectedChallenge].funFact && (
                <div className="bg-orange-500/10 border border-orange-400/20 rounded-lg p-4">
                  <p className="text-orange-100">{challenges[selectedChallenge].funFact}</p>
                </div>
              )}
              {challenges[selectedChallenge].videoTitle && (
                <div>
                  <h4 className="font-semibold text-orange-400 mb-3">{challenges[selectedChallenge].videoTitle}</h4>
                  {challenges[selectedChallenge].videoUrl ? (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={challenges[selectedChallenge].videoUrl}
                        title="Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-8 text-center">
                      <p className="text-gray-400 italic">Vidéo à venir</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Salles Blanches */}
        <div className="mb-8 rounded-2xl border border-sky-500/20 bg-white/4 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.578 1.578A2.25 2.25 0 0116.5 18h-9a2.25 2.25 0 01-1.59-.659L3.8 15m16 0l-2.07-2.07M3.8 15l2.07-2.07" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Les Salles Blanches</h3>
            </div>
            <p className="text-gray-300 leading-relaxed mb-3">
              Avant de voir la fusée décoller, chaque satellite a été assemblé dans un endroit très particulier : la <span className="text-sky-300 font-semibold">salle blanche</span>. C'est une salle dont l'air est filtré en permanence — bien plus propre qu'un bloc opératoire — où les ingénieurs travaillent en combinaison intégrale pour ne laisser ni poussière, ni cheveu, ni particule de peau.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Mais la poussière n'est pas le seul ennemi. L'<span className="text-sky-300 font-semibold">électricité statique</span> est tout aussi dangereuse : en frottant ta main sur un pull en laine, tu génères une décharge de plusieurs milliers de volts. Pour un humain, c'est juste une petite piqûre. Pour un composant électronique de satellite, c'est la destruction instantanée. C'est pourquoi tout dans la salle blanche est relié à la terre, et les techniciens portent des bracelets antistatiques en permanence.
            </p>
          </div>

          {/* Galerie photos */}
          <div className="border-t border-white/8 px-6 py-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Photos — Salles blanches ESA / Airbus</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl overflow-hidden border border-white/8 bg-slate-900 aspect-video">
                <img
                  src="https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/09/formal_opening_of_estec_s_fv_cleanroom/24451621-1-eng-GB/Formal_opening_of_ESTEC_s_FV_cleanroom.jpg"
                  alt="Salle blanche ESTEC — ESA"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden border border-white/8 bg-slate-900 aspect-video">
                <img
                  src="https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2014/01/life_physical_sciences_life_support_laboratory_clean_room/13476523-1-eng-GB/Life_Physical_Sciences_Life_Support_Laboratory_clean_room.jpg"
                  alt="Technicien en combinaison salle blanche — ESA ESTEC"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden border border-white/8 bg-slate-900 aspect-video">
                <img
                  src="https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2021/10/webb_telescope_in_clean_room_at_europe_s_spaceport3/23733885-2-eng-GB/Webb_telescope_in_clean_room_at_Europe_s_Spaceport.jpg"
                  alt="Télescope James Webb en salle blanche — Kourou"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden border border-white/8 bg-slate-900 aspect-video">
                <img
                  src="https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/09/esa_s_test_centre_expands/24451576-1-eng-GB/ESA_s_Test_Centre_expands.jpg"
                  alt="Grande salle blanche ESA Test Centre — ESTEC"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-right">Sources : ESA / Airbus Defence & Space</p>
          </div>

          {/* Règles */}
          <div className="border-t border-white/8 px-6 py-5">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-4">Pourquoi autant de précautions ?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '⚡', rule: 'Électricité statique', detail: 'En te frottant sur de la moquette, tu génères ~3 000 V. Un circuit de satellite supporte moins de 5 V avant d\'être détruit définitivement.' },
                { icon: '🧤', rule: 'Combinaison antistatique', detail: 'La combinaison, les gants et le bracelet de poignet sont conducteurs pour évacuer en permanence toute charge électrique vers la terre.' },
                { icon: '💨', rule: 'Sas de décontamination', detail: 'Douche d\'air comprimé à l\'entrée : elle chasse les particules accrochées à la combinaison avant d\'entrer.' },
                { icon: '📋', rule: 'Traçabilité de chaque outil', detail: 'Chaque tournevis, chaque boulon entrant est répertorié. Rien ne doit être oublié à l\'intérieur du satellite.' },
                { icon: '🌡️', rule: 'Température et humidité fixes', detail: '21 °C, humidité 45 % — les matériaux se dilatent avec la chaleur et l\'humidité favorise les courts-circuits.' },
                { icon: '🚫', rule: 'Zéro maquillage ni parfum', detail: 'Les substances chimiques volatiles se déposent sur les optiques et les capteurs, les rendant inutilisables.' },
              ].map(({ icon, rule, detail }) => (
                <div key={rule} className="flex gap-3 bg-white/4 border border-white/8 rounded-xl p-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{rule}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chiffres clés */}
          <div className="grid grid-cols-3 divide-x divide-white/8 border-t border-white/8">
            {[
              { value: '3 000 V', label: 'Charge statique d\'un frottement ordinaire' },
              { value: '< 5 V', label: 'Ce que supporte un circuit satellite' },
              { value: '20×', label: 'Plus propre qu\'un bloc opératoire' },
            ].map(({ value, label }) => (
              <div key={label} className="px-5 py-4 text-center">
                <p className="text-xl font-bold text-sky-300">{value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Simulateur de Mission */}
        <div className="mb-4">
          <MissionSimulator />
        </div>

        {/* Video replay */}
        <div className="mb-8 rounded-xl overflow-hidden border border-white/10">
          <div className="px-5 py-3 bg-white/4 border-b border-white/8 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-red-400 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">Replay — Vrai lancement Ariane 6 · VA262</p>
          </div>
          <div className="bg-slate-950 px-5 py-3 border-b border-white/8">
            <p className="text-sm text-gray-300 leading-relaxed">
              Ecoute les commentateurs, les opérateurs annonçant la trajectoire nominale et regarde un vrai lancement Ariane 6 !
            </p>
          </div>
          {/* Timestamps */}
          <div className="bg-slate-950 px-5 py-3 border-b border-white/8">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Étapes clés de la mission</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Décollage',            t: 1805, tag: 'T+0:00',   color: 'text-amber-400  border-amber-500/30  bg-amber-500/10'  },
                { label: 'Séparation boosters',  t: 2024, tag: 'T+3:39',   color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
                { label: 'Largage coiffe',       t: 2077, tag: 'T+4:32',   color: 'text-sky-400    border-sky-500/30    bg-sky-500/10'    },
                { label: 'Coupure Vulcain',      t: 2340, tag: 'T+8:55',   color: 'text-red-400    border-red-500/30    bg-red-500/10'    },
                { label: 'Séparation étages',    t: 2345, tag: 'T+9:00',   color: 'text-rose-400   border-rose-500/30   bg-rose-500/10'   },
                { label: 'Allumage HM7B',        t: 2350, tag: 'T+9:05',   color: 'text-cyan-400   border-cyan-500/30   bg-cyan-500/10'   },
                { label: 'Orbite de transfert',  t: 2915, tag: 'T+18:30',  color: 'text-blue-400   border-blue-500/30   bg-blue-500/10'   },
                { label: 'Rallumage Vinci',      t: 5940, tag: 'T+1h14:55', color: 'text-violet-400 border-violet-500/30 bg-violet-500/10' },
                { label: 'Déploiement satellites', t: 7200, tag: 'T+1h31:55', color: 'text-green-400  border-green-500/30  bg-green-500/10'  },
              ].map(({ label, t, tag, color }) => (
                <a
                  key={t}
                  href={`https://www.youtube.com/watch?v=DhxJ6Z7u-YU&t=${t}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-opacity hover:opacity-80 ${color}`}
                >
                  <span className="font-mono opacity-70">{tag}</span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/DhxJ6Z7u-YU?start=1805"
              title="Lancement Ariane 6 — Replay rideshare VA262"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <Quiz
          questions={quizQuestions}
          onScoreUpdate={handleQuizScoreUpdate}
          onComplete={handleQuizComplete}
        />

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mt-8">
          <h3 className="text-2xl font-semibold mb-6">Votre Réflexion</h3>

          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">
              Selon vous, quel est le défi le plus impressionnant à surmonter pour construire un lanceur, et pourquoi ?
            </label>
            <textarea
              value={responses['reflection'] || ''}
              onChange={(e) => handleResponseChange('reflection', e.target.value)}
              placeholder="Partagez vos réflexions sur l'ingénierie des lanceurs..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
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
                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'
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
                Continuer vers l'Orbite 🛰️
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
