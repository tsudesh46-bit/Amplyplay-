
import React, { useState, useEffect } from 'react';
import { Page } from '../../types';
import LevelLayout from '../LevelLayout';
import GameEndScreen from '../GameEndScreen';
import GaborText from '../GaborText';
import { ALPHABET } from '../../constants';

interface Level1Props {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, isCompleted: boolean) => void;
}

const START_FONT_SIZE = 120;
const END_FONT_SIZE = 24;
const FONT_SIZE_DECREMENT = (START_FONT_SIZE - END_FONT_SIZE) / (ALPHABET.length - 1);

const START_CONTRAST = 1.0;
const END_CONTRAST = 0.2;
const CONTRAST_DECREMENT = (START_CONTRAST - END_CONTRAST) / (ALPHABET.length - 1);

const Level1: React.FC<Level1Props> = ({ setCurrentPage, saveLevelCompletion }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [correctSide, setCorrectSide] = useState(0);

  const currentFontSize = Math.max(END_FONT_SIZE, START_FONT_SIZE - currentIndex * FONT_SIZE_DECREMENT);
  const currentContrast = Math.max(END_CONTRAST, START_CONTRAST - currentIndex * CONTRAST_DECREMENT);

  useEffect(() => {
    if (gameState === 'playing') {
      setCorrectSide(Math.floor(Math.random() * 2));
    }
  }, [currentIndex, gameState]);

  const handleLetterClick = (isCorrectChoice: boolean) => {
    if (gameState !== 'playing') return;

    if (isCorrectChoice) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }

    if (currentIndex >= ALPHABET.length - 1) {
      const success = incorrectCount === 0;
      saveLevelCompletion('level1', success);
      setGameState('finished');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const resetLevel = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setGameState('playing');
  };

  const renderGame = () => {
    if (gameState === 'finished') {
      return (
        <GameEndScreen
          isSuccess={incorrectCount === 0}
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          onNextLevel={() => setCurrentPage('level2')}
          onReset={resetLevel}
        />
      );
    }

    const currentLetter = ALPHABET[currentIndex];
    
    return (
      <div className="flex justify-center items-center h-full w-full space-x-12 sm:space-x-24">
        <GaborText
            isCorrect={correctSide === 0}
            contrast={currentContrast}
            fontSize={currentFontSize}
            onClick={() => handleLetterClick(correctSide === 0)}
        >
            {currentLetter}
        </GaborText>
        <GaborText
            isCorrect={correctSide === 1}
            contrast={currentContrast}
            fontSize={currentFontSize}
            onClick={() => handleLetterClick(correctSide === 1)}
        >
            {currentLetter}
        </GaborText>
      </div>
    );
  };

  return (
    <LevelLayout levelId={1} setCurrentPage={setCurrentPage}>
       {renderGame()}
       {gameState === 'playing' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center space-x-8 my-4 w-full max-w-sm">
            <div className="bg-teal-500 text-white p-3 rounded-lg shadow-md flex-1 text-center font-bold text-lg">Correct: {correctCount}</div>
            <div className="bg-rose-500 text-white p-3 rounded-lg shadow-md flex-1 text-center font-bold text-lg">Incorrect: {incorrectCount}</div>
        </div>
      )}
    </LevelLayout>
  );
};

export default Level1;