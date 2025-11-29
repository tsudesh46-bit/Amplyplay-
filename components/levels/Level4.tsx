
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page } from '../../types';
import LevelLayout from '../LevelLayout';
import GameEndScreen from '../GameEndScreen';
import GaborEmoji from '../GaborEmoji';
import { EMOJI_GRID_L4, TARGET_SCORE_L4 } from '../../constants';

interface Level4Props {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number) => void;
}

const GRID_SIZE = 100; // 10x10 grid

const FireworksReward: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;

  const particles = Array.from({ length: 40 });
  const radius = 200;

  return (
    <div className="fireworks-container">
      <div className="central-star">🌟</div>
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
            } as React.CSSProperties}
          />
        );
      })}
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
  
  // Responsive sizing state
  const [gridDimension, setGridDimension] = useState(300); // Default safe size
  const containerRef = useRef<HTMLDivElement>(null);

  // Robust Sizing Logic
  useEffect(() => {
    const calculateSize = () => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            // We want a square that fits within the available space
            // Subtract small padding to avoid touching edges
            if (width > 0 && height > 0) {
                const size = Math.min(width, height) - 10;
                setGridDimension(size > 0 ? size : 300);
            }
        }
    };

    // Initial calc
    calculateSize();

    // Polling to ensure layout has settled (fixes issues where ref is initially empty/small)
    const interval = setInterval(calculateSize, 100);
    const timeout = setTimeout(() => clearInterval(interval), 2000); // Stop polling after 2s

    window.addEventListener('resize', calculateSize);

    return () => {
        window.removeEventListener('resize', calculateSize);
        clearInterval(interval);
        clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const percentage = (correctClicks / TARGET_SCORE_L4) * 100;

    let starsEarned = 0;
    if (percentage > 60) {
      starsEarned = 2;
    } else if (percentage > 30) {
      starsEarned = 1;
    }
    
    if (starsEarned > awardedStars) {
      setAwardedStars(starsEarned);
      setShowStarAnimation(true);
      setTimeout(() => setShowStarAnimation(false), 1500);
    }
  }, [correctClicks, awardedStars, gameState]);

  // Calculate progress ratio (0 to 1)
  const progressRatio = Math.min(1, correctClicks / TARGET_SCORE_L4);

  // Dynamic Visual Parameters
  const cellSize = gridDimension / 10;
  
  // Size Logic: Linear decrease from Start to End
  // Similar to Level 1 and 2
  const START_SIZE_MULT = 0.75; 
  const END_SIZE_MULT = 0.35;
  const currentSizeMultiplier = START_SIZE_MULT - (progressRatio * (START_SIZE_MULT - END_SIZE_MULT));
  const currentFontSize = cellSize * currentSizeMultiplier; 
  
  // Contrast logic: Linear decrease from Start to End
  const START_CONTRAST = 1.0;
  const END_CONTRAST = 0.2;
  const currentContrast = START_CONTRAST - (progressRatio * (START_CONTRAST - END_CONTRAST));
  
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

  const handleEmojiClick = (isCorrectChoice: boolean) => {
    if (gameState !== 'playing') return;

    if (isCorrectChoice) {
      const newCorrectClicks = correctClicks + 1;
      setCorrectClicks(newCorrectClicks);

      if (newCorrectClicks >= TARGET_SCORE_L4) {
        finishGame(newCorrectClicks, incorrectClicks);
        return; 
      }
    } else {
      setIncorrectClicks((prev) => prev + 1);
    }

    // Logic Update: Always generate new round, even on wrong click
    // This keeps the game moving and fixes the "stuck" feeling
    generateNewRound();
  };

  const finishGame = (finalCorrect: number, finalIncorrect: number) => {
      const isSuccess = finalIncorrect === 0;
      let stars = 0;
      if (isSuccess) {
          stars = 3;
      } else {
          const percentage = (finalCorrect / TARGET_SCORE_L4) * 100;
          if (percentage > 60) stars = 2;
          else if (percentage > 30) stars = 1;
      }
      
      if (isSuccess) {
          setAwardedStars(3);
          setShowStarAnimation(true);
          setTimeout(() => {
              saveLevelCompletion('level4', stars);
              setGameState('finished');
          }, 1500);
      } else {
          saveLevelCompletion('level4', stars);
          setGameState('finished');
      }
  };
  
  const resetLevel = () => {
    setCorrectClicks(0);
    setIncorrectClicks(0);
    setAwardedStars(0);
    setGameState('playing');
    generateNewRound();
  };

  const renderGame = () => {
    if (gameState === 'finished') {
      return (
        <GameEndScreen
          isSuccess={incorrectClicks === 0}
          correctCount={correctClicks}
          incorrectCount={incorrectClicks}
          onNextLevel={() => setCurrentPage('level5')}
          onReset={resetLevel}
        />
      );
    }

    return (
        // Grid Container
        <div 
            className="grid grid-cols-10 gap-0 bg-slate-200 border border-slate-300 shadow-sm"
            style={{ width: gridDimension, height: gridDimension }}
        >
            {Array.from({ length: GRID_SIZE }).map((_, index) => (
                 <div 
                    key={`${index}`} 
                    className="w-full h-full flex items-center justify-center bg-white border-[0.5px] border-slate-100"
                 >
                    <GaborEmoji
                        hasGaborPatch={index === correctIndex}
                        contrast={currentContrast}
                        fontSize={currentFontSize}
                        onClick={() => handleEmojiClick(index === correctIndex)}
                        className="w-full h-full flex items-center justify-center cursor-pointer select-none hover:bg-slate-50 active:bg-slate-100"
                    >
                        {currentEmoji || '❓'}
                    </GaborEmoji>
                </div>
            ))}
        </div>
    );
  };
  
  // Percentage for progress bar
  const percentage = Math.min(100, (correctClicks / TARGET_SCORE_L4) * 100);

  return (
    <LevelLayout levelId={4} setCurrentPage={setCurrentPage}>
      <FireworksReward show={showStarAnimation} />
      
      {/* 
         Structure:
         1. Main Container (flex col, h-full)
         2. Game Area (flex-grow) - ref={containerRef}
         3. Footer (flex-none)
      */}
      <div className="flex flex-col w-full h-full max-h-full overflow-hidden items-center">
        
        {/* Game Area - Takes available space */}
        <div ref={containerRef} className="flex-grow w-full flex items-center justify-center overflow-hidden p-1">
            {renderGame()}
        </div>

        {/* Footer Area - Distinct, static height, placed below items */}
        {gameState === 'playing' && (
            <div className="flex-none w-full max-w-sm px-4 pb-2 pt-1 z-10">
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
                    {/* Progress Bar */}
                    <div className="mb-2">
                        <div className="flex justify-between items-center mb-1 text-slate-600">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Progress</span>
                            <span className="text-[10px] font-bold">{Math.round(percentage)}%</span>
                        </div>
                        <div className="progress-bar-container-thin h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="progress-bar-fill-thin h-full bg-cyan-500 transition-all duration-300" style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                    
                    {/* Score Pills */}
                    <div className="flex justify-center space-x-2">
                        <div className="bg-cyan-600 text-white py-1 px-3 rounded shadow-sm flex-1 text-center flex flex-col justify-center">
                            <span className="text-[9px] uppercase opacity-80 leading-none mb-0.5">Score</span>
                            <span className="font-bold text-sm leading-none">{correctClicks}/{TARGET_SCORE_L4}</span>
                        </div>
                        <div className="bg-rose-500 text-white py-1 px-3 rounded shadow-sm flex-1 text-center flex flex-col justify-center">
                            <span className="text-[9px] uppercase opacity-80 leading-none mb-0.5">Mistakes</span>
                            <span className="font-bold text-sm leading-none">{incorrectClicks}</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </LevelLayout>
  );
};

export default Level4;
