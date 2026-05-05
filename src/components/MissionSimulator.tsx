import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, RotateCcw, Radio, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface Phase {
  id: string;
  label: string;
  shortLabel: string;
  tStart: number;  // mission time in seconds
  tEnd: number;
  speedMultiplier: number;  // how fast we advance real time through this phase
  color: string;
  bgColor: string;
  borderColor: string;
  event: string;       // operator callout
  detail: string;      // technical detail shown in log
  altitude: number;    // km at end of phase
  velocity: number;    // m/s at end of phase
  critical: boolean;
}

const PHASES: Phase[] = [
  {
    id: 'ignition',
    label: 'Allumage & Décollage',
    shortLabel: 'Allumage',
    tStart: 0, tEnd: 7,
    speedMultiplier: 1,
    color: 'text-amber-300', bgColor: 'bg-amber-500/15', borderColor: 'border-amber-500/40',
    event: 'ALLUMAGE VULCAIN — T-0. Poussée nominale confirmée. Autorisation décollage.',
    detail: 'Vulcain 2.1 à pleine poussée (137 tf). Boosters P120C allumés simultanément. Poussée totale ~1 000 tf.',
    altitude: 0.1, velocity: 200,
    critical: true,
  },
  {
    id: 'maxq',
    label: 'Max-Q — Pression dynamique max.',
    shortLabel: 'Max-Q',
    tStart: 7, tEnd: 60,
    speedMultiplier: 3,
    color: 'text-red-300', bgColor: 'bg-red-500/15', borderColor: 'border-red-500/40',
    event: 'MAX-Q — Pression dynamique maximale. Guidage en trajectoire réduite.',
    detail: 'Passage de la zone de Max-Q (~45 s). Les moteurs throttlent légèrement pour protéger la structure.',
    altitude: 12, velocity: 1350,
    critical: true,
  },
  {
    id: 'booster_sep',
    label: 'Séparation Boosters P120C',
    shortLabel: 'Sep. Boosters',
    tStart: 60, tEnd: 135,
    speedMultiplier: 4,
    color: 'text-orange-300', bgColor: 'bg-orange-500/15', borderColor: 'border-orange-500/40',
    event: 'SÉPARATION BOOSTERS — T+130 s. P120C larguées à 75 km. Phase EPC seul.',
    detail: 'Les boosters se séparent à ~75 km. L\'EPC et Vulcain 2.1 poursuivent seuls vers l\'espace.',
    altitude: 75, velocity: 2800,
    critical: true,
  },
  {
    id: 'fairing_sep',
    label: 'Largage de la Coiffe',
    shortLabel: 'Largage coiffe',
    tStart: 135, tEnd: 220,
    speedMultiplier: 5,
    color: 'text-blue-300', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/40',
    event: 'LARGAGE COIFFE — T+215 s. Pression dynamique nulle. Satellite exposé.',
    detail: 'Séparation pyrotechnique de la coiffe à ~110 km. Le satellite est maintenant exposé au vide spatial.',
    altitude: 110, velocity: 4100,
    critical: false,
  },
  {
    id: 'epc_cutoff',
    label: 'Coupure EPC — Séparation étage 1',
    shortLabel: 'Coupure EPC',
    tStart: 220, tEnd: 490,
    speedMultiplier: 8,
    color: 'text-cyan-300', bgColor: 'bg-cyan-500/15', borderColor: 'border-cyan-500/40',
    event: 'COUPURE EPC — T+475 s. Étage principal séparé. Allumage ULPM / Vinci.',
    detail: 'EPC épuisé après ~470 s. L\'étage supérieur ULPM et son moteur Vinci prennent le relais pour la mise sur orbite.',
    altitude: 200, velocity: 6900,
    critical: true,
  },
  {
    id: 'orbit_insert',
    label: 'Injection sur orbite de transfert',
    shortLabel: 'Injection orbitale',
    tStart: 490, tEnd: 1500,
    speedMultiplier: 15,
    color: 'text-emerald-300', bgColor: 'bg-emerald-500/15', borderColor: 'border-emerald-500/40',
    event: 'ORBITE GTO CONFIRMÉE — Vinci en phase de mise à feu. Correction de trajectoire nominale.',
    detail: 'Le moteur Vinci (rallumable) effectue des corrections précises. L\'étage supérieur guide le satellite vers l\'orbite de transfert géostationnaire (GTO).',
    altitude: 500, velocity: 9700,
    critical: false,
  },
  {
    id: 'payload_sep',
    label: 'Séparation Charge Utile',
    shortLabel: 'Sep. Satellite',
    tStart: 1500, tEnd: 1560,
    speedMultiplier: 1,
    color: 'text-green-300', bgColor: 'bg-green-500/15', borderColor: 'border-green-500/40',
    event: 'SÉPARATION CONFIRMÉE — Satellite opérationnel. Mission accomplie.',
    detail: 'Le satellite se sépare de l\'adaptateur et déploie ses panneaux solaires. Acquisition du signal télémétrie confirmée.',
    altitude: 600, velocity: 10200,
    critical: false,
  },
];

