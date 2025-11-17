import React, { useState, useEffect, useCallback } from 'react';
import { Page } from '../../types';
import LevelLayout from '../LevelLayout';
import GameEndScreen from '../GameEndScreen';
import GaborEmoji from '../GaborEmoji';
import { EMOJI_GRID_L4, TARGET_SCORE_L4 } from '../../constants';

interface Level4Props {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number) => void;
}

const START_FONT_SIZE = 60;
const END_FONT_SIZE = 16;

const START_CONTRAST = 1.0;
const END_CONTRAST = 0.3;

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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
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

  // Calculate progress and apply an easing function for a non-linear difficulty curve.
  // This makes the sensitivity (visual difficulty) decrease more slowly at first, then more rapidly.
  const progress = correctClicks > 0 ? correctClicks / (TARGET_SCORE_L4 - 1) : 0;
  const easedProgress = Math.pow(progress, 1.5);

  const currentFontSize = START_FONT_SIZE - (START_FONT_SIZE - END_FONT_SIZE) * easedProgress;
  const currentContrast = START_CONTRAST - (START_CONTRAST - END_CONTRAST) * easedProgress;
  
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
  }, [gameState, correctClicks, generateNewRound]);

  const handleEmojiClick = (isCorrectChoice: boolean) => {
    if (gameState !== 'playing') return;

    if (isCorrectChoice) {
      const newCorrectClicks = correctClicks + 1;
      setCorrectClicks(newCorrectClicks);

      if (newCorrectClicks >= TARGET_SCORE_L4) {
        const isSuccess = incorrectClicks === 0;
        let stars = 0;
        if (isSuccess) {
            stars = 3;
        } else {
            const percentage = (newCorrectClicks / TARGET_SCORE_L4) * 100;
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
      }
    } else {
      setIncorrectClicks((prev) => prev + 1);
    }
  };
  
  const resetLevel = () => {
    setCorrectClicks(0);
    setIncorrectClicks(0);
    setAwardedStars(0);
    setGameState('playing');
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
      <div className="grid grid-cols-10 w-full max-w-3xl aspect-square mx-auto p-1 gap-1">
        {Array.from({ length: GRID_SIZE }).map((_, index) => (
             <GaborEmoji
                key={`${correctClicks}-${index}`} // Add correctClicks to key to force re-render
                hasGaborPatch={index === correctIndex}
                contrast={currentContrast}
                fontSize={currentFontSize}
                onClick={() => handleEmojiClick(index === correctIndex)}
                className="w-full h-full flex items-center justify-center"
            >
                {currentEmoji}
            </GaborEmoji>
        ))}
      </div>
    );
  };
  
  return (
    <LevelLayout levelId={4} setCurrentPage={setCurrentPage}>
      <FireworksReward show={showStarAnimation} />
      <div className="w-full flex-grow flex items-center justify-center min-h-0">
        {renderGame()}
      </div>
       {gameState === 'playing' && (
        <div className="shrink-0 flex justify-center space-x-2 sm:space-x-4 my-2 w-full max-w-xs sm:max-w-sm">
            <div className="bg-cyan-600 text-white p-2 sm:p-3 rounded-lg shadow-md flex-1 text-center font-bold text-sm sm:text-lg">Score: {correctClicks}/{TARGET_SCORE_L4}</div>
            <div className="bg-rose-500 text-white p-2 sm:p-3 rounded-lg shadow-md flex-1 text-center font-bold text-sm sm:text-lg">Incorrect: {incorrectClicks}</div>
        </div>
      )}
    </LevelLayout>
  );
};

export default Level4;