import { useState } from 'react';

interface Part {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  accentColor: string;
  highlightColor: string;
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
    color: '#0f2744',
    accentColor: '#60a5fa',
    highlightColor: '#1e4a8a',
    icon: '🛡️',
    description: 'Carénage aérodynamique protégeant la charge utile lors de la traversée de l\'atmosphère dense.',
    details: [
      'Se sépare en deux demi-coques à ~110 km d\'altitude quand la pression atmosphérique devient négligeable',
      'Fabriquée en matériaux composites fibre de carbone / Kevlar ultra-légers',
      'Deux versions : ø4,5 m standard et ø5,4 m pour grandes charges utiles',
      'Équipée de joints étanches à pyrotechnie pour une séparation nette et fiable',
    ],
    stats: [
      { label: 'Diamètre', value: '4,5 ou 5,4 m' },
      { label: 'Hauteur', value: '~14 m' },
      { label: 'Altitude séparation', value: '~110 km' },
    ],
  },
  payload: {
    id: 'payload',
    label: 'Charge Utile',
    shortLabel: 'Satellite',
    color: '#0f2a1e',
    accentColor: '#34d399',
    highlightColor: '#1a4a34',
    icon: '🛰️',
    description: 'Le satellite (ou les satellites) que le lanceur doit placer sur son orbite de destination.',
    details: [
      'Peut embarquer 1 gros satellite ou plusieurs petits (dispenseur multi-satellite)',
      'Capacité jusqu\'à 11,5 t en orbite de transfert géostationnaire (GTO)',
      'Jusqu\'à 21,6 t en orbite basse (LEO)',
      'Interfaces mécaniques et électriques standardisées (ITAR-free européen)',
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
    color: '#151530',
    accentColor: '#a78bfa',
    highlightColor: '#2a2a60',
    icon: '🔵',
    description: 'Étage cryotechnique assurant la mise en orbite précise avec le moteur Vinci (version A62) ou HM7B (version A64).',
    details: [
      'Moteur Vinci : rallumageable jusqu\'à 5 fois pour des missions multi-orbites complexes',
      'Brûle de l\'hydrogène liquide (LH₂ à −253°C) et oxygène liquide (LOX à −183°C)',
      'Réservoir LH₂ central entouré du réservoir torique LOX',
      '"L\'étage taxi" : dépose chaque satellite précisément sur son orbite finale',
    ],
    stats: [
      { label: 'Moteur', value: 'Vinci / HM7B' },
      { label: 'Rallumages Vinci', value: 'Jusqu\'à 5×' },
      { label: 'Poussée vide', value: '180 kN' },
    ],
  },
  core: {
    id: 'core',
    label: 'Étage Principal (EPC)',
    shortLabel: 'Étage principal',
    color: '#1a1008',
    accentColor: '#fb923c',
    highlightColor: '#3a2010',
    icon: '🟠',
    description: 'Corps principal du lanceur : réservoirs cryotechniques géants alimentant le moteur Vulcain 2.1.',
    details: [
      'Réservoir LH₂ supérieur (~145 t) et réservoir LOX inférieur (~30 t)',
      'Alimentent le Vulcain 2.1 pendant ~470 secondes de combustion continue',
      'Structure en aluminium-lithium 2195 (alliage aérospatial haute performance)',
      'Fabriqué par ArianeGroup à Brême (Allemagne) — corps — et Vernon (France) — moteur',
    ],
    stats: [
      { label: 'Longueur EPC', value: '~30 m' },
      { label: 'Diamètre', value: '5,4 m' },
      { label: 'Masse propergols', value: '~175 t' },
    ],
  },
  boosters: {
    id: 'boosters',
    label: 'Boosters à Poudre (P120C)',
    shortLabel: 'Boosters P120C',
    color: '#1a0808',
    accentColor: '#f87171',
    highlightColor: '#3a1010',
    icon: '🔥',
    description: 'Propulseurs à ergol solide latéraux fournissant l\'essentiel de la poussée au décollage.',
    details: [
      'Version A62 : 2 boosters · Version A64 : 4 boosters pour charges lourdes',
      'Moteur P120C identique au premier étage de Vega-C : mutualisation et économies d\'échelle',
      'Propergol solid HTPB mélangé à de l\'AP (perchlorate d\'ammonium) et de l\'Al en poudre',
      'Séparation à ~75 km après 130 s de combustion — retombent dans l\'Atlantique',
    ],
    stats: [
      { label: 'Config.', value: '2 (A62) ou 4 (A64)' },
      { label: 'Poussée chacun', value: '~450 tf' },
      { label: 'Durée combustion', value: '~130 s' },
    ],
  },
  vulcain: {
    id: 'vulcain',
    label: 'Moteur Vulcain 2.1',
    shortLabel: 'Vulcain 2.1',
    color: '#0a0a1a',
    accentColor: '#fbbf24',
    highlightColor: '#1a1a08',
    icon: '⚡',
    description: 'Moteur cryotechnique principal d\'Ariane 6, chef-d\'œuvre de l\'industrie spatiale européenne.',
    details: [
      'Chambres de combustion LH₂/LOX à cycle générateur de gaz — le plus efficace en volume',
      'Refroidissement régénératif : l\'hydrogène liquide circule dans les parois de la tuyère avant d\'être brûlé',
      'Tuyère orientable (TVC ±6°) pour guider le lanceur en roulis et tangage',
      'Durée de vie certifiée à 540 s — fabriqué à Vernon (Normandie) depuis 1994',
    ],
    stats: [
      { label: 'Poussée (vide)', value: '137 tf' },
      { label: 'Isp (vide)', value: '433 s' },
      { label: 'T° chambre', value: '~3 300°C' },
    ],
  },
};

