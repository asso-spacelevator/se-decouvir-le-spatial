import { useState } from 'react';

interface Part {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  accentColor: string;
  icon: string;
  description: string;
  details: string[];
  stats: { label: string; value: string }[];
}

const PARTS: Part[] = {
  fairing: {
    id: 'fairing',
    label: 'Coiffe (Payload Fairing)',
    shortLabel: 'Coiffe',
    color: '#1e3a5f',
    accentColor: '#60a5fa',
    icon: '🛡️',
    description: 'Carénage aérodynamique protégeant la charge utile pendant la traversée de l\'atmosphère.',
    details: [
      'Protège le satellite des contraintes aérodynamiques et thermiques lors du lancement',
      'Se sépare à environ 110 km d\'altitude quand la pression atmosphérique devient négligeable',
      'Fabriquée en matériaux composites carbone ultra-légers',
      'Deux versions : ø4,5 m (standard) ou ø5,4 m (grande charge utile)',
    ],
    stats: [
      { label: 'Diamètre', value: '4,5 ou 5,4 m' },
      { label: 'Hauteur', value: '~14 m' },
      { label: 'Séparation', value: '~110 km' },
    ],
  },
  payload: {
    id: 'payload',
    label: 'Charge Utile',
    shortLabel: 'Satellite',
    color: '#1a3a2a',
    accentColor: '#34d399',
    icon: '🛰️',
    description: 'Le satellite (ou les satellites) que le lanceur doit placer en orbite.',
    details: [
      'Peut embarquer 1 gros satellite ou plusieurs petits (configuration multi-satellites)',
      'Capacité jusqu\'à 11,5 t en orbite de transfert géostationnaire (GTO)',
      'Jusqu\'à 21,6 t en orbite basse (LEO)',
      'Interfaces mécaniques et électriques standardisées pour s\'adapter à différents clients',
    ],
    stats: [
      { label: 'Max GTO', value: '11,5 t' },
      { label: 'Max LEO', value: '21,6 t' },
      { label: 'Clients', value: 'ESA, commerciaux' },
    ],
  },
  upper: {
    id: 'upper',
    label: 'Étage Supérieur (ULPM)',
    shortLabel: 'Étage sup.',
    color: '#1e2a4a',
    accentColor: '#818cf8',
    icon: '🔵',
    description: 'Étage propulsif assurant la mise en orbite précise avec le moteur Vinci ou HM7B.',
    details: [
      'Motorisé par le Vinci (rallumable) ou le HM7B selon la version (A62 ou A64)',
      'Le Vinci peut se rallumer jusqu\'à 5 fois pour des trajectoires complexes multi-orbites',
      'Brûle de l\'hydrogène et de l\'oxygène liquides (cryotechnique)',
      'C\'est "l\'étage taxi" : il dépose précisément chaque satellite sur son orbite',
    ],
    stats: [
      { label: 'Moteur', value: 'Vinci / HM7B' },
      { label: 'Rallumages', value: 'Jusqu\'à 5×' },
      { label: 'Poussée Vinci', value: '180 kN' },
    ],
  },
  core: {
    id: 'core',
    label: 'Étage Central (EPC)',
    shortLabel: 'Étage central',
    color: '#2a1e1e',
    accentColor: '#f97316',
    icon: '🔴',
    description: 'Corps principal du lanceur avec le moteur Vulcain 2.1 et les réservoirs d\'ergols.',
    details: [
      'Motorisé par le Vulcain 2.1, moteur cryotechnique brûlant H₂/O₂ liquides',
      'Contient ~175 t d\'hydrogène liquide (−253°C) et d\'oxygène liquide (−183°C)',
      'Fonctionne pendant toute la phase de vol atmosphérique (~500 secondes)',
      'Fabriqué par ArianeGroup en Allemagne (corps principal) et en France (moteur)',
    ],
    stats: [
      { label: 'Moteur', value: 'Vulcain 2.1' },
      { label: 'Poussée', value: '137 tf' },
      { label: 'Durée', value: '~470 s' },
    ],
  },
  boosters: {
    id: 'boosters',
    label: 'Boosters (P120C)',
    shortLabel: 'Boosters',
    color: '#2a1a1a',
    accentColor: '#ef4444',
    icon: '🔥',
    description: 'Propulseurs à poudre latéraux offrant la puissance de décollage (0, 2 ou 4 boosters).',
    details: [
      'Version A62 : 2 boosters · Version A64 : 4 boosters (double puissance)',
      'Propergol solide : carburant mélangé à l\'avance, s\'allume en une fraction de seconde',
      'Fournissent l\'essentiel de la poussée lors des 130 premières secondes de vol',
      'Moteur commun avec Vega-C : économies d\'échelle pour l\'Europe spatiale',
    ],
    stats: [
      { label: 'Configuration', value: '0 / 2 / 4' },
      { label: 'Poussée (×2)', value: '~900 tf' },
      { label: 'Combustion', value: '130 s' },
    ],
  },
  nozzle: {
    id: 'nozzle',
    label: 'Tuyère & Vulcain 2.1',
    shortLabel: 'Tuyère',
    color: '#1a1a2a',
    accentColor: '#fbbf24',
    icon: '⚡',
    description: 'Tuyère du moteur principal Vulcain 2.1, chef-d\'œuvre de thermodynamique.',
    details: [
      'Refroidie par circulation d\'hydrogène liquide (refroidissement régénératif)',
      'Température chambre de combustion : ~3 300°C',
      'Expansion des gaz à -2,5 km/s de vitesse d\'éjection',
      'La tuyère est orientable (TVC) pour guider le lanceur pendant le vol',
    ],
    stats: [
      { label: 'T° chambre', value: '~3 300°C' },
      { label: 'Isp (vide)', value: '433 s' },
      { label: 'Matériau', value: 'Acier + composites' },
    ],
  },
} as unknown as Record<string, Part>;

