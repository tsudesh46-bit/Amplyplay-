
import React from 'react';
import { Page } from '../types';
import { HomeIcon } from './ui/Icons';

interface LevelLayoutProps {
  levelId: number;
  children: React.ReactNode;
  setCurrentPage: (page: Page) => void;
}

const LevelLayout: React.FC<LevelLayoutProps> = ({ levelId, children, setCurrentPage }) => {
  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center p-4 overflow-hidden">
      <header className="w-full max-w-4xl mx-auto my-4 text-center shrink-0">
        <h1 className="text-4xl font-bold text-slate-700" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>
            Level {String(levelId).padStart(2, '0')}
        </h1>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center w-full min-h-0">
        {children}
      </main>

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

export default LevelLayout;