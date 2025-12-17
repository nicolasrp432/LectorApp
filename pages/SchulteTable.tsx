import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface SchulteTableProps {
  onBack: () => void;
}

const SchulteTable: React.FC<SchulteTableProps> = ({ onBack }) => {
  const { user, logReading } = useAuth();
  const { showToast } = useToast();
  
  // Requirement: Max Level 7 with 9x9 grid.
  // Logic:
  // L1: 3x3
  // L2: 4x4
  // L3: 5x5
  // L4: 6x6
  // L5: 7x7
  // L6: 8x8
  // L7: 9x9
  const MAX_LEVEL = 7;
  const savedMaxLevel = Math.min(MAX_LEVEL, Math.max(1, user?.stats.maxSchulteLevel || 1));
  const difficulty = user?.preferences.difficultyLevel || 'Intermedio';

  const [currentLevel, setCurrentLevel] = useState(savedMaxLevel);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [errors, setErrors] = useState(0);
  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dynamic Grid Calculation: Level + 2
  const getGridSize = (lvl: number) => {
      // Safety clamp
      if (lvl >= MAX_LEVEL) return 9;
      return lvl + 2; 
  };
  const gridSize = getGridSize(currentLevel);

  // Thresholds for "Promotion" (Adaptive Difficulty)
  const getSuccessThreshold = (size: number) => {
     // Approx 1 sec per number for standard is "good"
     // For a 9x9 (81 numbers), 81 seconds is baseline.
     const count = size * size;
     let multiplier = difficulty === 'Avanzado' ? 0.8 : difficulty === 'Básico' ? 1.4 : 1.1;
     return count * 1.2 * multiplier; 
  };

  useEffect(() => {
    startNewGame(gridSize);
    return () => stopTimer();
  }, [gridSize]);

  useEffect(() => {
    if (!isPaused && !isGameOver && startTime > 0) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 50);
    } else {
        stopTimer();
    }
    return () => stopTimer();
  }, [isPaused, isGameOver, startTime]);

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const startNewGame = (size: number) => {
    const nums = Array.from({ length: size * size }, (_, i) => i + 1);
    // Fisher-Yates shuffle
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setNumbers(nums);
    setCurrentNumber(1);
    setElapsedTime(0);
    setErrors(0);
    setStartTime(Date.now());
    setIsGameOver(false);
    setIsPaused(false);
    setNextLevelUnlocked(false);
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
        // Error handling
        setErrors(prev => prev + 1);
        const btn = document.getElementById(`schulte-btn-${num}`);
        if(btn) {
            btn.classList.add('animate-shake');
            setTimeout(() => btn.classList.remove('animate-shake'), 400);
        }
    }
  };

  const finishGame = async () => {
      setIsGameOver(true);
      const totalTimeSeconds = elapsedTime / 1000;
      const threshold = getSuccessThreshold(gridSize);
      
      const isSuccess = totalTimeSeconds <= threshold && errors <= 2;
      let newLevel = currentLevel;

      if (isSuccess && currentLevel < MAX_LEVEL) {
          newLevel = currentLevel + 1;
          setNextLevelUnlocked(true);
          showToast(`¡Nivel ${currentLevel} dominado! Desbloqueando siguiente...`, 'success');
      } else if (currentLevel === MAX_LEVEL && isSuccess) {
          showToast('¡Has alcanzado la maestría máxima (Nivel 7)!', 'success');
      } else if (!isSuccess) {
          showToast('Buen intento. Mejora tu tiempo para avanzar.', 'info');
      }

      await logReading({
          exerciseType: 'schulte',
          levelOrSpeed: newLevel,
          durationSeconds: totalTimeSeconds,
          wpmCalculated: 0,
          comprehensionRate: 100, // Attention task
          errors: errors
      });
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor((ms % 1000) / 10);
    return `${s}.${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display overflow-hidden">
      <header className="flex-none flex items-center justify-between px-4 py-4 z-10 bg-background-light dark:bg-background-dark shadow-sm">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
                <button 
                    disabled={currentLevel <= 1}
                    onClick={() => setCurrentLevel(p => p - 1)}
                    className="text-gray-400 hover:text-primary disabled:opacity-30"
                >
                    <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="text-lg font-bold text-primary leading-none">{gridSize}x{gridSize}</span>
                <button 
                    disabled={currentLevel >= MAX_LEVEL || currentLevel >= savedMaxLevel}
                    onClick={() => setCurrentLevel(p => p + 1)}
                    className="text-gray-400 hover:text-primary disabled:opacity-30"
                >
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>
            <span className="text-[9px] text-gray-400 uppercase">Nivel {currentLevel}</span>
        </div>

        <button 
            onClick={() => isPaused ? (setStartTime(Date.now() - elapsedTime), setIsPaused(false)) : setIsPaused(true)}
            className="p-2 text-gray-400"
        >
            <span className="material-symbols-outlined">{isPaused ? 'play_arrow' : 'pause'}</span>
        </button>
      </header>

      {/* Stats Bar */}
      <div className="flex-none flex justify-center gap-8 py-2">
          <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Objetivo</span>
              <span className="text-3xl font-bold text-primary animate-pulse">{currentNumber}</span>
          </div>
          <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Tiempo</span>
              <span className="text-3xl font-bold font-mono">{formatTime(elapsedTime)}s</span>
          </div>
      </div>

      {/* Game Grid */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 relative w-full h-full overflow-hidden">
        <div className="flex-1 w-full max-w-2xl flex items-center justify-center p-2">
            <div className="relative w-full aspect-square max-h-full">
                {isPaused && (
                    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur flex flex-col items-center justify-center rounded-2xl text-white">
                        <span className="material-symbols-outlined text-6xl mb-2">pause</span>
                        <p className="font-bold">Pausa</p>
                    </div>
                )}
                
                <div 
                    className={`relative grid gap-1.5 sm:gap-2 bg-gray-200 dark:bg-[#1a2c20] p-2 rounded-xl shadow-2xl h-full w-full transition-all`}
                    style={{ 
                        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
                    }}
                >
                    {/* Fixation Dot (Neuro-UX) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none size-3 bg-red-500 rounded-full opacity-50"></div>

                    {numbers.map((num) => {
                        const isFound = num < currentNumber;
                        // Dynamic Font Scaling for dense grids
                        const fontSize = gridSize >= 9 ? 'text-lg sm:text-xl' : gridSize >= 7 ? 'text-xl sm:text-2xl' : gridSize >= 5 ? 'text-3xl' : 'text-5xl';
                        
                        return (
                            <button
                                key={num}
                                id={`schulte-btn-${num}`}
                                onClick={() => handleNumberClick(num)}
                                className={`
                                    relative flex items-center justify-center font-bold rounded-lg select-none w-full h-full ${fontSize}
                                    ${isFound 
                                        ? 'bg-primary/5 text-primary/20 scale-95' 
                                        : 'bg-white dark:bg-[#2A4532] text-slate-900 dark:text-white shadow-sm active:scale-95'
                                    }
                                `}
                            >
                                {num}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      </main>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <div className="bg-white dark:bg-[#1A2C20] rounded-3xl p-6 w-full max-w-sm text-center animate-in zoom-in-95">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Resultados</h3>
                <div className="py-6">
                    <p className="text-6xl font-mono font-bold text-slate-900 dark:text-white mb-2">{formatTime(elapsedTime)}</p>
                    <p className="text-sm text-gray-500">Errores: {errors}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onBack} fullWidth>Salir</Button>
                    <Button onClick={() => {
                        if (nextLevelUnlocked) setCurrentLevel(prev => prev + 1);
                        startNewGame(nextLevelUnlocked ? gridSize + 1 : gridSize);
                    }} fullWidth>
                        {nextLevelUnlocked ? 'Siguiente Nivel' : 'Repetir'}
                    </Button>
                </div>
            </div>
        </div>
      )}
      
      <style>{`
        .animate-shake { animation: shake 0.4s ease-in-out; background-color: rgba(239, 68, 68, 0.2) !important; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}</style>
    </div>
  );
};

export default SchulteTable;