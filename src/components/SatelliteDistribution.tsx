import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { OrbitalAnimation } from './OrbitalAnimation';

interface Category {
  id: string;
  label: string;
  count: number;
  pct: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  examples: string[];
  orbitBreakdown?: { orbit: string; count: number }[];
}

// Data based on UCS Satellite Database 2023 + Satellite Xplorer / Celestrak
const CATEGORIES: Category[] = [
  {
    id: 'communication',
    label: 'Télécommunications',
    count: 4300,
    pct: 57,
    color: '#3b82f6',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500/30',
    description: 'La majorité des satellites actifs. Incluent les méga-constellations LEO (Starlink, OneWeb) et les GEO classiques. Permettent Internet, TV, téléphonie mobile, IoT.',
    examples: ['Starlink (SpaceX) : 6 000+', 'Intelsat, SES, Eutelsat (GEO)', 'OneWeb : 618', 'Kinéis (CNES) : 25'],
    orbitBreakdown: [
      { orbit: 'LEO (méga-constellations)', count: 3700 },
      { orbit: 'GEO (télécom classique)', count: 550 },
      { orbit: 'MEO / autre', count: 50 },
    ],
  },
  {
    id: 'earth_observation',
    label: 'Observation de la Terre',
    count: 1200,
    pct: 16,
    color: '#10b981',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/30',
    description: 'Surveillance de l\'environnement, météo, agriculture, océanographie. Très actif : le programme Copernicus (ESA/UE) met les données en libre accès.',
    examples: ['Sentinel 1/2/3/6 (ESA/Copernicus)', 'SPOT 7 & Pléiades (CNES)', 'Jason-3, SWOT (CNES/NASA)', 'Planet Labs : 200+ nanosats'],
    orbitBreakdown: [
      { orbit: 'LEO polaire / héliosynchrone', count: 1100 },
      { orbit: 'GEO (météo)', count: 80 },
      { orbit: 'Autre', count: 20 },
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation (GNSS)',
    count: 130,
    pct: 2,
    color: '#f59e0b',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-500/30',
    description: 'Systèmes de navigation mondiale. Chaque constellation comporte ~30 satellites en MEO (~20 000 km), sauf BeiDou qui utilise aussi le GEO.',
    examples: ['GPS (USA) : 31 actifs', 'Galileo (ESA/UE) : 28 actifs', 'GLONASS (Russie) : 24', 'BeiDou (Chine) : 45+'],
    orbitBreakdown: [
      { orbit: 'MEO (~20 000 km)', count: 110 },
      { orbit: 'GEO (BeiDou)', count: 15 },
      { orbit: 'IGSO', count: 5 },
    ],
  },
  {
    id: 'science',
    label: 'Science & R&D',
    count: 600,
    pct: 8,
    color: '#8b5cf6',
    bgColor: 'bg-violet-500',
    borderColor: 'border-violet-500/30',
    description: 'Physique, astronomie, biologie en microgravité. Inclut les CubeSats universitaires et les grands observatoires spatiaux. Le CNES est un acteur majeur de cette catégorie.',
    examples: ['ISS (multi-nations)', 'Euclid, Gaia (ESA)', 'PicSat, EyeSat (CNES)', 'CubeSats universitaires : 400+'],
    orbitBreakdown: [
      { orbit: 'LEO (dont ISS)', count: 520 },
      { orbit: 'Orbites hautes / Lagrange', count: 80 },
    ],
  },
  {
    id: 'military',
    label: 'Militaire & Renseignement',
    count: 700,
    pct: 9,
    color: '#ef4444',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500/30',
    description: 'Reconnaissance, écoute électronique, communications sécurisées. Donnée partielle — beaucoup restent classifiés. Les USA, Chine et Russie dominent.',
    examples: ['WGS (USA, télécom militaire)', 'Syracuse (France, CNES/DGA)', 'Yaogan (Chine, classifiés)', 'Kosmos (Russie, classifiés)'],
    orbitBreakdown: [
      { orbit: 'LEO (reconnaissance)', count: 400 },
      { orbit: 'GEO (télécom)', count: 200 },
      { orbit: 'MEO / autre', count: 100 },
    ],
  },
  {
    id: 'other',
    label: 'Autres (météo, tech…)',
    count: 570,
    pct: 8,
    color: '#64748b',
    bgColor: 'bg-slate-500',
    borderColor: 'border-slate-500/30',
    description: 'Météorologie dédiée, démonstrations technologiques, développement. Inclut Meteosat (EUMETSAT), GOES (NOAA).',
    examples: ['Meteosat (EUMETSAT)', 'GOES (NOAA, météo USA)', 'Démonstrateurs tech CNES', 'Satellites éducatifs'],
  },
];

const TOTAL = 7500;

function DonutChart({ categories }: { categories: Category[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Build SVG arc segments
  const cx = 100, cy = 100, r = 70, innerR = 42;
  let cumulAngle = -90; // start from top

  const segments = categories.map(cat => {
    const startAngle = cumulAngle;
    const sweep = (cat.pct / 100) * 360;
    cumulAngle += sweep;
    const endAngle = cumulAngle;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const xi1 = cx + innerR * Math.cos(toRad(startAngle));
    const yi1 = cy + innerR * Math.sin(toRad(startAngle));
    const xi2 = cx + innerR * Math.cos(toRad(endAngle));
    const yi2 = cy + innerR * Math.sin(toRad(endAngle));

    const largeArc = sweep > 180 ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi2} ${yi2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1}`,
      'Z',
    ].join(' ');

    return { ...cat, d, midAngle: startAngle + sweep / 2 };
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[220px] mx-auto">
      {segments.map(seg => (
        <path
          key={seg.id}
          d={seg.d}
          fill={seg.color}
          opacity={hoveredId === null || hoveredId === seg.id ? 1 : 0.4}
          stroke="#0f172a"
          strokeWidth="1.5"
          className="cursor-pointer transition-opacity duration-200"
          onMouseEnter={() => setHoveredId(seg.id)}
          onMouseLeave={() => setHoveredId(null)}
        />
      ))}
      {/* Center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{TOTAL.toLocaleString()}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="7">satellites actifs</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill="#64748b" fontSize="6">estimation 2024</text>
    </svg>
  );
}

export function SatelliteDistribution() {
  const [selected, setSelected] = useState<Category | null>(CATEGORIES[0]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Répartition des ~7 500 satellites actifs par usage — données 2024
        </p>
      </div>

      {/* Main layout: donut + list + detail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Donut */}
        <div className="md:col-span-1 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-4">
          <DonutChart categories={CATEGORIES} />
        </div>

        {/* Categories list */}
        <div className="md:col-span-1 flex flex-col gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelected(selected?.id === cat.id ? null : cat)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:scale-[1.01] ${
                selected?.id === cat.id
                  ? `bg-white/10 ${cat.borderColor}`
                  : 'bg-white/4 border-white/8 hover:bg-white/7'
              }`}
            >
              <div className="flex-shrink-0 w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white truncate">{cat.label}</span>
                  <span className="text-xs font-mono text-gray-400 flex-shrink-0">{cat.pct}%</span>
                </div>
                {/* Bar */}
                <div className="mt-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0 font-mono">
                {cat.count >= 1000 ? `~${(cat.count / 1000).toFixed(1)}k` : cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="md:col-span-1">
          {selected ? (
            <div
              className="rounded-2xl border p-5 h-full flex flex-col gap-3"
              style={{ backgroundColor: selected.color + '0d', borderColor: selected.color + '30' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selected.color }} />
                <h4 className="font-bold text-white">{selected.label}</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{selected.description}</p>

              {selected.orbitBreakdown && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Par orbite</p>
                  <div className="space-y-1.5">
                    {selected.orbitBreakdown.map(ob => (
                      <div key={ob.orbit} className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(ob.count / selected.count) * 100}%`,
                              backgroundColor: selected.color,
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-400 w-32 flex-shrink-0 text-right">{ob.orbit}</span>
                        <span className="text-[11px] font-mono text-gray-500 w-10 text-right">{ob.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Exemples notables</p>
                <ul className="space-y-1">
                  {selected.examples.map(ex => (
                    <li key={ex} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span style={{ color: selected.color }}>▸</span> {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/4 p-5 h-full flex items-center justify-center">
              <p className="text-sm text-gray-500 text-center">Clique sur une catégorie pour les détails</p>
            </div>
          )}
        </div>
      </div>

      {/* Orbital animation */}
      <OrbitalAnimation />

      {/* Orbit breakdown summary */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">Répartition par orbite (toutes catégories)</h4>
        <div className="space-y-3">
          {[
            { orbit: 'LEO (< 2 000 km)', count: 5900, pct: 79, color: '#22d3ee', note: 'Dominé par les méga-constellations' },
            { orbit: 'GEO (35 786 km)', count: 850, pct: 11, color: '#f59e0b', note: 'Télécom, météo' },
            { orbit: 'MEO (2 000–35 000 km)', count: 150, pct: 2, color: '#3b82f6', note: 'Navigation (GPS, Galileo)' },
            { orbit: 'SSO / polaire', count: 500, pct: 7, color: '#10b981', note: 'Observation terrestre' },
            { orbit: 'Autre (Lagrange, elliptique…)', count: 100, pct: 1, color: '#8b5cf6', note: 'Science' },
          ].map(row => (
            <div key={row.orbit} className="grid grid-cols-[160px_1fr_40px_auto] items-center gap-2">
              <span className="text-xs text-gray-300 font-medium leading-tight">{row.orbit}</span>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
              </div>
              <span className="text-xs font-mono text-gray-400 text-right">{row.pct}%</span>
              <span className="text-[10px] text-gray-600 hidden md:block">{row.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stuff in Space link */}
      <div className="bg-magenta/10 border border-magenta/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white mb-1">Explorer en temps réel</h4>
          <p className="text-sm text-gray-300">
            <strong className="text-magenta">Stuff in Space</strong> montre tous les satellites et débris actuellement en orbite en 3D, en temps réel.
          </p>
        </div>
        <a
          href="https://stuffin.space"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-magenta hover:bg-magenta-700 text-white font-bold text-sm rounded-xl transition-all hover:scale-105 shadow-lg shadow-magenta/20"
        >
          Ouvrir Stuff in Space
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <p className="text-[11px] text-gray-600 text-center">
        Sources : UCS Satellite Database 2024 · Celestrak · ESA Space Environment Report · CNES
      </p>
    </div>
  );
}
