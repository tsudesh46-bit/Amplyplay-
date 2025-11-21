
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Page } from '../../types';
import { RetryIcon, HomeIcon, NextIcon } from '../ui/Icons';
import ConfirmationModal from '../ConfirmationModal';
import GaborCircle from '../GaborCircle';

// --- Constants ---
const INITIAL_SPEED = 800; 
const MIN_SPEED = 150;      
const SPEED_DECREMENT = 15; 

const TOTAL_SUB_LEVELS = 100;
const TARGET_CELL_SIZE = 60; 
const BORDER_THICKNESS = 10;

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
    sizePercent: number;
    color: string;
    id: string;
}

interface SnakeGameProps {
    subLevel: number;
    acuityLabel: string;
    onExit: () => void;
    onComplete: (score: number) => void;
    saveMainProgress: (stars: number) => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ subLevel, acuityLabel, onExit, onComplete, saveMainProgress }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const [gridCols, setGridCols] = useState(10);
    const [gridRows, setGridRows] = useState(10);
    const [cellSize, setCellSize] = useState(TARGET_CELL_SIZE);
    
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    
    const [snake, setSnake] = useState<{x: number, y: number}[]>([{ x: 3, y: 3 }]);
    const [target, setTarget] = useState({ x: 1, y: 1 });
    const [distractors, setDistractors] = useState<Distractor[]>([]);
    
    const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
    const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);

    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => { directionRef.current = direction; }, [direction]);

    const currentSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - (score * SPEED_DECREMENT));

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

        const newTarget = getRandomPos();
        const numDistractors = 1 + Math.floor(currentScore / 5); 
        
        const newDistractors: Distractor[] = [];
        for (let i = 0; i < numDistractors; i++) {
            const pos = getRandomPos();
            newDistractors.push({
                x: pos.x,
                y: pos.y,
                sizePercent: 0.7 + Math.random() * 0.3,
                color: Math.random() > 0.5 ? '#000000' : '#333333',
                id: `d-${Date.now()}-${i}`
            });
        }
        return { target: newTarget, distractors: newDistractors };
    }, []);

    const initGrid = useCallback(() => {
        if (gameContainerRef.current) {
            const width = gameContainerRef.current.clientWidth - (BORDER_THICKNESS * 2);
            const height = gameContainerRef.current.clientHeight - (BORDER_THICKNESS * 2);
            let cols = Math.floor(width / TARGET_CELL_SIZE);
            let rows = Math.floor(height / TARGET_CELL_SIZE);
            cols = Math.max(5, cols);
            rows = Math.max(5, rows);
            setGridCols(cols);
            setGridRows(rows);
            setCellSize(TARGET_CELL_SIZE);
            return { cols, rows };
        }
        return { cols: 10, rows: 10 };
    }, []);

    const startGame = useCallback(() => {
        const { cols, rows } = initGrid();
        const centerX = Math.floor(cols / 2);
        const centerY = Math.floor(rows / 2);
        const startSnake = [{ x: centerX, y: centerY }];
        const items = generateLevelItems(startSnake, cols, rows, 0);
        
        setSnake(startSnake);
        setTarget(items.target);
        setDistractors(items.distractors);
        setDirection('UP'); 
        directionRef.current = 'UP';
        if (score > highScore) setHighScore(score);
        setScore(0);
        setGameState('playing');
        setIsPaused(false);
    }, [generateLevelItems, score, highScore, initGrid]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
            if ((gameState === 'start' || gameState === 'gameOver') && e.key.includes('Arrow')) {
                startGame();
                return;
            }
            if (gameState !== 'playing' || isPaused || isExitModalOpen) return;
            const key = e.key;
            setDirection(prevDirection => {
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
    }, [gameState, startGame, isPaused, isExitModalOpen]);

    const handleInput = useCallback((clientX: number, clientY: number) => {
        if (gameState === 'start' || gameState === 'gameOver') {
            startGame();
            return;
        }
        if (gameState !== 'playing' || isPaused || isExitModalOpen) return;
        if (gameContainerRef.current) {
            const rect = gameContainerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = clientX - centerX;
            const deltaY = clientY - centerY;
            let newDirection = directionRef.current;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) { if (directionRef.current !== 'LEFT') newDirection = 'RIGHT'; } 
                else { if (directionRef.current !== 'RIGHT') newDirection = 'LEFT'; }
            } else {
                if (deltaY > 0) { if (directionRef.current !== 'UP') newDirection = 'DOWN'; } 
                else { if (directionRef.current !== 'DOWN') newDirection = 'UP'; }
            }
            if (newDirection && newDirection !== directionRef.current) setDirection(newDirection);
        }
    }, [gameState, isPaused, isExitModalOpen, startGame]);

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
            if (!currentDir) return;
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
                    const newScore = score + 1;
                    setScore(newScore);
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
    }, [gameState, currentSpeed, target, distractors, score, highScore, saveMainProgress, isPaused, isExitModalOpen, gridCols, gridRows, generateLevelItems]);

    useEffect(() => {
        const handleResize = () => initGrid();
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [initGrid]);

    const renderOverlay = () => {
        const commonClasses = "absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-center z-40 p-4 font-pixel rounded-md";
        const textClasses = "text-slate-800";
        if (gameState === 'start') {
            return (
                <div className={commonClasses}>
                <h2 className={`text-3xl sm:text-4xl ${textClasses} mb-4`}>LEVEL {subLevel}</h2>
                <p className={`text-base text-cyan-700 font-sans mb-4 font-bold`}>Keep screen 1m away</p>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center bg-slate-100 p-2 rounded">
                             <div className="w-6 h-6 bg-black rounded-full"></div>
                        </div>
                        <span className="text-xs font-sans text-slate-500 mt-1">Snake</span>
                    </div>
                    <span className="text-slate-400">➔</span>
                    <div className="flex flex-col items-center">
                        <GaborCircle size={24} contrast={1} onClick={()=>{}} />
                        <span className="text-xs font-sans text-slate-500 mt-1">Eat</span>
                    </div>
                </div>
                <p className={`text-xl sm:text-2xl ${textClasses}`}>Tap to Start</p>
                </div>
            );
        }
        if (gameState === 'gameOver') {
            return (
                <div className={commonClasses}>
                    <h2 className={`text-3xl sm:text-4xl ${textClasses} mb-4`}>Game Over</h2>
                    <div className="bg-slate-800/10 p-4 rounded-md my-6 w-full max-w-xs">
                    <p className={`${textClasses} text-lg`}>Score: <span className="font-bold">{score}</span></p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={startGame} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg flex items-center justify-center gap-2 shadow-lg">
                            <RetryIcon /> Retry
                        </button>
                        <button onClick={() => onComplete(score)} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg flex items-center justify-center gap-2 shadow-lg">
                            <NextIcon /> Done
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    };

    const gaborStyle = {
        backgroundImage: `repeating-linear-gradient(45deg, rgba(180, 180, 180, 1), rgba(180, 180, 180, 1) 3px, rgba(80, 80, 80, 1) 3px, rgba(80, 80, 80, 1) 6px)`,
        backgroundSize: '100% 100%',
    };

    const renderSnakeHead = (x: number, y: number) => {
        let rotation = 0;
        switch(direction) {
            case 'UP': rotation = 0; break;
            case 'RIGHT': rotation = 90; break;
            case 'DOWN': rotation = 180; break;
            case 'LEFT': rotation = 270; break;
        }
        return (
            <div className="absolute flex items-center justify-center z-30 transition-all duration-75" style={{ width: `${cellSize}px`, height: `${cellSize}px`, top: `${y * cellSize}px`, left: `${x * cellSize}px`, transform: `rotate(${rotation}deg)` }}>
                <div className="absolute w-full h-full bg-black/30 rounded-full scale-125 blur-sm"></div>
                <div className="absolute w-[140%] h-[100%] bg-black rounded-[50%] top-[10%] transition-all"></div>
                <div className="relative w-[70%] h-[90%] bg-gradient-to-b from-slate-800 to-black rounded-full border border-slate-700 flex flex-col items-center pt-[20%]">
                     <div className="flex w-full justify-around px-1">
                         <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_4px_yellow]"></div>
                         <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_4px_yellow]"></div>
                     </div>
                     <div className="w-2 h-4 bg-slate-700 mt-1 rounded-full opacity-50"></div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen w-full bg-white font-sans select-none overflow-hidden">
             <header className="w-full p-3 sm:p-4 bg-white shadow-sm z-10 shrink-0 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div style={{ transform: 'scale(0.8)' }}>
                        <RingHomeButton onClick={() => { setIsPaused(true); setIsExitModalOpen(true); }} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-700 font-pixel">LVL {String(subLevel).padStart(2, '0')}</h1>
                </div>
                <div className="text-center text-slate-700 font-pixel">
                    <p className="text-xs sm:text-sm font-bold opacity-50">SCORE</p>
                    <p className="text-lg sm:text-xl font-bold">{String(score).padStart(4, '0')}</p>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center w-full h-full overflow-hidden relative touch-none bg-white" onPointerDown={onPointerDown}>
                <div ref={gameContainerRef} className="w-full h-full flex items-center justify-center relative bg-slate-50">
                    <div className="relative overflow-hidden pointer-events-auto bg-white" style={{ width: `${gridCols * cellSize}px`, height: `${gridRows * cellSize}px`, border: `${BORDER_THICKNESS}px solid transparent`, borderImage: 'repeating-linear-gradient(45deg, #808080, #808080 5px, #202020 5px, #202020 10px) 1', boxShadow: '0 0 20px rgba(0,0,0,0.2)' }}>
                        {renderOverlay()}
                        {snake.map((segment, index) => {
                            const isHead = index === 0;
                            if (isHead) return <React.Fragment key={`${index}-${segment.x}-${segment.y}`}>{renderSnakeHead(segment.x, segment.y)}</React.Fragment>;
                            const isGabor = index % 2 !== 0;
                            return (
                                <div key={`${index}-${segment.x}-${segment.y}`} className="absolute transition-all duration-75 rounded-full" style={{ width: `${cellSize * 0.9}px`, height: `${cellSize * 0.9}px`, top: `${segment.y * cellSize + (cellSize * 0.05)}px`, left: `${segment.x * cellSize + (cellSize * 0.05)}px`, backgroundColor: isGabor ? 'transparent' : '#0f172a', ...(isGabor ? gaborStyle : {}), zIndex: 20, boxShadow: '2px 2px 5px rgba(0,0,0,0.3)' }} />
                            );
                        })}
                        <div className="absolute flex items-center justify-center transition-all duration-300" style={{ width: `${cellSize}px`, height: `${cellSize}px`, top: `${target.y * cellSize}px`, left: `${target.x * cellSize}px`, zIndex: 10 }}>
                             <GaborCircle size={cellSize * 0.75} contrast={1} onClick={()=>{}} />
                        </div>
                        {distractors.map(d => (
                             <div key={d.id} className="absolute flex items-center justify-center transition-opacity duration-300" style={{ width: `${cellSize}px`, height: `${cellSize}px`, top: `${d.y * cellSize}px`, left: `${d.x * cellSize}px`, zIndex: 5 }}>
                                 <div style={{ width: `${cellSize * d.sizePercent}px`, height: `${cellSize * d.sizePercent}px`, backgroundColor: d.color, borderRadius: '50%', boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.1)' }} />
                             </div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-2 left-4 z-20 pointer-events-none">
                    <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-slate-200">
                        <p className="text-xs font-bold text-slate-600">Target: {acuityLabel} (1m)</p>
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
    
    // HTML flow is Top(y=0) to Bottom(y=Max).
    // User starts at Bottom (Level 1) and scrolls Up.
    // So Level 1 should have the highest Y value.
    
    for (let i = 100; i >= 1; i--) {
        const y = (100 - i) * LEVEL_ITEM_HEIGHT + 150;
        
        if (i % 20 < 5) currentX = 50 + Math.sin(i) * 30;
        else if (i % 20 < 12) currentX = 50 + Math.cos(i * 0.2) * 35;
        else currentX = 50 + Math.sin(i * 0.4) * 20;
        
        currentX = Math.max(15, Math.min(85, currentX));
        nodes.push({ id: i, x: currentX, y });
    }

    // Generate decorations relative to path
    // Bottom (Level 1-30): Sky (Clouds) - NO BIRDS, NO SUN (Manual)
    // Mid (Level 31-70): Upper Atmosphere (Moon, Stars, Dark Clouds)
    // Top (Level 71-100): Space (Stars only - no planets)
    
    for (let d = 0; d < DECORATION_COUNT; d++) {
        const levelIndex = Math.floor(Math.random() * 100) + 1; // 1 to 100
        const node = nodes.find(n => n.id === levelIndex) || nodes[0];
        
        const isLeft = Math.random() > 0.5;
        const dist = 15 + Math.random() * 25; 
        const decX = isLeft ? Math.max(5, node.x - dist) : Math.min(95, node.x + dist);
        const decY = node.y + (Math.random() * 80 - 40);
        
        let type = 'cloud';
        let scale = 0.5 + Math.random() * 0.8;

        if (levelIndex > 70) {
            // Deep Space - Stars only
            type = 'star';
        } else if (levelIndex > 40) {
            // Upper Sky / Twilight - Moon/Star/Cloud
            const r = Math.random();
            if (r > 0.9) type = 'moon'; // Moon is rare
            else if (r > 0.4) type = 'star';
            else type = 'cloud';
        } else {
            // Lower Sky - Clouds only
            type = 'cloud';
        }
        
        // Unique adjustments
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

  // Initial Scroll to Bottom (Level 1)
  useEffect(() => {
    if (view === 'map' && scrollContainerRef.current) {
        // Set timeout to ensure layout is fully painted
        setTimeout(() => {
            if (scrollContainerRef.current) {
                // Scroll instantly to the bottom
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
      // Level 1 (Bottom): Big, Clear (6/60)
      // Level 100 (Top): Small, Faint (6/6)
      
      const ratio = (level - 1) / 99; 
      
      const size = 90 - (ratio * 55); // 90px -> 35px
      const opacity = 1.0 - (ratio * 0.5); // 1.0 -> 0.5

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
              
              {/* Header */}
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
                        
                        {/* Path Line */}
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                            <path d={svgPathData} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeDasharray="12,8" strokeLinecap="round" />
                        </svg>

                        {/* Decorations */}
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
                                
                                {/* Enhanced Moon with Shine */}
                                {dec.type === 'moon' && (
                                    <div className="relative">
                                        <div className="text-3xl opacity-90 animate-pulse-slow relative z-10 text-slate-200">🌙</div>
                                        {/* Shining Glow Effect */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white blur-xl opacity-40 animate-pulse"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-100 blur-2xl opacity-20"></div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Nodes */}
                        {nodes.map((node, index) => {
                            const isUnlocked = node.id <= maxUnlockedLevel;
                            const { size, opacity, label } = getVisuals(node.id);
                            const isBoss = node.id % 10 === 0 || node.id === 1;
                            
                            let bgClass = "bg-white";
                            let borderClass = "border-slate-300";
                            let textClass = "text-slate-700";

                            // Style based on environment
                            if (node.id > 70) { // Space
                                bgClass = "bg-indigo-950"; borderClass = "border-indigo-400"; textClass = "text-indigo-100";
                            } else if (node.id > 30) { // Twilight/Upper Sky
                                bgClass = "bg-indigo-100"; borderClass = "border-indigo-400"; textClass = "text-indigo-900";
                            } else { // Lower Sky
                                bgClass = "bg-sky-50"; borderClass = "border-sky-400"; textClass = "text-sky-700";
                            }

                            if (!isUnlocked) {
                                bgClass = "bg-slate-800"; borderClass = "border-slate-600"; textClass = "text-slate-500";
                            }

                            // Random slight floating delay for natural look
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
                                    
                                    {/* Acuity Label - Always show for Boss levels */}
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
        `}</style>
    </>
  );
};

export default Level6;