const PARTS_LIST = Object.values(PARTS) as Part[];

// SVG layout constants
const W = 340;
const H = 580;
const CX = W / 2;

// Each part has a y-range in the SVG and a visual shape
type PartShape = {
  id: string;
  // Polygon points for the outline
  points: string;
  labelX: number;
  labelY: number;
  // Exploded offset (dy) when exploded
  dy: number;
};

const BASE_SHAPES: PartShape[] = [
  // Coiffe — top pointy cone
  {
    id: 'fairing',
    points: `${CX},18 ${CX + 38},80 ${CX - 38},80`,
    labelX: CX,
    labelY: 56,
    dy: -90,
  },
  // Satellite inside fairing
  {
    id: 'payload',
    points: `${CX - 32},82 ${CX + 32},82 ${CX + 32},130 ${CX - 32},130`,
    labelX: CX,
    labelY: 106,
    dy: -50,
  },
  // Upper stage
  {
    id: 'upper',
    points: `${CX - 36},132 ${CX + 36},132 ${CX + 44},200 ${CX - 44},200`,
    labelX: CX,
    labelY: 168,
    dy: -15,
  },
  // Core stage
  {
    id: 'core',
    points: `${CX - 44},202 ${CX + 44},202 ${CX + 44},420 ${CX - 44},420`,
    labelX: CX,
    labelY: 310,
    dy: 0,
  },
  // Boosters (left + right combined as single clickable)
  {
    id: 'boosters',
    points: `${CX - 88},250 ${CX - 54},250 ${CX - 54},410 ${CX - 88},410 ${CX - 88},250
             M ${CX + 54},250 ${CX + 88},250 ${CX + 88},410 ${CX + 54},410`,
    labelX: CX,
    labelY: 330,
    dy: 0,
  },
  // Nozzle
  {
    id: 'nozzle',
    points: `${CX - 44},422 ${CX + 44},422 ${CX + 28},500 ${CX - 28},500`,
    labelX: CX,
    labelY: 462,
    dy: 20,
  },
];

// Separate booster shapes for rendering
const BOOSTER_LEFT = `${CX - 90},248 ${CX - 52},248 ${CX - 52},412 ${CX - 90},412`;
const BOOSTER_RIGHT = `${CX + 52},248 ${CX + 90},248 ${CX + 90},412 ${CX + 52},412`;

