import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface WordSpanProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

// Corpus de palabras
const WORDS_POOL = [
    "CASA", "SOL", "PAN", "LUZ", "MAR", "FLOR", "PERRO", "GATO", "MESA", "SILLA", 
    "MANO", "PIE", "DEDO", "OJO", "BOCA", "AGUA", "FUEGO", "AIRE", "TIERRA", "ARBOL",
    "LIBRO", "LAPIZ", "RELOJ", "COCHE", "TREN", "AVION", "BARCO", "NUBE", "LLUVIA", "NIEVE"
];

const WordSpan: React.FC<WordSpanProps> = ({ onBack }) => {
  const { user, logReading } = useAuth();
  
  const savedMaxSpan = user?.stats.maxWordSpan || 3;
  const userDifficulty = user?.preferences.difficultyLevel || 'Intermedio';

  const [mode, setMode] = useState<'words' | 'numbers' | 'mixed'>('numbers');
  const [phase, setPhase] = useState<'intro' | 'memorize' | 'recall' | 'result'>('intro');
  const [level, setLevel] = useState(savedMaxSpan); 
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  
  // Recall State
  const [options, setOptions] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  
  // Result Stats
  const [resultStats, setResultStats] = useState({ correct: 0, total: 0, accuracy: 0 });

  // Display Loop (Memorization Phase)
  useEffect(() => {
      if (phase === 'memorize') {
          // Difficulty scaler
          let baseSpeed = 1000;
          if (userDifficulty === 'Básico') baseSpeed = 1300;
          if (userDifficulty === 'Avanzado') baseSpeed = 700;
          
          if (mode === 'numbers') baseSpeed *= 0.8; // Numbers are faster to process

          // Level scaler (longer chains = slightly faster per item to maintain flow)
          const levelModifier = (level - 3) * 30; 
          const displayDuration = Math.max(300, baseSpeed - levelModifier);
          const intervalDuration = 200; // Blank gap
          
          const timer = setTimeout(() => {
              if (currentDisplayIndex < sequence.length - 1) {
                  setCurrentDisplayIndex(prev => prev + 1);
              } else {
                  // End of sequence
                  setTimeout(() => {
                    prepareRecallPhase();
                  }, 500);
              }
          }, displayDuration + intervalDuration);
          
          return () => clearTimeout(timer);
      }
  }, [phase, currentDisplayIndex, sequence, level, userDifficulty, mode]);

  const startGame = () => {
      let newSequence: string[] = [];

      if (mode === 'words') {
          const shuffled = [...WORDS_POOL].sort(() => 0.5 - Math.random());
          newSequence = shuffled.slice(0, level);
      } else if (mode === 'numbers') {
          newSequence = Array.from({ length: level }, () => Math.floor(Math.random() * 10).toString());
      } else {
          // Mixed
          for(let i=0; i<level; i++) {
              if (Math.random() > 0.5) {
                  newSequence.push(WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)]);
              } else {
                  newSequence.push(Math.floor(Math.random() * 10).toString());
              }
          }
      }

      setSequence(newSequence);
      setCurrentDisplayIndex(0);
      setUserSequence([]);
      setPhase('memorize');
  };

  const prepareRecallPhase = () => {
      // Create options pool: Correct items + Distractors
      const correctItems = [...sequence];
      let distractors: string[] = [];
      const distractorCount = Math.max(3, Math.floor(level / 2));

      while (distractors.length < distractorCount) {
          let candidate = '';
          if (mode === 'numbers') {
              candidate = Math.floor(Math.random() * 10).toString();
          } else if (mode === 'words') {
              candidate = WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)];
          } else {
               candidate = Math.random() > 0.5 
                ? WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)] 
                : Math.floor(Math.random() * 10).toString();
          }

          // Ensure uniqueness in options if possible (for numbers duplicates are allowed in sequence but distractors should add confusion)
          // For simplicity in MVP, we just push.
          distractors.push(candidate);
      }

      // Merge and shuffle options
      // Note: If the sequence has duplicates (e.g. 5, 2, 5), the options pool needs enough 5s.
      // Strategy: Options pool contains the sequence items + distractors.
      const pool = [...correctItems, ...distractors].sort(() => 0.5 - Math.random());
      setOptions(pool);
      setPhase('recall');
  };

  const handleOptionClick = (item: string, index: number) => {
      // In recall phase, user taps items to build sequence
      if (userSequence.length < sequence.length) {
          const newSeq = [...userSequence, item];
          setUserSequence(newSeq);
          
          // Remove from options visual (optional, or just disable)
          const newOptions = [...options];
          newOptions.splice(index, 1); // Remove ONE instance of this item
          setOptions(newOptions);

          // Auto-submit if full
          if (newSeq.length === sequence.length) {
              setTimeout(() => submitResult(newSeq), 300);
          }
      }
  };

  const submitResult = async (finalUserSeq: string[]) => {
      let correctCount = 0;
      let errors = 0;

      // Position-based checking
      finalUserSeq.forEach((item, idx) => {
          if (item === sequence[idx]) {
              correctCount++;
          } else {
              errors++;
          }
      });

      const accuracy = Math.round((correctCount / sequence.length) * 100);
      const isPerfect = accuracy === 100;
      let nextLevel = level;

      if (isPerfect) {
          if (level < 20) {
              nextLevel = level + 1;
              setLevel(nextLevel);
          }
      } else {
          // Fallback if very poor performance
          if (accuracy < 50 && level > 3) {
              nextLevel = level - 1;
              setLevel(nextLevel);
          }
      }

      setResultStats({ correct: correctCount, total: sequence.length, accuracy });
      
      await logReading({
          exerciseType: 'word_span',
          levelOrSpeed: isPerfect ? nextLevel : level,
          durationSeconds: 30, // Approx
          wpmCalculated: 0,
          comprehensionRate: accuracy,
          errors: errors
      });

      setPhase('result');
  };

  const handleUndo = () => {
      if (userSequence.length > 0) {
          const lastItem = userSequence[userSequence.length - 1];
          setUserSequence(prev => prev.slice(0, -1));
          setOptions(prev => [...prev, lastItem]); // Return to pool (imperfect sorting but functional)
      }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display p-6 relative">
      <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 z-20 transition-colors">
            <span className="material-symbols-outlined text-gray-600 dark:text-white">close</span>
      </button>

      {/* Level Indicator */}
      {phase !== 'intro' && (
          <div className="absolute top-6 right-6 flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Nivel</span>
              <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-pink-500">{level}</span>
                  <div className="flex gap-0.5">
                      {[...Array(12)].map((_, i) => (
                          <div key={i} className={`w-1 h-3 rounded-full ${i < level ? 'bg-pink-500' : 'bg-gray-700'}`}></div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {phase === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in">
              <div className="size-24 bg-pink-500/20 rounded-full flex items-center justify-center mb-6 border border-pink-500/30">
                  <span className="material-symbols-outlined text-6xl text-pink-500">pin</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Cadenas Secuenciales</h2>
              
              <div className="flex bg-gray-200 dark:bg-white/10 p-1 rounded-xl mb-6 w-full max-w-sm">
                  {['numbers', 'words', 'mixed'].map((m) => (
                      <button 
                        key={m}
                        onClick={() => setMode(m as any)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${mode === m ? 'bg-white dark:bg-surface-dark shadow-sm text-pink-500' : 'text-gray-500'}`}
                      >
                          {m === 'numbers' ? 'Números' : m === 'words' ? 'Palabras' : 'Mixto'}
                      </button>
                  ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xs text-sm leading-relaxed">
                  Memoriza la secuencia completa.<br/> 
                  Al finalizar, deberás reconstruir el orden <b>exacto</b> de todos los elementos.
              </p>
              <button onClick={startGame} className="px-8 py-4 bg-primary text-black font-bold rounded-xl shadow-[0_0_20px_rgba(25,230,94,0.3)] hover:scale-105 transition-transform">
                  Comenzar Nivel {level}
              </button>
          </div>
      )}

      {phase === 'memorize' && (
          <div className="flex-1 flex flex-col items-center justify-center relative">
               <div className="absolute top-20 text-gray-500 text-sm font-mono bg-black/20 px-3 py-1 rounded-full">
                   Item {currentDisplayIndex + 1} / {sequence.length}
               </div>
              <h1 className="text-6xl md:text-8xl font-bold text-slate-900 dark:text-white animate-in zoom-in duration-200 key={currentDisplayIndex} text-center leading-tight font-mono">
                  {sequence[currentDisplayIndex]}
              </h1>
              {/* Progress bar for time */}
              <div className="w-48 h-1.5 bg-gray-200 dark:bg-white/10 mt-12 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 animate-[width_1s_linear]"></div>
              </div>
          </div>
      )}

      {phase === 'recall' && (
          <div className="flex-1 flex flex-col items-center pt-12 animate-in fade-in">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 text-center">
                   Reconstruye la Secuencia
               </h2>

               {/* Slots for User Sequence */}
               <div className="flex flex-wrap gap-2 justify-center mb-8 min-h-[60px] w-full max-w-lg">
                   {Array.from({length: sequence.length}).map((_, i) => (
                       <div 
                        key={i} 
                        className={`size-12 md:size-14 rounded-xl border-2 flex items-center justify-center text-lg font-bold font-mono transition-all
                            ${userSequence[i] 
                                ? 'bg-pink-500 text-white border-pink-500' 
                                : 'border-gray-300 dark:border-white/20 bg-white/5 text-transparent'
                            }
                        `}
                       >
                           {userSequence[i] || '?'}
                       </div>
                   ))}
               </div>

               {/* Action Bar */}
               <div className="w-full flex justify-end px-4 mb-4 max-w-lg">
                   <button onClick={handleUndo} disabled={userSequence.length === 0} className="text-sm text-gray-500 flex items-center gap-1 hover:text-white disabled:opacity-30">
                       <span className="material-symbols-outlined">undo</span> Deshacer
                   </button>
               </div>

               {/* Options Pool */}
               <div className="flex flex-wrap justify-center gap-3 w-full max-w-lg">
                   {options.map((opt, i) => (
                       <button 
                            key={`${opt}-${i}`}
                            onClick={() => handleOptionClick(opt, i)}
                            className="px-4 py-3 bg-white dark:bg-surface-dark border-b-4 border-gray-200 dark:border-white/10 rounded-xl text-lg font-bold hover:border-pink-500 hover:translate-y-1 active:border-b-0 active:translate-y-2 transition-all text-slate-800 dark:text-gray-200 shadow-sm font-mono"
                        >
                           {opt}
                       </button>
                   ))}
               </div>
          </div>
      )}

      {phase === 'result' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
               <div className={`size-24 rounded-full flex items-center justify-center mb-6 ${resultStats.accuracy === 100 ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                    <span className="material-symbols-outlined text-6xl">
                        {resultStats.accuracy === 100 ? 'emoji_events' : 'analytics'}
                    </span>
               </div>
               
               <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                   {resultStats.accuracy}%
               </h2>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-6">Precisión Secuencial</p>
               
               <div className="bg-white/5 rounded-xl p-4 mb-8 text-left w-full max-w-xs space-y-2">
                   <div className="flex justify-between text-sm">
                       <span className="text-gray-400">Objetivos</span>
                       <span className="text-white">{resultStats.total}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                       <span className="text-gray-400">Aciertos</span>
                       <span className="text-green-400">{resultStats.correct}</span>
                   </div>
               </div>

               {resultStats.accuracy === 100 ? (
                   <p className="text-gray-500 mb-8">Memoria sólida. Siguiente nivel desbloqueado.</p>
               ) : (
                   <p className="text-gray-500 mb-8">La secuencia correcta era:<br/><span className="text-pink-500 font-mono font-bold mt-2 block">{sequence.join(' - ')}</span></p>
               )}
               
               <div className="flex gap-4 w-full max-w-xs">
                   <button onClick={() => { setPhase('intro'); setUserSequence([]); }} className="flex-1 py-4 border border-gray-300 dark:border-gray-600 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                       Salir
                   </button>
                   <button onClick={startGame} className="flex-1 py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg">
                       Intentar Nivel {level}
                   </button>
               </div>
          </div>
      )}
    </div>
  );
};

export default WordSpan;