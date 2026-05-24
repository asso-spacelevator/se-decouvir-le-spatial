import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { Quiz } from './Quiz';
import { Ariane6Diagram } from './Ariane6Diagram';
import { MissionSimulator } from './MissionSimulator';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterShell, ChapterRecap } from './ChapterShell';

const TOTAL_CHAPTERS = 7;

interface RocketSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

const challenges = [
  {
    name: 'Températures Extrêmes',
    problem: "Les moteurs de lanceur peuvent atteindre 3 000 °C, tandis que l'espace oscille entre -150 °C et +150 °C.",
    solution: "Utilisation de matériaux composites céramiques ultra-résistants et de systèmes de refroidissement actifs avec circulation d'hydrogène liquide.",
    innovation: "Les boucliers thermiques modernes supportent des gradients de 3 000 °C sur quelques centimètres d'épaisseur.",
    funFact: "Le nez d'un lanceur lors de la rentrée atmosphérique chauffe tellement qu'il crée un plasma — un quatrième état de la matière — qui bloque temporairement les communications radio.",
  },
  {
    name: 'Puissance Colossale',
    problem: "Il faut générer plus de 1 000 tonnes de poussée pour vaincre la gravité terrestre.",
    solution: "Moteurs à combustion d'hydrogène et oxygène liquides, brûlant 300 kg de carburant par seconde.",
    innovation: "Un seul moteur Vulcain 2.1 produit une puissance équivalente à 1 500 voitures de F1 combinées.",
    funFact: "Si on pouvait canaliser toute la puissance d'un moteur de lanceur dans une ampoule, elle brillerait 190 fois plus fort que le Soleil vu depuis la Terre.",
  },
  {
    name: 'Précision Absolue',
    problem: "Une erreur de 0,1° lors du lancement peut manquer la cible orbitale de milliers de kilomètres.",
    solution: "Systèmes de guidage inertiel couplés au GPS, avec corrections en temps réel toutes les millisecondes.",
    innovation: "Les gyroscopes laser actuels détectent des rotations de l'ordre du milliardième de degré.",
    funFact: "La précision requise est équivalente à lancer une fléchette depuis Paris et toucher le centre d'une cible à New York.",
  },
  {
    name: 'Légèreté Maximale',
    problem: "Chaque kilogramme de structure en trop réduit la charge utile possible.",
    solution: "Alliages aluminium-lithium et composites carbone ultra-légers, avec optimisation par intelligence artificielle.",
    innovation: "Les nouveaux matériaux permettent un rapport résistance/poids 5 fois supérieur à l'acier.",
    funFact: "Économiser 1 kg sur la structure d'un lanceur peut permettre de placer 100 kg supplémentaires en orbite.",
  },
];

const quizQuestions = [
  {
    id: 'rocket_q1',
    question: 'Quelle est la température maximale que peuvent atteindre les moteurs de lanceur ?',
    options: [
      { id: 'a', text: '500 °C', isCorrect: false },
      { id: 'b', text: '1 500 °C', isCorrect: false },
      { id: 'c', text: '3 000 °C', isCorrect: true },
      { id: 'd', text: '5 000 °C', isCorrect: false },
    ],
    explanation: "Les moteurs de lanceur peuvent atteindre 3 000 °C. Des matériaux composites céramiques et des systèmes de refroidissement actifs sont indispensables.",
  },
  {
    id: 'rocket_q2',
    question: "Combien de pays contribuent à la construction d'Ariane 6 ?",
    options: [
      { id: 'a', text: '2', isCorrect: false },
      { id: 'b', text: '4', isCorrect: false },
      { id: 'c', text: '6', isCorrect: true },
      { id: 'd', text: '12', isCorrect: false },
    ],
    explanation: "Ariane 6 est le fruit de la coopération de 6 nations européennes. Plus de 600 personnes travaillent sur le chantier de construction.",
  },
];

const CLEAN_ROOM_RULES = [
  { rule: 'Électricité statique', detail: "En te frottant sur de la moquette, tu génères ~3 000 V. Un circuit satellite supporte moins de 5 V avant destruction." },
  { rule: 'Combinaison antistatique', detail: "La combinaison, les gants et le bracelet sont conducteurs pour évacuer toute charge vers la terre en permanence." },
  { rule: 'Sas de décontamination', detail: "Douche d'air comprimé à l'entrée : elle chasse les particules accrochées à la combinaison." },
  { rule: 'Traçabilité de chaque outil', detail: "Chaque tournevis et boulon entrant est répertorié. Rien ne doit être oublié à l'intérieur du satellite." },
  { rule: 'Température et humidité fixes', detail: "21 °C, humidité 45 % — les matériaux se dilatent avec la chaleur et l'humidité favorise les courts-circuits." },
  { rule: 'Zéro maquillage ni parfum', detail: "Les substances chimiques volatiles se déposent sur les optiques et capteurs, les rendant inutilisables." },
];

