import { useState } from 'react';

interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  category: 'milestone' | 'telecom' | 'science' | 'navigation' | 'constellation';
  country: string;
  satelliteCount: number; // approx active satellites in orbit at that date
  highlight?: boolean;
}

const EVENTS: TimelineEvent[] = [
  {
    year: 1957,
    title: 'Spoutnik 1',
    description: 'Premier satellite artificiel — une sphère de 58 cm lancée par l\'URSS. Seule la Lune tournait autour de la Terre avant lui.',
    category: 'milestone',
    country: 'URSS',
    satelliteCount: 1,
    highlight: true,
  },
  {
    year: 1958,
    title: 'Explorer 1',
    description: 'Premier satellite américain. Découverte des ceintures de Van Allen.',
    category: 'science',
    country: 'USA',
    satelliteCount: 3,
  },
  {
    year: 1962,
    title: 'Telstar 1',
    description: 'Premier satellite de télécommunications commercial — première retransmission TV en direct entre USA et Europe.',
    category: 'telecom',
    country: 'USA',
    satelliteCount: 35,
    highlight: true,
  },
  {
    year: 1964,
    title: 'Syncom 3',
    description: 'Premier satellite géostationnaire opérationnel. Retransmission des JO de Tokyo.',
    category: 'telecom',
    country: 'USA',
    satelliteCount: 70,
  },
  {
    year: 1965,
    title: 'Astérix',
    description: 'Premier satellite français — 3ᵉ pays dans l\'espace après l\'URSS et les USA.',
    category: 'milestone',
    country: 'France',
    satelliteCount: 90,
  },
  {
    year: 1972,
    title: 'Landsat 1',
    description: 'Premier satellite d\'observation de la Terre. Début de la surveillance environnementale depuis l\'espace.',
    category: 'science',
    country: 'USA',
    satelliteCount: 250,
  },
  {
    year: 1978,
    title: 'GPS Block I',
    description: 'Lancement des premiers satellites GPS. Le système devient opérationnel en 1993 avec 24 satellites.',
    category: 'navigation',
    country: 'USA',
    satelliteCount: 400,
    highlight: true,
  },
  {
    year: 1984,
    title: 'SPOT 1',
    description: 'Premier satellite d\'observation commerciale du CNES. Images à 10 m de résolution.',
    category: 'science',
    country: 'France',
    satelliteCount: 600,
  },
  {
    year: 1991,
    title: 'ERS-1',
    description: 'Premier grand satellite ESA d\'observation. Radar à synthèse d\'ouverture — voit à travers les nuages.',
    category: 'science',
    country: 'ESA',
    satelliteCount: 900,
  },
  {
    year: 1999,
    title: 'CubeSat Standard',
    description: 'Création du standard CubeSat 1U (10×10×10 cm) par Stanford et CalPoly. Révolution de la miniaturisation.',
    category: 'milestone',
    country: 'USA',
    satelliteCount: 800,
  },
  {
    year: 2005,
    title: 'Galileo IOV',
    description: 'Premiers satellites Galileo — système de navigation européen indépendant du GPS américain.',
    category: 'navigation',
    country: 'ESA',
    satelliteCount: 900,
  },
  {
    year: 2014,
    title: 'Jason-3',
    description: 'Satellite altimétrique CNES/NASA. Mesure le niveau des océans à 3 cm près depuis 1 300 km.',
    category: 'science',
    country: 'CNES/NASA',
    satelliteCount: 1400,
  },
  {
    year: 2019,
    title: 'Starlink v1',
    description: 'SpaceX lance 60 premiers Starlink. Début de la méga-constellation — plus de 6 000 satellites en 2024.',
    category: 'constellation',
    country: 'USA',
    satelliteCount: 2200,
    highlight: true,
  },
  {
    year: 2022,
    title: 'SWOT',
    description: 'Satellite CNES/NASA de topographie des eaux (Surface Water and Ocean Topography). Cartographie tous les lacs et rivières de la planète.',
    category: 'science',
    country: 'CNES/NASA',
    satelliteCount: 5000,
  },
  {
    year: 2024,
    title: '+7 500 satellites actifs',
    description: 'Plus de 7 500 satellites actifs en orbite. Les méga-constellations (Starlink, OneWeb, Amazon Kuiper) représentent plus de 60 % du total.',
    category: 'milestone',
    country: 'Monde',
    satelliteCount: 7500,
    highlight: true,
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  milestone: { bg: 'bg-white/10', border: 'border-white/30', text: 'text-white', dot: '#ffffff' },
  telecom:   { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', dot: '#3b82f6' },
  science:   { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-300', dot: '#10b981' },
  navigation:{ bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', dot: '#f59e0b' },
  constellation:{ bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-300', dot: '#8b5cf6' },
};

const CATEGORY_LABELS: Record<string, string> = {
  milestone: 'Jalon historique',
  telecom: 'Télécom',
  science: 'Science',
  navigation: 'Navigation',
  constellation: 'Constellation',
};

// Normalize year to 0-100 range for positioning
const MIN_YEAR = 1957;
const MAX_YEAR = 2024;
const yearToPercent = (y: number) => ((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

// Build the satellite count curve points (SVG polyline)
const CURVE_POINTS = EVENTS.map(e => ({
  x: yearToPercent(e.year),
  y: e.satelliteCount,
}));
const MAX_COUNT = 8000;

export function SatelliteTimeline() {
  const [selected, setSelected] = useState<TimelineEvent | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter ? EVENTS.filter(e => e.category === filter) : EVENTS;

  // Build SVG path for the satellite count curve
  const svgPoints = CURVE_POINTS.map(p => `${p.x * 8},${100 - (p.y / MAX_COUNT) * 95}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Legend / filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            filter === null ? 'bg-white/15 border-white/30 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          Tous
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const c = CATEGORY_COLORS[key];
          return (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? null : key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === key ? `${c.bg} ${c.border} ${c.text}` : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Satellite count curve */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 pb-3">
        <p className="text-xs text-gray-400 font-medium mb-3">Nombre de satellites actifs en orbite (estimation)</p>
        <div className="relative">
          <svg viewBox="0 0 800 110" className="w-full h-24" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(pct => (
              <line key={pct} x1={pct * 8} y1="0" x2={pct * 8} y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
            ))}
            {[2000, 4000, 6000].map(v => {
              const y = 100 - (v / MAX_COUNT) * 95;
              return <line key={v} x1="0" y1={y} x2="800" y2={y} stroke="white" strokeOpacity="0.05" strokeWidth="1" />;
            })}
            {/* Fill */}
            <polygon
              points={`0,100 ${svgPoints} 800,100`}
              fill="url(#satGradient)"
              opacity="0.3"
            />
            {/* Curve */}
            <polyline
              points={svgPoints}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Event dots on curve */}
            {EVENTS.map(e => {
              const x = yearToPercent(e.year) * 8;
              const y = 100 - (e.satelliteCount / MAX_COUNT) * 95;
              const c = CATEGORY_COLORS[e.category];
              return (
                <circle
                  key={e.year}
                  cx={x} cy={y} r={e.highlight ? 4 : 2.5}
                  fill={c.dot}
                  opacity="0.9"
                  className="cursor-pointer"
                  onClick={() => setSelected(e)}
                />
              );
            })}
            <defs>
              <linearGradient id="satGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          {/* Year labels */}
          <div className="flex justify-between text-[10px] text-gray-600 mt-1 px-0">
            {[1957, 1970, 1985, 2000, 2010, 2024].map(y => (
              <span key={y}>{y}</span>
            ))}
          </div>
        </div>
        <div className="flex justify-end mt-1 gap-4 text-[10px] text-gray-600">
          <span>0</span><span>2 000</span><span>4 000</span><span>6 000</span><span>8 000+</span>
        </div>
      </div>

      {/* Timeline scroll */}
      <div className="relative">
        {/* Vertical axis line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-px" />

        <div className="space-y-2">
          {filtered.map((event, i) => {
            const c = CATEGORY_COLORS[event.category];
            const isRight = i % 2 === 0;
            const isSelected = selected?.year === event.year;

            return (
              <div key={event.year} className={`relative flex items-start gap-4 md:gap-0 pl-12 md:pl-0 ${isRight ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Content card */}
                <button
                  onClick={() => setSelected(isSelected ? null : event)}
                  className={`md:w-[46%] text-left rounded-xl border p-3 transition-all hover:scale-[1.01] ${
                    isSelected
                      ? `${c.bg} ${c.border}`
                      : event.highlight
                      ? 'bg-white/8 border-white/15 hover:bg-white/10'
                      : 'bg-white/4 border-white/8 hover:bg-white/7'
                  } ${isRight ? 'md:mr-[4%]' : 'md:ml-[4%]'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-gray-500">{event.year}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${c.bg} ${c.border} ${c.text}`}>
                      {CATEGORY_LABELS[event.category]}
                    </span>
                  </div>
                  <h4 className={`font-bold text-sm mb-0.5 ${event.highlight ? 'text-white' : 'text-gray-200'}`}>
                    {event.title}
                  </h4>
                  {isSelected && (
                    <p className="text-xs text-gray-300 leading-relaxed mt-1">{event.description}</p>
                  )}
                  {!isSelected && (
                    <p className="text-xs text-gray-500 truncate">{event.description.substring(0, 60)}…</p>
                  )}
                  <div className="mt-1.5 text-[10px] text-gray-600">{event.country}</div>
                </button>

                {/* Center dot */}
                <div className={`absolute left-4 md:left-1/2 top-4 w-2.5 h-2.5 rounded-full border-2 md:-translate-x-1.5 z-10 ${
                  event.highlight ? 'border-white scale-125' : 'border-gray-600'
                }`}
                  style={{ backgroundColor: CATEGORY_COLORS[event.category].dot + (event.highlight ? 'ff' : '80') }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Source note */}
      <p className="text-[11px] text-gray-600 text-center">
        Sources : CNES · ESA · UCS Satellite Database · Jonathan's Space Report
      </p>
    </div>
  );
}
