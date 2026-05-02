import { useState } from 'react';

interface Part {
  id: string;
  label: string;
  shortLabel: string;
  accentColor: string;
  icon: string;
  description: string;
  details: string[];
  stats: { label: string; value: string }[];
}

const PARTS: Record<string, Part> = {
  fairing: {
    id: 'fairing',
    label: 'Coiffe (Payload Fairing)',
    shortLabel: 'Coiffe',
    accentColor: '#60a5fa',
    icon: '🛡️',
    description: 'Carénage aérodynamique protégeant la charge utile lors de la traversée de l\'atmosphère dense.',
    details: [
      'Se sépare en deux demi-coques à ~110 km d\'altitude',
      'Fabriquée en composites fibre de carbone / Kevlar',
      'Deux versions : ø4,5 m standard et ø5,4 m grandes charges',
      'Pyrotechnie pour une séparation nette et simultanée',
    ],
    stats: [
      { label: 'Diamètre', value: '4,5 ou 5,4 m' },
      { label: 'Hauteur', value: '~14 m' },
      { label: 'Séparation', value: '~110 km' },
    ],
  },
  payload: {
    id: 'payload',
    label: 'Charge Utile (Satellite)',
    shortLabel: 'Satellite',
    accentColor: '#34d399',
    icon: '🛰️',
    description: 'Le satellite que le lanceur doit placer sur son orbite de destination.',
    details: [
      'Peut embarquer 1 gros satellite ou plusieurs petits',
      'Capacité jusqu\'à 11,5 t en orbite GTO',
      'Jusqu\'à 21,6 t en orbite basse LEO',
      'Interfaces standardisées ITAR-free européen',
    ],
    stats: [
      { label: 'Max GTO', value: '11,5 t' },
      { label: 'Max LEO', value: '21,6 t' },
      { label: 'Volume utile', value: '~340 m³' },
    ],
  },
  upper: {
    id: 'upper',
    label: 'Étage Supérieur (ULPM)',
    shortLabel: 'Étage sup.',
    accentColor: '#a78bfa',
    icon: '🔵',
    description: 'Étage cryotechnique assurant la mise en orbite précise.',
    details: [
      'Moteur Vinci rallumageable jusqu\'à 5 fois',
      'Brûle LH₂ (−253°C) et LOX (−183°C)',
      'Réservoir LH₂ central entouré du torique LOX',
      '"L\'étage taxi" : dépose le satellite sur son orbite finale',
    ],
    stats: [
      { label: 'Moteur', value: 'Vinci / HM7B' },
      { label: 'Rallumages', value: 'Jusqu\'à 5×' },
      { label: 'Poussée', value: '180 kN' },
    ],
  },
  core: {
    id: 'core',
    label: 'Étage Principal (EPC)',
    shortLabel: 'Étage principal',
    accentColor: '#fb923c',
    icon: '🟠',
    description: 'Corps principal : réservoirs cryotechniques géants alimentant le Vulcain 2.1.',
    details: [
      'Réservoir LH₂ supérieur (~145 t) et LOX inférieur (~30 t)',
      'Alimente le Vulcain 2.1 pendant ~470 secondes',
      'Structure aluminium-lithium 2195',
      'Fabriqué par ArianeGroup à Brême et Vernon',
    ],
    stats: [
      { label: 'Longueur', value: '~30 m' },
      { label: 'Diamètre', value: '5,4 m' },
      { label: 'Propergols', value: '~175 t' },
    ],
  },
  boosters: {
    id: 'boosters',
    label: 'Boosters à Poudre (P120C)',
    shortLabel: 'Boosters P120C',
    accentColor: '#f87171',
    icon: '🔥',
    description: 'Propulseurs à ergol solide latéraux fournissant l\'essentiel de la poussée au décollage.',
    details: [
      'A62 : 2 boosters · A64 : 4 boosters pour charges lourdes',
      'Moteur P120C commun avec Vega-C',
      'Propergol HTPB + perchlorate d\'ammonium + aluminium',
      'Séparation à ~75 km après 130 s de combustion',
    ],
    stats: [
      { label: 'Config.', value: '2 (A62) ou 4 (A64)' },
      { label: 'Poussée unit.', value: '~450 tf' },
      { label: 'Combustion', value: '~130 s' },
    ],
  },
  vulcain: {
    id: 'vulcain',
    label: 'Moteur Vulcain 2.1',
    shortLabel: 'Vulcain 2.1',
    accentColor: '#fbbf24',
    icon: '⚡',
    description: 'Moteur cryotechnique principal, chef-d\'œuvre de l\'industrie spatiale européenne.',
    details: [
      'Cycle générateur de gaz LH₂/LOX',
      'Refroidissement régénératif par circulation H₂ dans les parois',
      'Tuyère orientable TVC ±6° pour guidage en vol',
      'Fabriqué à Vernon (Normandie) depuis 1994',
    ],
    stats: [
      { label: 'Poussée (vide)', value: '137 tf' },
      { label: 'Isp (vide)', value: '433 s' },
      { label: 'T° chambre', value: '~3 300°C' },
    ],
  },
};

