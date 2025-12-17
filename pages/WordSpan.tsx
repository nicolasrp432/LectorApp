import React, { useState, useEffect } from 'react';

interface WordSpanProps {
  onBack: () => void;
  onComplete: (score: number) => void;
  savedMaxSpan?: number; // From UserStats
}

// Corpus de palabras
const WORDS_POOL = [
    "CASA", "SOL", "PAN", "LUZ", "MAR", "FLOR", "PERRO", "GATO", "MESA", "SILLA", 
    "MANO", "PIE", "DEDO", "OJO", "BOCA", "AGUA", "FUEGO", "AIRE", "TIERRA", "ARBOL",
    "LIBRO", "LAPIZ", "RELOJ", "COCHE", "TREN", "AVION", "BARCO", "NUBE", "LLUVIA", "NIEVE"
];

const WordSpan: React.FC<WordSpanProps> = ({ onBack, onComplete, savedMaxSpan = 3 }) => {
  const [phase, setPhase] = useState<'intro' | 'memorize' | 'recall' | 'result'>('intro');
  const [level, setLevel] = useState(Math.max(3, savedMaxSpan)); 
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Game Logic Loop
  useEffect(() => {
      if (phase === 'memorize') {
          // Difficulty scaler: Faster as levels go up
          // Level 3: 1000ms, Level 9: ~600ms
          const speedFactor = Math.max(600, 1000 - ((level - 3) * 60));
          const wordDuration = speedFactor;
          const intervalDuration = 400;
          
          const timer = setTimeout(() => {
              if (currentWordIndex < sequence.length - 1) {
                  setCurrentWordIndex(prev => prev + 1);
              } else {
                  // End of sequence, prepare recall
                  generateOptions();
                  setPhase('recall');
              }
          }, wordDuration + intervalDuration);
          
          return () => clearTimeout(timer);
      }
  }, [phase, currentWordIndex, sequence, level]);

  const startGame = () => {
      // Create random sequence of 'level' length
      const shuffled = [...WORDS_POOL].sort(() => 0.5 - Math.random());
      setSequence(shuffled.slice(0, level));
      setCurrentWordIndex(0);
      setPhase('memorize');
  };

  const generateOptions = () => {
      // Distractors logic
      const target = sequence[sequence.length - 1]; // We test the LAST word for Recency Effect
      
      const otherWords = WORDS_POOL.filter(w => w !== target).sort(() => 0.5 - Math.random()).slice(0, 3);
      const opts = [...otherWords, target].sort(() => 0.5 - Math.random());
      setOptions(opts);
  };

  const handleOptionClick = (word: string) => {
      setSelectedWord(word);
      const target = sequence[sequence.length - 1];
      const correct = word === target;
      setIsCorrect(correct);
      
      if (correct) {
          if (level < 12) { 
              setLevel(prev => prev + 1);
          }
          onComplete(level + 1); 
      } else {
          // Fallback logic
          if (level > 3) setLevel(prev => prev - 1);
          onComplete(level);
      }
      
      setPhase('result');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display p-6 relative">
      <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 z-20 transition-colors">
            <span className="material-symbols-outlined text-gray-600 dark:text-white">close</span>
      </button>

      {/* Level Indicator (Always visible except intro) */}
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
                  <span className="material-symbols-outlined text-6xl text-pink-500">text_fields</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Memoria de Trabajo</h2>
              <div className="mb-6 bg-surface-light dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Tu Capacidad</p>
                  <p className="text-3xl font-bold text-primary">{level} Palabras</p>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xs text-sm leading-relaxed">
                  Memoriza la secuencia que aumenta de dificultad.<br/> 
                  Te preguntaremos por la <b>ÚLTIMA</b> palabra mostrada.<br/>
              </p>
              <button onClick={startGame} className="px-8 py-4 bg-primary text-black font-bold rounded-xl shadow-[0_0_20px_rgba(25,230,94,0.3)] hover:scale-105 transition-transform">
                  Comenzar Test
              </button>
          </div>
      )}

      {phase === 'memorize' && (
          <div className="flex-1 flex flex-col items-center justify-center relative">
               <div className="absolute top-20 text-gray-500 text-sm font-mono bg-black/20 px-3 py-1 rounded-full">
                   Palabra {currentWordIndex + 1} / {sequence.length}
               </div>
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white animate-in zoom-in duration-300 key={currentWordIndex} text-center leading-tight">
                  {sequence[currentWordIndex]}
              </h1>
              {/* Progress bar for time */}
              <div className="w-48 h-1.5 bg-gray-200 dark:bg-white/10 mt-12 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 animate-[width_1s_linear]"></div>
              </div>
          </div>
      )}

      {phase === 'recall' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">¿Cuál fue la ÚLTIMA palabra?</h2>
               <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                   {options.map((opt, i) => (
                       <button 
                            key={i}
                            onClick={() => handleOptionClick(opt)}
                            className="p-6 bg-white dark:bg-surface-dark border-2 border-gray-100 dark:border-white/10 rounded-xl text-lg font-bold hover:border-pink-500 hover:bg-pink-500/10 transition-all text-slate-800 dark:text-gray-200 shadow-sm"
                        >
                           {opt}
                       </button>
                   ))}
               </div>
          </div>
      )}

      {phase === 'result' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
               <div className={`size-24 rounded-full flex items-center justify-center mb-6 ${isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    <span className="material-symbols-outlined text-6xl">
                        {isCorrect ? 'check_circle' : 'cancel'}
                    </span>
               </div>
               
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                   {isCorrect ? '¡Correcto!' : 'Fallaste'}
               </h2>
               
               {isCorrect ? (
                   <p className="text-gray-500 mb-8">Tu memoria se expande. <br/>Siguiente nivel: <b>{level} palabras</b>.</p>
               ) : (
                   <p className="text-gray-500 mb-8">La palabra era <b>{sequence[sequence.length-1]}</b>.<br/>Intenta consolidar mejor la imagen mental.</p>
               )}
               
               <div className="flex gap-4 w-full max-w-xs">
                   <button onClick={() => { setPhase('intro'); setSelectedWord(null); }} className="flex-1 py-4 border border-gray-300 dark:border-gray-600 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                       Terminar
                   </button>
                   <button onClick={startGame} className="flex-1 py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg">
                       Continuar
                   </button>
               </div>
          </div>
      )}
    </div>
  );
};

export default WordSpan;