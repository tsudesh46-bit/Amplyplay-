
import React from 'react';
import { Page, Language } from '../types';
import { translations } from '../translations';
import { HomeIcon, LogoIcon } from './ui/Icons';

interface AboutAmblyoPageProps {
  setCurrentPage: (page: Page) => void;
  language: Language;
}

const AboutAmblyoPage: React.FC<AboutAmblyoPageProps> = ({ setCurrentPage, language }) => {
  const t = translations[language];
  const levels = [
    { id: 1, desc: t.level1Desc },
    { id: 2, desc: t.level2Desc },
    { id: 3, desc: t.level3Desc },
    { id: 4, desc: t.level4Desc },
    { id: 5, desc: t.level5Desc },
    { id: 6, desc: t.level6Desc }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <nav className="w-full h-20 bg-[#0a1128] flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-500 text-[#0a1128] w-8 h-8 flex items-center justify-center rounded-lg text-lg font-black">A</div>
          <span className="text-white font-black text-xl tracking-tighter uppercase">About Amblyopia</span>
        </div>
        <button onClick={() => setCurrentPage('home')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border border-white/5">
          <HomeIcon className="w-5 h-5" />
          <span>{t.back}</span>
        </button>
      </nav>

      <div className="max-w-5xl mx-auto w-full p-6 sm:p-12 space-y-12 pb-32">
        <section className="bg-slate-900 text-white p-8 sm:p-14 rounded-[3rem] shadow-2xl animate-fade-in-up relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -mr-40 -mt-40"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                <div className="shrink-0">
                    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
                        <LogoIcon className="w-24 h-24 text-cyan-400" />
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">AmblyoPlay</h2>
                        <div className="h-1.5 w-24 bg-cyan-500 rounded-full"></div>
                    </div>
                    <p className="text-slate-300 text-lg font-medium leading-relaxed">
                        {t.aboutContent}
                    </p>
                </div>
            </div>
        </section>

        <section className="space-y-8 animate-fade-in-up">
          <h2 className="text-3xl font-black text-[#0a1128] flex items-center gap-4 px-2 uppercase tracking-tight">
             <span className="w-1.5 h-8 bg-cyan-500 rounded-full"></span>
             Therapy Level Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map(level => (
              <div key={level.id} className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 flex flex-col gap-4 transition-transform hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 font-black text-lg">
                  {level.id}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-tight">Level 0{level.id}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-tight">{level.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-8 text-center">
            <button onClick={() => setCurrentPage('home')} className="bg-slate-100 text-slate-500 px-10 py-4 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all uppercase tracking-widest">
              Return Home
            </button>
        </div>
      </div>

      <footer className="w-full py-10 border-t border-slate-200 text-center text-slate-300 font-bold text-[10px] tracking-[0.4em] uppercase mt-auto">
        AMBLYOPLAY CLINICAL &bull; VERSION 1.01
      </footer>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AboutAmblyoPage;
