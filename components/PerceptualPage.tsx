
import React from 'react';
import { Page } from '../types';
import { HomeIcon } from './ui/Icons';

interface PerceptualPageProps {
  setCurrentPage: (page: Page) => void;
}

const PerceptualPage: React.FC<PerceptualPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative p-8 font-sans">
      <div className="text-center bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-lg w-full animate-fade-in-up">
        <div className="bg-cyan-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-cyan-100">
          <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </div>
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-4">Activity 10</h1>
        <p className="text-xl font-bold text-cyan-600 mb-6 uppercase tracking-widest">Perceptual Training</p>
        <p className="text-slate-400 font-bold leading-relaxed">
          Advanced cognitive and visual perception exercises are being integrated into your therapy plan as Activity 10.
        </p>
      </div>
      
      <button
        onClick={() => setCurrentPage('home')}
        className="fixed bottom-8 right-8 group w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-2xl transition-transform hover:scale-110 focus:outline-none z-30"
      >
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        <HomeIcon className="w-10 h-10 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
      </button>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PerceptualPage;
