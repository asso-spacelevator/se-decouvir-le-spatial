import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface Source { label: string; url: string }

interface Part {
  id: string;
  label: string;
  shortLabel: string;
  accentColor: string;
  description: React.ReactNode;
  details: string[];
  stats: { label: string; value: string }[];
  sources: Source[];
}

const PARTS: Record<string, Part> = {
  fairing: {
    id: 'fairing',
    label: 'Coiffe (Payload Fairing)',
    shortLabel: 'Coiffe',
    accentColor: '#60a5fa',
    description:
      "Carénage aérodynamique en fibre de carbone/Kevlar qui protège la charge utile des contraintes thermiques et mécaniques lors de la traversée de l'atmosphère. Elle se sépare en deux demi-coques pyrotechniques vers 110 km d'altitude, quand la pression dynamique devient négligeable.",
    details: [
      "Séparation à ~110 km d'altitude par charges pyrotechniques",
      'Deux diamètres disponibles : 4,5 m (standard) et 5,4 m (Short/Long)',
      'Structure sandwich en fibres de carbone et Kevlar, extrêmement légère',
      "Protège aussi contre l'humidité, les chocs acoustiques et les vibrations au sol",
    ],
    stats: [
      { label: 'Diamètre', value: '4,5 ou 5,4 m' },
      { label: 'Hauteur', value: '~14 m' },
      { label: 'Séparation', value: '~110 km' },
    ],
    sources: [
      { label: 'Ariane 6 : tout savoir — CNES', url: 'https://cnes.fr/actualites/ariane-6-tout-savoir-sur-le-lanceur-europeen' },
      { label: 'Ariane 6 en détail — Futura Sciences', url: 'https://www.futura-sciences.com/sciences/dossiers/astronautique-ariane-6-futur-lanceur-europeen-1878/' },
    ],
  },
  payload: {
    id: 'payload',
    label: 'Charge Utile (Satellite)',
    shortLabel: 'Satellite',
    accentColor: '#34d399',
    description:
      "La charge utile est le satellite ou l'équipement scientifique que la fusée doit déposer sur son orbite cible. Elle est fixée sous la coiffe grâce à un adaptateur standardisé et libérée par un mécanisme pyrotechnique une fois l'orbite atteinte.",
    details: [
      'Capacité jusqu\'à 11,5 t en orbite de transfert géostationnaire (GTO)',
      'Jusqu\'à 21,6 t en orbite basse (LEO) pour la version A64',
      'Possibilité de lancer plusieurs petits satellites simultanément (Rideshare)',
      'Interfaces mécaniques et électriques standardisées, 100 % européennes (ITAR-free)',
    ],
    stats: [
      { label: 'Max GTO', value: '11,5 t' },
      { label: 'Max LEO', value: '21,6 t' },
      { label: 'Volume utile', value: '~340 m³' },
    ],
    sources: [
      { label: 'Performances d\'Ariane 6 — ArianeGroup', url: 'https://www.arianespace.com/vehicle/ariane-6/' },
      { label: 'Charge utile spatiale — Futura Sciences', url: 'https://www.futura-sciences.com/sciences/definitions/astronautique-charge-utile-2249/' },
    ],
  },
  upper: {
    id: 'upper',
    label: 'Étage Supérieur (ULPM)',
    shortLabel: 'Étage sup.',
    accentColor: '#67e8f9',
    description: (
      <>
        L'Upper Liquid Propulsion Module est l'étage{' '}
        <a
          href="https://www.futura-sciences.com/sciences/definitions/univers-etage-principal-cryogenique-3456/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2 hover:opacity-80 transition-opacity"
          style={{ color: '#67e8f9' }}
        >
          cryotechnique
        </a>
        {' '}qui assure la mise sur orbite précise. Son moteur Vinci, rallumable jusqu'à 5 fois, permet des missions à orbites multiples : il largue des satellites sur des orbites différentes au cours d'un même vol.
      </>
    ),
    details: [
      'Moteur Vinci (HM7B sur A62) : rallumable jusqu\'à 5 fois en vol',
      'Propergols cryotechniques : LH₂ (−253 °C) + LOX (−183 °C)',
      "Réservoir torique LOX entourant le réservoir central LH₂",
      'Permet les missions Rideshare multi-orbites et la déorbitation maîtrisée',
    ],
    stats: [
      { label: 'Moteur', value: 'Vinci / HM7B' },
      { label: 'Rallumages', value: 'Jusqu\'à 5×' },
      { label: 'Poussée', value: '180 kN' },
    ],
    sources: [
      { label: 'L\'étage supérieur Vinci — CNES', url: 'https://cnes.fr/actualites/ariane-6-tout-savoir-sur-le-lanceur-europeen' },
      { label: 'Moteur Vinci — Futura Sciences', url: 'https://www.futura-sciences.com/sciences/actualites/astronautique-moteur-vinci-ariane-6-passe-test-cle-73821/' },
    ],
  },
  core: {
    id: 'core',
    label: 'Étage Principal (EPC)',
    shortLabel: 'Étage principal',
    accentColor: '#fb923c',
    description:
      "L'Étage Principal Cryotechnique (EPC) est le corps central d'Ariane 6. Il contient les gigantesques réservoirs d'hydrogène et d'oxygène liquides qui alimentent le moteur Vulcain 2.1 pendant environ 470 secondes de vol.",
    details: [
      'Réservoir LH₂ (~145 t) en partie haute, réservoir LOX (~30 t) en partie basse',
      'Structure en alliage aluminium-lithium 2195, ultra-légère',
      'Fabriqué par ArianeGroup à Brême (Allemagne) et Vernon (France)',
      'Durée de combustion : ~470 s de T+0 jusqu\'à séparation',
    ],
    stats: [
      { label: 'Longueur', value: '~30 m' },
      { label: 'Diamètre', value: '5,4 m' },
      { label: 'Propergols', value: '~175 t' },
    ],
    sources: [
      { label: 'L\'EPC d\'Ariane 6 — ArianeGroup', url: 'https://www.arianespace.com/vehicle/ariane-6/' },
      { label: 'Ariane 6, le lanceur européen — Futura Sciences', url: 'https://www.futura-sciences.com/sciences/dossiers/astronautique-ariane-6-futur-lanceur-europeen-1878/' },
    ],
  },
  boosters: {
    id: 'boosters',
    label: 'Boosters à Poudre (P120C)',
    shortLabel: 'Boosters P120C',
    accentColor: '#f87171',
    description:
      "Les propulseurs à ergol solide P120C fournissent l'essentiel de la poussée au décollage. Ariane 6 en embarque 2 (version A62) ou 4 (version A64). Le P120C est commun avec le lanceur Vega-C, ce qui réduit les coûts de développement.",
    details: [
      'A62 : 2 boosters (charges moyennes) · A64 : 4 boosters (charges lourdes)',
      'Propergol composite : HTPB + perchlorate d\'ammonium + aluminium',
      'Combustion de ~130 s, séparation vers 75 km d\'altitude',
      'Moteur commun avec Vega-C : économies d\'échelle européennes',
    ],
    stats: [
      { label: 'Config.', value: '2 (A62) ou 4 (A64)' },
      { label: 'Poussée unit.', value: '~450 tf' },
      { label: 'Combustion', value: '~130 s' },
    ],
    sources: [
      { label: 'Les boosters P120C — CNES', url: 'https://cnes.fr/actualites/ariane-6-tout-savoir-sur-le-lanceur-europeen' },
      { label: 'P120C, le booster commun — Futura Sciences', url: 'https://www.futura-sciences.com/sciences/actualites/astronautique-p120c-boosters-ariane-6-vega-c-prets-100761/' },
    ],
  },
  vulcain: {
    id: 'vulcain',
    label: 'Moteur Vulcain 2.1',
    shortLabel: 'Vulcain 2.1',
    accentColor: '#fbbf24',
    description:
      "Le Vulcain 2.1 est le moteur principal cryotechnique de l'EPC. Chef-d'œuvre de l'industrie spatiale européenne, il brûle de l'hydrogène et de l'oxygène liquides à plus de 3 300 °C, avec un système de refroidissement régénératif et une tuyère orientable pour le guidage en vol.",
    details: [
      'Cycle générateur de gaz LH₂/LOX : ~3 300 °C en chambre de combustion',
      'Refroidissement régénératif : l\'H₂ circule dans les parois de la tuyère avant combustion',
      'Tuyère orientable (TVC) ±6° pour le contrôle d\'attitude en vol',
      'Fabriqué à Vernon (Normandie) depuis 1994, 2.1 = version allégée d\'Ariane 6',
    ],
    stats: [
      { label: 'Poussée (vide)', value: '137 tf' },
      { label: 'Isp (vide)', value: '433 s' },
      { label: 'T° chambre', value: '~3 300 °C' },
    ],
    sources: [
      { label: 'Vulcain 2.1 — ArianeGroup', url: 'https://www.arianespace.com/vehicle/ariane-6/' },
      { label: 'Le moteur Vulcain — Futura Sciences', url: 'https://www.futura-sciences.com/sciences/definitions/astronautique-vulcain-2398/' },
    ],
  },
};

