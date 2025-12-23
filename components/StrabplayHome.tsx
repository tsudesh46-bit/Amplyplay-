
import React from 'react';
import { Page, CompletedLevels } from '../types';
import { LogoIcon, MenuIcon, PlayIcon, StarIcon } from './ui/Icons';

interface StrabplayHomeProps {
  setCurrentPage: (page: Page) => void;
  completedLevels: CompletedLevels;
}

const StrabplayHome: React.FC<StrabplayHomeProps> = ({ setCurrentPage, completedLevels }) => {
  const categories = [
    {
      title: "Common",
      levels: [
        { id: 1, name: "Level 01", sub: "Basic Fusion" },
        { id: 2, name: "Level 02", sub: "Contrast Sensitivity" }
      ]
    },
    {
      title: "For Children",
      levels: [
        { id: 3, name: "Level 03", sub: "Tracking Objects" },
        { id: 4, name: "Level 04", sub: "Saccadic Movements" }
      ]
    },
    {
      title: "Games",
      levels: [
        { id: 5, name: "Level 05", sub: "Reaction Time" },
        { id: 6, name: "Level 06", sub: "Gabor Snake (Strabismus)" }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#f4f7f9] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a1128] text-white flex flex-col hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#00a8e8] p-2 rounded-lg">
            <span className="font-bold text-xl">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight">STRABPLAY</span>
        </div>
        
        <nav className="mt-8 flex-grow px-4 space-y-2">
          <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-[#00a8e8] text-white font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Dashboard
          </button>
          <button onClick={() => setCurrentPage('performance')} className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            Performance
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Settings
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Help
          </button>
        </nav>

        <div className="p-6">
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-3 text-rose-400 hover:text-rose-300 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-auto bg-[#f4f7f9]">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 tracking-tight text-lg">STRABPLAY</span>
            <span className="text-[10px] bg-cyan-100 text-cyan-600 px-2 py-0.5 rounded font-bold">BETA</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-700">Dr. Smith's Patient</div>
              <div className="text-[10px] text-slate-400">Last Session: Today</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Hero Card */}
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400"></div>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-cyan-400 flex items-center justify-center relative z-10">
                   <LogoIcon className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-2 right-0 bg-[#34d399] text-white text-[10px] px-2 py-0.5 rounded-full font-bold border-2 border-white">
                  Ready
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-black text-[#0a1128] mb-2">STRABPLAY</h1>
            <p className="text-slate-400 text-lg">A new vision for your therapy</p>
          </div>

          {/* Level Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            {categories.map((cat) => (
              <section key={cat.title}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-cyan-400 rounded-full"></div>
                  <h2 className="text-xl font-bold text-[#0a1128]">{cat.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {cat.levels.map((level) => {
                    const stars = completedLevels[`level${level.id}`] || 0;
                    return (
                      <button 
                        key={level.id}
                        onClick={() => setCurrentPage(`level${level.id}` as Page)}
                        className="w-full bg-white p-5 rounded-2xl border-2 border-slate-100 flex items-center justify-between group hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/5 text-left relative overflow-hidden"
                      >
                         <div className="absolute left-0 top-0 w-1 h-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div>
                          <div className="font-bold text-slate-800 text-lg">{level.name}</div>
                          <div className="text-slate-400 text-sm font-medium">{level.sub}</div>
                        </div>
                        <div className="flex items-center gap-4">
                           {stars > 0 && (
                            <div className="flex gap-0.5">
                              {Array.from({ length: stars }).map((_, i) => (
                                <StarIcon key={i} className={`w-4 h-4 ${stars === 3 ? 'text-red-500' : 'text-yellow-400'}`} />
                              ))}
                            </div>
                          )}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${level.id === 6 ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-500'}`}>
                            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Performance Sidebar Item (Screenshot has it at the bottom right) */}
            <div className="flex flex-col justify-end pt-10">
               <button 
                onClick={() => setCurrentPage('performance')}
                className="bg-[#1a233a] text-white p-6 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg hover:bg-[#252f4a] transition-colors shadow-lg shadow-black/10"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                 Performance Dashboard
               </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StrabplayHome;
