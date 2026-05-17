import { useState, useRef } from 'react';
import { CheckCircle, XCircle, RotateCcw, ChevronDown, ChevronUp, Info, Trophy, Zap } from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────── */

export interface SatelliteData {
  id: string;
  label: string;
  shortLabel: string;
  orbit: string;
  mass: string;    // kg
  size: string;    // e.g. "3.5 × 2.1 m"
  lifetime: string;
  mission: string;
  complexity: number; // 1-5
  examples: string;
  color: string;
  accentColor: string;
  description: string;
  funFact: string;
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
  },
];

/* ─── Visual satellite renderers (pure CSS/SVG) ─────────────── */

function GeoTelecomSVG({ size = 200 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 180" width={size} height={size * 0.9} className="drop-shadow-lg">
      {/* Main bus */}
      <rect x="70" y="50" width="60" height="80" rx="4" fill="#1e4060" stroke="#0ea5e9" strokeWidth="1.5" />
      <rect x="73" y="53" width="54" height="74" rx="2" fill="#0c2d48" />
      {/* Solar panel left */}
      <rect x="5" y="60" width="60" height="18" rx="3" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1" />
      <line x1="15" y1="60" x2="15" y2="78" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      <line x1="25" y1="60" x2="25" y2="78" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      <line x1="35" y1="60" x2="35" y2="78" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      <line x1="45" y1="60" x2="45" y2="78" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      <line x1="55" y1="60" x2="55" y2="78" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      {/* Solar panel right */}
      <rect x="135" y="60" width="60" height="18" rx="3" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1" />
      <line x1="145" y1="60" x2="145" y2="78" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      <line x1="155" y1="60" x2="155" y2="78" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      <line x1="165" y1="60" x2="165" y2="78" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      <line x1="175" y1="60" x2="175" y2="78" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      <line x1="185" y1="60" x2="185" y2="78" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
      {/* Antenna dish */}
      <ellipse cx="100" cy="42" rx="22" ry="10" fill="#2d6a9f" stroke="#38bdf8" strokeWidth="1.5" />
      <ellipse cx="100" cy="42" rx="15" ry="7" fill="#1e4060" stroke="#38bdf8" strokeWidth="0.5" />
      <line x1="100" y1="42" x2="100" y2="52" stroke="#38bdf8" strokeWidth="2" />
      {/* Side reflectors */}
      <ellipse cx="80" cy="138" rx="10" ry="5" fill="#1a3a5c" stroke="#0ea5e9" strokeWidth="1" transform="rotate(-15, 80, 138)" />
      <ellipse cx="120" cy="138" rx="10" ry="5" fill="#1a3a5c" stroke="#0ea5e9" strokeWidth="1" transform="rotate(15, 120, 138)" />
      {/* Panel connectors */}
      <line x1="65" y1="69" x2="70" y2="69" stroke="#38bdf8" strokeWidth="2" />
      <line x1="130" y1="69" x2="135" y2="69" stroke="#38bdf8" strokeWidth="2" />
      {/* Body detail */}
      <rect x="80" y="65" width="40" height="8" rx="1" fill="#0a1f30" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.8" />
      <rect x="80" y="80" width="40" height="8" rx="1" fill="#0a1f30" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.8" />
      <circle cx="95" cy="100" r="3" fill="#0ea5e9" opacity="0.7" />
      <circle cx="105" cy="100" r="3" fill="#0ea5e9" opacity="0.7" />
      {/* Thruster */}
      <rect x="88" y="128" width="24" height="6" rx="2" fill="#1a4060" stroke="#38bdf8" strokeWidth="1" />
      <polygon points="94,134 106,134 102,142 98,142" fill="#0e3050" stroke="#38bdf8" strokeWidth="0.8" />
    </svg>
  );
}

