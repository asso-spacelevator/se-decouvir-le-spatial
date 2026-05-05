import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, RotateCcw, Radio, AlertTriangle, CheckCircle2, Zap, Thermometer, Activity, Fuel } from 'lucide-react';
import { TrajectoryView } from './TrajectoryView';

interface Phase {
  id: string;
  label: string;
  shortLabel: string;
  tStart: number;
  tEnd: number;
  speedMultiplier: number;
  color: string;
  bgColor: string;
  borderColor: string;
  event: string;
  detail: string;
  altitude: number;    // km at end of phase
  velocity: number;    // m/s at end of phase
  critical: boolean;
  // Telemetry at end of phase
  tempEngine: number;  // °C
  vibration: number;   // g (rms)
  fuelPct: number;     // % remaining (combined propellant mass)
}

// Real Ariane 6 VA262 timeline (mission seconds from T+0)
// T+0 = décollage, boosters sep T+219s, largage coiffe T+272s,
// coupure Vulcain T+535s, sep étages T+540s, allumage HM7B/Vinci T+545s,
// orbite transfert T+1110s (~T+18:30), rallumage Vinci T+4495s (~T+1h14:55),
// déploiement satellites T+5395s (~T+1h29:55)
const PHASES: Phase[] = [
  {
    id: 'ignition',
    label: 'Allumage & Décollage',
    shortLabel: 'Allumage',
    tStart: 0, tEnd: 7,
    speedMultiplier: 1,
    color: 'text-amber-300', bgColor: 'bg-amber-500/15', borderColor: 'border-amber-500/40',
    event: 'ALLUMAGE VULCAIN — T+0. Poussée nominale confirmée. Autorisation décollage.',
    detail: 'Vulcain 2.1 à pleine poussée (137 tf). Boosters P120C allumés simultanément. Poussée totale ~1 000 tf.',
    altitude: 0.05, velocity: 0,
    critical: true,
    tempEngine: 3200, vibration: 8.5, fuelPct: 100,
  },
  {
    id: 'maxq',
    label: 'Max-Q — Contraintes aérodynamiques max.',
    shortLabel: 'Max-Q',
    tStart: 7, tEnd: 50,
    speedMultiplier: 3,
    color: 'text-red-300', bgColor: 'bg-red-500/15', borderColor: 'border-red-500/40',
    event: 'MAX-Q — Pression aérodynamique maximale (~T+45 s). Les moteurs réduisent légèrement leur poussée.',
    detail: 'C\'est le moment le plus critique pour la structure : la fusée va vite mais l\'air est encore dense. La pression exercée sur la coque atteint son maximum. Les moteurs réduisent brièvement leur poussée pour ne pas dépasser les limites structurelles.',
    altitude: 15, velocity: 1400,
    critical: true,
    tempEngine: 3300, vibration: 12.0, fuelPct: 82,
  },
  {
    id: 'booster_sep',
    label: 'Séparation Boosters P120C',
    shortLabel: 'Sep. Boosters',
    tStart: 50, tEnd: 219,
    speedMultiplier: 5,
    color: 'text-orange-300', bgColor: 'bg-orange-500/15', borderColor: 'border-orange-500/40',
    event: 'SÉPARATION BOOSTERS — T+3:39. P120C larguées à ~75 km. Étage central seul.',
    detail: 'Les deux boosters à propergol solide ont épuisé leur carburant et se détachent à 75 km d\'altitude. Leur rôle était d\'apporter la poussée supplémentaire nécessaire au décollage. L\'étage central (EPC) et son moteur Vulcain 2.1 continuent seuls.',
    altitude: 75, velocity: 2600,
    critical: true,
    tempEngine: 3250, vibration: 6.0, fuelPct: 55,
  },
  {
    id: 'fairing_sep',
    label: 'Largage de la Coiffe',
    shortLabel: 'Largage coiffe',
    tStart: 219, tEnd: 272,
    speedMultiplier: 5,
    color: 'text-blue-300', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/40',
    event: 'LARGAGE COIFFE — T+4:32. Plus de frottements atmosphériques. Satellite exposé.',
    detail: 'La coiffe (nez de la fusée) protégeait le satellite pendant la traversée de l\'atmosphère. Au-delà de 100 km il n\'y a plus d\'air — elle est éjectée par charges pyrotechniques pour alléger la fusée.',
    altitude: 112, velocity: 3500,
    critical: false,
    tempEngine: 3200, vibration: 4.5, fuelPct: 42,
  },
  {
    id: 'epc_cutoff',
    label: 'Coupure Vulcain — Séparation EPC',
    shortLabel: 'Coupure Vulcain',
    tStart: 272, tEnd: 545,
    speedMultiplier: 8,
    color: 'text-cyan-300', bgColor: 'bg-cyan-500/15', borderColor: 'border-cyan-500/40',
    event: 'COUPURE VULCAIN — T+8:55. Séparation EPC T+9:00. Allumage 2e étage T+9:05.',
    detail: 'L\'étage central (EPC) a épuisé ses 170 tonnes de propergol cryogénique. Vulcain 2.1 s\'éteint, l\'EPC se détache 5 secondes plus tard. Le 2e étage (ULPM) allume aussitôt son moteur Vinci pour finaliser la mise en orbite.',
    altitude: 190, velocity: 6400,
    critical: true,
    tempEngine: 200, vibration: 1.2, fuelPct: 72, // étage supérieur plein, EPC vide
  },
  {
    id: 'upper_burn',
    label: 'Orbite de transfert elliptique — Vinci',
    shortLabel: 'Orbite transfert',
    tStart: 545, tEnd: 1110,
    speedMultiplier: 15,
    color: 'text-emerald-300', bgColor: 'bg-emerald-500/15', borderColor: 'border-emerald-500/40',
    event: 'ORBITE DE TRANSFERT — T+18:30. Vinci place l\'étage sur une ellipse périgée ~200 km / apogée 400 km.',
    detail: 'Le premier allumage Vinci établit une orbite de transfert elliptique : le périgée (point bas) est à environ 200 km, l\'apogée (point haut) à 400 km. L\'étage n\'est pas encore en orbite circulaire finale — il faudra un deuxième allumage à l\'apogée.',
    altitude: 200, velocity: 7800,
    critical: false,
    tempEngine: 2950, vibration: 2.1, fuelPct: 45,
  },
  {
    id: 'coast',
    label: 'Phase balistique — Dérive orbitale',
    shortLabel: 'Dérive',
    tStart: 1110, tEnd: 4495,
    speedMultiplier: 60,
    color: 'text-slate-300', bgColor: 'bg-slate-500/15', borderColor: 'border-slate-500/40',
    event: 'PHASE BALISTIQUE — Moteur éteint. L\'étage dérive sur l\'orbite elliptique vers l\'apogée à 400 km (~56 min).',
    detail: 'Vinci s\'est éteint. L\'étage monte librement vers l\'apogée de l\'ellipse à 400 km — là où il sera le plus lent, et où le deuxième allumage sera le plus efficace pour circulariser. Les systèmes passent en veille thermique : -180 °C à l\'ombre, +120 °C face au Soleil.',
    altitude: 400, velocity: 7570,
    critical: false,
    tempEngine: -180, vibration: 0.0, fuelPct: 45,
  },
  {
    id: 'relight',
    label: 'Rallumage Vinci — Circularisation à 400 km',
    shortLabel: 'Rallumage Vinci',
    tStart: 4495, tEnd: 4513,
    speedMultiplier: 2,
    color: 'text-sky-300', bgColor: 'bg-sky-500/15', borderColor: 'border-sky-500/40',
    event: 'RALLUMAGE VINCI — T+1h14:55. Manœuvre d\'apogée : circularisation à 400 km. Durée ~18 s.',
    detail: 'Deuxième allumage du moteur Vinci, très court : environ 18 secondes. C\'est la manœuvre de Hohmann à l\'apogée — une courte impulsion suffit pour transformer l\'ellipse en orbite circulaire à 400 km. C\'est la dernière impulsion propulsive de la mission.',
    altitude: 400, velocity: 7669,
    critical: true,
    tempEngine: 2950, vibration: 2.0, fuelPct: 8,
  },
  {
    id: 'payload_sep',
    label: 'Séparation & Déploiement Satellites',
    shortLabel: 'Déploiement',
    tStart: 4513, tEnd: 5395,
    speedMultiplier: 10,
    color: 'text-green-300', bgColor: 'bg-green-500/15', borderColor: 'border-green-500/40',
    event: 'SÉPARATION CONFIRMÉE — T+1h29:55. Satellites en orbite circulaire à 400 km. Signal télémétrie acquis.',
    detail: 'Les satellites se séparent de l\'adaptateur et déploient leurs panneaux solaires. Ils sont en orbite circulaire à 400 km — leur orbite opérationnelle définitive. Le centre de contrôle acquiert leur signal de télémétrie : mission accomplie.',
    altitude: 400, velocity: 7669,
    critical: false,
    tempEngine: 20, vibration: 0.3, fuelPct: 5,
  },
];

