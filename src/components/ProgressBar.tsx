interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: { name: string; icon: string }[];
  sessionLabel?: string;
}

export function ProgressBar({ currentStep, totalSteps, steps, sessionLabel }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="sticky top-0 left-0 right-0 bg-deepspace/95 backdrop-blur-sm border-b border-white/10 z-50">
      {/* Barre de progression */}
      <div className="h-0.5 bg-white/[0.04]">
        <div
          className="h-full bg-magenta transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center gap-6">
          {/* Label de session */}
          {sessionLabel && (
            <span className="text-xs font-semibold tracking-widest uppercase flex-shrink-0 text-magenta">
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
                        ? 'bg-magenta/25 border-2 border-magenta text-white scale-110 shadow-lg shadow-magenta/20'
                        : index < currentStep
                        ? 'bg-magenta/15 border border-magenta/30 text-magenta'
                        : 'bg-white/5 border border-white/10 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-xs mt-1.5 hidden sm:block transition-all ${
                      index === currentStep
                        ? 'text-white font-semibold'
                        : index < currentStep
                        ? 'text-magenta'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px mx-2 bg-white/10">
                    <div
                      className={`h-full transition-all duration-500 ${
                        index < currentStep
                          ? 'bg-magenta w-full'
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
