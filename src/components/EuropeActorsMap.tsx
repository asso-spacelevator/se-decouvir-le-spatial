import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import {
  EUROPEAN_SPACE_COMPANIES,
  TIERS,
  SECTORS,
  SECTOR_ORDER,
  type CompanyTier,
  type SectorKey,
  type SpaceCompany,
} from '../data/europeanSpaceCompanies';

/* ════════════════════════════════════════════════════════════════════════
 *  EuropeActorsMap — "La carte des acteurs"
 *
 *  A working geographic map of the European space industry. Companies are
 *  plotted at their real HQ coordinates. Pin SIZE always encodes company size
 *  (tier); pin COLOUR follows the chosen mode:
 *     • "Taille"  → magenta tier scale (single hue, brand-faithful)
 *     • "Domaine" → harmonious categorical hues per activity sector
 *  Tier chips AND sector chips both filter the map + directory, and the
 *  directory groups by whichever dimension you sort on.
 *
 *  Self-contained: NO new npm dependencies.
 *    • Mercator projection is hand-rolled (no d3 / topojson).
 *    • Country outlines are fetched as plain GeoJSON at runtime, with a
 *      graceful fallback if the network is unavailable.
 *
 *  Drop in as:  src/components/EuropeActorsMap.tsx
 *  Then render <EuropeActorsMap /> where the old map element used to be
 *  inside EntreprisesSpatialesSection.
 * ════════════════════════════════════════════════════════════════════════ */

const W = 820;
const H = 600;
const PAD = 14;

const VIEW = { lon0: -10.5, lon1: 27, lat0: 36, lat1: 64.5 };

const GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/leakyMirror/map-of-europe@master/GeoJSON/europe.geojson';

const ALL_TIERS: CompanyTier[] = [1, 2, 3, 4];
type SortMode = 'tier' | 'sector' | 'name' | 'country';
type ColorMode = 'tier' | 'sector';

/* ---------- Mercator projection fitted to VIEW ---------- */
const RAD = Math.PI / 180;
const mercY = (latDeg: number) => Math.log(Math.tan(Math.PI / 4 + (latDeg * RAD) / 2));

const projector = (() => {
  const minX = VIEW.lon0 * RAD;
  const maxX = VIEW.lon1 * RAD;
  const minY = mercY(VIEW.lat0);
  const maxY = mercY(VIEW.lat1);
  const scale = Math.min((W - 2 * PAD) / (maxX - minX), (H - 2 * PAD) / (maxY - minY));
  const offX = (W - (maxX - minX) * scale) / 2;
  const offY = (H - (maxY - minY) * scale) / 2;
  return (lon: number, lat: number): [number, number] => {
    const x = lon * RAD;
    const y = mercY(lat);
    return [(x - minX) * scale + offX, (maxY - y) * scale + offY];
  };
})();

/* ---------- GeoJSON → SVG path ---------- */
type Ring = [number, number][];
function ringsToPath(rings: Ring[]): string {
  let d = '';
  for (const ring of rings) {
    ring.forEach(([lon, lat], i) => {
      const [px, py] = projector(lon, lat);
      d += (i === 0 ? 'M' : 'L') + px.toFixed(1) + ',' + py.toFixed(1);
    });
    d += 'Z';
  }
  return d;
}
interface GeoGeometry {
  type: string;
  coordinates: Ring[] | Ring[][];
}
function featureToPath(geometry: GeoGeometry | null | undefined): string {
  if (!geometry) return '';
  if (geometry.type === 'Polygon') return ringsToPath(geometry.coordinates as Ring[]);
  if (geometry.type === 'MultiPolygon')
    return (geometry.coordinates as Ring[][]).map((poly) => ringsToPath(poly)).join('');
  return '';
}

/* ---------- logo with favicon fallback chain ---------- */
function monogram(name: string): string {
  const words = name.replace(/[()]/g, '').split(/\s+/).filter(Boolean);
  let m = words[0][0];
  if (words[1] && /^[A-Za-z]/.test(words[1])) m += words[1][0];
  return m.toUpperCase();
}

