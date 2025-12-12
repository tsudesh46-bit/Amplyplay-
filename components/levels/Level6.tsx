
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Page } from '../../types';
import { RetryIcon, HomeIcon, NextIcon, StarIcon } from '../ui/Icons';
import ConfirmationModal from '../ConfirmationModal';

// --- Constants ---
// Speed set to 150ms for smooth movement on fine grid
const MIN_SPEED = 150; 

const BORDER_THICKNESS = 4;
// Fine grid size (25px) - This ensures the growth is "very small"
const GRID_CELL_SIZE = 25; 
const VISUAL_GRID_SIZE = 150; // Visual background grid remains large

// Configuration for each Acuity Milestone
// 2cm radius = 4cm diameter.
// 4cm = 40mm. At 96 DPI, 1mm = 3.78px. 40mm ~= 151px.
const ACUITY_CONFIG = [
    { 
        id: 0, 
        label: '6/60', 
        startSize: 151, endSize: 130, 
        startContrast: 1.0, endContrast: 0.85 
    },
    { 
        id: 1, 
        label: '6/36', 
        startSize: 130, endSize: 110, 
        startContrast: 0.9, endContrast: 0.75 
    },
    { 
        id: 2, 
        label: '6/24', 
        startSize: 110, endSize: 90, 
        startContrast: 0.8, endContrast: 0.65 
    },
    { 
        id: 3, 
        label: '6/18', 
        startSize: 90, endSize: 70, 
        startContrast: 0.7, endContrast: 0.55 
    },
    { 
        id: 4, 
        label: '6/12', 
        startSize: 70, endSize: 50, 
        startContrast: 0.6, endContrast: 0.45 
    },
    { 
        id: 5, 
        label: '6/9', 
        startSize: 50, endSize: 30, 
        startContrast: 0.5, endContrast: 0.3 
    }
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
    shape: 'circle'; // Enforced circle
    color: string;
    id: string;
}

interface Target {
    x: number;
    y: number;
    shape: 'circle'; // Enforced circle
}

