
import React from 'react';
import { Page, CompletedLevels, UserProfile } from '../types';
import { MenuIcon, StarIcon, LogoIcon, PlayIcon, UserIcon, HomeIcon, SettingsIcon } from './ui/Icons';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
  setIsSideMenuOpen: (isOpen: boolean) => void;
  isSideMenuOpen: boolean;
  completedLevels: CompletedLevels;
  onLogout: () => void;
  isDemoMode?: boolean;
  userProfile?: UserProfile;
  isDarkMode?: boolean;
}

const StrabismusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" fill="currentColor" className="opacity-20" />
    <circle cx="13" cy="11" r="1.5" fill="currentColor" />
  </svg>
);

const LevelButton: React.FC<{level: number, setCurrentPage: (page: Page) => void, stars: number, isDemoMode?: boolean, isDarkMode?: boolean}> = ({ level, setCurrentPage, stars, isDemoMode, isDarkMode }) => {
    const starColor = stars === 3 ? "text-red-500" : "text-yellow-400";
    const isLocked = isDemoMode && level > 1;

    return (
        <button
            onClick={() => !isLocked && setCurrentPage(`level${level}` as Page)}
            disabled={isLocked}
            className={`group w-full bg-gradient-to-br ${isLocked ? (isDarkMode ? 'from-slate-800 to-slate-900' : 'from-slate-100 to-slate-200') : (isDarkMode ? 'from-slate-800 to-slate-900 border-slate-700' : 'from-white to-cyan-50 border-cyan-100')} p-6 rounded-2xl ${isLocked ? 'text-slate-500 cursor-not-allowed grayscale' : (isDarkMode ? 'text-white' : 'text-slate-700')} text-xl font-bold transition-all duration-300 ease-in-out transform ${!isLocked && 'hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-400'} border shadow-sm flex justify-between items-center`}
        >
            <div className="flex items-center gap-3">
              {isLocked && (
                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
              <span>Level {String(level).padStart(2, '0')}</span>
            </div>
            {isLocked ? (
              <span className="text-[10px] bg-slate-200/10 text-slate-400 px-2 py-1 rounded uppercase tracking-widest font-black">Locked</span>
            ) : (
              stars > 0 && (
                  <div className="flex gap-1.5">
                      {Array.from({ length: stars }).map((_, i) => (
                          <StarIcon key={i} className={`w-7 h-7 ${starColor}`}/>
                      ))}
                  </div>
              )
            )}
        </button>
    );
};

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage, setIsSideMenuOpen, isSideMenuOpen, completedLevels, onLogout, isDemoMode, userProfile, isDarkMode }) => {
  const isLockedModule = userProfile?.amblyoLocked === true && userProfile?.role !== 'admin';

  const levelCategories = {
    "Common": [1, 2],
    "For Children": [3, 4],
    "Games": [5, 6]
  };

  const navItems = [
    { label: 'Amblyoplay', page: 'home' as Page, icon: <HomeIcon className="w-6 h-6" /> },
    { label: 'Strabplay', page: 'strabplay_home' as Page, icon: <PlayIcon className="w-6 h-6" /> },
    { label: 'Profile', page: 'profile' as Page, icon: <UserIcon className="w-6 h-6 text-cyan-500" /> },
    { label: 'Performance', page: 'performance' as Page, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  ];

  const displayName = userProfile?.name || 'Amblyo Patient';

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 pt-32 lg:pt-36 pb-32`}>
      {/* Refined Top Header */}
      <header className={`fixed top-0 left-0 right-0 h-28 border-b z-50 flex items-center justify-between px-6 sm:px-10 shadow-md transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
            className={`p-2 sm:p-4 rounded-full transition-colors shrink-0 ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
            aria-label="Toggle Side Menu"
          >
            <MenuIcon className="w-10 h-10" />
          </button>

          <div className="flex items-center gap-2 sm:gap-4 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className={`p-2 rounded-2xl shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-cyan-50'}`}>
                <LogoIcon className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div className="flex flex-col -space-y-1">
                  <span className={`text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AMBLYO<span className="text-cyan-500">PLAY</span></span>
                  <span className="text-[10px] bg-cyan-500 text-white px-2 py-0.5 rounded font-black w-fit tracking-tighter uppercase">BETA</span>
              </div>
          </div>

          <button
            onClick={() => setCurrentPage('strabplay_home')}
            className={`flex items-center gap-2 px-3 py-2 border rounded-xl font-bold transition-all active:scale-95 group shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-cyan-400 hover:text-cyan-600'}`}
          >
            <div className={`p-1 rounded-lg shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 group-hover:bg-slate-700' : 'bg-white group-hover:bg-cyan-50'}`}>
              <StrabismusIcon className="w-5 h-5 text-cyan-500" />
            </div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest hidden lg:inline">Strabplay</span>
          </button>

          <nav className={`hidden xl:flex items-center border p-1.5 shadow-inner rounded-3xl transition-colors ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/80 border-slate-200'}`}>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setCurrentPage(item.page)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-black text-xs uppercase whitespace-nowrap group ${item.page === 'home' ? (isDarkMode ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-cyan-600 shadow-sm') : 'text-slate-500 hover:text-cyan-500'}`}
              >
                <span className={`${item.page === 'home' ? 'text-cyan-500' : 'text-slate-400'} group-hover:text-cyan-500 transition-colors`}>
                  {React.cloneElement(item.icon as any, { className: 'w-5 h-5' })}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className={`hidden md:flex flex-col items-end border-r pr-4 sm:pr-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
             <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Therapy Status</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
             </div>
             <div className={`text-xs sm:text-sm font-black whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>OPTIMIZED FOR AMBLYO</div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
             <div className="hidden sm:block text-right">
                <div className="flex items-center justify-end gap-2 mb-0.5">
                   <div className={`text-sm sm:text-base font-black truncate max-w-[120px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{displayName}</div>
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Daily Progress: 85%</div>
             </div>
             
             <div className="relative group cursor-pointer" onClick={() => setCurrentPage('profile')}>
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-xl shadow-cyan-500/20 transform group-hover:rotate-6 transition-transform">
                  {displayName.charAt(0)}
               </div>
               <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-[3px] rounded-full ${isDarkMode ? 'border-slate-900' : 'border-white'}`}></div>
             </div>

             <button 
               onClick={onLogout}
               className={`p-2 sm:p-3 text-slate-400 hover:text-rose-500 transition-all rounded-xl ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-rose-50'}`}
               title="Logout"
             >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <div className={`rounded-[3rem] shadow-2xl p-10 sm:p-14 max-w-5xl w-full flex flex-col border relative overflow-hidden z-10 animate-fade-in-up transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-white/50'}`}>
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full -mr-40 -mt-40 blur-3xl opacity-60 ${isDarkMode ? 'bg-indigo-900/20' : 'bg-cyan-50'}`}></div>
        
        {isLockedModule ? (
             <div className="flex flex-col items-center justify-center text-center py-20 relative z-10">
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-rose-500 mb-8 border shadow-inner ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-rose-50 border-rose-100'}`}>
                       <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2z" /></svg>
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Module Locked</h2>
                  <p className="text-slate-400 font-bold max-w-md mx-auto leading-relaxed">
                       This therapy module is currently disabled for your account. Please contact your therapist or clinic administrator to activate Amblyoplay.
                  </p>
                  <button onClick={() => setCurrentPage('strabplay_home')} className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">Go to Strabplay</button>
             </div>
        ) : (
            <>
                <div className="flex flex-col items-center justify-center text-center mb-16 relative z-10">
                    <div className="flex items-center gap-8 mb-6">
                        <div className={`p-5 rounded-[2.5rem] shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-cyan-50'}`}>
                          <LogoIcon className="w-24 h-24 sm:w-28 sm:h-28" />
                        </div>
                        <div className="text-left">
                          <h1 className={`text-5xl sm:text-7xl font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-400'}`}>
                              AMBLYO<span className="text-cyan-500">PLAY</span>
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
                      <div key={category} className="animate-fade-in-up-delay">
                          <div className="flex items-center gap-5 mb-8">
                            <div className="w-2.5 h-10 bg-cyan-500 rounded-full"></div>
                            <h2 className="text-3xl font-black tracking-tight uppercase">
                                {category}
                            </h2>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                              {levels.map(level => (
                                  <LevelButton 
                                      key={level}
                                      level={level}
                                      setCurrentPage={setCurrentPage}
                                      stars={completedLevels[`level${level}`] || 0}
                                      isDemoMode={isDemoMode}
                                      isDarkMode={isDarkMode}
                                  />
                              ))}
                          </div>
                      </div>
                  ))}
                  <div className={`pt-12 border-t flex flex-col sm:flex-row gap-8 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <button
                          onClick={() => setCurrentPage('performance')}
                          className={`flex-1 group p-8 rounded-[2rem] font-black text-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-2xl flex justify-center items-center gap-5 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'}`}
                      >
                          <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                          <span>PERFORMANCE DASHBOARD</span>
                      </button>
                      
                      <button
                          onClick={() => setCurrentPage('profile')}
                          className={`group p-8 rounded-[2rem] font-black text-2xl transition-all duration-300 border-2 flex justify-center items-center gap-5 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-cyan-400' : 'bg-white border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-cyan-600'}`}
                      >
                          <UserIcon className="w-8 h-8 text-cyan-500" />
                          <span>PROFILE</span>
                      </button>
                  </div>
                </div>
            </>
        )}
      </div>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-up-delay {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
