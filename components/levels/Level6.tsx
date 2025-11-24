
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Page } from '../../types';
import { RetryIcon, HomeIcon, NextIcon, StarIcon, PlayIcon } from '../ui/Icons';
import ConfirmationModal from '../ConfirmationModal';
import GaborCircle from '../GaborCircle';

// --- Constants ---
const MIN_SPEED = 60;      
const SPEED_DECREMENT = 2; // Speed increase per point scored within a level

const TOTAL_SUB_LEVELS = 100;
const BORDER_THICKNESS = 4;

// Approximation: 96DPI -> 1cm is ~38px. 2cm is ~76px.
const BASE_CELL_SIZE_PX = 76; 

// --- Helper Components ---

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

// --- Game Components ---

interface Distractor {
    x: number;
    y: number;
    shape: 'circle' | 'square';
    color: string;
    id: string;
}

interface Target {
    x: number;
    y: number;
    shape: 'circle' | 'square';
}

interface SnakeGameProps {
    subLevel: number;
    acuityLabel: string;
    onExit: () => void;
    onComplete: (score: number) => void;
    saveMainProgress: (stars: number) => void;
}

const getTargetScore = (level: number) => {
    if (level <= 20) return 100;
    if (level <= 50) return 200;
    if (level <= 70) return 500;
    if (level <= 90) return 700;
    return 100; 
};

// Calculate cell size. Level 1 starts at ~2cm (76px). 
// As levels progress, size decreases slightly to increase difficulty, but stays large for low vision.
const getCellSizeForLevel = (level: number) => {
    // Range: Starts at 76px, drops to about 40px at level 100.
    return Math.floor(Math.max(40, BASE_CELL_SIZE_PX - ((level - 1) * 0.36)));
};

