import { useEffect, useRef } from 'react';

interface Phase {
  id: string;
  tStart: number;
  tEnd: number;
  altitude: number;
}

interface Props {
  missionTime: number;
  phases: Phase[];
  totalTime: number;
  completed: boolean;
}

const EARTH_RADIUS_KM = 6371;
const LEO_ALT_KM = 400;
const ISO_TILT = 0.42;
const ISO_SPIN = 0.52;

function project(
  x: number, y: number, z: number,
  cx: number, cy: number, scale: number
): [number, number, number] {
  const cosSpin = Math.cos(ISO_SPIN);
  const sinSpin = Math.sin(ISO_SPIN);
  const x1 = x * cosSpin - z * sinSpin;
  const z1 = x * sinSpin + z * cosSpin;
  const cosTilt = Math.cos(ISO_TILT);
  const sinTilt = Math.sin(ISO_TILT);
  const y2 = y * cosTilt - z1 * sinTilt;
  const z2 = y * sinTilt + z1 * cosTilt;
  return [cx + x1 * scale, cy - y2 * scale, z2];
}

function sphere(lat: number, lon: number, r: number): [number, number, number] {
  return [
    r * Math.cos(lat) * Math.cos(lon),
    r * Math.sin(lat),
    r * Math.cos(lat) * Math.sin(lon),
  ];
}