function CompanyLogo({ company }: { company: SpaceCompany }) {
  const [stage, setStage] = useState(0); // 0=clearbit 1=favicon 2=monogram
  const src =
    stage === 0
      ? `https://logo.clearbit.com/${company.domain}?size=80`
      : `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`;
  return (
    <div className="relative h-[42px] w-[42px] flex-none grid place-items-center overflow-hidden rounded-[10px] bg-white">
      {stage < 2 ? (
        <img
          key={stage}
          src={src}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-[5px]"
          onError={() => setStage((s) => s + 1)}
        />
      ) : (
        <span className="text-[15px] font-bold tracking-[-0.02em] text-deepspace">
          {monogram(company.name)}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
export function EuropeActorsMap({ className = '' }: { className?: string }) {
  const companies = useMemo(
    () => EUROPEAN_SPACE_COMPANIES.map((c, id) => ({ ...c, id })),
    [],
  );
  type Co = (typeof companies)[number];

  const [geo, setGeo] = useState<{ geometry: GeoGeometry }[] | null>(null);
  const [geoFailed, setGeoFailed] = useState(false);
  const [active, setActive] = useState<Set<CompanyTier>>(new Set(ALL_TIERS));
  const [activeSec, setActiveSec] = useState<Set<SectorKey>>(new Set(SECTOR_ORDER));
  const [colorMode, setColorMode] = useState<ColorMode>('tier');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('tier');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hovered, setHovered] = useState<Co | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  /* pin geometry/colour helpers */
  const radiusOf = (c: Co) => TIERS[c.tier].r;
  const colorOf = (c: Co) => (colorMode === 'sector' ? SECTORS[c.sector].color : TIERS[c.tier].color);

  /* fetch country outlines */
  useEffect(() => {
    let alive = true;
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => {
        if (alive) setGeo(data.features || []);
      })
      .catch(() => alive && setGeoFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const countryPaths = useMemo(
    () => (geo ? geo.map((f) => featureToPath(f.geometry)).filter(Boolean) : []),
    [geo],
  );

  const graticule = useMemo(() => {
    const lines: string[] = [];
    for (let lon = -10; lon <= 30; lon += 10) {
      const seg: string[] = [];
      for (let lat = 34; lat <= 66; lat += 2) {
        const [x, y] = projector(lon, lat);
        seg.push((seg.length ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1));
      }
      lines.push(seg.join(''));
    }
    for (let lat = 40; lat <= 60; lat += 10) {
      const seg: string[] = [];
      for (let lon = -12; lon <= 30; lon += 2) {
        const [x, y] = projector(lon, lat);
        seg.push((seg.length ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1));
      }
      lines.push(seg.join(''));
    }
    return lines.join('');
  }, []);

  const matchesQuery = (c: Co) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q) ||
      SECTORS[c.sector].label.toLowerCase().includes(q)
    );
  };
  const isVisible = (c: Co) => active.has(c.tier) && activeSec.has(c.sector) && matchesQuery(c);

  const rows = useMemo(() => {
    const list = companies.filter(isVisible);
    list.sort((a, b) => {
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      if (sortMode === 'country')
        return a.country.localeCompare(b.country) || a.name.localeCompare(b.name);
      if (sortMode === 'sector')
        return (
          SECTOR_ORDER.indexOf(a.sector) - SECTOR_ORDER.indexOf(b.sector) ||
          a.tier - b.tier ||
          a.name.localeCompare(b.name)
        );
      return a.tier - b.tier || a.name.localeCompare(b.name);
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, active, activeSec, query, sortMode]);

  const groupOf = (c: Co): string | null => {
    if (sortMode === 'sector') return SECTORS[c.sector].label;
    if (sortMode === 'tier') return TIERS[c.tier].label;
    return null;
  };

  const toggleTier = (t: CompanyTier) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      if (next.size === 0) next.add(t);
      return next;
    });
  const toggleSector = (k: SectorKey) =>
    setActiveSec((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      if (next.size === 0) next.add(k);
      return next;
    });

  const selectCompany = (id: number) => {
    setSelectedId(id);
    const row = rowRefs.current[id];
    const list = listRef.current;
    if (row && list) {
      const top = row.offsetTop - list.clientHeight / 2 + row.clientHeight / 2;
      list.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const countries = new Set(companies.map((c) => c.country)).size;
  const hoverPos = hovered ? projector(hovered.lon, hovered.lat) : null;

  /* chip helper */
  const Chip = ({
    on,
    color,
    label,
    count,
    onClick,
  }: {
    on: boolean;
    color: string;
    label: string;
    count: number;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-[9px] pr-3 text-[11.5px] font-medium text-white/80 transition-all duration-150 hover:border-white/30 ${
        on ? '' : 'opacity-30'
      }`}
    >
      <span
        className="h-[11px] w-[11px] rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {label}
      <span className="text-white/45 tabular-nums">{count}</span>
    </button>
  );

  return (
    <div className={className}>
      {/* ── Stat row ── */}
      <div className="mb-8 flex flex-wrap gap-10">
        {[
          [companies.length, 'entreprises cartographiées'],
          [countries, 'pays européens'],
          [SECTOR_ORDER.length, "domaines d'activité"],
        ].map(([n, l]) => (
          <div key={l as string}>
            <div className="text-[40px] font-bold leading-none tracking-[-0.02em] text-magenta">
              {n}
            </div>
            <div className="mt-1.5 text-[11px] uppercase tracking-[0.08em] text-white/55">{l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.42fr_1fr]">
        {/* ════ MAP PANEL ════ */}
        <div className="flex flex-col overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04]">
          {/* head: title + colour-mode toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
            <div>
              <h3 className="text-[15px] font-semibold">Où se concentre le spatial européen</h3>
              <p className="mt-0.5 text-[11.5px] text-white/45">
                Survole un point pour le détail · clique pour le retrouver dans la liste
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="mr-0.5 text-[11px] uppercase tracking-[0.08em] text-white/40">
                Couleur
              </span>
              {(['tier', 'sector'] as ColorMode[]).map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setColorMode(m)}
                  className={`border border-white/10 px-[13px] py-1.5 text-[12px] font-medium transition-all ${
                    i === 0 ? 'rounded-l-lg' : 'rounded-r-lg border-l-0'
                  } ${
                    colorMode === m
                      ? 'border-magenta bg-magenta text-white'
                      : 'bg-transparent text-white/60 hover:text-white'
                  }`}
                >
                  {m === 'tier' ? 'Taille' : 'Domaine'}
                </button>
              ))}
            </div>
          </div>

          {/* filter bar: size chips + domain chips */}
          <div className="flex flex-wrap gap-x-7 gap-y-2.5 border-b border-white/[0.07] px-5 py-3.5">
            <div className="flex items-start gap-3">
              <span
                className={`whitespace-nowrap pt-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] ${
                  colorMode === 'tier' ? 'text-magenta' : 'text-white/40'
                }`}
              >
                Taille
              </span>
              <div className="flex flex-wrap gap-[7px]">
                {ALL_TIERS.map((t) => (
                  <Chip
                    key={t}
                    on={active.has(t)}
                    color={TIERS[t].color}
                    label={TIERS[t].label}
                    count={companies.filter((c) => c.tier === t).length}
                    onClick={() => toggleTier(t)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span
                className={`whitespace-nowrap pt-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] ${
                  colorMode === 'sector' ? 'text-magenta' : 'text-white/40'
                }`}
              >
                Domaine
              </span>
              <div className="flex flex-wrap gap-[7px]">
                {SECTOR_ORDER.map((k) => (
                  <Chip
                    key={k}
                    on={activeSec.has(k)}
                    color={SECTORS[k].color}
                    label={SECTORS[k].label}
                    count={companies.filter((c) => c.sector === k).length}
                    onClick={() => toggleSector(k)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* map */}
          <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              className="block h-full w-full"
            >
              <path d={graticule} fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth={0.5} />
              {countryPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="rgba(255,255,255,0.05)"
                  stroke="rgba(255,255,255,0.13)"
                  strokeWidth={0.6}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {companies.map((c) => {
                const [px, py] = projector(c.lon, c.lat);
                const dim = !isVisible(c);
                const sel = selectedId === c.id || hovered?.id === c.id;
                const color = colorOf(c);
                const r = radiusOf(c);
                return (
                  <g
                    key={c.id}
                    transform={`translate(${px},${py})`}
                    style={{ opacity: dim ? 0.12 : 1, cursor: 'pointer', transition: 'opacity 160ms' }}
                    onMouseEnter={() => setHovered(c)}
                    onMouseLeave={() => setHovered((h) => (h?.id === c.id ? null : h))}
                    onClick={() => selectCompany(c.id)}
                  >
                    {sel && <circle r={r + 6} fill="none" stroke={color} strokeWidth={1.5} />}
                    <circle
                      r={r + (sel ? 2.5 : 0)}
                      fill={color}
                      stroke="rgba(11,15,42,0.9)"
                      strokeWidth={1.1}
                      style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'r 150ms, fill 250ms' }}
                    />
                  </g>
                );
              })}
            </svg>

            {!geo && (
              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[13px] text-white/40">
                {geoFailed
                  ? 'Carte indisponible (réseau) — les points restent positionnés.'
                  : 'Chargement de la carte…'}
              </div>
            )}

            {hovered && hoverPos && (
              <div
                className="pointer-events-none absolute z-20 min-w-[170px] rounded-xl border border-white/15 bg-[#080b20]/95 px-3 py-[11px] shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
                style={{
                  left: `${(hoverPos[0] / W) * 100}%`,
                  top: `${(hoverPos[1] / H) * 100}%`,
                  transform: `translate(${hoverPos[0] > W * 0.7 ? '-100%' : '14px'}, ${
                    hoverPos[1] > H * 0.72 ? '-100%' : '14px'
                  })`,
                }}
              >
                <div className="text-[13.5px] font-semibold leading-tight">{hovered.name}</div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-white/60">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: TIERS[hovered.tier].color }}
                  />
                  {TIERS[hovered.tier].label}
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-white/60">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: SECTORS[hovered.sector].color }}
                  />
                  {SECTORS[hovered.sector].label}
                </div>
                <div className="mt-1 text-[11px] text-white/50">
                  {hovered.city} · {hovered.country}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ════ DIRECTORY PANEL ════ */}
        <div className="flex flex-col overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04]">
          <div className="flex flex-col gap-3 border-b border-white/[0.07] p-[18px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chercher une entreprise, une ville, un domaine…"
                autoComplete="off"
                className="w-full rounded-[10px] border border-white/10 bg-white/[0.04] py-[11px] pl-[38px] pr-3.5 text-[13.5px] text-white placeholder:text-white/40 focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/20"
              />
            </div>
            <div className="flex items-center justify-between text-[11.5px] text-white/50">
              <span>
                {rows.length} {rows.length > 1 ? 'entreprises' : 'entreprise'}
              </span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-[9px] py-1.5 text-[11.5px] text-white"
              >
                <option value="tier">Trier : par taille</option>
                <option value="sector">Trier : par domaine</option>
                <option value="name">Trier : A → Z</option>
                <option value="country">Trier : par pays</option>
              </select>
            </div>
          </div>

          <div
            ref={listRef}
            className="max-h-[592px] overflow-y-auto p-2"
            style={{ scrollbarWidth: 'thin' }}
          >
            {rows.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-white/40">
                Aucune entreprise ne correspond.
              </div>
            ) : (
              rows.map((c, i) => {
                const group = groupOf(c);
                const showHead = group !== null && (i === 0 || groupOf(rows[i - 1]) !== group);
                const groupCount = group ? rows.filter((x) => groupOf(x) === group).length : 0;
                const dotColor = colorOf(c);
                const isActive = selectedId === c.id;
                return (
                  <div key={c.id}>
                    {showHead && (
                      <div className="sticky top-0 z-[1] flex items-center justify-between gap-2.5 bg-gradient-to-b from-[#0d112c]/95 to-transparent px-3.5 pb-1.5 pt-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white/55">
                        {group}
                        <span className="tracking-normal text-white/35 tabular-nums">{groupCount}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      ref={(el) => (rowRefs.current[c.id] = el)}
                      onClick={() => selectCompany(c.id)}
                      onMouseEnter={() => setHovered(c)}
                      onMouseLeave={() => setHovered((h) => (h?.id === c.id ? null : h))}
                      className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-[13px] rounded-[13px] border p-3 text-left transition-all duration-150 ${
                        isActive
                          ? 'border-magenta/55 bg-magenta/10'
                          : 'border-transparent hover:border-white/10 hover:bg-white/[0.04]'
                      }`}
                    >
                      <CompanyLogo company={c} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-[7px] text-[13.5px] font-semibold leading-tight">
                          <span
                            className="h-2 w-2 flex-none rounded-full"
                            style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
                          />
                          {c.name}
                        </div>
                        <div className="mt-0.5 truncate text-[11.5px] text-white/55">
                          {c.city} · {c.country} — {TIERS[c.tier].label} · {SECTORS[c.sector].label}
                        </div>
                        <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/40">
                          {c.desc}
                        </div>
                      </div>
                      <a
                        href={`https://${c.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Visiter ${c.domain}`}
                        onClick={(e) => e.stopPropagation()}
                        className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg border border-white/10 text-white/60 transition-all hover:border-magenta hover:bg-magenta/20 hover:text-white"
                      >
                        <ArrowUpRight className="h-[15px] w-[15px]" />
                      </a>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 max-w-[760px] text-[12px] italic leading-relaxed text-white/40">
        Sélection non exhaustive d'acteurs de l'industrie spatiale en Europe, à vocation pédagogique.
        Coordonnées, tailles et domaines approximatifs. Sources : sites des entreprises, ESA, CNES.
      </p>
    </div>
  );
}

export default EuropeActorsMap;
