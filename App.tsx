
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Page, CompletedLevels, Language, UserProfile, LevelStats, GameHistory } from './types';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import SideMenu from './components/SideMenu';
import PerformancePage from './components/PerformancePage';
import ProfilePage from './components/ProfilePage';
import SupportPage from './components/SupportPage';
import TimeAssessmentPage from './components/TimeAssessmentPage';
import StrabplayHome from './components/StrabplayHome';
import Level1 from './components/levels/Level1';
import Level2 from './components/levels/Level2';
import Level3 from './components/levels/Level3';
import Level4 from './components/levels/Level4';
import Level5 from './components/levels/Level5';
import Level6 from './components/levels/Level6';
import StrabLevelPlaceholder from './components/strab/StrabLevelPlaceholder';

const DEMO_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY_LEVELS = 'strabplay_completed_levels';
const STORAGE_KEY_PROFILE = 'strabplay_user_profile';
const STORAGE_KEY_HISTORY = 'strabplay_game_history';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [language, setLanguage] = useState<Language>('en');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  
  // Persistent State Initialization
  const [completedLevels, setCompletedLevels] = useState<CompletedLevels>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LEVELS);
    return saved ? JSON.parse(saved) : {};
  });

  const [gameHistory, setGameHistory] = useState<LevelStats[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    return saved ? JSON.parse(saved) : {
      name: 'Amblyo Patient',
      age: '',
      condition: 'Amblyopia',
      joinedDate: new Date().toLocaleDateString()
    };
  });
  
  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStartTime, setDemoStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Sync Level Completion and History to LocalStorage
  const saveLevelCompletion = useCallback(async (levelId: string, stars: number, details?: Partial<LevelStats>) => {
    // 1. Update Best Stars
    setCompletedLevels((prev) => {
      const updated = { ...prev, [levelId]: Math.max(prev[levelId] || 0, stars) };
      localStorage.setItem(STORAGE_KEY_LEVELS, JSON.stringify(updated));
      return updated;
    });

    // 2. Append to History for Analysis
    if (details) {
      const newEntry: LevelStats = {
        levelId,
        stars,
        score: details.score || 0,
        incorrect: details.incorrect || 0,
        contrast: details.contrast,
        size: details.size,
        timestamp: Date.now(),
        category: details.category || (levelId.startsWith('strab') ? 'strab' : 'amblyo')
      };

      setGameHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, 1000); // Keep last 1000 entries
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  // Profile Update Logic
  const updateProfile = useCallback((updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updatedProfile));
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
    localStorage.setItem('strabplay_demo_used', 'true');
    setIsDemoMode(true);
    setDemoStartTime(Date.now());
    setTimeLeft(DEMO_LIMIT_MS);
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
        return <LoginPage setCurrentPage={setCurrentPage} startDemoSession={startDemoSession} language={language} setLanguage={setLanguage} />;
      case 'support':
        return <SupportPage setCurrentPage={setCurrentPage} language={language} />;
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} setIsSideMenuOpen={setIsSideMenuOpen} isSideMenuOpen={isSideMenuOpen} completedLevels={completedLevels} onLogout={handleLogout} isDemoMode={isDemoMode} userProfile={userProfile} />;
      case 'strabplay_home':
        return <StrabplayHome setCurrentPage={setCurrentPage} completedLevels={completedLevels} isDemoMode={isDemoMode} />;
      case 'performance':
        return <PerformancePage setCurrentPage={setCurrentPage} completedLevels={completedLevels} gameHistory={gameHistory} language={language} />;
      case 'profile':
        return <ProfilePage setCurrentPage={setCurrentPage} profile={userProfile} onUpdateProfile={updateProfile} />;
      case 'time_assessment':
        return <TimeAssessmentPage setCurrentPage={setCurrentPage} />;
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
        return <HomePage setCurrentPage={setCurrentPage} setIsSideMenuOpen={setIsSideMenuOpen} isSideMenuOpen={isSideMenuOpen} completedLevels={completedLevels} onLogout={handleLogout} isDemoMode={isDemoMode} userProfile={userProfile} />;
    }
  };

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      {currentPage !== 'login' && currentPage !== 'support' && (
        <>
          <SideMenu
            isOpen={isSideMenuOpen}
            onClose={() => setIsSideMenuOpen(false)}
            setCurrentPage={setCurrentPage}
            completedLevels={completedLevels}
            onLogout={handleLogout}
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