function altAt(t: number, phases: Phase[]): number {
  for (let i = phases.length - 1; i >= 0; i--) {
    if (t >= phases[i].tStart) {
      const p = phases[i];
      const prevAlt = i > 0 ? phases[i - 1].altitude : 0;
      const frac = Math.min((t - p.tStart) / (p.tEnd - p.tStart), 1);
      return prevAlt + (p.altitude - prevAlt) * (1 - Math.pow(1 - frac, 2));
    }
  }
  return 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function draw(
  canvas: HTMLCanvasElement,
  missionTime: number,
  phases: Phase[],
  totalTime: number,
  completed: boolean
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  if (W === 0 || H === 0) return;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const cx = W * 0.46;
  const cy = H * 0.52;
  const SCALE = Math.min(W, H) * 0.3;
  const R = EARTH_RADIUS_KM;

  const tNow = Math.max(0, Math.min(missionTime, totalTime));
  const leoPhase = phases.find(p => p.id === 'leo_insert');
  const sepPhase = phases.find(p => p.id === 'payload_sep');
  const LEO_PHASE_START = leoPhase?.tStart ?? totalTime * 0.55;
  const SEP_PHASE_START = sepPhase?.tStart ?? totalTime * 0.95;

  const orbitProgress = missionTime >= LEO_PHASE_START
    ? Math.min((missionTime - LEO_PHASE_START) / (totalTime - LEO_PHASE_START), 1)
    : 0;
  const orbitAngle = orbitProgress * Math.PI * 2.4;

  // ── Background ─────────────────────────────────────────────────────────────
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
  bgGrad.addColorStop(0, '#0b1628');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  const rng = mulberry32(7);
  for (let i = 0; i < 200; i++) {
    const sx = rng() * W;
    const sy = rng() * H;
    const sr = rng() * 1.1 + 0.2;
    const alpha = 0.15 + rng() * 0.65;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.fill();
  }

  // ── Globe ──────────────────────────────────────────────────────────────────
  const earthGrad = ctx.createRadialGradient(
    cx - SCALE * 0.2, cy - SCALE * 0.2, SCALE * 0.05,
    cx, cy, SCALE
  );
  earthGrad.addColorStop(0, '#1e4080');
  earthGrad.addColorStop(0.55, '#0f2550');
  earthGrad.addColorStop(1, '#050d1e');
  ctx.beginPath();
  ctx.arc(cx, cy, SCALE, 0, Math.PI * 2);
  ctx.fillStyle = earthGrad;
  ctx.fill();

  // Grid lines
  ctx.lineWidth = 0.7;
  for (let lat = -75; lat <= 75; lat += 30) {
    const latR = (lat * Math.PI) / 180;
    ctx.beginPath();
    let first = true;
    for (let lon = 0; lon <= 360; lon += 3) {
      const [x, y, z] = sphere(latR, (lon * Math.PI) / 180, R);
      const [px, py, depth] = project(x, y, z, cx, cy, SCALE / R);
      if (depth < 0) { first = true; continue; }
      first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      first = false;
    }
    ctx.strokeStyle = 'rgba(56,189,248,0.08)';
    ctx.stroke();
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const lonR = (lon * Math.PI) / 180;
    ctx.beginPath();
    let first = true;
    for (let lat = -90; lat <= 90; lat += 3) {
      const [x, y, z] = sphere((lat * Math.PI) / 180, lonR, R);
      const [px, py, depth] = project(x, y, z, cx, cy, SCALE / R);
      if (depth < 0) { first = true; continue; }
      first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      first = false;
    }
    ctx.strokeStyle = 'rgba(56,189,248,0.06)';
    ctx.stroke();
  }

  // Globe specular highlight
  const highlight = ctx.createRadialGradient(
    cx - SCALE * 0.3, cy - SCALE * 0.3, SCALE * 0.05,
    cx, cy, SCALE
  );
  highlight.addColorStop(0, 'rgba(147,197,253,0.2)');
  highlight.addColorStop(0.4, 'rgba(56,189,248,0.05)');
  highlight.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, SCALE, 0, Math.PI * 2);
  ctx.fillStyle = highlight;
  ctx.fill();

  // Atmosphere rim
  const atmGrad = ctx.createRadialGradient(cx, cy, SCALE * 0.93, cx, cy, SCALE * 1.14);
  atmGrad.addColorStop(0, 'rgba(56,189,248,0.25)');
  atmGrad.addColorStop(0.5, 'rgba(56,189,248,0.07)');
  atmGrad.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, SCALE * 1.14, 0, Math.PI * 2);
  ctx.fillStyle = atmGrad;
  ctx.fill();

  // ── Launch site Kourou ─────────────────────────────────────────────────────
  const launchLat = (5 * Math.PI) / 180;
  const launchLon = (-53 * Math.PI) / 180;
  const [lx, ly, lz] = sphere(launchLat, launchLon, R);
  const [lpx, lpy, ldepth] = project(lx, ly, lz, cx, cy, SCALE / R);
  if (ldepth >= 0) {
    ctx.beginPath();
    ctx.arc(lpx, lpy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lpx, lpy, 6.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(251,191,36,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(251,191,36,0.9)';
    ctx.font = `bold 9px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Kourou', lpx + 8, lpy + 3.5);
  }

  const orbitR = (R + LEO_ALT_KM) / R;
  const orbitInclination = (5.2 * Math.PI) / 180;
  // The orbit start angle aligns with where the ascent ends (~45° east of Kourou)
  const orbitStartAngle = -(Math.PI / 2) + (45 * Math.PI) / 180;

  // ── Ghost orbit ring ───────────────────────────────────────────────────────
  ctx.setLineDash([4, 5]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  let firstOrbit = true;
  for (let a = 0; a <= 360; a += 2) {
    const aR = (a * Math.PI) / 180;
    const ox = orbitR * R * Math.cos(aR);
    const oy = orbitR * R * Math.sin(aR) * Math.sin(orbitInclination);
    const oz = orbitR * R * Math.sin(aR) * Math.cos(orbitInclination);
    const [px, py, depth] = project(ox, oy, oz, cx, cy, SCALE / R);
    if (depth < 0) { firstOrbit = true; continue; }
    firstOrbit ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    firstOrbit = false;
  }
  ctx.strokeStyle = 'rgba(52,211,153,0.15)';
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Ascent trajectory ──────────────────────────────────────────────────────
  if (tNow > 0) {
    const progressNow = Math.min(tNow / LEO_PHASE_START, 1);

    // Ghost full ascent path
    ctx.beginPath();
    let firstGhost = true;
    for (let i = 0; i <= 100; i++) {
      const frac = i / 100;
      const alt = frac * LEO_ALT_KM;
      const r = (R + alt) / R;
      const lat = launchLat - frac * (3 * Math.PI) / 180;
      const lon = launchLon + frac * (45 * Math.PI) / 180;
      const [x, y, z] = sphere(lat, lon, r * R);
      const [px, py, depth] = project(x, y, z, cx, cy, SCALE / R);
      if (depth < 0) { firstGhost = true; continue; }
      firstGhost ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      firstGhost = false;
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Traveled ascent
    const stepsNow = Math.max(1, Math.floor(progressNow * 100));
    ctx.beginPath();
    let firstAscent = true;
    for (let i = 0; i <= stepsNow; i++) {
      const frac = i / 100;
      const alt = frac * LEO_ALT_KM;
      const r = (R + alt) / R;
      const lat = launchLat - frac * (3 * Math.PI) / 180;
      const lon = launchLon + frac * (45 * Math.PI) / 180;
      const [x, y, z] = sphere(lat, lon, r * R);
      const [px, py, depth] = project(x, y, z, cx, cy, SCALE / R);
      if (depth < 0) { firstAscent = true; continue; }
      firstAscent ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      firstAscent = false;
    }
    // Use a solid color instead of gradient (gradient needs stable coords)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(251,191,36,0.5)';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ── Orbit arc traveled ─────────────────────────────────────────────────────
  if (orbitAngle > 0.01) {
    const ORBIT_STEPS = 300;
    const points: Array<[number, number, number]> = [];
    for (let i = 0; i <= ORBIT_STEPS; i++) {
      const a = orbitStartAngle + (i / ORBIT_STEPS) * orbitAngle;
      const ox = orbitR * R * Math.cos(a);
      const oy = orbitR * R * Math.sin(a) * Math.sin(orbitInclination);
      const oz = orbitR * R * Math.sin(a) * Math.cos(orbitInclination);
      points.push(project(ox, oy, oz, cx, cy, SCALE / R));
    }

    // Draw back segments first (behind globe), then front
    for (const front of [false, true]) {
      ctx.beginPath();
      let firstSeg = true;
      for (const [px, py, depth] of points) {
        const isFront = depth >= 0;
        if (isFront !== front) { firstSeg = true; continue; }
        firstSeg ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        firstSeg = false;
      }
      ctx.strokeStyle = front ? 'rgba(52,211,153,0.85)' : 'rgba(52,211,153,0.15)';
      ctx.lineWidth = front ? 2.2 : 1;
      if (!front) ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // ── Satellite / rocket ─────────────────────────────────────────────────────
  let satPX = 0, satPY = 0, satDepth = -1;
  let showSat = false;

  if (tNow > 0) {
    let sx3 = 0, sy3 = 0, sz3 = 0;
    if (tNow < LEO_PHASE_START) {
      const frac = tNow / LEO_PHASE_START;
      const alt = altAt(tNow, phases);
      const r = (R + alt) / R;
      const lat = launchLat - frac * (3 * Math.PI) / 180;
      const lon = launchLon + frac * (45 * Math.PI) / 180;
      [sx3, sy3, sz3] = sphere(lat, lon, r * R);
    } else {
      const a = orbitStartAngle + orbitAngle;
      sx3 = orbitR * R * Math.cos(a);
      sy3 = orbitR * R * Math.sin(a) * Math.sin(orbitInclination);
      sz3 = orbitR * R * Math.sin(a) * Math.cos(orbitInclination);
    }
    const [px, py, depth] = project(sx3, sy3, sz3, cx, cy, SCALE / R);
    satPX = px; satPY = py; satDepth = depth;
    showSat = satDepth >= -SCALE * 0.1;
  }

  if (showSat) {
    const isSeparated = tNow >= SEP_PHASE_START;
    const isOrbiting = tNow >= LEO_PHASE_START;
    const glowColor = isSeparated ? '52,211,153' : '251,191,36';

    const glow = ctx.createRadialGradient(satPX, satPY, 0, satPX, satPY, 18);
    glow.addColorStop(0, `rgba(${glowColor},0.55)`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(satPX, satPY, 18, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    if (isOrbiting || isSeparated) {
      // Satellite icon
      ctx.save();
      ctx.translate(satPX, satPY);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-4, -3, 8, 6);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-13, -1.5, 7.5, 3);
      ctx.fillRect(5.5, -1.5, 7.5, 3);
      ctx.restore();
    } else {
      // Rocket
      ctx.save();
      ctx.translate(satPX, satPY);
      const flameGrad = ctx.createLinearGradient(0, 4, 0, 16);
      flameGrad.addColorStop(0, 'rgba(251,191,36,0.9)');
      flameGrad.addColorStop(1, 'rgba(239,68,68,0)');
      ctx.beginPath();
      ctx.moveTo(-3, 4);
      ctx.quadraticCurveTo(0, 16, 3, 4);
      ctx.fillStyle = flameGrad;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(5, 5);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.restore();
    }

    if (completed) {
      const burst = ctx.createRadialGradient(satPX, satPY, 0, satPX, satPY, 30);
      burst.addColorStop(0, 'rgba(52,211,153,0.65)');
      burst.addColorStop(1, 'rgba(52,211,153,0)');
      ctx.beginPath();
      ctx.arc(satPX, satPY, 30, 0, Math.PI * 2);
      ctx.fillStyle = burst;
      ctx.fill();
    }
  }

  // ── Labels ─────────────────────────────────────────────────────────────────
  if (orbitAngle > 0.5) {
    const labelA = orbitStartAngle + orbitAngle * 0.5;
    const lox = orbitR * R * Math.cos(labelA);
    const loy = orbitR * R * Math.sin(labelA) * Math.sin(orbitInclination);
    const loz = orbitR * R * Math.sin(labelA) * Math.cos(orbitInclination);
    const [lpxo, lpyo, ldO] = project(lox, loy, loz, cx, cy, SCALE / R);
    if (ldO >= 0) {
      ctx.fillStyle = 'rgba(52,211,153,0.85)';
      ctx.font = `bold 9px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('LEO ~400 km', lpxo + 6, lpyo - 4);
    }
  }

  // Legend
  const lx2 = 12;
  let ly2 = H - 42;
  ctx.font = `9px ui-sans-serif, system-ui, sans-serif`;
  for (const { color, label } of [
    { color: '#f59e0b', label: 'Trajectoire ascension' },
    { color: '#34d399', label: 'Orbite LEO (400 km)' },
  ]) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx2, ly2);
    ctx.lineTo(lx2 + 16, ly2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(203,213,225,0.7)';
    ctx.textAlign = 'left';
    ctx.fillText(label, lx2 + 20, ly2 + 3.5);
    ly2 += 14;
  }
}

export function TrajectoryView({ missionTime, phases, totalTime, completed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep latest props in a ref so the ResizeObserver callback can access them
  const propsRef = useRef({ missionTime, phases, totalTime, completed });
  propsRef.current = { missionTime, phases, totalTime, completed };

  // Redraw whenever props change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw(canvas, missionTime, phases, totalTime, completed);
  }, [missionTime, phases, totalTime, completed]);

  // Also redraw when the canvas is resized (handles initial render with size=0)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const { missionTime, phases, totalTime, completed } = propsRef.current;
      draw(canvas, missionTime, phases, totalTime, completed);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full rounded-xl border border-white/8 overflow-hidden bg-slate-950" style={{ height: 300 }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
    </div>
  );
}
