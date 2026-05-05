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

// ── Constants ────────────────────────────────────────────────────────────────
const EARTH_RADIUS_KM = 6371;
const LEO_ALT_KM = 400;
// Isometric-style camera: looking slightly from above and to the side
const ISO_TILT = 0.42;   // radians tilt from horizontal (how high we look down)
const ISO_SPIN = 0.52;   // radians spin around vertical axis

// ── 3D → 2D projection ───────────────────────────────────────────────────────
// Simple orthographic projection with rotation
function project(
  x: number, y: number, z: number,
  cx: number, cy: number, scale: number
): [number, number, number] {
  // Rotate around Y axis (spin)
  const cosSpin = Math.cos(ISO_SPIN);
  const sinSpin = Math.sin(ISO_SPIN);
  const x1 = x * cosSpin - z * sinSpin;
  const z1 = x * sinSpin + z * cosSpin;

  // Rotate around X axis (tilt)
  const cosTilt = Math.cos(ISO_TILT);
  const sinTilt = Math.sin(ISO_TILT);
  const y2 = y * cosTilt - z1 * sinTilt;
  const z2 = y * sinTilt + z1 * cosTilt;

  return [cx + x1 * scale, cy - y2 * scale, z2];
}

// ── Sphere point (lat/lon in radians) ────────────────────────────────────────
function sphere(lat: number, lon: number, r: number): [number, number, number] {
  return [
    r * Math.cos(lat) * Math.cos(lon),
    r * Math.sin(lat),
    r * Math.cos(lat) * Math.sin(lon),
  ];
}

// ── Altitude interpolation ───────────────────────────────────────────────────
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

