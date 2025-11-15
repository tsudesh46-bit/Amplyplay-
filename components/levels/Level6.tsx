import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page } from '../../types';
import GaborCircle from '../GaborCircle';
import { RetryIcon, HomeIcon, HeartIcon, HeartOutlineIcon, XCircleIcon } from '../ui/Icons';

// --- Constants ---
const GRID_SIZE = 20; // 20x20 grid
const INITIAL_SNAKE_SIZE_FACTOR = 1.0;
const MIN_SNAKE_SIZE_FACTOR = 0.4;
const INITIAL_SPEED = 300; // ms per move
const MIN_SPEED = 50;
const MAX_LEVEL = 100;

const speedDecrement = (INITIAL_SPEED - MIN_SPEED) / (MAX_LEVEL - 1);
const sizeDecrement = (INITIAL_SNAKE_SIZE_FACTOR - MIN_SNAKE_SIZE_FACTOR) / (MAX_LEVEL - 1);

// --- Helper Components ---

const SnakeSegment: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => {
  const gaborStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundImage: `repeating-linear-gradient(
      45deg,
      rgba(120, 120, 120, 0.9),
      rgba(120, 120, 120, 0.9) 3px,
      rgba(60, 60, 60, 0.9) 3px,
      rgba(60, 60, 60, 0.9) 6px
    )`,
    transition: 'top 0.1s linear, left 0.1s linear',
    ...style,
  };
  return <div style={gaborStyle}></div>;
};


