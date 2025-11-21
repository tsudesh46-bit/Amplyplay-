
import React, { useState, useEffect, useCallback } from 'react';
import { Page } from '../../types';
import { NextIcon, RetryIcon, HomeIcon } from '../ui/Icons'; // Added HomeIcon import
import ConfirmationModal from '../ConfirmationModal';

// Helper for Gabor style, replacing GaborText component for this level
const getDynamicGaborStyle = (isCorrect: boolean, contrast: number, fontSize: number): React.CSSProperties => {
    const baseColorValue = 0; // Black
    const textColor = `rgba(${baseColorValue}, ${baseColorValue}, ${baseColorValue}, ${contrast})`;
    const baseStyle: React.CSSProperties = {
        fontSize: `${fontSize}px`,
        fontWeight: 'bold',
        color: textColor,
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        transition: 'all 0.1s ease-in-out',
        cursor: 'pointer',
        willChange: 'transform, filter, opacity',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
    if (isCorrect) {
        const gaborColor1 = `rgba(${baseColorValue}, ${baseColorValue}, ${baseColorValue}, ${contrast})`;
        const gaborColor2 = `rgba(${baseColorValue + 50}, ${baseColorValue + 50}, ${baseColorValue + 50}, ${contrast})`; // A slightly lighter black
        return {
            ...baseStyle,
            backgroundImage: `repeating-linear-gradient(45deg, ${gaborColor1}, ${gaborColor1} 3px, ${gaborColor2} 3px, ${gaborColor2} 6px)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent', // Fallback
        };
    }
    return baseStyle;
};

// Local HomeButton component for this level
const HomeButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute bottom-4 right-4 group w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-xl transition-transform hover:scale-110 focus:outline-none z-30"
        aria-label="Home"
    >
         {/* Inner Ring */}
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        {/* Outer Pulse Ring */}
        <span className="absolute -inset-1 rounded-full border border-cyan-100 opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500 ease-out"></span>
        
        <HomeIcon className="w-8 h-8 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
    </button>
);

const text3DStyle = { textShadow: '2px 2px 4px rgba(0,0,0,0.2)' };

// Fireworks Reward Component
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

// Local LevelComponent, replacing LevelLayout for this level
const LevelComponent: React.FC<{ levelId: number, children: React.ReactNode, onHomeClick: () => void }> = ({ levelId, children, onHomeClick }) => (
    <div className="relative min-h-screen bg-white flex flex-col items-center p-4 overflow-hidden">
        <h2
            className="text-4xl font-bold text-slate-700 mb-4 mt-4"
            style={text3DStyle}
        >
            Level {String(levelId).padStart(2, '0')}
        </h2>
        {children}
        <HomeButton onClick={onHomeClick} />
    </div>
);

interface Level2Props {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, stars: number) => void;
}

const Level2: React.FC<Level2Props> = ({ setCurrentPage, saveLevelCompletion }) => {
    const [currentNumber, setCurrentNumber] = useState(1);
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'success' | 'fail'>('playing');
    const [numberPositions, setNumberPositions] = useState<{top: string, left: string}[]>([]);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [awardedStars, setAwardedStars] = useState(0);
    const [showStarAnimation, setShowStarAnimation] = useState(false);
    const [isConfirmingExit, setIsConfirmingExit] = useState(false);

    const MAX_NUMBER = 101;
    const START_FONT_SIZE = 100, END_FONT_SIZE = 12;
    const FONT_SIZE_DECREMENT = (START_FONT_SIZE - END_FONT_SIZE) / (MAX_NUMBER - 1);
    const START_CONTRAST = 1.0, END_CONTRAST = 0.2;
    const CONTRAST_DECREMENT = (START_CONTRAST - END_CONTRAST) / (MAX_NUMBER - 1);
    const totalQuestions = MAX_NUMBER - 1;

    const currentFontSize = Math.max(END_FONT_SIZE, START_FONT_SIZE - (currentNumber - 1) * FONT_SIZE_DECREMENT);
    const currentContrast = Math.max(END_CONTRAST, START_CONTRAST - (currentNumber - 1) * CONTRAST_DECREMENT);
    const progress = (correctCount / totalQuestions) * 100;

    const generateNumberLayout = useCallback(() => {
        const fixedPositions = [
            { top: '30%', left: '20%' },
            { top: '30%', left: '80%' },
            { top: '70%', left: '20%' },
            { top: '70%', left: '80%' },
        ];
        const shuffledPositions = [...fixedPositions].sort(() => Math.random() - 0.5);
        setNumberPositions(shuffledPositions);
        setCorrectIndex(Math.floor(Math.random() * 4));
    }, []);

    useEffect(() => {
        if (gameState === 'playing' && currentNumber <= MAX_NUMBER) {
            generateNumberLayout();
        }
    }, [currentNumber, generateNumberLayout, gameState]);

    useEffect(() => {
        if (gameState !== 'playing') return;

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
    }, [correctCount, awardedStars, gameState, totalQuestions]);

    const handleNumberClick = (isCorrect: boolean) => {
        if (gameState !== 'playing') return;

        const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
        const newIncorrectCount = !isCorrect ? incorrectCount + 1 : incorrectCount;

        setCorrectCount(newCorrectCount);
        setIncorrectCount(newIncorrectCount);

        if (currentNumber >= MAX_NUMBER - 1) {
            const isSuccess = newIncorrectCount === 0;
            let stars = 0;
            if (isSuccess) {
                stars = 3;
            } else {
                const percentage = (newCorrectCount / totalQuestions) * 100;
                if (percentage > 60) stars = 2;
                else if (percentage > 30) stars = 1;
            }

            if (isSuccess) {
                setAwardedStars(3);
                setShowStarAnimation(true);
                setTimeout(() => {
                    saveLevelCompletion('level2', stars);
                    setGameState('success');
                }, 1500);
            } else {
                saveLevelCompletion('level2', stars);
                setGameState('fail');
            }
        } else {
            setCurrentNumber(currentNumber + 1);
        }
    };
    
    const resetLevel = () => {
        setCurrentNumber(1);
        setCorrectCount(0);
        setIncorrectCount(0);
        setAwardedStars(0);
        setGameState('playing');
    };
    
    const handleHomeClick = () => {
        setIsConfirmingExit(true);
    };
    
    const handleConfirmExit = () => {
        setIsConfirmingExit(false);
        setCurrentPage('home');
    };

    const handleCancelExit = () => {
        setIsConfirmingExit(false);
    };

    const buttonText3DStyle = { textShadow: '1px 1px 2px rgba(0,0,0,0.4)' };

    const renderGame = () => {
        if (currentNumber > MAX_NUMBER - 1 || gameState !== 'playing') {
             const isSuccess = gameState === 'success' || (gameState !== 'fail' && incorrectCount === 0);
             return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border-t-4 border-cyan-500">
                        <div className="mb-6">
                            {isSuccess ? (
                                <div className="text-teal-500 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                </div>
                            ) : (
                                <div className="text-rose-500 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                                </div>
                            )}
                        </div>
                        <h2 style={text3DStyle} className={`text-3xl font-bold mb-3 ${isSuccess ? 'text-teal-600' : 'text-rose-600'}`}>
                            {isSuccess ? 'Level Complete!' : 'Try Again'}
                        </h2>
                        <div className="grid grid-cols-2 gap-4 my-6 bg-slate-50 p-4 rounded-lg">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-teal-600">{correctCount}</p>
                                <p className="text-sm text-slate-500">Correct</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-rose-600">{incorrectCount}</p>
                                <p className="text-sm text-slate-500">Incorrect</p>
                            </div>
                        </div>
                        <button
                            onClick={isSuccess ? () => setCurrentPage('level3') : resetLevel}
                            style={buttonText3DStyle}
                            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition duration-300 ease-in-out transform hover:scale-105 ${isSuccess ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-rose-500 hover:bg-rose-600'}`}
                        >
                           {isSuccess ? (
                                <span className="flex items-center justify-center">Next Level <NextIcon /></span>
                           ) : (
                                <span className="flex items-center justify-center"><RetryIcon /> Try Again</span>
                           )}
                        </button>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="flex-grow w-full relative">
                {numberPositions.map((pos, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: pos.top,
                            left: pos.left,
                            transform: 'translate(-50%, -50%)',
                            ...getDynamicGaborStyle(index === correctIndex, currentContrast, currentFontSize),
                        }}
                        onClick={() => handleNumberClick(index === correctIndex)}
                    >
                        {currentNumber}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <LevelComponent levelId={2} onHomeClick={handleHomeClick}>
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
             <ConfirmationModal
                isOpen={isConfirmingExit}
                title="Confirm Exit"
                message="Are you sure you want to return to the main menu?"
                onConfirm={handleConfirmExit}
                onCancel={handleCancelExit}
                confirmText="Exit"
            />
        </LevelComponent>
    );
};

export default Level2;
