
import React from 'react';
import { Page, CompletedLevels } from '../types';
import { TOTAL_LEVELS } from '../constants';
import { CloseIcon, StarIcon, UserIcon, PlayIcon, LogoIcon } from './ui/Icons';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentPage: (page: Page) => void;
  completedLevels: CompletedLevels;
  onLogout: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, setCurrentPage, completedLevels, onLogout }) => {
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    onClose();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition duration-300 focus:outline-none"
            aria-label="Close Side Menu"
          >
            <CloseIcon />
          </button>
          
          <div className="flex items-center gap-3 mb-10 mt-4">
             <div className="bg-cyan-500 p-2 rounded-lg">
                <span className="font-bold text-lg text-white">S</span>
             </div>
             <h2 className="text-xl font-bold tracking-tight">STRABPLAY</h2>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
            <ul className="space-y-2">
              <li>
                  <button onClick={() => navigateTo('home')} className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-cyan-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                      </div>
                      <span className="font-semibold">Amblyoplay</span>
                  </button>
              </li>
              <li>
                  <button 
                    onClick={() => navigateTo('strabplay_home')}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-600 hover:text-white transition-all group"
                  >
                      <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                        <PlayIcon className="w-5 h-5"/>
                      </div>
                      <span className="font-bold">Strabplay Home</span>
                  </button>
              </li>
              <li>
                  <button onClick={() => navigateTo('profile')} className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-cyan-600 transition-colors">
                        <UserIcon className="w-4 h-4 text-cyan-400"/>
                      </div>
                      <span className="font-semibold">Profile</span>
                  </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('performance')}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-cyan-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  </div>
                  <span className="font-semibold">Performance</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Therapy Levels</p>
            <ul className="space-y-1">
              {levels.map((level) => {
                const stars = completedLevels[`level${level}`] || 0;
                return (
                  <li key={level}>
                    <button
                      onClick={() => navigateTo(`level${level}` as Page)}
                      className="flex items-center justify-between w-full p-2 px-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <span className="text-sm font-medium">Level {String(level).padStart(2, '0')}</span>
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
        </div>

        <div className="p-6 border-t border-slate-800">
           <button onClick={onLogout} className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors text-sm font-bold w-full uppercase tracking-widest">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Logout
           </button>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
