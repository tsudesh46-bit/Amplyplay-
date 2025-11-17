
import React from 'react';
import { Page, CompletedLevels } from '../types';
import { MenuIcon, StarIcon, LogoIcon } from './ui/Icons';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
  setIsSideMenuOpen: (isOpen: boolean) => void;
  isSideMenuOpen: boolean;
  completedLevels: CompletedLevels;
}

const LevelButton: React.FC<{level: number, setCurrentPage: (page: Page) => void, stars: number}> = ({ level, setCurrentPage, stars }) => {
    const starColor = level === 1 && stars === 3 ? "text-red-500" : "text-yellow-400";

    return (
        <button
            onClick={() => setCurrentPage(`level${level}` as Page)}
            className="group w-full bg-gradient-to-br from-white to-cyan-50 p-5 rounded-xl text-slate-700 text-lg font-medium transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-cyan-200 shadow-sm hover:shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-400 flex justify-between items-center"
        >
            <span>Level {String(level).padStart(2, '0')}</span>
            {stars > 0 && (
                <div className="flex gap-1">
                    {Array.from({ length: stars }).map((_, i) => (
                        <StarIcon key={i} className={`w-6 h-6 ${starColor}`}/>
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

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <button
        onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
        className="absolute top-4 left-4 bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-300 z-50"
        aria-label="Toggle Side Menu"
      >
        <MenuIcon />
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 max-w-4xl w-full">
        <div className="flex flex-col items-center justify-center text-center mb-12">
            <div className="flex items-center gap-4">
                <LogoIcon className="w-16 h-16 sm:w-20 sm:h-20" />
                <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-400 py-2">
                    AMBLYOPLAY
                </h1>
            </div>
          <p className="text-lg sm:text-xl text-slate-500 mt-3">A new vision for your therapy</p>
        </div>

        <div className="w-full space-y-10">
          {Object.entries(levelCategories).map(([category, levels]) => (
              <div key={category}>
                  <h2 className="text-2xl font-bold text-slate-700 mb-4 pl-3 border-l-4 border-cyan-500">{category}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
          <div className="pt-6 border-t border-gray-200">
              <button
                  onClick={() => setCurrentPage('performance')}
                  className="group w-full bg-gradient-to-br from-white to-cyan-50 p-5 rounded-xl text-slate-700 text-lg font-medium transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-cyan-200 shadow-sm hover:shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-400 flex justify-center items-center"
              >
                  <span>Performance Dashboard</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;