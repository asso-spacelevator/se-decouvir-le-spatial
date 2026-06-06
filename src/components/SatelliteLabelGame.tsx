import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, ChevronDown, ChevronUp, Info, Trophy, Zap } from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────── */

export interface SatelliteData {
  id: string;
  label: string;
  shortLabel: string;
  orbit: string;
  mass: string;
  size: string;
  lifetime: string;
  mission: string;
  complexity: number;
  examples: string;
  color: string;
  accentColor: string;
  description: string;
  funFact: string;
  photo: string;
  credit: string;
}

const SATELLITES: SatelliteData[] = [
  {
    id: 'geo_telecom',
    label: 'Satellite géostationnaire télécom',
    shortLabel: 'GEO Télécom',
    orbit: 'GEO — 35 786 km',
    mass: '4 000 – 7 000 kg',
    size: '5 × 3 m (corps) + 40 m d\'envergure (panneaux)',
    lifetime: '15 – 20 ans',
    mission: 'Diffusion TV, internet haut débit, téléphonie longue distance sur une large zone fixe',
    complexity: 5,
    examples: 'Eutelsat, Astra, SES, Intelsat',
    color: '#0ea5e9',
    accentColor: '#38bdf8',
    description: 'Géant de l\'orbite : immobile dans le ciel, il couvre un tiers de la Terre depuis 36 000 km.',
    funFact: 'Un seul satellite GEO peut remplacer des milliers de stations relais terrestres !',
    photo: 'telecom.jpg',
    credit: '© Thales Alenia Space / E.Briot',
  },
  {
    id: 'scientific_cnes',
    label: 'Satellite scientifique CNES/ESA',
    shortLabel: 'Scientifique',
    orbit: 'LEO/MEO — 400 – 1 400 km',
    mass: '500 – 4 000 kg',
    size: '2 – 5 m selon instrument',
    lifetime: '3 – 10 ans',
    mission: 'Observation de la Terre, climatologie, océanographie, physique fondamentale',
    complexity: 5,
    examples: 'Jason-3, SWOT, SPOT, Sentinel',
    color: '#10b981',
    accentColor: '#34d399',
    description: 'Instrument scientifique de précision : mesure le niveau des océans au millimètre près depuis l\'espace.',
    funFact: 'Jason-3 mesure la hauteur des océans avec une précision de 3 cm depuis 1 300 km d\'altitude !',
    photo: 'scientifique.jpg',
    credit: '© NASA / JPL-Caltech / CNES',
  },
  {
    id: 'cubesat',
    label: 'CubeSat',
    shortLabel: 'CubeSat',
    orbit: 'LEO — 300 – 600 km',
    mass: '1 – 12 kg',
    size: '10 × 10 × 10 cm (1U) à 30 × 20 × 10 cm (3U)',
    lifetime: '1 – 3 ans',
    mission: 'Technologie, éducation, démonstrations, capteurs expérimentaux',
    complexity: 2,
    examples: 'PicSat (LESIA), Eyesat (CNES), QB50',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    description: 'Nanosatellite standardisé : peut être construit par une équipe étudiante en quelques mois.',
    funFact: 'Un CubeSat 1U tient dans la main. Des lycéens français en ont déjà fabriqué et lancé !',
    photo: 'cubesat.jpg',
    credit: '© ESA / illustration',
  },
  {
    id: 'starlink',
    label: 'Starlink (constellation LEO)',
    shortLabel: 'Starlink',
    orbit: 'LEO — 340 – 550 km',
    mass: '295 – 800 kg',
    size: '3.2 × 1.5 m + 1 panneau solaire',
    lifetime: '5 – 7 ans',
    mission: 'Internet haut débit mondial via une constellation de plus de 6 000 satellites',
    complexity: 3,
    examples: 'SpaceX Starlink v1.5, v2 Mini',
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    description: 'Satellite de constellation en série : produit en masse, conçu pour être remplacé régulièrement.',
    funFact: 'SpaceX lance plus de 60 Starlink d\'un coup ! Ils sont visibles en "train" dans le ciel la nuit.',
    photo: 'starlink.avif',
    credit: '© SpaceX',
  },
];

