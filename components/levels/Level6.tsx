
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Page } from '../../types';
import { RetryIcon, HomeIcon, NextIcon, StarIcon } from '../ui/Icons';
import ConfirmationModal from '../ConfirmationModal';

// --- Constants ---
// Slowed down speed for better accessibility
const MIN_SPEED = 500; 
const SPEED_DECREMENT = 2; 

const TOTAL_SUB_LEVELS = 100;
const BORDER_THICKNESS = 4;

// Approximation: 96DPI -> 1cm is ~38px. 2cm radius = 4cm diameter ~ 152px.
const BASE_CELL_SIZE_PX = 150; 

const ACUITY_MILESTONES = [
    { label: '6/60', limit: 16 },
    { label: '6/36', limit: 32 },
    { label: '6/24', limit: 48 },
    { label: '6/18', limit: 64 },
    { label: '6/12', limit: 80 },
    { label: '6/9', limit: 100 }
];

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
    return 100; 
};

const getCellSizeForLevel = (level: number) => {
    return Math.floor(Math.max(40, BASE_CELL_SIZE_PX - ((level - 1) * 0.36)));
};

const SnakeGame: React.FC<SnakeGameProps> = ({ subLevel, acuityLabel, onExit, onComplete, saveMainProgress }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gridCols, setGridCols] = useState(10);
    const [gridRows, setGridRows] = useState(10);
    
    // Dynamic cell size based on acuity level
    const cellSize = getCellSizeForLevel(subLevel);
    
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'levelComplete'>('start');
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    
    // Logic State
    const [snake, setSnake] = useState<{x: number, y: number}[]>([{ x: 5, y: 5 }]);
    const [target, setTarget] = useState<Target>({ x: 2, y: 2, shape: 'circle' });
    const [distractors, setDistractors] = useState<Distractor[]>([]);
    
    const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
    const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
    const nextDirectionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null); // Buffer for next input
    const intervalRef = useRef<any>(null);

    // Animation Refs
    const prevSnakeRef = useRef<{x: number, y: number}[]>([{ x: 5, y: 5 }]);
    const lastMoveTimeRef = useRef<number>(0);
    const isEatingRef = useRef<boolean>(false);
    const speedRef = useRef<number>(MIN_SPEED);

    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Refs for regeneration logic
    const targetRef = useRef<Target>(target);
    const scoreRef = useRef<number>(score);

    useEffect(() => { directionRef.current = direction; }, [direction]);
    useEffect(() => { targetRef.current = target; }, [target]);
    useEffect(() => { scoreRef.current = score; }, [score]);
    
    // Reset game state when level changes
    useEffect(() => {
        setGameState('start');
        setDirection(null);
        directionRef.current = null;
        nextDirectionRef.current = null;
    }, [subLevel]);

    const startSpeed = useMemo(() => {
        return 1500 - ((subLevel - 1) * 4); // Slower base speed (1.5s per tile at start)
    }, [subLevel]);

    const currentSpeed = Math.max(MIN_SPEED, startSpeed - (score * SPEED_DECREMENT));
    useEffect(() => { speedRef.current = currentSpeed; }, [currentSpeed]);
    
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
            } while (occupied.has(key) && attempts < 200);
            
            occupied.add(key);
            return { x, y };
        };

        const newTargetPos = getRandomPos();
        const newTarget: Target = {
            ...newTargetPos,
            shape: Math.random() > 0.5 ? 'circle' : 'square'
        };
        
        // Always exactly 1 distractor to ensure "one fake patch and one correct patch"
        const numDistractors = 1; 
        
        const newDistractors: Distractor[] = [];
        for (let i = 0; i < numDistractors; i++) {
            const pos = getRandomPos();
            newDistractors.push({
                x: pos.x,
                y: pos.y,
                shape: Math.random() > 0.5 ? 'circle' : 'square',
                color: '#374151', 
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
        const centerX = Math.floor(cols / 2);
        const centerY = Math.floor(rows / 2);
        const startSnake = [{ x: centerX, y: centerY }];
        
        const items = generateLevelItems(startSnake, cols, rows, 0);
        
        setSnake(startSnake);
        prevSnakeRef.current = startSnake;
        setTarget(items.target);
        setDistractors(items.distractors);
        
        setDirection(null); 
        directionRef.current = null;
        nextDirectionRef.current = null;
        
        if (score > highScore) setHighScore(score);
        setScore(0);
        setGameState('playing');
        setIsPaused(false);
    }, [generateLevelItems, score, highScore, initGrid]);

    const moveSnake = useCallback(() => {
        if (nextDirectionRef.current) {
            directionRef.current = nextDirectionRef.current;
            setDirection(nextDirectionRef.current);
            nextDirectionRef.current = null;
        }
        
        const currentDir = directionRef.current;
        if (!currentDir) {
            lastMoveTimeRef.current = Date.now();
            return;
        }
        
        setSnake(prevSnake => {
            prevSnakeRef.current = prevSnake;
            lastMoveTimeRef.current = Date.now();

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
                isEatingRef.current = true;
                const newScore = score + 1;
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
            } else {
                isEatingRef.current = false;
                return [next, ...prevSnake.slice(0, -1)];
            }
        });
    }, [gridCols, gridRows, target, distractors, score, highScore, saveMainProgress, generateLevelItems, targetScore]);

    useEffect(() => {
        let itemsInvalid = false;
        
        if (target.x >= gridCols || target.y >= gridRows) itemsInvalid = true;
        
        if (!itemsInvalid && distractors.some(d => d.x >= gridCols || d.y >= gridRows)) {
            itemsInvalid = true;
        }

        if (itemsInvalid) {
            const items = generateLevelItems(snake, gridCols, gridRows, score);
            setTarget(items.target);
            setDistractors(items.distractors);
        }
    }, [gridCols, gridRows, snake, score, generateLevelItems, target, distractors]);

    const resetGameLoop = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
             moveSnake();
        }, speedRef.current);
    }, [moveSnake]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
            
            if (gameState !== 'playing' || isPaused || isExitModalOpen) return;
            
            const key = e.key;
            let newDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
            
            switch (key) {
                case 'ArrowUp': newDir = 'UP'; break;
                case 'ArrowDown': newDir = 'DOWN'; break;
                case 'ArrowLeft': newDir = 'LEFT'; break;
                case 'ArrowRight': newDir = 'RIGHT'; break;
            }

            if (newDir) {
                const current = directionRef.current;
                
                if (!current) {
                    nextDirectionRef.current = newDir;
                    moveSnake(); 
                    resetGameLoop();
                    return;
                }

                if (current === 'LEFT' && newDir === 'RIGHT') return;
                if (current === 'RIGHT' && newDir === 'LEFT') return;
                if (current === 'UP' && newDir === 'DOWN') return;
                if (current === 'DOWN' && newDir === 'UP') return;

                nextDirectionRef.current = newDir;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, isPaused, isExitModalOpen, moveSnake, resetGameLoop]); 

    const handleInput = useCallback((clientX: number, clientY: number) => {
        if (gameState !== 'playing' || isPaused || isExitModalOpen) return;

        if (gameContainerRef.current) {
            const rect = gameContainerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = clientX - centerX;
            const deltaY = clientY - centerY;
            
            let newDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) newDirection = 'RIGHT'; 
                else newDirection = 'LEFT';
            } else {
                if (deltaY > 0) newDirection = 'DOWN'; 
                else newDirection = 'UP'; 
            }
            
            const current = directionRef.current;
             
             if (!current) {
                nextDirectionRef.current = newDirection;
                moveSnake();
                resetGameLoop();
                return;
            }

            if (current === 'LEFT' && newDirection === 'RIGHT') return;
            if (current === 'RIGHT' && newDirection === 'LEFT') return;
            if (current === 'UP' && newDirection === 'DOWN') return;
            if (current === 'DOWN' && newDirection === 'UP') return;

            if (newDirection) {
                nextDirectionRef.current = newDirection;
            }
        }
    }, [gameState, isPaused, isExitModalOpen, moveSnake, resetGameLoop]);

    const onPointerDown = (e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;
        e.preventDefault(); 
        handleInput(e.clientX, e.clientY);
    };

    useEffect(() => {
        if (gameState === 'playing' && !isPaused && !isExitModalOpen) {
            resetGameLoop();
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [gameState, isPaused, isExitModalOpen, resetGameLoop]);

    useEffect(() => {
        let animationFrameId: number;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = gridCols * cellSize;
        canvas.height = gridRows * cellSize;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (gameState !== 'playing') return;

            const now = Date.now();
            const elapsed = now - lastMoveTimeRef.current;
            const duration = speedRef.current;
            const t = Math.min(1, Math.max(0, elapsed / duration));
            
            const currentSnake = snake;
            const prevSnake = prevSnakeRef.current;
            
            if (currentSnake.length === 0) return;

            let visualPoints: {x: number, y: number}[] = [];

            if (prevSnake.length > 0 && currentSnake.length > 0) {
                const pHead = prevSnake[0];
                const cHead = currentSnake[0];
                
                const vHeadX = pHead.x + (cHead.x - pHead.x) * t;
                const vHeadY = pHead.y + (cHead.y - pHead.y) * t;
                
                visualPoints.push({ x: vHeadX, y: vHeadY });
            } else {
                 visualPoints.push(currentSnake[0]);
            }

            for (let i = 1; i < currentSnake.length; i++) {
                visualPoints.push(currentSnake[i]);
            }

            if (!isEatingRef.current && prevSnake.length > 0 && currentSnake.length > 0) {
                 const pTail = prevSnake[prevSnake.length - 1]; 
                 const cTail = currentSnake[currentSnake.length - 1]; 
                 
                 const vTailX = pTail.x + (cTail.x - pTail.x) * t;
                 const vTailY = pTail.y + (cTail.y - pTail.y) * t;
                 
                 visualPoints.push({ x: vTailX, y: vTailY });
            } else if (currentSnake.length > 0) {
                 visualPoints.push(currentSnake[currentSnake.length-1]);
            }
            
            if (visualPoints.length < 2 && currentSnake.length > 0) {
                 visualPoints = [visualPoints[0], visualPoints[0]]; 
            }

            const snakeWidth = Math.min(75, cellSize * 0.9);
            const stepSize = 1; 
            
            let currentDistanceTraveled = 0;
            
            let totalLen = 0;
            for (let i = 0; i < visualPoints.length - 1; i++) {
                const dx = visualPoints[i+1].x - visualPoints[i].x;
                const dy = visualPoints[i+1].y - visualPoints[i].y;
                totalLen += Math.sqrt(dx*dx + dy*dy);
            }
            if (totalLen === 0) totalLen = 1;

            for (let i = 0; i < visualPoints.length - 1; i++) {
                const p1 = visualPoints[i];
                const p2 = visualPoints[i+1];
                
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                const pixelDist = dist * cellSize;
                const steps = Math.ceil(pixelDist / stepSize);
                
                if (pixelDist <= 0) continue;

                for (let j = 0; j <= steps; j++) {
                    const ratio = j / steps;
                    const x = p1.x + dx * ratio;
                    const y = p1.y + dy * ratio;
                    
                    const totalDist = currentDistanceTraveled + (pixelDist * ratio);
                    const normalizedPos = (currentDistanceTraveled + pixelDist * ratio) / (totalLen * cellSize);

                    const stripeFrequency = 0.2; 
                    const gratingValue = Math.sin(totalDist * stripeFrequency);
                    
                    const contrastFrequency = 0.02;
                    const rawEnvelope = (Math.sin(totalDist * contrastFrequency) + 1) / 2;
                    const contrast = 0.1 + 0.9 * rawEnvelope;
                    const effectiveContrast = totalDist < cellSize * 2 ? 1.0 : contrast;

                    const baseLightness = Math.max(20, 98 - (normalizedPos * 78));
                    const gaborMod = gratingValue * 25 * effectiveContrast;
                    
                    ctx.beginPath();
                    ctx.arc(x * cellSize + cellSize/2, y * cellSize + cellSize/2, snakeWidth/2, 0, Math.PI * 2);
                    ctx.fillStyle = `hsl(0, 0%, ${baseLightness + gaborMod}%)`;
                    ctx.fill();
                }
                currentDistanceTraveled += pixelDist;
            }
            
            if(visualPoints.length > 0) {
                 const pHead = visualPoints[0];
                 
                 let angle = 0;
                 if (visualPoints.length > 1) {
                     const pNext = visualPoints[1];
                     const dx = pHead.x - pNext.x;
                     const dy = pHead.y - pNext.y;
                     
                     if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
                        angle = Math.atan2(dy, dx) + Math.PI/2; 
                     } else if (directionRef.current) {
                        switch(directionRef.current) {
                            case 'UP': angle = 0; break;
                            case 'RIGHT': angle = Math.PI/2; break;
                            case 'DOWN': angle = Math.PI; break;
                            case 'LEFT': angle = -Math.PI/2; break;
                        }
                     }
                 } else if (directionRef.current) {
                     switch(directionRef.current) {
                        case 'UP': angle = 0; break;
                        case 'RIGHT': angle = Math.PI/2; break;
                        case 'DOWN': angle = Math.PI; break;
                        case 'LEFT': angle = -Math.PI/2; break;
                    }
                 }

                 ctx.beginPath();
                 ctx.arc(pHead.x * cellSize + cellSize/2, pHead.y * cellSize + cellSize/2, snakeWidth/2, 0, Math.PI * 2);
                 ctx.fillStyle = `hsl(0, 0%, 95%)`;
                 ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
                 ctx.shadowBlur = 12;
                 ctx.fill();
                 ctx.shadowBlur = 0;

                 ctx.save();
                 ctx.translate(pHead.x * cellSize + cellSize/2, pHead.y * cellSize + cellSize/2);
                 ctx.rotate(angle);
                 
                 ctx.fillStyle = "#fef08a"; 
                 const eyeOffsetX = snakeWidth * 0.25;
                 const eyeOffsetY = -snakeWidth * 0.1;
                 const starSize = snakeWidth * 0.15;
                 
                 const pulse = 1 + Math.sin(now / 100) * 0.2;

                 const drawStar = (cx: number, cy: number) => {
                     ctx.beginPath();
                     for(let k=0; k<4; k++) {
                         ctx.lineTo(cx + Math.cos((k*90)*Math.PI/180)*starSize*pulse, cy + Math.sin((k*90)*Math.PI/180)*starSize*pulse);
                         ctx.lineTo(cx + Math.cos((k*90+45)*Math.PI/180)*starSize*0.4*pulse, cy + Math.sin((k*90+45)*Math.PI/180)*starSize*0.4*pulse);
                     }
                     ctx.closePath();
                     ctx.fill();
                     ctx.shadowColor = "white";
                     ctx.shadowBlur = 5;
                     ctx.stroke();
                     ctx.shadowBlur = 0;
                 };
                 
                 drawStar(-eyeOffsetX, eyeOffsetY);
                 drawStar(eyeOffsetX, eyeOffsetY);
                 
                 ctx.restore();
            }

            animationFrameId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationFrameId);

    }, [snake, gridCols, gridRows, cellSize, gameState]); 

    useEffect(() => {
        const handleResize = () => initGrid();
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [initGrid]);

    const distractorGaborStyle = {
        backgroundImage: `repeating-linear-gradient(135deg, #374151, #374151 2px, #111827 2px, #111827 4px)`, 
        backgroundColor: '#374151',
        backgroundSize: '100% 100%',
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)'
    };
    
    const foodGaborStyle = {
        backgroundImage: `repeating-linear-gradient(45deg, #ffffff, #ffffff 2px, #000000 2px, #000000 4px)`,
        backgroundColor: '#ffffff',
        backgroundSize: '100% 100%',
    };

    const renderOverlay = () => {
        const commonClasses = "absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center z-40 p-6 font-sans rounded-md border border-slate-800";
        const textClasses = "text-white";
        
        if (gameState === 'start') {
            return (
                <div className={commonClasses}>
                    <div className="flex flex-col items-center justify-center bg-slate-900/40 p-10 rounded-3xl border-4 border-cyan-500 shadow-[0_0_50px_rgba(34,211,238,0.25)] backdrop-blur-md relative animate-bounce-in max-w-lg w-full">
                        <div className="absolute inset-3 border border-cyan-400/20 rounded-2xl pointer-events-none"></div>

                        <h2 className={`text-5xl font-bold ${textClasses} mb-1 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>LEVEL 06</h2>
                        <p className={`text-xl text-cyan-400 font-bold mb-8 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}>TARGET SCORE: {targetScore}</p>
                        
                        <div className="flex items-center justify-around w-full mb-10 px-4">
                            <div className="flex flex-col items-center gap-3">
                                <div 
                                    style={{
                                        width: '60px', 
                                        height: '60px', 
                                        borderRadius: '50%',
                                        ...foodGaborStyle,
                                        boxShadow: '0 0 20px rgba(255,255,255,0.4)'
                                    }}
                                ></div>
                                <span className="text-white font-bold text-lg tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">FIND</span>
                            </div>
                            
                            <div className="h-16 w-0.5 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"></div>
                            
                            <div className="flex flex-col items-center gap-3">
                                <div 
                                    style={{
                                        width: '60px', 
                                        height: '60px', 
                                        borderRadius: '50%',
                                        ...distractorGaborStyle
                                    }}
                                ></div>
                                <span className="text-slate-400 font-bold text-lg tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">AVOID</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={startGame}
                            className="group relative px-12 py-5 bg-cyan-950/50 border-2 border-cyan-400 rounded-full transition-all duration-300 hover:scale-105 hover:bg-cyan-900/80 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] z-10"
                        >
                            <div className="flex items-center justify-center gap-4">
                                <StarIcon className="w-8 h-8 text-cyan-400 group-hover:text-cyan-200 animate-spin-slow" />
                                <span className="text-2xl font-bold text-cyan-400 group-hover:text-cyan-200 tracking-wider">
                                    START GAME
                                </span>
                                 <StarIcon className="w-8 h-8 text-cyan-400 group-hover:text-cyan-200 animate-spin-slow" />
                            </div>
                        </button>
                    </div>

                    <style>{`
                        @keyframes bounce-in {
                            0% { transform: scale(0.8); opacity: 0; }
                            70% { transform: scale(1.02); opacity: 1; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                        .animate-bounce-in {
                            animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                        }
                        @keyframes spin-slow {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                        .animate-spin-slow {
                            animation: spin-slow 4s linear infinite;
                        }
                    `}</style>
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

    return (
        <div className="flex flex-col h-screen w-full bg-black font-sans select-none overflow-hidden">
             <header className="w-full p-2 bg-slate-900 shadow-sm z-10 shrink-0 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4 pl-2">
                    <div style={{ transform: 'scale(0.8)' }}>
                        <RingHomeButton onClick={() => { setIsPaused(true); setIsExitModalOpen(true); }} />
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar pl-2">
                        {ACUITY_MILESTONES.map((m, idx) => {
                             const currentIndex = ACUITY_MILESTONES.findIndex(item => subLevel <= item.limit);
                             const activeIndex = currentIndex === -1 ? ACUITY_MILESTONES.length - 1 : currentIndex;
                             const isActive = idx === activeIndex;
                             
                             return (
                                 <div key={m.label} className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'opacity-100 scale-110' : 'opacity-30 scale-90'}`}>
                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight">TARGET</span>
                                     <span className={`text-sm sm:text-lg font-bold font-mono leading-tight ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>{m.label}</span>
                                 </div>
                             );
                        })}
                    </div>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center w-full h-full overflow-hidden relative touch-none bg-black" onPointerDown={onPointerDown}>
                <div ref={gameContainerRef} className="w-full h-full flex items-center justify-center relative bg-black">
                    <div className="relative overflow-hidden pointer-events-auto bg-black" style={{ width: `${gridCols * cellSize}px`, height: `${gridRows * cellSize}px`, border: `${BORDER_THICKNESS}px solid #475569`, boxShadow: '0 0 30px rgba(6,182,212,0.1)' }}>
                        {renderOverlay()}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`, backgroundSize: `${cellSize}px ${cellSize}px` }}></div>

                        {gameState === 'playing' && direction === null && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                <div className="bg-black/50 text-cyan-400 px-6 py-3 rounded-full animate-pulse backdrop-blur-sm border border-cyan-500/30 text-lg font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                    Tap or Press Arrow Key to Start
                                </div>
                            </div>
                        )}

                        {gameState === 'playing' && (
                            <>
                                <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />

                                {target.x < gridCols && target.y < gridRows && (
                                     <div 
                                        className="absolute flex items-center justify-center transition-all duration-300 animate-pulse" 
                                        style={{ 
                                            width: `${cellSize}px`, 
                                            height: `${cellSize}px`, 
                                            top: `${target.y * cellSize}px`, 
                                            left: `${target.x * cellSize}px`, 
                                            zIndex: 100, 
                                            borderRadius: target.shape === 'circle' ? '50%' : '0%',
                                            ...foodGaborStyle,
                                            boxShadow: '0 0 15px rgba(255,255,255,0.6)'
                                        }} 
                                    />
                                )}
                                
                                {distractors.map(d => {
                                     if (d.x >= gridCols || d.y >= gridRows) return null;
                                     return (
                                         <div 
                                            key={d.id} 
                                            className="absolute flex items-center justify-center transition-opacity duration-300" 
                                            style={{ 
                                                width: `${cellSize}px`, 
                                                height: `${cellSize}px`, 
                                                top: `${d.y * cellSize}px`, 
                                                left: `${d.x * cellSize}px`, 
                                                zIndex: 5,
                                                borderRadius: d.shape === 'circle' ? '50%' : '0%',
                                                ...distractorGaborStyle
                                            }} 
                                         />
                                     );
                                })}
                            </>
                        )}
                    </div>
                </div>
            </main>
            <ConfirmationModal 
                isOpen={isExitModalOpen} 
                title="Confirm Exit" 
                message="Do you want to exit to the Main Menu?" 
                onConfirm={() => { setIsExitModalOpen(false); onExit(); }} 
                onCancel={() => { setIsExitModalOpen(false); setIsPaused(false); }} 
                confirmText="Exit" 
            />
        </div>
    );
};

interface Level6Props {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number) => void;
}

const Level6: React.FC<Level6Props> = ({ setCurrentPage, saveLevelCompletion }) => {
    const [subLevel, setSubLevel] = useState(1);

    const handleSubLevelComplete = (score: number) => {
        if (subLevel < TOTAL_SUB_LEVELS) {
            setSubLevel(prev => prev + 1);
        } else {
            saveLevelCompletion('level6', 3);
            setCurrentPage('home');
        }
    };

    const handleExit = () => {
        setCurrentPage('home');
    };

    const getAcuityLabel = (level: number) => {
        return `Level ${level}`;
    };

    return (
        <SnakeGame 
            subLevel={subLevel} 
            acuityLabel={getAcuityLabel(subLevel)} 
            onExit={handleExit} 
            onComplete={handleSubLevelComplete}
            saveMainProgress={(stars) => saveLevelCompletion('level6', stars)}
        />
    );
};

export default Level6;