const SnakeGame: React.FC<SnakeGameProps> = ({ subLevel, acuityLabel, onExit, onComplete, saveMainProgress }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const [gridCols, setGridCols] = useState(10);
    const [gridRows, setGridRows] = useState(10);
    
    // Dynamic cell size based on acuity level
    const cellSize = getCellSizeForLevel(subLevel);
    
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'levelComplete'>('start');
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    
    const [snake, setSnake] = useState<{x: number, y: number}[]>([{ x: 5, y: 5 }]);
    const [target, setTarget] = useState<Target>({ x: 2, y: 2, shape: 'circle' });
    const [distractors, setDistractors] = useState<Distractor[]>([]);
    
    const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
    const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);

    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => { directionRef.current = direction; }, [direction]);

    // Calculate start speed based on level using useMemo to ensure it updates when level changes
    const startSpeed = useMemo(() => {
        if (subLevel <= 5) {
            // Level 1 starts at 800ms (Very Slow)
            return 800 - ((subLevel - 1) * 50);
        } else {
            return Math.max(150, 550 - ((subLevel - 6) * 10));
        }
    }, [subLevel]);

    const currentSpeed = Math.max(MIN_SPEED, startSpeed - (score * SPEED_DECREMENT));
    
    const targetScore = getTargetScore(subLevel);

    const generateLevelItems = useCallback((currentSnake: {x: number, y: number}[], cols: number, rows: number, currentScore: number) => {
        const occupied = new Set<string>();
        currentSnake.forEach(s => occupied.add(`${s.x},${s.y}`));

        const getRandomPos = () => {
            let x, y, key;
            let attempts = 0;
            do {
                x = Math.floor(Math.random() * cols);
                y = Math.floor(Math.random() * rows);
                key = `${x},${y}`;
                attempts++;
            } while (occupied.has(key) && attempts < 100);
            occupied.add(key);
            return { x, y };
        };

        const newTargetPos = getRandomPos();
        // Randomly assign shape: Gabor Circle or Gabor Square
        const newTarget: Target = {
            ...newTargetPos,
            shape: Math.random() > 0.5 ? 'circle' : 'square'
        };
        
        // Distractor Logic
        let numDistractors = 0;
        if (subLevel === 1) numDistractors = 1;
        else if (subLevel === 2) numDistractors = 2;
        else if (subLevel === 3) numDistractors = 3;
        else numDistractors = 3 + Math.floor((subLevel - 3) / 5);

        if (currentScore > 50) numDistractors += 1;
        
        const newDistractors: Distractor[] = [];
        for (let i = 0; i < numDistractors; i++) {
            const pos = getRandomPos();
            newDistractors.push({
                x: pos.x,
                y: pos.y,
                shape: Math.random() > 0.5 ? 'circle' : 'square',
                color: '#4b5563', // Solid grey
                id: `d-${Date.now()}-${i}`
            });
        }
        return { target: newTarget, distractors: newDistractors };
    }, [subLevel]);

    const initGrid = useCallback(() => {
        if (gameContainerRef.current) {
            const width = gameContainerRef.current.clientWidth - (BORDER_THICKNESS * 2);
            const height = gameContainerRef.current.clientHeight - (BORDER_THICKNESS * 2);
            let cols = Math.floor(width / cellSize);
            let rows = Math.floor(height / cellSize);
            // Ensure minimum play area
            cols = Math.max(5, cols);
            rows = Math.max(5, rows);
            setGridCols(cols);
            setGridRows(rows);
            return { cols, rows };
        }
        return { cols: 10, rows: 10 };
    }, [cellSize]);

    const startGame = useCallback(() => {
        const { cols, rows } = initGrid();
        // Force Center Start
        const centerX = Math.floor(cols / 2);
        const centerY = Math.floor(rows / 2);
        const startSnake = [{ x: centerX, y: centerY }];
        
        const items = generateLevelItems(startSnake, cols, rows, 0);
        
        setSnake(startSnake);
        setTarget(items.target);
        setDistractors(items.distractors);
        
        // Initialize direction to null so snake waits for input
        setDirection(null); 
        directionRef.current = null;
        
        if (score > highScore) setHighScore(score);
        setScore(0);
        setGameState('playing');
        setIsPaused(false);
    }, [generateLevelItems, score, highScore, initGrid]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
            
            // Explicitly ignore arrow keys if game is not playing. 
            if (gameState !== 'playing' || isPaused || isExitModalOpen) return;
            
            const key = e.key;
            setDirection(prevDirection => {
                // If waiting for start (null), allow any valid direction
                switch (key) {
                case 'ArrowUp': return prevDirection !== 'DOWN' ? 'UP' : prevDirection;
                case 'ArrowDown': return prevDirection !== 'UP' ? 'DOWN' : prevDirection;
                case 'ArrowLeft': return prevDirection !== 'RIGHT' ? 'LEFT' : prevDirection;
                case 'ArrowRight': return prevDirection !== 'LEFT' ? 'RIGHT' : prevDirection;
                default: return prevDirection;
                }
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, isPaused, isExitModalOpen]); 

    const handleInput = useCallback((clientX: number, clientY: number) => {
        if (gameState !== 'playing' || isPaused || isExitModalOpen) return;

        if (gameContainerRef.current) {
            const rect = gameContainerRef.current.getBoundingClientRect();
            // We use the Head position to determine turn relative to snake, 
            // but for simplicity in grid tap, we can just use center of screen or center of snake.
            // Using center of screen is more reliable for "D-Pad" style logic zones.
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = clientX - centerX;
            const deltaY = clientY - centerY;
            let newDirection = directionRef.current;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) { 
                    if (directionRef.current !== 'LEFT') newDirection = 'RIGHT'; 
                } 
                else { 
                    if (directionRef.current !== 'RIGHT') newDirection = 'LEFT'; 
                }
            } else {
                if (deltaY > 0) { 
                    if (directionRef.current !== 'UP') newDirection = 'DOWN'; 
                } 
                else { 
                    if (directionRef.current !== 'DOWN') newDirection = 'UP'; 
                }
            }
            if (newDirection && newDirection !== directionRef.current) setDirection(newDirection);
        }
    }, [gameState, isPaused, isExitModalOpen]);

    const onPointerDown = (e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;
        e.preventDefault(); 
        handleInput(e.clientX, e.clientY);
    };

    useEffect(() => {
        if (gameState !== 'playing' || isPaused || isExitModalOpen) return;
        const gameInterval = setInterval(() => {
            const currentDir = directionRef.current;
            if (!currentDir) return; // Wait for first input
            
            setSnake(prevSnake => {
                const head = prevSnake[0];
                const next = { ...head };
                switch (currentDir) {
                    case 'UP': next.y -= 1; break;
                    case 'DOWN': next.y += 1; break;
                    case 'LEFT': next.x -= 1; break;
                    case 'RIGHT': next.x += 1; break;
                }
                if (next.x < 0 || next.x >= gridCols || next.y < 0 || next.y >= gridRows || 
                    prevSnake.some(s => s.x === next.x && s.y === next.y) ||
                    distractors.some(d => d.x === next.x && d.y === next.y)) {
                    setGameState('gameOver');
                    if (score > highScore) setHighScore(score);
                    saveMainProgress(score > 0 ? 1 : 0);
                    return prevSnake;
                }
                if (next.x === target.x && next.y === target.y) {
                    const newScore = score + 1; // 1 Mark per food
                    setScore(newScore);
                    
                    if (newScore >= targetScore) {
                        setGameState('levelComplete');
                        saveMainProgress(3); 
                        return [next, ...prevSnake];
                    }

                    const newSnake = [next, ...prevSnake]; 
                    const items = generateLevelItems(newSnake, gridCols, gridRows, newScore);
                    setTarget(items.target);
                    setDistractors(items.distractors);
                    return newSnake;
                }
                return [next, ...prevSnake.slice(0, -1)];
            });
        }, currentSpeed);
        return () => clearInterval(gameInterval);
    }, [gameState, currentSpeed, target, distractors, score, highScore, saveMainProgress, isPaused, isExitModalOpen, gridCols, gridRows, generateLevelItems, targetScore]);

    useEffect(() => {
        const handleResize = () => initGrid();
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [initGrid]);

    const renderOverlay = () => {
        const commonClasses = "absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center z-40 p-6 font-sans rounded-md border border-slate-800";
        const textClasses = "text-white";
        
        if (gameState === 'start') {
            return (
                <div className={commonClasses}>
                    <h2 className={`text-4xl font-bold ${textClasses} mb-2 tracking-tight`}>LEVEL {subLevel}</h2>
                    <p className={`text-lg text-cyan-400 font-medium mb-8`}>Target Score: {targetScore}</p>
                    
                    <div className="flex flex-col gap-4 items-center justify-center mb-10 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 w-full max-w-xs">
                        <div className="flex items-center justify-around w-full">
                            <div className="flex flex-col items-center gap-2">
                                <GaborCircle size={40} contrast={1} onClick={()=>{}} />
                                <span className="text-xs font-bold text-cyan-300">FIND</span>
                            </div>
                            <div className="h-8 w-px bg-slate-600"></div>
                            <div className="flex flex-col items-center gap-2">
                                <div style={{width: '40px', height: '40px', backgroundColor: '#4b5563', borderRadius: '50%'}}></div>
                                <span className="text-xs font-medium text-rose-400">AVOID</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={startGame}
                        className="group relative px-10 py-4 bg-transparent border-2 border-cyan-400 rounded-full transition-all duration-300 hover:scale-105 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <StarIcon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-200 animate-spin-slow" />
                            <span className="text-xl font-bold text-cyan-400 group-hover:text-cyan-200 tracking-wider">
                                START GAME
                            </span>
                             <StarIcon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-200 animate-spin-slow" />
                        </div>
                    </button>
                </div>
            );
        }
        if (gameState === 'levelComplete') {
            return (
                <div className={commonClasses}>
                    <h2 className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mb-6`}>Level Complete!</h2>
                    <div className="flex gap-2 mb-8 animate-pulse-slow">
                        <StarIcon className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
                        <StarIcon className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
                        <StarIcon className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
                    </div>
                    <p className={`${textClasses} text-2xl mb-8`}>Final Score: <span className="font-bold text-cyan-400">{score}</span></p>
                    <button onClick={() => onComplete(score)} className="group bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-4 px-8 rounded-full transition text-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-1">
                        <StarIcon className="w-6 h-6 text-white group-hover:text-yellow-200 animate-spin-slow" />
                        Next Level 
                        <NextIcon />
                        <StarIcon className="w-6 h-6 text-white group-hover:text-yellow-200 animate-spin-slow" />
                    </button>
                </div>
            );
        }
        if (gameState === 'gameOver') {
            return (
                <div className={commonClasses}>
                    <h2 className={`text-4xl font-bold text-rose-500 mb-6`}>Game Over</h2>
                    <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl mb-8 w-full max-w-xs">
                        <p className={`${textClasses} text-lg`}>Score: <span className="font-bold text-white">{score}</span> / {targetScore}</p>
                    </div>
                    <div className="flex gap-4 w-full justify-center max-w-sm">
                        <button onClick={startGame} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition text-lg flex items-center justify-center gap-2 shadow-lg">
                            <RetryIcon /> Retry
                        </button>
                        <button onClick={() => setIsExitModalOpen(true)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition text-lg flex items-center justify-center gap-2 shadow-lg">
                            <HomeIcon className="w-6 h-6" /> Menu
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Snake body Gabor pattern
    const bodyBaseColor = '#60a5fa'; // Blue-400 like color
    const bodyTexture = `repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 2px, transparent 2px, transparent 4px)`;
    
    // Food Gabor pattern (High contrast)
    const foodGaborStyle = {
        backgroundImage: `repeating-linear-gradient(45deg, #ffffff, #ffffff 2px, #000000 2px, #000000 4px)`,
        backgroundColor: '#ffffff',
        backgroundSize: '100% 100%',
    };

    return (
        <div className="flex flex-col h-screen w-full bg-black font-sans select-none overflow-hidden">
             <header className="w-full p-3 sm:p-4 bg-slate-900 shadow-sm z-10 shrink-0 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div style={{ transform: 'scale(0.8)' }}>
                        <RingHomeButton onClick={() => { setIsPaused(true); setIsExitModalOpen(true); }} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-200 font-sans tracking-wide">LEVEL {String(subLevel).padStart(2, '0')}</h1>
                </div>
                <div className="text-center text-slate-200 font-sans">
                    <p className="text-xs sm:text-sm font-bold opacity-50 uppercase tracking-wider">TARGET</p>
                    <p className="text-lg sm:text-xl font-bold text-cyan-400">{score} / {targetScore}</p>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center w-full h-full overflow-hidden relative touch-none bg-black" onPointerDown={onPointerDown}>
                <div ref={gameContainerRef} className="w-full h-full flex items-center justify-center relative bg-black">
                    <div className="relative overflow-hidden pointer-events-auto bg-black" style={{ width: `${gridCols * cellSize}px`, height: `${gridRows * cellSize}px`, border: `${BORDER_THICKNESS}px solid #475569`, boxShadow: '0 0 30px rgba(6,182,212,0.1)' }}>
                        {renderOverlay()}
                        {/* Faint Grid */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`, backgroundSize: `${cellSize}px ${cellSize}px` }}></div>

                        {/* Hint Text when Waiting for Start */}
                        {gameState === 'playing' && direction === null && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                <div className="bg-black/50 text-cyan-400 px-6 py-3 rounded-full animate-pulse backdrop-blur-sm border border-cyan-500/30 text-lg font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                    Tap or Press Arrow Key to Start
                                </div>
                            </div>
                        )}

                        {snake.map((segment, index) => {
                            const isHead = index === 0;
                            const isTail = index === snake.length - 1;
                            
                            // Check connections
                            const prev = snake[index - 1]; // Towards Head
                            const next = snake[index + 1]; // Towards Tail

                            let connectUp = false;
                            let connectDown = false;
                            let connectLeft = false;
                            let connectRight = false;

                            const check = (other: {x: number, y: number}) => {
                                if (!other) return;
                                if (other.x === segment.x && other.y === segment.y - 1) connectUp = true;
                                if (other.x === segment.x && other.y === segment.y + 1) connectDown = true;
                                if (other.x === segment.x - 1 && other.y === segment.y) connectLeft = true;
                                if (other.x === segment.x + 1 && other.y === segment.y) connectRight = true;
                            };

                            check(prev);
                            check(next);

                            let rTL = '0', rTR = '0', rBR = '0', rBL = '0';
                            const R = '35%'; 

                            if (isHead || isTail) {
                                // Cap the ends
                                if (connectUp) { rBL = R; rBR = R; }
                                else if (connectDown) { rTL = R; rTR = R; }
                                else if (connectLeft) { rTR = R; rBR = R; }
                                else if (connectRight) { rTL = R; rBL = R; }
                                else { rTL=R; rTR=R; rBL=R; rBR=R; } // Single dot snake
                            } else {
                                // Body Turns
                                // Round the "Outer" corner of the turn to make it smooth.
                                if (connectUp && connectRight) rBL = R;
                                else if (connectUp && connectLeft) rBR = R;
                                else if (connectDown && connectRight) rTL = R;
                                else if (connectDown && connectLeft) rTR = R;
                                // Straight segments have 0 radius on connection sides
                            }

                            // Head Eye Rotation
                            let headRotation = 0;
                            if (isHead) {
                                if (direction === 'RIGHT') headRotation = 90;
                                else if (direction === 'DOWN') headRotation = 180;
                                else if (direction === 'LEFT') headRotation = 270;
                                else if (next) {
                                    if (next.y > segment.y) headRotation = 0;
                                    if (next.y < segment.y) headRotation = 180;
                                    if (next.x > segment.x) headRotation = 270;
                                    if (next.x < segment.x) headRotation = 90;
                                }
                            }

                            // DISABLE TRANSITION to make snake look like "One Piece" without breaking at corners
                            const transitionStyle = 'none';

                            return (
                                <div 
                                    key={index} 
                                    className="absolute" 
                                    style={{ 
                                        width: `${cellSize}px`,
                                        height: `${cellSize}px`,
                                        top: `${segment.y * cellSize}px`,
                                        left: `${segment.x * cellSize}px`,
                                        backgroundColor: bodyBaseColor, 
                                        backgroundImage: bodyTexture,
                                        transform: 'scale(1.1)', // Significant overlap to prevent gaps
                                        borderRadius: `${rTL} ${rTR} ${rBR} ${rBL}`,
                                        zIndex: isHead ? 30 : 20,
                                        transition: transitionStyle,
                                        boxShadow: isHead ? '0 0 15px rgba(96, 165, 250, 0.6)' : 'none'
                                    }}
                                >
                                    {isHead && (
                                        <div className="w-full h-full relative transition-transform duration-100" style={{ transform: `rotate(${headRotation}deg)` }}>
                                             {/* Star Eyes */}
                                            <div className="absolute top-[20%] left-[20%] text-yellow-100 animate-star-pulse text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">✦</div>
                                            <div className="absolute top-[20%] right-[20%] text-yellow-100 animate-star-pulse text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">✦</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Target (Food) - Scaled to Grid */}
                        <div 
                            className="absolute flex items-center justify-center transition-all duration-300 animate-pulse" 
                            style={{ 
                                width: `${cellSize}px`, 
                                height: `${cellSize}px`, 
                                top: `${target.y * cellSize}px`, 
                                left: `${target.x * cellSize}px`, 
                                zIndex: 10,
                                borderRadius: target.shape === 'circle' ? '50%' : '0%',
                                ...foodGaborStyle,
                                boxShadow: '0 0 15px rgba(255,255,255,0.6)'
                            }} 
                        />
                        
                        {/* Distractor - Scaled to Grid */}
                        {distractors.map(d => (
                             <div 
                                key={d.id} 
                                className="absolute flex items-center justify-center transition-opacity duration-300" 
                                style={{ 
                                    width: `${cellSize}px`, 
                                    height: `${cellSize}px`, 
                                    top: `${d.y * cellSize}px`, 
                                    left: `${d.x * cellSize}px`, 
                                    zIndex: 5,
                                    backgroundColor: '#4b5563', // Solid grey matching contrast
                                    borderRadius: d.shape === 'circle' ? '50%' : '0%'
                                }} 
                             />
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-2 left-4 z-20 pointer-events-none">
                    <div className="bg-slate-800/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-slate-700">
                        <p className="text-xs font-bold text-slate-300">Target: {acuityLabel}</p>
                    </div>
                </div>
            </main>
            <ConfirmationModal isOpen={isExitModalOpen} title="Confirm Exit" message="Return to level selection?" onConfirm={() => { setIsExitModalOpen(false); onExit(); }} onCancel={() => { setIsExitModalOpen(false); setIsPaused(false); }} confirmText="Exit" />
        </div>
    );
};

// --- Map Generation Logic ---

const LEVEL_ITEM_HEIGHT = 100; // Height per level
const DECORATION_COUNT = 80;

interface MapNode {
  id: number;
  x: number;
  y: number;
}

const generateMapPath = (): { nodes: MapNode[], decorations: any[] } => {
    const nodes: MapNode[] = [];
    const decorations: any[] = [];
    let currentX = 50;
    
    for (let i = 100; i >= 1; i--) {
        const y = (100 - i) * LEVEL_ITEM_HEIGHT + 150;
        
        if (i % 20 < 5) currentX = 50 + Math.sin(i) * 30;
        else if (i % 20 < 12) currentX = 50 + Math.cos(i * 0.2) * 35;
        else currentX = 50 + Math.sin(i * 0.4) * 20;
        
        currentX = Math.max(15, Math.min(85, currentX));
        nodes.push({ id: i, x: currentX, y });
    }

    for (let d = 0; d < DECORATION_COUNT; d++) {
        const levelIndex = Math.floor(Math.random() * 100) + 1; 
        const node = nodes.find(n => n.id === levelIndex) || nodes[0];
        
        const isLeft = Math.random() > 0.5;
        const dist = 15 + Math.random() * 25; 
        const decX = isLeft ? Math.max(5, node.x - dist) : Math.min(95, node.x + dist);
        const decY = node.y + (Math.random() * 80 - 40);
        
        let type = 'cloud';
        let scale = 0.5 + Math.random() * 0.8;

        if (levelIndex > 70) {
            type = 'star';
        } else if (levelIndex > 40) {
            const r = Math.random();
            if (r > 0.9) type = 'moon'; 
            else if (r > 0.4) type = 'star';
            else type = 'cloud';
        } else {
            type = 'cloud';
        }
        
        if (type === 'moon') { scale = 1.0; }

        decorations.push({ id: d, x: decX, y: decY, type, scale });
    }

    return { nodes, decorations };
};

// --- Main Map Component ---

const Level6: React.FC<{
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number) => void;
}> = ({ setCurrentPage, saveLevelCompletion }) => {
  const [view, setView] = useState<'map' | 'game'>('map');
  const [activeSubLevel, setActiveSubLevel] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(TOTAL_SUB_LEVELS);

  const { nodes, decorations } = useMemo(() => generateMapPath(), []);

  useEffect(() => {
    if (view === 'map' && scrollContainerRef.current) {
        setTimeout(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }
        }, 50);
    }
  }, [view]);

  const handleSubLevelClick = (level: number) => {
      if (level <= maxUnlockedLevel) {
          setActiveSubLevel(level);
          setView('game');
      }
  };

  const handleGameComplete = (score: number) => {
      if (activeSubLevel === maxUnlockedLevel && activeSubLevel < TOTAL_SUB_LEVELS) {
          setMaxUnlockedLevel(prev => Math.max(prev, activeSubLevel + 1));
      }
      setView('map');
  };

  const handleGameExit = () => {
      setView('map');
  };

  const handleMapExitRequest = () => {
      setCurrentPage('home');
  };

  const getVisuals = (level: number) => {
      const ratio = (level - 1) / 99; 
      const size = 90 - (ratio * 55);
      const opacity = 1.0 - (ratio * 0.5);

      let label = "6/60";
      if (level > 80) label = "6/6";
      else if (level > 60) label = "6/12";
      else if (level > 40) label = "6/24";
      else if (level > 20) label = "6/36";

      return { size, opacity, label };
  };

  const svgPathData = useMemo(() => {
      if (nodes.length < 2) return "";
      let d = `M ${nodes[0].x}% ${nodes[0].y}`;
      for (let i = 1; i < nodes.length; i++) {
          const curr = nodes[i];
          const prev = nodes[i-1];
          d += ` C ${prev.x}% ${prev.y + 50}, ${curr.x}% ${curr.y - 50}, ${curr.x}% ${curr.y}`;
      }
      return d;
  }, [nodes]);

  const renderMap = () => {
      const totalHeight = (TOTAL_SUB_LEVELS * LEVEL_ITEM_HEIGHT) + 300;

      return (
          <div className="h-screen flex flex-col relative overflow-hidden font-sans bg-black">
              
              <header className="absolute top-0 w-full p-4 backdrop-blur-md bg-white/10 shadow-lg z-50 border-b border-white/20">
                  <div className="max-w-4xl mx-auto flex justify-between items-center text-white">
                      <h1 className="text-2xl font-bold font-pixel text-shadow-sm">SNAKE SAGA</h1>
                      <div className="bg-white/20 px-3 py-1 rounded-full font-bold text-sm border border-white/30">
                          Level {activeSubLevel} / {TOTAL_SUB_LEVELS}
                      </div>
                  </div>
              </header>

              <div ref={scrollContainerRef} className="flex-grow overflow-y-auto relative z-10 custom-scrollbar">
                  <div 
                    style={{ 
                        height: `${totalHeight}px`, 
                        position: 'relative',
                        backgroundColor: '#000000',
                    }} 
                    className="w-full"
                  >
                      <div className="w-full max-w-2xl mx-auto h-full relative">
                        
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                            <path d={svgPathData} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeDasharray="12,8" strokeLinecap="round" />
                        </svg>

                        {decorations.map(dec => (
                            <div 
                                key={`dec-${dec.id}`}
                                className="absolute"
                                style={{ 
                                    left: `${dec.x}%`, 
                                    top: `${dec.y}px`, 
                                    transform: `translate(-50%, -50%) scale(${dec.scale})`,
                                    zIndex: 5
                                }}
                            >
                                {dec.type === 'cloud' && (
                                    <div className="text-6xl opacity-60 drop-shadow-lg text-slate-400 animate-float" style={{animationDelay: `${dec.id % 5}s`}}>☁️</div>
                                )}
                                {dec.type === 'star' && <div className="text-xl text-yellow-100 animate-twinkle" style={{animationDelay: `${dec.id % 3}s`}}>✨</div>}
                                
                                {dec.type === 'moon' && (
                                    <div className="relative">
                                        <div className="text-3xl opacity-90 animate-pulse-slow relative z-10 text-slate-200">🌙</div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white blur-xl opacity-40 animate-pulse"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-100 blur-2xl opacity-20"></div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {nodes.map((node, index) => {
                            const isUnlocked = node.id <= maxUnlockedLevel;
                            const { size, opacity, label } = getVisuals(node.id);
                            const isBoss = node.id % 10 === 0 || node.id === 1;
                            
                            let bgClass = "bg-white";
                            let borderClass = "border-slate-300";
                            let textClass = "text-slate-700";

                            if (node.id > 70) { 
                                bgClass = "bg-indigo-950"; borderClass = "border-indigo-400"; textClass = "text-indigo-100";
                            } else if (node.id > 30) { 
                                bgClass = "bg-indigo-100"; borderClass = "border-indigo-400"; textClass = "text-indigo-900";
                            } else { 
                                bgClass = "bg-sky-50"; borderClass = "border-sky-400"; textClass = "text-sky-700";
                            }

                            if (!isUnlocked) {
                                bgClass = "bg-slate-800"; borderClass = "border-slate-600"; textClass = "text-slate-500";
                            }

                            const floatDelay = `${(index % 5) * 0.5}s`;

                            return (
                                <div 
                                    key={node.id}
                                    className="absolute flex flex-col items-center justify-center z-20 animate-float-slow"
                                    style={{
                                        left: `${node.x}%`,
                                        top: `${node.y}px`,
                                        transform: 'translate(-50%, -50%)',
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        animationDelay: floatDelay
                                    }}
                                >
                                    <button
                                        onClick={() => handleSubLevelClick(node.id)}
                                        disabled={!isUnlocked}
                                        style={{ opacity: isUnlocked ? opacity : 0.4 }}
                                        className={`
                                            w-full h-full rounded-full flex items-center justify-center font-bold border-4 shadow-lg transition-transform hover:scale-110
                                            ${bgClass} ${borderClass} ${textClass}
                                            ${isBoss ? 'ring-4 ring-yellow-400/50' : ''}
                                        `}
                                    >
                                        {node.id}
                                    </button>
                                    
                                    {isBoss && (
                                        <div className="absolute top-full mt-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap backdrop-blur-sm border border-white/20 z-30 shadow-md">
                                            {label}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                      </div>
                  </div>
              </div>

              <div className="fixed bottom-6 right-6 z-30">
                <RingHomeButton onClick={handleMapExitRequest} />
              </div>
          </div>
      );
  };

  const currentAcuityLabel = getVisuals(activeSubLevel).label;

  return (
    <>
        {view === 'map' ? renderMap() : (
            <SnakeGame 
                subLevel={activeSubLevel} 
                acuityLabel={currentAcuityLabel}
                onExit={handleGameExit} 
                onComplete={handleGameComplete}
                saveMainProgress={(stars) => saveLevelCompletion('level6', stars)}
            />
        )}
        <style>{`
            .custom-scrollbar::-webkit-scrollbar { display: none; }
            .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .text-shadow-sm { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px) translateX(0px); }
                50% { transform: translateY(-10px) translateX(5px); }
            }
            .animate-float {
                animation: float 6s ease-in-out infinite;
            }
            
            @keyframes float-slow {
                0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
                50% { transform: translate(-50%, -50%) translateY(-8px); }
            }
            .animate-float-slow {
                animation: float-slow 5s ease-in-out infinite;
            }

            @keyframes twinkle {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.8); }
            }
            .animate-twinkle {
                animation: twinkle 3s ease-in-out infinite;
            }

            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
                animation: spin-slow 20s linear infinite;
            }

            @keyframes pulse-slow {
                0%, 100% { transform: scale(1); opacity: 0.9; }
                50% { transform: scale(1.05); opacity: 1; }
            }
            .animate-pulse-slow {
                animation: pulse-slow 4s ease-in-out infinite;
            }

             @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 40px rgba(253, 224, 71, 0.2); transform: scale(1); }
                50% { box-shadow: 0 0 80px rgba(253, 224, 71, 0.5); transform: scale(1.05); }
            }
            .animate-pulse-glow {
                animation: pulse-glow 5s ease-in-out infinite;
            }
            
            @keyframes star-pulse {
                0%, 100% { opacity: 1; transform: scale(1.2); filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8)); }
                50% { opacity: 0.6; transform: scale(0.9); filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.4)); }
            }
            .animate-star-pulse {
                animation: star-pulse 1s ease-in-out infinite;
            }
        `}</style>
    </>
  );
};

export default Level6;