// ─── Geometry constants ──────────────────────────────────────────
// All measurements in SVG units. The rocket is drawn at true Ariane 6 proportions:
// Total height ~58 m: coiffe ~14 m, EPC ~30 m, étage sup ~4 m, jupe ~2 m, tuyère ~4 m
// Rendered into SVG height 700, width 320.
// Diameter 5,4 m → 64px. Boosters ~3,4 m → 40px wide.

const W = 320;
const H = 720;
const CX = W / 2;

// Y positions (top of each component)
const Y_FAIRING_TIP  = 18;
const Y_FAIRING_BASE = 118;  // coiffe ~100px tall (14m)
const Y_PAYLOAD_TOP  = Y_FAIRING_BASE;
const Y_PAYLOAD_BOT  = 162;  // satellite bay ~44px
const Y_INTER_TOP    = Y_PAYLOAD_BOT; // interstage
const Y_INTER_BOT    = 186;
const Y_UPPER_TOP    = Y_INTER_BOT;
const Y_UPPER_BOT    = 246;  // upper stage ~60px (8m)
const Y_SKIRT_TOP    = Y_UPPER_BOT;
const Y_SKIRT_BOT    = 268;  // transition skirt
const Y_CORE_TOP     = Y_SKIRT_BOT;
const Y_CORE_BOT     = 570;  // EPC ~300px (30m) — biggest part
const Y_VULCAIN_TOP  = Y_CORE_BOT;
const Y_VULCAIN_BOT  = 644;  // tuyère ~74px
const Y_NOZZLE_EXIT  = 680;

// Half-widths
const HW_CORE   = 32;  // 5.4m corps
const HW_UPPER  = 26;  // 4.4m étage sup
const HW_INTER  = 29;
const HW_BOOSTER = 19; // booster ~3.2m
const BX_INNER  = HW_CORE + 2;   // inner edge of booster
const BX_OUTER  = BX_INNER + HW_BOOSTER * 2;
const Y_BOOST_TOP = 318;  // boosters start mid-core
const Y_BOOST_BOT = Y_CORE_BOT - 4;
const Y_BOOST_TIP = Y_BOOST_TOP - 36; // ogive tip

type PartId = 'fairing' | 'payload' | 'upper' | 'core' | 'boosters' | 'vulcain';

interface ExplodedOffsets { [key: string]: { dx: number; dy: number } }

