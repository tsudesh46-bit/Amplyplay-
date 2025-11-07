
import React from 'react';
import { Page } from '../../types';
import LevelLayout from '../LevelLayout';

interface LevelPlaceholderProps {
  levelNumber: number;
  setCurrentPage: (page: Page) => void;
}

const LevelPlaceholder: React.FC<LevelPlaceholderProps> = ({ levelNumber, setCurrentPage }) => {
  return (
    <LevelLayout levelId={levelNumber} setCurrentPage={setCurrentPage}>
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold text-slate-700">Coming Soon!</h2>
        <p className="text-xl text-slate-500 mt-4">
          This level is currently under development. Please check back later.
        </p>
      </div>
    </LevelLayout>
  );
};

export default LevelPlaceholder;
