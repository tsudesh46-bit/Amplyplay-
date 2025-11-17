import React, { useState, useEffect } from 'react';
import { Page } from '../../types';
import LevelLayout from '../LevelLayout';
import GameEndScreen from '../GameEndScreen';
import GaborEmoji from '../GaborEmoji';
import { EMOJI_PAIRS_L3 } from '../../constants';

interface Level3Props {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number) => void;
}

const START_FONT_SIZE = 120;
const END_FONT_SIZE = 30;
const FONT_SIZE_DECREMENT = (START_FONT_SIZE - END_FONT_SIZE) / (EMOJI_PAIRS_L3.length - 1);

const START_CONTRAST = 1.0;
const END_CONTRAST = 0.2;
const CONTRAST_DECREMENT = (START_CONTRAST - END_CONTRAST) / (EMOJI_PAIRS_L3.length - 1);

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

const Level3: React.FC<Level3Props> = ({ setCurrentPage, saveLevelCompletion }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [correctSide, setCorrectSide] = useState(0);
  const [awardedStars, setAwardedStars] = useState(0);
  const [showStarAnimation, setShowStarAnimation] = useState(false);

  const currentFontSize = Math.max(END_FONT_SIZE, START_FONT_SIZE - currentIndex * FONT_SIZE_DECREMENT);
  const currentContrast = Math.max(END_CONTRAST, START_CONTRAST - currentIndex * CONTRAST_DECREMENT);
  const progress = (correctCount / EMOJI_PAIRS_L3.length) * 100;

  useEffect(() => {
    if (gameState === 'playing') {
      setCorrectSide(Math.floor(Math.random() * 2));
    }
  }, [currentIndex, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const totalQuestions = EMOJI_PAIRS_L3.length;
    const percentage = (correctCount / totalQuestions) * 100;

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
  }, [correctCount, awardedStars, gameState]);

  const handleEmojiClick = (isCorrectChoice: boolean) => {
    if (gameState !== 'playing') return;

    if (isCorrectChoice) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }

    if (currentIndex >= EMOJI_PAIRS_L3.length - 1) {
      const finalCorrect = isCorrectChoice ? correctCount + 1 : correctCount;
      const finalIncorrect = isCorrectChoice ? incorrectCount : incorrectCount + 1;
      const isSuccess = finalIncorrect === 0;
      let stars = 0;
      if (isSuccess) {
          stars = 3;
      } else {
          const percentage = (finalCorrect / EMOJI_PAIRS_L3.length) * 100;
          if (percentage > 60) stars = 2;
          else if (percentage > 30) stars = 1;
      }

      if (isSuccess) {
        setAwardedStars(3);
        setShowStarAnimation(true);
        setTimeout(() => {
            saveLevelCompletion('level3', stars);
            setGameState('finished');
        }, 1500);
      } else {
        saveLevelCompletion('level3', stars);
        setGameState('finished');
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const resetLevel = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setAwardedStars(0);
    setGameState('playing');
  };

  const renderGame = () => {
    if (gameState === 'finished') {
      return (
        <GameEndScreen
          isSuccess={incorrectCount === 0}
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          onNextLevel={() => setCurrentPage('level4')}
          onReset={resetLevel}
        />
      );
    }

    const stimulusEmoji = EMOJI_PAIRS_L3[currentIndex][0];

    return (
      <div className="flex justify-center items-center h-full w-full space-x-12 sm:space-x-24">
        <GaborEmoji
          hasGaborPatch={correctSide === 0}
          contrast={currentContrast}
          fontSize={currentFontSize}
          onClick={() => handleEmojiClick(correctSide === 0)}
        >
          {stimulusEmoji}
        </GaborEmoji>
        <GaborEmoji
          hasGaborPatch={correctSide === 1}
          contrast={currentContrast}
          fontSize={currentFontSize}
          onClick={() => handleEmojiClick(correctSide === 1)}
        >
          {stimulusEmoji}
        </GaborEmoji>
      </div>
    );
  };

  return (
    <LevelLayout levelId={3} setCurrentPage={setCurrentPage}>
       <FireworksReward show={showStarAnimation} />
       {renderGame()}
       {gameState === 'playing' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
            <div className="mb-2">
                <div className="flex justify-between items-center mb-1 text-slate-600">
                    <span className="text-sm font-semibold">Progress</span>
                    <span className="text-sm font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar-container-thin">
                    <div className="progress-bar-fill-thin" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div className="flex justify-center space-x-8">
                <div className="bg-teal-500 text-white p-3 rounded-lg shadow-md flex-1 text-center font-bold text-lg">Correct: {correctCount}</div>
                <div className="bg-rose-500 text-white p-3 rounded-lg shadow-md flex-1 text-center font-bold text-lg">Incorrect: {incorrectCount}</div>
            </div>
        </div>
      )}
    </LevelLayout>
  );
};

export default Level3;