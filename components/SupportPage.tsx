
import React, { useState } from 'react';
import { Page, Language } from '../types';
import { translations } from '../translations';
import { HomeIcon, LogoIcon, StarIcon } from './ui/Icons';

interface SupportPageProps {
  setCurrentPage: (page: Page) => void;
  language: Language;
}

const SupportPage: React.FC<SupportPageProps> = ({ setCurrentPage, language }) => {
  const t = translations[language];
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const amblyoLevels = [
    { id: 1, desc: t.level1Desc },
    { id: 2, desc: t.level2Desc },
    { id: 3, desc: t.level3Desc },
    { id: 4, desc: t.level4Desc },
    { id: 5, desc: t.level5Desc },
    { id: 6, desc: t.level6Desc }
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setMessage('');
      setTimeout(() => setIsSent(false), 5000);
    }, 1500);
  };

  const handleCheckUpdate = () => {
    setIsCheckingUpdate(true);
    setUpdateStatus(null);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateStatus("Your application is up to date (Version 1.01).");
    }, 2000);
  };

  const ContactCard = ({ icon, title, content, subContent }: { icon: React.ReactNode, title: string, content: string, subContent?: string }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-4 transition-all hover:shadow-md hover:border-cyan-100 group">
      <div className="bg-cyan-50 p-3 rounded-2xl text-cyan-600 shrink-0 group-hover:bg-cyan-100 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</h4>
        <p className="text-sm font-bold text-slate-800 break-words leading-tight">{content}</p>
        {subContent && <p className="text-[11px] text-slate-500 font-medium mt-1">{subContent}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Navbar */}
      <nav className="w-full h-20 bg-[#0a1128] flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-500 text-[#0a1128] w-8 h-8 flex items-center justify-center rounded-lg text-lg font-black shadow-lg">H</div>
          <span className="text-white font-black text-xl tracking-tighter uppercase">{language === 'si' ? 'සහාය මධ්‍යස්ථානය' : 'Help Center'}</span>
        </div>
        <button 
          onClick={() => setCurrentPage('home')}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border border-white/5"
        >
          <HomeIcon className="w-5 h-5" />
          <span>{t.back}</span>
        </button>
      </nav>

      <div className="max-w-6xl mx-auto w-full p-6 sm:p-12 space-y-20 pb-32">
        
        {/* SECTION: Products Info */}
        <section id="products" className="animate-fade-in-up">
          <h2 className="text-3xl font-black text-[#0a1128] mb-8 flex items-center gap-4 px-2 uppercase tracking-tighter">
            <span className="w-1.5 h-8 bg-cyan-500 rounded-full"></span>
            Products Info
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 opacity-40"></div>
                <h3 className="text-lg font-black text-slate-800 uppercase mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Products Information
                </h3>
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        AmblyoPlay and StrabPlay are clinical-grade vision therapy solutions utilizing dichoptic visual stimulation to treat Amblyopia and Strabismus.
                    </p>
                    <ul className="grid grid-cols-1 gap-2">
                        <li className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase"><span className="w-1 h-1 bg-cyan-400 rounded-full"></span> Secure Patient Cloud</li>
                        <li className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase"><span className="w-1 h-1 bg-cyan-400 rounded-full"></span> Clinical Performance Metrics</li>
                        <li className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase"><span className="w-1 h-1 bg-cyan-400 rounded-full"></span> Adaptive Neural Stimuli</li>
                    </ul>
                </div>
            </div>
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Application Update</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Stay on Clinical Version 1.01</p>
                    {updateStatus && (
                        <div className="mb-4 p-4 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-2xl border border-emerald-100 animate-pulse uppercase tracking-wider">
                            {updateStatus}
                        </div>
                    )}
                </div>
                <button 
                  onClick={handleCheckUpdate}
                  disabled={isCheckingUpdate}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-400 uppercase tracking-widest text-xs"
                >
                    {isCheckingUpdate ? <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> : 'Get Latest Updates'}
                </button>
            </div>
          </div>
        </section>

        {/* SECTION: Contact Us */}
        <section id="contact" className="animate-fade-in-up">
          <h2 className="text-3xl font-black text-[#0a1128] mb-8 flex items-center gap-4 px-2 uppercase tracking-tighter">
            <span className="w-1.5 h-8 bg-indigo-500 rounded-full"></span>
            Contact Us
          </h2>
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ContactCard icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>} title="Email Support" content="tsudesh46@gmail.com" subContent="24/7 Monitoring" />
                <ContactCard icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>} title="Direct Phone" content="0715602660" />
                <ContactCard icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>} title="Office Line" content="0112688818" />
            </div>

            <div className="bg-white p-8 sm:p-14 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
                <h3 className="text-2xl font-black text-[#0a1128] mb-8 relative z-10 uppercase tracking-tight">How can we help?</h3>
                <form onSubmit={handleSend} className="space-y-6 relative z-10">
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your question or feedback here..."
                        className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 min-h-[180px] shadow-inner"
                    />
                    <button type="submit" disabled={isSending || !message.trim()} className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isSent ? 'bg-emerald-500 text-white' : 'bg-[#0a1128] text-white hover:bg-slate-800 disabled:bg-slate-100'}`}>
                        {isSending ? <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> : isSent ? 'Sent Successfully' : 'Send to Support'}
                    </button>
                </form>
            </div>
          </div>
        </section>

        {/* SECTION: About Amblyopia */}
        <section id="amblyopia" className="animate-fade-in-up">
          <h2 className="text-3xl font-black text-[#0a1128] mb-8 flex items-center gap-4 px-2 uppercase tracking-tighter">
            <span className="w-1.5 h-8 bg-emerald-600 rounded-full"></span>
            About Amblyopia
          </h2>
          <div className="space-y-12">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black uppercase tracking-widest text-emerald-400 mb-4">What is Amblyopia?</h3>
                    <p className="text-slate-300 text-lg font-medium leading-relaxed">{t.aboutContent}</p>
                </div>
            </div>

            <div className="space-y-8">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight px-2 flex items-center gap-3">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Therapy Level Guide (Amblyo)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {amblyoLevels.map(level => (
                        <div key={level.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-lg">{level.id}</div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase mb-1">Level 0{level.id}</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase">{level.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>

        {/* SECTION: About Strabismus */}
        <section id="strabismus" className="animate-fade-in-up">
          <h2 className="text-3xl font-black text-[#0a1128] mb-8 flex items-center gap-4 px-2 uppercase tracking-tighter">
            <span className="w-1.5 h-8 bg-rose-600 rounded-full"></span>
            About Strabismus
          </h2>
          <div className="space-y-12">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50 rounded-full -mr-24 -mt-24"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black text-rose-600 uppercase mb-4 tracking-tight">Understanding Strabismus</h3>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                        Strabismus therapy focuses on correcting motor alignment and binocular fusion. The StrabPlay module uses specialized targets to help the brain align images from both eyes simultaneously.
                    </p>
                </div>
            </div>

            <div className="bg-rose-50/50 p-12 rounded-[3rem] border-2 border-dashed border-rose-200 text-center">
                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
                    <svg className="w-8 h-8 text-rose-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-2">Therapy Level Guide (Strabismus)</h3>
                <p className="text-rose-600 font-black uppercase text-[10px] tracking-[0.3em]">Currently Designing & Under Development</p>
                <p className="mt-4 text-slate-400 text-sm max-w-lg mx-auto font-medium">
                    New clinical modules for motor alignment and accommodation are being finalized for Activity 01–09.
                </p>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="pt-12 text-center">
            <button 
              onClick={() => setCurrentPage('home')}
              className="bg-slate-100 text-slate-500 px-12 py-5 rounded-[2.5rem] font-black text-sm hover:bg-slate-200 transition-all active:scale-95 uppercase tracking-widest border border-slate-200 shadow-sm"
            >
              Return to Therapy
            </button>
        </div>
      </div>

      <footer className="w-full py-12 border-t border-slate-200 text-center text-slate-300 font-bold text-[10px] tracking-[0.4em] uppercase mt-auto bg-white/50">
        AMBLYOPLAY VISION THERAPY &bull; CLINICAL EDITION &bull; VERSION 1.01
      </footer>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SupportPage;