const TOTAL_MISSION_TIME = PHASES[PHASES.length - 1].tEnd;

function formatMT(s: number): string {
  const abs = Math.abs(s);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const sec = Math.floor(abs % 60);
  const sign = s < 0 ? '-' : '+';
  if (h > 0) return `T${sign}${h}h${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `T${sign}${m > 0 ? `${m}min ` : ''}${String(sec).padStart(2, '0')}s`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

function phaseIndexAt(t: number): number {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (t >= PHASES[i].tStart) return i;
  }
  return 0;
}

function altitudeAt(t: number): number {
  const i = phaseIndexAt(Math.max(t, 0));
  const p = PHASES[i];
  const prevAlt = i > 0 ? PHASES[i - 1].altitude : 0;
  const frac = (t - p.tStart) / (p.tEnd - p.tStart);
  return Math.round(lerp(prevAlt, p.altitude, frac));
}

function velocityAt(t: number): number {
  const i = phaseIndexAt(Math.max(t, 0));
  const p = PHASES[i];
  const prevV = i > 0 ? PHASES[i - 1].velocity : 0;
  const frac = (t - p.tStart) / (p.tEnd - p.tStart);
  return Math.round(lerp(prevV, p.velocity, frac));
}

function tempAt(t: number): number {
  const i = phaseIndexAt(Math.max(t, 0));
  const p = PHASES[i];
  const prev = i > 0 ? PHASES[i - 1].tempEngine : 20;
  const frac = (t - p.tStart) / (p.tEnd - p.tStart);
  return Math.round(lerp(prev, p.tempEngine, frac));
}

function vibrationAt(t: number): number {
  const i = phaseIndexAt(Math.max(t, 0));
  const p = PHASES[i];
  const prev = i > 0 ? PHASES[i - 1].vibration : 0;
  const frac = (t - p.tStart) / (p.tEnd - p.tStart);
  return +lerp(prev, p.vibration, frac).toFixed(1);
}

function fuelAt(t: number): number {
  const i = phaseIndexAt(Math.max(t, 0));
  const p = PHASES[i];
  const prev = i > 0 ? PHASES[i - 1].fuelPct : 100;
  const frac = (t - p.tStart) / (p.tEnd - p.tStart);
  return Math.round(lerp(prev, p.fuelPct, frac));
}

interface LogEntry { time: number; text: string; critical: boolean }

function GaugeBar({ value, max, color, label, unit, icon: Icon }: {
  value: number; max: number; color: string; label: string; unit: string;
  icon: React.ElementType;
}) {
  const pct = Math.min(Math.max(value / max, 0), 1) * 100;
  return (
    <div className="bg-white/5 border border-white/8 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        </div>
        <span className={`font-mono text-sm font-bold ${color}`}>
          {value.toLocaleString('fr-FR')}{unit}
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: 'currentColor' }}
        />
      </div>
    </div>
  );
}

export function MissionSimulator() {
  const [running, setRunning] = useState(false);
  const [missionTime, setMissionTime] = useState(-10);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [completed, setCompleted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRealRef = useRef<number>(0);
  const logRef = useRef<HTMLDivElement>(null);
  const seenPhasesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const tick = useCallback((now: number) => {
    if (lastRealRef.current === 0) { lastRealRef.current = now; }
    const realDelta = (now - lastRealRef.current) / 1000;
    lastRealRef.current = now;

    setMissionTime(prev => {
      const phIdx = phaseIndexAt(Math.max(prev, 0));
      const phase = PHASES[phIdx];
      const speed = prev < 0 ? 1 : (phase?.speedMultiplier ?? 1);
      const next = prev + realDelta * speed;

      const prevPhIdx = phaseIndexAt(Math.max(prev, 0));
      const nextPhIdx = phaseIndexAt(Math.max(next, 0));
      if ((next >= 0 && nextPhIdx !== prevPhIdx) || (prev < 0 && next >= 0)) {
        const entered = PHASES[nextPhIdx];
        if (entered && !seenPhasesRef.current.has(entered.id)) {
          seenPhasesRef.current.add(entered.id);
          setLog(l => [...l, { time: Math.round(next), text: entered.event, critical: entered.critical }]);
        }
      }

      if (next >= TOTAL_MISSION_TIME) {
        setRunning(false);
        setCompleted(true);
        return TOTAL_MISSION_TIME;
      }
      return next;
    });

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) {
      lastRealRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, tick]);

  const handleStart = () => {
    if (completed) return;
    setRunning(true);
    if (missionTime <= -10) {
      setLog([{ time: -10, text: 'Séquence de démarrage initialisée. Vérification systèmes en cours…', critical: false }]);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setMissionTime(-10);
    setLog([]);
    seenPhasesRef.current = new Set();
    setCompleted(false);
  };

  const phIdx = phaseIndexAt(Math.max(missionTime, 0));
  const phase = missionTime >= 0 ? PHASES[phIdx] : null;
  const progress = Math.max(0, Math.min(1, missionTime / TOTAL_MISSION_TIME));
  const alt  = missionTime >= 0 ? altitudeAt(missionTime) : 0;
  const vel  = missionTime >= 0 ? velocityAt(missionTime) : 0;
  const temp = missionTime >= 0 ? tempAt(missionTime) : 20;
  const vib  = missionTime >= 0 ? vibrationAt(missionTime) : 0;
  const fuel = missionTime >= 0 ? fuelAt(missionTime) : 100;

  const tempColor = temp > 2000 ? 'text-red-400' : temp > 500 ? 'text-orange-400' : temp < 0 ? 'text-sky-400' : 'text-gray-300';
  const vibColor  = vib > 8 ? 'text-red-400' : vib > 4 ? 'text-orange-400' : 'text-emerald-400';
  const fuelColor = fuel < 15 ? 'text-red-400' : fuel < 35 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-white/8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Simulateur de Mission</h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">
              {running ? 'EN VOL' : completed ? 'MISSION ACCOMPLIE' : 'EN ATTENTE'}
            </span>
          </div>
          <p className="text-xs text-gray-500">Visualisez les phases clés d'un lancement Ariane 6 — comme un opérateur au centre de contrôle.</p>
        </div>
        <div className="flex items-center gap-2">
          {!completed && (
            <button
              onClick={running ? () => setRunning(false) : handleStart}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                running
                  ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {running ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {running ? 'Pause' : missionTime <= -10 ? 'Lancer' : 'Reprendre'}
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <TrajectoryView missionTime={missionTime} phases={PHASES} totalTime={TOTAL_MISSION_TIME} completed={completed} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: telemetry + progress */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Mission clock + altitude + velocity */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Temps mission</p>
                <p className="font-mono text-base font-bold text-white">{formatMT(Math.round(missionTime))}</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Altitude</p>
                <p className="font-mono text-base font-bold text-sky-300">{alt.toLocaleString('fr-FR')} km</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Vitesse</p>
                <p className="font-mono text-base font-bold text-orange-300">{vel.toLocaleString('fr-FR')} m/s</p>
              </div>
            </div>

            {/* Temperature / Vibration / Fuel */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className={`w-3.5 h-3.5 ${tempColor}`} />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Temp. moteur</span>
                  </div>
                </div>
                <p className={`font-mono text-base font-bold ${tempColor}`}>
                  {temp.toLocaleString('fr-FR')} °C
                </p>
                <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      temp > 2000 ? 'bg-red-400' : temp > 500 ? 'bg-orange-400' : temp < 0 ? 'bg-sky-400' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(Math.abs(temp) / 3500 * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className={`w-3.5 h-3.5 ${vibColor}`} />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Vibrations</span>
                  </div>
                </div>
                <p className={`font-mono text-base font-bold ${vibColor}`}>{vib.toLocaleString('fr-FR')} g</p>
                <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      vib > 8 ? 'bg-red-400' : vib > 4 ? 'bg-orange-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(vib / 14 * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Fuel className={`w-3.5 h-3.5 ${fuelColor}`} />
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Carburant</span>
                  </div>
                </div>
                <p className={`font-mono text-base font-bold ${fuelColor}`}>{fuel} %</p>
                <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      fuel < 15 ? 'bg-red-400' : fuel < 35 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${fuel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Progression de la mission</span>
                <span className="text-xs font-mono text-gray-400">{Math.round(progress * 100)} %</span>
              </div>
              <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${progress * 100}%`,
                    background: completed
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                  }}
                />
              </div>
              <div className="relative h-1 mt-1">
                {PHASES.map(p => (
                  <div key={p.id}
                    className="absolute top-0 w-px h-full bg-white/20"
                    style={{ left: `${(p.tStart / TOTAL_MISSION_TIME) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Current phase card */}
            <div className={`rounded-xl border p-4 transition-all ${
              phase ? `${phase.bgColor} ${phase.borderColor}` : 'bg-white/5 border-white/10'
            }`}>
              {phase ? (
                <>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {phase.critical
                        ? <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${phase.color}`} />
                        : <Zap className={`w-4 h-4 flex-shrink-0 ${phase.color}`} />
                      }
                      <span className={`text-sm font-bold ${phase.color}`}>{phase.label}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-500 flex-shrink-0">
                      ×{phase.speedMultiplier} vitesse
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{phase.detail}</p>
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <Radio className="w-4 h-4" />
                  <span className="text-sm">
                    {missionTime <= -10
                      ? 'Préparation au lancement. Appuyez sur "Lancer" pour démarrer la séquence.'
                      : `Compte à rebours : ${Math.abs(Math.round(missionTime))} s`}
                  </span>
                </div>
              )}
            </div>

            {/* Phase list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1.5">
              {PHASES.map((p, i) => {
                const done   = missionTime >= p.tEnd;
                const active = phIdx === i && missionTime >= 0;
                return (
                  <div key={p.id}
                    className={`rounded-lg border px-2.5 py-2 transition-all ${
                      done   ? 'bg-white/5 border-white/10 opacity-60'
                      : active ? `${p.bgColor} ${p.borderColor}`
                      : 'bg-white/3 border-white/5 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {done
                        ? <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        : active
                        ? <span className="w-2 h-2 rounded-full bg-current animate-pulse flex-shrink-0" />
                        : <span className="w-2 h-2 rounded-full bg-gray-700 flex-shrink-0" />
                      }
                      <span className={`text-xs font-medium truncate ${active ? p.color : done ? 'text-gray-400' : 'text-gray-600'}`}>
                        {p.shortLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: mission log */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Journal de mission</p>
            </div>
            <div
              ref={logRef}
              className="flex-1 bg-black/40 border border-white/8 rounded-xl p-3 overflow-y-auto font-mono text-xs space-y-2"
              style={{ minHeight: 280, maxHeight: 380 }}
            >
              {log.length === 0 ? (
                <p className="text-gray-600 italic">En attente de démarrage…</p>
              ) : (
                log.map((entry, i) => (
                  <div key={i} className={`flex gap-2 ${entry.critical ? 'text-amber-300' : 'text-emerald-400'}`}>
                    <span className="text-gray-600 flex-shrink-0">{formatMT(entry.time)}</span>
                    <span className="leading-relaxed">{entry.text}</span>
                  </div>
                ))
              )}
              {completed && (
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-bold">MISSION RÉUSSIE — Satellites en orbite.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

