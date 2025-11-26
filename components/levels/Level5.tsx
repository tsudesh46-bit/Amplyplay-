
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page } from '../../types';
import GaborCircle from '../GaborCircle';
import { HomeIcon, HeartIcon, HeartOutlineIcon, XCircleIcon, CheckCircleIcon, NextIcon, PlayIcon } from '../ui/Icons';
import { RetryIcon } from '../ui/Icons';
import ConfirmationModal from '../ConfirmationModal';

// --- Helper Functions ---

const getEcgPattern = (midY: number, baseAmplitude: number) => {
  const p: number[] = [];
  const addSegment = (length: number, yFunc: (i: number) => number) => {
    for (let i = 0; i < length; i++) p.push(yFunc(i));
  };
  
  const oneBeat = (amplitude: number) => {
    // P wave (up)
    addSegment(10, i => midY - (Math.sin(i / 10 * Math.PI) * 10 * amplitude));
    addSegment(5, () => midY);
    // Q wave (down)
    addSegment(5, i => midY + (i * 2.5 * amplitude));
    // R wave (up)
    addSegment(10, i => midY + (12.5 * amplitude) - (i * 7.5 * amplitude));
    // S wave (down)
    addSegment(10, i => (midY - 55 * amplitude) + (i * 9 * amplitude));
    addSegment(5, i => (midY + 26 * amplitude) - (i * 6.5 * amplitude));
    // T wave (up)
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

const checkOverlap = (newPatch: {x: number, y: number}, existingPatches: {x: number, y: number}[]) => {
    // Patches are positioned by center % (x, y).
    // Assume a safety threshold distance in %. 
    // 150px on a typical screen is roughly 15-20%. We use 22% to be safe and avoid overlap.
    const THRESHOLD = 22; 
    for (const p of existingPatches) {
        const dx = p.x - newPatch.x;
        const dy = p.y - newPatch.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < THRESHOLD) return true;
    }
    return false;
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
             ctx.strokeStyle = '#ef4444'; // Red-500
             ctx.lineWidth = 5; // Thicker line
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
             {/* Particles - Updated to Brand Colors (Cyan/Teal) */}
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

// --- Home Button Component (Level 3 Style) ---
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
  saveLevelCompletion: (levelId: string, stars: number) => void;
}

interface PeripheralPatch {
    id: string;
    type: 'gabor' | 'fake';
    size: number;
    x: number; // Percent 0-100
    y: number; // Percent 0-100 (Relative to container)
    side: 'top' | 'bottom';
}

interface CentralPatch {
    id: string;
    type: 'gabor' | 'fake';
    size: number;
    x: number; // Percent 0-100
    y: number; // Percent 0-100
    contrast?: number;
}

interface Explosion {
    id: string;
    x: number;
    y: number;
}

const Level5: React.FC<Level5Props> = ({ setCurrentPage }) => {
    // 'feedback' state added to show Correct/Incorrect result
    const [gameState, setGameState] = useState<'playing' | 'input' | 'feedback' | 'gameOver' | 'pausedManually'>('playing');
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    
    // Scores
    const [centralScore, setCentralScore] = useState(0); 
    const [peripheralScore, setPeripheralScore] = useState(0);
    
    // Lives - Split into Central and Peripheral
    const [centralLives, setCentralLives] = useState(3);
    const [peripheralLives, setPeripheralLives] = useState(3);
    
    // Central Counting Task Logic
    const [centralInputValue, setCentralInputValue] = useState('');
    const [roundTimeLeft, setRoundTimeLeft] = useState(0);
    const [isRoundActive, setIsRoundActive] = useState(false);
    const [centralPatches, setCentralPatches] = useState<CentralPatch[]>([]);
    const [feedbackData, setFeedbackData] = useState<{isCorrect: boolean, count: number} | null>(null);
    
    // Peripheral Logic
    const [peripheralPatches, setPeripheralPatches] = useState<PeripheralPatch[]>([]);
    const [contrast, setContrast] = useState(1.0);
    const [explosions, setExplosions] = useState<Explosion[]>([]);

    // Refs
    const roundTimerRef = useRef<number | null>(null);
    const centralSpawnTimerRef = useRef<number | null>(null);
    const peripheralSpawnTimerRef = useRef<number | null>(null);
    const targetCounterRef = useRef(0);
    const centralPatchesRef = useRef<CentralPatch[]>([]); // To track current patches for overlap in async calls

    useEffect(() => {
        centralPatchesRef.current = centralPatches;
    }, [centralPatches]);

    // Start a new counting round
    const startCentralRound = useCallback(() => {
        const duration = Math.floor(Math.random() * 30) + 20; // 20-50 seconds (less than 60)
        setRoundTimeLeft(duration);
        targetCounterRef.current = 0;
        setCentralPatches([]);
        setIsRoundActive(true);
        setCentralInputValue('');
        setGameState('playing');
        setFeedbackData(null);

        if (roundTimerRef.current) clearInterval(roundTimerRef.current);
        roundTimerRef.current = window.setInterval(() => {
            setRoundTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(roundTimerRef.current!);
                    clearInterval(centralSpawnTimerRef.current!);
                    setCentralPatches([]);
                    setGameState('input');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        if (centralSpawnTimerRef.current) clearInterval(centralSpawnTimerRef.current);
        
        // Continuous Random Spawning
        centralSpawnTimerRef.current = window.setInterval(() => {
            // Chance to spawn a patch every tick
            if (Math.random() > 0.4) {
                // Base size: 2cm radius ~ 4cm diameter ~ 150px
                const baseSize = 150; 
                
                let attempts = 0;
                let x = 50, y = 50;
                let validPos = false;

                // Try to find a non-overlapping position
                while(attempts < 15) {
                    x = Math.random() * 80 + 10;
                    y = Math.random() * 80 + 10;
                    if (!checkOverlap({x, y}, centralPatchesRef.current)) {
                        validPos = true;
                        break;
                    }
                    attempts++;
                }

                if (validPos) {
                    // Decide type: 40% Target, 60% Fake
                    const isTarget = Math.random() < 0.4;
                    const id = `c-${isTarget ? 'target' : 'fake'}-${Date.now()}-${Math.random()}`;
                    
                    const newPatch: CentralPatch = {
                        id,
                        type: isTarget ? 'gabor' : 'fake',
                        size: baseSize,
                        x,
                        y,
                        contrast: isTarget ? (0.5 + Math.random() * 0.5) : 1
                    };

                    if (isTarget) {
                        targetCounterRef.current += 1;
                    }

                    setCentralPatches(prev => [...prev, newPatch]);

                    // Schedule removal after lifetime (1.5s - 2.5s)
                    const lifeTime = 1500 + Math.random() * 1000;
                    setTimeout(() => {
                        setCentralPatches(prev => prev.filter(p => p.id !== id));
                    }, lifeTime);
                }
            }
        }, 600); // Check every 600ms

    }, []);

    // Peripheral Spawning Logic - Refreshes every 5 seconds
    const spawnPeripheral = useCallback(() => {
        const newPatches: PeripheralPatch[] = [];
        const timestamp = Date.now();
        
        // Decide target location (50/50 Top or Bottom)
        const targetSide = Math.random() > 0.5 ? 'top' : 'bottom';
        const targetId = `p-target-${timestamp}`;

        // Add Target
        newPatches.push({
            id: targetId,
            type: 'gabor',
            size: Math.random() * 30 + 40, // 40-70px
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20, // Avoid extreme edges vertically
            side: targetSide
        });
        
        // Add Fake Patches (Distractors) for BOTH sides
        // Top Distractors
        const topCount = Math.floor(Math.random() * 3) + 2; // 2-4 patches
        for(let i=0; i<topCount; i++) {
             newPatches.push({
                id: `p-fake-top-${timestamp}-${i}`,
                type: 'fake',
                // Varied sizes for fake patches: 20px - 70px range
                size: Math.random() * 50 + 20, 
                x: Math.random() * 90 + 5,
                y: Math.random() * 60 + 20,
                side: 'top'
            });
        }

        // Bottom Distractors
        const bottomCount = Math.floor(Math.random() * 3) + 2;
        for(let i=0; i<bottomCount; i++) {
             newPatches.push({
                id: `p-fake-bot-${timestamp}-${i}`,
                type: 'fake',
                // Varied sizes for fake patches: 20px - 70px range
                size: Math.random() * 50 + 20,
                x: Math.random() * 90 + 5,
                y: Math.random() * 60 + 20,
                side: 'bottom'
            });
        }
        
        setPeripheralPatches(newPatches);
    }, []);

    // Main Game Loop management
    useEffect(() => {
        if (gameState === 'playing') {
            if (!isRoundActive) {
                startCentralRound();
            }

            // Peripheral Loop - Refresh every 5 seconds
            spawnPeripheral(); // Initial spawn
            if (peripheralSpawnTimerRef.current) clearInterval(peripheralSpawnTimerRef.current);
            peripheralSpawnTimerRef.current = window.setInterval(() => {
                spawnPeripheral();
            }, 5000); 
            
        } else {
            if (roundTimerRef.current) clearInterval(roundTimerRef.current);
            if (centralSpawnTimerRef.current) clearInterval(centralSpawnTimerRef.current);
            if (peripheralSpawnTimerRef.current) clearInterval(peripheralSpawnTimerRef.current);
        }

        return () => {
            if (roundTimerRef.current) clearInterval(roundTimerRef.current);
            if (centralSpawnTimerRef.current) clearInterval(centralSpawnTimerRef.current);
            if (peripheralSpawnTimerRef.current) clearInterval(peripheralSpawnTimerRef.current);
        };
    }, [gameState, isRoundActive, startCentralRound, spawnPeripheral]);


    const handlePeripheralClick = (patch: PeripheralPatch, e: React.MouseEvent) => {
        if (gameState !== 'playing') return;
        
        if (patch.type === 'gabor') {
            // Correct Click
            setPeripheralScore(prev => prev + 1); // 1 point per touch
            
            // Trigger Explosion
            const id = `exp-${Date.now()}`;
            setExplosions(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
            
            // Remove the clicked patch so it doesn't get clicked again in this cycle
            setPeripheralPatches(prev => prev.filter(p => p.id !== patch.id));

        } else {
            // Fake Click - Decrease Peripheral Lives
            // Logic: Consistent life loss.
            setPeripheralLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) setGameState('gameOver');
                return newLives;
            });
        }
    };

    const handleCentralSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const count = parseInt(centralInputValue);
        const actual = targetCounterRef.current;
        const diff = Math.abs(count - actual);
        
        let correct = false;
        
        if (diff === 0) {
            setCentralScore(prev => prev + 1); // 1 point
            correct = true;
        } else {
             // Wrong count - Feedback will allow Resume (Lose Life) or Exit
             correct = false;
        }
        
        setFeedbackData({ isCorrect: correct, count: actual });
        setIsRoundActive(false); 
        setGameState('feedback'); // Go to feedback screen
        setCentralInputValue('');
    };
    
    // Feedback Handlers
    const handleFeedbackContinue = () => {
        // Correct Answer -> Next Round
        setGameState('playing');
    };

    const handleFeedbackResume = () => {
        // Incorrect Answer -> Resume means start new round but lose a life
        setCentralLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                 setGameState('gameOver');
                 return newLives;
            }
            // If still alive, go to playing
            setGameState('playing');
            return newLives;
        });
    };

    const handleFeedbackExit = () => {
        setShowExitConfirm(true);
    };

    const handleHomeClick = () => {
        setGameState('pausedManually');
        setShowExitConfirm(true);
    };

    const handleConfirmExit = () => {
        setCurrentPage('home');
    };

    const handleCancelExit = () => {
        setShowExitConfirm(false);
        if (gameState === 'pausedManually') {
            setGameState('playing');
        }
    };

    const retryLevel = () => {
        setCentralLives(3);
        setPeripheralLives(3);
        setCentralScore(0);
        setPeripheralScore(0);
        setCentralPatches([]);
        setPeripheralPatches([]);
        setIsRoundActive(false);
        setGameState('playing');
    };

    // --- Render ---

    const renderPeripheralArea = (side: 'top' | 'bottom') => {
        const patches = peripheralPatches.filter(p => p.side === side);
        return (
             <div className={`flex-1 relative bg-black flex items-center justify-center overflow-hidden border-${side === 'top' ? 'b' : 't'} border-slate-700`}>
                <SimpleECGCanvas />
                {patches.map(patch => (
                    <div 
                        key={patch.id}
                        className="absolute animate-pop-in z-20"
                        style={{ left: `${patch.x}%`, top: `${patch.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                         <GaborCircle 
                             size={patch.size} 
                             contrast={patch.type === 'gabor' ? contrast : contrast * 0.2}
                             onClick={(e) => handlePeripheralClick(patch, e)}
                             style={patch.type === 'fake' ? { backgroundImage: 'none', backgroundColor: '#333' } : { boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                         />
                    </div>
                ))}
             </div>
        );
    };

    return (
        <div className="flex flex-col h-screen w-full bg-slate-50 font-sans select-none overflow-hidden relative">
            
            {/* --- Header --- */}
            <header className="flex-none p-3 bg-gradient-to-r from-cyan-600 to-teal-400 shadow-md z-10 flex justify-between items-center text-white">
                 <div className="flex items-center gap-6">
                     <RingHomeButton onClick={handleHomeClick} />
                     
                     {/* Score */}
                     <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-xl flex flex-col items-center min-w-[90px] shadow-sm">
                           <div className="text-[10px] font-bold text-cyan-50 uppercase tracking-wider">
                               Score
                           </div>
                           <div className="text-2xl font-bold leading-none drop-shadow-sm">
                               {centralScore + peripheralScore}
                           </div>
                      </div>
                 </div>

                 {/* Lives */}
                 <div className="flex gap-6 pr-2">
                     {/* Central Lives (Blue) */}
                     <div className="flex flex-col items-center">
                         <div className="flex items-center gap-1">
                             {Array.from({length:3}).map((_, i) => (
                                 i < centralLives ? 
                                    <HeartIcon key={i} className="w-7 h-7 fill-current text-blue-600 drop-shadow-md stroke-white stroke-1"/> : 
                                    <HeartOutlineIcon key={i} className="w-7 h-7 opacity-50 text-blue-100"/>
                             ))}
                         </div>
                         <div className="text-[10px] font-bold text-cyan-50 uppercase mt-1 tracking-wider">
                             Cen. Task
                         </div>
                     </div>

                     {/* Peripheral Lives (Red) */}
                     <div className="flex flex-col items-center">
                         <div className="flex items-center gap-1">
                             {Array.from({length:3}).map((_, i) => (
                                 i < peripheralLives ? 
                                    <HeartIcon key={i} className="w-7 h-7 fill-current text-red-600 drop-shadow-md stroke-white stroke-1"/> : 
                                    <HeartOutlineIcon key={i} className="w-7 h-7 opacity-50 text-red-100"/>
                             ))}
                         </div>
                         <div className="text-[10px] font-bold text-cyan-50 uppercase mt-1 tracking-wider">
                             Peri. Task
                         </div>
                     </div>
                  </div>
            </header>

            {/* --- Main Game Area --- */}
            <main className="flex-grow flex flex-col relative overflow-hidden">
                 
                 {/* Top Peripheral Area */}
                 {renderPeripheralArea('top')}

                 {/* Middle Central Area (White + Patches) */}
                 <div className="flex-1 relative bg-white flex items-center justify-center overflow-hidden border-y-4 border-slate-200">
                     {/* REMOVED BLUE TIMER BAR HERE */}

                     {centralPatches.map(patch => (
                         <div
                             key={patch.id}
                             className="absolute rounded-full animate-pop-in"
                             style={{
                                 left: `${patch.x}%`,
                                 top: `${patch.y}%`,
                                 width: patch.size,
                                 height: patch.size,
                                 transform: 'translate(-50%, -50%)',
                                 pointerEvents: 'none',
                             }}
                         >
                             {patch.type === 'gabor' ? (
                                 <GaborCircle 
                                     size={patch.size}
                                     contrast={patch.contrast || 1.0} 
                                     onClick={()=>{}}
                                     className="pointer-events-none shadow-xl"
                                 />
                             ) : (
                                 <div className="w-full h-full rounded-full bg-slate-300 opacity-50" />
                             )}
                         </div>
                     ))}
                     
                     {/* VISUAL LEGEND for Central Task - Updated to remove Text */}
                     {gameState === 'playing' && centralPatches.length === 0 && roundTimeLeft > 0 && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 select-none">
                            <div className="flex gap-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="flex flex-col items-center gap-3">
                                    <GaborCircle size={80} contrast={1.0} onClick={()=>{}} className="shadow-md pointer-events-none" />
                                </div>
                                <div className="w-px bg-slate-200"></div>
                                <div className="flex flex-col items-center gap-3">
                                     <div className="w-[80px] h-[80px] rounded-full bg-slate-300 shadow-inner" />
                                </div>
                            </div>
                         </div>
                     )}
                 </div>

                 {/* Bottom Peripheral Area */}
                 {renderPeripheralArea('bottom')}

                 {/* Explosion Effects Layer */}
                 {explosions.map(exp => (
                     <ClickExplosion 
                        key={exp.id} 
                        x={exp.x} 
                        y={exp.y} 
                        onComplete={() => setExplosions(prev => prev.filter(e => e.id !== exp.id))} 
                     />
                 ))}

            </main>

            {/* --- Overlays --- */}

            {/* Input Overlay (Transparent) */}
            {gameState === 'input' && (
                <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-md flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
                         <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-md">Time's Up!</h2>
                         <p className="text-lg text-white/90 mb-6">How many <span className="font-bold text-white">Gabor Patches</span>?</p>
                         <form onSubmit={handleCentralSubmit}>
                             <input 
                                 type="number" 
                                 autoFocus
                                 value={centralInputValue}
                                 onChange={e => setCentralInputValue(e.target.value)}
                                 className="w-full text-center text-4xl p-4 bg-white/10 border-2 border-white/30 rounded-xl focus:border-cyan-400 outline-none mb-6 font-bold text-white placeholder-white/30"
                                 placeholder="#"
                             />
                             <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl transition text-xl shadow-lg">
                                 Submit
                             </button>
                         </form>
                    </div>
                </div>
            )}

            {/* Feedback Overlay (Correct/Incorrect) */}
            {gameState === 'feedback' && feedbackData && (
                 <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-md flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
                        {feedbackData.isCorrect ? (
                            <>
                                <CheckCircleIcon className="w-20 h-20 text-teal-400 mx-auto mb-4 drop-shadow-md" />
                                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Correct!</h2>
                                <p className="text-white/80 mb-8">Count was {feedbackData.count}</p>
                                <button onClick={handleFeedbackContinue} className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg">
                                    Continue <NextIcon className="w-5 h-5"/>
                                </button>
                            </>
                        ) : (
                            <>
                                <XCircleIcon className="w-20 h-20 text-rose-500 mx-auto mb-4 drop-shadow-md" />
                                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Incorrect</h2>
                                <p className="text-white/80 mb-8">Correct count was {feedbackData.count}</p>
                                <div className="flex gap-4">
                                     <button onClick={handleFeedbackResume} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg">
                                         Resume
                                     </button>
                                     <button onClick={handleFeedbackExit} className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg">
                                         Exit
                                     </button>
                                </div>
                            </>
                        )}
                    </div>
                 </div>
            )}

            {/* Game Over Overlay */}
            {gameState === 'gameOver' && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full animate-fade-in-up">
                        <XCircleIcon className="w-20 h-20 text-rose-500 mx-auto mb-4" />
                        <h2 className="text-4xl font-bold text-slate-800 mb-2">Game Over</h2>
                        <p className="text-slate-500 mb-6">
                            {centralLives <= 0 ? "You failed the Central Task!" : "You failed the Peripheral Task!"}
                        </p>
                        
                        <div className="bg-slate-100 p-4 rounded-xl mb-8">
                             <p className="text-sm text-slate-500 uppercase">Final Score</p>
                             <p className="text-4xl font-bold text-cyan-600">{centralScore + peripheralScore}</p>
                        </div>
                        
                        <div className="flex gap-4">
                             <button onClick={handleHomeClick} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                                 <HomeIcon className="w-5 h-5"/> Menu
                             </button>
                             <button onClick={retryLevel} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                                 <RetryIcon className="w-5 h-5"/> Retry
                             </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={showExitConfirm}
                title="Confirm Exit"
                message="Do you want to exit to the Main Menu?"
                onConfirm={handleConfirmExit}
                onCancel={handleCancelExit}
                confirmText="Exit"
            />
        </div>
    );
};

export default Level5;
