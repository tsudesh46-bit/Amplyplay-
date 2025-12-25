
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page, LevelStats } from '../../types';
import GaborCircle from '../GaborCircle';
import { HomeIcon, HeartIcon, HeartOutlineIcon, XCircleIcon, CheckCircleIcon, NextIcon, LogoIcon, RetryIcon } from '../ui/Icons';
import ConfirmationModal from '../ConfirmationModal';

// --- Helper Functions ---

const getEcgPattern = (midY: number, baseAmplitude: number) => {
  const p: number[] = [];
  const addSegment = (length: number, yFunc: (i: number) => number) => {
    for (let i = 0; i < length; i++) p.push(yFunc(i));
  };
  
  const oneBeat = (amplitude: number) => {
    addSegment(10, i => midY - (Math.sin(i / 10 * Math.PI) * 10 * amplitude));
    addSegment(5, () => midY);
    addSegment(5, i => midY + (i * 2.5 * amplitude));
    addSegment(10, i => midY + (12.5 * amplitude) - (i * 7.5 * amplitude));
    addSegment(10, i => (midY - 55 * amplitude) + (i * 9 * amplitude));
    addSegment(5, i => (midY + 26 * amplitude) - (i * 6.5 * amplitude));
    addSegment(20, i => midY - (Math.sin(i / 20 * Math.PI) * 35 * amplitude));
    addSegment(5, () => midY);
  };

  for(let i = 0; i < 20; i++) {
    const randomAmplitude = baseAmplitude * (0.8 + Math.random() * 0.4);
    const baselineLength = Math.floor(40 + Math.random() * 60);
    addSegment(baselineLength, () => midY);
    oneBeat(randomAmplitude);
  }
  return p;
};

const checkOverlap = (newPatch: {x: number, y: number}, existingPatches: {x: number, y: number}[], threshold: number = 20) => {
    for (const p of existingPatches) {
        const dx = p.x - newPatch.x;
        const dy = p.y - newPatch.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < threshold) return true;
    }
    return false;
};

const getEcgYPosition = () => {
    return 50 + (Math.random() * 4 - 2); 
};

// --- Helper Components ---

const SimpleECGCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let currentX = 0;
        let patternStep = 0;
        let pattern: number[] = [];

        const setup = () => {
             const parent = canvas.parentElement;
             if (!parent) return;
             canvas.width = parent.offsetWidth;
             canvas.height = parent.offsetHeight;
             const baseAmplitude = Math.min(canvas.height / 180, 2.5);
             pattern = getEcgPattern(canvas.height / 2, baseAmplitude);
             currentX = 0;
             patternStep = 0;
        };

        const draw = () => {
             const speed = 3;
             const clearX = (currentX + speed + 8) % canvas.width;
             ctx.clearRect(clearX, 0, 20, canvas.height);
             
             ctx.beginPath();
             ctx.strokeStyle = '#ef4444';
             ctx.lineWidth = 5; 
             ctx.lineJoin = 'round';
             ctx.lineCap = 'round';

             if (pattern.length === 0) {
                 animationFrameId = requestAnimationFrame(draw);
                 return;
             }

             let prevX = currentX % canvas.width;
             let prevY = pattern[patternStep % pattern.length];
             ctx.moveTo(prevX, prevY);

             for (let i = 1; i <= speed; i++) {
                 const nextX = (currentX + i) % canvas.width;
                 const nextY = pattern[(patternStep + i) % pattern.length];
                 if (nextX > prevX) {
                     ctx.lineTo(nextX, nextY);
                 } else {
                     ctx.stroke(); 
                     ctx.beginPath();
                     ctx.moveTo(nextX, nextY);
                 }
                 prevX = nextX;
             }
             ctx.stroke();

             currentX += speed;
             patternStep += speed;

             animationFrameId = requestAnimationFrame(draw);
        };

        setup();
        draw();
        
        const resizeObserver = new ResizeObserver(() => {
          setup();
        });
        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (canvas.parentElement) {
                resizeObserver.unobserve(canvas.parentElement);
            }
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />;
};