/* ─── Comparison bar ─────────────────────────────────────────── */

function ComplexityBar({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`h-2 w-4 rounded-sm transition-all ${i < value ? 'bg-magenta' : 'bg-white/10'}`} />
      ))}
    </div>
  );
}

function ComparisonPanel({ satellites }: { satellites: SatelliteData[] }) {
  const metrics = [
    { key: 'mass', label: 'Masse', icon: '⚖️' },
    { key: 'size', label: 'Dimensions', icon: '📐' },
    { key: 'lifetime', label: 'Durée de vie', icon: '⏱️' },
    { key: 'orbit', label: 'Orbite', icon: '🌍' },
    { key: 'mission', label: 'Mission', icon: '🎯' },
  ] as const;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-3 text-gray-400 font-medium min-w-[120px]">Critère</th>
              {satellites.map(sat => (
                <th key={sat.id} className="p-3 text-center min-w-[160px]">
                  <span className="font-bold" style={{ color: sat.accentColor }}>{sat.shortLabel}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map(({ key, label, icon }, rowIdx) => (
              <tr key={key} className={rowIdx % 2 === 0 ? 'bg-white/2' : ''}>
                <td className="p-3 text-gray-400 font-medium">
                  <span className="mr-2">{icon}</span>{label}
                </td>
                {satellites.map(sat => (
                  <td key={sat.id} className="p-3 text-center text-gray-200 text-xs leading-relaxed">
                    {sat[key]}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-3 text-gray-400 font-medium"><span className="mr-2">⚙️</span>Complexité</td>
              {satellites.map(sat => (
                <td key={sat.id} className="p-3">
                  <div className="flex justify-center">
                    <ComplexityBar value={sat.complexity} />
                  </div>
                </td>
              ))}
            </tr>
            <tr className="bg-white/2">
              <td className="p-3 text-gray-400 font-medium"><span className="mr-2">📌</span>Exemples</td>
              {satellites.map(sat => (
                <td key={sat.id} className="p-3 text-center text-xs" style={{ color: sat.accentColor }}>
                  {sat.examples}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main game component ─────────────────────────────────────── */

export function SatelliteLabelGame({ onComplete }: { onComplete?: () => void }) {
  // Shuffle satellites order for display
  const [displayOrder] = useState(() => [...SATELLITES].sort(() => Math.random() - 0.5));
  // Shuffle labels for drag
  const [availableLabels, setAvailableLabels] = useState<string[]>(
    () => [...SATELLITES].sort(() => Math.random() - 0.5).map(s => s.id)
  );
  // Slots: display index → assigned satellite id
  const [slots, setSlots] = useState<(string | null)[]>(Array(SATELLITES.length).fill(null));
  const [draggedLabel, setDraggedLabel] = useState<string | null>(null);
  const [draggedFromSlot, setDraggedFromSlot] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [revealedCard, setRevealedCard] = useState<string | null>(null);

  const correctCount = checked
    ? slots.filter((id, i) => id === displayOrder[i].id).length
    : 0;

  const allFilled = slots.every(s => s !== null);

  /* drag handlers */
  const onDragStartLabel = (id: string) => {
    setDraggedLabel(id);
    setDraggedFromSlot(null);
  };

  const onDragStartSlot = (slotIdx: number, id: string) => {
    setDraggedLabel(id);
    setDraggedFromSlot(slotIdx);
  };

  const onDropSlot = (slotIdx: number) => {
    if (!draggedLabel) return;
    const newSlots = [...slots];
    const newLabels = [...availableLabels];

    // Remove from previous slot if dragged from slot
    if (draggedFromSlot !== null) {
      newSlots[draggedFromSlot] = null;
    } else {
      // Remove from available labels
      const li = newLabels.indexOf(draggedLabel);
      if (li >= 0) newLabels.splice(li, 1);
    }

    // If target slot already has a label, return it to available
    if (newSlots[slotIdx]) {
      if (draggedFromSlot !== null) {
        // Swap
        newSlots[draggedFromSlot] = newSlots[slotIdx];
      } else {
        newLabels.push(newSlots[slotIdx]!);
      }
    }

    newSlots[slotIdx] = draggedLabel;
    setSlots(newSlots);
    setAvailableLabels(newLabels);
    setDraggedLabel(null);
    setDraggedFromSlot(null);
    setChecked(false);
  };

  const onDropLabels = () => {
    if (draggedLabel && draggedFromSlot !== null) {
      const newSlots = [...slots];
      newSlots[draggedFromSlot] = null;
      setSlots(newSlots);
      setAvailableLabels(prev => [...prev, draggedLabel!]);
    }
    setDraggedLabel(null);
    setDraggedFromSlot(null);
  };

  const handleCheck = () => {
    setChecked(true);
    onComplete?.();
  };

  const handleReset = () => {
    setSlots(Array(SATELLITES.length).fill(null));
    setAvailableLabels([...SATELLITES].sort(() => Math.random() - 0.5).map(s => s.id));
    setChecked(false);
    setRevealedCard(null);
  };

  const isCorrect = (slotIdx: number) =>
    checked && slots[slotIdx] === displayOrder[slotIdx].id;
  const isWrong = (slotIdx: number) =>
    checked && slots[slotIdx] !== null && slots[slotIdx] !== displayOrder[slotIdx].id;

  const allCorrect = checked && correctCount === SATELLITES.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-magenta/10 border border-magenta/20 rounded-full text-magenta text-sm font-semibold mb-4">
          <Zap className="w-4 h-4" /> Mini-jeu : Identifie les satellites
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Reconnais-tu ces satellites ?</h3>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Glisse les étiquettes sous le bon satellite. Clique sur une fiche pour en savoir plus.
        </p>
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayOrder.map((sat, i) => {
          const slotLabel = slots[i];
          const slotSat = slotLabel ? SATELLITES.find(s => s.id === slotLabel) : null;

          return (
            <div key={sat.id} className="flex flex-col items-center gap-3">
              {/* Satellite visual */}
              <button
                onClick={() => setRevealedCard(revealedCard === sat.id ? null : sat.id)}
                className="w-full bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={`${import.meta.env.BASE_URL}satellites/${sat.photo}`}
                    alt={sat.label}
                    className="w-full h-[140px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {sat.credit && (
                    <p className="absolute bottom-1 right-2 text-[9px] italic text-white/45 leading-none">{sat.credit}</p>
                  )}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 group-hover:text-gray-400 py-2">
                  <Info className="w-3 h-3" /> fiche info
                </div>
              </button>

              {/* Info card: auto-unfold all after check, or show teaser on click before check */}
              {checked && (
                <div
                  className="w-full rounded-xl p-4 border text-xs space-y-1.5 text-left animate-[chapterIn_320ms_cubic-bezier(.2,0,0,1)]"
                  style={{ backgroundColor: sat.color + '15', borderColor: sat.color + '40' }}
                >
                  <p className="font-bold" style={{ color: sat.accentColor }}>{sat.label}</p>
                  <p className="text-gray-300">{sat.description}</p>
                  <p className="text-gray-400 italic">{sat.funFact}</p>
                </div>
              )}
              {revealedCard === sat.id && !checked && (
                <div className="w-full rounded-xl p-3 border border-white/10 bg-white/5 text-xs text-gray-400 text-center">
                  Valide tes réponses pour découvrir les infos !
                </div>
              )}

              {/* Drop slot */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDropSlot(i)}
                className={`w-full min-h-[44px] rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                  isCorrect(i)
                    ? 'border-green-500/60 bg-green-500/10'
                    : isWrong(i)
                    ? 'border-red-500/60 bg-red-500/10'
                    : slotLabel
                    ? 'border-magenta/40 bg-magenta/10'
                    : 'border-white/15 bg-white/3 hover:border-white/30'
                }`}
              >
                {slotLabel ? (
                  <div
                    draggable
                    onDragStart={() => onDragStartSlot(i, slotLabel)}
                    className="w-full px-2 py-2 flex items-center justify-between gap-2 cursor-grab"
                  >
                    <span className="text-xs font-semibold text-white leading-tight"
                      style={{ color: slotSat?.accentColor }}>
                      {slotSat?.shortLabel}
                    </span>
                    {isCorrect(i) && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                    {isWrong(i) && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                  </div>
                ) : (
                  <span className="text-xs text-gray-600">Dépose ici</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels bank */}
      <div
        className="bg-white/5 border border-white/10 rounded-2xl p-5"
        onDragOver={e => e.preventDefault()}
        onDrop={onDropLabels}
      >
        <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Étiquettes disponibles</p>
        <div className="flex flex-wrap gap-3 min-h-[44px]">
          {availableLabels.map(id => {
            const sat = SATELLITES.find(s => s.id === id)!;
            return (
              <div
                key={id}
                draggable
                onDragStart={() => onDragStartLabel(id)}
                className="px-4 py-2 rounded-xl border cursor-grab select-none text-sm font-semibold hover:scale-105 transition-transform active:scale-95"
                style={{
                  backgroundColor: sat.color + '20',
                  borderColor: sat.color + '50',
                  color: sat.accentColor,
                }}
              >
                {sat.shortLabel}
              </div>
            );
          })}
          {availableLabels.length === 0 && (
            <span className="text-xs text-gray-600 italic">Toutes les étiquettes sont placées</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleCheck}
          disabled={!allFilled || checked}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
            allFilled && !checked
              ? 'bg-magenta hover:bg-magenta-700 text-white hover:scale-105 shadow-lg shadow-magenta/20'
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          Vérifier mes réponses
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-xl font-semibold text-sm border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Recommencer
        </button>
      </div>

      {/* Result banner */}
      {checked && (
        <div className={`rounded-2xl p-5 border text-center transition-all ${
          allCorrect
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-magenta/10 border-magenta/30'
        }`}>
          {allCorrect ? (
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-7 h-7 text-yellow-400" />
              <div>
                <p className="text-lg font-bold text-green-400">Parfait ! 4/4</p>
                <p className="text-sm text-gray-300">Tu connais déjà les grandes familles de satellites !</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-magenta">{correctCount} / {SATELLITES.length} correct{correctCount > 1 ? 's' : ''}</p>
              <p className="text-sm text-gray-300 mt-1">
                Clique sur les satellites pour voir les réponses et en apprendre plus.
              </p>
            </div>
          )}
          {checked && !allCorrect && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              {displayOrder.map((sat, i) => (
                <div key={sat.id} className={`text-xs rounded-lg p-2 border ${
                  slots[i] === sat.id
                    ? 'bg-green-500/10 border-green-500/30 text-green-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  <span className="font-bold">{sat.shortLabel}</span>
                  {slots[i] !== sat.id && (
                    <span className="text-gray-400 block text-[10px]">
                      → {slots[i] ? SATELLITES.find(s => s.id === slots[i])?.shortLabel : 'vide'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comparison toggle */}
      <div className="space-y-3">
        <button
          onClick={() => setShowComparison(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl transition-all text-sm font-medium text-gray-300 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <span>📊</span> Comparer les satellites (masse, taille, durée de vie...)
          </span>
          {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showComparison && <ComparisonPanel satellites={SATELLITES} />}

      </div>
    </div>
  );
}
