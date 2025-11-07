
import React from 'react';
import { Page, CompletedLevels } from '../types';
import { TOTAL_LEVELS } from '../constants';
import { CloseIcon, StarIcon } from './ui/Icons';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentPage: (page: Page) => void;
  completedLevels: CompletedLevels;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, setCurrentPage, completedLevels }) => {
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
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition duration-300 focus:outline-none"
            aria-label="Close Side Menu"
          >
            <CloseIcon />
          </button>
          <h2 className="text-3xl font-bold mb-8 mt-4" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
            Menu
          </h2>
          <ul className="space-y-3">
            <li>
                <button onClick={() => navigateTo('home')} className="flex items-center w-full text-left text-lg font-semibold text-slate-300 hover:text-cyan-400 transition duration-200">
                    Home
                </button>
            </li>
            {levels.map((level) => (
              <li key={level}>
                <button
                  onClick={() => navigateTo(`level${level}` as Page)}
                  className="flex items-center justify-between w-full text-left text-lg font-semibold text-slate-300 hover:text-cyan-400 transition duration-200"
                >
                  <span>Level {String(level).padStart(2, '0')}</span>
                  {completedLevels[`level${level}`] && (
                    <span className="text-yellow-400"><StarIcon className="w-5 h-5"/></span>
                  )}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => navigateTo('performance')}
                className="flex items-center w-full text-left text-lg font-semibold text-slate-300 hover:text-cyan-400 transition duration-200"
              >
                Performance
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default SideMenu;