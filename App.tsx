
import React, { useState, useCallback, useEffect } from 'react';
import { Page, CompletedLevels } from './types';
import HomePage from './components/HomePage';
import SideMenu from './components/SideMenu';
import PerformancePage from './components/PerformancePage';
import Level1 from './components/levels/Level1';
import Level2 from './components/levels/Level2';
import Level3 from './components/levels/Level3';
import Level4 from './components/levels/Level4';
import Level5 from './components/levels/Level5';
import Level6 from './components/levels/Level6';
import LevelPlaceholder from './components/levels/LevelPlaceholder';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<CompletedLevels>({});

  // Since localStorage isn't available, we start with empty progress.
  useEffect(() => {
    setCompletedLevels({});
  }, []);

  const saveLevelCompletion = useCallback(async (levelId: string, stars: number) => {
    setCompletedLevels((prev) => ({
      ...prev,
      [levelId]: stars,
    }));
  }, []);

  const renderPage = () => {
    const levelProps = {
      setCurrentPage,
      saveLevelCompletion,
    };

    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} setIsSideMenuOpen={setIsSideMenuOpen} isSideMenuOpen={isSideMenuOpen} completedLevels={completedLevels} />;
      case 'performance':
        return <PerformancePage setCurrentPage={setCurrentPage} completedLevels={completedLevels} />;
      case 'level1':
        return <Level1 {...levelProps} />;
      case 'level2':
        return <Level2 {...levelProps} />;
      case 'level3':
        return <Level3 {...levelProps} />;
      case 'level4':
        return <Level4 {...levelProps} />;
      case 'level5':
         return <Level5 {...levelProps} />;
      case 'level6':
        return <Level6 {...levelProps} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} setIsSideMenuOpen={setIsSideMenuOpen} isSideMenuOpen={isSideMenuOpen} completedLevels={completedLevels}/>;
    }
  };

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        setCurrentPage={setCurrentPage}
        completedLevels={completedLevels}
      />
      {renderPage()}
    </div>
  );
};

export default App;