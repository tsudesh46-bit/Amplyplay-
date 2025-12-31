
import React from 'react';
import { Page } from '../types';
import { HomeIcon } from './ui/Icons';

interface TimeAssessmentPageProps {
  setCurrentPage: (page: Page) => void;
}

const TimeAssessmentPage: React.FC<TimeAssessmentPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Time Assessment</h1>
        <p className="text-slate-500 font-medium mb-8">This page is currently being prepared. Check back soon for your vision timing evaluations.</p>
        
        <button
          onClick={() => setCurrentPage('home')}
          className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
        >
          <HomeIcon className="w-5 h-5" />
          <span>BACK TO HOME</span>
        </button>
      </div>
    </div>
  );
};

export default TimeAssessmentPage;