const ClickExplosion: React.FC<{ x: number; y: number; onComplete: () => void }> = ({ x, y, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div 
            className="fixed pointer-events-none z-50" 
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
        >
             {Array.from({ length: 16 }).map((_, i) => (
                 <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-cyan-500' : 'bg-teal-400'}`}
                    style={{
                        transform: `rotate(${i * 22.5}deg) translate(0, 0)`,
                        animation: `particle-burst-${i} 0.6s ease-out forwards`,
                        boxShadow: `0 0 6px ${i % 2 === 0 ? '#06b6d4' : '#2dd4bf'}`
                    }}
                 />
             ))}
             <style>{`
                ${Array.from({ length: 16 }).map((_, i) => `
                    @keyframes particle-burst-${i} {
                        0% { transform: rotate(${i * 22.5}deg) translate(0, 0) scale(1.5); opacity: 1; }
                        100% { transform: rotate(${i * 22.5}deg) translate(${50 + Math.random() * 50}px, 0) scale(0); opacity: 0; }
                    }
                `).join('')}
             `}</style>
        </div>
    );
};

const RingHomeButton: React.FC<{ onClick: () => void, className?: string }> = ({ onClick, className = "" }) => (
    <button
      onClick={onClick}
      className={`group relative w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-xl transition-transform hover:scale-110 focus:outline-none z-30 ${className}`}
      aria-label="Home"
    >
      <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
      <span className="absolute -inset-1 rounded-full border border-cyan-100 opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500 ease-out"></span>
      <HomeIcon className="w-8 h-8 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
    </button>
);

// --- Main Level 5 Component ---

interface Level5Props {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number, details?: Partial<LevelStats>) => void;
}

interface PeripheralPatch {
    id: string;
    type: 'gabor' | 'fake';
    size: number;
    x: number;
    y: number;
    side: 'top' | 'bottom';
}

interface CentralPatch {
    id: string;
    type: 'gabor' | 'fake';
    size: number;
    x: number;
    y: number;
    contrast?: number;
}

interface Explosion {
    id: string;
    x: number;
    y: number;
}

