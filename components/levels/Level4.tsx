
import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { Page } from '../../types';
import GameEndScreen from '../GameEndScreen';
import { EMOJI_GRID_L4 } from '../../constants';
import { HomeIcon } from '../ui/Icons';
import ConfirmationModal from '../ConfirmationModal';

interface Level4Props {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number) => void;
}

const GRID_SIZE = 100; // 10x10 grid
const MAX_ATTEMPTS = 100; // Fixed game length

const FireworksReward: React.FC<{ show: boolean, color?: string }> = ({ show, color = '#fde047' }) => {
  if (!show) return null;

  const particles = Array.from({ length: 40 });
  const radius = 200;

  return (
    <div className="fireworks-container">
      <div className="central-star" style={{ color: color, textShadow: `0 0 10px ${color}, 0 0 20px ${color}` }}>🌟</div>
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 360;
        const randomRadius = radius * (0.8 + Math.random() * 0.4);
        const x = Math.cos(angle * Math.PI / 180) * randomRadius;
        const y = Math.sin(angle * Math.PI / 180) * randomRadius;
        
        return (
          <div
            key={i}
            className="particle"
            style={{
              '--x': `${x}px`,
              '--y': `${y}px`,
              animationDelay: `${Math.random() * 0.3}s`,
              backgroundColor: color,
              boxShadow: `0 0 5px ${color}, 0 0 10px ${color}`
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

// Local component to ensure perfect alignment of the Gabor patch over the emoji
const LocalGaborEmoji: React.FC<{
    emoji: string;
    isTarget: boolean;
    contrast: number;
    fontSize: number;
    onClick: () => void;
}> = ({ emoji, isTarget, contrast, fontSize, onClick }) => {
    // Calculate Gabor overlay color with dynamic contrast opacity
    const overlayAlpha = contrast;
    const overlayColor = `rgba(0, 0, 0, ${overlayAlpha})`;

    return (
        <div 
            onClick={onClick}
            className="w-full h-full grid place-items-center cursor-pointer select-none transition-colors hover:bg-slate-50 active:bg-slate-100 overflow-hidden relative"
        >
            {/* Base Emoji - Visible for everyone */}
            <div 
                style={{ 
                    gridArea: '1 / 1',
                    fontSize: `${fontSize}px`,
                    opacity: contrast,
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                }}
            >
                {emoji}
            </div>

            {/* Gabor Overlay - Only for target */}
            {isTarget && (
                <div 
                    key={`gabor-${emoji}`} // Force re-render when emoji changes
                    style={{ 
                        gridArea: '1 / 1',
                        fontSize: `${fontSize}px`,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'transparent',
                        backgroundImage: `repeating-linear-gradient(
                            45deg,
                            ${overlayColor}, 
                            ${overlayColor} 2px,
                            transparent 2px,
                            transparent 4px
                        )`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        pointerEvents: 'none',
                        zIndex: 10 // Ensure it sits on top
                    }}
                >
                    {emoji}
                </div>
            )}
        </div>
    );
};

const Level4: React.FC<Level4Props> = ({ setCurrentPage, saveLevelCompletion }) => {
  const [currentEmoji, setCurrentEmoji] = useState<string>('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [incorrectClicks, setIncorrectClicks] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [awardedStars, setAwardedStars] = useState(0);
  const [showStarAnimation, setShowStarAnimation] = useState(false);
  const [starAnimColor, setStarAnimColor] = useState('#fde047'); // Default yellow
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  
  const [cellSize, setCellSize] = useState(40);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use layout effect to calculate the max possible cell size that fits the screen
  useLayoutEffect(() => {
    const updateSize = () => {
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            const cellW = clientWidth / 10;
            const cellH = clientHeight / 10;
            setCellSize(Math.min(cellW, cellH) - 1);
        }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const totalClicks = correctClicks + incorrectClicks;

  // Check Game End Condition
  useEffect(() => {
      if (gameState === 'playing' && totalClicks >= MAX_ATTEMPTS) {
          finishGame();
      }
  }, [totalClicks, gameState]);

  const generateNewRound = useCallback(() => {
    const randomEmoji = EMOJI_GRID_L4[Math.floor(Math.random() * EMOJI_GRID_L4.length)];
    const newCorrectIndex = Math.floor(Math.random() * GRID_SIZE);

    setCurrentEmoji(randomEmoji);
    setCorrectIndex(newCorrectIndex);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      generateNewRound();
    }
  }, [gameState, generateNewRound]);

  // Intermediate Star Logic (During Gameplay)
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Based on correct clicks count (percentage of 100)
    const percentage = (correctClicks / MAX_ATTEMPTS) * 100;

    let starsEarned = 0;
    // Modified Thresholds: 
    // 3 stars (Red) is ONLY for 100%, so intermediate can only reach 2 stars max.
    if (percentage >= 60) {
      starsEarned = 2;
    } else if (percentage >= 30) {
      starsEarned = 1;
    }
    
    if (starsEarned > awardedStars) {
      setAwardedStars(starsEarned);
      setStarAnimColor('#fde047'); // Yellow for intermediate progress
      setShowStarAnimation(true);
      setTimeout(() => setShowStarAnimation(false), 1500);
    }
  }, [correctClicks, awardedStars, gameState]);


  const handleEmojiClick = (isCorrectChoice: boolean) => {
    if (gameState !== 'playing') return;

    if (isCorrectChoice) {
      setCorrectClicks(prev => prev + 1);
    } else {
      setIncorrectClicks(prev => prev + 1);
    }
    // Generate new round immediately
    generateNewRound();
  };

  const finishGame = () => {
      // Calculate score based on accuracy
      const accuracy = totalClicks > 0 ? (correctClicks / totalClicks) * 100 : 0;
      
      let stars = 0;
      let isPerfect = false;

      // Strict 100% Requirement for 3 Stars (Red)
      if (accuracy === 100) {
          stars = 3;
          isPerfect = true;
      } else if (accuracy >= 60) {
          stars = 2;
      } else if (accuracy >= 30) {
          stars = 1;
      }
      
      setAwardedStars(stars);

      // Trigger final animation
      if (isPerfect) {
          setStarAnimColor('#ef4444'); // Red for 100%
          setShowStarAnimation(true);
      } else if (stars > awardedStars) {
          setStarAnimColor('#fde047'); // Yellow
          setShowStarAnimation(true);
      }
      
      saveLevelCompletion('level4', stars);
      setGameState('finished');
  };
  
  const resetLevel = () => {
    setCorrectClicks(0);
    setIncorrectClicks(0);
    setAwardedStars(0);
    setGameState('playing');
    generateNewRound();
  };

  const handleHomeClick = () => {
    setIsConfirmingExit(true);
  };

  const handleConfirmExit = () => {
    setIsConfirmingExit(false);
    setCurrentPage('home');
  };

  // Visual Parameters based on Progress (0 to 1)
  const progressRatio = Math.min(1, totalClicks / MAX_ATTEMPTS);
  
  const START_SIZE_MULT = 0.85; 
  const END_SIZE_MULT = 0.45;
  const currentSizeMultiplier = START_SIZE_MULT - (progressRatio * (START_SIZE_MULT - END_SIZE_MULT));
  const currentFontSize = Math.max(12, cellSize * currentSizeMultiplier); 
  
  const START_CONTRAST = 1.0;
  const END_CONTRAST = 0.3;
  const currentContrast = START_CONTRAST - (progressRatio * (START_CONTRAST - END_CONTRAST));

  const renderGame = () => {
    if (gameState === 'finished') {
      // STRICT SUCCESS CONDITION: Only show "Next Level" button if 100% correct.
      // Otherwise, they must Retry.
      const isSuccess = correctClicks === MAX_ATTEMPTS;

      return (
        <GameEndScreen
          isSuccess={isSuccess} 
          correctCount={correctClicks}
          incorrectCount={incorrectClicks}
          onNextLevel={() => setCurrentPage('level5')}
          onReset={resetLevel}
          score={correctClicks}
          scoreLabel="Correct Clicks"
        />
      );
    }

    return (
        <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-px bg-slate-200 border border-slate-300">
            {Array.from({ length: GRID_SIZE }).map((_, index) => (
                <div key={index} className="w-full h-full bg-white relative overflow-hidden">
                    <LocalGaborEmoji
                        emoji={currentEmoji || '❓'}
                        isTarget={index === correctIndex}
                        contrast={currentContrast}
                        fontSize={currentFontSize}
                        onClick={() => handleEmojiClick(index === correctIndex)}
                    />
                </div>
            ))}
        </div>
    );
  };
  
  // Progress Bar percentage: Based on Correct Clicks out of Max Attempts (Target Goal)
  const percentage = Math.round((correctClicks / MAX_ATTEMPTS) * 100);

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50 overflow-hidden font-sans select-none">
      <FireworksReward show={showStarAnimation} color={starAnimColor} />
      
      {/* Header - Now contains all stats and controls */}
      <header className="flex-none bg-white px-4 py-3 shadow-md border-b border-slate-200 z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-700 w-24">
                Level 04
            </h1>
            
            {/* Scores */}
            <div className="flex gap-4">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">Correct</span>
                    <span className="text-xl font-bold text-teal-600 leading-none">{correctClicks}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Mistakes</span>
                    <span className="text-xl font-bold text-rose-500 leading-none">{incorrectClicks}</span>
                </div>
            </div>

            {/* Home Button - Updated to match app theme (Cyan/White) */}
            <button
                onClick={handleHomeClick}
                className="relative w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md transition-transform hover:scale-110 active:scale-95 group"
            >
                <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
                <span className="absolute -inset-1 rounded-full border border-cyan-100 opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500 ease-out"></span>
                <HomeIcon className="w-6 h-6 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
            </button>
        </div>

        {/* Long Progress Bar */}
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                {/* Display total attempts progress in label, but bar reflects correctness */}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress ({correctClicks}/{MAX_ATTEMPTS})</span>
                <span className="text-[10px] font-bold text-cyan-600">{percentage}%</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden w-full shadow-inner">
                <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-300 ease-out" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
      </header>

      {/* Main Game Area - Grows to fill ALL remaining space */}
      <main className="flex-grow w-full min-h-0 relative bg-slate-100 p-1" ref={containerRef}>
         <div className="w-full h-full shadow-lg bg-white flex items-center justify-center">
            {renderGame()}
         </div>
      </main>

      <ConfirmationModal
        isOpen={isConfirmingExit}
        title="Confirm Exit"
        message="Are you sure you want to return to the main menu?"
        onConfirm={handleConfirmExit}
        onCancel={() => setIsConfirmingExit(false)}
        confirmText="Exit"
      />
    </div>
  );
};

export default Level4;
