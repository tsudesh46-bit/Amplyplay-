import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Page } from '../../types';
import LevelLayout from '../LevelLayout';
import GaborCircle from '../GaborCircle';
import GameEndScreen from '../GameEndScreen';

interface Level5Props {
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, isCompleted: boolean) => void;
}

// --- Helper Components defined inside Level5 to avoid creating new files ---

const FakeCircle: React.FC<{ size: number; style?: React.CSSProperties; className?: string }> = ({ size, style, className = '' }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: 'rgba(128, 128, 128, 0.8)',
      transition: 'transform 0.1s ease-out',
      ...style
    }}
    className={`hover:scale-105 ${className}`}
  />
);

interface FireworkProps {
  x: number;
  y: number;
  onCompleted: () => void;
}

const Firework: React.FC<FireworkProps> = ({ x, y, onCompleted }) => {
  useEffect(() => {
    const timer = setTimeout(onCompleted, 700);
    return () => clearTimeout(timer);
  }, [onCompleted]);

  return (
    <div className="absolute" style={{ top: y, left: x, width: 1, height: 1, pointerEvents: 'none' }}>
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="absolute inset-0" style={{ transform: `rotate(${(360 / 15) * i}deg)` }}>
          <div 
            className="absolute w-2 h-2 top-0 left-0 rounded-full"
            style={{
              backgroundColor: `hsl(${Math.random() * 60 + 30}, 100%, 70%)`,
              animation: 'firework-fly 0.7s ease-out forwards'
            }}
          />
        </div>
      ))}
       <style>{`
        @keyframes firework-fly {
            0% { transform: translateX(0) scale(1); opacity: 1; }
            100% { transform: translateX(50px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// --- Constants ---
const TOTAL_ROUNDS = 10;
const PATCH_DISPLAY_DURATION_MS = 1000;
const TIME_BETWEEN_ROUNDS_MS = 2000;
const START_SIZE = 80;
const END_SIZE = 30;
const START_CONTRAST = 1.0;
const END_CONTRAST = 0.4;

const Level5: React.FC<Level5Props> = ({ setCurrentPage, saveLevelCompletion }) => {
  const [gameState, setGameState] = useState<'playing' | 'counting' | 'finished'>('playing');
  const [round, setRound] = useState(0); // 0 = not started
  const [patchState, setPatchState] = useState<{
    key: number;
    gaborIsTop: boolean;
    size: number;
    contrast: number;
    visible: boolean;
    clicked: boolean;
    xPercent: number;
    yOffsetPercent: number;
  } | null>(null);
  
  const [gaborCounts, setGaborCounts] = useState<{ top: number; bottom: number }>({ top: 0, bottom: 0 });
  const [userCounts, setUserCounts] = useState<{ top: string; bottom: string }>({ top: '', bottom: '' });
  const [finalScore, setFinalScore] = useState({ correct: 0, incorrect: 0 });
  const [fireworks, setFireworks] = useState<{ id: number; x: number; y: number }[]>([]);

  const wavePathRef = useRef<SVGPathElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resetLevel = useCallback(() => {
    setGameState('playing');
    setRound(0);
    setPatchState(null);
    setGaborCounts({ top: 0, bottom: 0 });
    setUserCounts({ top: '', bottom: '' });
    setFinalScore({ correct: 0, incorrect: 0 });
    setFireworks([]);
  }, []);

  // Effect for simple wave animation
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (wavePathRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const midY = height / 2;
        let pathData = `M 0, ${midY}`;
        for (let x = 0; x <= width; x += 10) {
          const angle = (x / width) * Math.PI * 4 + timestamp / 500;
          const y = midY + Math.sin(angle) * (height / 8); // Simpler sine wave
          pathData += ` L ${x}, ${y}`;
        }
        wavePathRef.current.setAttribute('d', pathData);
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    if (gameState === 'playing') {
      animationFrameId.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState]);


  // Effect to kickstart the game
  useEffect(() => {
    if (gameState === 'playing' && round === 0) {
      const startTimer = setTimeout(() => {
        setRound(1);
      }, 500); 
      return () => clearTimeout(startTimer);
    }
  }, [gameState, round]);

  // Effect for handling game progression (each round)
  useEffect(() => {
    if (gameState !== 'playing' || round === 0 || round > TOTAL_ROUNDS) {
      if (round > TOTAL_ROUNDS) setGameState('counting');
      return;
    }
    
    const gaborIsTop = Math.random() < 0.5;
    if (gaborIsTop) {
        setGaborCounts(counts => ({ ...counts, top: counts.top + 1 }));
    } else {
        setGaborCounts(counts => ({ ...counts, bottom: counts.bottom + 1 }));
    }
    
    const progress = (round - 1) / (TOTAL_ROUNDS - 1);
    const size = START_SIZE - (START_SIZE - END_SIZE) * progress;
    const contrast = START_CONTRAST - (START_CONTRAST - END_CONTRAST) * progress;

    setPatchState({ 
      key: round, 
      gaborIsTop, 
      size, 
      contrast, 
      visible: true, 
      clicked: false, 
      xPercent: Math.random() * 60 + 20, // from 20% to 80% of width
      yOffsetPercent: Math.random() * 15 + 10 // 10% to 25% height from center
    });

    const hideTimer = setTimeout(() => {
      setPatchState(p => (p && p.key === round ? { ...p, visible: false } : p));
    }, PATCH_DISPLAY_DURATION_MS);

    const nextRoundTimer = setTimeout(() => {
      setRound(r => r + 1);
    }, TIME_BETWEEN_ROUNDS_MS);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextRoundTimer);
    };
    
  }, [round, gameState]);


  const handleGaborClick = (e: React.MouseEvent) => {
    if (!patchState || patchState.clicked) return;
    setPatchState(p => p ? { ...p, visible: false, clicked: true } : null);
    
    const newFirework = { id: Date.now(), x: e.clientX, y: e.clientY };
    setFireworks(fw => [...fw, newFirework]);
  };

  const removeFirework = (id: number) => {
    setFireworks(fw => fw.filter(f => f.id !== id));
  };
  
  const handleSubmitCounts = () => {
      const userTop = parseInt(userCounts.top, 10) || 0;
      const userBottom = parseInt(userCounts.bottom, 10) || 0;

      let correct = 0;
      if(userTop === gaborCounts.top) correct++;
      if(userBottom === gaborCounts.bottom) correct++;
      
      setFinalScore({ correct, incorrect: 2 - correct });
      saveLevelCompletion('level5', correct === 2);
      setGameState('finished');
  };

  const renderPlaying = () => {
    let topPatch, bottomPatch;

    if (patchState?.visible) {
        const topStyle: React.CSSProperties = {
            position: 'absolute',
            top: `calc(50% - ${patchState.yOffsetPercent}%)`,
            left: `${patchState.xPercent}%`,
            transform: 'translate(-50%, -50%)',
        };
    
        const bottomStyle: React.CSSProperties = {
            position: 'absolute',
            top: `calc(50% + ${patchState.yOffsetPercent}%)`,
            left: `${patchState.xPercent}%`,
            transform: 'translate(-50%, -50%)',
        };

        if (patchState.gaborIsTop) {
            topPatch = <GaborCircle size={patchState.size} contrast={patchState.contrast} onClick={handleGaborClick} style={topStyle} />;
            bottomPatch = <FakeCircle size={patchState.size} style={bottomStyle} />;
        } else {
            topPatch = <FakeCircle size={patchState.size} style={topStyle} />;
            bottomPatch = <GaborCircle size={patchState.size} contrast={patchState.contrast} onClick={handleGaborClick} style={bottomStyle} />;
        }
    }

    return (
      <div ref={containerRef} className="w-full flex-grow relative bg-slate-900 overflow-hidden">
        <svg width="100%" height="100%" className="absolute top-0 left-0">
          <path ref={wavePathRef} stroke="#0891b2" strokeWidth="5" fill="none" />
        </svg>
        {topPatch}
        {bottomPatch}
        {fireworks.map(fw => (
          <Firework key={fw.id} x={fw.x} y={fw.y} onCompleted={() => removeFirework(fw.id)} />
        ))}
      </div>
    );
  };
  
  const renderCounting = () => (
    <div className="flex flex-col items-center justify-center h-full text-center w-full bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-700">How many Gabor patches did you see?</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="top-count" className="text-lg font-medium text-slate-600">Above the wave:</label>
                    <input 
                        type="number" 
                        id="top-count"
                        value={userCounts.top}
                        onChange={(e) => setUserCounts(c => ({...c, top: e.target.value}))}
                        className="w-24 p-2 text-lg text-center border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="bottom-count" className="text-lg font-medium text-slate-600">Below the wave:</label>
                    <input 
                        type="number" 
                        id="bottom-count"
                        value={userCounts.bottom}
                        onChange={(e) => setUserCounts(c => ({...c, bottom: e.target.value}))}
                        className="w-24 p-2 text-lg text-center border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
            </div>
            <button
                onClick={handleSubmitCounts}
                className="mt-8 w-full py-3 px-6 rounded-lg font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300"
            >
                Submit
            </button>
        </div>
    </div>
  );

  return (
    <LevelLayout levelId={5} setCurrentPage={setCurrentPage}>
      <div className="flex-grow flex flex-col items-center justify-center w-full min-h-0">
          {gameState === 'playing' && renderPlaying()}
          {gameState === 'counting' && renderCounting()}
          {gameState === 'finished' && (
              <GameEndScreen
                  isSuccess={finalScore.correct === 2}
                  correctCount={finalScore.correct}
                  incorrectCount={finalScore.incorrect}
                  onNextLevel={() => setCurrentPage('level6')}
                  onReset={resetLevel}
                  scoreLabel="Correct Answers"
              />
          )}
      </div>
    </LevelLayout>
  );
};

export default Level5;
