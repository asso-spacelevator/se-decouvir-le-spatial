import { useState, useEffect, useRef, useCallback } from 'react';

interface OrbitData {
  id: number;
  label: string;
  shortLabel: string;
  altitude: string;
  radius: number;
  speed: number; // seconds per revolution
  // Inclination in degrees relative to equatorial plane, used for visual rotation
  inclination: number;
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

// Perspective compression factor: orbits viewed from a slight angle above equatorial plane
// The ellipse ry = radius * sin(inclination) * PERSP + radius * cos(inclination) * (1 - PERSP)
// Simpler model: we rotate a foreshortened ellipse.
// For a circle of radius R viewed in 3D with inclination I from equatorial plane:
//   - the orbital plane is tilted by I degrees from the equatorial plane
//   - in a front-on 2D projection, it appears as an ellipse rotated by I degrees
//   - with semiaxes rx = R and ry = R * |cos(viewer_elevation)|
// We use a fixed viewer elevation of ~25° above equatorial plane.
// So the foreshortened axis = R * sin(25°) ≈ R * 0.42, rotated ellipse.
// The rotation of the ellipse major axis = inclination angle.

const VIEWER_SIN = 0.42; // sin(25°) — vertical compression

// For GEO (0° inclination): appears as a flat horizontal ellipse (equatorial ring)
// For SSO (97°): appears as a nearly vertical ellipse, slightly past vertical (retrograde)
// For LEO/ISS (51.6°): ellipse tilted ~52° from horizontal
// For MEO/GPS (55°): ellipse tilted ~55° from horizontal

const ORBITS: OrbitData[] = [
  {
    id: 0,
    label: 'Orbite Basse (LEO)',
    shortLabel: 'LEO',
    altitude: '160 – 2 000 km',
    radius: 108,
    speed: 6,
    inclination: 51.6, // ISS inclination
    color: '#22d3ee',
    glowColor: 'rgba(34,211,238,0.4)',
    satellites: [
      {
        name: 'ISS',
        icon: '🛸',
        image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200&h=140&fit=crop',
        description: 'Station Spatiale Internationale · 408 km · Inclinaison 51,6° · Laboratoire orbital habité depuis 2000'
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
    radius: 158,
    speed: 14,
    inclination: 55, // GPS/Galileo inclination
    color: '#a3e635',
    glowColor: 'rgba(163,230,53,0.4)',
    satellites: [
      {
        name: 'Galileo',
        icon: '🧭',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&h=140&fit=crop',
        description: 'Galileo (ESA) · 23 222 km · Inclinaison 56° · Système européen de navigation — précision centimétrique'
      },
      {
        name: 'GPS',
        icon: '📍',
        image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=140&fit=crop',
        description: 'GPS (USA) · 20 200 km · Inclinaison 55° · 31 satellites, horloges atomiques à 1 nanoseconde près'
      }
    ]
  },
  {
    id: 2,
    label: 'Orbite Géostationnaire (GEO)',
    shortLabel: 'GEO',
    altitude: '35 786 km',
    radius: 218,
    speed: 32,
    inclination: 0, // Equatorial — appears as flat horizontal ellipse
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.4)',
    satellites: [
      {
        name: 'Météosat',
        icon: '🌦️',
        image: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?w=200&h=140&fit=crop',
        description: 'Météosat (EUMETSAT) · 35 786 km · Inclinaison 0° · Immobile dans le ciel européen, images météo toutes les 10 min'
      },
      {
        name: 'Astra',
        icon: '📺',
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&h=140&fit=crop',
        description: 'Astra (SES) · 35 786 km · Inclinaison 0° · Diffuse 1 000+ chaînes TV vers 135 millions de foyers européens'
      }
    ]
  },
  {
    id: 3,
    label: 'Orbite Polaire Héliosynchrone (SSO)',
    shortLabel: 'SSO',
    altitude: '400 – 1 000 km',
    radius: 130,
    speed: 9,
    inclination: 97, // Slightly retrograde — appears nearly vertical, tilted 7° past vertical
    color: '#e879f9',
    glowColor: 'rgba(232,121,249,0.4)',
    satellites: [
      {
        name: 'Sentinel-2',
        icon: '🌿',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=200&h=140&fit=crop',
        description: 'Sentinel-2 (Copernicus) · 786 km · Inclinaison 98,6° · Couvre toute la Terre tous les 5 jours en 10 m de résolution'
      },
      {
        name: 'SPOT',
        icon: '🌍',
        image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200&h=140&fit=crop',
        missionImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&h=140&fit=crop',
        description: 'SPOT (France) · 832 km · Inclinaison 98,7° · Pionnier de l\'observation commerciale depuis 1986'
      }
    ]
  }
];

const CX = 260;
const CY = 260;
const EARTH_R = 52;

// Compute the ellipse parameters for a given orbit inclination.
// We model the orbit as a circle of radius R in a plane inclined by `inc` degrees.
// Viewed from a fixed vantage point slightly above the equatorial plane (viewer elevation ~25°),
// the orbit projects onto the screen as a rotated ellipse.
//
// Simplified 2D projection:
//   - Major axis always = R (the full diameter is preserved along the orbit plane's "width")
//   - Minor axis = R * VIEWER_SIN (foreshortening from the viewer elevation)
//   - The ellipse is rotated by `inc` degrees from horizontal
//
// For GEO (inc=0): flat horizontal band  (major axis horizontal)
// For SSO (inc=97): almost vertical, slightly past 90°
function orbitEllipseParams(radius: number, incDeg: number) {
  const incRad = (incDeg * Math.PI) / 180;
  // rx = full radius (semi-major axis along inclination direction)
  // ry = radius * VIEWER_SIN (compressed perpendicular axis)
  const rx = radius;
  const ry = radius * VIEWER_SIN;
  // Rotation angle of the ellipse (the major axis points along the inclination direction)
  const rotateDeg = incDeg;
  return { rx, ry, rotateDeg, incRad };
}

// Given elapsed time, compute the satellite position on a rotated ellipse
function satellitePos(elapsed: number, orbit: OrbitData, baseOffset: number) {
  const { rx, ry, rotateDeg } = orbitEllipseParams(orbit.radius, orbit.inclination);
  const rotRad = (rotateDeg * Math.PI) / 180;
  const angle = baseOffset + (elapsed / 1000) * ((2 * Math.PI) / orbit.speed);
  // Point on the unrotated ellipse
  const ex = rx * Math.cos(angle);
  const ey = ry * Math.sin(angle);
  // Rotate by rotateDeg
  const x = CX + ex * Math.cos(rotRad) - ey * Math.sin(rotRad);
  const y = CY + ex * Math.sin(rotRad) + ey * Math.cos(rotRad);
  return { x, y, angle };
}

const BASE_OFFSETS = ORBITS.map((_, i) => i * (Math.PI / 2.1));

interface SatPos { x: number; y: number; angle: number }

function useAnimFrame(callback: (t: number) => void) {
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const cbRef = useRef(callback);
  cbRef.current = callback;
  useEffect(() => {
    const loop = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      cbRef.current(ts - startRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
}

export function OrbitalAnimation() {
  const [activeOrbit, setActiveOrbit] = useState<number | null>(null);
  const [positions, setPositions] = useState<SatPos[]>(ORBITS.map(() => ({ x: CX, y: CY, angle: 0 })));
  const [selectedSat, setSelectedSat] = useState<{ orbitId: number; satIdx: number } | null>(null);
  const [visibleOrbits, setVisibleOrbits] = useState<number[]>([]);
  const [phase, setPhase] = useState<'intro' | 'ready'>('intro');

  // Stagger orbit reveal on mount: LEO first, then MEO, then GEO, then SSO
  const revealOrder = [0, 1, 2, 3];
  useEffect(() => {
    const timers = revealOrder.map((orbitId, i) =>
      setTimeout(() => setVisibleOrbits(prev => [...prev, orbitId]), 500 + i * 750)
    );
    const readyTimer = setTimeout(() => setPhase('ready'), 500 + revealOrder.length * 750 + 300);
    return () => { timers.forEach(clearTimeout); clearTimeout(readyTimer); };
  }, []);

  const onFrame = useCallback((elapsed: number) => {
    setPositions(ORBITS.map((orbit, i) =>
      satellitePos(elapsed, orbit, BASE_OFFSETS[i])
    ));
  }, []);

  useAnimFrame(onFrame);

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
              {/* Clip GEO orbit to not pass over the Earth — purely visual */}
              <clipPath id="noEarth">
                <rect x="0" y="0" width="520" height="520" />
              </clipPath>
            </defs>

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

            {/* Equatorial reference line (faint) */}
            <line
              x1={CX - 230} y1={CY}
              x2={CX + 230} y2={CY}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="4 6"
            />
            {/* North pole axis (faint vertical) */}
            <line
              x1={CX} y1={CY - 230}
              x2={CX} y2={CY + 230}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="4 6"
            />

            {/* Orbit rings — drawn back to front */}
            {/* Draw GEO first (back), then MEO, then LEO + SSO (front) */}
            {[2, 1, 0, 3].map((orbitId) => {
              const orbit = ORBITS[orbitId];
              const visible = visibleOrbits.includes(orbit.id);
              const isActive = activeOrbit === orbit.id;
              const { rx, ry, rotateDeg } = orbitEllipseParams(orbit.radius, orbit.inclination);

              return (
                <g key={orbit.id} transform={`rotate(${rotateDeg}, ${CX}, ${CY})`}>
                  {/* Glow */}
                  {isActive && visible && (
                    <ellipse
                      cx={CX} cy={CY}
                      rx={rx} ry={ry}
                      fill="none"
                      stroke={orbit.color}
                      strokeWidth={10}
                      opacity={0.12}
                    />
                  )}
                  {/* Orbit ring */}
                  <ellipse
                    cx={CX} cy={CY}
                    rx={visible ? rx : 0}
                    ry={visible ? ry : 0}
                    fill="none"
                    stroke={orbit.color}
                    strokeWidth={isActive ? 2.5 : 1.2}
                    strokeDasharray={orbit.id === 3 ? '7 4' : undefined}
                    opacity={visible ? (isActive ? 1 : 0.38) : 0}
                    style={{
                      transition: 'rx 0.9s cubic-bezier(.34,1.4,.64,1), ry 0.9s cubic-bezier(.34,1.4,.64,1), opacity 0.5s, stroke-width 0.3s'
                    }}
                    className="cursor-pointer"
                    onClick={() => handleOrbitClick(orbit.id)}
                  />
                  {/* Fat invisible click target */}
                  <ellipse
                    cx={CX} cy={CY}
                    rx={visible ? rx : 0}
                    ry={visible ? ry : 0}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={20}
                    className={phase === 'ready' ? 'cursor-pointer' : 'cursor-default'}
                    onClick={() => handleOrbitClick(orbit.id)}
                  />
                </g>
              );
            })}

            {/* Labels — unrotated, positioned at the "right tip" of each orbit */}
            {ORBITS.map((orbit) => {
              const visible = visibleOrbits.includes(orbit.id);
              if (!visible || phase !== 'ready') return null;
              const isActive = activeOrbit === orbit.id;
              const { rx, rotateDeg } = orbitEllipseParams(orbit.radius, orbit.inclination);
              // Right tip of major axis in rotated space, then back to screen coords
              const rotRad = (rotateDeg * Math.PI) / 180;
              const lx = CX + rx * Math.cos(rotRad) + 7;
              const ly = CY + rx * Math.sin(rotRad) - 4;
              return (
                <text
                  key={orbit.id}
                  x={lx} y={ly}
                  fill={orbit.color}
                  fontSize={10}
                  fontWeight={isActive ? 700 : 400}
                  opacity={isActive ? 1 : 0.65}
                  className="cursor-pointer"
                  onClick={() => handleOrbitClick(orbit.id)}
                  style={{ transition: 'opacity 0.3s' }}
                >
                  {orbit.shortLabel}
                </text>
              );
            })}

            {/* Earth — drawn on top of orbit rings to occlude them naturally */}
            <circle cx={CX} cy={CY} r={EARTH_R + 11} fill="url(#earthAtmo)" />
            <circle cx={CX} cy={CY} r={EARTH_R} fill="url(#earthGrad)" />
            {/* Continents */}
            <ellipse cx={CX - 14} cy={CY - 8} rx={11} ry={7} fill="#16a34a" opacity={0.55} />
            <ellipse cx={CX + 10} cy={CY - 15} rx={8} ry={5} fill="#15803d" opacity={0.5} />
            <ellipse cx={CX + 18} cy={CY + 8} rx={7} ry={9} fill="#166534" opacity={0.45} />
            <ellipse cx={CX - 8} cy={CY + 16} rx={10} ry={6} fill="#14532d" opacity={0.4} />
            {/* Polar ice */}
            <ellipse cx={CX} cy={CY - EARTH_R + 6} rx={16} ry={8} fill="white" opacity={0.45} />
            <ellipse cx={CX} cy={CY + EARTH_R - 6} rx={12} ry={6} fill="white" opacity={0.35} />
            {/* Equator line on Earth */}
            <ellipse cx={CX} cy={CY} rx={EARTH_R} ry={EARTH_R * VIEWER_SIN * 0.6} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} />

            {/* Satellites */}
            {ORBITS.map((orbit, i) => {
              const visible = visibleOrbits.includes(orbit.id);
              if (!visible) return null;
              const pos = positions[i];
              const isOrbitActive = activeOrbit === orbit.id;
              const sat = orbit.satellites[0];
              const isSatSelected = selectedSat?.orbitId === orbit.id && selectedSat?.satIdx === 0;
              const r = isSatSelected ? 8 : isOrbitActive ? 6.5 : 4.5;

              return (
                <g
                  key={orbit.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onClick={(e) => handleSatClick(orbit.id, 0, e)}
                >
                  <circle r={r + 6} fill={orbit.glowColor} />
                  <circle r={r} fill={orbit.color} />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={r * 1.3}
                    style={{ transition: 'font-size 0.3s' }}
                  >
                    {sat.icon}
                  </text>
                </g>
              );
            })}

            {/* Inclination angle annotations when orbit is active */}
            {activeOrbit !== null && visibleOrbits.includes(activeOrbit) && (() => {
              const orbit = ORBITS[activeOrbit];
              const { rx, rotateDeg } = orbitEllipseParams(orbit.radius, orbit.inclination);
              const rotRad = (rotateDeg * Math.PI) / 180;
              // Draw arc showing inclination angle from equator
              const arcR = 28;
              const incRad = rotRad;
              const arcEndX = CX + arcR * Math.cos(incRad);
              const arcEndY = CY + arcR * Math.sin(incRad);
              const midAngle = incRad / 2;
              const labelX = CX + (arcR + 14) * Math.cos(midAngle);
              const labelY = CY + (arcR + 14) * Math.sin(midAngle);
              return (
                <g opacity={0.8}>
                  <path
                    d={`M ${CX + arcR} ${CY} A ${arcR} ${arcR} 0 0 1 ${arcEndX} ${arcEndY}`}
                    fill="none"
                    stroke={orbit.color}
                    strokeWidth={1.5}
                    opacity={0.7}
                  />
                  <text x={labelX} y={labelY} fill={orbit.color} fontSize={9} textAnchor="middle" dominantBaseline="central">
                    {orbit.inclination}°
                  </text>
                </g>
              );
            })()}
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
                  <span className="text-xs font-mono" style={{ color: orbit.color }}>{orbit.inclination}°</span>
                </button>
              ))}
              <p className="text-xs text-gray-600 pt-1 pl-1">inclinaison par rapport à l'équateur</p>
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
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: activeOrbitData.color }} />
                <h4 className="font-bold text-white text-lg leading-tight">{activeOrbitData.label}</h4>
              </div>
              <div className="flex gap-3 text-sm mb-4">
                <span className="text-gray-400">{activeOrbitData.altitude}</span>
                <span className="font-mono" style={{ color: activeOrbitData.color }}>
                  inclinaison {activeOrbitData.inclination}°
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Satellites sur cette orbite :</p>
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
                ← {activeOrbitData.shortLabel} · {activeOrbitData.inclination}°
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
