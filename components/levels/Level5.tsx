import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Page } from '../../types';
import LevelLayout from '../LevelLayout';
import GaborCircle from '../GaborCircle';

// New Game End Popup Component for Level 5
const GameEndPopup: React.FC<{
  score: number;
  incorrectClicks: number;
  onSubmit: () => void;
}> = ({ score, incorrectClicks, onSubmit }) => (
  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl text-center w-full max-w-md animate-fade-in-up border-t-8 border-cyan-500">
      <h2 className="text-3xl font-bold text-slate-800 mb-4">Level Complete</h2>
      <div className="bg-slate-50 p-4 rounded-lg mb-6">
        <p className="text-lg text-slate-600">You correctly identified the target patch:</p>
        <p className="text-6xl font-bold text-teal-600 my-2" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.1)'}}>{score}</p>
        <p className="text-lg text-slate-600">times</p>
        {incorrectClicks > 0 && (
          <p className="text-md text-rose-500 mt-3 font-medium">with {incorrectClicks} incorrect clicks.</p>
        )}
      </div>
      <button
        onClick={onSubmit}
        className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300"
      >
        Submit
      </button>
    </div>
  </div>
);


const PATCH_SIZES = [30, 40, 50, 60]; // Use a size range from 30px to 60px
const START_CONTRAST = 1.0;
const END_CONTRAST = 0.3;
const WAVE_SPEED = 90; // pixels per second
const BEAT_WIDTH = 350;
const BEAT_SPACING = 100;

// A self-contained Firework Particle component using React state for animation
const FireworkParticle: React.FC<{ angle: number; distance: number; color: string }> = ({ angle, distance, color }) => {
    const [style, setStyle] = useState<React.CSSProperties>({
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: color,
        transform: 'translate(-50%, -50%) scale(0)',
        opacity: 1,
        transition: 'transform 0.7s ease-out, opacity 0.7s ease-out',
    });

    useEffect(() => {
        const finalX = Math.cos(angle * Math.PI / 180) * distance;
        const finalY = Math.sin(angle * Math.PI / 180) * distance;
        
        const timer = setTimeout(() => {
            setStyle(s => ({
                ...s,
                transform: `translate(${finalX-2.5}px, ${finalY-2.5}px) scale(1)`,
                opacity: 0,
            }));
        }, 10);
        return () => clearTimeout(timer);
    }, [angle, distance]);

    return <div style={style} />;
};