export function Ariane6Diagram() {
  const [active, setActive] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);

  const activePart = active ? PARTS[active as keyof typeof PARTS] as Part : null;

  const getTranslate = (shapeId: string) => {
    if (!exploded) return 'translate(0, 0)';
    const shape = BASE_SHAPES.find(s => s.id === shapeId);
    return shape ? `translate(0, ${shape.dy})` : 'translate(0, 0)';
  };

  const isActive = (id: string) => active === id;

  const partColor = (id: string) => {
    const p = PARTS[id as keyof typeof PARTS] as Part | undefined;
    return p ? p.color : '#1e293b';
  };
  const partAccent = (id: string) => {
    const p = PARTS[id as keyof typeof PARTS] as Part | undefined;
    return p ? p.accentColor : '#94a3b8';
  };

  const handleClick = (id: string) => {
    setActive(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 pt-6 pb-3">
        <h3 className="text-xl font-bold text-white">Ariane 6 — Vue Éclatée Interactive</h3>
        <p className="text-sm text-gray-400 mt-1">Cliquez sur un élément pour en connaître les détails.</p>
      </div>

      {/* Explode toggle */}
      <div className="px-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => setExploded(e => !e)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${
            exploded
              ? 'bg-orange-500/20 border-orange-400/50 text-orange-300'
              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
          }`}
        >
          <span className={`w-2 h-2 rounded-full transition-all ${exploded ? 'bg-orange-400' : 'bg-gray-600'}`} />
          {exploded ? 'Vue éclatée' : 'Vue assemblée'}
        </button>
        <span className="text-xs text-gray-600">Basculez pour séparer les étages</span>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* SVG Diagram */}
        <div className="flex-shrink-0 flex items-start justify-center px-4 pb-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ maxWidth: 340, minWidth: 240 }}
            className="select-none"
          >
            {/* Background stars */}
            {Array.from({ length: 30 }, (_, i) => (
              <circle
                key={i}
                cx={(i * 113.7) % W}
                cy={(i * 79.3 + 17) % H}
                r={0.7}
                fill="white"
                opacity={0.15 + (i % 3) * 0.08}
              />
            ))}

            {/* ── Nozzle ── */}
            <g
              style={{ transition: 'transform 0.6s cubic-bezier(.34,1.2,.64,1)', transform: getTranslate('nozzle') }}
              onClick={() => handleClick('nozzle')}
              className="cursor-pointer"
            >
              <polygon
                points={`${CX - 44},422 ${CX + 44},422 ${CX + 28},500 ${CX - 28},500`}
                fill={isActive('nozzle') ? '#2a2a1a' : partColor('nozzle')}
                stroke={partAccent('nozzle')}
                strokeWidth={isActive('nozzle') ? 2 : 1}
                opacity={0.9}
              />
              {/* Heat shimmer lines */}
              <line x1={CX - 16} y1={455} x2={CX - 10} y2={498} stroke={partAccent('nozzle')} strokeWidth={0.8} opacity={0.3} />
              <line x1={CX} y1={452} x2={CX} y2={499} stroke={partAccent('nozzle')} strokeWidth={0.8} opacity={0.3} />
              <line x1={CX + 16} y1={455} x2={CX + 10} y2={498} stroke={partAccent('nozzle')} strokeWidth={0.8} opacity={0.3} />
              <text x={CX} y={465} textAnchor="middle" fill={partAccent('nozzle')} fontSize={8} fontWeight={500}>VULCAIN 2.1</text>
              {isActive('nozzle') && (
                <polygon
                  points={`${CX - 44},422 ${CX + 44},422 ${CX + 28},500 ${CX - 28},500`}
                  fill="none"
                  stroke={partAccent('nozzle')}
                  strokeWidth={3}
                  opacity={0.25}
                />
              )}
            </g>

            {/* ── Boosters ── */}
            <g
              style={{ transition: 'transform 0.6s cubic-bezier(.34,1.2,.64,1)', transform: exploded ? 'translate(-14, 0)' : 'translate(0,0)' }}
              onClick={() => handleClick('boosters')}
              className="cursor-pointer"
            >
              <polygon
                points={BOOSTER_LEFT}
                fill={isActive('boosters') ? '#3a1a1a' : partColor('boosters')}
                stroke={partAccent('boosters')}
                strokeWidth={isActive('boosters') ? 2 : 1}
                opacity={0.9}
              />
              {/* Booster nozzle left */}
              <polygon
                points={`${CX - 90},412 ${CX - 52},412 ${CX - 58},438 ${CX - 84},438`}
                fill={partColor('nozzle')}
                stroke={partAccent('boosters')}
                strokeWidth={0.8}
                opacity={0.8}
              />
              <text x={CX - 71} y={330} textAnchor="middle" fill={partAccent('boosters')} fontSize={7.5} fontWeight={500} transform={`rotate(-90, ${CX - 71}, 330)`}>P120C</text>
            </g>
            <g
              style={{ transition: 'transform 0.6s cubic-bezier(.34,1.2,.64,1)', transform: exploded ? 'translate(14, 0)' : 'translate(0,0)' }}
              onClick={() => handleClick('boosters')}
              className="cursor-pointer"
            >
              <polygon
                points={BOOSTER_RIGHT}
                fill={isActive('boosters') ? '#3a1a1a' : partColor('boosters')}
                stroke={partAccent('boosters')}
                strokeWidth={isActive('boosters') ? 2 : 1}
                opacity={0.9}
              />
              {/* Booster nozzle right */}
              <polygon
                points={`${CX + 52},412 ${CX + 90},412 ${CX + 84},438 ${CX + 58},438`}
                fill={partColor('nozzle')}
                stroke={partAccent('boosters')}
                strokeWidth={0.8}
                opacity={0.8}
              />
              <text x={CX + 71} y={330} textAnchor="middle" fill={partAccent('boosters')} fontSize={7.5} fontWeight={500} transform={`rotate(90, ${CX + 71}, 330)`}>P120C</text>
            </g>

            {/* ── Core stage ── */}
            <g
              style={{ transition: 'transform 0.6s cubic-bezier(.34,1.2,.64,1)', transform: getTranslate('core') }}
              onClick={() => handleClick('core')}
              className="cursor-pointer"
            >
              <rect
                x={CX - 44} y={202}
                width={88} height={218}
                fill={isActive('core') ? '#3a2a1a' : partColor('core')}
                stroke={partAccent('core')}
                strokeWidth={isActive('core') ? 2 : 1}
                opacity={0.9}
              />
              {/* H2 / O2 tank separator line */}
              <line x1={CX - 44} y1={310} x2={CX + 44} y2={310} stroke={partAccent('core')} strokeWidth={0.8} opacity={0.4} />
              <text x={CX} y={270} textAnchor="middle" fill={partAccent('core')} fontSize={8} opacity={0.7}>LH₂</text>
              <text x={CX} y={360} textAnchor="middle" fill={partAccent('core')} fontSize={8} opacity={0.7}>LOX</text>
              {/* Logo ArianeGroup */}
              <text x={CX} y={315} textAnchor="middle" fill={partAccent('core')} fontSize={7} opacity={0.5}>ARIANE 6</text>
              {isActive('core') && (
                <rect
                  x={CX - 44} y={202}
                  width={88} height={218}
                  fill="none"
                  stroke={partAccent('core')}
                  strokeWidth={3}
                  opacity={0.2}
                />
              )}
            </g>

            {/* ── Upper stage ── */}
            <g
              style={{ transition: 'transform 0.6s cubic-bezier(.34,1.2,.64,1)', transform: getTranslate('upper') }}
              onClick={() => handleClick('upper')}
              className="cursor-pointer"
            >
              <polygon
                points={`${CX - 36},132 ${CX + 36},132 ${CX + 44},200 ${CX - 44},200`}
                fill={isActive('upper') ? '#2a2a4a' : partColor('upper')}
                stroke={partAccent('upper')}
                strokeWidth={isActive('upper') ? 2 : 1}
                opacity={0.9}
              />
              <text x={CX} y={170} textAnchor="middle" fill={partAccent('upper')} fontSize={8} opacity={0.8}>VINCI</text>
              {isActive('upper') && (
                <polygon
                  points={`${CX - 36},132 ${CX + 36},132 ${CX + 44},200 ${CX - 44},200`}
                  fill="none"
                  stroke={partAccent('upper')}
                  strokeWidth={3}
                  opacity={0.2}
                />
              )}
            </g>

            {/* ── Payload ── */}
            <g
              style={{ transition: 'transform 0.6s cubic-bezier(.34,1.2,.64,1)', transform: getTranslate('payload') }}
              onClick={() => handleClick('payload')}
              className="cursor-pointer"
            >
              <rect
                x={CX - 32} y={82}
                width={64} height={48}
                fill={isActive('payload') ? '#1a3a2a' : partColor('payload')}
                stroke={partAccent('payload')}
                strokeWidth={isActive('payload') ? 2 : 1}
                opacity={0.85}
              />
              {/* Satellite solar panels */}
              <rect x={CX - 52} y={96} width={18} height={8} fill={partAccent('payload')} opacity={0.5} rx={1} />
              <rect x={CX + 34} y={96} width={18} height={8} fill={partAccent('payload')} opacity={0.5} rx={1} />
              <text x={CX} y={110} textAnchor="middle" fill={partAccent('payload')} fontSize={8} opacity={0.8}>SAT</text>
              {isActive('payload') && (
                <rect
                  x={CX - 32} y={82}
                  width={64} height={48}
                  fill="none"
                  stroke={partAccent('payload')}
                  strokeWidth={3}
                  opacity={0.2}
                />
              )}
            </g>

            {/* ── Fairing ── */}
            <g
              style={{ transition: 'transform 0.6s cubic-bezier(.34,1.2,.64,1)', transform: getTranslate('fairing') }}
              onClick={() => handleClick('fairing')}
              className="cursor-pointer"
            >
              {/* Left half */}
              <polygon
                points={`${CX},18 ${CX + 38},80 ${CX},80`}
                fill={isActive('fairing') ? '#2a3a5f' : partColor('fairing')}
                stroke={partAccent('fairing')}
                strokeWidth={isActive('fairing') ? 2 : 1}
                opacity={0.9}
              />
              {/* Right half */}
              <polygon
                points={`${CX},18 ${CX},80 ${CX - 38},80`}
                fill={isActive('fairing') ? '#1e3060' : partColor('fairing')}
                stroke={partAccent('fairing')}
                strokeWidth={isActive('fairing') ? 2 : 1}
                opacity={0.85}
              />
              {/* Center seam */}
              <line x1={CX} y1={18} x2={CX} y2={80} stroke={partAccent('fairing')} strokeWidth={0.8} opacity={0.4} strokeDasharray="3 3" />
              {isActive('fairing') && (
                <polygon
                  points={`${CX},18 ${CX + 38},80 ${CX - 38},80`}
                  fill="none"
                  stroke={partAccent('fairing')}
                  strokeWidth={3}
                  opacity={0.2}
                />
              )}
            </g>

            {/* ── Hover labels (always visible, small) ── */}
            {PARTS_LIST.map((p) => {
              const shape = BASE_SHAPES.find(s => s.id === p.id);
              if (!shape || p.id === 'boosters') return null;
              const dy = exploded ? shape.dy : 0;
              return (
                <text
                  key={p.id}
                  x={shape.labelX + (p.id === 'fairing' ? 42 : 50)}
                  y={shape.labelY + dy}
                  fill={p.accentColor}
                  fontSize={8}
                  opacity={0.5}
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  — {p.shortLabel}
                </text>
              );
            })}
            {/* Booster label */}
            <text
              x={CX + 94}
              y={exploded ? 330 : 330}
              fill={partAccent('boosters')}
              fontSize={8}
              opacity={0.5}
              dominantBaseline="middle"
              pointerEvents="none"
            >
              — Boosters
            </text>

            {/* Active glow pulse on selected part label */}
            {activePart && (
              <text
                x={CX}
                y={H - 14}
                textAnchor="middle"
                fill={activePart.accentColor}
                fontSize={9}
                opacity={0.6}
                fontWeight={600}
              >
                {activePart.label}
              </text>
            )}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="flex-1 p-5 min-h-[280px] flex flex-col justify-center">
          {!activePart && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🚀</div>
              <p className="text-gray-400 text-sm mb-6">Sélectionnez un élément du lanceur pour en découvrir le rôle et les caractéristiques techniques.</p>
              <div className="grid grid-cols-2 gap-2">
                {PARTS_LIST.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-left"
                  >
                    <span className="text-base">{p.icon}</span>
                    <span className="text-xs text-gray-300 font-medium">{p.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePart && (
            <div className="animate-fadeIn">
              <button
                onClick={() => setActive(null)}
                className="text-xs text-gray-500 hover:text-gray-300 mb-4 flex items-center gap-1 transition-colors"
              >
                ← Vue d'ensemble
              </button>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{activePart.icon}</span>
                <div>
                  <h4 className="font-bold text-white text-base leading-tight">{activePart.label}</h4>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-4 leading-relaxed">{activePart.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-2 mb-4">
                {activePart.stats.map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-sm font-mono font-semibold" style={{ color: activePart.accentColor }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              <ul className="space-y-2">
                {activePart.details.map((d, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-400 leading-relaxed">
                    <span style={{ color: activePart.accentColor }} className="flex-shrink-0 mt-0.5">▸</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
