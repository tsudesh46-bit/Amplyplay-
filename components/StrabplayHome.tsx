
import React from 'react';
import { Page, CompletedLevels, UserProfile } from '../types';
import { LogoIcon, MenuIcon, PlayIcon, StarIcon, HomeIcon, SettingsIcon, UserIcon } from './ui/Icons';

interface StrabplayHomeProps {
  setCurrentPage: (page: Page) => void;
  completedLevels: CompletedLevels;
  onLogout: () => void;
  isDemoMode?: boolean;
  userProfile?: UserProfile;
}

const StrabplayHome: React.FC<StrabplayHomeProps> = ({ setCurrentPage, completedLevels, onLogout, isDemoMode, userProfile }) => {
  // Strabplay is LOCKED BY DEFAULT. Only unlocked if flag is explicitly false OR user is an administrator.
  const isLockedModule = userProfile?.role !== 'admin' && userProfile?.strabLocked !== false;

  const categories = [
    {
      title: "Motor Exercise",
      levels: [
        { id: 1, name: "Level 01", sub: "Basic Oculomotor", page: 'strab_level1' as Page },
        { id: 2, name: "Level 02", sub: "Smooth Pursuits", page: 'strab_level2' as Page },
        { id: 3, name: "Level 03", sub: "Saccades Exercise", page: 'strab_level3' as Page }
      ]
    },
    {
      title: "Accomodation",
      levels: [
        { id: 4, name: "Level 04", sub: "Flexibility", page: 'strab_level4' as Page },
        { id: 5, name: "Level 05", sub: "Amplitude", page: 'strab_level5' as Page }
      ]
    },
    {
      title: "Fusion",
      levels: [
        { id: 6, name: "Level 06", sub: "Flat Fusion", page: 'strab_level6' as Page },
        { id: 7, name: "Level 07", sub: "Stereopsis", page: 'strab_level7' as Page }
      ]
    },
    {
      title: "Games",
      levels: [
        { id: 8, name: "Level 08", sub: "Space Challenge", page: 'strab_level8' as Page },
        { id: 9, name: "Level 09", sub: "Color Match", page: 'strab_level9' as Page }
      ]
    }
  ];

  const displayName = userProfile?.name || 'Strab Patient';

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
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-white/5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Amblyoplay
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-[#00a8e8] text-white font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentPage('administration')}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-yellow-400 hover:bg-yellow-500 hover:text-slate-900 transition-colors border border-yellow-500/20"
          >
            <SettingsIcon className="w-5 h-5" />
            Administration
          </button>
          <button 
            onClick={() => setCurrentPage('time_assessment')}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-white/5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Time Assessment
          </button>
          <button onClick={() => setCurrentPage('performance')} className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            Performance
          </button>
          <button 
             onClick={() => setCurrentPage('profile')}
             className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-white/5 transition-colors"
          >
            <UserIcon className="w-5 h-5 text-cyan-400" />
            Profile
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Help
          </button>
        </nav>

        <div className="p-6">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 text-rose-400 hover:text-rose-300 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-auto bg-[#f4f7f9]">
        {/* Sync Top Header with Amblyoplay Header style */}
        <header className="h-28 bg-white border-b flex items-center justify-between px-8 shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 tracking-tighter text-2xl uppercase">STRAB<span className="text-[#00a8e8]">PLAY</span></span>
            <span className="text-[10px] bg-cyan-100 text-cyan-600 px-2 py-0.5 rounded font-black tracking-tighter">BETA</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:block text-right">
              <div className="flex items-center justify-end gap-2 mb-0.5">
                 <div className="text-sm sm:text-base font-black text-slate-800 truncate max-w-[120px]">{displayName}</div>
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Daily Progress: 85%</div>
            </div>
            
            <div className="relative group cursor-pointer" onClick={() => setCurrentPage('profile')}>
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-xl shadow-cyan-500/20 transform group-hover:rotate-6 transition-transform">
                  {displayName.charAt(0)}
               </div>
               <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-[3px] border-white rounded-full"></div>
            </div>

            <button 
              onClick={onLogout}
              className="p-2 sm:p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout"
            >
               <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          {isLockedModule ? (
                <div className="bg-white rounded-[2.5rem] shadow-xl p-20 text-center border border-slate-100 relative overflow-hidden flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>
                    <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-8 shadow-inner border border-rose-100">
                         <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2z" /></svg>
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-4">Strabplay Locked</h2>
                    <p className="text-slate-400 font-bold max-w-md mx-auto leading-relaxed">
                        This strabismus therapy module is currently disabled for your account. Please contact your therapist or clinic administrator to activate Strabplay.
                    </p>
                    <button onClick={() => setCurrentPage('home')} className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all shadow-xl">Back to Amblyoplay</button>
                </div>
          ) : (
            <>
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
                  <h1 className="text-4xl font-black text-[#0a1128] mb-2 uppercase">STRABPLAY</h1>
                  <p className="text-slate-400 text-lg font-bold">A new vision for your therapy</p>
                </div>

                {/* Level Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  {categories.map((cat) => (
                    <section key={cat.title}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-cyan-400 rounded-full"></div>
                        <h2 className="text-xl font-black text-[#0a1128] uppercase tracking-tight">{cat.title}</h2>
                      </div>
                      
                      <div className="space-y-4">
                        {cat.levels.map((level) => {
                          const stars = completedLevels[`strab_level${level.id}`] || 0;
                          const isLocked = isDemoMode && level.id > 1;
                          
                          // Logic for specific icon colors
                          let iconBgClass = 'bg-slate-100 text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-500';
                          if (!isLocked) {
                            if (level.id === 6) {
                              iconBgClass = 'bg-cyan-300 text-white'; // Light blue
                            } else if (level.id === 7) {
                              iconBgClass = 'bg-cyan-500 text-white'; // Original blue
                            } else if (level.id === 8) {
                              iconBgClass = 'bg-rose-300 text-white'; // Light red
                            } else if (level.id === 9) {
                              iconBgClass = 'bg-rose-500 text-white'; // Red
                            }
                          }

                          return (
                            <button 
                              key={level.id}
                              onClick={() => !isLocked && setCurrentPage(level.page)}
                              disabled={isLocked}
                              className={`w-full ${isLocked ? 'bg-slate-50 cursor-not-allowed grayscale' : 'bg-white hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/5'} p-5 rounded-2xl border-2 border-slate-100 flex items-center justify-between group transition-all text-left relative overflow-hidden`}
                            >
                               <div className={`absolute left-0 top-0 w-1 h-full bg-cyan-400 ${!isLocked ? 'opacity-0 group-hover:opacity-100' : 'opacity-20'} transition-opacity`}></div>
                              <div>
                                <div className={`font-black ${isLocked ? 'text-slate-400' : 'text-slate-800'} text-lg flex items-center gap-2 uppercase tracking-tighter`}>
                                  {isLocked && (
                                      <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                      </svg>
                                  )}
                                  {level.name}
                                </div>
                                <div className="text-slate-400 text-sm font-bold">
                                  {isLocked ? 'Unlock in full version' : level.sub}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 {stars > 0 && !isLocked && (
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: stars }).map((_, i) => (
                                      <StarIcon key={i} className={`w-4 h-4 ${stars === 3 ? 'text-red-500' : 'text-yellow-400'}`} />
                                    ))}
                                  </div>
                                )}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${iconBgClass}`}>
                                  {isLocked ? (
                                      <span className="text-[8px] font-black uppercase text-slate-300">Lock</span>
                                  ) : (
                                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}

                  <div className="flex flex-col justify-end pt-10 gap-4">
                     <button 
                      onClick={() => setCurrentPage('performance')}
                      className="bg-[#1a233a] text-white p-6 rounded-2xl flex items-center justify-center gap-3 font-black text-lg hover:bg-[#252f4a] transition-colors shadow-lg shadow-black/10 uppercase tracking-tight"
                     >
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                       Performance Dashboard
                     </button>
                  </div>
                </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StrabplayHome;
