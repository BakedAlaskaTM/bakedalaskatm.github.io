import React from 'react';

export default function Header({ activeTab, setActiveTab, progress }) {
  return (
    <header className="w-11/12 max-w-6xl mx-auto mt-8 mb-6 p-6 shadow-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl">
      <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 drop-shadow-md">
        Dziwnystan Hunt Stats
      </h1>
      <nav className="flex items-center justify-between py-3 px-4 border border-slate-700/50 bg-slate-900/50 rounded-lg shadow-inner">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-5 py-2 rounded-md font-medium text-sm transition-all shadow-sm ${
              activeTab === 'home'
                ? 'text-white bg-blue-600 hover:bg-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-5 py-2 rounded-md font-medium text-sm transition-all shadow-sm ${
              activeTab === 'stats'
                ? 'text-white bg-blue-600 hover:bg-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            Stats
          </button>
        </div>
      </nav>
      
      {activeTab === 'home' && progress && (
        <div className="mt-8 px-4">
          <div className="flex justify-between mb-2 text-sm font-semibold text-slate-300">
            <span>World Records Progress</span>
            <span className="tabular-nums text-blue-400">
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full h-4 bg-slate-950/80 rounded-full overflow-hidden shadow-inner border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out relative"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            >
                <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
