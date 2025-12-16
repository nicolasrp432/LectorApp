import React, { useState, useEffect, useRef } from 'react';

interface SchulteTableProps {
  onBack: () => void;
  onComplete: (metrics: { levelOrSpeed: number; durationSeconds: number; wpmCalculated: number; comprehensionRate: number }) => void;
}

const SchulteTable: React.FC<SchulteTableProps> = ({ onBack, onComplete }) => {
  // Configuración de niveles más desafiante
  const LEVEL_CONFIG = {
    1: { size: 3, threshold: 8 },  // 3x3
    2: { size: 4, threshold: 18 }, // 4x4
    3: { size: 5, threshold: 30 }, // 5x5
    4: { size: 6, threshold: 45 }, // 6x6
    5: { size: 7, threshold: 60 }  // 7x7
  };
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1);
  
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [lastClicked, setLastClicked] = useState<number | null>(null);
  
  const gridSize = LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].size;

  // Initialize Game
  useEffect(() => {
    startNewGame(gridSize);
  }, [gridSize]);

  // Timer
  useEffect(() => {
    let interval: any;
    if (startTime && !isGameOver && !isLevelingUp) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 50); // Higher precision
    }
    return () => clearInterval(interval);
  }, [startTime, isGameOver, isLevelingUp]);

  const startNewGame = (size: number) => {
    const nums = Array.from({ length: size * size }, (_, i) => i + 1);
    // Fisher-Yates shuffle
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setNumbers(nums);
    setCurrentNumber(1);
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsGameOver(false);
    setIsLevelingUp(false);
    setLastClicked(null);
  };

  const handleNumberClick = (num: number) => {
    if (isGameOver || isLevelingUp) return;

    if (num === currentNumber) {
      setLastClicked(num);
      if (currentNumber === gridSize * gridSize) {
        finishGame();
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    } else {
        // Feedback visual de error (opcional: vibración si es nativo)
        const btn = document.getElementById(`schulte-btn-${num}`);
        if(btn) {
            btn.classList.add('animate-shake');
            setTimeout(() => btn.classList.remove('animate-shake'), 400);
        }
    }
  };

  const finishGame = () => {
      setIsGameOver(true);
      const totalTimeSeconds = (Date.now() - (startTime || 0)) / 1000;
      
      // Check for progression
      const config = LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG];
      
      if (totalTimeSeconds < config.threshold && currentLevel < 5) {
          if (currentLevel >= maxUnlockedLevel) {
              setIsLevelingUp(true);
              setTimeout(() => {
                setMaxUnlockedLevel(currentLevel + 1);
                setIsLevelingUp(false);
              }, 1500); // Animation delay
          }
      }

      // Log results
      onComplete({
          levelOrSpeed: gridSize,
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
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Entrenamiento Visual</h2>
        <div className="w-10"></div> 
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        
        {/* Stats Bar */}
        <div className="flex items-center gap-8 mb-8">
            <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Objetivo</span>
                <span className="text-5xl font-bold text-primary animate-pulse">{currentNumber}</span>
            </div>
            <div className="h-10 w-px bg-gray-300 dark:bg-white/10"></div>
            <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tiempo</span>
                <span className={`text-4xl font-bold font-mono w-28 text-center ${elapsedTime/1000 > LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].threshold ? 'text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {formatTime(elapsedTime)}s
                </span>
            </div>
        </div>

        {/* The Grid */}
        <div 
            className="grid gap-2 bg-gray-200 dark:bg-[#1a2c20] p-2 rounded-2xl shadow-2xl border-4 border-gray-300 dark:border-[#2c4a36] transition-all duration-300"
            style={{ 
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                width: '100%',
                maxWidth: gridSize > 5 ? '400px' : '350px',
                aspectRatio: '1/1'
            }}
        >
            {numbers.map((num) => {
                const isFound = num < currentNumber;
                return (
                    <button
                        key={num}
                        id={`schulte-btn-${num}`}
                        onClick={() => handleNumberClick(num)}
                        className={`
                            relative flex items-center justify-center font-bold rounded-xl transition-all duration-100 select-none
                            ${gridSize >= 6 ? 'text-xl' : 'text-3xl'}
                            ${isFound 
                                ? 'bg-primary/10 text-primary/30 scale-95' 
                                : 'bg-white dark:bg-[#2A4532] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#34563f] shadow-[0_4px_0_rgba(0,0,0,0.1)] active:translate-y-[2px] active:shadow-none'
                            }
                        `}
                    >
                        <span className={`${currentNumber === num ? 'scale-110' : ''} transition-transform`}>{num}</span>
                        {/* Center Dot for Focus (Optional) */}
                        {num === Math.ceil((gridSize * gridSize)/2) && gridSize % 2 !== 0 && (
                             <span className="absolute size-1.5 bg-red-500 rounded-full opacity-50 pointer-events-none"></span>
                        )}
                    </button>
                );
            })}
        </div>

        {/* Adaptive Level Selector */}
        <div className="mt-10 flex gap-2 overflow-x-auto max-w-full px-2 py-2 no-scrollbar">
            {[1, 2, 3, 4, 5].map(lvl => {
                const config = LEVEL_CONFIG[lvl as keyof typeof LEVEL_CONFIG];
                const isLocked = lvl > maxUnlockedLevel;
                
                return (
                    <button
                        key={lvl}
                        disabled={isLocked}
                        onClick={() => setCurrentLevel(lvl)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-1 min-w-fit
                            ${currentLevel === lvl 
                                ? 'bg-primary text-black border-primary shadow-[0_0_10px_rgba(25,230,94,0.4)]' 
                                : isLocked
                                    ? 'bg-transparent text-gray-600 border-gray-800 opacity-50 cursor-not-allowed'
                                    : 'bg-transparent text-gray-500 border-gray-600 hover:border-white hover:text-white'
                            }`}
                    >
                        {isLocked ? <span className="material-symbols-outlined text-sm">lock</span> : null}
                        Nivel {lvl} ({config.size}x{config.size})
                    </button>
                )
            })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
            Objetivo: &lt; {LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].threshold}s para desbloquear el siguiente.
        </p>
      </main>

      {/* Level Up Animation Overlay */}
      {isLevelingUp && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="text-center animate-bounce">
                  <span className="material-symbols-outlined text-8xl text-primary drop-shadow-[0_0_20px_rgba(25,230,94,0.8)]">lock_open</span>
                  <h2 className="text-4xl font-bold text-white mt-4 drop-shadow-md">¡Nivel Desbloqueado!</h2>
              </div>
          </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && !isLevelingUp && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1A2C20] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-white/10 text-center animate-in zoom-in-95 duration-200">
                <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-5xl text-primary">emoji_events</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Entrenamiento Completado!</h3>
                <p className="text-gray-500 mb-6">Tu enfoque visual está mejorando.</p>
                
                <div className="bg-background-light dark:bg-black/20 rounded-2xl p-6 mb-6">
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-2">Tiempo Final</p>
                    <p className="text-5xl font-mono font-bold text-slate-900 dark:text-white">{formatTime(elapsedTime)}</p>
                    <div className="mt-2 text-xs text-gray-400">Meta: {LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].threshold}s</div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onBack} className="flex-1 py-4 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        Cerrar
                    </button>
                    <button onClick={() => startNewGame(gridSize)} className="flex-1 py-4 rounded-xl font-bold bg-primary text-black hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                        Jugar de Nuevo
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