function getOffsets(exploded: boolean): ExplodedOffsets {
  if (!exploded) return {
    fairing: { dx: 0, dy: 0 },
    payload: { dx: 0, dy: 0 },
    upper:   { dx: 0, dy: 0 },
    core:    { dx: 0, dy: 0 },
    boosters_left:  { dx: 0, dy: 0 },
    boosters_right: { dx: 0, dy: 0 },
    vulcain: { dx: 0, dy: 0 },
  };
  return {
    fairing:        { dx: 0,   dy: -100 },
    payload:        { dx: 0,   dy: -60  },
    upper:          { dx: 0,   dy: -22  },
    core:           { dx: 0,   dy: 0    },
    boosters_left:  { dx: -28, dy: 0    },
    boosters_right: { dx: 28,  dy: 0    },
    vulcain:        { dx: 0,   dy: 28   },
  };
}

const TRANSITION = 'transform 0.65s cubic-bezier(.34,1.15,.64,1)';

export function Ariane6Diagram() {
  const [active, setActive] = useState<PartId | null>(null);
  const [exploded, setExploded] = useState(false);

  const offsets = getOffsets(exploded);
  const activePart = active ? PARTS[active] : null;

  const click = (id: PartId) => setActive(prev => prev === id ? null : id);
  const isActive = (id: PartId) => active === id;

  const fill = (id: PartId) => isActive(id) ? PARTS[id].highlightColor : PARTS[id].color;
  const stroke = (id: PartId) => PARTS[id].accentColor;
  const sw = (id: PartId) => isActive(id) ? 1.8 : 0.9;
  const so = (id: PartId) => isActive(id) ? 1 : 0.55;

  const tf = (key: string) => {
    const o = offsets[key] || { dx: 0, dy: 0 };
    return `translate(${o.dx}, ${o.dy})`;
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 pt-6 pb-3">
        <h3 className="text-xl font-bold text-white">Ariane 6 — Schéma Interactif</h3>
        <p className="text-sm text-gray-400 mt-1">Cliquez sur un composant pour en connaître le rôle et les caractéristiques.</p>
      </div>

      <div className="px-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => setExploded(e => !e)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${
            exploded
              ? 'bg-orange-500/20 border-orange-400/50 text-orange-300'
              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${exploded ? 'bg-orange-400' : 'bg-gray-600'}`} />
          {exploded ? 'Vue éclatée' : 'Vue assemblée'}
        </button>
        <span className="text-xs text-gray-600">Séparer les étages</span>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ── SVG ── */}
        <div className="flex-shrink-0 flex items-start justify-center px-2 pb-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ maxWidth: 320, minWidth: 220 }}
            className="select-none"
          >
            <defs>
              {/* Core gradient — metallic silver */}
              <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#1a1a2a" />
                <stop offset="20%"  stopColor="#2a2a3e" />
                <stop offset="50%"  stopColor="#3a3a52" />
                <stop offset="80%"  stopColor="#2a2a3e" />
                <stop offset="100%" stopColor="#1a1a2a" />
              </linearGradient>
              <linearGradient id="upperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#12122a" />
                <stop offset="40%"  stopColor="#22224a" />
                <stop offset="60%"  stopColor="#22224a" />
                <stop offset="100%" stopColor="#12122a" />
              </linearGradient>
              <linearGradient id="fairingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#0c1e38" />
                <stop offset="35%"  stopColor="#16305a" />
                <stop offset="65%"  stopColor="#16305a" />
                <stop offset="100%" stopColor="#0c1e38" />
              </linearGradient>
              <linearGradient id="boosterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#1a0808" />
                <stop offset="40%"  stopColor="#2e1010" />
                <stop offset="100%" stopColor="#1a0808" />
              </linearGradient>
              <linearGradient id="vulcainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#080808" />
                <stop offset="30%"  stopColor="#181818" />
                <stop offset="70%"  stopColor="#181818" />
                <stop offset="100%" stopColor="#080808" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Stars */}
            {Array.from({ length: 40 }, (_, i) => (
              <circle key={i}
                cx={(i * 137.5 + 11) % W} cy={(i * 89.3 + 33) % H}
                r={i % 6 === 0 ? 1 : 0.6}
                fill="white" opacity={0.1 + (i % 4) * 0.06}
              />
            ))}

            {/* ══════════════ VULCAIN 2.1 NOZZLE ══════════════ */}
            <g style={{ transition: TRANSITION, transform: tf('vulcain') }}
               onClick={() => click('vulcain')} className="cursor-pointer">
              {/* Throat */}
              <path
                d={`M ${CX - HW_CORE} ${Y_VULCAIN_TOP}
                    L ${CX + HW_CORE} ${Y_VULCAIN_TOP}
                    L ${CX + 22} ${Y_VULCAIN_TOP + 22}
                    L ${CX + 26} ${Y_NOZZLE_EXIT - 14}
                    Q ${CX + 26} ${Y_NOZZLE_EXIT} ${CX + 18} ${Y_NOZZLE_EXIT}
                    L ${CX - 18} ${Y_NOZZLE_EXIT}
                    Q ${CX - 26} ${Y_NOZZLE_EXIT} ${CX - 26} ${Y_NOZZLE_EXIT - 14}
                    L ${CX - 22} ${Y_VULCAIN_TOP + 22}
                    Z`}
                fill={isActive('vulcain') ? PARTS.vulcain.highlightColor : 'url(#vulcainGrad)'}
                stroke={stroke('vulcain')} strokeWidth={sw('vulcain')} opacity={so('vulcain')}
              />
              {/* Internal cooling ribs */}
              {[-14, -7, 0, 7, 14].map(dx => (
                <line key={dx}
                  x1={CX + dx} y1={Y_VULCAIN_TOP + 10}
                  x2={CX + dx * 0.7} y2={Y_NOZZLE_EXIT - 10}
                  stroke={PARTS.vulcain.accentColor} strokeWidth={0.4} opacity={0.2}
                />
              ))}
              {/* Combustion chamber above throat */}
              <rect
                x={CX - 14} y={Y_VULCAIN_TOP - 20}
                width={28} height={22}
                fill={isActive('vulcain') ? '#1a1a10' : '#0c0c14'}
                stroke={PARTS.vulcain.accentColor} strokeWidth={0.8} opacity={0.7}
                rx={3}
              />
              <text x={CX} y={Y_NOZZLE_EXIT - 30} textAnchor="middle"
                fill={PARTS.vulcain.accentColor} fontSize={7} opacity={0.5} fontFamily="monospace">
                VULCAIN 2.1
              </text>
              {isActive('vulcain') && (
                <path
                  d={`M ${CX - HW_CORE} ${Y_VULCAIN_TOP} L ${CX + HW_CORE} ${Y_VULCAIN_TOP}
                      L ${CX + 26} ${Y_NOZZLE_EXIT} L ${CX - 26} ${Y_NOZZLE_EXIT} Z`}
                  fill="none" stroke={PARTS.vulcain.accentColor} strokeWidth={3} opacity={0.15}
                  filter="url(#glow)"
                />
              )}
            </g>

            {/* ══════════════ BOOSTERS P120C (left) ══════════════ */}
            <g style={{ transition: TRANSITION, transform: tf('boosters_left') }}
               onClick={() => click('boosters')} className="cursor-pointer">
              {/* Ogive tip booster gauche */}
              <path
                d={`M ${CX - BX_INNER - HW_BOOSTER} ${Y_BOOST_TIP + 26}
                    Q ${CX - BX_INNER - HW_BOOSTER} ${Y_BOOST_TIP} ${CX - BX_INNER - HW_BOOSTER / 2} ${Y_BOOST_TIP}
                    Q ${CX - BX_INNER} ${Y_BOOST_TIP} ${CX - BX_INNER} ${Y_BOOST_TIP + 26}
                    Z`}
                fill={isActive('boosters') ? PARTS.boosters.highlightColor : 'url(#boosterGrad)'}
                stroke={stroke('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              {/* Corps cylindrique gauche */}
              <rect
                x={CX - BX_OUTER} y={Y_BOOST_TOP}
                width={HW_BOOSTER * 2} height={Y_BOOST_BOT - Y_BOOST_TOP}
                fill={isActive('boosters') ? PARTS.boosters.highlightColor : 'url(#boosterGrad)'}
                stroke={stroke('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              {/* Tuyère booster gauche */}
              <path
                d={`M ${CX - BX_OUTER + 3} ${Y_BOOST_BOT}
                    L ${CX - BX_INNER - 3} ${Y_BOOST_BOT}
                    L ${CX - BX_INNER - 1} ${Y_BOOST_BOT + 20}
                    L ${CX - BX_OUTER + 1} ${Y_BOOST_BOT + 20}
                    Z`}
                fill="#0a0a14" stroke={PARTS.boosters.accentColor} strokeWidth={0.7} opacity={0.7}
              />
              {/* Banding stripes */}
              {[60, 120, 180].map(dy => (
                <line key={dy}
                  x1={CX - BX_OUTER} y1={Y_BOOST_TOP + dy}
                  x2={CX - BX_INNER} y2={Y_BOOST_TOP + dy}
                  stroke={PARTS.boosters.accentColor} strokeWidth={0.6} opacity={0.2}
                />
              ))}
              <text
                x={CX - BX_INNER - HW_BOOSTER} y={Y_BOOST_TOP + 80}
                textAnchor="middle" fill={PARTS.boosters.accentColor}
                fontSize={6.5} opacity={0.45} fontFamily="monospace"
                transform={`rotate(-90, ${CX - BX_INNER - HW_BOOSTER}, ${Y_BOOST_TOP + 80})`}
              >P120C</text>
            </g>

            {/* ══════════════ BOOSTERS P120C (right) ══════════════ */}
            <g style={{ transition: TRANSITION, transform: tf('boosters_right') }}
               onClick={() => click('boosters')} className="cursor-pointer">
              <path
                d={`M ${CX + BX_INNER} ${Y_BOOST_TIP + 26}
                    Q ${CX + BX_INNER} ${Y_BOOST_TIP} ${CX + BX_INNER + HW_BOOSTER / 2} ${Y_BOOST_TIP}
                    Q ${CX + BX_OUTER} ${Y_BOOST_TIP} ${CX + BX_OUTER} ${Y_BOOST_TIP + 26}
                    Z`}
                fill={isActive('boosters') ? PARTS.boosters.highlightColor : 'url(#boosterGrad)'}
                stroke={stroke('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              <rect
                x={CX + BX_INNER} y={Y_BOOST_TOP}
                width={HW_BOOSTER * 2} height={Y_BOOST_BOT - Y_BOOST_TOP}
                fill={isActive('boosters') ? PARTS.boosters.highlightColor : 'url(#boosterGrad)'}
                stroke={stroke('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              <path
                d={`M ${CX + BX_INNER + 3} ${Y_BOOST_BOT}
                    L ${CX + BX_OUTER - 3} ${Y_BOOST_BOT}
                    L ${CX + BX_OUTER - 1} ${Y_BOOST_BOT + 20}
                    L ${CX + BX_INNER + 1} ${Y_BOOST_BOT + 20}
                    Z`}
                fill="#0a0a14" stroke={PARTS.boosters.accentColor} strokeWidth={0.7} opacity={0.7}
              />
              {[60, 120, 180].map(dy => (
                <line key={dy}
                  x1={CX + BX_INNER} y1={Y_BOOST_TOP + dy}
                  x2={CX + BX_OUTER} y2={Y_BOOST_TOP + dy}
                  stroke={PARTS.boosters.accentColor} strokeWidth={0.6} opacity={0.2}
                />
              ))}
              <text
                x={CX + BX_INNER + HW_BOOSTER} y={Y_BOOST_TOP + 80}
                textAnchor="middle" fill={PARTS.boosters.accentColor}
                fontSize={6.5} opacity={0.45} fontFamily="monospace"
                transform={`rotate(90, ${CX + BX_INNER + HW_BOOSTER}, ${Y_BOOST_TOP + 80})`}
              >P120C</text>
            </g>

            {/* ══════════════ CORE STAGE (EPC) ══════════════ */}
            <g style={{ transition: TRANSITION, transform: tf('core') }}
               onClick={() => click('core')} className="cursor-pointer">
              <rect
                x={CX - HW_CORE} y={Y_CORE_TOP}
                width={HW_CORE * 2} height={Y_CORE_BOT - Y_CORE_TOP}
                fill={isActive('core') ? PARTS.core.highlightColor : 'url(#coreGrad)'}
                stroke={stroke('core')} strokeWidth={sw('core')} opacity={so('core')}
              />
              {/* LH2/LOX tank separator */}
              <line x1={CX - HW_CORE} y1={Y_CORE_TOP + 180} x2={CX + HW_CORE} y2={Y_CORE_TOP + 180}
                stroke={PARTS.core.accentColor} strokeWidth={1.2} opacity={0.25} />
              {/* Weld rings / manufacturing rings */}
              {[40, 90, 140, 220, 270].map(dy => (
                <line key={dy}
                  x1={CX - HW_CORE} y1={Y_CORE_TOP + dy}
                  x2={CX + HW_CORE} y2={Y_CORE_TOP + dy}
                  stroke="#4a4a6a" strokeWidth={0.5} opacity={0.3}
                />
              ))}
              {/* Tank labels */}
              <text x={CX} y={Y_CORE_TOP + 90} textAnchor="middle"
                fill={PARTS.core.accentColor} fontSize={8} opacity={0.35} fontFamily="monospace">LH₂</text>
              <text x={CX} y={Y_CORE_TOP + 240} textAnchor="middle"
                fill={PARTS.core.accentColor} fontSize={8} opacity={0.35} fontFamily="monospace">LOX</text>
              {/* ARIANE 6 marking */}
              <text x={CX} y={Y_CORE_TOP + 160} textAnchor="middle"
                fill="#6a6a8a" fontSize={8} opacity={0.3} fontFamily="monospace" letterSpacing={2}>ARIANE 6</text>
              {/* Attach struts for boosters — horizontal lines */}
              <line x1={CX - HW_CORE} y1={Y_BOOST_TOP + 20} x2={CX - BX_OUTER} y2={Y_BOOST_TOP + 20}
                stroke="#6a6a8a" strokeWidth={0.8} opacity={0.25} />
              <line x1={CX + HW_CORE} y1={Y_BOOST_TOP + 20} x2={CX + BX_OUTER} y2={Y_BOOST_TOP + 20}
                stroke="#6a6a8a" strokeWidth={0.8} opacity={0.25} />
              <line x1={CX - HW_CORE} y1={Y_BOOST_BOT - 20} x2={CX - BX_OUTER} y2={Y_BOOST_BOT - 20}
                stroke="#6a6a8a" strokeWidth={0.8} opacity={0.25} />
              <line x1={CX + HW_CORE} y1={Y_BOOST_BOT - 20} x2={CX + BX_OUTER} y2={Y_BOOST_BOT - 20}
                stroke="#6a6a8a" strokeWidth={0.8} opacity={0.25} />
              {isActive('core') && (
                <rect
                  x={CX - HW_CORE} y={Y_CORE_TOP}
                  width={HW_CORE * 2} height={Y_CORE_BOT - Y_CORE_TOP}
                  fill="none" stroke={PARTS.core.accentColor} strokeWidth={3} opacity={0.12}
                  filter="url(#glow)"
                />
              )}
            </g>

            {/* ══════════════ SKIRT / TRANSITION ══════════════ */}
            <g style={{ transition: TRANSITION, transform: tf('upper') }}
               onClick={() => click('upper')} className="cursor-pointer">
              {/* Transition skirt from upper to core */}
              <path
                d={`M ${CX - HW_UPPER} ${Y_SKIRT_TOP} L ${CX + HW_UPPER} ${Y_SKIRT_TOP}
                    L ${CX + HW_CORE} ${Y_SKIRT_BOT} L ${CX - HW_CORE} ${Y_SKIRT_BOT} Z`}
                fill={isActive('upper') ? PARTS.upper.highlightColor : 'url(#upperGrad)'}
                stroke={stroke('upper')} strokeWidth={sw('upper')} opacity={so('upper')}
              />
              {/* Upper stage cylinder */}
              <rect
                x={CX - HW_UPPER} y={Y_UPPER_TOP}
                width={HW_UPPER * 2} height={Y_UPPER_BOT - Y_UPPER_TOP}
                fill={isActive('upper') ? PARTS.upper.highlightColor : 'url(#upperGrad)'}
                stroke={stroke('upper')} strokeWidth={sw('upper')} opacity={so('upper')}
              />
              {/* Vinci nozzle stub (small, tucked inside) */}
              <path
                d={`M ${CX - 9} ${Y_UPPER_BOT - 4} L ${CX + 9} ${Y_UPPER_BOT - 4}
                    L ${CX + 12} ${Y_UPPER_BOT + 10} L ${CX - 12} ${Y_UPPER_BOT + 10} Z`}
                fill="#08080e" stroke={PARTS.upper.accentColor} strokeWidth={0.7} opacity={0.6}
              />
              <text x={CX} y={Y_UPPER_TOP + 32} textAnchor="middle"
                fill={PARTS.upper.accentColor} fontSize={7} opacity={0.45} fontFamily="monospace">VINCI</text>
              {/* Weld rings */}
              <line x1={CX - HW_UPPER} y1={Y_UPPER_TOP + 20} x2={CX + HW_UPPER} y2={Y_UPPER_TOP + 20}
                stroke={PARTS.upper.accentColor} strokeWidth={0.5} opacity={0.2} />
            </g>

            {/* ══════════════ INTERSTAGE ══════════════ */}
            <g style={{ transition: TRANSITION, transform: tf('payload') }}
               onClick={() => click('payload')} className="cursor-pointer">
              <path
                d={`M ${CX - HW_UPPER} ${Y_INTER_TOP} L ${CX + HW_UPPER} ${Y_INTER_TOP}
                    L ${CX + HW_UPPER} ${Y_INTER_BOT} L ${CX - HW_UPPER} ${Y_INTER_BOT} Z`}
                fill={isActive('payload') ? PARTS.payload.highlightColor : '#0c1a10'}
                stroke={PARTS.payload.accentColor} strokeWidth={sw('payload')} opacity={so('payload')}
              />
              {/* Separation ring visual */}
              <line x1={CX - HW_UPPER} y1={Y_INTER_TOP + 10} x2={CX + HW_UPPER} y2={Y_INTER_TOP + 10}
                stroke={PARTS.payload.accentColor} strokeWidth={1} opacity={0.3} />
              {/* Satellite body */}
              <rect
                x={CX - 20} y={Y_PAYLOAD_TOP + 4}
                width={40} height={34}
                fill={isActive('payload') ? '#1a3a2a' : '#0e2018'}
                stroke={PARTS.payload.accentColor} strokeWidth={sw('payload')} opacity={so('payload')}
                rx={1}
              />
              {/* Solar panels */}
              <rect x={CX - 42} y={Y_PAYLOAD_TOP + 14} width={20} height={10}
                fill={PARTS.payload.accentColor} opacity={0.35} rx={1} />
              <line x1={CX - 22} y1={Y_PAYLOAD_TOP + 19} x2={CX - 42} y2={Y_PAYLOAD_TOP + 19}
                stroke={PARTS.payload.accentColor} strokeWidth={0.8} opacity={0.4} />
              <rect x={CX + 22} y={Y_PAYLOAD_TOP + 14} width={20} height={10}
                fill={PARTS.payload.accentColor} opacity={0.35} rx={1} />
              <line x1={CX + 22} y1={Y_PAYLOAD_TOP + 19} x2={CX + 42} y2={Y_PAYLOAD_TOP + 19}
                stroke={PARTS.payload.accentColor} strokeWidth={0.8} opacity={0.4} />
            </g>

            {/* ══════════════ FAIRING (ogive + cylindre) ══════════════ */}
            <g style={{ transition: TRANSITION, transform: tf('fairing') }}
               onClick={() => click('fairing')} className="cursor-pointer">
              {/* Left half fairing */}
              <path
                d={`M ${CX} ${Y_FAIRING_TIP}
                    Q ${CX + 4} ${Y_FAIRING_TIP + 30} ${CX + HW_UPPER} ${Y_FAIRING_TIP + 60}
                    L ${CX + HW_UPPER} ${Y_FAIRING_BASE}
                    L ${CX} ${Y_FAIRING_BASE} Z`}
                fill={isActive('fairing') ? PARTS.fairing.highlightColor : 'url(#fairingGrad)'}
                stroke={stroke('fairing')} strokeWidth={sw('fairing')} opacity={so('fairing')}
              />
              {/* Right half fairing */}
              <path
                d={`M ${CX} ${Y_FAIRING_TIP}
                    Q ${CX - 4} ${Y_FAIRING_TIP + 30} ${CX - HW_UPPER} ${Y_FAIRING_TIP + 60}
                    L ${CX - HW_UPPER} ${Y_FAIRING_BASE}
                    L ${CX} ${Y_FAIRING_BASE} Z`}
                fill={isActive('fairing') ? '#1a3060' : '#0e2040'}
                stroke={stroke('fairing')} strokeWidth={sw('fairing')} opacity={so('fairing')}
              />
              {/* Separation seam */}
              <line x1={CX} y1={Y_FAIRING_TIP} x2={CX} y2={Y_FAIRING_BASE}
                stroke={PARTS.fairing.accentColor} strokeWidth={0.7} opacity={0.3} strokeDasharray="4 3" />
              {/* Panel lines */}
              <line x1={CX + 8} y1={Y_FAIRING_TIP + 20} x2={CX + HW_UPPER - 2} y2={Y_FAIRING_TIP + 76}
                stroke={PARTS.fairing.accentColor} strokeWidth={0.4} opacity={0.15} />
              <line x1={CX - 8} y1={Y_FAIRING_TIP + 20} x2={CX - HW_UPPER + 2} y2={Y_FAIRING_TIP + 76}
                stroke={PARTS.fairing.accentColor} strokeWidth={0.4} opacity={0.15} />
              {/* Base ring */}
              <rect x={CX - HW_UPPER} y={Y_FAIRING_BASE - 5} width={HW_UPPER * 2} height={6}
                fill="#0c1830" stroke={PARTS.fairing.accentColor} strokeWidth={0.7} opacity={0.5} />
              {isActive('fairing') && (
                <path
                  d={`M ${CX - HW_UPPER} ${Y_FAIRING_BASE} L ${CX + HW_UPPER} ${Y_FAIRING_BASE}
                      L ${CX} ${Y_FAIRING_TIP} Z`}
                  fill="none" stroke={PARTS.fairing.accentColor} strokeWidth={2.5} opacity={0.15}
                  filter="url(#glow)"
                />
              )}
            </g>

            {/* ══════════════ CALLOUT LINES ══════════════ */}
            {/* These are drawn last so they appear on top, unaffected by transforms */}
            {[
              { id: 'fairing',  x1: CX + HW_UPPER + 2, y1: Y_FAIRING_TIP + 40,  x2: W - 30, label: 'Coiffe' },
              { id: 'payload',  x1: CX + HW_UPPER + 2, y1: Y_PAYLOAD_TOP + 22,  x2: W - 30, label: 'Satellite' },
              { id: 'upper',    x1: CX + HW_UPPER + 2, y1: Y_UPPER_TOP + 30,    x2: W - 30, label: 'Ét. sup.' },
              { id: 'core',     x1: CX + HW_CORE + 2,  y1: Y_CORE_TOP + 80,     x2: W - 30, label: 'EPC' },
              { id: 'boosters', x1: CX + BX_OUTER + 2, y1: Y_BOOST_TOP + 60,    x2: W - 30, label: 'P120C' },
              { id: 'vulcain',  x1: CX + 28,           y1: Y_VULCAIN_TOP + 40,  x2: W - 30, label: 'Vulcain' },
            ].map(c => {
              const isAct = active === c.id;
              const color = PARTS[c.id as PartId].accentColor;
              return (
                <g key={c.id} opacity={isAct ? 1 : 0.35} className="pointer-events-none"
                   style={{ transition: 'opacity 0.3s' }}>
                  <line x1={c.x1} y1={c.y1} x2={c.x2 - 36} y2={c.y1}
                    stroke={color} strokeWidth={isAct ? 1 : 0.6} />
                  <circle cx={c.x1} cy={c.y1} r={2} fill={color} />
                  <text x={c.x2 - 32} y={c.y1} dominantBaseline="middle"
                    fill={color} fontSize={8.5} fontFamily="monospace" fontWeight={isAct ? 700 : 400}>
                    {c.label}
                  </text>
                </g>
              );
            })}

          </svg>
        </div>

        {/* ── Detail panel ── */}
        <div className="flex-1 p-5 min-h-[280px] flex flex-col justify-center">
          {!activePart && (
            <div className="py-4">
              <p className="text-gray-400 text-sm mb-5">Sélectionnez un élément du lanceur pour découvrir son rôle et ses caractéristiques techniques.</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(PARTS).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p.id as PartId)}
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


export { Ariane6Diagram }