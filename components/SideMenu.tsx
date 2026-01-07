
import React from 'react';
import { Page, CompletedLevels, UserProfile } from '../types';
import { CloseIcon, StarIcon, UserIcon, PlayIcon, HomeIcon, SettingsIcon } from './ui/Icons';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentPage: (page: Page) => void;
  completedLevels: CompletedLevels;
  onLogout: () => void;
  userProfile?: UserProfile;
  currentPage: Page;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, setCurrentPage, completedLevels, onLogout, userProfile, currentPage }) => {
  const isStrabMode = currentPage.includes('strab') || currentPage === 'strabplay_home';
  // Standard levels list excluding Perceptual (Activity 10)
  const levelCount = isStrabMode ? 9 : 6;
  const levels = Array.from({ length: levelCount }, (_, i) => i + 1);
  const sectionLabel = isStrabMode ? "Therapy Activities" : "Therapy Levels";

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    onClose();
  };

  // Main navigation items with "light" theme (colored text on light backgrounds)
  const navItems = [
    { 
        label: 'Amblyoplay', 
        page: 'home' as Page, 
        icon: <HomeIcon className="w-5 h-5" />,
        colorClass: "text-cyan-600 bg-cyan-50 border-cyan-100 hover:bg-cyan-100",
        iconColor: "text-cyan-500"
    },
    { 
        label: 'Strabplay Home', 
        page: 'strabplay_home' as Page, 
        icon: <PlayIcon className="w-5 h-5" />,
        colorClass: "text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100",
        iconColor: "text-rose-500"
    },
    { 
        label: 'Administration', 
        page: 'administration' as Page, 
        icon: <SettingsIcon className="w-5 h-5" />,
        colorClass: "text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
        iconColor: "text-yellow-600"
    },
    { 
        label: 'Media', 
        page: 'media' as Page, 
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        colorClass: "text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100",
        iconColor: "text-indigo-500"
    },
    { 
        label: 'Time Assessment', 
        page: 'time_assessment' as Page, 
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        colorClass: "text-teal-600 bg-teal-50 border-teal-100 hover:bg-teal-100",
        iconColor: "text-teal-500"
    },
    { 
        label: 'Profile', 
        page: 'profile' as Page, 
        icon: <UserIcon className="w-5 h-5" />,
        colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100",
        iconColor: "text-emerald-500"
    },
    { 
        label: 'Performance', 
        page: 'performance' as Page, 
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
        colorClass: "text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100",
        iconColor: "text-amber-500"
    }
  ];

  const perceptualStars = completedLevels['perceptual'] || 0;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white text-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition duration-300 focus:outline-none"
            aria-label="Close Side Menu"
          >
            <CloseIcon />
          </button>
          
          <div className="flex items-center gap-3 mb-10 mt-4">
             <div className="bg-cyan-500 p-2 rounded-lg">
                <span className="font-bold text-lg text-white">{isStrabMode ? 'S' : 'A'}</span>
             </div>
             <h2 className="text-xl font-bold tracking-tight text-slate-900">{isStrabMode ? 'STRABPLAY' : 'AMBLYOPLAY'}</h2>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                    <button 
                        onClick={() => navigateTo(item.page)} 
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all group border shadow-sm active:scale-95 ${item.colorClass} ${currentPage === item.page ? 'ring-2 ring-slate-100' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.iconColor}`}>
                            {item.icon}
                        </div>
                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{sectionLabel}</p>
            <ul className="space-y-1">
              {levels.map((num) => {
                const id = isStrabMode ? `strab_level${num}` : `level${num}`;
                const stars = completedLevels[id] || 0;
                return (
                  <li key={id}>
                    <button
                      onClick={() => navigateTo(id as Page)}
                      className="flex items-center justify-between w-full p-2 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      <div className="flex items-center gap-2">
                        <PlayIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold">
                          {isStrabMode ? `Activity ${num}` : `Level ${num}`}
                        </span>
                      </div>
                      {stars > 0 && (
                        <div className="flex gap-0.5">
                          {Array.from({length: stars}).map((_, i) => (
                            <StarIcon key={i} className={`w-3 h-3 ${stars === 3 ? 'text-rose-500' : 'text-yellow-500'}`}/>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Perceptual Training - Specialized Category */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Specialized Training</p>
            <button
                onClick={() => navigateTo('perceptual')}
                className={`flex items-center justify-between w-full p-3 rounded-xl transition-all active:scale-95 border group ${currentPage === 'perceptual' ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-200 ring-2 ring-indigo-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 shadow-sm'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${currentPage === 'perceptual' ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                        </svg>
                    </div>
                    <span className="text-sm font-black uppercase tracking-tight">Perceptual L.10</span>
                </div>
                {perceptualStars > 0 && (
                    <div className="flex gap-0.5">
                        {Array.from({length: perceptualStars}).map((_, i) => (
                            <StarIcon key={i} className={`w-4 h-4 ${perceptualStars === 3 ? 'text-rose-400' : 'text-yellow-400'}`}/>
                        ))}
                    </div>
                )}
            </button>
          </div>

          {/* Help Center Navigation Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Resources & Support</p>
            <ul className="space-y-1">
              <li>
                <button onClick={() => navigateTo('support')} className="flex items-center gap-3 w-full p-2 px-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 group">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm font-bold">Help Center</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('support')} className="flex items-center gap-3 w-full p-2 px-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 group">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm font-bold">Product Info</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('support')} className="flex items-center gap-3 w-full p-2 px-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 group">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="text-sm font-bold">Contact Us</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('support')} className="flex items-center gap-3 w-full p-2 px-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 group">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm font-bold">About Amblyopia</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-2">
           <button 
                onClick={() => navigateTo('settings')} 
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all active:scale-95 group border shadow-sm ${currentPage === 'settings' ? 'bg-slate-800 text-white border-slate-900 shadow-slate-200' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
           >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentPage === 'settings' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <SettingsIcon className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-tight">Settings</span>
           </button>
           <button onClick={onLogout} className="flex items-center gap-3 text-slate-400 hover:text-rose-500 transition-colors p-3 text-xs font-bold w-full uppercase tracking-widest active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Logout
           </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </>
  );
};

export default SideMenu;
