
import React, { useState } from 'react';
import { Page, CompletedLevels, LevelStats, Language } from '../types';
import { TOTAL_LEVELS } from '../constants';
import { HomeIcon, StarIcon } from './ui/Icons';
import ConfirmationModal from './ConfirmationModal';

interface PerformancePageProps {
  setCurrentPage: (page: Page) => void;
  completedLevels: CompletedLevels;
  gameHistory: LevelStats[];
  language: Language;
}

const PerformancePage: React.FC<PerformancePageProps> = ({ setCurrentPage, completedLevels, gameHistory, language }) => {
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  const [filter, setFilter] = useState<'all' | 'amblyo' | 'strab'>('all');
  
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  const handleHomeClick = () => {
    setIsConfirmingExit(true);
  };

  const handleConfirmExit = () => {
    setIsConfirmingExit(false);
    setCurrentPage('home');
  };

  const filteredHistory = gameHistory.filter(item => filter === 'all' || item.category === filter);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-6 overflow-y-auto font-sans pb-24">
      <header className="w-full max-w-5xl mx-auto my-10 text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.05)'}}>
            Performance Dashboard
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Vision Therapy Analysis</p>
      </header>
      
      <div className="w-full max-w-5xl space-y-10">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-white flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                    <StarIcon className="w-7 h-7" />
                </div>
                <div className="text-4xl font-black text-slate-900">{gameHistory.length}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sessions Completed</div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-white flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div className="text-4xl font-black text-slate-900">
                    {gameHistory.reduce((acc, curr) => acc + (curr.stars === 3 ? 1 : 0), 0)}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Perfect Scores</div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-white flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>
                <div className="text-4xl font-black text-slate-900">
                    {gameHistory.length > 0 ? (gameHistory.reduce((acc, curr) => acc + curr.score, 0) / gameHistory.length).toFixed(1) : '0'}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Avg. Level Score</div>
            </div>
        </div>

        {/* Detailed History Table */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-fade-in-up">
            <div className="p-8 sm:p-12 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Therapy History</h3>
                    <p className="text-slate-400 font-bold text-sm">Detailed logs of every exercise session</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >All</button>
                    <button 
                        onClick={() => setFilter('amblyo')}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${filter === 'amblyo' ? 'bg-white text-cyan-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >Amblyo</button>
                    <button 
                        onClick={() => setFilter('strab')}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${filter === 'strab' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >Strab</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acuity / Contrast</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stars</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredHistory.length > 0 ? filteredHistory.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="text-sm font-bold text-slate-800">{formatDate(item.timestamp)}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${item.category === 'amblyo' ? 'bg-cyan-500' : 'bg-indigo-500'}`}></div>
                                        <div className="text-sm font-black text-slate-900 uppercase">{item.levelId}</div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        {item.size && <span className="text-xs font-bold text-slate-600">Size: {item.size.toFixed(1)}px</span>}
                                        {item.contrast && <span className="text-[10px] font-black text-slate-400 uppercase">Contrast: {(item.contrast * 100).toFixed(0)}%</span>}
                                        {!item.size && !item.contrast && <span className="text-xs text-slate-300">N/A</span>}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex justify-center gap-1">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <StarIcon key={i} className={`w-5 h-5 ${i < item.stars ? (item.stars === 3 ? 'text-red-500' : 'text-yellow-400') : 'text-slate-100'}`} />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="inline-flex flex-col items-end">
                                        <span className="text-lg font-black text-slate-900">{item.score}</span>
                                        <span className="text-[9px] font-black text-rose-500 uppercase">Errors: {item.incorrect}</span>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">
                                    No therapy records found. Start a level to begin analysis.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      <button
        onClick={handleHomeClick}
        className="fixed bottom-8 right-8 group w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-2xl transition-transform hover:scale-110 focus:outline-none z-30"
        aria-label="Home"
      >
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        <span className="absolute -inset-2 rounded-full border border-cyan-100 opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500 ease-out"></span>
        <HomeIcon className="w-10 h-10 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
      </button>

      <ConfirmationModal
        isOpen={isConfirmingExit}
        title="Confirm Exit"
        message="Are you sure you want to return to the main menu?"
        onConfirm={handleConfirmExit}
        onCancel={() => setIsConfirmingExit(false)}
        confirmText="Exit"
      />

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .7; }
        }
      `}</style>
    </div>
  );
};

export default PerformancePage;