// ── mulberry32 seeded PRNG ───────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function TrajectoryView({ missionTime, phases, totalTime, completed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Center and scale so Earth fits nicely
    const cx = W * 0.45;
    const cy = H * 0.52;
    const SCALE = Math.min(W, H) * 0.28;
    const R = EARTH_RADIUS_KM;

    const tNow = Math.max(0, Math.min(missionTime, totalTime));
    const LEO_PHASE_START = phases.find(p => p.id === 'leo_insert')?.tStart ?? totalTime * 0.5;
    const SEP_PHASE_START = phases.find(p => p.id === 'payload_sep')?.tStart ?? totalTime * 0.95;

    // How far along the orbit arc we've traveled (0..2π after LEO insertion)
    const orbitProgress = missionTime >= LEO_PHASE_START
      ? Math.min((missionTime - LEO_PHASE_START) / (totalTime - LEO_PHASE_START), 1)
      : 0;
    const orbitAngle = orbitProgress * Math.PI * 2.2; // slightly more than one full revolution

    // ── Background ──────────────────────────────────────────────────────────
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
    bgGrad.addColorStop(0, '#0a1628');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    const rng = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      const sx = rng() * W;
      const sy = rng() * H;
      const sr = rng() * 1.1 + 0.2;
      const alpha = 0.15 + rng() * 0.7;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }

    // ── Draw Earth globe ─────────────────────────────────────────────────────
    // Back hemisphere (darker)
    const earthBack = ctx.createRadialGradient(cx - SCALE * 0.15, cy - SCALE * 0.15, SCALE * 0.1, cx, cy, SCALE);
    earthBack.addColorStop(0, '#1e3a6e');
    earthBack.addColorStop(0.6, '#0f2144');
    earthBack.addColorStop(1, '#050d1e');
    ctx.beginPath();
    ctx.arc(cx, cy, SCALE, 0, Math.PI * 2);
    ctx.fillStyle = earthBack;
    ctx.fill();

    // Latitude/longitude grid lines (back faces)
    ctx.strokeStyle = 'rgba(56,189,248,0.07)';
    ctx.lineWidth = 0.8;

    // Latitude lines
    for (let lat = -75; lat <= 75; lat += 30) {
      const latR = (lat * Math.PI) / 180;
      ctx.beginPath();
      let first = true;
      for (let lon = 0; lon <= 360; lon += 4) {
        const lonR = (lon * Math.PI) / 180;
        const [x, y, z] = sphere(latR, lonR, R);
        const [px, py, depth] = project(x, y, z, cx, cy, SCALE / R);
        if (depth < 0) { first = true; continue; }
        first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        first = false;
      }
      ctx.stroke();
    }

    // Longitude lines
    for (let lon = 0; lon < 360; lon += 30) {
      const lonR = (lon * Math.PI) / 180;
      ctx.beginPath();
      let first = true;
      for (let lat = -90; lat <= 90; lat += 3) {
        const latR = (lat * Math.PI) / 180;
        const [x, y, z] = sphere(latR, lonR, R);
        const [px, py, depth] = project(x, y, z, cx, cy, SCALE / R);
        if (depth < 0) { first = true; continue; }
        first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        first = false;
      }
      ctx.stroke();
    }

    // Globe highlight
    const highlight = ctx.createRadialGradient(
      cx - SCALE * 0.3, cy - SCALE * 0.3, SCALE * 0.05,
      cx, cy, SCALE
    );
    highlight.addColorStop(0, 'rgba(147,197,253,0.18)');
    highlight.addColorStop(0.35, 'rgba(56,189,248,0.05)');
    highlight.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, SCALE, 0, Math.PI * 2);
    ctx.fillStyle = highlight;
    ctx.fill();

    // Atmosphere glow rim
    const atmGrad = ctx.createRadialGradient(cx, cy, SCALE * 0.92, cx, cy, SCALE * 1.12);
    atmGrad.addColorStop(0, 'rgba(56,189,248,0.22)');
    atmGrad.addColorStop(0.5, 'rgba(56,189,248,0.07)');
    atmGrad.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, SCALE * 1.12, 0, Math.PI * 2);
    ctx.fillStyle = atmGrad;
    ctx.fill();

    // ── Launch site dot (Kourou ~5°N, 53°W) ────────────────────────────────
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
      ctx.arc(lpx, lpy, 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251,191,36,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(251,191,36,0.9)';
      ctx.font = `bold 9px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Kourou', lpx + 8, lpy + 3);
    }

    // ── Ghost orbit ring (full LEO orbit at 400 km) ─────────────────────────
    const orbitR = (R + LEO_ALT_KM) / R;
    const orbitInclination = (5.2 * Math.PI) / 180; // Kourou inclination ~5.2°

    // Draw ghost orbit (full circle, very faint)
    ctx.beginPath();
    let firstOrbit = true;
    const orbitPoints: Array<[number, number, number]> = [];
    for (let a = 0; a <= 360; a += 2) {
      const aR = (a * Math.PI) / 180;
      // Orbit in equatorial plane, then tilt by inclination
      const ox = orbitR * R * Math.cos(aR);
      const oy = orbitR * R * Math.sin(aR) * Math.sin(orbitInclination);
      const oz = orbitR * R * Math.sin(aR) * Math.cos(orbitInclination);
      const [px, py, depth] = project(ox, oy, oz, cx, cy, SCALE / R);
      orbitPoints.push([px, py, depth]);
      if (depth < 0) { firstOrbit = true; continue; }
      firstOrbit ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      firstOrbit = false;
    }
    ctx.strokeStyle = 'rgba(52,211,153,0.12)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Ascent trajectory (from launch to LEO) ───────────────────────────────
    const ASCENT_STEPS = 120;
    // Trajectory: starts vertical then curves east, reaching ~45° lon east of Kourou at LEO
    const endLon = launchLon + (45 * Math.PI) / 180;

    if (tNow > 0) {
      const progressNow = Math.min(tNow / LEO_PHASE_START, 1);

      // Draw ghost ascent path
      ctx.beginPath();
      let firstGhost = true;
      for (let i = 0; i <= ASCENT_STEPS; i++) {
        const frac = i / ASCENT_STEPS;
        const alt = frac * LEO_ALT_KM;
        const r = (R + alt) / R;
        // Curve: linear lat change (stays near Kourou lat), lon curves east
        const lat = launchLat - frac * (3 * Math.PI) / 180; // slight northward pitch
        const lon = launchLon + frac * (45 * Math.PI) / 180;
        const [x, y, z] = sphere(lat, lon, r * R);
        const [px, py, depth] = project(x, y, z, cx, cy, SCALE / R);
        if (depth < 0) { firstGhost = true; continue; }
        firstGhost ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        firstGhost = false;
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw traveled ascent path
      ctx.beginPath();
      let firstAscent = true;
      const stepsNow = Math.floor(progressNow * ASCENT_STEPS);
      for (let i = 0; i <= stepsNow; i++) {
        const frac = i / ASCENT_STEPS;
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
      const ascentGrad = ctx.createLinearGradient(lpx, lpy, cx + SCALE * 0.4, cy - SCALE * 0.3);
      ascentGrad.addColorStop(0, '#fbbf24');
      ascentGrad.addColorStop(0.5, '#f87171');
      ascentGrad.addColorStop(1, '#22d3ee');
      ctx.strokeStyle = ascentGrad;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(251,191,36,0.4)';
      ctx.shadowBlur = 5;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // ── Orbit arc traveled (after LEO insertion) ─────────────────────────────
    if (orbitAngle > 0) {
      const orbitStartAngle = -Math.PI / 2 + (endLon - launchLon); // align with ascent end point

      // Draw traveled orbit arc
      const orbitSegments: Array<[number, number, number]> = [];
      for (let i = 0; i <= 300; i++) {
        const a = orbitStartAngle + (i / 300) * orbitAngle;
        const ox = orbitR * R * Math.cos(a);
        const oy = orbitR * R * Math.sin(a) * Math.sin(orbitInclination);
        const oz = orbitR * R * Math.sin(a) * Math.cos(orbitInclination);
        const projected = project(ox, oy, oz, cx, cy, SCALE / R);
        orbitSegments.push(projected);
      }

      // Split into front/back segments based on depth
      let segStart = 0;
      for (let i = 1; i <= orbitSegments.length; i++) {
        const prev = orbitSegments[i - 1];
        const curr = i < orbitSegments.length ? orbitSegments[i] : null;
        const prevFront = prev[2] >= 0;
        const currFront = curr ? curr[2] >= 0 : !prevFront;

        if (currFront !== prevFront || i === orbitSegments.length) {
          // Draw this segment
          ctx.beginPath();
          let firstSeg = true;
          for (let j = segStart; j < i; j++) {
            const [px, py, depth] = orbitSegments[j];
            if (depth < -SCALE * 0.1) { firstSeg = true; continue; }
            firstSeg ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            firstSeg = false;
          }
          const frac = segStart / orbitSegments.length;
          ctx.strokeStyle = prevFront
            ? `rgba(52,211,153,${0.5 + frac * 0.4})`
            : `rgba(52,211,153,0.12)`;
          ctx.lineWidth = prevFront ? 2.2 : 1;
          if (!prevFront) ctx.setLineDash([3, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          segStart = i;
        }
      }
    }

    // ── Satellite / rocket position ────────────────────────────────────────
    let satX = 0, satY = 0, satZ = 0;
    let satPX = 0, satPY = 0;
    let satDepth = 0;
    let showSat = false;

    if (tNow > 0 && tNow < totalTime) {
      if (tNow < LEO_PHASE_START) {
        // Still ascending
        const frac = tNow / LEO_PHASE_START;
        const alt = altAt(tNow, phases);
        const r = (R + alt) / R;
        const lat = launchLat - frac * (3 * Math.PI) / 180;
        const lon = launchLon + frac * (45 * Math.PI) / 180;
        const [x, y, z] = sphere(lat, lon, r * R);
        satX = x; satY = y; satZ = z;
      } else {
        // In orbit
        const orbitStartAngle = -Math.PI / 2 + (endLon - launchLon);
        const a = orbitStartAngle + orbitAngle;
        satX = orbitR * R * Math.cos(a);
        satY = orbitR * R * Math.sin(a) * Math.sin(orbitInclination);
        satZ = orbitR * R * Math.sin(a) * Math.cos(orbitInclination);
      }
      const [px, py, depth] = project(satX, satY, satZ, cx, cy, SCALE / R);
      satPX = px; satPY = py; satDepth = depth;
      showSat = satDepth >= -SCALE * 0.05;
    }

    if (showSat) {
      const isOrbiting = tNow >= LEO_PHASE_START;
      const isSeparated = tNow >= SEP_PHASE_START;

      // Glow
      const glow = ctx.createRadialGradient(satPX, satPY, 0, satPX, satPY, 16);
      glow.addColorStop(0, isSeparated ? 'rgba(52,211,153,0.5)' : 'rgba(251,191,36,0.5)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(satPX, satPY, 16, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      if (isSeparated || isOrbiting) {
        // Draw satellite icon (body + solar panels)
        ctx.save();
        ctx.translate(satPX, satPY);
        // Body
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-4, -3, 8, 6);
        // Solar panels
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(-12, -1.5, 7, 3);
        ctx.fillRect(5, -1.5, 7, 3);
        ctx.restore();
      } else {
        // Draw rocket (triangle)
        ctx.save();
        ctx.translate(satPX, satPY);
        // Flame
        const flameGrad = ctx.createLinearGradient(0, 5, 0, 14);
        flameGrad.addColorStop(0, 'rgba(251,191,36,0.9)');
        flameGrad.addColorStop(1, 'rgba(239,68,68,0)');
        ctx.beginPath();
        ctx.moveTo(-3, 5);
        ctx.quadraticCurveTo(0, 14, 3, 5);
        ctx.fillStyle = flameGrad;
        ctx.fill();
        // Body
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(4.5, 5);
        ctx.lineTo(-4.5, 5);
        ctx.closePath();
        ctx.fillStyle = '#e2e8f0';
        ctx.fill();
        ctx.restore();
      }
    }

    // ── Completed burst ───────────────────────────────────────────────────────
    if (completed && showSat) {
      const burst = ctx.createRadialGradient(satPX, satPY, 0, satPX, satPY, 28);
      burst.addColorStop(0, 'rgba(52,211,153,0.6)');
      burst.addColorStop(1, 'rgba(52,211,153,0)');
      ctx.beginPath();
      ctx.arc(satPX, satPY, 28, 0, Math.PI * 2);
      ctx.fillStyle = burst;
      ctx.fill();
    }

    // ── Labels ────────────────────────────────────────────────────────────────
    ctx.font = `bold 9px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'left';

    // LEO label
    if (orbitAngle > 0.3) {
      const labelAngle = -Math.PI / 2 + (endLon - launchLon) + orbitAngle * 0.5;
      const lox = orbitR * R * Math.cos(labelAngle);
      const loy = orbitR * R * Math.sin(labelAngle) * Math.sin(orbitInclination);
      const loz = orbitR * R * Math.sin(labelAngle) * Math.cos(orbitInclination);
      const [lpxo, lpyo, ldepthO] = project(lox, loy, loz, cx, cy, SCALE / R);
      if (ldepthO >= 0) {
        ctx.fillStyle = 'rgba(52,211,153,0.8)';
        ctx.fillText('LEO ~400 km', lpxo + 6, lpyo - 4);
      }
    }

    // Legend bottom-left
    const legendX = 12;
    let legendY = H - 44;
    ctx.font = `9px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'left';
    const legendItems: Array<{ color: string; label: string; dash?: boolean }> = [
      { color: '#fbbf24', label: 'Trajectoire ascension' },
      { color: '#34d399', label: 'Orbite LEO (400 km)' },
    ];
    for (const item of legendItems) {
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      if (item.dash) ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 18, legendY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(203,213,225,0.7)';
      ctx.fillText(item.label, legendX + 22, legendY + 3.5);
      legendY += 14;
    }

  }, [missionTime, phases, totalTime, completed]);

  return (
    <div className="w-full rounded-xl border border-white/8 overflow-hidden bg-slate-950" style={{ height: 300 }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
    </div>
  );
}