function ScientificSVG({ size = 200 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 180" width={size} height={size * 0.9} className="drop-shadow-lg">
      {/* Main bus - hexagonal-ish body */}
      <polygon points="100,30 135,50 135,120 100,140 65,120 65,50" fill="#0d3825" stroke="#10b981" strokeWidth="1.5" />
      <polygon points="100,38 128,55 128,113 100,130 72,113 72,55" fill="#072a1a" />
      {/* Solar panel left — angled */}
      <rect x="8" y="55" width="52" height="22" rx="3" fill="#0d3825" stroke="#34d399" strokeWidth="1" transform="rotate(-8, 34, 66)" />
      <line x1="18" y1="52" x2="16" y2="74" stroke="#34d399" strokeWidth="0.5" opacity="0.5" />
      <line x1="30" y1="51" x2="28" y2="73" stroke="#34d399" strokeWidth="0.5" opacity="0.5" />
      <line x1="42" y1="50" x2="40" y2="72" stroke="#34d399" strokeWidth="0.5" opacity="0.5" />
      <line x1="54" y1="49" x2="52" y2="71" stroke="#34d399" strokeWidth="0.5" opacity="0.5" />
      {/* Solar panel right */}
      <rect x="140" y="55" width="52" height="22" rx="3" fill="#0d3825" stroke="#34d399" strokeWidth="1" transform="rotate(8, 166, 66)" />
      <line x1="150" y1="49" x2="152" y2="71" stroke="#34d399" strokeWidth="0.5" opacity="0.5" />
      <line x1="162" y1="50" x2="164" y2="72" stroke="#34d399" strokeWidth="0.5" opacity="0.5" />
      <line x1="174" y1="51" x2="176" y2="73" stroke="#34d399" strokeWidth="0.5" opacity="0.5" />
      <line x1="184" y1="53" x2="186" y2="74" stroke="#34d399" strokeWidth="0.5" opacity="0.5" />
      {/* Main instrument (radar altimeter) */}
      <rect x="82" y="22" width="36" height="12" rx="2" fill="#0d3825" stroke="#10b981" strokeWidth="1.5" />
      <rect x="85" y="24" width="30" height="8" fill="#06231a" />
      <line x1="90" y1="28" x2="110" y2="28" stroke="#10b981" strokeWidth="1" opacity="0.7" />
      {/* Star tracker */}
      <circle cx="78" cy="55" r="5" fill="#0d3825" stroke="#34d399" strokeWidth="1" />
      <circle cx="78" cy="55" r="2" fill="#34d399" opacity="0.8" />
      {/* Body instruments grid */}
      <rect x="78" y="65" width="44" height="6" rx="1" fill="#07200f" stroke="#10b981" strokeWidth="0.5" opacity="0.8" />
      <rect x="78" y="78" width="44" height="6" rx="1" fill="#07200f" stroke="#10b981" strokeWidth="0.5" opacity="0.8" />
      <rect x="78" y="91" width="44" height="6" rx="1" fill="#07200f" stroke="#10b981" strokeWidth="0.5" opacity="0.8" />
      {/* Thruster bottom */}
      <ellipse cx="100" cy="140" rx="12" ry="5" fill="#0d3825" stroke="#34d399" strokeWidth="1" />
      <polygon points="94,144 106,144 103,155 97,155" fill="#072a1a" stroke="#34d399" strokeWidth="0.8" />
      {/* Connector arms */}
      <line x1="60" y1="69" x2="65" y2="69" stroke="#34d399" strokeWidth="2" />
      <line x1="135" y1="69" x2="140" y2="69" stroke="#34d399" strokeWidth="2" />
    </svg>
  );
}