// ─── Geometry ────────────────────────────────────────────────────
const W  = 340;
const H  = 680;
const CX = W / 2;

const HW_CORE  = 30;

const Y_FAIR_TIP  = 16;
const Y_FAIR_CYL  = 110;
const Y_FAIR_BASE = 148;

const Y_SAT_TOP = 60;
const Y_SAT_BOT = 140;
const HW_SAT    = 18;

const HW_UPPER   = 24;
const Y_UP_TOP   = Y_FAIR_BASE;
const Y_UP_BOT   = 212;

const Y_SK_TOP = Y_UP_BOT;
const Y_SK_BOT = 232;

const Y_CORE_TOP = Y_SK_BOT;
const Y_CORE_BOT = 530;

const HW_BOOST   = 16;
const BX_INNER   = HW_CORE + 3;
const BX_OUTER   = BX_INNER + HW_BOOST * 2;
const Y_BOST_TIP = 330;
const Y_BOST_CYL = 358;
const Y_BOST_BOT = Y_CORE_BOT + 2;

const Y_NOZZ_TOP  = Y_CORE_BOT;
const Y_NOZZ_NECK = Y_NOZZ_TOP + 18;
const Y_NOZZ_EXIT = Y_NOZZ_TOP + 58;
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
        <p className="text-sm text-gray-400 mt-1">Cliquez sur un composant pour découvrir son rôle et ses sources.</p>
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

            {Array.from({ length: 44 }, (_, i) => (
              <circle key={i}
                cx={(i * 133.7 + 17) % W} cy={(i * 91.3 + 29) % H}
                r={i % 7 === 0 ? 1.1 : 0.55}
                fill="white" opacity={0.08 + (i % 5) * 0.05}
              />
            ))}

            {/* ══ VULCAIN 2.1 ══ */}
            <g onClick={() => click('vulcain')} className="cursor-pointer" style={{ filter: glow('vulcain') }}>
              <path d={`
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
              {[-18, -10, 0, 10, 18].map(dx => (
                <line key={dx}
                  x1={CX + dx * 0.33} y1={Y_NOZZ_NECK + 4}
                  x2={CX + dx} y2={Y_NOZZ_EXIT - 6}
                  stroke={ac('vulcain')} strokeWidth={0.4} opacity={0.2}
                />
              ))}
              <rect x={CX - 11} y={Y_NOZZ_TOP - 16} width={22} height={18}
                fill={isActive('vulcain') ? '#1a1a0c' : '#0c0c10'}
                stroke={ac('vulcain')} strokeWidth={0.9} opacity={0.75} rx={2}
              />
              <text x={CX} y={Y_NOZZ_EXIT - 14} textAnchor="middle"
                fill={ac('vulcain')} fontSize={6.5} opacity={0.45} fontFamily="monospace">VULCAIN 2.1</text>
            </g>

            {/* ══ EPC CORE ══ */}
            <g onClick={() => click('core')} className="cursor-pointer" style={{ filter: glow('core') }}>
              <rect x={CX - HW_CORE} y={Y_CORE_TOP} width={HW_CORE * 2} height={Y_CORE_BOT - Y_CORE_TOP}
                fill={isActive('core') ? '#2a1a08' : 'url(#g_core)'}
                stroke={ac('core')} strokeWidth={sw('core')} opacity={so('core')}
              />
              {[50, 110, 170, 240, 310, 380].map(dy => (
                <line key={dy}
                  x1={CX - HW_CORE} y1={Y_CORE_TOP + dy}
                  x2={CX + HW_CORE} y2={Y_CORE_TOP + dy}
                  stroke="#404060" strokeWidth={0.5} opacity={0.35}
                />
              ))}
              <line x1={CX - HW_CORE} y1={Y_CORE_TOP + 190} x2={CX + HW_CORE} y2={Y_CORE_TOP + 190}
                stroke={ac('core')} strokeWidth={1.2} opacity={0.3} />
              <text x={CX} y={Y_CORE_TOP + 96} textAnchor="middle"
                fill={ac('core')} fontSize={8} opacity={0.3} fontFamily="monospace">LH₂</text>
              <text x={CX} y={Y_CORE_TOP + 265} textAnchor="middle"
                fill={ac('core')} fontSize={8} opacity={0.3} fontFamily="monospace">LOX</text>
              <text x={CX} y={Y_CORE_TOP + 192} textAnchor="middle"
                fill="#505070" fontSize={7} opacity={0.25} letterSpacing={2}>ARIANE 6</text>
              {[20, Y_BOST_BOT - Y_BOST_CYL - 10].map((dy, i) => (
                <g key={i}>
                  <line x1={CX - HW_CORE} y1={Y_BOST_CYL + dy} x2={CX - BX_OUTER} y2={Y_BOST_CYL + dy}
                    stroke="#505070" strokeWidth={1} opacity={0.3} />
                  <line x1={CX + HW_CORE} y1={Y_BOST_CYL + dy} x2={CX + BX_OUTER} y2={Y_BOST_CYL + dy}
                    stroke="#505070" strokeWidth={1} opacity={0.3} />
                </g>
              ))}
            </g>

            {/* ══ BOOSTERS — left ══ */}
            <g onClick={() => click('boosters')} className="cursor-pointer" style={{ filter: glow('boosters') }}>
              <path d={`
                M ${CX - BX_INNER - HW_BOOST} ${Y_BOST_TIP + 22}
                Q ${CX - BX_INNER - HW_BOOST} ${Y_BOST_TIP} ${CX - BX_INNER - HW_BOOST / 2} ${Y_BOST_TIP}
                Q ${CX - BX_INNER} ${Y_BOST_TIP} ${CX - BX_INNER} ${Y_BOST_TIP + 22}
                L ${CX - BX_INNER} ${Y_BOST_CYL} L ${CX - BX_OUTER} ${Y_BOST_CYL} Z
              `}
                fill={isActive('boosters') ? '#2a1010' : 'url(#g_boost_l)'}
                stroke={ac('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              <rect x={CX - BX_OUTER} y={Y_BOST_CYL} width={HW_BOOST * 2} height={Y_BOST_BOT - Y_BOST_CYL}
                fill={isActive('boosters') ? '#2a1010' : 'url(#g_boost_l)'}
                stroke={ac('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              <path d={`
                M ${CX - BX_OUTER + 4} ${Y_BOST_BOT} L ${CX - BX_INNER - 4} ${Y_BOST_BOT}
                C ${CX - BX_INNER - 4} ${Y_BOST_BOT + 6}, ${CX - BX_INNER - 7} ${Y_BOST_BOT + 10}, ${CX - BX_INNER - 9} ${Y_BOST_BOT + 18}
                L ${CX - BX_OUTER + 9} ${Y_BOST_BOT + 18}
                C ${CX - BX_OUTER + 7} ${Y_BOST_BOT + 10}, ${CX - BX_OUTER + 4} ${Y_BOST_BOT + 6}, ${CX - BX_OUTER + 4} ${Y_BOST_BOT} Z
              `}
                fill="#060610" stroke={ac('boosters')} strokeWidth={0.7} opacity={0.75}
              />
              {[40, 90, 130].map(dy => (
                <line key={dy} x1={CX - BX_OUTER} y1={Y_BOST_CYL + dy} x2={CX - BX_INNER} y2={Y_BOST_CYL + dy}
                  stroke={ac('boosters')} strokeWidth={0.5} opacity={0.18} />
              ))}
              <text x={CX - BX_INNER - HW_BOOST} y={Y_BOST_CYL + 80} textAnchor="middle"
                fill={ac('boosters')} fontSize={6} opacity={0.35} fontFamily="monospace"
                transform={`rotate(-90, ${CX - BX_INNER - HW_BOOST}, ${Y_BOST_CYL + 80})`}>P120C</text>
            </g>

            {/* ══ BOOSTERS — right ══ */}
            <g onClick={() => click('boosters')} className="cursor-pointer" style={{ filter: glow('boosters') }}>
              <path d={`
                M ${CX + BX_INNER + HW_BOOST} ${Y_BOST_TIP + 22}
                Q ${CX + BX_INNER + HW_BOOST} ${Y_BOST_TIP} ${CX + BX_INNER + HW_BOOST / 2} ${Y_BOST_TIP}
                Q ${CX + BX_INNER} ${Y_BOST_TIP} ${CX + BX_INNER} ${Y_BOST_TIP + 22}
                L ${CX + BX_INNER} ${Y_BOST_CYL} L ${CX + BX_OUTER} ${Y_BOST_CYL} Z
              `}
                fill={isActive('boosters') ? '#2a1010' : 'url(#g_boost_r)'}
                stroke={ac('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              <rect x={CX + BX_INNER} y={Y_BOST_CYL} width={HW_BOOST * 2} height={Y_BOST_BOT - Y_BOST_CYL}
                fill={isActive('boosters') ? '#2a1010' : 'url(#g_boost_r)'}
                stroke={ac('boosters')} strokeWidth={sw('boosters')} opacity={so('boosters')}
              />
              <path d={`
                M ${CX + BX_OUTER - 4} ${Y_BOST_BOT} L ${CX + BX_INNER + 4} ${Y_BOST_BOT}
                C ${CX + BX_INNER + 4} ${Y_BOST_BOT + 6}, ${CX + BX_INNER + 7} ${Y_BOST_BOT + 10}, ${CX + BX_INNER + 9} ${Y_BOST_BOT + 18}
                L ${CX + BX_OUTER - 9} ${Y_BOST_BOT + 18}
                C ${CX + BX_OUTER - 7} ${Y_BOST_BOT + 10}, ${CX + BX_OUTER - 4} ${Y_BOST_BOT + 6}, ${CX + BX_OUTER - 4} ${Y_BOST_BOT} Z
              `}
                fill="#060610" stroke={ac('boosters')} strokeWidth={0.7} opacity={0.75}
              />
              {[40, 90, 130].map(dy => (
                <line key={dy} x1={CX + BX_INNER} y1={Y_BOST_CYL + dy} x2={CX + BX_OUTER} y2={Y_BOST_CYL + dy}
                  stroke={ac('boosters')} strokeWidth={0.5} opacity={0.18} />
              ))}
              <text x={CX + BX_INNER + HW_BOOST} y={Y_BOST_CYL + 80} textAnchor="middle"
                fill={ac('boosters')} fontSize={6} opacity={0.35} fontFamily="monospace"
                transform={`rotate(90, ${CX + BX_INNER + HW_BOOST}, ${Y_BOST_CYL + 80})`}>P120C</text>
            </g>

            {/* ══ UPPER STAGE ══ */}
            <g onClick={() => click('upper')} className="cursor-pointer" style={{ filter: glow('upper') }}>
              <rect x={CX - HW_UPPER} y={Y_UP_TOP} width={HW_UPPER * 2} height={Y_UP_BOT - Y_UP_TOP}
                fill={isActive('upper') ? '#1e1e38' : 'url(#g_upper)'}
                stroke={ac('upper')} strokeWidth={sw('upper')} opacity={so('upper')}
              />
              <path d={`
                M ${CX - HW_UPPER} ${Y_SK_TOP} L ${CX + HW_UPPER} ${Y_SK_TOP}
                L ${CX + HW_CORE} ${Y_SK_BOT} L ${CX - HW_CORE} ${Y_SK_BOT} Z
              `}
                fill={isActive('upper') ? '#1e1e38' : 'url(#g_upper)'}
                stroke={ac('upper')} strokeWidth={sw('upper')} opacity={so('upper')}
              />
              <path d={`
                M ${CX - 8} ${Y_UP_BOT} L ${CX + 8} ${Y_UP_BOT}
                C ${CX + 8} ${Y_UP_BOT + 5}, ${CX + 11} ${Y_UP_BOT + 10}, ${CX + 11} ${Y_SK_TOP + 5}
                L ${CX - 11} ${Y_SK_TOP + 5}
                C ${CX - 11} ${Y_UP_BOT + 10}, ${CX - 8} ${Y_UP_BOT + 5}, ${CX - 8} ${Y_UP_BOT} Z
              `}
                fill="#060610" stroke={ac('upper')} strokeWidth={0.7} opacity={0.65}
              />
              <text x={CX} y={Y_UP_TOP + 36} textAnchor="middle"
                fill={ac('upper')} fontSize={7} opacity={0.4} fontFamily="monospace">VINCI</text>
              <line x1={CX - HW_UPPER} y1={Y_UP_TOP + 18} x2={CX + HW_UPPER} y2={Y_UP_TOP + 18}
                stroke={ac('upper')} strokeWidth={0.5} opacity={0.2} />
            </g>

            {/* ══ SATELLITE ══ */}
            <g clipPath="url(#clip_fair)" onClick={() => click('payload')} className="cursor-pointer">
              <rect x={CX - HW_SAT} y={Y_SAT_TOP} width={HW_SAT * 2} height={Y_SAT_BOT - Y_SAT_TOP}
                fill={isActive('payload') ? '#124030' : '#0a2818'}
                stroke={ac('payload')} strokeWidth={sw('payload')}
                opacity={isActive('payload') ? 0.7 : 0.45} rx={2}
              />
              <rect x={CX - HW_SAT - 22} y={Y_SAT_TOP + 26} width={20} height={9}
                fill={ac('payload')} opacity={isActive('payload') ? 0.55 : 0.3} rx={1}
              />
              <line x1={CX - HW_SAT} y1={Y_SAT_TOP + 30} x2={CX - HW_SAT - 22} y2={Y_SAT_TOP + 30}
                stroke={ac('payload')} strokeWidth={0.8} opacity={0.35} />
              <rect x={CX + HW_SAT + 2} y={Y_SAT_TOP + 26} width={20} height={9}
                fill={ac('payload')} opacity={isActive('payload') ? 0.55 : 0.3} rx={1}
              />
              <line x1={CX + HW_SAT} y1={Y_SAT_TOP + 30} x2={CX + HW_SAT + 22} y2={Y_SAT_TOP + 30}
                stroke={ac('payload')} strokeWidth={0.8} opacity={0.35} />
              <ellipse cx={CX + 8} cy={Y_SAT_TOP + 16} rx={7} ry={4}
                fill="none" stroke={ac('payload')} strokeWidth={0.8} opacity={0.4} />
            </g>

            {/* ══ FAIRING ══ */}
            <g onClick={() => click('fairing')} className="cursor-pointer" style={{ filter: glow('fairing') }}>
              <path d={`
                M ${CX} ${Y_FAIR_TIP}
                C ${CX + 5} ${Y_FAIR_TIP + 25}, ${CX + HW_CORE} ${Y_FAIR_CYL - 28}, ${CX + HW_CORE} ${Y_FAIR_CYL}
                L ${CX + HW_CORE} ${Y_FAIR_BASE} L ${CX} ${Y_FAIR_BASE} Z
              `}
                fill={isActive('fairing') ? '#162848' : 'url(#g_fair_r)'}
                stroke={ac('fairing')} strokeWidth={sw('fairing')}
                opacity={isActive('fairing') ? 0.82 : 0.58}
              />
              <path d={`
                M ${CX} ${Y_FAIR_TIP}
                C ${CX - 5} ${Y_FAIR_TIP + 25}, ${CX - HW_CORE} ${Y_FAIR_CYL - 28}, ${CX - HW_CORE} ${Y_FAIR_CYL}
                L ${CX - HW_CORE} ${Y_FAIR_BASE} L ${CX} ${Y_FAIR_BASE} Z
              `}
                fill={isActive('fairing') ? '#122040' : '#0a1c36'}
                stroke={ac('fairing')} strokeWidth={sw('fairing')}
                opacity={isActive('fairing') ? 0.75 : 0.52}
              />
              <line x1={CX} y1={Y_FAIR_TIP} x2={CX} y2={Y_FAIR_BASE}
                stroke={ac('fairing')} strokeWidth={0.8} opacity={0.35} strokeDasharray="5 4" />
              <line x1={CX + 9} y1={Y_FAIR_TIP + 22} x2={CX + HW_CORE - 2} y2={Y_FAIR_CYL + 10}
                stroke={ac('fairing')} strokeWidth={0.4} opacity={0.15} />
              <line x1={CX - 9} y1={Y_FAIR_TIP + 22} x2={CX - HW_CORE + 2} y2={Y_FAIR_CYL + 10}
                stroke={ac('fairing')} strokeWidth={0.4} opacity={0.15} />
              <rect x={CX - HW_CORE} y={Y_FAIR_BASE - 5} width={HW_CORE * 2} height={6}
                fill="#0a1428" stroke={ac('fairing')} strokeWidth={0.8} opacity={0.55} />
            </g>

            {/* ══ CALLOUT LINES ══ */}
            {([
              { id: 'fairing',  px: CX + HW_CORE,      py: Y_FAIR_TIP + 50,       label: 'Coiffe' },
              { id: 'payload',  px: CX + HW_SAT,        py: Y_SAT_TOP + 30,        label: 'Satellite' },
              { id: 'upper',    px: CX + HW_UPPER,      py: Y_UP_TOP + 30,         label: 'Ét. sup.' },
              { id: 'core',     px: CX + HW_CORE,       py: Y_CORE_TOP + 100,      label: 'EPC' },
              { id: 'boosters', px: CX + BX_OUTER,      py: Y_BOST_CYL + 60,       label: 'P120C' },
              { id: 'vulcain',  px: CX + HW_NOZZ_EXIT,  py: Y_NOZZ_TOP + 38,       label: 'Vulcain' },
            ] as { id: PartId; px: number; py: number; label: string }[]).map(c => {
              const isAct = active === c.id;
              const color = PARTS[c.id].accentColor;
              const lx2 = W - 14;
              return (
                <g key={c.id} opacity={isAct ? 1 : 0.32} style={{ transition: 'opacity 0.25s' }} className="pointer-events-none">
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
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.accentColor }} />
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
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: activePart.accentColor }} />
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
              <ul className="space-y-2 mb-5">
                {activePart.details.map((d, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-400 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5" style={{ color: activePart.accentColor }}>▸</span>
                    {d}
                  </li>
                ))}
              </ul>
              {activePart.sources.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Sources</p>
                  <div className="flex flex-col gap-1.5">
                    {activePart.sources.map((src, i) => (
                      <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs hover:underline transition-colors"
                        style={{ color: activePart.accentColor }}
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        {src.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
