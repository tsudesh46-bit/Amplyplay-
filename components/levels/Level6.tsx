import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page } from '../../types';
import { RetryIcon, HomeIcon } from '../ui/Icons';
import ConfirmationModal from '../ConfirmationModal';

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SPEED = 200;
const MAX_SPEED = 50;
const SPEED_INCREMENT = 5; // Speed increases every 2 points

// --- Helper Components ---
const SnakePixel: React.FC<{ size: number; style?: React.CSSProperties, isFood?: boolean }> = ({ size, style, isFood }) => (
  <div
    style={{
      width: `${size - 1}px`,
      height: `${size - 1}px`,
      backgroundColor: isFood ? '#e11d48' : '#334155',
      borderRadius: isFood ? '50%' : '2px',
      position: 'absolute',
      ...style,
    }}
  />
);

// --- Main Component ---
const Level6: React.FC<{
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number) => void;
}> = ({ setCurrentPage, saveLevelCompletion }) => {
  const gameBoardRef = useRef<HTMLDivElement>(null);
  
  const [cellSize, setCellSize] = useState(20);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  const [isPausedForExit, setIsPausedForExit] = useState(false);

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
      e.preventDefault(); // Prevent page scrolling with arrow keys
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
    if (gameState !== 'playing' || !direction || isPausedForExit) return;

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
          saveLevelCompletion('level6', score > 0 ? 1 : 0);
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
  }, [gameState, direction, gameSpeed, food, generateFood, score, highScore, saveLevelCompletion, isPausedForExit]);
  
  // Handle game board resizing
  useEffect(() => {
    const updateCellSize = () => {
      if (gameBoardRef.current) {
        const boardWidth = gameBoardRef.current.offsetWidth;
        setCellSize(boardWidth / GRID_SIZE);
      }
    };
    
    updateCellSize();
    let resizeTimer: number;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(updateCellSize, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleHomeClick = () => {
    setIsPausedForExit(true);
    setIsConfirmingExit(true);
  };

  const handleConfirmExit = () => {
    setIsPausedForExit(false);
    setIsConfirmingExit(false);
    setCurrentPage('home');
  };

  const handleCancelExit = () => {
    setIsPausedForExit(false);
    setIsConfirmingExit(false);
  };

  const renderOverlay = () => {
    const commonClasses = "absolute inset-0 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-center z-10 p-4 font-pixel rounded-md";
    const textClasses = "text-slate-800";
    
    if (gameState === 'start') {
      return (
        <div className={commonClasses}>
          <h2 className={`text-3xl sm:text-4xl ${textClasses} mb-4`}>SNAKE</h2>
          <p className={`text-xl sm:text-2xl ${textClasses}`}>Use Arrow Keys</p>
          <p className={`text-base sm:text-lg ${textClasses} mt-2`}>to begin</p>
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
            <button onClick={startGame} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg flex items-center justify-center gap-2 shadow-lg">
              <RetryIcon /> Try Again
            </button>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-200 font-sans">
      <header className="w-full p-3 sm:p-4 bg-gradient-to-r from-cyan-100 via-blue-200 to-cyan-100 shadow-md z-10 shrink-0 border-b-2 border-white">
          <div className="w-full max-w-5xl mx-auto flex justify-between items-center text-slate-700 font-pixel">
              <h1 className="text-xl sm:text-2xl font-bold">LEVEL 06</h1>
              <div className="text-center">
                  <p className="text-sm sm:text-base">SCORE</p>
                  <p className="text-lg sm:text-xl font-bold">{String(score).padStart(4, '0')}</p>
              </div>
              <div className="text-right">
                  <p className="text-sm sm:text-base">HI-SCORE</p>
                  <p className="text-lg sm:text-xl font-bold">{String(highScore).padStart(4, '0')}</p>
              </div>
          </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center w-full p-4 md:p-6 overflow-hidden">
        <div className="bg-slate-800 p-2 sm:p-3 rounded-xl shadow-2xl aspect-square max-w-full max-h-full">
            <div 
              ref={gameBoardRef} 
              className="bg-white w-full h-full rounded-md relative overflow-hidden"
            >
              {renderOverlay()}
              {snake.map((segment, index) => (
                <SnakePixel
                  key={index}
                  size={cellSize}
                  style={{
                    top: `${segment.y * cellSize}px`,
                    left: `${segment.x * cellSize}px`,
                    backgroundColor: index === 0 ? '#1e293b' : '#334155',
                    zIndex: snake.length - index,
                  }}
                />
              ))}
              <SnakePixel
                size={cellSize}
                isFood
                style={{
                  top: `${food.y * cellSize}px`,
                  left: `${food.x * cellSize}px`,
                }}
              />
            </div>
        </div>
      </main>

      <button onClick={handleHomeClick} className="absolute bottom-4 right-4 bg-white/80 text-cyan-600 p-3 rounded-full shadow-lg z-20 transition transform hover:scale-110" aria-label="Home">
          <HomeIcon className="w-8 h-8"/>
      </button>

      <ConfirmationModal
        isOpen={isConfirmingExit}
        title="Confirm Exit"
        message="Are you sure you want to return to the main menu?"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        confirmText="Exit"
      />
    </div>
  );
};

export default Level6;