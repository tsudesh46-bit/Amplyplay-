
import React, { useState } from 'react';
import { Page } from '../types';
import { HomeIcon } from './ui/Icons';
import ConfirmationModal from './ConfirmationModal';

interface LevelLayoutProps {
  levelId: number;
  children: React.ReactNode;
  setCurrentPage: (page: Page) => void;
}

const LevelLayout: React.FC<LevelLayoutProps> = ({ levelId, children, setCurrentPage }) => {
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);

  const handleHomeClick = () => {
    setIsConfirmingExit(true);
  };

  const handleConfirmExit = () => {
    setIsConfirmingExit(false);
    setCurrentPage('home');
  };

  const handleCancelExit = () => {
    setIsConfirmingExit(false);
  };

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
        onClick={handleHomeClick}
        className="absolute bottom-4 right-4 group w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-xl transition-transform hover:scale-110 focus:outline-none z-30"
        aria-label="Home"
      >
         {/* Inner Ring */}
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        {/* Outer Pulse Ring */}
        <span className="absolute -inset-1 rounded-full border border-cyan-100 opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500 ease-out"></span>
        
        <HomeIcon className="w-8 h-8 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
      </button>

      <ConfirmationModal
        isOpen={isConfirmingExit}
        title="Confirm Exit"
        message="Are you sure you want to return to the main menu?"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        confirmText="Exit"
      />
    </div>
  );
};

export default LevelLayout;
