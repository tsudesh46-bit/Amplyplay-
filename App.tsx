
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Page, Language, UserProfile, LevelStats, CompletedLevels } from './types';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import SideMenu from './components/SideMenu';
import PerformancePage from './components/PerformancePage';
import ProfilePage from './components/ProfilePage';
import SupportPage from './components/SupportPage';
import TimeAssessmentPage from './components/TimeAssessmentPage';
import AdministrationPage from './components/AdministrationPage';
import StrabplayHome from './components/StrabplayHome';
import Level1 from './components/levels/Level1';
import Level2 from './components/levels/Level2';
import Level3 from './components/levels/Level3';
import Level4 from './components/levels/Level4';
import Level5 from './components/levels/Level5';
import Level6 from './components/levels/Level6';
import StrabLevelPlaceholder from './components/strab/StrabLevelPlaceholder';

const DEMO_LIMIT_MS = 30 * 60 * 1000;
const STORAGE_KEY_USERS = 'strabplay_users_v2';
const STORAGE_KEY_LOGGED_IN_ID = 'strabplay_current_user_id';
const STORAGE_KEY_PROGRESS = 'strabplay_all_progress_v2';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [language, setLanguage] = useState<Language>('en');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  
  // Timing state
  const sessionStartTimeRef = useRef<number | null>(null);

  // Database state
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    let userList = saved ? JSON.parse(saved) : [];
    
    // Ensure default admin exists
    const adminExists = userList.find((u: UserProfile) => u.username === 'vision care');
    if (!adminExists) {
      const defaultAdmin: UserProfile = {
        id: 'admin-default',
        name: 'Administrator',
        username: 'vision care',
        password: 'vision care',
        age: 'N/A',
        condition: 'Administration',
        joinedDate: new Date().toLocaleDateString(),
        role: 'admin'
      };
      userList = [...userList, defaultAdmin];
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(userList));
    }
    return userList;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Progress state for all users
  const [allProgress, setAllProgress] = useState<Record<string, { levels: CompletedLevels, history: LevelStats[] }>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
    return saved ? JSON.parse(saved) : {};
  });

  // Track session start when a level is entered
  useEffect(() => {
    if (currentPage.includes('level')) {
        sessionStartTimeRef.current = Date.now();
    } else {
        sessionStartTimeRef.current = null;
    }
  }, [currentPage]);

  // Current User Progress
  const completedLevels = currentUser ? (allProgress[currentUser.id]?.levels || {}) : {};
  const gameHistory = currentUser ? (allProgress[currentUser.id]?.history || []) : [];

  // Demo state
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStartTime, setDemoStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Auto-login if ID exists
  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY_LOGGED_IN_ID);
    if (savedId) {
      const user = users.find(u => u.id === savedId);
      if (user) {
        setCurrentUser(user);
        setCurrentPage('home');
      }
    }
  }, [users]);

  const saveLevelCompletion = useCallback(async (levelId: string, stars: number, details?: Partial<LevelStats>) => {
    if (!currentUser) return;

    // Calculate duration
    let sessionDuration = 0;
    if (sessionStartTimeRef.current) {
        sessionDuration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    }

    setAllProgress(prev => {
      const userProg = prev[currentUser.id] || { levels: {}, history: [] };
      const newLevels = { ...userProg.levels, [levelId]: Math.max(userProg.levels[levelId] || 0, stars) };
      
      let newHistory = userProg.history;
      if (details) {
        const newEntry: LevelStats = {
          levelId,
          stars,
          score: details.score || 0,
          incorrect: details.incorrect || 0,
          contrast: details.contrast,
          size: details.size,
          timestamp: Date.now(),
          duration: sessionDuration, // Injected duration
          category: details.category || (levelId.startsWith('strab') ? 'strab' : 'amblyo'),
          userId: currentUser.id
        };
        newHistory = [newEntry, ...userProg.history].slice(0, 1000);
      }

      const updated = { ...prev, [currentUser.id]: { levels: newLevels, history: newHistory } };
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
      return updated;
    });
  }, [currentUser]);

  const updateProfile = useCallback((updatedProfile: UserProfile) => {
    setUsers(prev => {
      const updated = prev.map(u => u.id === updatedProfile.id ? updatedProfile : u);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
      return updated;
    });
    setCurrentUser(updatedProfile);
  }, []);

  const handleLoginAttempt = (username: string, pass: string) => {
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY_LOGGED_IN_ID, user.id);
      setCurrentPage('home');
      return true;
    }
    return false;
  };

  const handleLogout = useCallback(() => {
    setCurrentPage('login');
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_LOGGED_IN_ID);
    setIsDemoMode(false);
    setDemoStartTime(null);
    setTimeLeft(null);
    setIsSideMenuOpen(false);
  }, []);

  const startDemoSession = useCallback(() => {
    const demoId = 'demo-user';
    let demoUser = users.find(u => u.id === demoId);
    if (!demoUser) {
      demoUser = {
        id: demoId,
        name: 'Guest Player',
        username: 'demo',
        password: 'password',
        age: '25',
        condition: 'Demo',
        joinedDate: new Date().toLocaleDateString(),
        role: 'patient'
      };
      setUsers(prev => [...prev, demoUser!]);
    }
    setCurrentUser(demoUser);
    localStorage.setItem('strabplay_demo_used', 'true');
    setIsDemoMode(true);
    setDemoStartTime(Date.now());
    setTimeLeft(DEMO_LIMIT_MS);
    setCurrentPage('home');
  }, [users]);

  const renderPage = () => {
    const levelProps = { setCurrentPage, saveLevelCompletion };

    if (currentPage.startsWith('strab_level')) {
      return <StrabLevelPlaceholder setCurrentPage={setCurrentPage} levelName={currentPage.replace('strab_level', 'Strab Level ')} />;
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} startDemoSession={startDemoSession} language={language} setLanguage={setLanguage} onLoginAttempt={handleLoginAttempt} />;
      case 'support':
        return <SupportPage setCurrentPage={setCurrentPage} language={language} />;
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} setIsSideMenuOpen={setIsSideMenuOpen} isSideMenuOpen={isSideMenuOpen} completedLevels={completedLevels} onLogout={handleLogout} isDemoMode={isDemoMode} userProfile={currentUser || undefined} />;
      case 'strabplay_home':
        return <StrabplayHome setCurrentPage={setCurrentPage} completedLevels={completedLevels} onLogout={handleLogout} isDemoMode={isDemoMode} userProfile={currentUser || undefined} />;
      case 'performance':
        return <PerformancePage setCurrentPage={setCurrentPage} completedLevels={completedLevels} gameHistory={gameHistory} language={language} />;
      case 'profile':
        return <ProfilePage setCurrentPage={setCurrentPage} profile={currentUser!} onUpdateProfile={updateProfile} />;
      case 'time_assessment':
        return <TimeAssessmentPage setCurrentPage={setCurrentPage} gameHistory={gameHistory} />;
      case 'administration':
        return <AdministrationPage setCurrentPage={setCurrentPage} users={users} setUsers={setUsers} currentUserId={currentUser?.id} />;
      case 'level1': return <Level1 {...levelProps} />;
      case 'level2': return <Level2 {...levelProps} />;
      case 'level3': return <Level3 {...levelProps} />;
      case 'level4': return <Level4 {...levelProps} />;
      case 'level5': return <Level5 {...levelProps} />;
      case 'level6': return <Level6 {...levelProps} />;
      default: return <HomePage {...levelProps} setIsSideMenuOpen={setIsSideMenuOpen} isSideMenuOpen={isSideMenuOpen} completedLevels={completedLevels} onLogout={handleLogout} userProfile={currentUser || undefined} />;
    }
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
            userProfile={currentUser || undefined}
          />
          {isDemoMode && timeLeft !== null && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-[#0a1128] text-white px-6 py-2 rounded-full font-black shadow-2xl border-2 border-indigo-400 animate-pulse flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-indigo-300">Demo Session Ends:</span>
              <span className="text-xl font-mono text-cyan-400">{Math.floor(timeLeft/60000)}:{(Math.floor((timeLeft%60000)/1000)).toString().padStart(2, '0')}</span>
            </div>
          )}
        </>
      )}
      {renderPage()}
    </div>
  );
};

export default App;