// --- Main Component ---
const Level6: React.FC<{
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, isCompleted: boolean) => void;
}> = ({ setCurrentPage, saveLevelCompletion }) => {
  const gameBoardRef = useRef<HTMLDivElement>(null);
  const quizTimerRef = useRef<number | null>(null);
  const peripheralTickRef = useRef<number | null>(null);

  const [cellSize, setCellSize] = useState(20);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'gameOver'>('start');
  
  // Snake game state
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
  const [level, setLevel] = useState(1);
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeHighScore, setSnakeHighScore] = useState(0);

  // Peripheral & Quiz state
  const [sidePatches, setSidePatches] = useState<{ top: any | null, bottom: any | null }>({ top: null, bottom: null });
  const [gaborOnSideCount, setGaborOnSideCount] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizHighScore, setQuizHighScore] = useState(0);
  const [quizLives, setQuizLives] = useState(3);
  const [isQuizVisible, setIsQuizVisible] = useState(false);
  const [quizInputValue, setQuizInputValue] = useState("");
  const [isQuizIncorrect, setIsQuizIncorrect] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<'none' | 'incorrect'>('none');
  const [contrast, setContrast] = useState(1.0);
  const [gameOverReason, setGameOverReason] = useState<'quiz' | 'snake' | null>(null);
  
  const totalScore = snakeScore + quizScore;
  const highScore = snakeHighScore + quizHighScore;

  const snakeSize = Math.max(MIN_SNAKE_SIZE_FACTOR, INITIAL_SNAKE_SIZE_FACTOR - (level - 1) * sizeDecrement) * cellSize;
  const gameSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - (level - 1) * speedDecrement);

  // --- Game Logic Callbacks ---

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

  const generateSidePatches = useCallback(() => {
    const newPatches: { top: any | null; bottom: any | null } = { top: null, bottom: null };
    let gaborCountThisTurn = 0;

    if (Math.random() > 0.3) {
      const type = Math.random() > 0.5 ? 'gabor' : 'fake';
      if (type === 'gabor') gaborCountThisTurn++;
      newPatches.top = { id: `side-top-${Date.now()}`, type, size: Math.random() * 50 + 40 };
    }

    if (Math.random() > 0.3) {
      const type = Math.random() > 0.5 ? 'gabor' : 'fake';
      if (type === 'gabor') gaborCountThisTurn++;
      newPatches.bottom = { id: `side-bottom-${Date.now()}`, type, size: Math.random() * 50 + 40 };
    }
    
    setGaborOnSideCount(prev => prev + gaborCountThisTurn);
    setSidePatches(newPatches);
  }, []);

  const scheduleQuiz = useCallback(() => {
    if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
    const randomTime = 30000 + Math.random() * 30000;
    quizTimerRef.current = window.setTimeout(() => {
        setQuizInputValue("");
        setGameState('paused');
        setIsQuizVisible(true);
    }, randomTime);
  }, []);

  const resumeGame = useCallback(() => {
    setIsQuizVisible(false);
    setQuizFeedback('none');
    setQuizInputValue("");
    setGaborOnSideCount(0);
    setGameState('playing');
    scheduleQuiz();
  }, [scheduleQuiz]);

  const startGame = useCallback(() => {
    const startSnake = [{ x: 10, y: 10 }];
    setSnake(startSnake);
    setFood(generateFood(startSnake));
    setDirection(null);
    setLevel(1);
    setSnakeScore(0);
    setQuizScore(0);
    setQuizLives(3);
    setGaborOnSideCount(0);
    setContrast(1.0);
    setGameOverReason(null);
    setQuizFeedback('none');
    setIsQuizVisible(false);
    
    setGameState('playing');
    scheduleQuiz();
  }, [generateFood, scheduleQuiz]);


  // --- Effects ---

  useEffect(() => {
    if (snakeScore > snakeHighScore) setSnakeHighScore(snakeScore);
  }, [snakeScore, snakeHighScore]);

  useEffect(() => {
    if (quizScore > quizHighScore) setQuizHighScore(quizScore);
  }, [quizScore, quizHighScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((gameState === 'start' || gameState === 'gameOver') && e.key.includes('Arrow')) {
        startGame();
      }
      if (gameState !== 'playing') return;

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
          setGameOverReason('snake');
          setGameState('gameOver');
          return prevSnake;
        }
        
        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          setSnakeScore(s => s + 1);
          if (level < MAX_LEVEL) setLevel(l => l + 1);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, gameSpeed);

    return () => clearInterval(gameInterval);
  }, [gameState, direction, gameSpeed, food, level, generateFood]);

  // Peripheral task loop
  useEffect(() => {
      if (gameState === 'playing') {
          peripheralTickRef.current = window.setInterval(() => {
              setContrast(prev => Math.max(0.1, prev - 0.005));
              generateSidePatches();
          }, 1000);
      }
      return () => {
          if (peripheralTickRef.current) clearInterval(peripheralTickRef.current);
      }
  }, [gameState, generateSidePatches]);
  
  // Cleanup timers on state change
  useEffect(() => {
    if (gameState !== 'playing') {
      if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
      if (peripheralTickRef.current) clearInterval(peripheralTickRef.current);
    }
  }, [gameState]);
  
  // Handle game board resizing
  useEffect(() => {
    const updateCellSize = () => {
      if (gameBoardRef.current) {
        const boardWidth = gameBoardRef.current.offsetWidth;
        setCellSize(boardWidth / GRID_SIZE);
      }
    };
    updateCellSize();
    const resizeObserver = new ResizeObserver(updateCellSize);
    if (gameBoardRef.current) resizeObserver.observe(gameBoardRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuizIncorrect || quizFeedback === 'incorrect') return;

    const userAnswer = parseInt(quizInputValue, 10);
    const isCorrect = userAnswer === gaborOnSideCount;

    if (isCorrect) {
        setQuizScore(prev => prev + 1);
        resumeGame();
    } else {
        const newLives = quizLives - 1;
        setQuizLives(newLives);
        setIsQuizIncorrect(true);
        
        if (newLives <= 0) {
            setTimeout(() => {
                setGameOverReason('quiz');
                setGameState('gameOver');
                setIsQuizVisible(false);
            }, 820);
        } else {
            setTimeout(() => {
                setIsQuizIncorrect(false);
                setQuizFeedback('incorrect');
            }, 820);
        }
    }
  };


  // --- Render Methods ---

  const renderSidePatch = (patch: any) => {
    if (!patch) return null;
    const style = {
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: contrast,
    };
    if (patch.type === 'gabor') {
        return <GaborCircle size={patch.size} contrast={contrast} onClick={() => {}} style={style} />;
    }
    return <div style={{...style, width: patch.size, height: patch.size, backgroundColor: 'grey', borderRadius: '50%'}} />;
  };

  const renderGameBoard = () => (
    <div ref={gameBoardRef} className="relative w-full max-w-xl aspect-square bg-slate-800 medical-border rounded-lg shadow-lg">
      {snake.map((segment, index) => (
        <SnakeSegment
          key={index}
          size={snakeSize}
          style={{
            position: 'absolute',
            top: `${segment.y * cellSize}px`,
            left: `${segment.x * cellSize}px`,
          }}
        />
      ))}
      <GaborCircle
        size={cellSize}
        contrast={1}
        onClick={() => {}}
        style={{
          position: 'absolute',
          top: `${food.y * cellSize}px`,
          left: `${food.x * cellSize}px`,
        }}
        className="animate-pulse"
      />
    </div>
  );

  const renderOverlay = () => {
    if (gameState === 'start') {
      return (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center z-10 rounded-md">
          <h2 className="text-4xl font-bold text-white mb-4">Gabor Snake</h2>
          <p className="text-xl text-slate-300 mb-8">Use Arrow Keys to move.</p>
          <button onClick={startGame} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition text-lg transform hover:scale-105">
            Start Game
          </button>
        </div>
      );
    }
    if (gameState === 'gameOver') {
      return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center z-10 rounded-md">
          <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-lg border border-rose-500 w-full max-w-sm">
            <h2 className="text-3xl font-bold mb-2 text-rose-500">Game Over</h2>
            <p className="text-lg mb-4 text-slate-300">
              {gameOverReason === 'quiz' ? 'You ran out of guesses.' : 'You crashed the snake.'}
            </p>
            <div className="bg-slate-700 p-4 rounded-lg my-6">
              <p className="text-slate-400">Final Score</p>
              <p className="text-4xl font-bold text-white">{totalScore}</p>
              <p className="text-slate-400 mt-2">High Score: {highScore}</p>
            </div>
            <button onClick={startGame} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
              <RetryIcon /> Try Again
            </button>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 font-sans overflow-hidden">
        {/* --- UI Panels --- */}
        <div className="absolute top-4 left-4 z-20 text-slate-700 bg-gradient-to-br from-white to-cyan-100 p-3 rounded-2xl shadow-lg border border-cyan-200/50 w-56">
            <p className="font-bold text-lg text-cyan-800">Snake Score</p>
            <p className="font-semibold text-2xl">{snakeScore}</p>
            <p className="text-xs mt-1 text-slate-500">Level: {level}/{MAX_LEVEL}</p>
            <p className="text-xs text-slate-500">High Score: {snakeHighScore}</p>
        </div>

        <div className="absolute top-4 right-4 z-20 text-slate-700 bg-gradient-to-br from-white to-cyan-100 p-3 rounded-2xl shadow-lg border border-cyan-200/50 w-56 text-right">
            <p className="font-bold text-lg text-cyan-800">Peripheral Score</p>
            <p className="font-semibold text-2xl">{quizScore}</p>
            <div className="flex items-center justify-end mt-1 gap-1">
                {Array.from({ length: 3 }).map((_, i) =>
                    i < quizLives ? <HeartIcon key={i} className="w-5 h-5 text-red-500" /> : <HeartOutlineIcon key={i} className="w-5 h-5 text-red-500/70" />
                )}
            </div>
             <p className="text-xs mt-1 text-slate-500">High Score: {quizHighScore}</p>
        </div>
        
        <button onClick={() => setCurrentPage('home')} className="absolute bottom-4 right-4 bg-white/80 text-cyan-600 p-3 rounded-full shadow-lg z-20 transition transform hover:scale-110" aria-label="Home">
            <HomeIcon className="w-8 h-8"/>
        </button>

      {/* --- Game Areas --- */}
      <div className="h-1/4 bg-slate-900 relative">{renderSidePatch(sidePatches.top)}</div>
      
      <div className="h-1/2 bg-slate-900 relative flex items-center justify-center p-4">
        <div className="relative w-full h-full flex items-center justify-center">
            {renderOverlay()}
            {renderGameBoard()}
        </div>
      </div>
      
      <div className="h-1/4 bg-slate-900 relative">{renderSidePatch(sidePatches.bottom)}</div>

      {/* --- Modals --- */}
      {isQuizVisible && (
        <div className="absolute inset-0 bg-black/70 z-30 flex items-center justify-center p-4">
          {quizFeedback === 'incorrect' ? (
              <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-lg border border-rose-500 w-full max-w-sm text-center">
                  <h2 className="text-2xl font-bold mb-4 text-rose-400">Incorrect</h2>
                  <p className="text-slate-300 mb-6">Take a moment before you continue.</p>
                  <button onClick={resumeGame} className="mb-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition">Continue</button>
                  <div className="flex justify-center">
                      <button onClick={() => setCurrentPage('home')} className="flex flex-col items-center text-slate-400 hover:text-white transition" aria-label="Exit to Home">
                          <HomeIcon className="w-10 h-10" />
                          <span className="text-xs mt-1 font-semibold">Exit</span>
                      </button>
                  </div>
              </div>
          ) : (
              <div className={`bg-slate-800 text-white p-8 rounded-2xl shadow-lg border border-cyan-500 w-full max-w-sm text-center transition-transform duration-300 ${isQuizIncorrect ? 'animate-shake' : ''}`}>
                  <h2 className="text-2xl font-bold mb-2 text-cyan-400">Check-in!</h2>
                  <div className="flex justify-center gap-2 my-4">
                      {Array.from({ length: 3 }).map((_, i) => i < quizLives ? <HeartIcon key={i} className="w-8 h-8 text-red-500" /> : <HeartOutlineIcon key={i} className="w-8 h-8 text-red-500/70" />)}
                  </div>
                  <p className="mb-6 text-slate-300">How many Gabor patches did you see in the top and bottom areas?</p>
                  <form onSubmit={handleQuizSubmit}>
                      <input type="number" value={quizInputValue} onChange={(e) => setQuizInputValue(e.target.value)} className="w-full p-3 rounded-lg bg-slate-700 text-white text-center text-2xl border-2 border-slate-600 focus:border-cyan-500 focus:outline-none" autoFocus />
                      <button type="submit" className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition">Submit</button>
                  </form>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Level6;