
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Page, LevelStats } from '../types';
import { HomeIcon, CheckCircleIcon, XCircleIcon, RetryIcon } from './ui/Icons';
import ConfirmationModal from './ConfirmationModal';

interface PerceptualPageProps {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number, details?: Partial<LevelStats>) => void;
  setPerformanceFilter: (filter: 'all' | 'amblyo' | 'strab' | 'percep') => void;
  isDarkMode?: boolean;
}

// --- Unique Shape Generator for 15 Items ---
const DiscriminationShape: React.FC<{ type: string; id: number; className?: string }> = ({ type, id, className = "w-24 h-24" }) => {
  const strokeColor = "#1e293b"; // Reverted to fixed clinical dark stroke
  const strokeWidth = "2.5";

  switch (type) {
    // EASY (1-5)
    case 'E1': { // Basic Cross
        const confs = [90, 0, 45, 90, 180, 0];
        return <svg className={className} style={{ transform: `rotate(${confs[id]}deg)` }} viewBox="0 0 100 100"><line x1="20" y1="50" x2="80" y2="50" stroke={strokeColor} strokeWidth={strokeWidth}/><line x1="50" y1="20" x2="50" y2="80" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    case 'E2': { // Circle with line
        const confs = [180, 0, 90, 180, 270, 45];
        return <svg className={className} style={{ transform: `rotate(${confs[id]}deg)` }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/><line x1="50" y1="20" x2="50" y2="50" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    case 'E3': { // Triangle with dot
        const confs = [0, 90, 180, 0, 270, 45];
        return <svg className={className} style={{ transform: `rotate(${confs[id]}deg)` }} viewBox="0 0 100 100"><path d="M50 20 L80 80 L20 80 Z" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/><circle cx="50" cy="60" r="3" fill={strokeColor}/></svg>;
    }
    case 'E4': { // Square with diagonal
        const confs = [0, 90, 180, 0, 45, 270];
        return <svg className={className} style={{ transform: `rotate(${confs[id]}deg)` }} viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/><line x1="25" y1="25" x2="75" y2="75" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    case 'E5': { // L-Shape
        const confs = [90, 0, 45, 90, 180, 270];
        return <svg className={className} style={{ transform: `rotate(${confs[id]}deg)` }} viewBox="0 0 100 100"><path d="M30 30 V70 H70" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    // MEDIUM (6-10)
    case 'M1': { // Double overlapping squares
        const confs = [1, 2, 3, 1, 2, 3];
        return <svg className={className} viewBox="0 0 100 100"><rect x="20" y="20" width="40" height="40" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/><rect x={confs[id] === 1 ? 40 : 35} y={confs[id] === 1 ? 40 : 35} width="40" height="40" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    case 'M2': { // Arrows
        const confs = [90, 0, 45, 90, 135, 180];
        return <svg className={className} style={{ transform: `rotate(${confs[id]}deg)` }} viewBox="0 0 100 100"><path d="M30 50 H70 M60 40 L70 50 L60 60" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/><path d="M30 30 H50" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    case 'M3': { // Hexagon with mid line
        const confs = [0, 30, 60, 0, 90, 120];
        return <svg className={className} style={{ transform: `rotate(${confs[id]}deg)` }} viewBox="0 0 100 100"><path d="M50 20 L80 35 V65 L50 80 L20 65 V35 Z" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/><line x1="20" y1="50" x2="80" y2="50" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    case 'M4': { // Concentric Arcs
        const confs = [180, 0, 90, 180, 270, 45];
        return <svg className={className} style={{ transform: `rotate(${confs[id]}deg)` }} viewBox="0 0 100 100"><path d="M30 50 A20 20 0 0 1 70 50" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/><path d="M20 50 A30 30 0 0 1 80 50" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    case 'M5': { // Plus in Diamond
        const confs = [0, 45, 90, 0, 30, 60];
        return <svg className={className} style={{ transform: `rotate(${confs[id]}deg)` }} viewBox="0 0 100 100"><path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/><line x1="40" y1="50" x2="60" y2="50" stroke={strokeColor} strokeWidth={strokeWidth}/><line x1="50" y1="40" x2="50" y2="60" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    // HARD (11-15)
    case 'H1': { // Complex polygon 1
        const paths = [
            "M30 30 H70 V70 L50 50 L30 70 Z",
            "M30 30 H70 V70 H30 L50 50 Z",
            "M30 30 H70 V70 L50 60 L30 70 Z",
            "M30 30 H70 V70 L50 50 L30 70 Z",
            "M30 30 L50 40 L70 30 V70 H30 Z",
            "M30 70 H70 V30 L50 50 L30 30 Z"
        ];
        return <svg className={className} viewBox="0 0 100 100"><path d={paths[id]} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    case 'H2': { // Perspective Box variation
        const vars = [
            "M30 40 L45 25 H85 V55 L70 70",
            "M30 40 L15 25 H55 V55 L70 70",
            "M30 40 L45 25 H85 V65 L70 80",
            "M30 40 L45 25 H85 V55 L70 70",
            "M30 40 L55 25 H95 V55 L70 70",
            "M20 40 L35 25 H75 V55 L60 70"
        ];
        return <svg className={className} viewBox="0 0 100 100"><rect x="30" y="40" width="40" height="30" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/><path d={vars[id]} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/></svg>;
    }
    case 'H3': { // Nested intricate
        const confs = [1, 2, 3, 1, 4, 5];
        return (
            <svg className={className} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/>
                <path d={confs[id] === 1 ? "M40 40 L60 60 M40 60 L60 40" : "M35 50 H65 M50 35 V65"} stroke={strokeColor} strokeWidth={strokeWidth}/>
                <circle cx={confs[id] % 2 === 0 ? 50 : 35} cy="35" r="4" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/>
            </svg>
        );
    }
    case 'H4': { // Grid segment
        const confs = [1, 2, 3, 1, 4, 5];
        return (
            <svg className={className} viewBox="0 0 100 100">
                <path d="M20 20 H80 V80 H20 Z M20 50 H80 M50 20 V80" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/>
                {confs[id] === 1 && <circle cx="35" cy="35" r="5" fill={strokeColor}/>}
                {confs[id] === 2 && <circle cx="65" cy="35" r="5" fill={strokeColor}/>}
                {confs[id] === 3 && <circle cx="35" cy="65" r="5" fill={strokeColor}/>}
                {confs[id] === 4 && <circle cx="65" cy="65" r="5" fill={strokeColor}/>}
                {confs[id] === 5 && <rect x="30" y="30" width="10" height="10" fill={strokeColor}/>}
            </svg>
        );
    }
    case 'H5': { // Abstract segments
        const vars = [1, 2, 3, 1, 4, 5];
        return (
            <svg className={className} viewBox="0 0 100 100">
                <path d="M20 50 Q50 20 80 50" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/>
                <path d={vars[id] === 1 ? "M20 50 Q50 80 80 50" : "M20 60 Q50 90 80 60"} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/>
                <circle cx={vars[id] > 2 ? 50 : 20} cy="50" r="3" fill={strokeColor}/>
            </svg>
        );
    }
    default: return null;
  }
};

const DiscriminationPractice: React.FC<{ 
    onComplete: (score: number, errors: number) => void; 
    onExit: () => void;
}> = ({ onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  // 15 items shuffled
  const items = useMemo(() => {
    const list = [
        { type: 'E1', correct: 3 }, { type: 'E2', correct: 3 }, { type: 'E3', correct: 3 }, { type: 'E4', correct: 3 }, { type: 'E5', correct: 3 },
        { type: 'M1', correct: 3 }, { type: 'M2', correct: 3 }, { type: 'M3', correct: 3 }, { type: 'M4', correct: 3 }, { type: 'M5', correct: 3 },
        { type: 'H1', correct: 3 }, { type: 'H2', correct: 3 }, { type: 'H3', correct: 3 }, { type: 'H4', correct: 3 }, { type: 'H5', correct: 3 },
    ];
    return [...list].sort(() => Math.random() - 0.5);
  }, []);

  const currentItem = items[currentIndex];

  useEffect(() => {
    if (isExitConfirmOpen) return;
    if (timeLeft <= 0) {
      handleNext(true); // Time's up is an error
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isExitConfirmOpen]);

  const handleNext = (timedOut: boolean = false) => {
    const isCorrect = !timedOut && selectedOption === currentItem.correct;
    
    const finalCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    const finalErrorCount = isCorrect ? errorCount : errorCount + 1;

    if (isCorrect) setCorrectCount(prev => prev + 1);
    else setErrorCount(prev => prev + 1);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(15);
    } else {
      onComplete(finalCorrectCount, finalErrorCount);
    }
  };

  // Reverted to pure light theme classes
  return (
    <div className="flex flex-col items-center w-full min-h-screen max-w-5xl mx-auto py-8 px-4 animate-fade-in bg-slate-50 text-slate-900">
      <div className="w-full flex justify-between items-center mb-12 p-6 rounded-3xl shadow-sm border bg-white border-slate-100">
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
            <span className="text-2xl font-black font-mono text-slate-800">ITEM {currentIndex + 1} / 15</span>
        </div>
        
        {/* Timer UI */}
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Remaining</span>
            <div className={`text-4xl font-black font-mono ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-cyan-600'}`}>
                {timeLeft}s
            </div>
        </div>

        <div className="flex gap-8">
            <div className="text-center">
                <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Correct</span>
                <div className="text-2xl font-black text-teal-600">{correctCount}</div>
            </div>
            <div className="text-center">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Errors</span>
                <div className="text-2xl font-black text-rose-500">{errorCount}</div>
            </div>
        </div>
      </div>

      <div className="p-12 rounded-[3rem] shadow-xl border-2 mb-16 w-full flex flex-col items-center relative overflow-hidden bg-white border-slate-50">
        <div className="absolute top-4 left-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Target Form</div>
        <div className="p-4 border-4 border-dashed rounded-[2rem] border-slate-100 bg-slate-50/30">
          <DiscriminationShape type={currentItem.type} id={0} className="w-48 h-48" />
        </div>
      </div>

      <div className="w-full grid grid-cols-5 gap-6 mb-16">
        {[1, 2, 3, 4, 5].map((opt) => (
          <div key={opt} className="flex flex-col items-center gap-6">
            <div 
              onClick={() => setSelectedOption(opt)}
              className={`w-full aspect-square rounded-[2rem] shadow-md border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${selectedOption === opt ? 'border-cyan-500 bg-cyan-50/30 shadow-cyan-100' : 'bg-white border-slate-50'}`}
            >
              <DiscriminationShape type={currentItem.type} id={opt} className="w-20 h-20" />
            </div>
            <button 
              onClick={() => setSelectedOption(opt)}
              className="flex flex-col items-center group"
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === opt ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-slate-200 text-slate-400 group-hover:border-cyan-300'}`}>
                <span className="text-xs font-black">{opt}</span>
              </div>
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={() => handleNext(false)}
        disabled={selectedOption === null}
        className={`w-full max-w-sm py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${selectedOption !== null ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
      >
        {currentIndex === 14 ? 'Finish Session' : 'Continue to Next Item'}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </button>

      {/* Confirmation on Practice Home Button */}
      <button onClick={() => setIsExitConfirmOpen(true)} className="fixed bottom-8 right-8 group w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-2xl transition-transform hover:scale-110 focus:outline-none z-50 border border-slate-50">
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        <HomeIcon className="w-10 h-10 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
      </button>

      <ConfirmationModal 
        isOpen={isExitConfirmOpen} 
        title="Confirm Exit" 
        message="Progress will be lost. Return to menu?" 
        onConfirm={onExit} 
        onCancel={() => setIsExitConfirmOpen(false)} 
      />
    </div>
  );
};

const PerceptualModuleCard: React.FC<{
  number: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  delay: string;
  onBegin: () => void;
  isDarkMode?: boolean;
}> = ({ number, title, category, description, icon, delay, onBegin, isDarkMode }) => (
  <div 
    className={`${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-none hover:border-cyan-500' : 'bg-white border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:border-cyan-100'} rounded-[1.5rem] p-8 border flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 animate-fade-in-up`}
    style={{ animationDelay: delay }}
  >
    <div className={`absolute top-0 right-4 text-[7rem] font-black select-none pointer-events-none group-hover:opacity-[0.06] transition-opacity ${isDarkMode ? 'text-slate-800 opacity-[0.05]' : 'text-slate-50 opacity-[0.03]'}`}>
      {number}
    </div>

    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 group-hover:bg-cyan-900/30 group-hover:border-cyan-500/50' : 'bg-slate-50 border-slate-100 group-hover:bg-cyan-50 group-hover:border-cyan-100'}`}>
      <div className={`transition-colors ${isDarkMode ? 'text-slate-400 group-hover:text-cyan-400' : 'text-slate-500 group-hover:text-cyan-500'}`}>
        {icon}
      </div>
    </div>

    <div className="flex-grow">
      <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h3>
      <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-4">{category}</p>
      <p className="text-sm font-medium leading-relaxed max-w-[240px] text-slate-400">
        {description}
      </p>
    </div>

    <div onClick={onBegin} className="mt-10 flex items-center justify-between group/action cursor-pointer">
      <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-600 group-hover:text-cyan-400' : 'text-slate-300 group-hover:text-cyan-600'}`}>BEGIN ITEM #{number}</span>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-800 text-slate-600 group-hover/action:bg-cyan-500 group-hover/action:text-white' : 'bg-slate-50 text-slate-300 group-hover/action:bg-cyan-500 group-hover/action:text-white'}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </div>
    </div>
  </div>
);

const PerceptualPage: React.FC<PerceptualPageProps> = ({ setCurrentPage, saveLevelCompletion, setPerformanceFilter, isDarkMode }) => {
  const [activeModule, setActiveModule] = useState<'list' | 'discrimination' | 'summary'>('list');
  const [finalResult, setFinalResult] = useState({ score: 0, errors: 0 });

  const modules = [
    {
      number: "01",
      title: "Visual Discrimination",
      category: "DISCRIMINATION",
      description: "Match or determine characteristics of forms.",
      icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><circle cx="17" cy="17" r="3"/></svg>,
      delay: "0.1s",
      id: 'discrimination'
    },
    {
      number: "02",
      title: "Visual Memory",
      category: "MEMORY",
      description: "Immediate recall of characteristics of a form.",
      icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A1.5 1.5 0 0 0 8 3.5v7A1.5 1.5 0 0 0 9.5 12H11l.5.5V14a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1.5H5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 5 22h14a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 19 13h-1.5V14a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1.5l.5-.5h1.5a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 2h-5z"/></svg>,
      delay: "0.2s",
      id: 'memory'
    },
    {
      number: "03",
      title: "Spatial Relationships",
      category: "SPATIAL",
      description: "Orientations in space of different forms.",
      icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>,
      delay: "0.3s",
      id: 'spatial'
    },
    {
      number: "04",
      title: "Form Constancy",
      category: "CONSTANCY",
      description: "Recognize form across size or color changes.",
      icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l9 4.5V17.5L12 22 3 17.5V6.5L12 2z"/><path d="M12 22V12"/><path d="M21 6.5L12 12 3 6.5"/></svg>,
      delay: "0.4s",
      id: 'constancy'
    },
    {
      number: "05",
      title: "Sequential Memory",
      category: "SEQUENTIAL",
      description: "Immediate recall of forms in specific order.",
      icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>,
      delay: "0.5s",
      id: 'sequential'
    },
    {
      number: "06",
      title: "Figure-Ground",
      category: "FIGURE-GROUND",
      description: "Find forms hidden in complex backgrounds.",
      icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
      delay: "0.6s",
      id: 'figure-ground'
    },
    {
      number: "07",
      title: "Visual Closure",
      category: "CLOSURE",
      description: "Identify incomplete or partially hidden forms.",
      icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM4.93 4.93l14.14 14.14"/></svg>,
      delay: "0.7s",
      id: 'closure'
    }
  ];

  const handleComplete = (score: number, errors: number) => {
    setFinalResult({ score, errors });
    
    // Calculate stars
    let stars = 0;
    const accuracy = (score / 15) * 100;
    if (accuracy >= 90) stars = 3;
    else if (accuracy >= 60) stars = 2;
    else if (accuracy >= 30) stars = 1;

    // Save to global progress
    saveLevelCompletion('perceptual_disc', stars, { 
        score, 
        incorrect: errors, 
        category: 'percep'
    });

    setActiveModule('summary');
  };

  const navigateToStats = () => {
    setPerformanceFilter('percep');
    setCurrentPage('performance');
  };

  // The practice session is always in light theme
  if (activeModule === 'discrimination') {
    return <DiscriminationPractice onComplete={handleComplete} onExit={() => setActiveModule('list')} />;
  }

  // The summary view is always in light theme
  if (activeModule === 'summary') {
    const isSuccess = finalResult.score >= 10;
    return (
      <div className="min-h-screen flex items-center justify-center p-8 animate-fade-in bg-slate-50">
        <div className="p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center border-t-8 border-cyan-500 bg-white">
          <div className="mb-8">
            {isSuccess ? <CheckCircleIcon className="w-24 h-24 mx-auto text-teal-500" /> : <XCircleIcon className="w-24 h-24 mx-auto text-rose-500" />}
          </div>
          <h2 className="text-3xl font-black mb-2 tracking-tight uppercase text-slate-800">Results Summary</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Visual Discrimination Module</p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-6 rounded-3xl bg-slate-50">
              <div className="text-4xl font-black text-teal-600 font-mono">{finalResult.score}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase mt-1">Correct</div>
            </div>
            <div className="p-6 rounded-3xl bg-slate-50">
              <div className="text-4xl font-black text-rose-500 font-mono">{finalResult.errors}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase mt-1">Errors</div>
            </div>
          </div>

          <button 
            onClick={() => setActiveModule('discrimination')}
            className="w-full font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs mb-4 bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 shadow-xl"
          >
            <RetryIcon className="w-5 h-5" /> Retake Practice
          </button>
          <button 
            onClick={() => setActiveModule('list')}
            className="w-full font-black py-5 rounded-[2rem] transition-all uppercase tracking-widest text-xs bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  // Only the main "list" page respects isDarkMode
  return (
    <div className={`min-h-screen flex flex-col font-sans overflow-x-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#fcfdfe] text-slate-900'}`}>
      <header className={`w-full h-20 border-b flex items-center justify-between px-6 sm:px-12 sticky top-0 z-50 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20">V</div>
          <div className="flex flex-col -space-y-1">
             <span className={`text-sm font-black tracking-tight uppercase ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>VISUAL <span className="text-cyan-500">PERCEPTUAL PRACTICE</span></span>
             <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Diagnostic Protocol TVPS-3</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${isDarkMode ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-cyan-50 border-cyan-100'}`}>
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>Clinical Mode Active</span>
           </div>
           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border cursor-pointer transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'}`}>
              DR
           </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 sm:px-12 py-16 flex flex-col">
        <div className="text-center mb-20 animate-fade-in-up">
           <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full mb-6 border ${isDarkMode ? 'bg-cyan-950/30 border-cyan-900/50' : 'bg-cyan-50 border-cyan-100'}`}>
              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>Diagnostic Protocol TVPS-3</span>
           </div>
           <h1 className={`text-5xl font-black tracking-tighter mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Practice Assessment Modules</h1>
           <p className="text-slate-400 font-bold text-lg max-w-2xl mx-auto">
             Select a clinical domain below to begin your visual perceptual evaluation. 
             Exercises are calibrated for clinical accuracy.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-20">
          {modules.map((mod) => (
            <PerceptualModuleCard 
                key={mod.number} 
                {...mod} 
                onBegin={() => mod.id === 'discrimination' && setActiveModule('discrimination')}
                isDarkMode={isDarkMode}
            />
          ))}
        </div>

        {/* View Status section (integrated in dashboard but summary provided in Performance Overview banner) */}
        <div className={`rounded-[2.5rem] p-10 sm:p-14 shadow-2xl relative overflow-hidden group animate-fade-in-up transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-[#040a1e]'}`} style={{ animationDelay: '0.8s' }}>
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-cyan-500/10"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left">
                 <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Performance Overview</h2>
                 <p className="text-slate-400 font-bold max-w-md leading-relaxed">
                   Review historical data analytics, accuracy trends, and visual acuity progression from previous practice sessions.
                 </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                 <button 
                    onClick={navigateToStats}
                    className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-3 shadow-xl active:scale-95 group/btn"
                 >
                    <svg className="w-5 h-5 fill-current group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    View Stats
                 </button>
                 <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Real-time Sync Active</span>
                 </div>
              </div>
           </div>

           <div className="absolute bottom-4 right-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <svg className="w-14 h-14 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
           </div>
        </div>
      </main>

      <button
        onClick={() => setCurrentPage('home')}
        className={`fixed bottom-8 right-8 group w-16 h-16 rounded-full flex items-center justify-center shadow-[0_15px_45px_rgba(0,0,0,0.15)] transition-all hover:scale-110 active:scale-95 focus:outline-none z-[60] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}
        aria-label="Home"
      >
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        <span className="absolute -inset-2 rounded-full border border-cyan-100 opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500 ease-out"></span>
        <HomeIcon className="w-10 h-10 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
      </button>

      <footer className="w-full py-12 border-t border-slate-100 text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Vision Therapy Core • Clinical Diagnostics v1.01</p>
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PerceptualPage;
