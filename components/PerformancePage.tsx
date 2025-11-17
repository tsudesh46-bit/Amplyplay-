
import React from 'react';
import { Page, CompletedLevels } from '../types';
import { TOTAL_LEVELS } from '../constants';
import { HomeIcon, StarIcon } from './ui/Icons';

interface PerformancePageProps {
  setCurrentPage: (page: Page) => void;
  completedLevels: CompletedLevels;
}

const PerformancePage: React.FC<PerformancePageProps> = ({ setCurrentPage, completedLevels }) => {
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-6">
      <header className="w-full max-w-4xl mx-auto my-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>
            Performance
        </h1>
      </header>
      
      <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 text-slate-700 text-center">
          Level Completion Status
        </h3>
        <ul className="space-y-4">
          {levels.map((level) => {
            const stars = completedLevels[`level${level}`] || 0;
            return (
              <li
                key={level}
                className="flex items-center justify-between text-lg text-slate-600 p-4 bg-slate-100 rounded-lg"
              >
                <span className="font-semibold">
                  Level {String(level).padStart(2, '0')}
                </span>
                {stars > 0 ? (
                  <span className="flex items-center text-teal-600 font-bold">
                    Completed
                    <div className="flex items-center ml-3 gap-1">
                      {Array.from({ length: stars }).map((_, i) => (
                        <StarIcon key={i} className="text-yellow-500 w-6 h-6" />
                      ))}
                    </div>
                  </span>
                ) : (
                  <span className="text-rose-500 font-medium">Not Completed</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={() => setCurrentPage('home')}
        className="absolute bottom-4 right-4 bg-white text-cyan-600 p-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-cyan-300"
        aria-label="Home"
      >
        <HomeIcon />
      </button>
    </div>
  );
};

export default PerformancePage;