function CubeSatSVG({ size = 200 }: { size?: number }) {
  // Scale down for realism (CubeSat is TINY)
  const scale = size * 0.45;
  const offset = (size - scale) / 2;
  return (
    <svg viewBox="0 0 200 180" width={size} height={size * 0.9} className="drop-shadow-lg">
      {/* Isometric cube body */}
      <g transform={`translate(${50 + (200 - scale) / 2 - 50}, ${20 + (180 - scale * 0.9) / 2 - 20})`}>
        {/* Top face */}
        <polygon points={`${scale*0.5},0 ${scale},${scale*0.25} ${scale*0.5},${scale*0.5} 0,${scale*0.25}`}
          fill="#3d2a00" stroke="#fbbf24" strokeWidth="1.5" />
        {/* Left face */}
        <polygon points={`0,${scale*0.25} ${scale*0.5},${scale*0.5} ${scale*0.5},${scale} 0,${scale*0.75}`}
          fill="#2a1d00" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Right face */}
        <polygon points={`${scale*0.5},${scale*0.5} ${scale},${scale*0.25} ${scale},${scale*0.75} ${scale*0.5},${scale}`}
          fill="#4d3500" stroke="#fbbf24" strokeWidth="1.5" />
        {/* Grid on top face */}
        <line x1={scale*0.25} y1={scale*0.125} x2={scale*0.75} y2={scale*0.375} stroke="#fbbf24" strokeWidth="0.5" opacity="0.4" />
        <line x1={scale*0.5} y1={0} x2={scale*0.5} y2={scale*0.5} stroke="#fbbf24" strokeWidth="0.5" opacity="0.4" />
        {/* PCB detail left face */}
        <line x1={scale*0.05} y1={scale*0.45} x2={scale*0.45} y2={scale*0.7} stroke="#f59e0b" strokeWidth="0.5" opacity="0.3" />
        <line x1={scale*0.05} y1={scale*0.55} x2={scale*0.45} y2={scale*0.8} stroke="#f59e0b" strokeWidth="0.5" opacity="0.3" />
        <circle cx={scale*0.15} cy={scale*0.6} r={scale*0.03} fill="#fbbf24" opacity="0.7" />
        <circle cx={scale*0.3} cy={scale*0.68} r={scale*0.03} fill="#fbbf24" opacity="0.7" />
        {/* Solar cells right face */}
        <rect x={scale*0.52} y={scale*0.53} width={scale*0.1} height={scale*0.08} rx="1" fill="#1a1000" stroke="#fbbf24" strokeWidth="0.5" />
        <rect x={scale*0.65} y={scale*0.47} width={scale*0.1} height={scale*0.08} rx="1" fill="#1a1000" stroke="#fbbf24" strokeWidth="0.5" />
        <rect x={scale*0.52} y={scale*0.65} width={scale*0.1} height={scale*0.08} rx="1" fill="#1a1000" stroke="#fbbf24" strokeWidth="0.5" />
        <rect x={scale*0.65} y={scale*0.59} width={scale*0.1} height={scale*0.08} rx="1" fill="#1a1000" stroke="#fbbf24" strokeWidth="0.5" />
        {/* Tiny antenna */}
        <line x1={scale*0.5} y1={0} x2={scale*0.5} y2={-scale*0.2} stroke="#fbbf24" strokeWidth="1" />
        <circle cx={scale*0.5} cy={-scale*0.2} r={2} fill="#fbbf24" />
      </g>
      {/* Size indicator label */}
      <text x="100" y="168" textAnchor="middle" fill="#fbbf2480" fontSize="9" fontFamily="monospace">10 cm × 10 cm × 10 cm</text>
    </svg>
  );
}

function StarlinkSVG({ size = 200 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 180" width={size} height={size * 0.9} className="drop-shadow-lg">
      {/* Flat body (Starlink is very flat) */}
      <rect x="55" y="70" width="90" height="50" rx="6" fill="#1a1030" stroke="#a78bfa" strokeWidth="1.5" />
      <rect x="58" y="73" width="84" height="44" rx="4" fill="#110a24" />
      {/* Single large solar panel */}
      <rect x="15" y="78" width="170" height="34" rx="4" fill="#1a1030" stroke="#8b5cf6" strokeWidth="1" />
      {/* Solar cells pattern */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={18 + i * 20} y={80} width="17" height="30" rx="1" fill="#0d0820" stroke="#7c3aed" strokeWidth="0.5" />
      ))}
      {/* Phased array antennas (flat tiles) */}
      <rect x="62" y="76" width="25" height="18" rx="2" fill="#0d0820" stroke="#a78bfa" strokeWidth="0.8" />
      <rect x="90" y="76" width="25" height="18" rx="2" fill="#0d0820" stroke="#a78bfa" strokeWidth="0.8" />
      <rect x="118" y="76" width="25" height="18" rx="2" fill="#0d0820" stroke="#a78bfa" strokeWidth="0.8" />
      {/* Dots on antenna tiles */}
      {[70, 98, 126].map(x => (
        <g key={x}>
          <circle cx={x} cy={82} r={1.5} fill="#a78bfa" opacity="0.6" />
          <circle cx={x + 6} cy={82} r={1.5} fill="#a78bfa" opacity="0.6" />
          <circle cx={x + 12} cy={82} r={1.5} fill="#a78bfa" opacity="0.6" />
          <circle cx={x} cy={88} r={1.5} fill="#a78bfa" opacity="0.6" />
          <circle cx={x + 6} cy={88} r={1.5} fill="#a78bfa" opacity="0.6" />
          <circle cx={x + 12} cy={88} r={1.5} fill="#a78bfa" opacity="0.6" />
        </g>
      ))}
      {/* Hall thruster (ion) */}
      <circle cx="100" cy="124" r="6" fill="#1a1030" stroke="#8b5cf6" strokeWidth="1" />
      <circle cx="100" cy="124" r="3" fill="#7c3aed" opacity="0.7" />
      {/* Body labels */}
      <rect x="62" y="100" width="76" height="8" rx="1" fill="#0d0820" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.7" />
      <rect x="62" y="111" width="76" height="5" rx="1" fill="#0d0820" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.5" />
      {/* SpaceX logo text placeholder */}
      <text x="100" y="108" textAnchor="middle" fill="#a78bfa" fontSize="6" fontFamily="monospace" opacity="0.8">STARLINK</text>
    </svg>
  );
}