const Level5: React.FC<Level5Props> = ({ setCurrentPage, saveLevelCompletion }) => {
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'input' | 'feedback' | 'gameOver' | 'pausedManually'>('intro');
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    
    const [centralScore, setCentralScore] = useState(0); 
    const [peripheralScore, setPeripheralScore] = useState(0);
    const [centralLives, setCentralLives] = useState(3);
    const [peripheralLives, setPeripheralLives] = useState(3);
    
    const [centralInputValue, setCentralInputValue] = useState('');
    const [centralPatches, setCentralPatches] = useState<CentralPatch[]>([]);
    const [feedbackData, setFeedbackData] = useState<{isCorrect: boolean, count: number} | null>(null);
    const [centralCyclePhase, setCentralCyclePhase] = useState<'init' | 'spawn' | 'hold' | 'finished'>('init');
    const [peripheralPatches, setPeripheralPatches] = useState<PeripheralPatch[]>([]);
    const [distractorPatches, setDistractorPatches] = useState<PeripheralPatch[]>([]);
    const [explosions, setExplosions] = useState<Explosion[]>([]);

    const peripheralRoundTimerRef = useRef<number | null>(null);
    const targetCounterRef = useRef(0);
    const cyclesRemainingRef = useRef(0);
    const centralScoreRef = useRef(0);
    const peripheralScoreRef = useRef(0);

    useEffect(() => { centralScoreRef.current = centralScore; }, [centralScore]);
    useEffect(() => { peripheralScoreRef.current = peripheralScore; }, [peripheralScore]);

    useEffect(() => {
        if (gameState !== 'playing') {
            setCentralPatches([]);
            return;
        }

        let timer: ReturnType<typeof setTimeout>;

        const runLogic = () => {
            if (centralCyclePhase === 'init') {
                targetCounterRef.current = 0;
                cyclesRemainingRef.current = Math.floor(Math.random() * 5) + 3;
                setCentralCyclePhase('spawn');
            }
            else if (centralCyclePhase === 'spawn') {
                if (cyclesRemainingRef.current <= 0) {
                    setCentralCyclePhase('finished');
                    return;
                }
                cyclesRemainingRef.current -= 1;

                const currentScore = centralScoreRef.current;
                const fakeCount = 1 + Math.floor(currentScore / 3);
                const newPatches: CentralPatch[] = [];
                const patchesToSpawn = [
                    { type: 'gabor' },
                    ...Array(fakeCount).fill({ type: 'fake' })
                ];

                patchesToSpawn.forEach((p, i) => {
                    let attempts = 0;
                    let valid = false;
                    let x = 50, y = 50;
                    const size = 100 + Math.random() * 60; 

                    while (attempts < 20) {
                        x = Math.random() * 80 + 10;
                        y = Math.random() * 80 + 10;
                        if (!checkOverlap({x, y}, newPatches, 25)) {
                            valid = true;
                            break;
                        }
                        attempts++;
                    }

                    if (valid) {
                        const contrast = 0.3 + Math.random() * 0.7;
                        newPatches.push({
                            id: `c-${Date.now()}-${i}`,
                            type: p.type as 'gabor' | 'fake',
                            size, x, y, contrast
                        });
                        if (p.type === 'gabor') targetCounterRef.current += 1;
                    }
                });

                setCentralPatches(newPatches);
                timer = setTimeout(() => setCentralCyclePhase('hold'), 500);
            }
            else if (centralCyclePhase === 'hold') {
                setCentralPatches([]);
                timer = setTimeout(() => setCentralCyclePhase('spawn'), 500);
            }
            else if (centralCyclePhase === 'finished') {
                setCentralPatches([]);
                timer = setTimeout(() => setGameState('input'), 500);
            }
        };

        runLogic();
        return () => clearTimeout(timer);
    }, [centralCyclePhase, gameState]);

    const spawnPeripheralRound = useCallback(() => {
        const timestamp = Date.now();
        const existingPositions: {x: number, y: number}[] = [];
        const SAFE_DISTANCE = 18;

        const targetSide = Math.random() > 0.5 ? 'top' : 'bottom';
        const targetSize = Math.random() * 30 + 40; 
        const targetX = Math.random() * 80 + 10;
        const targetY = getEcgYPosition();
        existingPositions.push({ x: targetX, y: targetY });

        const newTarget: PeripheralPatch = {
            id: `p-target-${timestamp}`,
            type: 'gabor',
            size: targetSize, x: targetX, y: targetY, side: targetSide
        };
        
        const score = peripheralScoreRef.current;
        const totalDistractors = 2 + Math.floor(score / 5);
        const newDistractors: PeripheralPatch[] = [];
        
        for(let i=0; i<totalDistractors; i++) {
             const distSide = Math.random() > 0.5 ? 'top' : 'bottom';
             const distSize = Math.random() * 40 + 35; 
             let x = 50, y = 50;
             let attempts = 0;
             let valid = false;

             while(attempts < 20) {
                 x = Math.random() * 90 + 5;
                 y = getEcgYPosition();
                 if (!checkOverlap({x, y}, existingPositions, SAFE_DISTANCE)) {
                     valid = true;
                     break;
                 }
                 attempts++;
             }

             if (valid) {
                 existingPositions.push({x, y});
                 newDistractors.push({
                    id: `p-fake-${timestamp}-${i}`,
                    type: 'fake', size: distSize, x, y, side: distSide
                });
             }
        }
        setPeripheralPatches([newTarget]);
        setDistractorPatches(newDistractors);
    }, []);

    useEffect(() => {
        if (gameState === 'playing') {
            spawnPeripheralRound(); 
            peripheralRoundTimerRef.current = window.setInterval(spawnPeripheralRound, 3000);
        } else {
            if (peripheralRoundTimerRef.current) clearInterval(peripheralRoundTimerRef.current);
        }
        return () => {
            if (peripheralRoundTimerRef.current) clearInterval(peripheralRoundTimerRef.current);
        };
    }, [gameState, spawnPeripheralRound]);

    const handlePeripheralClick = (patch: PeripheralPatch, e: React.MouseEvent) => {
        if (gameState !== 'playing') return;
        
        if (patch.type === 'gabor') {
            setPeripheralScore(prev => prev + 1);
            const id = `exp-${Date.now()}`;
            setExplosions(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
            setPeripheralPatches(prev => prev.filter(p => p.id !== patch.id));
        } else {
            setPeripheralLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) endGame();
                return newLives;
            });
        }
    };

    const handleCentralSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const count = parseInt(centralInputValue);
        const actual = targetCounterRef.current;
        if (isNaN(count)) return;
        const correct = (count === actual);
        if (correct) setCentralScore(prev => prev + 1);
        setFeedbackData({ isCorrect: correct, count: actual });
        setGameState('feedback');
        setCentralInputValue('');
    };
    
    const endGame = () => {
        const total = centralScoreRef.current + peripheralScoreRef.current;
        let stars = 0;
        if (total > 15) stars = 3;
        else if (total > 8) stars = 2;
        else if (total > 3) stars = 1;

        saveLevelCompletion('level5', stars, {
          score: total,
          incorrect: (3 - centralLives) + (3 - peripheralLives),
          category: 'amblyo'
        });
        setGameState('gameOver');
    };

    const handleFeedbackContinue = () => {
        setCentralCyclePhase('init');
        setGameState('playing');
    };

    const handleFeedbackResume = () => {
        setCentralLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                 endGame();
                 return newLives;
            }
            setCentralCyclePhase('init');
            setGameState('playing');
            return newLives;
        });
    };

    const handleFeedbackExit = () => setShowExitConfirm(true);
    const handleHomeClick = () => { setGameState('pausedManually'); setShowExitConfirm(true); };
    const handleConfirmExit = () => setCurrentPage('home');
    const handleCancelExit = () => {
        setShowExitConfirm(false);
        if (gameState === 'pausedManually') setGameState('playing');
    };

    const retryLevel = () => {
        setCentralLives(3); setPeripheralLives(3);
        setCentralScore(0); setPeripheralScore(0);
        setCentralPatches([]); setPeripheralPatches([]); setDistractorPatches([]);
        setCentralCyclePhase('init');
        setGameState('playing');
    };

    if (gameState === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-50 p-4 relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center relative border border-white/50 animate-fade-in-up">
                     <div className="relative flex justify-center items-center mb-10 mt-2">
                         <div className="absolute w-40 h-40 rounded-full border border-cyan-100 animate-[spin_10s_linear_infinite]"></div>
                         <div className="absolute w-32 h-32 rounded-full border-2 border-cyan-200/60 animate-pulse"></div>
                         <div className="absolute w-28 h-28 rounded-full border border-teal-200 animate-[spin_8s_linear_infinite_reverse]"></div>
                         <div className="absolute w-20 h-20 bg-cyan-400/20 rounded-full blur-xl"></div>
                         <div className="relative z-10 bg-gradient-to-br from-white to-slate-50 p-3 rounded-full shadow-lg border border-cyan-100">
                             <LogoIcon className="w-14 h-14" />
                         </div>
                     </div>
                     <h1 className="text-2xl font-bold text-slate-800 mb-6 font-pixel tracking-tighter">LEVEL 05</h1>
                     <div className="space-y-3 mb-10 text-left">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-105">
                             <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">1</div>
                             <p className="text-slate-600 text-sm font-semibold leading-tight">Count central patterns</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-105">
                             <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">2</div>
                             <p className="text-slate-600 text-sm font-semibold leading-tight">Click wave targets</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-105">
                             <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">3</div>
                             <p className="text-slate-600 text-sm font-semibold leading-tight">Watch score & lives</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                         <button onClick={() => setCurrentPage('home')} className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm">
                              <HomeIcon className="w-6 h-6" />
                         </button>
                         <button onClick={() => { setGameState('playing'); setCentralCyclePhase('init'); }} className="flex-1 h-14 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 tracking-wide">
                              START
                         </button>
                     </div>
                </div>
            </div>
        );
    }

    const renderPeripheralArea = (side: 'top' | 'bottom') => {
        const targetPatches = peripheralPatches.filter(p => p.side === side);
        const distractors = distractorPatches.filter(p => p.side === side);
        const allPatches = [...targetPatches, ...distractors];
        const dynamicContrast = Math.max(0.2, 1.0 - (peripheralScore * 0.05));

        return (
             <div className={`flex-1 relative bg-black flex items-center justify-center overflow-hidden border-${side === 'top' ? 'b' : 't'} border-slate-700`}>
                <SimpleECGCanvas />
                {allPatches.map(patch => (
                    <div key={patch.id} className="absolute animate-pop-in z-20" style={{ left: `${patch.x}%`, top: `${patch.y}%`, transform: 'translate(-50%, -50%)' }}>
                         <GaborCircle 
                             size={patch.size} contrast={dynamicContrast} onClick={(e) => handlePeripheralClick(patch, e)}
                             style={patch.type === 'fake' ? { backgroundImage: 'none', backgroundColor: '#888', boxShadow: '0 0 10px rgba(136,136,136,0.5)', border: 'none' } : { boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                         />
                    </div>
                ))}
             </div>
        );
    };

    return (
        <div className="flex flex-col h-screen w-full bg-slate-50 font-sans select-none overflow-hidden relative">
            <header className="flex-none p-3 bg-gradient-to-r from-cyan-600 to-teal-400 shadow-md z-10 flex justify-between items-center text-white">
                 <div className="flex items-center gap-6">
                     <RingHomeButton onClick={handleHomeClick} />
                     <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-xl flex flex-col items-center min-w-[90px] shadow-sm">
                           <div className="text-[10px] font-bold text-cyan-50 uppercase tracking-wider">Score</div>
                           <div className="text-2xl font-bold leading-none drop-shadow-sm">{centralScore + peripheralScore}</div>
                      </div>
                 </div>
                 <div className="flex gap-6 pr-2">
                     <div className="flex flex-col items-center">
                         <div className="flex items-center gap-1">
                             {Array.from({length:3}).map((_, i) => (i < centralLives ? <HeartIcon key={i} className="w-7 h-7 fill-current text-blue-600 drop-shadow-md stroke-white stroke-1"/> : <HeartOutlineIcon key={i} className="w-7 h-7 opacity-50 text-blue-100"/>))}
                         </div>
                         <div className="text-[10px] font-bold text-cyan-50 uppercase mt-1 tracking-wider">Cen. Task</div>
                     </div>
                     <div className="flex flex-col items-center">
                         <div className="flex items-center gap-1">
                             {Array.from({length:3}).map((_, i) => (i < peripheralLives ? <HeartIcon key={i} className="w-7 h-7 fill-current text-red-600 drop-shadow-md stroke-white stroke-1"/> : <HeartOutlineIcon key={i} className="w-7 h-7 opacity-50 text-red-100"/>))}
                         </div>
                         <div className="text-[10px] font-bold text-cyan-50 uppercase mt-1 tracking-wider">Peri. Task</div>
                     </div>
                  </div>
            </header>
            <main className="flex-grow flex flex-col relative overflow-hidden">
                 {renderPeripheralArea('top')}
                 <div className="flex-1 relative bg-white flex items-center justify-center overflow-hidden border-y-4 border-slate-200">
                     {centralPatches.map(patch => (
                         <div key={patch.id} className="absolute rounded-full animate-pop-in" style={{ left: `${patch.x}%`, top: `${patch.y}%`, width: patch.size, height: patch.size, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                             {patch.type === 'gabor' ? (
                                 <GaborCircle size={patch.size} contrast={patch.contrast || 1.0} onClick={()=>{}} className="pointer-events-none shadow-xl" />
                             ) : (
                                 <div className="w-full h-full rounded-full" style={{ backgroundColor: '#888', opacity: patch.contrast || 0.5, boxShadow: '0 0 10px rgba(136,136,136,0.5)' }} />
                             )}
                         </div>
                     ))}
                 </div>
                 {renderPeripheralArea('bottom')}
                 {explosions.map(exp => (
                     <ClickExplosion key={exp.id} x={exp.x} y={exp.y} onComplete={() => setExplosions(prev => prev.filter(e => e.id !== exp.id))} />
                 ))}
            </main>
            {gameState === 'input' && (
                <div className="absolute inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md border border-white/40 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
                         <h2 className="text-2xl font-bold text-slate-800 mb-4 drop-shadow-sm">Count Check!</h2>
                         <p className="text-lg text-slate-700 font-bold mb-6">How many <span className="text-cyan-700">Pattern Patches</span>?</p>
                         <form onSubmit={handleCentralSubmit}>
                             <input type="number" autoFocus value={centralInputValue} onChange={e => setCentralInputValue(e.target.value)} className="w-full text-center text-4xl p-4 bg-white/40 border-2 border-white/50 rounded-xl focus:border-cyan-400 outline-none mb-6 font-bold text-slate-800 placeholder-slate-500 shadow-inner" placeholder="#" />
                             <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl transition text-xl shadow-lg border border-white/20">Submit</button>
                         </form>
                    </div>
                </div>
            )}
            {gameState === 'feedback' && feedbackData && (
                 <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-md flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
                        {feedbackData.isCorrect ? (
                            <>
                                <CheckCircleIcon className="w-20 h-20 text-teal-400 mx-auto mb-4 drop-shadow-md" />
                                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Correct!</h2>
                                <p className="text-white/80 mb-8">Count was {feedbackData.count}</p>
                                <button onClick={handleFeedbackContinue} className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg">Continue <NextIcon className="w-5 h-5"/></button>
                            </>
                        ) : (
                            <>
                                <XCircleIcon className="w-20 h-20 text-rose-500 mx-auto mb-4 drop-shadow-md" />
                                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Incorrect</h2>
                                <p className="text-white/80 mb-8">Correct count was {feedbackData.count}</p>
                                <div className="flex gap-4">
                                     <button onClick={handleFeedbackResume} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg">Resume</button>
                                     <button onClick={handleFeedbackExit} className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg">Exit</button>
                                </div>
                            </>
                        )}
                    </div>
                 </div>
            )}
            {gameState === 'gameOver' && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full animate-fade-in-up">
                        <XCircleIcon className="w-20 h-20 text-rose-500 mx-auto mb-4" />
                        <h2 className="text-4xl font-bold text-slate-800 mb-2">Game Over</h2>
                        <div className="bg-slate-100 p-4 rounded-xl mb-8">
                             <p className="text-sm text-slate-500 uppercase">Final Score</p>
                             <p className="text-4xl font-bold text-cyan-600">{centralScore + peripheralScore}</p>
                        </div>
                        <div className="flex gap-4">
                             <button onClick={handleHomeClick} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2"><HomeIcon className="w-5 h-5"/> Menu</button>
                             <button onClick={retryLevel} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"><RetryIcon className="w-5 h-5"/> Retry</button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmationModal isOpen={showExitConfirm} title="Confirm Exit" message="Do you want to exit to the Main Menu?" onConfirm={handleConfirmExit} onCancel={handleCancelExit} confirmText="Exit" />
        </div>
    );
};

export default Level5;
