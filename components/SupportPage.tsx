
import React from 'react';
import { Page, Language } from '../types';
import { translations } from '../translations';
import { HomeIcon } from './ui/Icons';

interface SupportPageProps {
  setCurrentPage: (page: Page) => void;
  language: Language;
}

const SupportPage: React.FC<SupportPageProps> = ({ setCurrentPage, language }) => {
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
          <div className="bg-cyan-500 text-[#0a1128] w-8 h-8 flex items-center justify-center rounded-lg text-lg font-black">M</div>
          <span className="text-white font-black text-xl tracking-tighter uppercase">{t.manualTitle}</span>
        </div>
        <button 
          onClick={() => setCurrentPage('login')}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
        >
          <HomeIcon className="w-5 h-5" />
          <span>{t.back}</span>
        </button>
      </nav>

      <div className="max-w-4xl mx-auto w-full p-6 sm:p-12 space-y-12">
        <section className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
          <h2 className="text-3xl font-black text-[#0a1128] mb-6 flex items-center gap-4">
            <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
            {t.aboutTitle}
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            {t.aboutContent}
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-3xl font-black text-[#0a1128] flex items-center gap-4 px-4">
             <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
             {t.levelInstructions}
          </h2>
          
          <div className="grid gap-6">
            {levels.map(level => (
              <div key={level.id} className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 flex gap-6 items-start transition-transform hover:scale-[1.01]">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0a1128] font-black text-xl shrink-0">
                  {level.id}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0a1128] mb-2 uppercase tracking-wide">Level 0{level.id}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{level.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-8 text-center pb-12">
            <button 
              onClick={() => setCurrentPage('login')}
              className="bg-[#0a1128] text-white px-10 py-4 rounded-2xl font-black text-xl hover:bg-cyan-600 transition-all shadow-xl active:scale-95"
            >
              {t.back}
            </button>
        </div>
      </div>

      <footer className="w-full py-8 border-t border-slate-200 text-center text-slate-400 font-bold text-sm tracking-widest uppercase">
        {t.brand} &copy; 2024 • {t.tagline}
      </footer>
    </div>
  );
};

export default SupportPage;