interface SnakeGameProps {
    levelIndex: number;
    unlockedIndex: number;
    onLevelSelect: (index: number) => void;
    onExit: () => void;
    onComplete: (score: number) => void;
    saveMainProgress: (stars: number) => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ 
    levelIndex, 
    unlockedIndex, 
    onLevelSelect, 
    onExit, 
    onComplete, 
    saveMainProgress 
}) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gridCols, setGridCols] = useState(10);
    const [gridRows, setGridRows] = useState(10);
    
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'levelComplete'>('start');
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    
    // Logic State
    const [snake, setSnake] = useState<{x: number, y: number}[]>([{ x: 10, y: 10 }]);
    const [target, setTarget] = useState<Target>({ x: 5, y: 5, shape: 'circle' });
    const [distractors, setDistractors] = useState<Distractor[]>([]);
    
    const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
    const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
    const nextDirectionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
    const intervalRef = useRef<any>(null);

    // Animation Refs
    const prevSnakeRef = useRef<{x: number, y: number}[]>([{ x: 10, y: 10 }]);
    const lastMoveTimeRef = useRef<number>(0);
    const isEatingRef = useRef<boolean>(false);
    
    // Speed
    const speedRef = useRef<number>(MIN_SPEED);

    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Refs for regeneration logic
    const targetRef = useRef<Target>(target);
    const scoreRef = useRef<number>(score);

    // Get current config based on level index
    const config = ACUITY_CONFIG[levelIndex];

    useEffect(() => { directionRef.current = direction; }, [direction]);
    useEffect(() => { targetRef.current = target; }, [target]);
    useEffect(() => { scoreRef.current = score; }, [score]);
    
    // Reset game state when level changes
    useEffect(() => {
        setGameState('start');
        setDirection(null);
        directionRef.current = null;
        nextDirectionRef.current = null;
        setScore(0);
        speedRef.current = MIN_SPEED;
    }, [levelIndex]);

    const targetScore = 100;

    // Dynamic Visual Calculations
    const progressRatio = Math.min(1, score / 100);
    const currentPatchSize = config ? config.startSize - (progressRatio * (config.startSize - config.endSize)) : 100;
    const currentContrast = config ? config.startContrast - (progressRatio * (config.startContrast - config.endContrast)) : 1.0;

    const generateLevelItems = useCallback((currentSnake: {x: number, y: number}[], cols: number, rows: number, currentScore: number) => {
        const occupied = new Set<string>();
        // Add larger buffer for fine grid collision prevention on spawn
        currentSnake.forEach(s => {
            for(let dx=-3; dx<=3; dx++) {
                for(let dy=-3; dy<=3; dy++) {
                    occupied.add(`${s.x+dx},${s.y+dy}`);
                }
            }
        });

        const getRandomPos = () => {
            let x, y, key;
            let attempts = 0;
            do {
                x = Math.floor(Math.random() * (cols - 6)) + 3;
                y = Math.floor(Math.random() * (rows - 6)) + 3;
                key = `${x},${y}`;
                attempts++;
            } while (occupied.has(key) && attempts < 200);
            
            occupied.add(key);
            return { x, y };
        };

        const newTargetPos = getRandomPos();
        const newTarget: Target = {
            ...newTargetPos,
            shape: 'circle' // Enforced circle
        };
        
        const numDistractors = 1; 
        
        const newDistractors: Distractor[] = [];
        for (let i = 0; i < numDistractors; i++) {
            const pos = getRandomPos();
            newDistractors.push({
                x: pos.x,
                y: pos.y,
                shape: 'circle', // Enforced circle
                color: '#374151', 
                id: `d-${Date.now()}-${i}`
            });
        }
        return { target: newTarget, distractors: newDistractors };
    }, []);

    const initGrid = useCallback(() => {
        if (gameContainerRef.current) {
            const width = gameContainerRef.current.clientWidth - (BORDER_THICKNESS * 2);
            const height = gameContainerRef.current.clientHeight - (BORDER_THICKNESS * 2);
            let cols = Math.floor(width / GRID_CELL_SIZE);
            let rows = Math.floor(height / GRID_CELL_SIZE);
            cols = Math.max(5, cols);
            rows = Math.max(5, rows);
            setGridCols(cols);
            setGridRows(rows);
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
            
            // Check collisions with Distractors (Immediate Game Over)
            // UPDATED: Uses distance check (eating range) instead of exact cell match
            // This ensures if you try to "eat" the fake patch, you die.
            const hitDistractor = distractors.some(d => {
                const dist = Math.sqrt(Math.pow(next.x - d.x, 2) + Math.pow(next.y - d.y, 2));
                return dist < 2.5; 
            });

            if (hitDistractor) {
                setGameState('gameOver');
                if (score > highScore) setHighScore(score);
                return prevSnake;
            }

            // Check collisions with Walls or Self
            if (next.x < 0 || next.x >= gridCols || next.y < 0 || next.y >= gridRows || 
                prevSnake.some(s => s.x === next.x && s.y === next.y)) {
                
                if (score >= 30) {
                     setGameState('levelComplete');
                     onComplete(score);
                     return prevSnake;
                } else {
                     setGameState('gameOver');
                     if (score > highScore) setHighScore(score);
                     return prevSnake;
                }
            }

            // Check food
            const hitDist = Math.sqrt(Math.pow(next.x - target.x, 2) + Math.pow(next.y - target.y, 2));
            // Tolerance based on ratio of patch size to grid size, approx 2 cells
            if (hitDist < 2.5) {
                isEatingRef.current = true;
                const newScore = score + 1;
                setScore(newScore);
                
                if (newScore >= 100) {
                    setGameState('levelComplete');
                    onComplete(newScore); 
                    return [next, ...prevSnake];
                }

                // Growth Logic:
                // shouldGrow = true means we DO NOT remove the tail.
                // This increases the length by exactly 1 grid cell (25px).
                // This creates the "very small amount" growth effect.
                const shouldGrow = true;

                const newSnakeHead = [next, ...prevSnake]; 
                const newSnake = shouldGrow ? newSnakeHead : newSnakeHead.slice(0, -1);

                const items = generateLevelItems(newSnake, gridCols, gridRows, newScore);
                setTarget(items.target);
                setDistractors(items.distractors);
                return newSnake;
            } else {
                isEatingRef.current = false;
                // Move: Remove tail, add head. Length stays same.
                return [next, ...prevSnake.slice(0, -1)];
            }
        });
    }, [gridCols, gridRows, target, distractors, score, highScore, saveMainProgress, generateLevelItems, onComplete]);

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

    const processInputDirection = useCallback((newDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        const current = directionRef.current;
        
        if (!current) {
            directionRef.current = newDir; 
            setDirection(newDir);
            return;
        }

        if (current === 'LEFT' && newDir === 'RIGHT') return;
        if (current === 'RIGHT' && newDir === 'LEFT') return;
        if (current === 'UP' && newDir === 'DOWN') return;
        if (current === 'DOWN' && newDir === 'UP') return;
        if (current === newDir) return;

        nextDirectionRef.current = newDir;
    }, []);

    // NOTE: Keyboard event listener intentionally removed for Level 6 (Click/Tap Only)

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
                newDirection = deltaX > 0 ? 'RIGHT' : 'LEFT';
            } else {
                newDirection = deltaY > 0 ? 'DOWN' : 'UP';
            }
            if (newDirection) processInputDirection(newDirection);
        }
    }, [gameState, isPaused, isExitModalOpen, processInputDirection]);

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

    // Canvas drawing logic for Snake
    useEffect(() => {
        let animationFrameId: number;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = gridCols * GRID_CELL_SIZE;
        canvas.height = gridRows * GRID_CELL_SIZE;

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

            // Visual width based on Gabor patch size
            const snakeWidth = currentPatchSize; 

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
                const pixelDist = dist * GRID_CELL_SIZE;
                const steps = Math.ceil(pixelDist / stepSize);
                
                if (pixelDist <= 0) continue;

                for (let j = 0; j <= steps; j++) {
                    const ratio = j / steps;
                    const x = p1.x + dx * ratio;
                    const y = p1.y + dy * ratio;
                    
                    const totalDist = currentDistanceTraveled + (pixelDist * ratio);
                    const normalizedPos = (currentDistanceTraveled + pixelDist * ratio) / (totalLen * GRID_CELL_SIZE);

                    const stripeFrequency = 0.2; 
                    const gratingValue = Math.sin(totalDist * stripeFrequency);
                    
                    const contrastFrequency = 0.02;
                    const rawEnvelope = (Math.sin(totalDist * contrastFrequency) + 1) / 2;
                    const contrast = 0.1 + 0.9 * rawEnvelope;
                    
                    const baseLightness = Math.max(20, 98 - (normalizedPos * 78));
                    const gaborMod = gratingValue * 25;
                    
                    ctx.beginPath();
                    ctx.arc(x * GRID_CELL_SIZE + GRID_CELL_SIZE/2, y * GRID_CELL_SIZE + GRID_CELL_SIZE/2, snakeWidth/2, 0, Math.PI * 2);
                    ctx.fillStyle = `hsl(0, 0%, ${baseLightness + gaborMod}%)`;
                    
                    ctx.globalAlpha = Math.max(0.2, currentContrast);
                    
                    ctx.fill();
                    ctx.globalAlpha = 1.0; 
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
                 ctx.arc(pHead.x * GRID_CELL_SIZE + GRID_CELL_SIZE/2, pHead.y * GRID_CELL_SIZE + GRID_CELL_SIZE/2, snakeWidth/2, 0, Math.PI * 2);
                 ctx.fillStyle = `hsl(0, 0%, 95%)`;
                 ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
                 ctx.shadowBlur = 12;
                 
                 ctx.globalAlpha = Math.max(0.4, currentContrast);
                 
                 ctx.fill();
                 ctx.shadowBlur = 0;

                 ctx.save();
                 ctx.translate(pHead.x * GRID_CELL_SIZE + GRID_CELL_SIZE/2, pHead.y * GRID_CELL_SIZE + GRID_CELL_SIZE/2);
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
                 
                 ctx.globalAlpha = 1.0;
            }
            animationFrameId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [snake, gridCols, gridRows, gameState, currentPatchSize, currentContrast]); 

    useEffect(() => {
        const handleResize = () => initGrid();
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [initGrid]);

    // Dynamic styles based on Score (Size and Contrast)
    const distractorGaborStyle = {
        backgroundImage: `repeating-linear-gradient(135deg, rgba(55, 65, 81, ${currentContrast}), rgba(55, 65, 81, ${currentContrast}) 2px, rgba(17, 24, 39, ${currentContrast}) 2px, rgba(17, 24, 39, ${currentContrast}) 4px)`, 
        backgroundColor: `rgba(55, 65, 81, ${currentContrast * 0.5})`,
        backgroundSize: '100% 100%',
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
        width: `${currentPatchSize}px`,
        height: `${currentPatchSize}px`,
        // Fix for potential flexbox squashing to ensure perfect circle
        minWidth: `${currentPatchSize}px`,
        minHeight: `${currentPatchSize}px`,
        flexShrink: 0,
        borderRadius: '50%',
        transition: 'width 0.2s ease, height 0.2s ease'
    };
    
    const foodGaborStyle = {
        backgroundImage: `repeating-linear-gradient(45deg, rgba(255, 255, 255, ${currentContrast}), rgba(255, 255, 255, ${currentContrast}) 2px, rgba(0, 0, 0, ${currentContrast}) 2px, rgba(0, 0, 0, ${currentContrast}) 4px)`,
        backgroundColor: `rgba(255, 255, 255, ${currentContrast * 0.2})`, // Lower background opacity when contrast drops
        backgroundSize: '100% 100%',
        width: `${currentPatchSize}px`,
        height: `${currentPatchSize}px`,
        // Fix for potential flexbox squashing to ensure perfect circle
        minWidth: `${currentPatchSize}px`,
        minHeight: `${currentPatchSize}px`,
        flexShrink: 0,
        borderRadius: '50%',
        transition: 'width 0.2s ease, height 0.2s ease'
    };
    
    // Safety check for config
    if (!config) return null;

    const renderOverlay = () => {
        const commonClasses = "absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center z-40 p-6 font-sans rounded-md border border-slate-800";
        const textClasses = "text-white";
        
        if (gameState === 'start') {
            return (
                <div className={commonClasses}>
                     <div className="flex flex-col items-center justify-center bg-slate-950/80 p-10 rounded-[3rem] border-[6px] border-cyan-400 shadow-[0_0_80px_rgba(6,182,212,0.6),inset_0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-2xl relative animate-bounce-in max-w-lg w-full overflow-hidden ring-4 ring-cyan-950">
                        
                        {/* Decorative background gradients to make it look "creative" */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Inner decorative stroke for 3D/Tech feel */}
                        <div className="absolute inset-3 rounded-[2.5rem] border-2 border-cyan-500/30 border-dashed pointer-events-none"></div>

                        <h2 className={`text-5xl font-bold ${textClasses} mb-2 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10 font-pixel`}>LEVEL 06</h2>
                        
                        <div className="bg-cyan-950/40 px-6 py-2 rounded-xl border border-cyan-500/30 mb-6 backdrop-blur-sm z-10">
                             <h3 className={`text-3xl font-bold text-cyan-300 tracking-widest font-mono`}>{config.label}</h3>
                        </div>

                        <p className={`text-xl font-bold mb-8 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-white z-10`}>
                            TARGET SCORE <span className="text-3xl text-red-500 ml-2">{targetScore}</span>
                        </p>
                        
                        <div className="flex items-center justify-around w-full mb-10 px-4 z-10 bg-white/5 p-6 rounded-2xl border border-white/10 shadow-inner">
                            <div className="flex flex-col items-center gap-3">
                                <div 
                                    style={{
                                        ...foodGaborStyle,
                                        width: '60px',
                                        height: '60px',
                                        minWidth: '60px',
                                        minHeight: '60px',
                                        boxShadow: '0 0 20px rgba(255,255,255,0.4)'
                                    }}
                                ></div>
                                <span className="text-white font-bold text-sm tracking-widest uppercase drop-shadow-md">FIND</span>
                            </div>
                            
                            <div className="h-16 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"></div>
                            
                            <div className="flex flex-col items-center gap-3">
                                <div 
                                    style={{
                                        ...distractorGaborStyle,
                                        width: '60px',
                                        height: '60px',
                                        minWidth: '60px',
                                        minHeight: '60px'
                                    }}
                                ></div>
                                <span className="text-slate-400 font-bold text-sm tracking-widest uppercase drop-shadow-md">AVOID</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={startGame}
                            className="group relative px-12 py-5 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] z-10 border border-cyan-400/50"
                        >
                            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center justify-center gap-4">
                                <StarIcon className="w-6 h-6 text-white animate-spin-slow" />
                                <span className="text-2xl font-bold text-white tracking-wider">
                                    START
                                </span>
                                 <StarIcon className="w-6 h-6 text-white animate-spin-slow" />
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
            const nextLevelConfig = ACUITY_CONFIG[levelIndex + 1];
            // Determine stars for display
            let starsEarned = 0;
            if (score >= 100) starsEarned = 3;
            else if (score >= 60) starsEarned = 2;
            else if (score >= 30) starsEarned = 1;

            return (
                <div className={commonClasses}>
                    <h2 className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mb-6`}>
                        {starsEarned === 3 ? "Excellent!" : starsEarned > 0 ? "Good Job!" : "Level Complete"}
                    </h2>
                    <div className="flex gap-2 mb-8 animate-pulse-slow">
                        {Array.from({ length: 3 }).map((_, i) => (
                             <StarIcon key={i} className={`w-10 h-10 drop-shadow-lg ${i < starsEarned ? 'text-yellow-400' : 'text-slate-600'}`} />
                        ))}
                    </div>
                    {nextLevelConfig ? (
                         <p className={`${textClasses} text-2xl mb-8`}>Moving to Acuity: <span className="font-bold text-cyan-400">{nextLevelConfig.label}</span></p>
                    ) : (
                         <p className={`${textClasses} text-2xl mb-8`}>You have completed Level 6!</p>
                    )}
                   
                    <button onClick={() => {
                        // This calls the logic to switch internal state
                         onLevelSelect(levelIndex + 1);
                    }} className="group bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-4 px-8 rounded-full transition text-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-1">
                        <StarIcon className="w-6 h-6 text-white group-hover:text-yellow-200 animate-spin-slow" />
                        {nextLevelConfig ? "Next Acuity" : "Finish"}
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
                {/* Left Section: Home Button + Acuity Milestones */}
                <div className="flex items-center gap-4 pl-2 shrink-0">
                    <div style={{ transform: 'scale(0.8)' }} className="shrink-0">
                        <RingHomeButton onClick={() => { setIsPaused(true); setIsExitModalOpen(true); }} />
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar pl-2 pr-2 scroll-smooth">
                        {ACUITY_CONFIG.map((m, idx) => {
                             const isUnlocked = idx <= unlockedIndex;
                             const isActive = idx === levelIndex;
                             
                             return (
                                 <button 
                                    key={m.label} 
                                    disabled={!isUnlocked}
                                    onClick={() => onLevelSelect(idx)}
                                    className={`flex flex-col items-center transition-all duration-300 focus:outline-none ${isActive ? 'opacity-100 scale-110' : isUnlocked ? 'opacity-60 hover:opacity-100 hover:scale-105 cursor-pointer' : 'opacity-20 cursor-not-allowed'}`}
                                 >
                                     <span className={`text-[9px] font-bold uppercase tracking-wider leading-tight ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>TARGET</span>
                                     <span className={`text-sm sm:text-lg font-bold font-mono leading-tight ${isActive ? 'text-cyan-400' : isUnlocked ? 'text-slate-400' : 'text-slate-700'} whitespace-nowrap`}>{m.label}</span>
                                 </button>
                             );
                        })}
                    </div>
                </div>

                {/* Middle Section: Progress Bar (Fills remaining space) */}
                <div className="flex-grow mx-6 max-w-md flex flex-col justify-center hidden sm:flex">
                     <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300 ease-linear" style={{ width: `${Math.min(100, score)}%` }}></div>
                     </div>
                </div>

                {/* Right Section: Target & Score */}
                <div className="flex items-center pl-4 pr-4 border-l border-slate-700 shrink-0">
                     {/* Goal Display - Centered as requested */}
                     <div className="flex flex-col items-center mr-6 border-r border-slate-800 pr-6">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">GOAL</span>
                        <span className="text-2xl font-bold text-red-500 font-mono leading-none">{targetScore}</span>
                     </div>

                     {/* Score Display - Centered as requested */}
                     <div className="flex items-center">
                         <div className="flex flex-col items-center mr-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SCORE</span>
                            <span className="text-2xl font-bold text-cyan-400 font-mono leading-none">{score}</span>
                         </div>
                     </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center w-full h-full overflow-hidden relative touch-none bg-black" onPointerDown={onPointerDown}>
                <div ref={gameContainerRef} className="w-full h-full flex items-center justify-center relative bg-black">
                    <div className="relative overflow-hidden pointer-events-auto bg-black" style={{ width: `${gridCols * GRID_CELL_SIZE}px`, height: `${gridRows * GRID_CELL_SIZE}px`, border: `${BORDER_THICKNESS}px solid #475569`, boxShadow: '0 0 30px rgba(6,182,212,0.1)' }}>
                        {renderOverlay()}
                        {/* Background Grid: Uses fixed 150px visual square to maintain look, while movement is 30px */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`, backgroundSize: `${VISUAL_GRID_SIZE}px ${VISUAL_GRID_SIZE}px` }}></div>

                        {gameState === 'playing' && direction === null && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                <div className="bg-black/50 text-cyan-400 px-6 py-3 rounded-full animate-pulse backdrop-blur-sm border border-cyan-500/30 text-lg font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                    Tap to Start
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
                                            // Container is always cell size to maintain grid logic
                                            width: `${GRID_CELL_SIZE}px`, 
                                            height: `${GRID_CELL_SIZE}px`, 
                                            top: `${target.y * GRID_CELL_SIZE}px`, 
                                            left: `${target.x * GRID_CELL_SIZE}px`, 
                                            zIndex: 100, 
                                        }} 
                                    >
                                        {/* Inner Scaled Gabor Patch */}
                                        <div style={{
                                             ...foodGaborStyle,
                                             boxShadow: '0 0 15px rgba(255,255,255,0.6)'
                                        }} />
                                    </div>
                                )}
                                
                                {distractors.map(d => {
                                     if (d.x >= gridCols || d.y >= gridRows) return null;
                                     return (
                                         <div 
                                            key={d.id} 
                                            className="absolute flex items-center justify-center transition-opacity duration-300" 
                                            style={{ 
                                                width: `${GRID_CELL_SIZE}px`, 
                                                height: `${GRID_CELL_SIZE}px`, 
                                                top: `${d.y * GRID_CELL_SIZE}px`, 
                                                left: `${d.x * GRID_CELL_SIZE}px`, 
                                                zIndex: 5,
                                            }} 
                                         >
                                            <div style={{
                                                ...distractorGaborStyle
                                            }} />
                                         </div>
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
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    // Unlocked all by default to allow progression testing from 6/60 to 6/9
    const [unlockedLevelIndex, setUnlockedLevelIndex] = useState(ACUITY_CONFIG.length - 1);

    const handleLevelComplete = (score: number) => {
        let stars = 0;
        if (score >= 100) stars = 3;
        else if (score >= 60) stars = 2;
        else if (score >= 30) stars = 1;

        if (stars > 0) {
             if (currentLevelIndex < ACUITY_CONFIG.length - 1) {
                setUnlockedLevelIndex(prev => Math.max(prev, currentLevelIndex + 1));
            }
            saveLevelCompletion('level6', stars);
        }
    };
    
    // Safer level selection handler that prevents out-of-bounds indices
    const handleLevelSelect = (index: number) => {
        if (index < ACUITY_CONFIG.length) {
            setCurrentLevelIndex(index);
        } else {
             // Finished all levels
             saveLevelCompletion('level6', 3);
             setCurrentPage('home');
        }
    };

    return (
        <SnakeGame 
            levelIndex={currentLevelIndex}
            unlockedIndex={unlockedLevelIndex}
            onLevelSelect={handleLevelSelect}
            onExit={() => setCurrentPage('home')}
            onComplete={handleLevelComplete}
            saveMainProgress={(stars) => saveLevelCompletion('level6', stars)}
        />
    );
};

export default Level6;
