
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page } from '../../types';
import GaborCircle from '../GaborCircle';
import { HomeIcon, HeartIcon, HeartOutlineIcon } from '../ui/Icons';
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
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [contrast, setContrast] = useState(1.0);
    const [ecgLives, setEcgLives] = useState(3);
    const [quizLives, setQuizLives] = useState(3);
    const [gameOverReason, setGameOverReason] = useState<'quiz' | 'clicks' | null>(null);
  
    const [ecgPatches, setEcgPatches] = useState<any[]>([]);
    const [fireworks, setFireworks] = useState<{ x: number; y: number } | null>(null);
  
    // Side Patches
    const [sidePatch, setSidePatch] = useState<any>(null);
    const [gaborOnSideCount, setGaborOnSideCount] = useState(0);
  
    // Quiz
    const [isQuizVisible, setIsQuizVisible] = useState(false);
    const [quizInputValue, setQuizInputValue] = useState("");
    const [isQuizIncorrect, setIsQuizIncorrect] = useState(false);
  
    const gameTickRef = useRef<number | null>(null);
    const ecgPatchRefreshRef = useRef<number | null>(null);
    const quizTimerRef = useRef<number | null>(null);
    const middlePanelRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const animationData = useRef({
        pattern: [] as number[],
        featureIndices: [] as { type: string, index: number }[],
        currentPatches: [] as any[],
        isSetup: false,
    }).current;

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
        // R wave (up)
        featureIndices.push({ type: 'R', index: p.length + 9 });
        addSegment(10, i => midY + (12.5 * amplitude) - (i * 10 * amplitude));
        // S wave (down)
        featureIndices.push({ type: 'S', index: p.length + 9 });
        addSegment(10, i => midY - (87.5 * amplitude) + (i * 12 * amplitude));
        addSegment(5, i => midY + (32.5 * amplitude) - (i * 6.5 * amplitude));
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
            setScore(prev => prev + 1);
            setFireworks({ x: event.clientX, y: event.clientY });
            setTimeout(() => setFireworks(null), 600);
            generateNewPatches();
        } else {
            const newLives = ecgLives - 1;
            setEcgLives(newLives);
            
            if(middlePanelRef.current) {
                middlePanelRef.current.classList.add('animate-shake');
                setTimeout(() => {
                    middlePanelRef.current?.classList.remove('animate-shake');
                }, 820);
            }

            if (newLives <= 0) {
                 setTimeout(() => {
                    setHighScore(prev => Math.max(prev, score));
                    setGameOverReason('clicks');
                    setGameState('gameOver');
                 }, 820);
            }
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
        const randomTime = Math.random() * 60000 + 30000;
        quizTimerRef.current = setTimeout(() => {
            setQuizInputValue("");
            setGameState('paused');
            setIsQuizVisible(true);
        }, randomTime);
    }, []);

    const generateSidePatch = useCallback(() => {
        const type = Math.random() > 0.5 ? 'gabor' : 'fake';
        const position = Math.random() > 0.5 ? 'top' : 'bottom';
        const size = Math.random() * 50 + 40;

        if (type === 'gabor') {
            setGaborOnSideCount(prev => prev + 1);
        }
        setSidePatch({ id: `side-${Date.now()}`, type, position, size });
    }, []);

    const startGame = useCallback(() => {
        setScore(0);
        setContrast(1.0);
        setGaborOnSideCount(0);
        setEcgPatches([]);
        setSidePatch(null);
        setGameState('playing');
        setEcgLives(3);
        setQuizLives(3);
        setGameOverReason(null);
        
        generateNewPatches();
        generateSidePatch();
        scheduleQuiz();

        if (gameTickRef.current) clearInterval(gameTickRef.current);
        gameTickRef.current = setInterval(() => {
            setContrast(prev => Math.max(0.1, prev - 0.005));
            generateSidePatch();
        }, 1000);

        if (ecgPatchRefreshRef.current) clearInterval(ecgPatchRefreshRef.current);
        ecgPatchRefreshRef.current = setInterval(() => {
            generateNewPatches();
        }, 5000);

    }, [generateNewPatches, generateSidePatch, scheduleQuiz]);


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
        if (isQuizIncorrect) return;

        const userAnswer = parseInt(quizInputValue, 10);
        const isCorrect = userAnswer === gaborOnSideCount;
        
        const resumeGame = () => {
            setIsQuizVisible(false);
            setQuizInputValue("");
            setGaborOnSideCount(0);
            setGameState('playing');
            scheduleQuiz();
            
            gameTickRef.current = setInterval(() => {
                setContrast(prev => Math.max(0.1, prev - 0.005));
                generateSidePatch();
            }, 1000);

            ecgPatchRefreshRef.current = setInterval(() => {
                generateNewPatches();
            }, 5000);
        };

        if (isCorrect) {
            setScore(prev => prev + 10);
            resumeGame();
        } else {
            const newLives = quizLives - 1;
            setQuizLives(newLives);
            setIsQuizIncorrect(true);
            
            if (newLives <= 0) {
                setTimeout(() => {
                    setHighScore(prev => Math.max(prev, score));
                    setGameOverReason('quiz');
                    setGameState('gameOver');
                    setIsQuizVisible(false);
                }, 820);
            } else {
                setTimeout(() => {
                    setIsQuizIncorrect(false);
                    resumeGame();
                }, 820);
            }
        }
    };

    const renderSidePatch = () => {
        if (!sidePatch) return null;
        const style = {
            position: 'absolute' as const,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: contrast,
        };

        if (sidePatch.type === 'gabor') {
            return <GaborCircle size={sidePatch.size} contrast={contrast} onClick={() => {}} style={style} />;
        } else {
            return <div style={{...style, width: sidePatch.size, height: sidePatch.size, backgroundColor: 'grey', borderRadius: '50%'}} />;
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-black font-sans">
             <div className="absolute top-4 left-4 z-20 text-slate-700 bg-gradient-to-br from-white to-cyan-100 p-3 rounded-xl shadow-lg border border-cyan-200/50">
                <p className="font-bold text-xl">Score: {score}</p>
                <div className="flex items-center mt-2">
                    <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) =>
                            i < ecgLives ? (
                                <HeartIcon key={i} className="w-6 h-6 text-red-500" />
                            ) : (
                                <HeartOutlineIcon key={i} className="w-6 h-6 text-red-500/70" />
                            )
                        )}
                    </div>
                </div>
                <p className="text-sm mt-2">High Score: {highScore}</p>
            </div>
            <button
                onClick={() => setCurrentPage('home')}
                className="absolute top-4 right-4 bg-white/80 text-cyan-600 p-3 rounded-full shadow-lg z-20 transition transform hover:scale-110"
                aria-label="Home"
            >
                <HomeIcon className="w-8 h-8"/>
            </button>
            
            <div className="h-1/3 bg-white relative">{sidePatch?.position === 'top' && renderSidePatch()}</div>
            
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
            
            <div className="h-1/3 bg-white relative">{sidePatch?.position === 'bottom' && renderSidePatch()}</div>

            {fireworks && <Fireworks x={fireworks.x} y={fireworks.y} />}

            {isQuizVisible && (
                 <div className="absolute inset-0 bg-black/70 z-30 flex items-center justify-center">
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
                        <p className="mb-6 text-slate-300">How many <strong className="text-white">correct Gabor patches</strong> did you see in the top and bottom white areas?</p>
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
                            <p className="text-4xl font-bold text-white">{score}</p>
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
