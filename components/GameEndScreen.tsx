import React from 'react';
import { CheckCircleIcon, XCircleIcon, NextIcon, RetryIcon } from './ui/Icons';

interface GameEndScreenProps {
  isSuccess: boolean;
  correctCount: number;
  incorrectCount: number;
  onNextLevel: () => void;
  onReset: () => void;
  score?: number;
  scoreLabel?: string;
}

const GameEndScreen: React.FC<GameEndScreenProps> = ({ isSuccess, correctCount, incorrectCount, onNextLevel, onReset, score, scoreLabel }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center w-full">
      {/* FIX: Combined duplicate className attributes into a single attribute to resolve the JSX error. */}
      <div
           className={`bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-t-8 animate-fade-in-up ${isSuccess ? 'border-teal-500' : 'border-rose-500'}`}
      >
        <div className="mb-6">
          {isSuccess ? (
            <CheckCircleIcon className="w-20 h-20 mx-auto text-teal-500" />
          ) : (
            <XCircleIcon className="w-20 h-20 mx-auto text-rose-500" />
          )}
        </div>
        <h2 className={`text-3xl font-bold mb-3 ${isSuccess ? 'text-teal-600' : 'text-rose-600'}`}>
          {isSuccess ? 'Congratulations!' : 'Try Again'}
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          {isSuccess ? 'You completed the level successfully!' : 'You can do better next time!'}
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">{score !== undefined ? score.toFixed(1) : correctCount}</div>
              <div className="text-sm text-gray-500">{scoreLabel || 'Correct'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600">{incorrectCount}</div>
              <div className="text-sm text-gray-500">Incorrect</div>
            </div>
          </div>
        </div>
        <button
          onClick={isSuccess ? onNextLevel : onReset}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 ${
            isSuccess ? 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-300' : 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-300'
          }`}
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
};

export default GameEndScreen;