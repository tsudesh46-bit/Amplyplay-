
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Page, LevelStats } from '../../types';
import { RetryIcon, HomeIcon, NextIcon, StarIcon } from '../ui/Icons';
import ConfirmationModal from '../ConfirmationModal';

// --- Constants ---
const MIN_SPEED = 150; 
const BORDER_THICKNESS = 4;
const GRID_CELL_SIZE = 25; 

const ACUITY_CONFIG = [
    { id: 0, label: '6/60', startSize: 151, endSize: 130, startContrast: 1.0, endContrast: 0.85 },
    { id: 1, label: '6/36', startSize: 130, endSize: 110, startContrast: 0.9, endContrast: 0.75 },
    { id: 2, label: '6/24', startSize: 110, endSize: 90, startContrast: 0.8, endContrast: 0.65 },
    { id: 3, label: '6/18', startSize: 90, endSize: 70, startContrast: 0.7, endContrast: 0.55 },
    { id: 4, label: '6/12', startSize: 70, endSize: 50, startContrast: 0.6, endContrast: 0.45 },
    { id: 5, label: '6/9', startSize: 50, endSize: 30, startContrast: 0.5, endContrast: 0.3 }
];

const RingHomeButton: React.FC<{ onClick: () => void, className?: string }> = ({ onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`relative group rounded-full flex items-center justify-center bg-white shadow-xl transition-transform hover:scale-110 focus:outline-none z-30 ${className}`}
    style={{ width: '3.5rem', height: '3.5rem' }}
    aria-label="Home"
  >
    <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
    <span className="absolute -inset-1 rounded-full border border-cyan-100 opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500 ease-out"></span>
    <HomeIcon className="w-8 h-8 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
  </button>
);

interface Distractor { x: number; y: number; shape: 'circle'; color: string; id: string; }
interface Target { x: number; y: number; shape: 'circle'; }

