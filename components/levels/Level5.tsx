
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page } from '../../types';
import GaborCircle from '../GaborCircle';
import { HomeIcon, HeartIcon, HeartOutlineIcon, XCircleIcon } from '../ui/Icons';
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
             {/* Central Burst */}
             <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400 w-8 h-8 opacity-75"></div>
             
             {/* Particles */}
             {Array.from({ length: 12 }).map((_, i) => (
                 <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-cyan-400"
                    style={{
                        transform: `rotate(${i * 30}deg) translate(0, 0)`,
                        animation: `particle-burst-${i} 0.6s ease-out forwards`
                    }}
                 />
             ))}
             
             <style>{`
                ${Array.from({ length: 12 }).map((_, i) => `
                    @keyframes particle-burst-${i} {
                        0% { transform: rotate(${i * 30}deg) translate(0, 0) scale(1); opacity: 1; }
                        100% { transform: rotate(${i * 30}deg) translate(${40 + Math.random() * 40}px, 0) scale(0); opacity: 0; }
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
}

interface Explosion {
    id: string;
    x: number;
    y: number;
}

const Level5: React.FC<Level5Props> = ({ setCurrentPage }) => {
    const [gameState, setGameState] = useState<'playing' | 'input' | 'gameOver' | 'pausedManually'>('playing');
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
    
    // Peripheral Logic
    const [peripheralPatches, setPeripheralPatches] = useState<PeripheralPatch[]>([]);
    const [contrast, setContrast] = useState(1.0);
    const [explosions, setExplosions] = useState<Explosion[]>([]);

    // Refs
    const roundTimerRef = useRef<number | null>(null);
    const centralSpawnTimerRef = useRef<number | null>(null);
    const peripheralSpawnTimerRef = useRef<number | null>(null);
    const targetCounterRef = useRef(0);

    // Start a new counting round
    const startCentralRound = useCallback(() => {
        const duration = Math.floor(Math.random() * 30) + 20; 
        setRoundTimeLeft(duration);
        targetCounterRef.current = 0;
        setCentralPatches([]);
        setIsRoundActive(true);
        setCentralInputValue('');
        setGameState('playing');

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
        const spawnLoop = () => {
            const nextSpawnTime = Math.random() * 2000 + 500; 
            centralSpawnTimerRef.current = window.setTimeout(() => {
                if (gameState !== 'playing' && gameState !== 'input') return; 
                
                const isTarget = Math.random() > 0.6;
                const size = Math.random() * 80 + 80;
                const id = `c-${Date.now()}`;
                
                const newPatch: CentralPatch = {
                    id,
                    type: isTarget ? 'gabor' : 'fake',
                    size,
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 80 + 10
                };

                if (isTarget) targetCounterRef.current += 1;

                setCentralPatches(prev => [...prev, newPatch]);

                setTimeout(() => {
                    setCentralPatches(prev => prev.filter(p => p.id !== id));
                }, 1000);

                if (roundTimeLeft > 1) spawnLoop();
            }, nextSpawnTime);
        };
        spawnLoop();

    }, [gameState]);

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
                size: Math.random() * 40 + 20, // 20-60px varied sizes
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
                size: Math.random() * 40 + 20,
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
            if (centralSpawnTimerRef.current) clearTimeout(centralSpawnTimerRef.current);
            if (peripheralSpawnTimerRef.current) clearInterval(peripheralSpawnTimerRef.current);
        }

        return () => {
            if (roundTimerRef.current) clearInterval(roundTimerRef.current);
            if (centralSpawnTimerRef.current) clearTimeout(centralSpawnTimerRef.current);
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
        
        if (diff === 0) {
            setCentralScore(prev => prev + 100);
        } else if (diff <= 1 && actual > 5) {
            setCentralScore(prev => prev + 50); 
        } else {
             // Wrong count - Decrease Central Lives
             setCentralLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) setGameState('gameOver');
                return newLives;
            });
        }
        setIsRoundActive(false); 
        setGameState('playing');
        setCentralInputValue('');
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
                     
                     {/* Score placed to the right of the home button as requested */}
                     <div className="flex flex-col">
                           <div className="text-3xl font-bold leading-none drop-shadow-md">
                               {centralScore + peripheralScore}
                           </div>
                           <div className="text-xs font-bold text-cyan-100 uppercase tracking-wide">
                               Score
                           </div>
                      </div>
                 </div>

                 {/* Lives separated into Central (Blue) and Peripheral (Red) */}
                 <div className="flex gap-6 pr-2">
                     {/* Central Lives (Blue) */}
                     <div className="flex flex-col items-end">
                         <div className="flex items-center gap-1 text-blue-300 font-bold text-lg">
                             {Array.from({length:3}).map((_, i) => (
                                 i < centralLives ? <HeartIcon key={i} className="w-6 h-6 fill-current text-blue-200 drop-shadow-sm"/> : <HeartOutlineIcon key={i} className="w-6 h-6 opacity-40 text-blue-200"/>
                             ))}
                         </div>
                         <div className="text-[10px] font-bold text-cyan-50 uppercase mt-0.5 tracking-wider">
                             Cen. Task
                         </div>
                     </div>

                     {/* Peripheral Lives (Red) */}
                     <div className="flex flex-col items-end">
                         <div className="flex items-center gap-1 text-rose-300 font-bold text-lg">
                             {Array.from({length:3}).map((_, i) => (
                                 i < peripheralLives ? <HeartIcon key={i} className="w-6 h-6 fill-current text-rose-200 drop-shadow-sm"/> : <HeartOutlineIcon key={i} className="w-6 h-6 opacity-40 text-rose-200"/>
                             ))}
                         </div>
                         <div className="text-[10px] font-bold text-cyan-50 uppercase mt-0.5 tracking-wider">
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
                     {/* Timer Bar */}
                     {gameState === 'playing' && (
                         <div className="absolute top-0 left-0 h-1 bg-cyan-500 transition-all duration-1000 ease-linear" style={{ width: `${(roundTimeLeft/60)*100}%` }}></div>
                     )}

                     {centralPatches.map(patch => (
                         <div
                             key={patch.id}
                             className="absolute rounded-full"
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
                                     contrast={1.0} 
                                     onClick={()=>{}}
                                     className="pointer-events-none shadow-xl"
                                 />
                             ) : (
                                 <div className="w-full h-full rounded-full bg-slate-300 opacity-50" />
                             )}
                         </div>
                     ))}
                     
                     {gameState === 'playing' && centralPatches.length === 0 && roundTimeLeft > 0 && (
                         <div className="text-slate-300 text-xl font-bold opacity-20 select-none">Count the Gabor Patches...</div>
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

            {/* Input Overlay */}
            {gameState === 'input' && (
                <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
                         <h2 className="text-2xl font-bold text-slate-700 mb-4">Round Complete!</h2>
                         <p className="text-lg text-slate-500 mb-6">How many <span className="font-bold text-slate-800">Gabor Patches</span> appeared in the center?</p>
                         <form onSubmit={handleCentralSubmit}>
                             <input 
                                 type="number" 
                                 autoFocus
                                 value={centralInputValue}
                                 onChange={e => setCentralInputValue(e.target.value)}
                                 className="w-full text-center text-4xl p-4 border-2 border-slate-300 rounded-xl focus:border-cyan-500 outline-none mb-6 font-bold text-slate-700"
                                 placeholder="#"
                             />
                             <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-xl transition text-xl shadow-lg shadow-cyan-500/30">
                                 Submit Count
                             </button>
                         </form>
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
                title="Exit Level?"
                message="Progress for this session will be lost."
                onConfirm={handleConfirmExit}
                onCancel={handleCancelExit}
                confirmText="Exit"
            />
        </div>
    );
};

export default Level5;
