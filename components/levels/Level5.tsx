
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page } from '../../types';
import GaborCircle from '../GaborCircle';
import { HomeIcon, HeartIcon, HeartOutlineIcon, XCircleIcon } from '../ui/Icons';
import { RetryIcon } from '../ui/Icons';

// --- Helper Components ---

const Fireworks: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {particles.map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-yellow-400 animate-firework"
          style={{
            left: x,
            top: y,
            '--i': i,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes firework {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { 
            transform: translate(calc(cos(var(--i) * 18deg) * 60px), calc(sin(var(--i) * 18deg) * 60px)) scale(0); 
            opacity: 0; 
          }
        }
        .animate-firework {
          animation: firework 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};


// --- Main Level 5 Component ---

const Level5: React.FC<{
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, isCompleted: boolean) => void;
}> = ({ setCurrentPage }) => {
    const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('playing');
    
    // Scores
    const [ecgScore, setEcgScore] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [ecgHighScore, setEcgHighScore] = useState(0);
    const [quizHighScore, setQuizHighScore] = useState(0);
    const [highScore, setHighScore] = useState(0); // Total high score
    const totalScore = ecgScore + quizScore;
    const [scoreUpdate, setScoreUpdate] = useState<{ ecg?: boolean; quiz?: boolean; total?: boolean }>({});

    // Lives
    const [ecgLives, setEcgLives] = useState(3);
    const [quizLives, setQuizLives] = useState(3);
    const [justLostLife, setJustLostLife] = useState<{ ecg?: number; quiz?: number }>({});
    
    const [contrast, setContrast] = useState(1.0);
    const [gameOverReason, setGameOverReason] = useState<'quiz' | 'clicks' | null>(null);
  
    const [ecgPatches, setEcgPatches] = useState<any[]>([]);
    const [fireworks, setFireworks] = useState<{ x: number; y: number } | null>(null);
  
    // Side Patches
    const [sidePatches, setSidePatches] = useState<{top: any | null, bottom: any | null}>({ top: null, bottom: null });
    const [gaborOnSideCount, setGaborOnSideCount] = useState(0);
  
    // Quiz
    const [isQuizVisible, setIsQuizVisible] = useState(false);
    const [quizInputValue, setQuizInputValue] = useState("");
    const [isQuizIncorrect, setIsQuizIncorrect] = useState(false);
    const [quizFeedback, setQuizFeedback] = useState<'none' | 'incorrect'>('none');
    const [lastQuizAttempt, setLastQuizAttempt] = useState<{ userAnswer: number; correctAnswer: number } | null>(null);
  
    const gameTickRef = useRef<number | null>(null);
    const ecgPatchRefreshRef = useRef<number | null>(null);
    const quizTimerRef = useRef<number | null>(null);
    const middlePanelRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const prevEcgScoreRef = useRef(ecgScore);
    const prevQuizScoreRef = useRef(quizScore);
    const prevEcgLivesRef = useRef(ecgLives);
    const prevQuizLivesRef = useRef(quizLives);

    // Ref to break dependency cycle causing game resets
    const totalScoreRef = useRef(totalScore);
    totalScoreRef.current = totalScore;

    const animationData = useRef({
        pattern: [] as number[],
        featureIndices: [] as { type: string, index: number }[],
        currentPatches: [] as any[],
        isSetup: false,
    }).current;

    // --- Life Management Effects ---

    // Effect for handling ECG life loss side-effects
    useEffect(() => {
        if (prevEcgLivesRef.current > ecgLives) {
            const lostLifeIndex = ecgLives;
            
            setJustLostLife({ ecg: lostLifeIndex });
            setTimeout(() => setJustLostLife({}), 600);

            if (middlePanelRef.current) {
                middlePanelRef.current.classList.add('animate-shake');
                setTimeout(() => {
                    middlePanelRef.current?.classList.remove('animate-shake');
                }, 820);
            }

            if (ecgLives <= 0) {
                setTimeout(() => {
                    setGameOverReason('clicks');
                    setGameState('gameOver');
                }, 820);
            }
        }
        prevEcgLivesRef.current = ecgLives;
    }, [ecgLives]);

    // Effect for handling Quiz life loss side-effects
    useEffect(() => {
        if (prevQuizLivesRef.current > quizLives) {
            const lostLifeIndex = quizLives;
            
            setJustLostLife({ quiz: lostLifeIndex });
            setTimeout(() => setJustLostLife({}), 600);
            
            setIsQuizIncorrect(true);
            
            if (quizLives <= 0) {
                setTimeout(() => {
                    setGameOverReason('quiz');
                    setGameState('gameOver');
                    setIsQuizVisible(false);
                }, 820);
            } else {
                setTimeout(() => {
                    setIsQuizIncorrect(false);
                    setQuizFeedback('incorrect');
                }, 820);
            }
        }
        prevQuizLivesRef.current = quizLives;
    }, [quizLives]);

    // Update High Scores
    useEffect(() => {
        if (ecgScore > ecgHighScore) {
            setEcgHighScore(ecgScore);
        }
    }, [ecgScore, ecgHighScore]);

    useEffect(() => {
        if (quizScore > quizHighScore) {
            setQuizHighScore(quizScore);
        }
    }, [quizScore, quizHighScore]);

    useEffect(() => {
        if (totalScore > highScore) {
            setHighScore(totalScore);
        }
    }, [totalScore, highScore]);
    
    // Effect to handle score update animations
    useEffect(() => {
        const ecgIncreased = ecgScore > prevEcgScoreRef.current;
        const quizIncreased = quizScore > prevQuizScoreRef.current;

        if (ecgIncreased || quizIncreased) {
            setScoreUpdate({
                ecg: ecgIncreased,
                quiz: quizIncreased,
                total: true
            });
            const timer = setTimeout(() => {
                setScoreUpdate({});
            }, 500);
            
            prevEcgScoreRef.current = ecgScore;
            prevQuizScoreRef.current = quizScore;

            return () => clearTimeout(timer);
        }
        
        // Handle score reset
        if (ecgScore === 0 && prevEcgScoreRef.current !== 0) {
            prevEcgScoreRef.current = 0;
        }
        if (quizScore === 0 && prevQuizScoreRef.current !== 0) {
            prevQuizScoreRef.current = 0;
        }
    }, [ecgScore, quizScore]);

    const getEcgPattern = useCallback((midY: number, baseAmplitude: number) => {
      const p: number[] = [];
      const featureIndices: { type: string; index: number }[] = [];
      const addSegment = (length: number, yFunc: (i: number) => number) => {
        for (let i = 0; i < length; i++) p.push(yFunc(i));
      };
      
      const oneBeat = (amplitude: number) => {
        const beatStartIndex = p.length;
        // P wave (up)
        featureIndices.push({ type: 'P', index: beatStartIndex + 5 });
        addSegment(10, i => midY - (Math.sin(i / 10 * Math.PI) * 10 * amplitude));
        addSegment(5, () => midY);
        // Q wave (down)
        featureIndices.push({ type: 'Q', index: p.length + 4 });
        addSegment(5, i => midY + (i * 2.5 * amplitude));
        // R wave (up) - Reduced Height
        featureIndices.push({ type: 'R', index: p.length + 9 });
        addSegment(10, i => midY + (12.5 * amplitude) - (i * 7.5 * amplitude));
        // S wave (down)
        featureIndices.push({ type: 'S', index: p.length + 9 });
        addSegment(10, i => (midY - 55 * amplitude) + (i * 9 * amplitude));
        addSegment(5, i => (midY + 26 * amplitude) - (i * 6.5 * amplitude));
        // T wave (up)
        featureIndices.push({ type: 'T', index: p.length + 10 });
        addSegment(20, i => midY - (Math.sin(i / 20 * Math.PI) * 35 * amplitude));
        addSegment(5, () => midY);
      };

      for(let i = 0; i < 20; i++) {
        const randomAmplitude = baseAmplitude * (0.8 + Math.random() * 0.4);
        const baselineLength = Math.floor(40 + Math.random() * 60);
        addSegment(baselineLength, () => midY);
        oneBeat(randomAmplitude);
      }
      return { pattern: p, featureIndices };
    }, []);

    const generateNewPatches = useCallback(() => {
        if (animationData.featureIndices.length === 0) return;
        
        const numPatches = 8;
        const newPatches = [];
        const distractorSizes = [20, 25, 30, 35, 22, 28, 32, 18, 38];
        const targetSize = 45;
        
        const targetPatchIndex = Math.floor(Math.random() * numPatches);

        const availableIndices = [...animationData.featureIndices];
        for (let i = availableIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
        }

        for (let i = 0; i < numPatches; i++) {
            if (availableIndices.length === 0) break;
            const selectedFeature = availableIndices.pop();
            if (!selectedFeature) break;

            const isTarget = i === targetPatchIndex;
            const size = isTarget ? targetSize : distractorSizes[Math.floor(Math.random() * distractorSizes.length)];

            newPatches.push({
                id: `ecg-${Date.now()}-${i}`,
                featureIndex: selectedFeature.index,
                size: size,
                isTarget: isTarget,
            });
        }
        animationData.currentPatches = newPatches;
    }, [animationData]);

    const handleEcgPatchClick = (patch: any, event: React.MouseEvent) => {
        if (gameState !== 'playing') return;

        if (patch.isTarget) {
            setEcgScore(prev => prev + 1);
            setFireworks({ x: event.clientX, y: event.clientY });
            setTimeout(() => setFireworks(null), 600);
            generateNewPatches();
        } else {
            setEcgLives(prev => Math.max(0, prev - 1));
        }
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let currentX = 0;
      let patternStep = 0;

      const setup = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        const baseAmplitude = Math.min(canvas.height / 180, 2.5);
        const { pattern, featureIndices } = getEcgPattern(canvas.height / 2, baseAmplitude);
        animationData.pattern = pattern;
        animationData.featureIndices = featureIndices;
        generateNewPatches();
        currentX = 0;
        patternStep = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationData.isSetup = true;
      };

      const draw = () => {
        if (!animationData.isSetup) {
          animationFrameId = requestAnimationFrame(draw);
          return;
        }
        const speed = 3;
        
        const clearX = (currentX + speed + 8) % canvas.width;
        ctx.clearRect(clearX, 0, 20, canvas.height);

        ctx.beginPath();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        let prevX = currentX % canvas.width;
        let prevY = animationData.pattern[patternStep % animationData.pattern.length];
        ctx.moveTo(prevX, prevY);

        for (let i = 1; i <= speed; i++) {
            const nextX = (currentX + i) % canvas.width;
            const nextY = animationData.pattern[(patternStep + i) % animationData.pattern.length];
            if (nextX > prevX) {
                ctx.lineTo(nextX, nextY);
            } else {
                ctx.stroke(); 
                ctx.beginPath();
                ctx.moveTo(nextX, nextY);
            }
            prevX = nextX;
        }
        ctx.stroke();
        
        const patchesOnScreen = animationData.currentPatches.map(p => {
          const x = (p.featureIndex - patternStep + currentX);
          const finalX = (x % canvas.width + canvas.width) % canvas.width; // Ensure positive value
          const y = animationData.pattern[p.featureIndex % animationData.pattern.length];
          return { ...p, x: finalX, y };
        });
        setEcgPatches(patchesOnScreen);

        currentX += speed;
        patternStep += speed;

        animationFrameId = requestAnimationFrame(draw);
      };
  
      setup();
      draw();
  
      const resizeObserver = new ResizeObserver(() => {
          cancelAnimationFrame(animationFrameId);
          setup();
          draw();
      });
      if (canvas.parentElement) {
          resizeObserver.observe(canvas.parentElement);
      }
  
      return () => {
        cancelAnimationFrame(animationFrameId);
        if (canvas.parentElement) {
            resizeObserver.unobserve(canvas.parentElement);
        }
      };
    }, [animationData, getEcgPattern, generateNewPatches]);

    const scheduleQuiz = useCallback(() => {
        if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
        
        const score = totalScoreRef.current;
        let time;

        if (score <= 25) {
            // 0 to 10 seconds
            time = Math.random() * 10000;
        } else if (score <= 50) {
            // 10 to 20 seconds
            time = 10000 + Math.random() * 10000;
        } else if (score <= 100) {
            // 20 to 30 seconds
            time = 20000 + Math.random() * 10000;
        } else {
            // 30 to 60 seconds (1 minute)
            time = 30000 + Math.random() * 30000;
        }

        quizTimerRef.current = window.setTimeout(() => {
            setQuizInputValue("");
            setGameState('paused');
            setIsQuizVisible(true);
        }, time);
    }, []);

    const generateSidePatches = useCallback(() => {
        const newPatches: { top: any | null; bottom: any | null } = { top: null, bottom: null };
        let gaborCountThisTurn = 0;
        const score = totalScoreRef.current;

        // Determine if top patch appears and its type
        if (Math.random() > 0.3) {
            const type = Math.random() > 0.5 ? 'gabor' : 'fake';
            if (type === 'gabor') gaborCountThisTurn++;
            newPatches.top = { id: `side-top-${Date.now()}`, type, size: Math.random() * 50 + 40 };
        }

        // Determine if bottom patch appears and its type
        if (Math.random() > 0.3) {
            let type = Math.random() > 0.5 ? 'gabor' : 'fake';
            
            // If score is <= 50 and top patch is already a gabor, bottom cannot be gabor.
            if (score <= 50 && newPatches.top?.type === 'gabor') {
                type = 'fake';
            }
            
            if (type === 'gabor') gaborCountThisTurn++;
            newPatches.bottom = { id: `side-bottom-${Date.now()}`, type, size: Math.random() * 50 + 40 };
        }
        
        setGaborOnSideCount(prev => prev + gaborCountThisTurn);
        setSidePatches(newPatches);
    }, []);

    const resumeGame = useCallback(() => {
        setIsQuizVisible(false);
        setQuizFeedback('none');
        setQuizInputValue("");
        setGaborOnSideCount(0);
        setLastQuizAttempt(null);
        setGameState('playing');
        scheduleQuiz();
        
        gameTickRef.current = window.setInterval(() => {
            setContrast(prev => Math.max(0.1, prev - 0.005));
            generateSidePatches();
        }, 3000);
    
        ecgPatchRefreshRef.current = window.setInterval(() => {
            generateNewPatches();
        }, 5000);
    }, [scheduleQuiz, generateSidePatches, generateNewPatches]);

    const startGame = useCallback(() => {
        setEcgScore(0);
        setQuizScore(0);
        setContrast(1.0);
        setGaborOnSideCount(0);
        setEcgPatches([]);
        setSidePatches({ top: null, bottom: null });
        setGameState('playing');
        setEcgLives(3);
        setQuizLives(3);
        prevEcgLivesRef.current = 3;
        prevQuizLivesRef.current = 3;
        setGameOverReason(null);
        setQuizFeedback('none');
        setLastQuizAttempt(null);
        
        generateNewPatches();
        generateSidePatches();
        scheduleQuiz();

        if (gameTickRef.current) clearInterval(gameTickRef.current);
        gameTickRef.current = window.setInterval(() => {
            setContrast(prev => Math.max(0.1, prev - 0.005));
            generateSidePatches();
        }, 3000);

        if (ecgPatchRefreshRef.current) clearInterval(ecgPatchRefreshRef.current);
        ecgPatchRefreshRef.current = window.setInterval(() => {
            generateNewPatches();
        }, 5000);

    }, [generateNewPatches, generateSidePatches, scheduleQuiz]);


    useEffect(() => {
        startGame();
        return () => {
            if (gameTickRef.current) clearInterval(gameTickRef.current);
            if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
            if (ecgPatchRefreshRef.current) clearInterval(ecgPatchRefreshRef.current);
        };
    }, [startGame]);

    useEffect(() => {
        if (gameState !== 'playing') {
            if (gameTickRef.current) clearInterval(gameTickRef.current);
            if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
            if (ecgPatchRefreshRef.current) clearInterval(ecgPatchRefreshRef.current);
        }
    }, [gameState]);

    const handleQuizSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isQuizIncorrect || quizFeedback === 'incorrect') return;

        const userAnswer = parseInt(quizInputValue, 10) || 0;
        const isCorrect = userAnswer === gaborOnSideCount;

        if (isCorrect) {
            setQuizScore(prev => prev + 1);
            resumeGame();
        } else {
            setLastQuizAttempt({ userAnswer, correctAnswer: gaborOnSideCount });
            setQuizLives(prev => Math.max(0, prev - 1));
        }
    };

    const renderSidePatch = (patch: any) => {
        if (!patch) return null;
        const style = {
            position: 'absolute' as const,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: contrast,
        };

        if (patch.type === 'gabor') {
            return <GaborCircle size={patch.size} contrast={contrast} onClick={() => {}} style={style} />;
        } else {
            return <div style={{...style, width: patch.size, height: patch.size, backgroundColor: 'grey', borderRadius: '50%'}} />;
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-black font-sans">
            <style>{`
                @keyframes score-update {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.25); color: #22c55e; }
                    100% { transform: scale(1); }
                }
                .animate-score-update {
                    animation: score-update 0.5s ease-in-out;
                    display: inline-block;
                }
                @keyframes heart-break {
                  0% { transform: scale(1.2); opacity: 1; }
                  50% { transform: scale(1.5) rotate(10deg); opacity: 0.8; }
                  100% { transform: scale(0.5); opacity: 0; }
                }
                .animate-heart-break {
                  animation: heart-break 0.6s ease-out forwards;
                }
            `}</style>
             {/* --- UI Panels --- */}
            <div className="absolute top-4 left-4 z-20 text-slate-700 bg-gradient-to-br from-white to-cyan-100 p-3 rounded-2xl shadow-lg border border-cyan-200/50 w-56">
                <p className="font-bold text-lg text-cyan-800">Central Vision Task</p>
                <p className="font-semibold">Score: <span className={scoreUpdate.ecg ? 'animate-score-update' : ''}>{ecgScore}</span></p>
                <div className="flex items-center mt-1 gap-1">
                    {Array.from({ length: 3 }).map((_, i) => {
                        const isLost = i >= ecgLives;
                        const wasJustLost = justLostLife.ecg === i;
                        if (wasJustLost) {
                            return <HeartIcon key={i} className="w-5 h-5 text-red-500 animate-heart-break" />;
                        }
                        return isLost ? (
                            <HeartOutlineIcon key={i} className="w-5 h-5 text-red-500/70" />
                        ) : (
                            <HeartIcon key={i} className="w-5 h-5 text-red-500" />
                        );
                    })}
                </div>
                 <p className="text-xs mt-1 text-slate-500">High Score: {ecgHighScore}</p>
            </div>

            <div className="absolute top-4 right-4 z-20 text-slate-700 bg-gradient-to-br from-white to-cyan-100 p-3 rounded-2xl shadow-lg border border-cyan-200/50 w-56 text-right">
                <p className="font-bold text-lg text-cyan-800">Peripheral Vision Task</p>
                <p className="font-semibold">Score: <span className={scoreUpdate.quiz ? 'animate-score-update' : ''}>{quizScore}</span></p>
                <div className="flex items-center justify-end mt-1 gap-1">
                    {Array.from({ length: 3 }).map((_, i) => {
                        const isLost = i >= quizLives;
                        const wasJustLost = justLostLife.quiz === i;
                        if (wasJustLost) {
                            return <HeartIcon key={i} className="w-5 h-5 text-red-500 animate-heart-break" />;
                        }
                        return isLost ? (
                           <HeartOutlineIcon key={i} className="w-5 h-5 text-red-500/70" />
                        ) : (
                           <HeartIcon key={i} className="w-5 h-5 text-red-500" />
                        );
                    })}
                </div>
                 <p className="text-xs mt-1 text-slate-500">High Score: {quizHighScore}</p>
            </div>
            
            <div className="absolute bottom-4 left-4 z-20 text-slate-700 bg-gradient-to-br from-white to-cyan-100 p-3 rounded-xl shadow-lg border border-cyan-200/50">
                <p className="font-semibold text-gray-600 text-sm">Total Score</p>
                <p className={`font-bold text-2xl ${scoreUpdate.total ? 'animate-score-update' : ''}`}>{totalScore}</p>
                <p className="text-xs mt-1 text-slate-500">High Score: {highScore}</p>
            </div>
            
            <button
                onClick={() => setCurrentPage('home')}
                className="absolute bottom-4 right-4 bg-white/80 text-cyan-600 p-3 rounded-full shadow-lg z-20 transition transform hover:scale-110"
                aria-label="Home"
            >
                <HomeIcon className="w-8 h-8"/>
            </button>
            
            {/* --- Game Areas --- */}
            <div className="h-1/3 bg-white relative">{renderSidePatch(sidePatches.top)}</div>
            
            <div ref={middlePanelRef} className="h-1/3 bg-black relative overflow-hidden">
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                {ecgPatches.map(p => (
                    <GaborCircle 
                        key={p.id}
                        size={p.size}
                        contrast={contrast}
                        onClick={(e) => handleEcgPatchClick(p, e)}
                        style={{ position: 'absolute', top: p.y, left: p.x, transform: 'translate(-50%, -50%)', zIndex: 10 }}
                    />
                ))}
            </div>
            
            <div className="h-1/3 bg-white relative">{renderSidePatch(sidePatches.bottom)}</div>

            {fireworks && <Fireworks x={fireworks.x} y={fireworks.y} />}

            {/* --- Modals --- */}
            {isQuizVisible && (
                 <div className="absolute inset-0 bg-black/70 z-30 flex items-center justify-center p-4">
                    {quizFeedback === 'incorrect' ? (
                        <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-lg border border-rose-500 w-full max-w-sm text-center">
                            <h2 className="text-2xl font-bold mb-4 text-rose-400">Incorrect</h2>
                            {lastQuizAttempt && (
                                <div className="bg-slate-700/50 p-3 rounded-lg mb-4 text-center space-y-1 border border-slate-600">
                                    <p className="text-slate-300 text-sm">Your answer: <span className="font-bold text-white text-lg">{lastQuizAttempt.userAnswer}</span></p>
                                    <p className="text-slate-300 text-sm">Correct answer: <span className="font-bold text-white text-lg">{lastQuizAttempt.correctAnswer}</span></p>
                                </div>
                            )}
                            <p className="text-slate-300 mb-6">Take a moment before you continue.</p>
                            <button 
                                onClick={resumeGame} 
                                className="mb-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition"
                            >
                                Continue
                            </button>
                            <div className="flex justify-center gap-8">
                                <button 
                                    onClick={() => {
                                        setGameOverReason('quiz');
                                        setGameState('gameOver');
                                        setIsQuizVisible(false);
                                    }}
                                    className="flex flex-col items-center text-slate-400 hover:text-rose-400 transition"
                                    aria-label="Stop Game"
                                >
                                    <XCircleIcon className="w-10 h-10" />
                                    <span className="text-xs mt-1 font-semibold">Stop</span>
                                </button>
                                <button 
                                    onClick={() => setCurrentPage('home')}
                                    className="flex flex-col items-center text-slate-400 hover:text-white transition"
                                    aria-label="Exit to Home"
                                >
                                    <HomeIcon className="w-10 h-10" />
                                    <span className="text-xs mt-1 font-semibold">Exit</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`bg-slate-800 text-white p-8 rounded-2xl shadow-lg border border-cyan-500 w-full max-w-sm text-center transition-transform duration-300 ${isQuizIncorrect ? 'animate-shake' : ''}`}>
                            <h2 className="text-2xl font-bold mb-2 text-cyan-400">Time for a Check-in!</h2>
                            <div className="flex justify-center gap-2 my-4">
                                {Array.from({ length: 3 }).map((_, i) =>
                                    i < quizLives ? (
                                        <HeartIcon key={i} className="w-8 h-8 text-red-500" />
                                    ) : (
                                        <HeartOutlineIcon key={i} className="w-8 h-8 text-red-500/70" />
                                    )
                                )}
                            </div>
                            <p className="mb-6 text-slate-300">How many <strong className="text-white">correct pattern patches</strong> did you see in the top and bottom white areas?</p>
                            <form onSubmit={handleQuizSubmit}>
                                <input 
                                    type="number"
                                    value={quizInputValue}
                                    onChange={(e) => setQuizInputValue(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-slate-700 text-white text-center text-2xl border-2 border-slate-600 focus:border-cyan-500 focus:outline-none"
                                    autoFocus
                                />
                                <button type="submit" className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition">
                                    Submit Answer
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {gameState === 'gameOver' && (
                <div className="absolute inset-0 bg-black/90 z-30 flex items-center justify-center">
                    <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-lg border border-rose-500 w-full max-w-sm text-center">
                        <h2 className="text-3xl font-bold mb-2 text-rose-500">Game Over</h2>
                        <p className="text-lg mb-4 text-slate-300">
                           {gameOverReason === 'quiz' ? 'You ran out of guesses.' : 'You made 3 incorrect clicks.'}
                        </p>
                        <div className="bg-slate-700 p-4 rounded-lg mb-6">
                            <p className="text-slate-400">Final Score</p>
                            <p className="text-4xl font-bold text-white">{totalScore}</p>
                            <p className="text-slate-400 mt-2">High Score: {highScore}</p>
                        </div>
                        <button onClick={startGame} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center">
                           <RetryIcon /> Try Again
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Level5;