interface SnakeGameProps {
    levelIndex: number;
    unlockedIndex: number;
    onLevelSelect: (index: number) => void;
    onExit: () => void;
    onComplete: (score: number, config: any) => void;
    saveMainProgress: (stars: number, stats: Partial<LevelStats>) => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ levelIndex, unlockedIndex, onLevelSelect, onExit, onComplete, saveMainProgress }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gridCols, setGridCols] = useState(10);
    const [gridRows, setGridRows] = useState(10);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'levelComplete'>('start');
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [snake, setSnake] = useState<{x: number, y: number}[]>([{ x: 10, y: 10 }]);
    const [target, setTarget] = useState<Target>({ x: 5, y: 5, shape: 'circle' });
    const [distractors, setDistractors] = useState<Distractor[]>([]);
    const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
    const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
    const nextDirectionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
    const intervalRef = useRef<any>(null);
    const prevSnakeRef = useRef<{x: number, y: number}[]>([{ x: 10, y: 10 }]);
    const lastMoveTimeRef = useRef<number>(0);
    const isEatingRef = useRef<boolean>(false);
    const speedRef = useRef<number>(MIN_SPEED);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const targetRef = useRef<Target>(target);
    const scoreRef = useRef<number>(score);
    const config = ACUITY_CONFIG[levelIndex];

    useEffect(() => { directionRef.current = direction; }, [direction]);
    useEffect(() => { targetRef.current = target; }, [target]);
    useEffect(() => { scoreRef.current = score; }, [score]);
    
    useEffect(() => {
        setGameState('start'); setDirection(null); directionRef.current = null;
        nextDirectionRef.current = null; setScore(0); speedRef.current = MIN_SPEED;
    }, [levelIndex]);

    const progressRatio = Math.min(1, score / 100);
    const currentPatchSize = config ? config.startSize - (progressRatio * (config.startSize - config.endSize)) : 100;
    const currentContrast = config ? config.startContrast - (progressRatio * (config.startContrast - config.endContrast)) : 1.0;

    const generateLevelItems = useCallback((currentSnake: {x: number, y: number}[], cols: number, rows: number, currentScore: number) => {
        const occupied = new Set<string>();
        currentSnake.forEach(s => { for(let dx=-3; dx<=3; dx++) for(let dy=-3; dy<=3; dy++) occupied.add(`${s.x+dx},${s.y+dy}`); });
        const getRandomPos = () => {
            let x, y, key; let attempts = 0;
            do {
                x = Math.floor(Math.random() * (cols - 6)) + 3;
                y = Math.floor(Math.random() * (rows - 6)) + 3;
                key = `${x},${y}`; attempts++;
            } while (occupied.has(key) && attempts < 200);
            occupied.add(key); return { x, y };
        };
        const pos = getRandomPos();
        const distPos = getRandomPos();
        return { 
          target: { ...pos, shape: 'circle' as const }, 
          distractors: [{ ...distPos, shape: 'circle' as const, color: '#374151', id: `d-${Date.now()}` }] 
        };
    }, []);

    const initGrid = useCallback(() => {
        if (gameContainerRef.current) {
            const width = gameContainerRef.current.clientWidth - (BORDER_THICKNESS * 2);
            const height = gameContainerRef.current.clientHeight - (BORDER_THICKNESS * 2);
            const cols = Math.max(5, Math.floor(width / GRID_CELL_SIZE));
            const rows = Math.max(5, Math.floor(height / GRID_CELL_SIZE));
            setGridCols(cols); setGridRows(rows); return { cols, rows };
        }
        return { cols: 10, rows: 10 };
    }, []);

    const startGame = useCallback(() => {
        const { cols, rows } = initGrid();
        const startSnake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
        const items = generateLevelItems(startSnake, cols, rows, 0);
        setSnake(startSnake); prevSnakeRef.current = startSnake;
        setTarget(items.target); setDistractors(items.distractors);
        setDirection(null); directionRef.current = null;
        if (score > highScore) setHighScore(score); setScore(0);
        setGameState('playing'); setIsPaused(false);
    }, [generateLevelItems, score, highScore, initGrid]);

    const moveSnake = useCallback(() => {
        if (nextDirectionRef.current) {
            directionRef.current = nextDirectionRef.current; setDirection(nextDirectionRef.current);
            nextDirectionRef.current = null;
        }
        if (!directionRef.current) { lastMoveTimeRef.current = Date.now(); return; }
        
        setSnake(prevSnake => {
            prevSnakeRef.current = prevSnake; lastMoveTimeRef.current = Date.now();
            const next = { ...prevSnake[0] };
            switch (directionRef.current) {
                case 'UP': next.y -= 1; break; case 'DOWN': next.y += 1; break;
                case 'LEFT': next.x -= 1; break; case 'RIGHT': next.x += 1; break;
            }
            if (distractors.some(d => Math.sqrt(Math.pow(next.x - d.x, 2) + Math.pow(next.y - d.y, 2)) < 2.5)) {
                setGameState('gameOver'); return prevSnake;
            }
            if (next.x < 0 || next.x >= gridCols || next.y < 0 || next.y >= gridRows || prevSnake.some(s => s.x === next.x && s.y === next.y)) {
                if (score >= 30) { setGameState('levelComplete'); onComplete(score, config); return prevSnake; }
                setGameState('gameOver'); return prevSnake;
            }
            if (Math.sqrt(Math.pow(next.x - target.x, 2) + Math.pow(next.y - target.y, 2)) < 2.5) {
                isEatingRef.current = true; const newScore = score + 1; setScore(newScore);
                if (newScore >= 100) { setGameState('levelComplete'); onComplete(newScore, config); return [next, ...prevSnake]; }
                const newSnake = [next, ...prevSnake];
                const items = generateLevelItems(newSnake, gridCols, gridRows, newScore);
                setTarget(items.target); setDistractors(items.distractors); return newSnake;
            } else {
                isEatingRef.current = false; return [next, ...prevSnake.slice(0, -1)];
            }
        });
    }, [gridCols, gridRows, target, distractors, score, config, generateLevelItems, onComplete]);

    useEffect(() => {
        if (gameState === 'playing' && !isPaused && !isExitModalOpen) {
            intervalRef.current = setInterval(moveSnake, speedRef.current);
        } else clearInterval(intervalRef.current);
        return () => clearInterval(intervalRef.current);
    }, [gameState, isPaused, isExitModalOpen, moveSnake]);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        canvas.width = gridCols * GRID_CELL_SIZE; canvas.height = gridRows * GRID_CELL_SIZE;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (gameState !== 'playing') return;
            const now = Date.now(); const t = Math.min(1, Math.max(0, (now - lastMoveTimeRef.current) / speedRef.current));
            const visualPoints = snake.map((s, i) => i === 0 && prevSnakeRef.current.length > 0 ? { x: prevSnakeRef.current[0].x + (s.x - prevSnakeRef.current[0].x) * t, y: prevSnakeRef.current[0].y + (s.y - prevSnakeRef.current[0].y) * t } : s);
            const snakeWidth = currentPatchSize;
            visualPoints.forEach((p, idx) => {
                ctx.beginPath(); ctx.arc(p.x * GRID_CELL_SIZE + GRID_CELL_SIZE/2, p.y * GRID_CELL_SIZE + GRID_CELL_SIZE/2, snakeWidth/2, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(0, 0%, ${idx === 0 ? 95 : 50}%)`; ctx.globalAlpha = Math.max(0.4, currentContrast); ctx.fill();
            });
            requestAnimationFrame(draw);
        };
        draw();
    }, [snake, gridCols, gridRows, gameState, currentPatchSize, currentContrast]);

    const onPointerDown = (e: React.PointerEvent) => {
        if (gameState !== 'playing' || isPaused || isExitModalOpen) return;
        const rect = gameContainerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const deltaX = e.clientX - (rect.left + rect.width / 2);
        const deltaY = e.clientY - (rect.top + rect.height / 2);
        const newDir = Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? 'RIGHT' : 'LEFT') : (deltaY > 0 ? 'DOWN' : 'UP');
        if (newDir !== directionRef.current) nextDirectionRef.current = newDir as any;
    };

    const renderOverlay = () => {
        if (gameState === 'start') return (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                {/* Optimized Level 6 Start Screen for Laptop Screens (Expanded Dimensions) */}
                <div className="bg-[#020710] p-10 sm:p-16 rounded-[3rem] border-[5px] border-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.7)] max-w-5xl w-full text-center relative animate-pop-in flex flex-col items-center">
                    
                    <div className="flex flex-col md:flex-row items-center justify-between w-full gap-12 mb-12">
                        {/* Title and Badge Section */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
                            <div>
                                <h2 className="text-[3rem] font-pixel text-white mb-4 tracking-tighter uppercase">LEVEL 06</h2>
                                
                                {/* 6/60 Badge */}
                                <div className="inline-block bg-[#0a1b32] px-12 py-3 rounded-2xl border border-cyan-500/30">
                                    <span className="text-3xl font-bold text-cyan-400 font-mono tracking-widest">{config.label}</span>
                                </div>
                            </div>

                            {/* Target Score Section */}
                            <div className="pt-4">
                                <p className="text-white text-sm font-black uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-4">
                                    TARGET SCORE <span className="text-red-500 text-3xl font-mono tracking-tighter">100</span>
                                </p>
                            </div>
                        </div>

                        {/* Patch Indicators Container (Expanded) */}
                        <div className="flex-1 w-full bg-[#0b1426] p-10 sm:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
                            <div className="flex items-center justify-center gap-14">
                                {/* FIND Patch Indicator - Now with light white text */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 h-24 rounded-full border-[4px] border-white/20 shadow-xl relative overflow-hidden" 
                                         style={{ backgroundImage: `repeating-linear-gradient(45deg, #fff, #fff 3px, #000 3px, #000 7px)`, backgroundColor: '#333' }}>
                                        <div className="absolute inset-0 bg-white/5"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-100 uppercase tracking-[0.4em]">FIND</span>
                                </div>
                                
                                {/* Vertical Line Separator */}
                                <div className="w-[1px] h-14 bg-white/10"></div>
                                
                                {/* AVOID Patch Indicator */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 h-24 rounded-full border-[4px] border-white/10 shadow-inner relative overflow-hidden" 
                                         style={{ backgroundImage: `repeating-linear-gradient(135deg, #374151, #111827 7px)`, backgroundColor: '#222' }}>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">AVOID</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Start Button: Cyan Pill with Slowly Rotating Stars */}
                    <button 
                        onClick={startGame} 
                        className="w-full max-w-lg py-6 bg-cyan-500 hover:bg-cyan-400 text-white font-black text-2xl rounded-3xl transition-all shadow-[0_20px_40px_rgba(6,182,212,0.3)] active:scale-95 uppercase tracking-[0.3em] flex items-center justify-center gap-6"
                    >
                        <span className="text-xl opacity-80 animate-spin-slow">★</span>
                        START
                        <span className="text-xl opacity-80 animate-spin-slow">★</span>
                    </button>
                </div>
                
                <style>{`
                    @keyframes pop-in {
                        0% { transform: scale(0.92); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes spin-very-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                    .animate-spin-slow { animation: spin-very-slow 6s linear infinite; }
                `}</style>
            </div>
        );
        if (gameState === 'levelComplete') return (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center z-40">
                <h2 className="text-4xl font-bold text-teal-400 mb-6">Level Complete</h2>
                <button onClick={() => onLevelSelect(levelIndex + 1)} className="bg-cyan-600 text-white font-bold py-4 px-8 rounded-full text-xl flex items-center gap-3">Next Acuity <NextIcon /></button>
            </div>
        );
        if (gameState === 'gameOver') return (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center z-40">
                <h2 className="text-4xl font-bold text-rose-500 mb-6">Game Over</h2>
                <div className="flex gap-4"><button onClick={startGame} className="bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2"><RetryIcon /> Retry</button><button onClick={() => setIsExitModalOpen(true)} className="bg-slate-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2"><HomeIcon className="w-6 h-6" /> Menu</button></div>
            </div>
        );
        return null;
    };

    return (
        <div className="flex flex-col h-screen w-full bg-black font-sans select-none overflow-hidden">
             <header className="w-full p-2 bg-slate-900 shadow-sm z-10 shrink-0 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4 pl-2 shrink-0"><RingHomeButton onClick={() => { setIsPaused(true); setIsExitModalOpen(true); }} /><div className="flex items-center gap-3 overflow-x-auto no-scrollbar">{ACUITY_CONFIG.map((m, idx) => (<button key={m.label} disabled={idx > unlockedIndex} onClick={() => onLevelSelect(idx)} className={`flex flex-col items-center ${idx === levelIndex ? 'opacity-100 scale-110 text-cyan-400' : 'opacity-40 text-slate-500'}`}><span className="text-[9px] font-bold">TARGET</span><span className="text-sm font-bold font-mono">{m.label}</span></button>))}</div></div>
                <div className="flex-grow mx-6 max-w-md hidden sm:block"><div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 transition-all" style={{ width: `${Math.min(100, score)}%` }}></div></div></div>
                <div className="flex items-center pl-4 border-l border-slate-700 shrink-0"><div className="flex flex-col items-center mr-6 border-r border-slate-800 pr-6"><span className="text-[10px] font-bold text-white uppercase">GOAL</span><span className="text-2xl font-bold text-red-500 font-mono">100</span></div><div className="flex flex-col items-center"><span className="text-[10px] font-bold text-slate-400 uppercase">SCORE</span><span className="text-2xl font-bold text-cyan-400 font-mono">{score}</span></div></div>
            </header>
            <main className="flex-grow w-full h-full relative touch-none bg-black" onPointerDown={onPointerDown}>
                {renderOverlay()}
                <div ref={gameContainerRef} className="w-full h-full flex items-center justify-center relative bg-black">
                    <div className="relative overflow-hidden pointer-events-auto bg-black" style={{ width: `${gridCols * GRID_CELL_SIZE}px`, height: `${gridRows * GRID_CELL_SIZE}px`, border: `${BORDER_THICKNESS}px solid #1e293b` }}>
                        {gameState === 'playing' && (<><canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" /><div className="absolute animate-pulse" style={{ width: GRID_CELL_SIZE, height: GRID_CELL_SIZE, top: target.y * GRID_CELL_SIZE, left: target.x * GRID_CELL_SIZE, zIndex: 100 }}><div className="w-full h-full rounded-full" style={{ backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,${currentContrast}), rgba(255,255,255,${currentContrast}) 2px, rgba(0,0,0,${currentContrast}) 2px, rgba(0,0,0,${currentContrast}) 4px)`, backgroundColor: `rgba(255,255,255,0.2)` }} /></div>{distractors.map(d => (<div key={d.id} className="absolute" style={{ width: GRID_CELL_SIZE, height: GRID_CELL_SIZE, top: d.y * GRID_CELL_SIZE, left: d.x * GRID_CELL_SIZE, zIndex: 5 }}><div className="w-full h-full rounded-full" style={{ backgroundImage: `repeating-linear-gradient(135deg, rgba(55,65,81,${currentContrast}), rgba(17,24,39,${currentContrast}) 4px)`, backgroundColor: `rgba(55,65,81,0.5)` }} /></div>))}</>)}
                    </div>
                </div>
            </main>
            <ConfirmationModal isOpen={isExitModalOpen} title="Confirm Exit" message="Do you want to exit to the Main Menu?" onConfirm={() => onExit()} onCancel={() => { setIsExitModalOpen(false); setIsPaused(false); }} />
        </div>
    );
};

interface Level6Props {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number, details?: Partial<LevelStats>) => void;
}

const Level6: React.FC<Level6Props> = ({ setCurrentPage, saveLevelCompletion }) => {
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [unlockedLevelIndex, setUnlockedLevelIndex] = useState(ACUITY_CONFIG.length - 1);

    const handleLevelComplete = (score: number, config: any) => {
        let stars = 0;
        if (score >= 100) stars = 3; else if (score >= 60) stars = 2; else if (score >= 30) stars = 1;
        const acuityLabelAsSize = parseFloat(config.label.split('/')[1]); 
        if (stars > 0) {
             saveLevelCompletion('level6', stars, { score, incorrect: 0, size: acuityLabelAsSize, category: 'amblyo' });
        }
    };
    
    return (<SnakeGame levelIndex={currentLevelIndex} unlockedIndex={unlockedLevelIndex} onLevelSelect={setCurrentLevelIndex} onExit={() => setCurrentPage('home')} onComplete={handleLevelComplete} saveMainProgress={(stars, stats) => saveLevelCompletion('level6', stars, stats)} />);
};

export default Level6;