export function RocketSection({ onComplete, onHome }: RocketSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [chapter, setChapter] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    (async () => {
      const r = await getResponses('rockets');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.selectedChallenge) setSelectedChallenge(parseInt(r.selectedChallenge, 10));
      if (r.quizCompleted === 'true') setQuizCompleted(true);
      if (r.reflection) setReflection(r.reflection);
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('rockets', 'chapter', String(i));
  };

  const handleChallengeSelect = async (i: number) => {
    setSelectedChallenge(i);
    if (hydrated) await saveResponse('rockets', 'selectedChallenge', String(i));
  };

  const handleReflectionChange = async (v: string) => {
    setReflection(v);
    if (hydrated) await saveResponse('rockets', 'reflection', v);
  };

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    if (hydrated) await saveResponse('rockets', 'quizCompleted', 'true');
    goTo(6);
  };

  return (
    <SectionCanvas>
      <SectionTopBar label="Session 1 · Chapitre 2 sur 3 · Lanceurs et Ariane 6" onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} onGoTo={goTo} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Ch 1 : La fusée pas à pas ── */}
        {chapter === 0 && (
          <ChapterShell
            kicker="01" title="La fusée pas à pas"
            titlePrefix="Comment on envoie un satellite"
            titleAccent="dans l'espace ?"
            lede="Pour placer un satellite en orbite, il faut lui faire atteindre 28 000 km/h — 25 fois la vitesse d'une balle de fusil. La seule machine capable de cela est un lanceur."
            onPrev={null} onNext={() => goTo(1)} nextEnabled={true}
            nextLabel="Continue · Ariane 6 décortiquée →"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
              <div className="px-6 pt-6 pb-5 space-y-3 text-white/75 leading-relaxed text-[15px]">
                <p>Un lanceur fonctionne par <span className="text-white font-semibold">étages</span> : chaque étage brûle son carburant puis se détache pour alléger le reste. Moins de masse à emporter, plus on peut aller vite et haut.</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
                {[
                  { value: '28 000', unit: 'km/h', label: 'Vitesse orbitale minimale' },
                  { value: '600+', unit: 'personnes', label: 'Sur le chantier de construction' },
                  { value: '6', unit: 'pays', label: 'Contribuent à Ariane 6' },
                ].map(({ value, unit, label }) => (
                  <div key={label} className="px-5 py-4 text-center">
                    <p className="text-[28px] font-bold text-magenta leading-none">{value} <span className="text-[13px] font-normal text-magenta/70">{unit}</span></p>
                    <p className="text-[11px] text-white/45 mt-1.5 leading-snug uppercase tracking-[0.08em]">{label}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 px-6 py-5">
                <p className="text-[13px] text-white/55 mb-3">Ariane 6 est le fruit direct de <span className="text-white font-medium">6 nations européennes</span>. Voici comment le travail est réparti :</p>
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <img
                    src="https://cnes.fr/sites/default/files/styles/native_format/public/2025-02/ariane-6-organisation-industrielle.png?itok=PAgtKtio"
                    alt="Organisation industrielle Ariane 6"
                    className="w-full object-contain bg-white"
                  />
                </div>
                <p className="text-[11px] italic text-white/35 mt-2 text-center">Source : CNES — Organisation industrielle Ariane 6</p>
              </div>
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 2 : Ariane 6 décortiquée ── */}
        {chapter === 1 && (
          <ChapterShell
            kicker="02" title="Ariane 6 décortiquée"
            titlePrefix="Anatomie du lanceur,"
            titleAccent="de haut en bas."
            lede="Explore chaque composant d'Ariane 6 : étages, moteurs, coiffe. Clique sur les éléments du diagramme pour en savoir plus."
            onPrev={() => goTo(0)} onNext={() => goTo(2)} nextEnabled={true}
            nextLabel="Continue · Les défis de l'ingénieur →"
          >
            <Ariane6Diagram />
          </ChapterShell>
        )}

        {/* ── Ch 3 : Défis techniques ── */}
        {chapter === 2 && (
          <ChapterShell
            kicker="03" title="Les défis de l'ingénieur"
            titlePrefix="Quel problème les équipes ont-elles dû"
            titleAccent="résoudre ?"
            lede="Sélectionne un défi pour découvrir comment les ingénieurs l'ont résolu. Chaque contrainte a généré une innovation qui profite aujourd'hui à d'autres secteurs."
            onPrev={() => goTo(1)} onNext={() => goTo(3)} nextEnabled={selectedChallenge !== null}
            nextLabel={selectedChallenge !== null ? "Continue · Les salles blanches →" : "Sélectionne un défi d'abord"}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => handleChallengeSelect(i)}
                    className={`p-6 rounded-2xl border text-left transition-all ${
                      selectedChallenge === i
                        ? 'border-magenta bg-magenta/10'
                        : 'border-white/10 bg-white/[0.04] hover:border-magenta/50 hover:bg-white/[0.07] hover:-translate-y-0.5'
                    }`}
                  >
                    <h4 className="font-bold text-[17px] mb-2">{c.name}</h4>
                    <p className="text-[13px] text-white/60 leading-[1.5]">{c.problem}</p>
                  </button>
                ))}
              </div>
              {selectedChallenge !== null && (
                <div className="bg-magenta/[0.06] border border-magenta/25 rounded-2xl p-6 space-y-4 animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)]">
                  <div>
                    <h4 className="font-semibold text-magenta text-[11px] uppercase tracking-[0.12em] mb-2">Solution actuelle</h4>
                    <p className="text-white/80 leading-relaxed text-[14px]">{challenges[selectedChallenge].solution}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-magenta text-[11px] uppercase tracking-[0.12em] mb-2">Innovation clé</h4>
                    <p className="text-white/80 leading-relaxed text-[14px]">{challenges[selectedChallenge].innovation}</p>
                  </div>
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4">
                    <p className="text-[13px] text-white/70 leading-[1.55]">{challenges[selectedChallenge].funFact}</p>
                  </div>
                </div>
              )}
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 4 : Salles blanches ── */}
        {chapter === 3 && (
          <ChapterShell
            kicker="04" title="Les salles blanches"
            titlePrefix="Le satellite est assemblé ici,"
            titleAccent="avant le décollage."
            lede="Avant de voir la fusée décoller, chaque satellite a été assemblé dans un endroit très particulier. Plus propre qu'un bloc opératoire, la salle blanche protège les composants de la poussière et de l'électricité statique."
            onPrev={() => goTo(2)} onNext={() => goTo(4)} nextEnabled={true}
            nextLabel="Continue · La séquence de lancement →"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { src: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/09/formal_opening_of_estec_s_fv_cleanroom/24451621-1-eng-GB/Formal_opening_of_ESTEC_s_FV_cleanroom.jpg", alt: "Salle blanche ESTEC — ESA" },
                  { src: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2014/01/life_physical_sciences_life_support_laboratory_clean_room/13476523-1-eng-GB/Life_Physical_Sciences_Life_Support_Laboratory_clean_room.jpg", alt: "Technicien en combinaison — ESA" },
                  { src: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2021/10/webb_telescope_in_clean_room_at_europe_s_spaceport3/23733885-2-eng-GB/Webb_telescope_in_clean_room_at_Europe_s_Spaceport.jpg", alt: "James Webb en salle blanche — Kourou" },
                  { src: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/09/esa_s_test_centre_expands/24451576-1-eng-GB/ESA_s_Test_Centre_expands.jpg", alt: "Grande salle blanche ESA" },
                ].map(({ src, alt }) => (
                  <div key={alt} className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/30">
                    <img src={src} alt={alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] italic text-white/35 text-right">Sources : ESA / Airbus Defence & Space</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLEAN_ROOM_RULES.map(({ rule, detail }) => (
                  <div key={rule} className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
                    <p className="text-[13px] font-semibold text-white mb-1">{rule}</p>
                    <p className="text-[12px] text-white/55 leading-[1.5]">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/10 border border-white/10 rounded-2xl overflow-hidden">
                {[
                  { value: '3 000 V', label: "Charge statique d'un frottement ordinaire" },
                  { value: '< 5 V', label: 'Ce que supporte un circuit satellite' },
                  { value: '20×', label: "Plus propre qu'un bloc opératoire" },
                ].map(({ value, label }) => (
                  <div key={label} className="px-5 py-4 text-center">
                    <p className="text-[22px] font-bold text-magenta">{value}</p>
                    <p className="text-[11px] text-white/45 mt-1 uppercase tracking-[0.08em] leading-snug">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 5 : Séquence de lancement ── */}
        {chapter === 4 && (
          <ChapterShell
            kicker="05" title="La séquence de lancement"
            titlePrefix="Chaque étape compte,"
            titleAccent="de la mise à feu au déploiement."
            lede="Regarde un vrai lancement Ariane 6 (mission VA262) et retrouve les étapes clés. Le simulateur te permet ensuite de revivre chaque décision de mission."
            onPrev={() => goTo(3)} onNext={() => goTo(5)} nextEnabled={true}
            nextLabel="Continue · Quiz éclair →"
          >
            <div className="space-y-6">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <div className="px-5 py-3 bg-white/[0.04] border-b border-white/10 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-magenta/15 border border-magenta/30 grid place-items-center flex-shrink-0">
                    <svg className="w-3 h-3 text-magenta ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <p className="text-[13px] font-semibold">Replay — Vrai lancement Ariane 6 · VA262</p>
                </div>
                <div className="bg-black/40 px-5 py-3 border-b border-white/10">
                  <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-white/40 mb-3">Étapes clés</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Décollage', t: 1805, tag: 'T+0:00' },
                      { label: 'Séparation boosters', t: 2024, tag: 'T+3:39' },
                      { label: 'Largage coiffe', t: 2077, tag: 'T+4:32' },
                      { label: 'Coupure Vulcain', t: 2340, tag: 'T+8:55' },
                      { label: 'Orbite de transfert', t: 2915, tag: 'T+18:30' },
                      { label: 'Déploiement satellites', t: 7200, tag: 'T+1h31:55' },
                    ].map(({ label, t, tag }) => (
                      <a
                        key={t}
                        href={`https://www.youtube.com/watch?v=DhxJ6Z7u-YU&t=${t}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-magenta/30 bg-magenta/10 text-[11px] font-medium text-magenta hover:bg-magenta/20 transition"
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
              <MissionSimulator />
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 6 : Quiz + Réflexion ── */}
        {chapter === 5 && !quizCompleted && (
          <ChapterShell
            kicker="06" title="Quiz éclair"
            titlePrefix="Deux questions pour"
            titleAccent="valider le chapitre."
            lede="Une réponse par question. Pas de mauvaise réponse définitive — l'objectif c'est d'apprendre."
            onPrev={() => goTo(4)} onNext={() => {}} nextEnabled={false}
            nextLabel="Réponds aux questions d'abord"
          >
            <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
          </ChapterShell>
        )}

        {chapter === 5 && quizCompleted && (
          <ChapterShell
            kicker="06" title="Réflexion"
            titlePrefix="Quel est le défi le plus impressionnant"
            titleAccent="à retenir ?"
            lede="Prends un moment pour formuler ta réponse. Elle sera transmise aux équipes de Space Elevator."
            onPrev={() => goTo(4)} onNext={() => goTo(6)} nextEnabled={reflection.trim().length > 0}
            nextLabel={reflection.trim().length > 0 ? "Terminer le chapitre →" : "Écris ta réflexion d'abord"}
          >
            <div>
              <label className="block text-[13px] font-medium text-white/70 mb-3">
                Selon toi, quel est le défi le plus impressionnant à surmonter pour construire un lanceur, et pourquoi ?
              </label>
              <textarea
                value={reflection}
                onChange={e => handleReflectionChange(e.target.value)}
                placeholder="Partage tes réflexions sur l'ingénierie des lanceurs..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 resize-none text-[14px]"
                rows={5}
                maxLength={4000}
              />
              {reflection.trim().length > 0 && (
                <div className="flex items-center gap-2 text-[13px] text-magenta mt-3">
                  <CheckCircle className="w-4 h-4" /> Réflexion enregistrée
                </div>
              )}
            </div>
          </ChapterShell>
        )}

        {/* ── Récap ── */}
        {chapter === 6 && (
          <ChapterRecap
            chapterLabel="Lanceurs"
            summary="Tu as exploré comment on quitte la Terre, les défis techniques des lanceurs, les salles blanches et la séquence d'un vrai lancement Ariane 6."
            stats={[
              { v: selectedChallenge !== null ? challenges[selectedChallenge].name : '—', t: 'défi technique exploré' },
              { v: quizCompleted ? '2 / 2' : '0 / 2', t: 'questions du quiz' },
            ]}
            nextTitle="Réseaux Sociaux"
            nextDesc="Découvre les comptes et ressources pour rester connecté à l'actualité spatiale."
            onContinue={onComplete}
            onPrev={() => goTo(5)}
          />
        )}
      </div>
    </SectionCanvas>
  );
}
