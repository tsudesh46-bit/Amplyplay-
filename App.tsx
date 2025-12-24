
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Page, CompletedLevels } from './types';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import SideMenu from './components/SideMenu';
import PerformancePage from './components/PerformancePage';
import ProfilePage from './components/ProfilePage';
import StrabplayHome from './components/StrabplayHome';
import Level1 from './components/levels/Level1';
import Level2 from './components/levels/Level2';
import Level3 from './components/levels/Level3';
import Level4 from './components/levels/Level4';
import Level5 from './components/levels/Level5';
import Level6 from './components/levels/Level6';
import StrabLevelPlaceholder from './components/strab/StrabLevelPlaceholder';

const DEMO_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<CompletedLevels>({});
  
  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStartTime, setDemoStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    setCompletedLevels({});
  }, []);

  // Demo Session Monitoring
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isDemoMode && demoStartTime !== null) {
      interval = setInterval(() => {
        const elapsed = Date.now() - demoStartTime;
        const remaining = Math.max(0, DEMO_LIMIT_MS - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          handleLogout();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDemoMode, demoStartTime]);

  const handleLogout = useCallback(() => {
    setCurrentPage('login');
    setIsDemoMode(false);
    setDemoStartTime(null);
    setTimeLeft(null);
    setIsSideMenuOpen(false);
  }, []);

  const startDemoSession = useCallback(() => {
    setIsDemoMode(true);
    setDemoStartTime(Date.now());
    setTimeLeft(DEMO_LIMIT_MS);
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

    if (currentPage.startsWith('strab_level')) {
        return <StrabLevelPlaceholder setCurrentPage={setCurrentPage} levelName={currentPage.replace('strab_level', 'Strab Level ')} />;
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} startDemoSession={startDemoSession} />;
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} setIsSideMenuOpen={setIsSideMenuOpen} isSideMenuOpen={isSideMenuOpen} completedLevels={completedLevels} />;
      case 'strabplay_home':
        return <StrabplayHome setCurrentPage={setCurrentPage} completedLevels={completedLevels} />;
      case 'performance':
        return <PerformancePage setCurrentPage={setCurrentPage} completedLevels={completedLevels} />;
      case 'profile':
        return <ProfilePage setCurrentPage={setCurrentPage} />;
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

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      {currentPage !== 'login' && (
        <>
          <SideMenu
            isOpen={isSideMenuOpen}
            onClose={() => setIsSideMenuOpen(false)}
            setCurrentPage={setCurrentPage}
            completedLevels={completedLevels}
          />
          {/* Demo Timer Overlay */}
          {isDemoMode && timeLeft !== null && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-[#0a1128] text-white px-6 py-2 rounded-full font-black shadow-2xl border-2 border-indigo-400 animate-pulse flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-indigo-300">Demo Session Ends In:</span>
              <span className="text-xl font-mono text-cyan-400">{formatTime(timeLeft)}</span>
            </div>
          )}
        </>
      )}
      {renderPage()}
    </div>
  );
};

export default App;
