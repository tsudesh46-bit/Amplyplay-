
import React from 'react';
import { Page } from '../types';
import { HomeIcon } from './ui/Icons';

interface MediaPageProps {
  setCurrentPage: (page: Page) => void;
}

const MediaPage: React.FC<MediaPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative p-8 font-sans">
      <div className="text-center bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-lg w-full">
        <div className="bg-indigo-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-indigo-100">
          <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </div>
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-4">Media Hub</h1>
        <p className="text-slate-400 font-bold leading-relaxed">
          Integrated visual stimulus and video training content is coming soon.
        </p>
      </div>
      
      <button
        onClick={() => setCurrentPage('home')}
        className="fixed bottom-8 right-8 group w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-2xl transition-transform hover:scale-110 focus:outline-none z-30"
      >
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        <HomeIcon className="w-10 h-10 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
      </button>
    </div>
  );
};

export default MediaPage;
