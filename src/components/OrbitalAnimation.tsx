import { useState, useEffect, useRef } from 'react';

interface OrbitData {
  id: number;
  label: string;
  shortLabel: string;
  altitude: string;
  radius: number;
  speed: number; // seconds per revolution
  color: string;
  glowColor: string;
  satellites: SatelliteInfo[];
}

interface SatelliteInfo {
  name: string;
  icon: string;
  image: string;
  missionImage: string;
  description: string;
}

const ORBITS: OrbitData[] = [
  {
    id: 0,
    label: 'Orbite Basse (LEO)',
    shortLabel: 'LEO',
    altitude: '160 – 2 000 km',
    radius: 110,
    speed: 6,
    color: '#22d3ee',
    glowColor: 'rgba(34,211,238,0.4)',
    satellites: [
      {
        name: 'ISS',
        icon: '🛸',
        image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200&h=140&fit=crop',
        description: 'Station Spatiale Internationale · 408 km · Laboratoire orbital habité en permanence depuis 2000'
      },
      {
        name: 'Starlink',
        icon: '📡',
        image: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=140&fit=crop',
        description: 'Starlink · 550 km · Constellation de +5 000 satellites pour internet mondial à haut débit'
      }
    ]
  },
  {
    id: 1,
    label: 'Orbite Moyenne (MEO)',
    shortLabel: 'MEO',
    altitude: '2 000 – 35 786 km',
    radius: 160,
    speed: 14,
    color: '#a3e635',
    glowColor: 'rgba(163,230,53,0.4)',
    satellites: [
      {
        name: 'Galileo',
        icon: '🧭',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&h=140&fit=crop',
        description: 'Galileo (ESA) · 23 222 km · Système européen de navigation par satellite — précision centimétrique'
      },
      {
        name: 'GPS',
        icon: '📍',
        image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=140&fit=crop',
        description: 'GPS (USA) · 20 200 km · 31 satellites, 4 milliards d\'utilisateurs, horloges atomiques à 1 ns près'
      }
    ]
  },
  {
    id: 2,
    label: 'Orbite Géostationnaire (GEO)',
    shortLabel: 'GEO',
    altitude: '35 786 km',
    radius: 215,
    speed: 30,
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.4)',
    satellites: [
      {
        name: 'Météosat',
        icon: '🌦️',
        image: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?w=200&h=140&fit=crop',
        description: 'Météosat (EUMETSAT) · 35 786 km · Images météo toutes les 10 min, visible en permanence au-dessus de l\'Europe'
      },
      {
        name: 'Astra',
        icon: '📺',
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&h=140&fit=crop',
        description: 'Astra (SES) · 35 786 km · Diffuse 1 000+ chaînes TV vers 135 millions de foyers européens'
      }
    ]
  },
  {
    id: 3,
    label: 'Orbite Polaire Héliosynchrone',
    shortLabel: 'SSO',
    altitude: '400 – 1 000 km',
    radius: 132,
    speed: 9,
    color: '#e879f9',
    glowColor: 'rgba(232,121,249,0.4)',
    satellites: [
      {
        name: 'Sentinel-2',
        icon: '🌿',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=200&h=140&fit=crop',
        description: 'Sentinel-2 (Copernicus) · 786 km · Photographie toute la Terre tous les 5 jours en 10 m de résolution'
      },
      {
        name: 'SPOT',
        icon: '🌍',
        image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&h=140&fit=crop',
        description: 'SPOT (France) · 832 km · Pionnier de l\'observation commerciale depuis 1986, images à 1,5 m de résolution'
      }
    ]
  }
];

// SVG center
const CX = 260;
const CY = 260;
const EARTH_R = 52;

function useAnimFrame(callback: (t: number) => void) {
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    const loop = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      callback(ts - startRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [callback]);
}

interface SatPos { x: number; y: number; angle: number }

