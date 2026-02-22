import { Trophy, Rocket, Home } from 'lucide-react';

interface CompletionPageProps {
  onRestart: () => void;
}

export function CompletionPage({ onRestart }: CompletionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJzdGFycyIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC41Ii8+CiAgICAgIDxjaXJjbGUgY3g9IjE1MCIgY3k9IjgwIiByPSIxLjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjMiLz4KICAgICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTUwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC40Ii8+CiAgICAgIDxjaXJjbGUgY3g9IjMwIiBjeT0iMTIwIiByPSIwLjgiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjYiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz4KPC9zdmc+')]"></div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="mb-8 inline-block">
          <Trophy className="w-24 h-24 text-yellow-400 animate-bounce" />
        </div>

        <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
          Journey <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Complete!</span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
          Congratulations on completing your journey through the European space industry.
          You've explored the geopolitical landscape, technical challenges, manufacturing excellence,
          and experienced a rocket launch.
        </p>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">What You've Learned</h3>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-300 mb-2">Geopolitical Importance</h4>
              <p className="text-sm text-gray-400">Space sovereignty and strategic autonomy</p>
            </div>
            <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
              <h4 className="font-semibold text-cyan-300 mb-2">Technical Innovation</h4>
              <p className="text-sm text-gray-400">Engineering challenges and solutions</p>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-300 mb-2">Advanced Manufacturing</h4>
              <p className="text-sm text-gray-400">Complex rocket subsystems</p>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
              <h4 className="font-semibold text-orange-300 mb-2">Launch Operations</h4>
              <p className="text-sm text-gray-400">From countdown to orbit</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onRestart}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return to Start
          </button>
        </div>

        <div className="mt-12 text-gray-400 text-sm">
          <p>Interested in a career in space?</p>
          <p className="mt-2">
            Visit{' '}
            <a href="https://www.esa.int/About_Us/Careers_at_ESA" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              ESA Careers
            </a>
            {' '}to explore opportunities
          </p>
        </div>
      </div>
    </div>
  );
}