// A self-contained Firework component that removes itself after animation
const Firework: React.FC<{ x: number; y: number; onCompleted: () => void }> = ({ x, y, onCompleted }) => {
    useEffect(() => {
        const timer = setTimeout(onCompleted, 800); // Animation duration + buffer
        return () => clearTimeout(timer);
    }, [onCompleted]);

    const particles = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        angle: (i / 12) * 360,
        distance: 40 + Math.random() * 20,
        color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`,
    }));

    return (
        <div className="absolute pointer-events-none" style={{ top: y, left: x, transform: 'translate(-50%, -50%)' }}>
            {particles.map((p) => <FireworkParticle key={p.id} {...p} />)}
        </div>
    );
};

// "Fake" patch component
const SolidCircle: React.FC<{
  size: number;
  contrast: number;
  onClick: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}> = ({ size, contrast, onClick, style, className = '' }) => {
  const circleStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    cursor: 'pointer',
    opacity: contrast,
    backgroundColor: `rgba(128, 128, 128, ${0.8 * contrast})`,
    transition: 'transform 0.1s ease-out, opacity 0.2s ease-out',
    ...style,
  };

  return (
    <div
      onClick={onClick}
      style={circleStyle}
      className={`hover:scale-110 ${className}`}
      aria-label="Solid circle"
    ></div>
  );
};

interface PatchData {
  id: 'P' | 'Q' | 'R' | 'S';
  relativeX: number;
  relativeY: number;
  size: number;
  isLargest: boolean;
}

interface Heartbeat {
  id: number;
  x: number;
  patches: PatchData[];
  clickedPatches: Set<string>;
  yOffsets: Record<string, number>;
}

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Level5: React.FC<{
  setCurrentPage: (page: Page) => void;
  saveLevelCompletion: (levelId: string, isCompleted: boolean) => void;
}> = ({ setCurrentPage, saveLevelCompletion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ecgContainerRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | undefined>();
  const lastFrameTime = useRef<number>(0);
  const nextBeatId = useRef<number>(0);
  const timeRef = useRef(0);
  const nextFireworkId = useRef(0);
  const isLargePatchAnimationPausedRef = useRef(false);

  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [heartbeats, setHeartbeats] = useState<Heartbeat[]>([]);
  const [score, setScore] = useState(0);
  const [incorrectClicks, setIncorrectClicks] = useState(0);
  const [ecgContainerSize, setEcgContainerSize] = useState({ width: 0, height: 0 });
  const [fireworks, setFireworks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [largePatchBaseSize, setLargePatchBaseSize] = useState(200);
  const [dynamicLargePatchSize, setDynamicLargePatchSize] = useState(200);
  const [isLargePatchVisible, setIsLargePatchVisible] = useState(true);
  const [isGaborOnTop, setIsGaborOnTop] = useState(true);
  const [isLargePatchAnimationPaused, setIsLargePatchAnimationPaused] = useState(false);

  const time = timeRef.current / 1000; // time in seconds
  const contrastFluctuation = Math.sin(time * 2) * 0.1; // Fluctuate by +/- 0.1
  const baseContrast = Math.max(END_CONTRAST, START_CONTRAST - (score / 20) * (START_CONTRAST - END_CONTRAST)); // Slow down contrast reduction
  const currentContrast = Math.max(0.1, Math.min(1.0, baseContrast + contrastFluctuation));

  const generatePatchesForBeat = useCallback((): PatchData[] => {
    const shuffledSizes = shuffleArray(PATCH_SIZES);
    const largestSize = Math.max(...shuffledSizes);

    const relativePoints = {
      P1: { x: BEAT_WIDTH * 0.15, y: -20 },
      Q1: { x: BEAT_WIDTH * 0.25, y: 10 },
      R1: { x: BEAT_WIDTH * 0.3, y: -80 },
      S2: { x: BEAT_WIDTH * 0.85, y: 25 },
    };

    return [
      { id: 'P', relativeX: relativePoints.P1.x, relativeY: relativePoints.P1.y, size: shuffledSizes[0], isLargest: shuffledSizes[0] === largestSize },
      { id: 'Q', relativeX: relativePoints.Q1.x, relativeY: relativePoints.Q1.y, size: shuffledSizes[1], isLargest: shuffledSizes[1] === largestSize },
      { id: 'R', relativeX: relativePoints.R1.x, relativeY: relativePoints.R1.y, size: shuffledSizes[2], isLargest: shuffledSizes[2] === largestSize },
      { id: 'S', relativeX: relativePoints.S2.x, relativeY: relativePoints.S2.y, size: shuffledSizes[3], isLargest: shuffledSizes[3] === largestSize },
    ];
  }, []);

  const generateNewHeartbeat = useCallback((x: number): Heartbeat => {
    return {
      id: nextBeatId.current++,
      x,
      patches: generatePatchesForBeat(),
      clickedPatches: new Set(),
      yOffsets: {
          P1: (Math.random() - 0.5) * 10, R1: (Math.random() - 0.5) * 20, S1: (Math.random() - 0.5) * 15,
          P2: (Math.random() - 0.5) * 10, R2: (Math.random() - 0.5) * 20, S2: (Math.random() - 0.5) * 15,
      }
    };
  }, [generatePatchesForBeat]);


  const drawECG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ecgContainerSize.height) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#dc2626'; // Blood red
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    
    const centerY = canvas.height / 2;

    ctx.beginPath();
    ctx.moveTo(-10, centerY);

    heartbeats.forEach(beat => {
        const p1_y = centerY + -20 + beat.yOffsets.P1;
        const q1_y = centerY + 10;
        const r1_y = centerY + -80 + beat.yOffsets.R1;
        const s1_y = centerY + 30 + beat.yOffsets.S1;
        const t1_y = centerY + -15;

        const p2_y = centerY + -25 + beat.yOffsets.P2;
        const q2_y = centerY + 5;
        const r2_y = centerY + -70 + beat.yOffsets.R2;
        const s2_y = centerY + 25 + beat.yOffsets.S2;
        const t2_y = centerY + -10;

        // Beat 1
        ctx.lineTo(beat.x + BEAT_WIDTH * 0.1, centerY);
        ctx.quadraticCurveTo(beat.x + BEAT_WIDTH * 0.12, p1_y, beat.x + BEAT_WIDTH * 0.15, p1_y);
        ctx.lineTo(beat.x + BEAT_WIDTH * 0.25, q1_y);
        ctx.lineTo(beat.x + BEAT_WIDTH * 0.3, r1_y);
        ctx.lineTo(beat.x + BEAT_WIDTH * 0.35, s1_y);
        ctx.quadraticCurveTo(beat.x + BEAT_WIDTH * 0.4, s1_y-15, beat.x + BEAT_WIDTH * 0.45, t1_y);
        ctx.quadraticCurveTo(beat.x + BEAT_WIDTH * 0.5, centerY-5, beat.x + BEAT_WIDTH * 0.55, centerY);

        // Beat 2
        ctx.lineTo(beat.x + BEAT_WIDTH * 0.6, centerY);
        ctx.quadraticCurveTo(beat.x + BEAT_WIDTH * 0.62, p2_y, beat.x + BEAT_WIDTH * 0.65, p2_y);
        ctx.lineTo(beat.x + BEAT_WIDTH * 0.75, q2_y);
        ctx.lineTo(beat.x + BEAT_WIDTH * 0.8, r2_y);
        ctx.lineTo(beat.x + BEAT_WIDTH * 0.85, s2_y);
        ctx.quadraticCurveTo(beat.x + BEAT_WIDTH * 0.9, s2_y - 15, beat.x + BEAT_WIDTH * 0.95, t2_y);
        ctx.quadraticCurveTo(beat.x + BEAT_WIDTH * 1.0, centerY-5, beat.x + BEAT_WIDTH + BEAT_SPACING, centerY);
    });
    ctx.lineTo(ecgContainerSize.width + 10, centerY);
    ctx.stroke();

  }, [heartbeats, ecgContainerSize]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameState !== 'playing') {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    timeRef.current = timestamp;
    const deltaTime = lastFrameTime.current ? (timestamp - lastFrameTime.current) / 1000 : 0;
    lastFrameTime.current = timestamp;

    setHeartbeats(prevHeartbeats => {
      let newHeartbeats = prevHeartbeats.map(beat => ({
        ...beat,
        x: beat.x - WAVE_SPEED * deltaTime,
      })).filter(beat => beat.x > -BEAT_WIDTH - BEAT_SPACING);

      const lastBeat = newHeartbeats[newHeartbeats.length - 1];
      if (!lastBeat || lastBeat.x < ecgContainerSize.width - BEAT_WIDTH - BEAT_SPACING) {
        newHeartbeats.push(generateNewHeartbeat(ecgContainerSize.width));
      }
      return newHeartbeats;
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameState, ecgContainerSize.width, generateNewHeartbeat]);

  useEffect(() => {
    if (ecgContainerSize.width > 0 && gameState === 'playing') {
        lastFrameTime.current = performance.now();
        if (heartbeats.length === 0) {
             setHeartbeats([generateNewHeartbeat(ecgContainerSize.width * 0.8)]);
        }
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop, ecgContainerSize.width, heartbeats.length, generateNewHeartbeat, gameState]);
  
  // Game Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const gameDuration = 45000 + Math.random() * (120000 - 45000); // 45s to 120s
    const timer = setTimeout(() => {
      setGameState('finished');
    }, gameDuration);
    return () => clearTimeout(timer);
  }, [gameState]);


  useEffect(() => {
    drawECG();
  }, [heartbeats, drawECG]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const intervalId = setInterval(() => {
      setHeartbeats(prev => prev.map(beat => ({
        ...beat,
        patches: generatePatchesForBeat(),
        clickedPatches: new Set(),
      })));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [generatePatchesForBeat, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const intervalId = setInterval(() => {
      setIsGaborOnTop(Math.random() > 0.5);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState]);

  // Handle large patch animations pausing
  useEffect(() => {
    isLargePatchAnimationPausedRef.current = isLargePatchAnimationPaused;
  }, [isLargePatchAnimationPaused]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let pauseTimer: number;
    const scheduleNextToggle = () => {
        const isCurrentlyPaused = isLargePatchAnimationPausedRef.current;
        const duration = isCurrentlyPaused
            ? 1000 + Math.random() * 2000 // Pause for 1-3 seconds
            : 3000 + Math.random() * 4000; // Animate for 3-7 seconds

        pauseTimer = window.setTimeout(() => {
            setIsLargePatchAnimationPaused(prev => !prev);
            scheduleNextToggle();
        }, duration);
    };
    scheduleNextToggle();
    return () => clearTimeout(pauseTimer);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    // Blinking effect
    const blinkInterval = setInterval(() => {
        if (!isLargePatchAnimationPaused) {
            setIsLargePatchVisible(v => !v);
        }
    }, 500);

    // Size change effect
    const sizeInterval = setInterval(() => {
        if (!isLargePatchAnimationPaused) {
            const multiplier = 0.95 + Math.random() * 0.1;
            setDynamicLargePatchSize(largePatchBaseSize * multiplier);
        }
    }, 1000);

    return () => {
        clearInterval(blinkInterval);
        clearInterval(sizeInterval);
    };
  }, [largePatchBaseSize, isLargePatchAnimationPaused, gameState]);


  useEffect(() => {
    const container = gameAreaRef.current;
    if (!container) return;

    const updateSizes = () => {
        const ecgContainer = ecgContainerRef.current;
        const canvas = canvasRef.current;
        if (canvas && ecgContainer) {
            canvas.width = ecgContainer.offsetWidth;
            canvas.height = ecgContainer.offsetHeight;
            setEcgContainerSize({ width: ecgContainer.offsetWidth, height: ecgContainer.offsetHeight });
        }
        
        const middleSectionHeight = 256; // Corresponds to h-64 (16rem * 16px/rem)
        const remainingHeight = container.offsetHeight - middleSectionHeight;
        const sectionHeight = Math.max(0, remainingHeight / 2);

        const size = Math.max(40, Math.min(container.offsetWidth * 0.8, sectionHeight * 0.8));
        setLargePatchBaseSize(size);
        setDynamicLargePatchSize(size);
    };

    const resizeObserver = new ResizeObserver(updateSizes);
    resizeObserver.observe(container);
    updateSizes();

    return () => resizeObserver.disconnect();
  }, []);

  const handleGaborClick = (beatId: number, clickedPatch: PatchData) => {
    if (gameState !== 'playing') return;

    const beat = heartbeats.find(b => b.id === beatId);
    if (!beat || beat.clickedPatches.has(clickedPatch.id)) return;

    if (clickedPatch.isLargest) {
      setScore(prev => prev + 1);

      const centerY = ecgContainerSize.height / 2;
      const fireworkX = beat.x + clickedPatch.relativeX;
      const fireworkY = centerY + clickedPatch.relativeY;
      setFireworks(current => [...current, { id: nextFireworkId.current++, x: fireworkX, y: fireworkY }]);

      setHeartbeats(prev => prev.map(b => 
        b.id === beatId 
          ? { ...b, clickedPatches: new Set(b.clickedPatches).add(clickedPatch.id) } 
          : b
      ));
    } else {
      setIncorrectClicks(prev => prev + 1);
    }
  };

  const removeFirework = (id: number) => {
    setFireworks(current => current.filter(f => f.id !== id));
  };

  const centerY = ecgContainerSize.height / 2;

  return (
    <LevelLayout levelId={5} setCurrentPage={setCurrentPage}>
      <>
        <div ref={gameAreaRef} className="relative flex flex-col w-full flex-grow">
            {/* Top Section */}
            <div className="flex-1 bg-white relative flex items-center justify-center overflow-hidden">
                {isGaborOnTop ? (
                    <GaborCircle size={dynamicLargePatchSize} contrast={isLargePatchVisible ? currentContrast : 0} onClick={() => {}} className="pointer-events-none" />
                ) : (
                    <SolidCircle size={dynamicLargePatchSize} contrast={isLargePatchVisible ? currentContrast : 0} onClick={() => {}} className="pointer-events-none" />
                )}
            </div>
            
            {/* Middle Section (ECG) */}
            <div ref={ecgContainerRef} className="h-64 shrink-0 bg-gray-900 relative overflow-hidden">
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
                {heartbeats.map(beat =>
                beat.patches.map(patch => 
                    !beat.clickedPatches.has(patch.id) && (
                    <GaborCircle
                        key={`${beat.id}-${patch.id}`}
                        size={patch.size}
                        contrast={currentContrast}
                        onClick={(e) => { e.stopPropagation(); handleGaborClick(beat.id, patch); }}
                        style={{
                        position: 'absolute',
                        top: `${centerY + patch.relativeY}px`,
                        left: `${beat.x + patch.relativeX}px`,
                        transform: 'translate(-50%, -50%)',
                        }}
                    />
                    )
                )
                )}
                {fireworks.map(f => (
                <Firework key={f.id} x={f.x} y={f.y} onCompleted={() => removeFirework(f.id)} />
                ))}
            </div>

            {/* Bottom Section */}
            <div className="flex-1 bg-white relative flex items-center justify-center overflow-hidden">
                {!isGaborOnTop ? (
                    <GaborCircle size={dynamicLargePatchSize} contrast={isLargePatchVisible ? currentContrast : 0} onClick={() => {}} className="pointer-events-none" />
                ) : (
                    <SolidCircle size={dynamicLargePatchSize} contrast={isLargePatchVisible ? currentContrast : 0} onClick={() => {}} className="pointer-events-none" />
                )}
            </div>
        </div>
        {gameState === 'playing' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center space-x-8 my-4 w-full max-w-sm">
            <div className="bg-teal-500 text-white p-3 rounded-lg shadow-md flex-1 text-center font-bold text-lg">Correct: {score}</div>
            <div className="bg-rose-500 text-white p-3 rounded-lg shadow-md flex-1 text-center font-bold text-lg">Incorrect: {incorrectClicks}</div>
            </div>
        )}
        {gameState === 'finished' && (
            <GameEndPopup
                score={score}
                incorrectClicks={incorrectClicks}
                onSubmit={() => {
                    const success = score > 0 && score >= incorrectClicks;
                    saveLevelCompletion('level5', success);
                    setCurrentPage('level6');
                }}
            />
        )}
      </>
    </LevelLayout>
  );
};

export default Level5;
