interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: { name: string; icon: string }[];
  sessionLabel?: string;
}

export function ProgressBar({ currentStep, totalSteps, steps, sessionLabel }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isSession2 = sessionLabel === 'Session 2 / 2';

  return (
    <div className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/60 z-50">
      {/* Barre de progression */}
      <div className="h-0.5 bg-slate-800">
        <div
          className={`h-full transition-all duration-500 ${
            isSession2
              ? 'bg-gradient-to-r from-teal-400 via-sky-500 to-blue-500'
              : 'bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center gap-6">
          {/* Label de session */}
          {sessionLabel && (
            <span className={`text-xs font-semibold tracking-widest uppercase flex-shrink-0 ${
              isSession2 ? 'text-teal-400' : 'text-amber-400'
            }`}>
              {sessionLabel}
            </span>
          )}

          {/* Steps */}
          <div className="flex items-center flex-1">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all duration-300 ${
                      index === currentStep
                        ? isSession2
                          ? 'bg-teal-500/25 border-2 border-teal-400 text-teal-200 scale-110 shadow-lg shadow-teal-500/20'
                          : 'bg-amber-500/25 border-2 border-amber-400 text-amber-200 scale-110 shadow-lg shadow-amber-500/20'
                        : index < currentStep
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                        : 'bg-slate-800 border border-slate-700 text-slate-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-xs mt-1.5 hidden sm:block transition-all ${
                      index === currentStep
                        ? 'text-white font-semibold'
                        : index < currentStep
                        ? 'text-green-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px mx-2 bg-slate-700/60">
                    <div
                      className={`h-full transition-all duration-500 ${
                        index < currentStep
                          ? 'bg-green-500 w-full'
                          : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
