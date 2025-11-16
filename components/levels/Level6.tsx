
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page } from '../../types';
import { RetryIcon, HomeIcon } from '../ui/Icons';

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SPEED = 200;
const MAX_SPEED = 50;
const SPEED_INCREMENT = 5; // Speed increases every 2 points

// --- Helper Components ---
const SnakePixel: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div
    style={{
      width: `${size - 1}px`,
      height: `${size - 1}px`,
      backgroundColor: '#334155', // Dark slate color for the snake
      position: 'absolute',
      ...style,
    }}
  />
);

// --- Main Component ---
const Level6: React.FC<{
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, isCompleted: boolean) => void;
}> = ({ setCurrentPage, saveLevelCompletion }) => {
  const gameBoardRef = useRef<HTMLDivElement>(null);
  
  const [cellSize, setCellSize] = useState(20);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const gameSpeed = Math.max(MAX_SPEED, INITIAL_SPEED - Math.floor(score / 2) * SPEED_INCREMENT);

  const generateFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    while (true) {
      const newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        return newFood;
      }
    }
  }, []);

  const startGame = useCallback(() => {
    const startSnake = [{ x: 10, y: 10 }];
    setSnake(startSnake);
    setFood(generateFood(startSnake));
    setDirection(null);
    if (score > highScore) {
      setHighScore(score);
    }
    setScore(0);
    setGameState('playing');
  }, [generateFood, score, highScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isArrowKey = e.key.includes('Arrow');

      if ((gameState === 'start' || gameState === 'gameOver') && isArrowKey) {
        startGame();
      }
      if (gameState !== 'playing' && !isArrowKey) return;

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
  }, [gameState, startGame]);

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing' || !direction) return;

    const gameInterval = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || newSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
          setGameState('gameOver');
          if (score > highScore) {
            setHighScore(score);
          }
          saveLevelCompletion('level6', score > 0);
          return prevSnake;
        }
        
        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, gameSpeed);

    return () => clearInterval(gameInterval);
  }, [gameState, direction, gameSpeed, food, generateFood, score, highScore, saveLevelCompletion]);
  
  // Handle game board resizing
  useEffect(() => {
    const updateCellSize = () => {
      if (gameBoardRef.current) {
        const boardWidth = gameBoardRef.current.offsetWidth;
        setCellSize(boardWidth / GRID_SIZE);
      }
    };
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);

  const renderOverlay = () => {
    const commonClasses = "absolute inset-0 bg-slate-200/80 backdrop-blur-sm flex flex-col items-center justify-center text-center z-10 p-4 font-pixel rounded-lg";
    const textClasses = "text-slate-800";
    
    if (gameState === 'start') {
      return (
        <div className={commonClasses}>
          <h2 className={`text-4xl ${textClasses} mb-4`}>SNAKE</h2>
          <p className={`text-2xl ${textClasses}`}>Use Arrow Keys</p>
          <p className={`text-lg ${textClasses} mt-2`}>to begin</p>
        </div>
      );
    }
    if (gameState === 'gameOver') {
      return (
        <div className={commonClasses}>
            <h2 className={`text-4xl ${textClasses} mb-4`}>Game Over</h2>
            <div className="bg-black/10 p-4 rounded my-6 w-full max-w-xs">
              <p className={`${textClasses} text-lg`}>Score: <span className="font-bold">{score}</span></p>
              <p className={`${textClasses} text-sm mt-2`}>High Score: <span className="font-bold">{highScore}</span></p>
            </div>
            <button onClick={startGame} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg flex items-center justify-center gap-2 shadow-lg">
              <RetryIcon /> Try Again
            </button>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 font-sans items-center justify-center p-4">
        <div className="w-[90vmin] flex justify-between items-baseline mb-4 px-2">
            <h1 className="text-3xl font-bold text-cyan-400 font-pixel">LEVEL 06</h1>
            <div className="text-right">
                <p className="text-sm text-slate-400 font-pixel">HI-SCORE: <span className="text-white text-lg">{String(highScore).padStart(4, '0')}</span></p>
            </div>
        </div>
        
        <div 
            ref={gameBoardRef} 
            className="bg-slate-200 w-[90vmin] h-[90vmin] relative shadow-2xl border-4 border-cyan-800/50 rounded-lg"
        >
            {renderOverlay()}
            <div className="absolute top-2 right-4 font-pixel text-slate-500 text-xl z-0">
                SCORE: <span className="text-slate-800 font-bold">{String(score).padStart(4, '0')}</span>
            </div>
            {snake.map((segment, index) => (
              <SnakePixel
                key={index}
                size={cellSize}
                style={{
                  top: `${segment.y * cellSize}px`,
                  left: `${segment.x * cellSize}px`,
                }}
              />
            ))}
            <SnakePixel
              size={cellSize}
              style={{
                top: `${food.y * cellSize}px`,
                left: `${food.x * cellSize}px`,
                backgroundColor: '#e11d48', // Red color for food
                borderRadius: '50%'
              }}
            />
        </div>

        <button onClick={() => setCurrentPage('home')} className="absolute bottom-4 right-4 bg-white/80 text-cyan-600 p-3 rounded-full shadow-lg z-20 transition transform hover:scale-110" aria-label="Home">
            <HomeIcon className="w-8 h-8"/>
        </button>
    </div>
  );
};

export default Level6;
