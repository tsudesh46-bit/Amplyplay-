
import React from 'react';
import { Page, Language } from '../types';
import { HomeIcon, SettingsIcon } from './ui/Icons';

interface SettingsPageProps {
  setCurrentPage: (page: Page) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  brightness: number;
  setBrightness: (val: number) => void;
  sound: boolean;
  setSound: (val: boolean) => void;
  vibration: boolean;
  setVibration: (val: boolean) => void;
  hapticVibrator: boolean;
  setHapticVibrator: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  themeColor: string;
  setThemeColor: (val: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  setCurrentPage, 
  language, 
  setLanguage,
  brightness,
  setBrightness,
  sound,
  setSound,
  vibration,
  setVibration,
  hapticVibrator,
  setHapticVibrator,
  isDarkMode,
  setIsDarkMode,
  themeColor,
  setThemeColor
}) => {

  const themeColors = [
    { id: 'cyan', class: 'bg-cyan-500' },
    { id: 'indigo', class: 'bg-indigo-500' },
    { id: 'rose', class: 'bg-rose-500' },
    { id: 'emerald', class: 'bg-emerald-500' },
    { id: 'amber', class: 'bg-amber-500' },
  ];

  return (
    <div className={`relative min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} flex flex-col items-center p-4 sm:p-6 overflow-y-auto pb-20 font-sans transition-colors duration-300`}>
      <header className="w-full max-w-4xl mx-auto my-10 text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-black flex items-center justify-center gap-5 tracking-tighter uppercase">
            <div className="bg-slate-800 p-2 rounded-2xl shadow-xl">
              <SettingsIcon className="w-10 h-10 text-white" />
            </div>
            App Settings
        </h1>
      </header>
      
      <div className="w-full max-w-2xl space-y-8 animate-fade-in-up">
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'} p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border space-y-12 transition-colors duration-300`}>
           
           {/* Dark Mode Toggle */}
           <section className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-50/5 rounded-3xl border border-slate-100/10">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                    {isDarkMode ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
                  </h3>
                  <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest mt-1">App Theme Appearance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={(e) => setIsDarkMode(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
           </section>

           {/* Brightness */}
           <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                  Brightness 🔅
                </h3>
                <span className="text-sm font-bold opacity-60">{brightness}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="120" 
                value={brightness} 
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-200/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
           </section>

           {/* Audio & Haptics */}
           <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className={`flex items-center justify-between p-6 ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-50'} rounded-3xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <div>
                  <h4 className="text-sm font-black uppercase">Sounds 🔊</h4>
                  <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest mt-1">Audio Feedback</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={sound} onChange={(e) => setSound(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className={`flex items-center justify-between p-6 ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-50'} rounded-3xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <div>
                  <h4 className="text-sm font-black uppercase">Vibration 📳</h4>
                  <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest mt-1">Global Haptics</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={vibration} onChange={(e) => setVibration(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
           </section>

           {/* Separate Haptic Vibrator Setting */}
           <section className="space-y-6">
              <div className={`flex items-center justify-between p-6 ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-50'} rounded-3xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase">Haptic Feedback Vibrator ⚡</h4>
                    <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest mt-1">Intensive vibration for interactions</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={hapticVibrator} onChange={(e) => setHapticVibrator(e.target.checked)} />
                  <div className="w-14 h-7 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
           </section>

           {/* Language */}
           <section className="space-y-6">
              <h3 className="text-lg font-black uppercase tracking-tight">Language Selection 🌍</h3>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => setLanguage('en')}
                  className={`p-5 rounded-2xl border-2 font-black transition-all ${language === 'en' ? 'border-indigo-500 bg-indigo-500 text-white shadow-xl' : (isDarkMode ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-100 text-slate-400 hover:border-slate-200')}`}
                 >
                   English
                 </button>
                 <button 
                  onClick={() => setLanguage('si')}
                  className={`p-5 rounded-2xl border-2 font-black transition-all ${language === 'si' ? 'border-indigo-500 bg-indigo-500 text-white shadow-xl' : (isDarkMode ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-100 text-slate-400 hover:border-slate-200')}`}
                 >
                   සිංහල
                 </button>
              </div>
           </section>

           {/* Theme Color */}
           <section className="space-y-6">
              <h3 className="text-lg font-black uppercase tracking-tight">Vibrator Visual Color 🎨</h3>
              <div className="flex gap-4">
                 {themeColors.map(color => (
                   <button 
                    key={color.id}
                    onClick={() => setThemeColor(color.id)}
                    className={`w-12 h-12 rounded-2xl transition-all border-4 ${themeColor === color.id ? (isDarkMode ? 'border-white' : 'border-slate-900') + ' scale-110 shadow-lg' : 'border-transparent hover:scale-105'} ${color.class}`}
                    aria-label={`Select ${color.id} color`}
                   />
                 ))}
              </div>
           </section>

           <div className={`pt-8 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-50'}`}>
              <button 
                onClick={() => setCurrentPage('home')}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 uppercase tracking-widest text-sm"
              >
                Save & Go Home
              </button>
           </div>
        </div>
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

export default SettingsPage;