const SATELLITE_SVGS: Record<string, (props: { size?: number }) => JSX.Element> = {
  geo_telecom: GeoTelecomSVG,
  scientific_cnes: ScientificSVG,
  cubesat: CubeSatSVG,
  starlink: StarlinkSVG,
};

/* ─── Comparison bar ─────────────────────────────────────────── */

function ComplexityBar({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`h-2 w-4 rounded-sm transition-all ${i < value ? 'bg-teal-400' : 'bg-white/10'}`} />
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

/* ─── Scale comparison (visual size) ────────────────────────── */

function ScaleComparison() {
  // relative sizes in pixels for visual representation
  const items = [
    { id: 'geo_telecom', label: 'GEO Télécom', width: 160, color: '#0ea5e9', detail: '~8 m (corps + antennes)' },
    { id: 'scientific_cnes', label: 'Scientifique', width: 100, color: '#10b981', detail: '~3–5 m' },
    { id: 'starlink', label: 'Starlink', width: 72, color: '#8b5cf6', detail: '~3 m (panneau déployé)' },
    { id: 'cubesat', label: 'CubeSat', width: 16, color: '#f59e0b', detail: '10 cm' },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h4 className="text-sm font-semibold text-gray-300 mb-1 flex items-center gap-2">
        <span>📏</span> Comparaison de taille relative
      </h4>
      <p className="text-xs text-gray-500 mb-5">Les rectangles sont proportionnels à la taille réelle des satellites.</p>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-24 text-right text-xs text-gray-400 flex-shrink-0">{item.label}</div>
            <div className="flex items-center gap-2">
              <div
                className="h-8 rounded flex-shrink-0 flex items-center justify-center"
                style={{ width: item.width, backgroundColor: item.color + '30', border: `1px solid ${item.color}60` }}
              />
              <span className="text-xs text-gray-500">{item.detail}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-4">* Un humain mesure ~1.75 m — le GEO est plus grand qu'un bus scolaire !</p>
    </div>
  );
}

/* ─── Main game component ─────────────────────────────────────── */

interface SatelliteLabelGameProps {
  onComplete?: () => void;
}

export function SatelliteLabelGame({ onComplete }: SatelliteLabelGameProps) {
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
  const [showScale, setShowScale] = useState(false);
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

  const handleCheck = () => setChecked(true);

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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-sm font-semibold mb-4">
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
          const SvgComp = SATELLITE_SVGS[sat.id];
          const slotLabel = slots[i];
          const slotSat = slotLabel ? SATELLITES.find(s => s.id === slotLabel) : null;

          return (
            <div key={sat.id} className="flex flex-col items-center gap-3">
              {/* Satellite visual */}
              <button
                onClick={() => setRevealedCard(revealedCard === sat.id ? null : sat.id)}
                className="w-full bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-center mb-2">
                  <SvgComp size={140} />
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 group-hover:text-gray-400">
                  <Info className="w-3 h-3" /> fiche info
                </div>
              </button>

              {/* Info card (revealed on click, only after checking) */}
              {revealedCard === sat.id && checked && (
                <div
                  className="w-full rounded-xl p-4 border text-xs space-y-1.5 text-left"
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
                    ? 'border-teal-400/40 bg-teal-500/10'
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
              ? 'bg-teal-500 hover:bg-teal-400 text-white hover:scale-105 shadow-lg shadow-teal-500/20'
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
            : 'bg-amber-500/10 border-amber-500/30'
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
              <p className="text-lg font-bold text-amber-400">{correctCount} / {SATELLITES.length} correct{correctCount > 1 ? 's' : ''}</p>
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

        <button
          onClick={() => setShowScale(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl transition-all text-sm font-medium text-gray-300 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <span>📏</span> Voir la comparaison de taille
          </span>
          {showScale ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showScale && <ScaleComparison />}
      </div>

      {/* Fun facts strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SATELLITES.map(sat => (
          <div
            key={sat.id}
            className="rounded-xl p-4 border text-sm"
            style={{ backgroundColor: sat.color + '0d', borderColor: sat.color + '30' }}
          >
            <p className="font-semibold mb-1" style={{ color: sat.accentColor }}>{sat.shortLabel}</p>
            <p className="text-gray-300 text-xs leading-relaxed">{sat.funFact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
