import { useEffect, useRef } from 'react';

interface Phase {
  id: string;
  shortLabel: string;
  tStart: number;
  tEnd: number;
  altitude: number;
  color: string;
  critical: boolean;
}

interface Props {
  missionTime: number;
  phases: Phase[];
  totalTime: number;
  completed: boolean;
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

    const PAD_L = 52;
    const PAD_R = 20;
    const PAD_T = 20;
    const PAD_B = 44;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    const toCanvas = (nx: number, ny: number) => ({
      cx: PAD_L + nx * plotW,
      cy: PAD_T + (1 - ny) * plotH,
    });

    // ── Background ──────────────────────────────────────────────────────────
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, H);

    // Stars
    const rng = mulberry32(42);
    for (let i = 0; i < 120; i++) {
      const sx = PAD_L + rng() * plotW;
      const sy = PAD_T + rng() * plotH * 0.85;
      const sr = rng() * 0.9 + 0.3;
      const alpha = 0.2 + rng() * 0.6;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }

    // Earth arc at bottom
    const earthY = PAD_T + plotH + 12;
    const earthRadius = plotW * 1.4;
    const earthGrad = ctx.createRadialGradient(W / 2, earthY + earthRadius - 20, earthRadius * 0.6, W / 2, earthY + earthRadius - 20, earthRadius);
    earthGrad.addColorStop(0, '#1e40af');
    earthGrad.addColorStop(0.5, '#1d4ed8');
    earthGrad.addColorStop(1, '#1e3a8a');
    ctx.beginPath();
    ctx.arc(W / 2, earthY + earthRadius - 20, earthRadius, 0, Math.PI * 2);
    ctx.fillStyle = earthGrad;
    ctx.fill();

    // Atmosphere glow
    const atmGrad = ctx.createLinearGradient(0, PAD_T + plotH - 30, 0, PAD_T + plotH + 10);
    atmGrad.addColorStop(0, 'rgba(56,189,248,0)');
    atmGrad.addColorStop(0.5, 'rgba(56,189,248,0.08)');
    atmGrad.addColorStop(1, 'rgba(56,189,248,0.18)');
    ctx.fillStyle = atmGrad;
    ctx.fillRect(PAD_L, PAD_T + plotH - 30, plotW, 40);

    // ── Grid ────────────────────────────────────────────────────────────────
    const maxAlt = phases[phases.length - 1].altitude;
    const altTicks = [0, 100, 200, 300, 400, 500, 600].filter(a => a <= maxAlt);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (const a of altTicks) {
      const ny = a / maxAlt;
      const { cy } = toCanvas(0, ny);
      ctx.beginPath();
      ctx.moveTo(PAD_L, cy);
      ctx.lineTo(PAD_L + plotW, cy);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148,163,184,0.55)';
      ctx.font = `10px "SF Mono", ui-monospace, monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`${a} km`, PAD_L - 6, cy + 3.5);
    }

    // ── Phase event markers (vertical dashed lines) ──────────────────────
    for (const p of phases) {
      if (p.tStart <= 0) continue;
      const nx = Math.min(p.tStart / totalTime, 1);
      const { cx } = toCanvas(nx, 0);
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, PAD_T);
      ctx.lineTo(cx, PAD_T + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── Full trajectory (ghost path) ────────────────────────────────────────
    ctx.beginPath();
    for (let step = 0; step <= 200; step++) {
      const t = (step / 200) * totalTime;
      const { x, y } = trajectoryPoint(t, phases, totalTime);
      const { cx, cy } = toCanvas(x, y);
      step === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── Traveled trajectory (colored, solid) ─────────────────────────────
    const tNow = Math.max(0, Math.min(missionTime, totalTime));
    if (tNow > 0) {
      const steps = 200;
      const grad = ctx.createLinearGradient(PAD_L, 0, PAD_L + plotW, 0);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.4, '#ef4444');
      grad.addColorStop(0.7, '#22d3ee');
      grad.addColorStop(1, '#34d399');

      ctx.beginPath();
      for (let step = 0; step <= steps; step++) {
        const t = (step / steps) * tNow;
        const { x, y } = trajectoryPoint(t, phases, totalTime);
        const { cx, cy } = toCanvas(x, y);
        step === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#f59e0b44';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // ── Phase milestone dots ──────────────────────────────────────────────
    for (const p of phases) {
      const { x, y } = trajectoryPoint(p.tEnd, phases, totalTime);
      const { cx, cy } = toCanvas(x, y);
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

    // ── Rocket ───────────────────────────────────────────────────────────
    if (missionTime >= 0 && missionTime < totalTime) {
      const { x, y } = trajectoryPoint(tNow, phases, totalTime);
      const { cx, cy } = toCanvas(x, y);

      // Glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
      glow.addColorStop(0, 'rgba(251,191,36,0.35)');
      glow.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Exhaust flame
      const flameLen = 12 + Math.random() * 4;
      const flameGrad = ctx.createLinearGradient(cx, cy, cx, cy + flameLen);
      flameGrad.addColorStop(0, 'rgba(251,191,36,0.9)');
      flameGrad.addColorStop(0.5, 'rgba(239,68,68,0.6)');
      flameGrad.addColorStop(1, 'rgba(239,68,68,0)');
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy + 5);
      ctx.quadraticCurveTo(cx, cy + flameLen, cx + 3, cy + 5);
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // Rocket body (triangle pointing up)
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

    // ── Completion star burst ─────────────────────────────────────────────
    if (completed) {
      const { x, y } = trajectoryPoint(totalTime, phases, totalTime);
      const { cx, cy } = toCanvas(x, y);
      const burst = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
      burst.addColorStop(0, 'rgba(52,211,153,0.7)');
      burst.addColorStop(1, 'rgba(52,211,153,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fillStyle = burst;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();
    }

    // ── X-axis label ─────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(100,116,139,0.7)';
    ctx.font = `10px "SF Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('Progression de la mission →', PAD_L + plotW / 2, H - 8);

  }, [missionTime, phases, totalTime, completed]);

  return (
    <div className="w-full rounded-xl border border-white/8 overflow-hidden bg-slate-950" style={{ height: 220 }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
    </div>
  );
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function trajectoryPoint(t: number, phases: Phase[], totalTime: number): { x: number; y: number } {
  const maxAlt = phases[phases.length - 1].altitude;
  let alt = 0;
  for (let i = phases.length - 1; i >= 0; i--) {
    if (t >= phases[i].tStart) {
      const p = phases[i];
      const prevAlt = i > 0 ? phases[i - 1].altitude : 0;
      const frac = Math.min((t - p.tStart) / (p.tEnd - p.tStart), 1);
      alt = prevAlt + (p.altitude - prevAlt) * (1 - Math.pow(1 - frac, 2));
      break;
    }
  }
  const x = Math.min(t / totalTime, 1);
  const y = alt / maxAlt;
  return { x, y };
}
