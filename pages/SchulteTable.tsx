
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import TrainingGuide from '../components/TrainingGuide.tsx';

interface SchulteTableProps {
  onBack: () => void;
}

const SchulteTable: React.FC<SchulteTableProps> = ({ onBack }) => {
  const { user, logReading } = useAuth();
  const { showToast } = useToast();
  
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
  const [hasStarted, setHasStarted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lógica de acceso inteligente: Solo mostrar guía automáticamente la primera vez
  useEffect(() => {
      const guideViewed = localStorage.getItem('schulte_guide_v3');
      if (!guideViewed) {
          setShowGuide(true);
          localStorage.setItem('schulte_guide_v3', 'true');
      }
  }, []);

  const getGridSize = (lvl: number) => {
      if (lvl >= MAX_LEVEL) return 9;
      return lvl + 2; 
  };
  const gridSize = getGridSize(currentLevel);

  const getSuccessThreshold = (size: number) => {
     const count = size * size;
     let multiplier = difficulty === 'Avanzado' ? 0.8 : difficulty === 'Básico' ? 1.4 : 1.1;
     return count * 1.2 * multiplier; 
  };

  useEffect(() => {
    prepareGame(gridSize);
    return () => stopTimer();
  }, [gridSize]);

  useEffect(() => {
    if (hasStarted && !isPaused && !isGameOver && startTime > 0 && !showGuide) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 50);
    } else {
        stopTimer();
    }
    return () => stopTimer();
  }, [hasStarted, isPaused, isGameOver, startTime, showGuide]);

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const prepareGame = (size: number) => {
    const nums = Array.from({ length: size * size }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setNumbers(nums);
    setCurrentNumber(1);
    setElapsedTime(0);
    setErrors(0);
    setIsGameOver(false);
    setIsPaused(false);
    setHasStarted(false);
    setNextLevelUnlocked(false);
  };

  const startGame = () => {
      setHasStarted(true);
      setStartTime(Date.now());
  };

  const handleNumberClick = (num: number) => {
    if (!hasStarted || isGameOver || isPaused || showGuide) return;

    if (num === currentNumber) {
      if (currentNumber === gridSize * gridSize) {
        finishGame();
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    } else {
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
          showToast(`¡Nivel ${currentLevel} dominado!`, 'success');
      }

      await logReading({
          exerciseType: 'schulte',
          levelOrSpeed: currentLevel,
          durationSeconds: totalTimeSeconds,
          wpmCalculated: 0,
          comprehensionRate: 100, 
          errors: errors
      });
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor((ms % 1000) / 10);
    return `${s}.${m.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark font-display overflow-hidden relative">
      {showGuide && <TrainingGuide guideKey="schulte" onClose={() => setShowGuide(false)} />}
      
      <header className="flex-none flex items-center justify-between px-4 py-4 z-10 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        {/* Selector de Nivel Mejorado */}
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-4 bg-surface-dark px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                <button 
                    disabled={currentLevel <= 1 || hasStarted}
                    onClick={() => setCurrentLevel(p => p - 1)}
                    className="text-gray-400 hover:text-primary disabled:opacity-20 flex items-center"
                >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-sm font-black text-primary leading-none uppercase tracking-tighter">{gridSize}x{gridSize}</span>
                    <span className="text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] mt-0.5">Nivel {currentLevel}</span>
                </div>
                <button 
                    disabled={currentLevel >= MAX_LEVEL || currentLevel >= savedMaxLevel || hasStarted}
                    onClick={() => setCurrentLevel(p => p + 1)}
                    className="text-gray-400 hover:text-primary disabled:opacity-20 flex items-center"
                >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
            </div>
        </div>

        <div className="flex items-center gap-1">
            <button onClick={() => setShowGuide(true)} className="p-2 text-gray-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help</span>
            </button>
            {hasStarted && (
                <button 
                    onClick={() => isPaused ? (setStartTime(Date.now() - elapsedTime), setIsPaused(false)) : setIsPaused(true)}
                    className="p-2 text-gray-500"
                >
                    <span className="material-symbols-outlined">{isPaused ? 'play_arrow' : 'pause'}</span>
                </button>
            )}
        </div>
      </header>

      {/* Barra de Información Principal */}
      <div className="flex-none flex justify-center gap-12 py-8 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex flex-col items-center">
              <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Próximo</span>
              <span className="text-5xl font-black text-primary transition-all duration-300 drop-shadow-[0_0_15px_rgba(25,230,94,0.3)]">{currentNumber}</span>
          </div>
          <div className="flex flex-col items-center">
              <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Tiempo</span>
              <span className="text-5xl font-black font-mono text-white tracking-tighter">{formatTime(elapsedTime)}</span>
          </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Overlay Preparación: Bloquea el inicio automático */}
        {!hasStarted && (
            <div className="absolute inset-0 z-40 bg-background-dark/95 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                    <div className="size-24 rounded-[2rem] bg-surface-dark border-2 border-primary/30 flex items-center justify-center shadow-2xl relative z-10">
                        <span className="material-symbols-outlined text-6xl text-primary drop-shadow-[0_0_10px_rgba(25,230,94,0.5)]">grid_view</span>
                    </div>
                </div>
                <h2 className="text-3xl font-black text-white mb-3">Preparado para el {gridSize}x{gridSize}</h2>
                <p className="text-sm text-gray-400 mb-10 max-w-[280px] leading-relaxed">
                    Fija tu mirada en el <span className="text-red-500 font-bold">punto rojo central</span> y localiza los números sin mover los ojos.
                </p>
                <Button onClick={startGame} className="px-12 h-18 text-xl rounded-2xl shadow-[0_15px_35px_rgba(25,230,94,0.25)] hover:scale-105 active:scale-95 transition-all">
                    Empezar Entrenamiento
                </Button>
            </div>
        )}

        <div className="w-full max-w-md aspect-square relative group">
            {isPaused && (
                <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center rounded-[2.5rem] text-white animate-in fade-in duration-300">
                    <span className="material-symbols-outlined text-7xl mb-4 text-primary animate-pulse">pause_circle</span>
                    <p className="font-black text-xl uppercase tracking-[0.3em]">En Pausa</p>
                    <button onClick={() => {setStartTime(Date.now() - elapsedTime); setIsPaused(false);}} className="mt-8 bg-white/10 px-6 py-2 rounded-full font-bold text-sm hover:bg-white/20 transition-all">Reanudar</button>
                </div>
            )}
            
            <div 
                className="grid gap-1.5 sm:gap-3 bg-white/5 p-3 sm:p-5 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-full w-full"
                style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
                }}
            >
                {/* Punto de Fijación Central: Guía visual crítica */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none size-2.5 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] ring-4 ring-red-500/20"></div>

                {numbers.map((num) => {
                    const isFound = num < currentNumber;
                    
                    // Cálculo de fuente dinámico y optimizado para mobile (Escalado de Neuro-UX)
                    let fontClass = 'text-4xl';
                    if (gridSize >= 7) fontClass = 'text-base sm:text-xl';
                    else if (gridSize >= 5) fontClass = 'text-xl sm:text-3xl';
                    else fontClass = 'text-3xl sm:text-5xl';
                    
                    return (
                        <button
                            key={num}
                            id={`schulte-btn-${num}`}
                            onClick={() => handleNumberClick(num)}
                            className={`
                                relative flex items-center justify-center font-black rounded-[0.8rem] sm:rounded-2xl select-none w-full h-full aspect-square transition-all duration-150 ${fontClass}
                                ${isFound 
                                    ? 'bg-primary/5 text-primary/10 border-transparent scale-[0.85]' 
                                    : 'bg-surface-dark border border-white/5 text-white shadow-xl active:scale-90 hover:border-primary/40 active:bg-primary/20'
                                }
                            `}
                        >
                            {num}
                        </button>
                    );
                })}
            </div>
        </div>
      </main>

      {/* Resultados Finales */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-500">
            <div className="bg-surface-dark border border-primary/20 rounded-[3.5rem] p-10 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                    <span className="material-symbols-outlined text-5xl text-primary">analytics</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Entrenamiento Finalizado</h3>
                <div className="py-8 flex flex-col gap-2">
                    <p className="text-7xl font-black font-mono text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{formatTime(elapsedTime)}</p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Tiempo Total</p>
                    
                    <div className="flex justify-center gap-10 mt-8">
                        <div>
                            <p className="text-2xl font-black text-red-400">{errors}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-black">Errores</p>
                        </div>
                        <div className="w-px h-10 bg-white/5 self-center"></div>
                        <div>
                            <p className="text-2xl font-black text-primary">Nivel {currentLevel}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-black">Superado</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 mt-6">
                    <Button onClick={() => {
                        if (nextLevelUnlocked) setCurrentLevel(prev => prev + 1);
                        prepareGame(nextLevelUnlocked ? gridSize + 1 : gridSize);
                    }} fullWidth>
                        {nextLevelUnlocked ? 'Siguiente Nivel' : 'Reintentar Nivel'}
                    </Button>
                    <button onClick={onBack} className="py-2 text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-all">
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        </div>
      )}
      
      <style>{`
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; border-color: #ef4444 !important; background-color: rgba(239, 68, 68, 0.2) !important; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
      `}</style>
    </div>
  );
};

export default SchulteTable;
