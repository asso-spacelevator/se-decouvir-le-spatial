import { Rocket } from 'lucide-react';

interface StartPageProps {
  onStart: () => void;
}

export function StartPage({ onStart }: StartPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJzdGFycyIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC41Ii8+CiAgICAgIDxjaXJjbGUgY3g9IjE1MCIgY3k9IjgwIiByPSIxLjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjMiLz4KICAgICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTUwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC40Ii8+CiAgICAgIDxjaXJjbGUgY3g9IjMwIiBjeT0iMTIwIiByPSIwLjgiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjYiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz4KPC9zdmc+')]"></div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="mb-8 inline-block">
          <Rocket className="w-24 h-24 text-blue-400 animate-pulse" />
        </div>

        <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
          Journey to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Space</span>
        </h1>

        <p className="text-xl text-gray-300 mb-4 leading-relaxed">
          Discover the European Space Industry
        </p>

        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
          Embark on an interactive journey through the geopolitical, technical, and operational challenges
          of launching rockets into space. From strategy to liftoff.
        </p>

        <button
          onClick={onStart}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
        >
          <span className="relative z-10">Begin Your Journey</span>
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </button>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-3xl font-bold text-blue-400">4</div>
            <div className="text-sm text-gray-400">Sections</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-3xl font-bold text-purple-400">30min</div>
            <div className="text-sm text-gray-400">Duration</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-3xl font-bold text-blue-400">Interactive</div>
            <div className="text-sm text-gray-400">Experience</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="text-3xl font-bold text-purple-400">Free</div>
            <div className="text-sm text-gray-400">Access</div>
          </div>
        </div>
      </div>
    </div>
  );
}
