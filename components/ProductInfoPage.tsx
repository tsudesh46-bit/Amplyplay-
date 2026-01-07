
import React, { useState } from 'react';
import { Page, Language } from '../types';
import { translations } from '../translations';
import { HomeIcon, LogoIcon } from './ui/Icons';

interface ProductInfoPageProps {
  setCurrentPage: (page: Page) => void;
  language: Language;
}

const ProductInfoPage: React.FC<ProductInfoPageProps> = ({ setCurrentPage, language }) => {
  const t = translations[language];
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const handleCheckUpdate = () => {
    setIsCheckingUpdate(true);
    setUpdateStatus(null);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateStatus("Your application is up to date (Version 1.01).");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <nav className="w-full h-20 bg-[#0a1128] flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-500 text-[#0a1128] w-8 h-8 flex items-center justify-center rounded-lg text-lg font-black shadow-lg shadow-cyan-500/20">P</div>
          <span className="text-white font-black text-xl tracking-tighter uppercase">Product Information</span>
        </div>
        <button 
          onClick={() => setCurrentPage('home')}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border border-white/5"
        >
          <HomeIcon className="w-5 h-5" />
          <span>{t.back}</span>
        </button>
      </nav>

      <div className="max-w-5xl mx-auto w-full p-6 sm:p-12 space-y-12 pb-32">
        
        <header className="text-center space-y-2 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase">Product Details</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Technical Overview & System Lifecycle</p>
        </header>

        <section className="animate-fade-in-up space-y-8">
            {/* Products Information Section */}
            <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full -mr-32 -mt-32 opacity-40"></div>
                <h2 className="text-3xl font-black text-[#0a1128] mb-8 flex items-center gap-4 relative z-10">
                    <span className="w-1.5 h-8 bg-cyan-500 rounded-full"></span>
                    Products Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                    <div className="space-y-8">
                        <div className="flex gap-5 items-start">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 text-indigo-600 shadow-sm">
                                <LogoIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">AmblyoPlay Clinical</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    A professional dichoptic stimulation platform designed for the treatment of Amblyopia (lazy eye). It utilizes specialized visual patterns to encourage binocular integration.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-5 items-start">
                            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0 text-rose-600 shadow-sm">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">StrabPlay Module</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Specialized training for Strabismus patients focusing on motor alignment, accommodation flexibility, and expansion of fusion ranges.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4 text-xs font-black text-slate-600 uppercase tracking-tight">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                                Clinical Standard Compliance
                            </li>
                            <li className="flex items-center gap-4 text-xs font-black text-slate-600 uppercase tracking-tight">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span>
                                Adaptive Neural Plasticity Protocols
                            </li>
                            <li className="flex items-center gap-4 text-xs font-black text-slate-600 uppercase tracking-tight">
                                <span className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]"></span>
                                Real-time Data Synchronization
                            </li>
                            <li className="flex items-center gap-4 text-xs font-black text-slate-600 uppercase tracking-tight">
                                <span className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span>
                                Therapist Monitoring Dashboard
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Application Update Section */}
            <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden flex flex-col justify-between">
               <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
               <div>
                  <h2 className="text-3xl font-black text-[#0a1128] mb-2 uppercase tracking-tight">Application Update</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10">Maintain latest therapeutic stability</p>
                  
                  {updateStatus && (
                    <div className="mb-10 p-6 bg-emerald-50 text-emerald-700 text-xs font-black rounded-2xl border border-emerald-100 animate-pulse flex items-center gap-4 uppercase tracking-wider">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      {updateStatus}
                    </div>
                  )}
               </div>
               
               <button 
                  onClick={handleCheckUpdate}
                  disabled={isCheckingUpdate}
                  className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 disabled:bg-slate-100 disabled:text-slate-400 uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95"
               >
                 {isCheckingUpdate ? (
                   <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                 ) : (
                    <>
                        <span>Check for Updates</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    </>
                 )}
               </button>
            </div>
        </section>

        <div className="pt-8 text-center">
            <button 
              onClick={() => setCurrentPage('home')}
              className="bg-slate-100 text-slate-500 px-12 py-5 rounded-3xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95 uppercase tracking-widest"
            >
              Return Home
            </button>
        </div>
      </div>

      <footer className="w-full py-10 border-t border-slate-200 text-center text-slate-300 font-bold text-[10px] tracking-[0.4em] uppercase mt-auto bg-white/50">
        VISION THERAPY CORE &bull; CLINICAL EDITION &bull; VERSION 1.01
      </footer>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ProductInfoPage;