const TOTAL_MISSION_TIME = PHASES[PHASES.length - 1].tEnd;

function formatMT(s: number): string {
  const abs = Math.abs(s);
  const m = Math.floor(abs / 60);
  const sec = Math.floor(abs % 60);
  const sign = s < 0 ? '-' : '+';
  return `T${sign}${m > 0 ? `${m}min ` : ''}${String(sec).padStart(2, '0')}s`;
}

function altitudeAt(t: number): number {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (t >= PHASES[i].tStart) {
      const p = PHASES[i];
      const next = PHASES[i + 1];
      const prevAlt = i > 0 ? PHASES[i - 1].altitude : 0;
      const frac = (t - p.tStart) / (p.tEnd - p.tStart);
      return Math.round(prevAlt + (p.altitude - prevAlt) * Math.min(frac, 1));
    }
  }
  return 0;
}

function velocityAt(t: number): number {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (t >= PHASES[i].tStart) {
      const p = PHASES[i];
      const prevV = i > 0 ? PHASES[i - 1].velocity : 0;
      const frac = (t - p.tStart) / (p.tEnd - p.tStart);
      return Math.round(prevV + (p.velocity - prevV) * Math.min(frac, 1));
    }
  }
  return 0;
}

function currentPhaseIndex(t: number): number {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (t >= PHASES[i].tStart) return i;
  }
  return 0;
}

interface LogEntry { time: number; text: string; critical: boolean }

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
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const tick = useCallback((now: number) => {
    if (lastRealRef.current === 0) { lastRealRef.current = now; }
    const realDelta = (now - lastRealRef.current) / 1000;
    lastRealRef.current = now;

    setMissionTime(prev => {
      const phIdx = currentPhaseIndex(Math.max(prev, 0));
      const phase = PHASES[phIdx];
      const speed = prev < 0 ? 1 : (phase?.speedMultiplier ?? 1);
      const next = prev + realDelta * speed;

      const prevPhIdx = currentPhaseIndex(Math.max(prev, 0));
      const nextPhIdx = currentPhaseIndex(Math.max(next, 0));
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

  const phIdx = currentPhaseIndex(Math.max(missionTime, 0));
  const phase = missionTime >= 0 ? PHASES[phIdx] : null;
  const progress = Math.max(0, Math.min(1, missionTime / TOTAL_MISSION_TIME));
  const alt = missionTime >= 0 ? altitudeAt(missionTime) : 0;
  const vel = missionTime >= 0 ? velocityAt(missionTime) : 0;

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

      <div className="p-5 grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: telemetry + progress */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Mission clock + telemetry */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Temps mission</p>
              <p className="font-mono text-lg font-bold text-white">{formatMT(Math.round(missionTime))}</p>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Altitude</p>
              <p className="font-mono text-lg font-bold text-sky-300">{alt.toLocaleString('fr-FR')} km</p>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Vitesse</p>
              <p className="font-mono text-lg font-bold text-orange-300">{vel.toLocaleString('fr-FR')} m/s</p>
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
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress * 100}%`,
                  background: completed
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                }}
              />
            </div>
            {/* Phase markers */}
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
            phase
              ? `${phase.bgColor} ${phase.borderColor}`
              : 'bg-white/5 border-white/10'
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
              const done = missionTime >= p.tEnd;
              const active = phIdx === i && missionTime >= 0;
              return (
                <div key={p.id}
                  className={`rounded-lg border px-2.5 py-2 transition-all ${
                    done
                      ? 'bg-white/5 border-white/10 opacity-60'
                      : active
                      ? `${p.bgColor} ${p.borderColor}`
                      : 'bg-white/3 border-white/5 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {done
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      : active
                      ? <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: p.color.replace('text-', '').includes('-') ? undefined : undefined, background: 'currentColor' }} />
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
            style={{ minHeight: 260, maxHeight: 340 }}
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
                <span className="font-bold">MISSION RÉUSSIE — Satellite en orbite.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
