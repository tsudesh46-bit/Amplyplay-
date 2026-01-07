
import React from 'react';
import { Page, Language } from '../types';
import { translations } from '../translations';
import { HomeIcon } from './ui/Icons';

interface AboutStrabPageProps {
  setCurrentPage: (page: Page) => void;
  language: Language;
}

const AboutStrabPage: React.FC<AboutStrabPageProps> = ({ setCurrentPage, language }) => {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <nav className="w-full h-20 bg-[#0a1128] flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-rose-500 text-white w-8 h-8 flex items-center justify-center rounded-lg text-lg font-black shadow-lg shadow-rose-500/20">S</div>
          <span className="text-white font-black text-xl tracking-tighter uppercase">About Strabismus</span>
        </div>
        <button onClick={() => setCurrentPage('home')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border border-white/5">
          <HomeIcon className="w-5 h-5" />
          <span>{t.back}</span>
        </button>
      </nav>

      <div className="max-w-5xl mx-auto w-full p-6 sm:p-12 space-y-12 pb-32">
        <section className="bg-white p-8 sm:p-14 rounded-[3rem] shadow-xl border border-slate-100 animate-fade-in-up relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                <div className="shrink-0">
                    <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 shadow-inner">
                        <svg className="w-24 h-24 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-4xl font-black uppercase text-slate-800 tracking-tighter mb-2">Strabismus Therapy</h2>
                        <div className="h-1.5 w-24 bg-rose-500 rounded-full"></div>
                    </div>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                        Strabismus module focuses on motor alignment, accommodation flexibility, and fusion ranges. It is designed to help the brain synchronize visual inputs from both eyes even when there is physical misalignment.
                    </p>
                </div>
            </div>
        </section>

        <section className="bg-slate-50 p-12 rounded-[3rem] border-2 border-dashed border-slate-200 text-center animate-fade-in-up">
            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <svg className="w-8 h-8 text-rose-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-2">Therapy Level Guide</h3>
            <p className="text-rose-600 font-black uppercase text-[10px] tracking-[0.3em]">Currently Under Clinical Development</p>
            <p className="mt-4 text-slate-400 text-sm max-w-lg mx-auto font-medium">
                Detailed activity guides for Motor Exercise, Accommodation, and Fusion modules are being finalized for clinical release.
            </p>
        </section>

        <div className="pt-8 text-center">
            <button onClick={() => setCurrentPage('home')} className="bg-slate-100 text-slate-500 px-10 py-4 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all uppercase tracking-widest">
              Return Home
            </button>
        </div>
      </div>

      <footer className="w-full py-10 border-t border-slate-200 text-center text-slate-300 font-bold text-[10px] tracking-[0.4em] uppercase mt-auto">
        STRABPLAY CLINICAL &bull; VERSION 1.01
      </footer>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AboutStrabPage;
