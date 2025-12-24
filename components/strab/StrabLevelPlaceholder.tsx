
import React from 'react';
import { Page } from '../../types';
import { HomeIcon } from '../ui/Icons';

interface StrabLevelPlaceholderProps {
  setCurrentPage: (page: Page) => void;
  levelName: string;
}

const StrabLevelPlaceholder: React.FC<StrabLevelPlaceholderProps> = ({ setCurrentPage, levelName }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">{levelName}</h1>
        <p className="text-slate-500 text-lg">Exercise content is under development.</p>
      </div>
      
      <button
        onClick={() => setCurrentPage('strabplay_home')}
        className="absolute bottom-8 right-8 group w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-xl transition-transform hover:scale-110 focus:outline-none"
        aria-label="Back to Dashboard"
      >
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        <HomeIcon className="w-8 h-8 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
      </button>
    </div>
  );
};

export default StrabLevelPlaceholder;