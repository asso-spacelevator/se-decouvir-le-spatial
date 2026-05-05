import { useEffect, useRef } from 'react';

interface Phase {
  id: string;
  tStart: number;
  tEnd: number;
  altitude: number;
  shortLabel: string;
  critical: boolean;
}

interface Props {
  missionTime: number;
  phases: Phase[];
  totalTime: number;
  completed: boolean;
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

  const PAD_L = 54;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 40;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const maxAlt = phases[phases.length - 1].altitude;

  const toCanvas = (nx: number, ny: number) => ({
    cx: PAD_L + nx * plotW,
    cy: PAD_T + (1 - ny) * plotH,
  });

  // ── Background ─────────────────────────────────────────────────────────────
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, W, H);

  // Stars
  const rng = mulberry32(42);
  for (let i = 0; i < 100; i++) {
    const sx = PAD_L + rng() * plotW;
    const sy = PAD_T + rng() * plotH * 0.88;
    const sr = rng() * 0.8 + 0.2;
    const alpha = 0.15 + rng() * 0.55;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.fill();
  }

  // Earth arc at bottom
  const earthCY = PAD_T + plotH + 10;
  const earthR = plotW * 1.5;
  const earthGrad = ctx.createRadialGradient(W / 2, earthCY + earthR - 18, earthR * 0.55, W / 2, earthCY + earthR - 18, earthR);
  earthGrad.addColorStop(0, '#1e40af');
  earthGrad.addColorStop(0.5, '#1d4ed8');
  earthGrad.addColorStop(1, '#1e3a8a');
  ctx.beginPath();
  ctx.arc(W / 2, earthCY + earthR - 18, earthR, 0, Math.PI * 2);
  ctx.fillStyle = earthGrad;
  ctx.fill();

  // Atmosphere glow
  const atmGrad = ctx.createLinearGradient(0, PAD_T + plotH - 28, 0, PAD_T + plotH + 8);
  atmGrad.addColorStop(0, 'rgba(56,189,248,0)');
  atmGrad.addColorStop(0.5, 'rgba(56,189,248,0.08)');
  atmGrad.addColorStop(1, 'rgba(56,189,248,0.2)');
  ctx.fillStyle = atmGrad;
  ctx.fillRect(PAD_L, PAD_T + plotH - 28, plotW, 36);

  // ── Grid ───────────────────────────────────────────────────────────────────
  const altTicks = [0, 50, 100, 150, 200, 250, 300, 350, 400].filter(a => a <= maxAlt + 10);
  ctx.lineWidth = 1;
  for (const a of altTicks) {
    const ny = a / maxAlt;
    const { cy } = toCanvas(0, ny);
    ctx.beginPath();
    ctx.moveTo(PAD_L, cy);
    ctx.lineTo(PAD_L + plotW, cy);
    ctx.strokeStyle = a === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = `10px "SF Mono", ui-monospace, monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`${a} km`, PAD_L - 6, cy + 3.5);
  }

  // ── Phase dividers ─────────────────────────────────────────────────────────
  ctx.setLineDash([3, 4]);
  ctx.lineWidth = 1;
  for (const p of phases) {
    if (p.tStart <= 0) continue;
    const nx = Math.min(p.tStart / totalTime, 1);
    const { cx } = toCanvas(nx, 0);
    ctx.beginPath();
    ctx.moveTo(cx, PAD_T);
    ctx.lineTo(cx, PAD_T + plotH);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // ── Ghost trajectory ───────────────────────────────────────────────────────
  ctx.beginPath();
  let firstGhost = true;
  for (let s = 0; s <= 300; s++) {
    const t = (s / 300) * totalTime;
    const alt = altAt(t, phases);
    const { cx, cy } = toCanvas(t / totalTime, alt / maxAlt);
    firstGhost ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    firstGhost = false;
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── Traveled trajectory ────────────────────────────────────────────────────
  const tNow = Math.max(0, Math.min(missionTime, totalTime));
  if (tNow > 0) {
    ctx.beginPath();
    let first = true;
    const steps = 300;
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * tNow;
      const alt = altAt(t, phases);
      const { cx, cy } = toCanvas(t / totalTime, alt / maxAlt);
      first ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
      first = false;
    }
    const grad = ctx.createLinearGradient(PAD_L, 0, PAD_L + (tNow / totalTime) * plotW, 0);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.45, '#ef4444');
    grad.addColorStop(0.75, '#22d3ee');
    grad.addColorStop(1, '#34d399');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(251,191,36,0.4)';
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ── Phase milestone dots ───────────────────────────────────────────────────
  for (const p of phases) {
    const alt = p.altitude;
    const { cx, cy } = toCanvas(p.tEnd / totalTime, alt / maxAlt);
    const reached = missionTime >= p.tEnd;
    const isNext = !reached && missionTime >= p.tStart;
    ctx.beginPath();
    ctx.arc(cx, cy, reached ? 4 : 3, 0, Math.PI * 2);
    ctx.fillStyle = reached ? '#34d399' : isNext ? '#f59e0b' : 'rgba(255,255,255,0.15)';
    ctx.fill();
    if (reached) {
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(52,211,153,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // ── Rocket dot ─────────────────────────────────────────────────────────────
  if (missionTime > 0 && missionTime < totalTime) {
    const alt = altAt(tNow, phases);
    const { cx, cy } = toCanvas(tNow / totalTime, alt / maxAlt);

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
    glow.addColorStop(0, 'rgba(251,191,36,0.35)');
    glow.addColorStop(1, 'rgba(251,191,36,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    const flameLen = 11 + (Math.sin(Date.now() / 80) * 2);
    const flameGrad = ctx.createLinearGradient(cx, cy, cx, cy + flameLen);
    flameGrad.addColorStop(0, 'rgba(251,191,36,0.9)');
    flameGrad.addColorStop(0.5, 'rgba(239,68,68,0.6)');
    flameGrad.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy + 4);
    ctx.quadraticCurveTo(cx, cy + flameLen, cx + 3, cy + 4);
    ctx.fillStyle = flameGrad;
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(5, 5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  }

  // ── Completion burst ───────────────────────────────────────────────────────
  if (completed) {
    const lastPhase = phases[phases.length - 1];
    const { cx, cy } = toCanvas(1, lastPhase.altitude / maxAlt);
    const burst = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
    burst.addColorStop(0, 'rgba(52,211,153,0.7)');
    burst.addColorStop(1, 'rgba(52,211,153,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = burst;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#34d399';
    ctx.fill();
  }

  // ── X-axis label ───────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(100,116,139,0.65)';
  ctx.font = `10px "SF Mono", ui-monospace, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('Progression de la mission →', PAD_L + plotW / 2, H - 8);
}

export function TrajectoryView({ missionTime, phases, totalTime, completed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ missionTime, phases, totalTime, completed });
  propsRef.current = { missionTime, phases, totalTime, completed };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw(canvas, missionTime, phases, totalTime, completed);
  }, [missionTime, phases, totalTime, completed]);

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
    <div className="w-full rounded-xl border border-white/8 overflow-hidden bg-slate-950" style={{ height: 220 }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
    </div>
  );
}