// ─── Geometry ────────────────────────────────────────────────────
const W  = 340;
const H  = 680;
const CX = W / 2;

// Core body
const HW_CORE  = 30;   // half-width of main stage

// Fairing — tall ogive, full width matches core
const Y_FAIR_TIP  = 16;
const Y_FAIR_CYL  = 110; // where ogive meets cylinder
const Y_FAIR_BASE = 148; // bottom of fairing skirt

// Payload (satellite visible in transparency inside fairing)
const Y_SAT_TOP = 60;
const Y_SAT_BOT = 140;
const HW_SAT    = 18;

// Upper stage — narrower cylinder
const HW_UPPER   = 24;
const Y_UP_TOP   = Y_FAIR_BASE;
const Y_UP_BOT   = 212;

// Transition skirt upper→core
const Y_SK_TOP = Y_UP_BOT;
const Y_SK_BOT = 232;

// EPC core
const Y_CORE_TOP = Y_SK_BOT;
const Y_CORE_BOT = 530;

// Boosters — symmetric, attach to lower half of core
const HW_BOOST   = 16;
const BX_INNER   = HW_CORE + 3;
const BX_OUTER   = BX_INNER + HW_BOOST * 2;
const Y_BOST_TIP = 330; // top of ogive
const Y_BOST_CYL = 358; // where ogive meets cylinder
const Y_BOST_BOT = Y_CORE_BOT + 2;

// Vulcain nozzle — bell shape, compact
const Y_NOZZ_TOP  = Y_CORE_BOT;
const Y_NOZZ_NECK = Y_NOZZ_TOP + 18;  // throat
const Y_NOZZ_EXIT = Y_NOZZ_TOP + 58;  // bell exit
const HW_NOZZ_TOP = HW_CORE;
const HW_NOZZ_NECK = 10;
const HW_NOZZ_EXIT = 28;

type PartId = 'fairing' | 'payload' | 'upper' | 'core' | 'boosters' | 'vulcain';

