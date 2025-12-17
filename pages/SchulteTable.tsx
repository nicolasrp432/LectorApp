import React, { useState, useEffect, useRef } from 'react';

interface SchulteTableProps {
  onBack: () => void;
  onComplete: (metrics: { levelOrSpeed: number; durationSeconds: number; wpmCalculated: number; comprehensionRate: number }) => void;
  savedMaxLevel?: number; 
}

const SchulteTable: React.FC<SchulteTableProps> = ({ onBack, onComplete, savedMaxLevel = 1 }) => {
  const LEVEL_CONFIG = {
    1: { size: 3, threshold: 10 },
    2: { size: 4, threshold: 20 },
    3: { size: 5, threshold: 35 },
    4: { size: 6, threshold: 50 },
    5: { size: 7, threshold: 70 },
    6: { size: 8, threshold: 90 },
    7: { size: 9, threshold: 120 }
  };
  
  const [currentLevel, setCurrentLevel] = useState(savedMaxLevel);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  
  // Timer States
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [isPaused, setIsPaused] = useState(false);
  const [accumulatedTime, setAccumulatedTime] = useState(0); 
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [showCenterDot, setShowCenterDot] = useState(true);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gridSize = LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG]?.size || 3;

  useEffect(() => {
    startNewGame(gridSize);
    return () => stopTimer();
  }, [gridSize]);

  // Timer Logic
  useEffect(() => {
    if (!isPaused && !isGameOver && startTime > 0) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedTime(accumulatedTime + (now - startTime));
      }, 50);
    } else {
        stopTimer();
    }
    return () => stopTimer();
  }, [isPaused, isGameOver, startTime]);

  const stopTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
  };

  const handlePauseToggle = () => {
      if (isGameOver) return;
      if (isPaused) {
          setStartTime(Date.now());
          setIsPaused(false);
      } else {
          setAccumulatedTime(elapsedTime);
          setIsPaused(true);
      }
  };

  const startNewGame = (size: number) => {
    const nums = Array.from({ length: size * size }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setNumbers(nums);
    setCurrentNumber(1);
    setAccumulatedTime(0);
    setElapsedTime(0);
    setStartTime(Date.now());
    setIsGameOver(false);
    setIsPaused(false);
    setShowCenterDot(true); 
  };

  const handleNumberClick = (num: number) => {
    if (isGameOver || isPaused) return;

    if (num === currentNumber) {
      if (currentNumber === gridSize * gridSize) {
        finishGame();
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    } else {
        const btn = document.getElementById(`schulte-btn-${num}`);
        if(btn) {
            btn.classList.add('animate-shake');
            setTimeout(() => btn.classList.remove('animate-shake'), 400);
        }
    }
  };

  const finishGame = () => {
      setIsGameOver(true);
      const totalTimeSeconds = elapsedTime / 1000;
      
      onComplete({
          levelOrSpeed: currentLevel, 
          durationSeconds: totalTimeSeconds,
          wpmCalculated: 0, 
          comprehensionRate: 100 
      });
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display overflow-hidden">
      {/* Header */}
      <header className="flex-none flex items-center justify-between px-4 py-4 z-10 bg-background-light dark:bg-background-dark shadow-sm">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        {/* Level Control */}
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
                <button 
                    disabled={currentLevel <= 1}
                    onClick={() => setCurrentLevel(p => p - 1)}
                    className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"
                >
                    <span className="material-symbols-outlined">remove</span>
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase text-gray-500 font-bold">Nivel</span>
                    <span className="text-lg font-bold text-primary leading-none">{currentLevel} ({LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].size}x{LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].size})</span>
                </div>
                <button 
                    disabled={currentLevel >= 7}
                    onClick={() => setCurrentLevel(p => p + 1)}
                    className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"
                >
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>
        </div>

        <button 
            onClick={handlePauseToggle}
            className={`p-2 rounded-full transition-colors ${isPaused ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-400'}`}
        >
            <span className="material-symbols-outlined">{isPaused ? 'play_arrow' : 'pause'}</span>
        </button>
      </header>

      {/* Stats Bar */}
      <div className="flex-none flex justify-center gap-8 py-2">
          <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Siguiente</span>
              <span className="text-3xl font-bold text-primary animate-pulse">{currentNumber}</span>
          </div>
          <div className="h-full w-px bg-gray-300 dark:bg-white/10 mx-2"></div>
          <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Tiempo</span>
              <span className={`text-3xl font-bold font-mono w-24 text-center ${elapsedTime/1000 > LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].threshold ? 'text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {formatTime(elapsedTime)}s
              </span>
          </div>
      </div>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 relative w-full h-full overflow-hidden">
        
        {/* Instruction Overlay */}
        {!isPaused && elapsedTime < 2000 && elapsedTime > 0 && (
            <div className="absolute top-4 bg-black/50 text-white px-4 py-1 rounded-full text-xs animate-pulse pointer-events-none z-20">
                Mantén la vista en el centro
            </div>
        )}

        {/* The Grid - Scaled to fill */}
        <div className="flex-1 w-full max-w-2xl flex items-center justify-center p-2">
            <div className="relative w-full aspect-square max-h-full">
                {isPaused && (
                    <div className="absolute inset-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur flex flex-col items-center justify-center rounded-2xl">
                        <span className="material-symbols-outlined text-6xl text-gray-400 mb-2">pause_circle</span>
                        <p className="text-lg font-bold text-gray-500">Juego Pausado</p>
                        <button onClick={handlePauseToggle} className="mt-4 px-6 py-2 bg-primary text-black font-bold rounded-lg hover:scale-105 transition-transform">
                            Reanudar
                        </button>
                    </div>
                )}
                
                <div 
                    className={`
                        relative grid gap-1.5 sm:gap-2 bg-gray-200 dark:bg-[#1a2c20] p-2 rounded-xl shadow-2xl border-4 border-gray-300 dark:border-[#2c4a36] transition-all duration-300 select-none h-full w-full
                        ${isPaused ? 'blur-sm' : ''}
                    `}
                    style={{ 
                        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
                    }}
                >
                    {/* Fixation Point */}
                    {showCenterDot && !isPaused && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                            <div className="size-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse border-2 border-white/20"></div>
                        </div>
                    )}

                    {numbers.map((num) => {
                        const isFound = num < currentNumber;
                        // Huge responsive font sizes
                        const fontSize = gridSize >= 7 ? 'text-2xl sm:text-3xl' : gridSize >= 5 ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-6xl';
                        
                        return (
                            <button
                                key={num}
                                id={`schulte-btn-${num}`}
                                onClick={() => handleNumberClick(num)}
                                className={`
                                    relative flex items-center justify-center font-bold rounded-lg transition-all duration-100 select-none w-full h-full
                                    ${fontSize}
                                    ${isFound 
                                        ? 'bg-primary/5 text-primary/20 scale-95' 
                                        : 'bg-white dark:bg-[#2A4532] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#34563f] shadow-[0_2px_0_rgba(0,0,0,0.1)] active:translate-y-[1px] active:shadow-none'
                                    }
                                `}
                            >
                                <span className={`${currentNumber === num ? 'scale-110' : ''} transition-transform`}>{num}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      </main>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1A2C20] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-white/10 text-center animate-in zoom-in-95 duration-200">
                <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-5xl text-primary">emoji_events</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Sesión Finalizada!</h3>
                <p className="text-gray-500 mb-6">Tu agilidad visual está mejorando.</p>
                
                <div className="bg-background-light dark:bg-black/20 rounded-2xl p-6 mb-6">
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-2">Tiempo Final</p>
                    <p className="text-5xl font-mono font-bold text-slate-900 dark:text-white">{formatTime(elapsedTime)}</p>
                    <div className="mt-2 text-xs text-gray-400">Meta: {LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].threshold}s</div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onBack} className="flex-1 py-4 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        Salir
                    </button>
                    <button onClick={() => startNewGame(gridSize)} className="flex-1 py-4 rounded-xl font-bold bg-primary text-black hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                        Repetir
                    </button>
                </div>
            </div>
        </div>
      )}
      
      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.4s ease-in-out;
            background-color: rgba(239, 68, 68, 0.2) !important;
            color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
};

export default SchulteTable;