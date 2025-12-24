
import React from 'react';
import { Page, CompletedLevels } from '../types';
import { MenuIcon, StarIcon, LogoIcon, PlayIcon, UserIcon, HomeIcon, SettingsIcon } from './ui/Icons';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
  setIsSideMenuOpen: (isOpen: boolean) => void;
  isSideMenuOpen: boolean;
  completedLevels: CompletedLevels;
}

const StrabismusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" fill="currentColor" className="opacity-20" />
    <circle cx="13" cy="11" r="1.5" fill="currentColor" />
  </svg>
);

const LevelButton: React.FC<{level: number, setCurrentPage: (page: Page) => void, stars: number}> = ({ level, setCurrentPage, stars }) => {
    const starColor = stars === 3 ? "text-red-500" : "text-yellow-400";

    return (
        <button
            onClick={() => setCurrentPage(`level${level}` as Page)}
            className="group w-full bg-gradient-to-br from-white to-cyan-50 p-6 rounded-2xl text-slate-700 text-xl font-bold transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-cyan-100 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-300 flex justify-between items-center"
        >
            <span>Level {String(level).padStart(2, '0')}</span>
            {stars > 0 && (
                <div className="flex gap-1.5">
                    {Array.from({ length: stars }).map((_, i) => (
                        <StarIcon key={i} className={`w-7 h-7 ${starColor}`}/>
                    ))}
                </div>
            )}
        </button>
    );
};

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage, setIsSideMenuOpen, isSideMenuOpen, completedLevels }) => {
  const levelCategories = {
    "Common": [1, 2],
    "For Children": [3, 4],
    "Games": [5, 6]
  };

  const navItems = [
    { label: 'Amblyoplay', page: 'home' as Page, icon: <HomeIcon className="w-6 h-6" /> },
    { label: 'Strabplay', page: 'strabplay_home' as Page, icon: <PlayIcon className="w-6 h-6" /> },
    { label: 'Profile', page: 'profile' as Page, icon: <UserIcon className="w-6 h-6" /> },
    { label: 'Performance', page: 'performance' as Page, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Refined Top Header */}
      <header className="fixed top-0 left-0 right-0 h-28 bg-white border-b border-slate-100 z-50 flex items-center justify-between px-10 shadow-md">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
            className="text-slate-700 p-4 rounded-full hover:bg-slate-50 transition-colors shrink-0"
            aria-label="Toggle Side Menu"
          >
            <MenuIcon className="w-10 h-10" />
          </button>

          {/* Amblyoplay Brand First */}
          <div className="flex items-center gap-4 mr-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="bg-cyan-50 p-2.5 rounded-2xl shadow-inner">
                <LogoIcon className="w-12 h-12" />
              </div>
              <div className="flex flex-col -space-y-1">
                  <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">AMBLYO<span className="text-cyan-500">PLAY</span></span>
                  <span className="text-[10px] bg-cyan-500 text-white px-2 py-0.5 rounded font-black w-fit tracking-tighter uppercase">BETA</span>
              </div>
          </div>

          {/* Strabplay Entry Second with Strabismus Eye Icon */}
          <button
            onClick={() => setCurrentPage('strabplay_home')}
            className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:border-cyan-400 hover:text-cyan-600 transition-all active:scale-95 group shadow-sm mr-4"
          >
            <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:bg-cyan-50 transition-colors">
              <StrabismusIcon className="w-5 h-5 text-cyan-500" />
            </div>
            <span className="text-xs uppercase tracking-widest hidden sm:inline">Strabplay</span>
          </button>

          {/* Large Persistent Horizontal Navigation Bar */}
          <nav className="hidden lg:flex items-center bg-slate-50/80 rounded-3xl border border-slate-200 p-2 shadow-inner">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setCurrentPage(item.page)}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl transition-all font-black text-sm uppercase whitespace-nowrap group ${item.page === 'home' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-cyan-500'}`}
              >
                <span className={`${item.page === 'home' ? 'text-cyan-500' : 'text-slate-400'} group-hover:text-cyan-500 transition-colors`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-10">
          <div className="hidden 2xl:flex flex-col items-end border-r border-slate-100 pr-10">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Therapy Status</span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
             </div>
             <div className="text-base font-black text-slate-800">OPTIMIZED FOR AMBLYO</div>
          </div>

          <div className="flex items-center gap-8">
             <div className="hidden sm:block text-right">
                <div className="flex items-center justify-end gap-3 mb-1">
                   <div className="text-lg font-black text-slate-800">Amblyo Patient</div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Daily Progress: 85% Complete</div>
             </div>
             
             <div className="relative group cursor-pointer" onClick={() => setCurrentPage('profile')}>
               <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-cyan-500/20 transform group-hover:rotate-6 transition-transform">
                  A
               </div>
               <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
             </div>

             <button 
               onClick={() => setCurrentPage('home')}
               className="p-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-[1.25rem] transition-all"
               title="Logout"
             >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Card - Perfectly Centered */}
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 sm:p-14 max-w-5xl w-full flex flex-col border border-white/50 relative overflow-hidden z-10">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-50 rounded-full -mr-40 -mt-40 blur-3xl opacity-60"></div>
        
        <div className="flex flex-col items-center justify-center text-center mb-16 relative z-10">
            <div className="flex items-center gap-8 mb-6">
                <div className="p-5 bg-cyan-50 rounded-[2.5rem] shadow-inner">
                  <LogoIcon className="w-24 h-24 sm:w-28 sm:h-28" />
                </div>
                <div className="text-left">
                  <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-400 tracking-tighter leading-none">
                      AMBLYOPLAY
                  </h1>
                  <p className="text-xl sm:text-2xl font-bold text-slate-400 mt-2 flex items-center gap-3">
                    <span className="w-12 h-0.5 bg-cyan-400 rounded-full"></span>
                    A new vision for your therapy
                  </p>
                </div>
            </div>
        </div>

        <div className="w-full space-y-14 relative z-10">
          {Object.entries(levelCategories).map(([category, levels]) => (
              <div key={category} className="animate-fade-in-up">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-2.5 h-10 bg-cyan-500 rounded-full"></div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{category}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {levels.map(level => (
                          <LevelButton 
                              key={level}
                              level={level}
                              setCurrentPage={setCurrentPage}
                              stars={completedLevels[`level${level}`] || 0}
                          />
                      ))}
                  </div>
              </div>
          ))}
          <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row gap-8">
              <button
                  onClick={() => setCurrentPage('performance')}
                  className="flex-1 group bg-slate-900 text-white p-8 rounded-[2rem] font-black text-2xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-slate-800 shadow-2xl shadow-slate-900/20 flex justify-center items-center gap-5"
              >
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  <span>PERFORMANCE DASHBOARD</span>
              </button>
              
              <button
                  onClick={() => setCurrentPage('profile')}
                  className="group bg-white border-2 border-slate-200 text-slate-700 p-8 rounded-[2rem] font-black text-2xl transition-all duration-300 hover:border-cyan-400 hover:text-cyan-600 flex justify-center items-center gap-5"
              >
                  <UserIcon className="w-8 h-8" />
                  <span>PROFILE</span>
              </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