export function Ariane6Diagram() {
  const [active, setActive] = useState<PartId | null>(null);

  const activePart = active ? PARTS[active] : null;
  const click = (id: PartId) => setActive(prev => prev === id ? null : id);
  const isActive = (id: PartId) => active === id;
  const ac = (id: PartId) => PARTS[id].accentColor;
  const sw = (id: PartId) => isActive(id) ? 2 : 1;
  const so = (id: PartId) => isActive(id) ? 1 : 0.6;
  const glow = (id: PartId) => isActive(id) ? `drop-shadow(0 0 6px ${PARTS[id].accentColor}88)` : 'none';

  return (
    <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-xl font-bold text-white">Ariane 6 — Schéma Interactif</h3>
        <p className="text-sm text-gray-400 mt-1">Cliquez sur un composant pour découvrir son rôle et ses caractéristiques.</p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ── SVG ── */}
        <div className="flex-shrink-0 flex items-start justify-center px-4 pb-4 pt-2">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ maxWidth: 340, minWidth: 240 }}
            className="select-none"
          >
            <defs>
              <linearGradient id="g_core" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#141420" />
                <stop offset="18%"  stopColor="#22223a" />
                <stop offset="50%"  stopColor="#32325a" />
                <stop offset="82%"  stopColor="#22223a" />
                <stop offset="100%" stopColor="#141420" />
              </linearGradient>
              <linearGradient id="g_upper" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#0e0e22" />
                <stop offset="45%"  stopColor="#1e1e40" />
                <stop offset="55%"  stopColor="#1e1e40" />
                <stop offset="100%" stopColor="#0e0e22" />
              </linearGradient>
              <linearGradient id="g_fair_l" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%"   stopColor="#0a1830" />
                <stop offset="60%"  stopColor="#122848" />
                <stop offset="100%" stopColor="#0a1830" />
              </linearGradient>
              <linearGradient id="g_fair_r" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#0a1830" />
                <stop offset="60%"  stopColor="#122848" />
                <stop offset="100%" stopColor="#0a1830" />
              </linearGradient>
              <linearGradient id="g_boost_l" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%"   stopColor="#14080a" />
                <stop offset="55%"  stopColor="#2a1010" />
                <stop offset="100%" stopColor="#14080a" />
              </linearGradient>
              <linearGradient id="g_boost_r" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#14080a" />
                <stop offset="55%"  stopColor="#2a1010" />
                <stop offset="100%" stopColor="#14080a" />
              </linearGradient>
              <linearGradient id="g_nozzle" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#080810" />
                <stop offset="40%"  stopColor="#141428" />
                <stop offset="60%"  stopColor="#141428" />
                <stop offset="100%" stopColor="#080810" />
              </linearGradient>
              <filter id="f_glow">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Clipping path for satellite inside fairing */}
              <clipPath id="clip_fair">
                <path d={`
                  M ${CX} ${Y_FAIR_TIP}
                  C ${CX + 4} ${Y_FAIR_TIP + 20}, ${CX + HW_CORE} ${Y_FAIR_CYL - 30}, ${CX + HW_CORE} ${Y_FAIR_CYL}
                  L ${CX + HW_CORE} ${Y_FAIR_BASE}
                  L ${CX - HW_CORE} ${Y_FAIR_BASE}
                  L ${CX - HW_CORE} ${Y_FAIR_CYL}
                  C ${CX - HW_CORE} ${Y_FAIR_CYL - 30}, ${CX - 4} ${Y_FAIR_TIP + 20}, ${CX} ${Y_FAIR_TIP}
                  Z
                `} />
              </clipPath>
            </defs>

            {/* Stars */}
            {Array.from({ length: 44 }, (_, i) => (
              <circle key={i}
                cx={(i * 133.7 + 17) % W} cy={(i * 91.3 + 29) % H}
                r={i % 7 === 0 ? 1.1 : 0.55}
                fill="white" opacity={0.08 + (i % 5) * 0.05}
              />
            ))}

            {/* ══ VULCAIN 2.1 — bell nozzle ══ */}
            <g onClick={() => click('vulcain')} className="cursor-pointer"
               style={{ filter: glow('vulcain') }}>
              {/* Bell shape: narrow at throat, flares at exit */}
              <path
                d={`
                  M ${CX - HW_NOZZ_TOP} ${Y_NOZZ_TOP}
                  L ${CX + HW_NOZZ_TOP} ${Y_NOZZ_TOP}
                  C ${CX + HW_NOZZ_TOP} ${Y_NOZZ_TOP + 8}, ${CX + HW_NOZZ_NECK} ${Y_NOZZ_NECK - 2}, ${CX + HW_NOZZ_NECK} ${Y_NOZZ_NECK}
                  C ${CX + HW_NOZZ_NECK} ${Y_NOZZ_NECK + 16}, ${CX + HW_NOZZ_EXIT - 4} ${Y_NOZZ_EXIT - 10}, ${CX + HW_NOZZ_EXIT} ${Y_NOZZ_EXIT}
                  L ${CX - HW_NOZZ_EXIT} ${Y_NOZZ_EXIT}
                  C ${CX - HW_NOZZ_EXIT + 4} ${Y_NOZZ_EXIT - 10}, ${CX - HW_NOZZ_NECK} ${Y_NOZZ_NECK + 16}, ${CX - HW_NOZZ_NECK} ${Y_NOZZ_NECK}
                  C ${CX - HW_NOZZ_NECK} ${Y_NOZZ_NECK - 2}, ${CX - HW_NOZZ_TOP} ${Y_NOZZ_TOP + 8}, ${CX - HW_NOZZ_TOP} ${Y_NOZZ_TOP}
                  Z
                `}
                fill={isActive('vulcain') ? '#1c1c10' : 'url(#g_nozzle)'}
                stroke={ac('vulcain')} strokeWidth={sw('vulcain')} opacity={so('vulcain')}
              />
              {/* Cooling ribs on bell */}
              {[-18, -10, 0, 10, 18].map(dx => (
                <line key={dx}
                  x1={CX + dx * 0.33} y1={Y_NOZZ_NECK + 4}
                  x2={CX + dx} y2={Y_NOZZ_EXIT - 6}
                  stroke={ac('vulcain')} strokeWidth={0.4} opacity={0.2}
                />
              ))}
              {/* Combustion chamber stub */}
              <rect x={CX - 11} y={Y_NOZZ_TOP - 16} width={22} height={18}
                fill={isActive('vulcain') ? '#1a1a0c' : '#0c0c10'}
                stroke={ac('vulcain')} strokeWidth={0.9} opacity={0.75} rx={2}
              />
              <text x={CX} y={Y_NOZZ_EXIT - 14} textAnchor="middle"
                fill={ac('vulcain')} fontSize={6.5} opacity={0.45} fontFamily="monospace">VULCAIN 2.1</text>
            </g>

            {/* ══ EPC CORE ══ */}
            <g onClick={() => click('core')} className="cursor-pointer"
               style={{ filter: glow('core') }}>
              <rect x={CX - HW_CORE} y={Y_CORE_TOP} width={HW_CORE * 2} height={Y_CORE_BOT - Y_CORE_TOP}
                fill={isActive('core') ? '#2a1a08' : 'url(#g_core)'}
                stroke={ac('core')} strokeWidth={sw('core')} opacity={so('core')}
              />
              {/* Manufacturing rings */}
              {[50, 110, 170, 240, 310, 380].map(dy => (
                <line key={dy}
                  x1={CX - HW_CORE} y1={Y_CORE_TOP + dy}
                  x2={CX + HW_CORE} y2={Y_CORE_TOP + dy}
                  stroke="#404060" strokeWidth={0.5} opacity={0.35}
                />
              ))}
              {/* LH2/LOX separator */}
              <line x1={CX - HW_CORE} y1={Y_CORE_TOP + 190} x2={CX + HW_CORE} y2={Y_CORE_TOP + 190}
                stroke={ac('core')} strokeWidth={1.2} opacity={0.3} />
              <text x={CX} y={Y_CORE_TOP + 96} textAnchor="middle"
                fill={ac('core')} fontSize={8} opacity={0.3} fontFamily="monospace">LH₂</text>
              <text x={CX} y={Y_CORE_TOP + 265} textAnchor="middle"
                fill={ac('core')} fontSize={8} opacity={0.3} fontFamily="monospace">LOX</text>
              <text x={CX} y={Y_CORE_TOP + 192} textAnchor="middle"
                fill="#505070" fontSize={7} opacity={0.25} letterSpacing={2}>ARIANE 6</text>
              {/* Booster attach struts */}
              {[20, Y_BOST_BOT - Y_BOST_CYL - 10].map((dy, i) => (
                <g key={i}>
                  <line x1={CX - HW_CORE} y1={Y_BOST_CYL + dy}
                        x2={CX - BX_OUTER} y2={Y_BOST_CYL + dy}
                    stroke="#505070" strokeWidth={1} opacity={0.3} />
                  <line x1={CX + HW_CORE} y1={Y_BOST_CYL + dy}
                        x2={CX + BX_OUTER} y2={Y_BOST_CYL + dy}
                    stroke="#505070" strokeWidth={1} opacity={0.3} />
                </g>
              ))}
            </g>

            {/* ══ BOOSTERS P120C — left ══ */}
            <g onClick={() => click('boosters')} className="cursor-pointer"
               style={{ filter: glow('boosters') }}>
              {/* Ogive left */}
              <path d={`
                M ${CX - BX_INNER - HW_BOOST} ${Y_BOST_TIP + 22}
                Q ${CX - BX_INNER - HW_BOOST} ${Y_BOST_TIP}
                  ${CX - BX_INNER - HW_BOOST / 2} ${Y_BOST_TIP}
                Q ${CX - BX_INNER} ${Y_BOST_TIP}
                  ${CX - BX_INNER} ${Y_BOST_TIP + 22}
                L ${CX - BX_INNER} ${Y_BOST_CYL}
                L ${CX - BX_OUTER} ${Y_BOST_CYL}
                Z
              `}
                fill={isActive('boosters') ? '#2a1010' : 'url(#g_boost_l)'}
                stroke={ac('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              {/* Body left */}
              <rect x={CX - BX_OUTER} y={Y_BOST_CYL} width={HW_BOOST * 2} height={Y_BOST_BOT - Y_BOST_CYL}
                fill={isActive('boosters') ? '#2a1010' : 'url(#g_boost_l)'}
                stroke={ac('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              {/* Nozzle left — small bell */}
              <path d={`
                M ${CX - BX_OUTER + 4} ${Y_BOST_BOT}
                L ${CX - BX_INNER - 4} ${Y_BOST_BOT}
                C ${CX - BX_INNER - 4} ${Y_BOST_BOT + 6}, ${CX - BX_INNER - 7} ${Y_BOST_BOT + 10}, ${CX - BX_INNER - 9} ${Y_BOST_BOT + 18}
                L ${CX - BX_OUTER + 9} ${Y_BOST_BOT + 18}
                C ${CX - BX_OUTER + 7} ${Y_BOST_BOT + 10}, ${CX - BX_OUTER + 4} ${Y_BOST_BOT + 6}, ${CX - BX_OUTER + 4} ${Y_BOST_BOT}
                Z
              `}
                fill="#060610" stroke={ac('boosters')} strokeWidth={0.7} opacity={0.75}
              />
              {/* Banding rings left */}
              {[40, 90, 130].map(dy => (
                <line key={dy}
                  x1={CX - BX_OUTER} y1={Y_BOST_CYL + dy}
                  x2={CX - BX_INNER} y2={Y_BOST_CYL + dy}
                  stroke={ac('boosters')} strokeWidth={0.5} opacity={0.18}
                />
              ))}
              <text x={CX - BX_INNER - HW_BOOST} y={Y_BOST_CYL + 80}
                textAnchor="middle" fill={ac('boosters')} fontSize={6} opacity={0.35} fontFamily="monospace"
                transform={`rotate(-90, ${CX - BX_INNER - HW_BOOST}, ${Y_BOST_CYL + 80})`}>P120C</text>
            </g>

            {/* ══ BOOSTERS P120C — right (mirror) ══ */}
            <g onClick={() => click('boosters')} className="cursor-pointer"
               style={{ filter: glow('boosters') }}>
              {/* Ogive right */}
              <path d={`
                M ${CX + BX_INNER + HW_BOOST} ${Y_BOST_TIP + 22}
                Q ${CX + BX_INNER + HW_BOOST} ${Y_BOST_TIP}
                  ${CX + BX_INNER + HW_BOOST / 2} ${Y_BOST_TIP}
                Q ${CX + BX_INNER} ${Y_BOST_TIP}
                  ${CX + BX_INNER} ${Y_BOST_TIP + 22}
                L ${CX + BX_INNER} ${Y_BOST_CYL}
                L ${CX + BX_OUTER} ${Y_BOST_CYL}
                Z
              `}
                fill={isActive('boosters') ? '#2a1010' : 'url(#g_boost_r)'}
                stroke={ac('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              {/* Body right */}
              <rect x={CX + BX_INNER} y={Y_BOST_CYL} width={HW_BOOST * 2} height={Y_BOST_BOT - Y_BOST_CYL}
                fill={isActive('boosters') ? '#2a1010' : 'url(#g_boost_r)'}
                stroke={ac('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              {/* Nozzle right */}
              <path d={`
                M ${CX + BX_OUTER - 4} ${Y_BOST_BOT}
                L ${CX + BX_INNER + 4} ${Y_BOST_BOT}
                C ${CX + BX_INNER + 4} ${Y_BOST_BOT + 6}, ${CX + BX_INNER + 7} ${Y_BOST_BOT + 10}, ${CX + BX_INNER + 9} ${Y_BOST_BOT + 18}
                L ${CX + BX_OUTER - 9} ${Y_BOST_BOT + 18}
                C ${CX + BX_OUTER - 7} ${Y_BOST_BOT + 10}, ${CX + BX_OUTER - 4} ${Y_BOST_BOT + 6}, ${CX + BX_OUTER - 4} ${Y_BOST_BOT}
                Z
              `}
                fill="#060610" stroke={ac('boosters')} strokeWidth={0.7} opacity={0.75}
              />
              {/* Banding rings right */}
              {[40, 90, 130].map(dy => (
                <line key={dy}
                  x1={CX + BX_INNER} y1={Y_BOST_CYL + dy}
                  x2={CX + BX_OUTER} y2={Y_BOST_CYL + dy}
                  stroke={ac('boosters')} strokeWidth={0.5} opacity={0.18}
                />
              ))}
              <text x={CX + BX_INNER + HW_BOOST} y={Y_BOST_CYL + 80}
                textAnchor="middle" fill={ac('boosters')} fontSize={6} opacity={0.35} fontFamily="monospace"
                transform={`rotate(90, ${CX + BX_INNER + HW_BOOST}, ${Y_BOST_CYL + 80})`}>P120C</text>
            </g>

            {/* ══ UPPER STAGE ══ */}
            <g onClick={() => click('upper')} className="cursor-pointer"
               style={{ filter: glow('upper') }}>
              {/* Cylinder */}
              <rect x={CX - HW_UPPER} y={Y_UP_TOP} width={HW_UPPER * 2} height={Y_UP_BOT - Y_UP_TOP}
                fill={isActive('upper') ? '#1e1e38' : 'url(#g_upper)'}
                stroke={ac('upper')} strokeWidth={sw('upper')} opacity={so('upper')}
              />
              {/* Skirt transition upper→core */}
              <path d={`
                M ${CX - HW_UPPER} ${Y_SK_TOP}
                L ${CX + HW_UPPER} ${Y_SK_TOP}
                L ${CX + HW_CORE}  ${Y_SK_BOT}
                L ${CX - HW_CORE}  ${Y_SK_BOT}
                Z
              `}
                fill={isActive('upper') ? '#1e1e38' : 'url(#g_upper)'}
                stroke={ac('upper')} strokeWidth={sw('upper')} opacity={so('upper')}
              />
              {/* Vinci nozzle stub */}
              <path d={`
                M ${CX - 8} ${Y_UP_BOT}
                L ${CX + 8} ${Y_UP_BOT}
                C ${CX + 8} ${Y_UP_BOT + 5}, ${CX + 11} ${Y_UP_BOT + 10}, ${CX + 11} ${Y_SK_TOP + 5}
                L ${CX - 11} ${Y_SK_TOP + 5}
                C ${CX - 11} ${Y_UP_BOT + 10}, ${CX - 8} ${Y_UP_BOT + 5}, ${CX - 8} ${Y_UP_BOT}
                Z
              `}
                fill="#060610" stroke={ac('upper')} strokeWidth={0.7} opacity={0.65}
              />
              <text x={CX} y={Y_UP_TOP + 36} textAnchor="middle"
                fill={ac('upper')} fontSize={7} opacity={0.4} fontFamily="monospace">VINCI</text>
              <line x1={CX - HW_UPPER} y1={Y_UP_TOP + 18} x2={CX + HW_UPPER} y2={Y_UP_TOP + 18}
                stroke={ac('upper')} strokeWidth={0.5} opacity={0.2} />
            </g>

            {/* ══ SATELLITE (inside fairing, transparent) ══ */}
            <g clipPath="url(#clip_fair)" onClick={() => click('payload')} className="cursor-pointer">
              {/* Satellite body */}
              <rect x={CX - HW_SAT} y={Y_SAT_TOP} width={HW_SAT * 2} height={Y_SAT_BOT - Y_SAT_TOP}
                fill={isActive('payload') ? '#124030' : '#0a2818'}
                stroke={ac('payload')} strokeWidth={sw('payload')}
                opacity={isActive('payload') ? 0.7 : 0.45}
                rx={2}
              />
              {/* Solar panels left */}
              <rect x={CX - HW_SAT - 22} y={Y_SAT_TOP + 26} width={20} height={9}
                fill={ac('payload')} opacity={isActive('payload') ? 0.55 : 0.3} rx={1}
              />
              <line x1={CX - HW_SAT} y1={Y_SAT_TOP + 30} x2={CX - HW_SAT - 22} y2={Y_SAT_TOP + 30}
                stroke={ac('payload')} strokeWidth={0.8} opacity={0.35}
              />
              {/* Solar panels right */}
              <rect x={CX + HW_SAT + 2} y={Y_SAT_TOP + 26} width={20} height={9}
                fill={ac('payload')} opacity={isActive('payload') ? 0.55 : 0.3} rx={1}
              />
              <line x1={CX + HW_SAT} y1={Y_SAT_TOP + 30} x2={CX + HW_SAT + 22} y2={Y_SAT_TOP + 30}
                stroke={ac('payload')} strokeWidth={0.8} opacity={0.35}
              />
              {/* Antenna dish */}
              <ellipse cx={CX + 8} cy={Y_SAT_TOP + 16} rx={7} ry={4}
                fill="none" stroke={ac('payload')} strokeWidth={0.8} opacity={0.4}
              />
            </g>

            {/* ══ FAIRING — ogive allongée ══ */}
            <g onClick={() => click('fairing')} className="cursor-pointer"
               style={{ filter: glow('fairing') }}>
              {/* Right half */}
              <path d={`
                M ${CX} ${Y_FAIR_TIP}
                C ${CX + 5}  ${Y_FAIR_TIP + 25},
                  ${CX + HW_CORE} ${Y_FAIR_CYL - 28},
                  ${CX + HW_CORE} ${Y_FAIR_CYL}
                L ${CX + HW_CORE} ${Y_FAIR_BASE}
                L ${CX} ${Y_FAIR_BASE}
                Z
              `}
                fill={isActive('fairing') ? '#162848' : 'url(#g_fair_r)'}
                stroke={ac('fairing')} strokeWidth={sw('fairing')}
                opacity={isActive('fairing') ? 0.82 : 0.58}
              />
              {/* Left half — slightly different shade for 3D feel */}
              <path d={`
                M ${CX} ${Y_FAIR_TIP}
                C ${CX - 5}  ${Y_FAIR_TIP + 25},
                  ${CX - HW_CORE} ${Y_FAIR_CYL - 28},
                  ${CX - HW_CORE} ${Y_FAIR_CYL}
                L ${CX - HW_CORE} ${Y_FAIR_BASE}
                L ${CX} ${Y_FAIR_BASE}
                Z
              `}
                fill={isActive('fairing') ? '#122040' : '#0a1c36'}
                stroke={ac('fairing')} strokeWidth={sw('fairing')}
                opacity={isActive('fairing') ? 0.75 : 0.52}
              />
              {/* Separation seam */}
              <line x1={CX} y1={Y_FAIR_TIP} x2={CX} y2={Y_FAIR_BASE}
                stroke={ac('fairing')} strokeWidth={0.8} opacity={0.35} strokeDasharray="5 4"
              />
              {/* Panel lines */}
              <line x1={CX + 9} y1={Y_FAIR_TIP + 22} x2={CX + HW_CORE - 2} y2={Y_FAIR_CYL + 10}
                stroke={ac('fairing')} strokeWidth={0.4} opacity={0.15}
              />
              <line x1={CX - 9} y1={Y_FAIR_TIP + 22} x2={CX - HW_CORE + 2} y2={Y_FAIR_CYL + 10}
                stroke={ac('fairing')} strokeWidth={0.4} opacity={0.15}
              />
              {/* Base ring */}
              <rect x={CX - HW_CORE} y={Y_FAIR_BASE - 5} width={HW_CORE * 2} height={6}
                fill="#0a1428" stroke={ac('fairing')} strokeWidth={0.8} opacity={0.55}
              />
            </g>

            {/* ══ CALLOUT LINES (drawn last, no transform) ══ */}
            {([
              { id: 'fairing',  px: CX + HW_CORE, py: Y_FAIR_TIP + 50,  label: 'Coiffe' },
              { id: 'payload',  px: CX + HW_SAT,  py: Y_SAT_TOP + 30,   label: 'Satellite' },
              { id: 'upper',    px: CX + HW_UPPER, py: Y_UP_TOP + 30,   label: 'Ét. sup.' },
              { id: 'core',     px: CX + HW_CORE,  py: Y_CORE_TOP + 100, label: 'EPC' },
              { id: 'boosters', px: CX + BX_OUTER, py: Y_BOST_CYL + 60,  label: 'P120C' },
              { id: 'vulcain',  px: CX + HW_NOZZ_EXIT, py: Y_NOZZ_TOP + 38, label: 'Vulcain' },
            ] as { id: PartId; px: number; py: number; label: string }[]).map(c => {
              const isAct = active === c.id;
              const color = PARTS[c.id].accentColor;
              const lx2 = W - 14;
              return (
                <g key={c.id} opacity={isAct ? 1 : 0.32}
                   style={{ transition: 'opacity 0.25s' }} className="pointer-events-none">
                  <line x1={c.px + 2} y1={c.py} x2={lx2 - 34} y2={c.py}
                    stroke={color} strokeWidth={isAct ? 1.2 : 0.7} />
                  <circle cx={c.px + 2} cy={c.py} r={2.2} fill={color} />
                  <text x={lx2 - 30} y={c.py} dominantBaseline="middle"
                    fill={color} fontSize={8} fontFamily="monospace" fontWeight={isAct ? 700 : 400}>
                    {c.label}
                  </text>
                </g>
              );
            })}

          </svg>
        </div>

        {/* ── Detail panel ── */}
        <div className="flex-1 p-5 min-h-[260px] flex flex-col justify-center">
          {!activePart ? (
            <div className="py-4">
              <p className="text-gray-400 text-sm mb-5">
                Cliquez sur un élément du lanceur pour découvrir son rôle et ses caractéristiques techniques.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(PARTS).map(p => (
                  <button key={p.id}
                    onClick={() => setActive(p.id as PartId)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-left"
                  >
                    <span className="text-base">{p.icon}</span>
                    <span className="text-xs text-gray-300 font-medium">{p.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <button onClick={() => setActive(null)}
                className="text-xs text-gray-500 hover:text-gray-300 mb-4 flex items-center gap-1 transition-colors"
              >
                ← Vue d'ensemble
              </button>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{activePart.icon}</span>
                <h4 className="font-bold text-white text-base leading-tight">{activePart.label}</h4>
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">{activePart.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {activePart.stats.map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-sm font-mono font-semibold" style={{ color: activePart.accentColor }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-2">
                {activePart.details.map((d, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-400 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5" style={{ color: activePart.accentColor }}>▸</span>
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