export function OrbitalAnimation() {
  const [activeOrbit, setActiveOrbit] = useState<number | null>(null);
  const [positions, setPositions] = useState<SatPos[]>(ORBITS.map(() => ({ x: 0, y: 0, angle: 0 })));
  const [selectedSat, setSelectedSat] = useState<{ orbitId: number; satIdx: number } | null>(null);
  const [visibleOrbits, setVisibleOrbits] = useState<number[]>([]);
  const [phase, setPhase] = useState<'intro' | 'ready'>('intro');

  // Stagger orbit reveal on mount
  useEffect(() => {
    const timers = ORBITS.map((_, i) =>
      setTimeout(() => setVisibleOrbits(prev => [...prev, i]), 600 + i * 700)
    );
    const readyTimer = setTimeout(() => setPhase('ready'), 600 + ORBITS.length * 700 + 200);
    return () => { timers.forEach(clearTimeout); clearTimeout(readyTimer); };
  }, []);

  // Animate satellite positions
  useAnimFrame((elapsed) => {
    setPositions(ORBITS.map((orbit, i) => {
      // SSO (id=3) has a tilted orbit — offset initial angle
      const baseOffset = i * (Math.PI / 2.2);
      const angle = baseOffset + (elapsed / 1000) * ((2 * Math.PI) / orbit.speed);
      // For SSO, tilt in Y to suggest polar inclination (visual trick)
      const tiltY = orbit.id === 3 ? 0.35 : 1;
      const x = CX + orbit.radius * Math.cos(angle);
      const y = CY + orbit.radius * Math.sin(angle) * tiltY;
      return { x, y, angle };
    }));
  });

  const handleOrbitClick = (id: number) => {
    if (phase !== 'ready') return;
    setActiveOrbit(prev => (prev === id ? null : id));
    setSelectedSat(null);
  };

  const handleSatClick = (orbitId: number, satIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSat(prev =>
      prev?.orbitId === orbitId && prev?.satIdx === satIdx ? null : { orbitId, satIdx }
    );
  };

  const activeOrbitData = activeOrbit !== null ? ORBITS[activeOrbit] : null;
  const selectedSatData = selectedSat !== null
    ? ORBITS[selectedSat.orbitId].satellites[selectedSat.satIdx]
    : null;

  return (
    <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-xl font-bold text-white">Les 4 Types d'Orbites</h3>
        <p className="text-sm text-gray-400 mt-1">
          {phase === 'intro'
            ? 'Les orbites se déploient en s\'éloignant de la Terre...'
            : 'Cliquez sur une orbite pour l\'explorer — puis sur un satellite pour voir sa mission.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-0">
        {/* SVG Canvas */}
        <div className="flex-shrink-0 flex items-center justify-center p-4">
          <svg
            viewBox="0 0 520 520"
            width="100%"
            style={{ maxWidth: 520, minWidth: 280 }}
            className="select-none"
          >
            {/* Stars */}
            {Array.from({ length: 60 }, (_, i) => (
              <circle
                key={i}
                cx={(i * 137.5) % 520}
                cy={(i * 97.3 + 23) % 520}
                r={i % 5 === 0 ? 1.2 : 0.7}
                fill="white"
                opacity={0.2 + (i % 4) * 0.12}
              />
            ))}

            {/* Orbit rings — drawn back to front (largest first) */}
            {[...ORBITS].reverse().map((orbit) => {
              const visible = visibleOrbits.includes(orbit.id);
              const isActive = activeOrbit === orbit.id;
              const tiltY = orbit.id === 3 ? 0.35 : 1;
              const rx = orbit.radius;
              const ry = orbit.radius * tiltY;
              return (
                <g key={orbit.id}>
                  <ellipse
                    cx={CX} cy={CY}
                    rx={visible ? rx : 0}
                    ry={visible ? ry : 0}
                    fill="none"
                    stroke={orbit.color}
                    strokeWidth={isActive ? 2.5 : 1.2}
                    strokeDasharray={orbit.id === 3 ? '6 4' : 'none'}
                    opacity={visible ? (isActive ? 1 : 0.35) : 0}
                    style={{ transition: 'rx 0.8s cubic-bezier(.34,1.56,.64,1), ry 0.8s cubic-bezier(.34,1.56,.64,1), opacity 0.5s, stroke-width 0.3s' }}
                    className="cursor-pointer"
                    onClick={() => handleOrbitClick(orbit.id)}
                  />
                  {/* Invisible thick click target */}
                  <ellipse
                    cx={CX} cy={CY}
                    rx={visible ? rx : 0}
                    ry={visible ? ry : 0}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={18}
                    className={phase === 'ready' ? 'cursor-pointer' : 'cursor-default'}
                    onClick={() => handleOrbitClick(orbit.id)}
                  />
                  {/* Glow when active */}
                  {isActive && visible && (
                    <ellipse
                      cx={CX} cy={CY}
                      rx={rx} ry={ry}
                      fill="none"
                      stroke={orbit.color}
                      strokeWidth={8}
                      opacity={0.15}
                    />
                  )}
                  {/* Orbit label — fixed position on the right side */}
                  {visible && phase === 'ready' && (
                    <text
                      x={CX + rx + 6}
                      y={CY - ry * 0.05}
                      fill={orbit.color}
                      fontSize={10}
                      fontWeight={isActive ? 700 : 400}
                      opacity={isActive ? 1 : 0.6}
                      className="cursor-pointer"
                      onClick={() => handleOrbitClick(orbit.id)}
                      style={{ transition: 'opacity 0.3s, font-weight 0.2s' }}
                    >
                      {orbit.shortLabel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Earth */}
            <defs>
              <radialGradient id="earthGrad" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="45%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
              <radialGradient id="earthAtmo" cx="50%" cy="50%">
                <stop offset="75%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(96,165,250,0.18)" />
              </radialGradient>
              <filter id="earthGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Atmosphere halo */}
            <circle cx={CX} cy={CY} r={EARTH_R + 10} fill="url(#earthAtmo)" />
            {/* Earth body */}
            <circle cx={CX} cy={CY} r={EARTH_R} fill="url(#earthGrad)" />
            {/* Continent patches */}
            <ellipse cx={CX - 14} cy={CY - 8} rx={11} ry={7} fill="#16a34a" opacity={0.55} />
            <ellipse cx={CX + 10} cy={CY - 15} rx={8} ry={5} fill="#15803d" opacity={0.5} />
            <ellipse cx={CX + 18} cy={CY + 8} rx={7} ry={9} fill="#166534" opacity={0.45} />
            <ellipse cx={CX - 8} cy={CY + 16} rx={10} ry={6} fill="#14532d" opacity={0.4} />
            {/* Polar ice */}
            <ellipse cx={CX} cy={CY - EARTH_R + 6} rx={16} ry={8} fill="white" opacity={0.45} />
            <ellipse cx={CX} cy={CY + EARTH_R - 6} rx={12} ry={6} fill="white" opacity={0.35} />

            {/* Satellites */}
            {ORBITS.map((orbit, i) => {
              const visible = visibleOrbits.includes(orbit.id);
              if (!visible) return null;
              const pos = positions[i];
              const isOrbitActive = activeOrbit === orbit.id;
              const sat = orbit.satellites[0];
              const isSatSelected = selectedSat?.orbitId === orbit.id && selectedSat?.satIdx === 0;

              return (
                <g
                  key={orbit.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onClick={(e) => handleSatClick(orbit.id, 0, e)}
                >
                  {/* Glow ring */}
                  <circle r={isSatSelected ? 14 : isOrbitActive ? 10 : 7} fill={orbit.glowColor}
                    style={{ transition: 'r 0.3s' }} />
                  {/* Satellite body */}
                  <circle r={isSatSelected ? 8 : isOrbitActive ? 6 : 4} fill={orbit.color}
                    style={{ transition: 'r 0.3s' }} />
                  {/* Icon */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isSatSelected ? 11 : isOrbitActive ? 9 : 7}
                    style={{ transition: 'font-size 0.3s' }}
                  >
                    {sat.icon}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info panel */}
        <div className="flex-1 p-5 flex flex-col justify-center min-h-[220px]">
          {!activeOrbitData && (
            <div className="space-y-3">
              {ORBITS.map((orbit, i) => (
                <button
                  key={orbit.id}
                  onClick={() => handleOrbitClick(orbit.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 text-left
                    ${visibleOrbits.includes(orbit.id) ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    ${phase === 'ready' ? 'hover:border-white/30 hover:bg-white/5 cursor-pointer' : 'cursor-default'}
                    border-white/10 bg-white/5`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: orbit.color }} />
                  <span className="text-sm font-semibold text-white">{orbit.shortLabel}</span>
                  <span className="text-xs text-gray-400 flex-1">{orbit.altitude}</span>
                  <span className="text-xs text-gray-500">{orbit.label.replace(/\(.*\)/, '').trim()}</span>
                </button>
              ))}
            </div>
          )}

          {activeOrbitData && !selectedSatData && (
            <div className="animate-fadeIn">
              <button
                onClick={() => { setActiveOrbit(null); setSelectedSat(null); }}
                className="text-xs text-gray-500 hover:text-gray-300 mb-3 flex items-center gap-1 transition-colors"
              >
                ← Toutes les orbites
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ background: activeOrbitData.color }} />
                <h4 className="font-bold text-white text-lg">{activeOrbitData.label}</h4>
              </div>
              <p className="text-sm text-gray-400 mb-4">{activeOrbitData.altitude}</p>
              <p className="text-xs text-gray-500 mb-3">Satellites sur cette orbite — cliquez pour en savoir plus :</p>
              <div className="space-y-2">
                {activeOrbitData.satellites.map((sat, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleSatClick(activeOrbitData.id, idx, e)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 transition-all text-left"
                  >
                    <span className="text-2xl">{sat.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{sat.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{sat.description.split('·')[2]?.trim()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedSatData && activeOrbitData && (
            <div className="animate-fadeIn">
              <button
                onClick={() => setSelectedSat(null)}
                className="text-xs text-gray-500 hover:text-gray-300 mb-3 flex items-center gap-1 transition-colors"
              >
                ← {activeOrbitData.shortLabel} · {activeOrbitData.label}
              </button>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{selectedSatData.icon}</span>
                <h4 className="font-bold text-white text-lg">{selectedSatData.name}</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg overflow-hidden bg-slate-800">
                  <img
                    src={selectedSatData.image}
                    alt={`${selectedSatData.name} satellite`}
                    className="w-full h-24 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <p className="text-xs text-center text-gray-500 py-1">Satellite</p>
                </div>
                <div className="rounded-lg overflow-hidden bg-slate-800">
                  <img
                    src={selectedSatData.missionImage}
                    alt={`${selectedSatData.name} mission`}
                    className="w-full h-24 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <p className="text-xs text-center text-gray-500 py-1">Mission</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{selectedSatData.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
