import React, { useState, useEffect, useCallback } from 'react';
import { Page } from '../../types';

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
        className="absolute bottom-4 right-4 bg-white text-cyan-600 p-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-cyan-300"
        aria-label="Home"
    >
        <svg
            className="w-10 h-10"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
        </svg>
    </button>
);

const text3DStyle = { textShadow: '2px 2px 4px rgba(0,0,0,0.2)' };

// Star Reward Component
const StarReward: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  return (
    <div className="star-reward-container">
      <div className="star-popup">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
    </div>
  );
};

// Local LevelComponent, replacing LevelLayout for this level
const LevelComponent: React.FC<{ levelId: number, children: React.ReactNode, setCurrentPage: (page: Page) => void }> = ({ levelId, children, setCurrentPage }) => (
    <div className="relative min-h-screen bg-white flex flex-col items-center p-4 overflow-hidden">
        <h2
            className="text-4xl font-bold text-slate-700 mb-4 mt-4"
            style={text3DStyle}
        >
            Level {String(levelId).padStart(2, '0')}
        </h2>
        {children}
        <HomeButton onClick={() => setCurrentPage('home')} />
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

    const MAX_NUMBER = 101;
    const START_FONT_SIZE = 100, END_FONT_SIZE = 12;
    const FONT_SIZE_DECREMENT = (START_FONT_SIZE - END_FONT_SIZE) / (MAX_NUMBER - 1);
    const START_CONTRAST = 1.0, END_CONTRAST = 0.2;
    const CONTRAST_DECREMENT = (START_CONTRAST - END_CONTRAST) / (MAX_NUMBER - 1);

    const currentFontSize = Math.max(END_FONT_SIZE, START_FONT_SIZE - (currentNumber - 1) * FONT_SIZE_DECREMENT);
    const currentContrast = Math.max(END_CONTRAST, START_CONTRAST - (currentNumber - 1) * CONTRAST_DECREMENT);
    const progress = currentNumber >= MAX_NUMBER - 1 ? 100 : ((currentNumber - 1) / (MAX_NUMBER - 2)) * 100;

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

        const totalQuestions = MAX_NUMBER - 1;
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

    const handleNumberClick = (isCorrect: boolean) => {
        if (gameState !== 'playing') return;

        const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
        const newIncorrectCount = !isCorrect ? incorrectCount + 1 : incorrectCount;

        setCorrectCount(newCorrectCount);
        setIncorrectCount(newIncorrectCount);

        if (currentNumber >= MAX_NUMBER - 1) {
            const totalQuestions = MAX_NUMBER - 1;
            let stars = 0;
            if (newIncorrectCount === 0) {
                stars = 3;
            } else {
                const percentage = (newCorrectCount / totalQuestions) * 100;
                if (percentage > 60) stars = 2;
                else if (percentage > 30) stars = 1;
            }
            saveLevelCompletion('level2', stars);
            setGameState(newIncorrectCount === 0 ? 'success' : 'fail');
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
    
    const buttonText3DStyle = { textShadow: '1px 1px 2px rgba(0,0,0,0.4)' };

    const renderGame = () => {
        if (currentNumber > MAX_NUMBER - 1 || gameState !== 'playing') {
             const isSuccess = gameState === 'success';
             return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border-t-4 border-cyan-500">
                        <div className="mb-6">
                            {isSuccess ? (
                                <div className="text-teal-500 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                </div>
                            ) : (
                                <div className="text-rose-500 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                        </div>
                        <h2 className={`text-3xl font-bold mb-3 ${isSuccess ? 'text-teal-600' : 'text-rose-600'}`} style={text3DStyle}>
                            {isSuccess ? 'සුබ පැතුම්!' : 'නැවත උත්සාහ කරන්න'}
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            {isSuccess ? 'අදියර සාර්ථකව නිම කරන ලදී!' : 'ඔබට මීළඟ වතාවේදී මීට වඩා හොඳින් කළ හැකියි!'}
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">ප්‍රතිඵල</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center"><div className="text-2xl font-bold text-teal-600">{correctCount}</div><div className="text-sm text-gray-500">නිවැරදියි</div></div>
                                <div className="text-center"><div className="text-2xl font-bold text-rose-600">{incorrectCount}</div><div className="text-sm text-gray-500">වැරදියි</div></div>
                            </div>
                        </div>
                        <button onClick={isSuccess ? () => setCurrentPage('level3') : resetLevel}
                            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 ${isSuccess ? 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-300' : 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-300'}`} style={buttonText3DStyle}>
                            {isSuccess ? (<span className="flex items-center justify-center">මීළඟ අදියර<svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></span>) : (<span className="flex items-center justify-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>නැවත උත්සාහ කරන්න</span>)}
                        </button>
                    </div>
                </div>
            );
        }

        if (numberPositions.length < 4) {
            return <div className="flex-grow flex items-center justify-center">Loading...</div>;
        }

        return (
            <div className="relative w-full h-full flex-grow">
                {numberPositions.map((pos, index) => (
                    <div
                        key={index}
                        onClick={() => handleNumberClick(index === correctIndex)}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{
                            ...pos,
                            ...getDynamicGaborStyle(
                                index === correctIndex,
                                currentContrast,
                                currentFontSize
                            ),
                        }}
                    >
                        {currentNumber}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <LevelComponent levelId={2} setCurrentPage={setCurrentPage}>
            <StarReward show={showStarAnimation} />
            <div className="flex-grow flex flex-col items-center justify-center w-full">
                {renderGame()}
            </div>
            {gameState === 'playing' && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
                    <div className="mb-2">
                        <div className="flex justify-between items-center mb-1 text-slate-600">
                            <span className="text-sm font-semibold">Progress</span>
                            <span className="text-sm font-bold">{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-bar-container-thin">
                            <div className="progress-bar-fill-thin" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <div className="flex justify-center space-x-8 mt-2">
                        <div className="bg-teal-500 text-white p-4 rounded-lg shadow-md flex-1 text-center font-bold text-lg" style={buttonText3DStyle}>
                            <p className="mb-1">නිවැරදියි</p>
                            <p>{correctCount}</p>
                        </div>
                        <div className="bg-rose-500 text-white p-4 rounded-lg shadow-md flex-1 text-center font-bold text-lg" style={buttonText3DStyle}>
                            <p className="mb-1">වැරදියි</p>
                            <p>{incorrectCount}</p>
                        </div>
                    </div>
                </div>
            )}
        </LevelComponent>
    );
};

export default Level2;