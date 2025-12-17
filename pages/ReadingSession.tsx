import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';

interface ReadingSessionProps {
  onBack: () => void;
  book: Book;
  onComplete: (metrics: { levelOrSpeed: number; durationSeconds: number; wpmCalculated: number; comprehensionRate: number }) => void;
}

const DEFAULT_CONTENT = `Los Fundamentos de los Pequeños Cambios. ¿Por qué es tan fácil repetir malos hábitos y tan difícil formar buenos? Pocas cosas pueden tener un impacto más poderoso en tu vida que mejorar tus hábitos diarios. Mejorar un 1 por ciento no es particularmente notable, a veces ni siquiera es perceptible, pero puede ser mucho más significativo, especialmente a largo plazo. La diferencia que una pequeña mejora puede hacer con el tiempo es asombrosa.`;

const ReadingSession: React.FC<ReadingSessionProps> = ({ onBack, book, onComplete }) => {
  const [readingMode, setReadingMode] = useState<'skimming' | 'deep'>('skimming');
  const [speed, setSpeed] = useState(300); // WPM target for RSVP
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  
  // Timers
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [deepReadingSeconds, setDeepReadingSeconds] = useState(0); // Timer for Deep Reading
  const deepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const content = book.content || DEFAULT_CONTENT;
  const words = content.split(/\s+/).filter(w => w.length > 0);

  // RSVP Logic
  useEffect(() => {
    let interval: any;
    if (isPlaying && readingMode === 'skimming' && wordIndex < words.length) {
      const msPerWord = 60000 / speed;
      interval = setInterval(() => {
        setWordIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, msPerWord);
    }
    return () => clearInterval(interval);
  }, [isPlaying, readingMode, speed, wordIndex, words.length]);

  // Deep Reading Timer Logic
  useEffect(() => {
    if (readingMode === 'deep') {
        // Start Timer
        deepTimerRef.current = setInterval(() => {
            setDeepReadingSeconds(prev => prev + 1);
        }, 1000);
    } else {
        // Pause Timer
        if (deepTimerRef.current) clearInterval(deepTimerRef.current);
    }
    return () => {
        if (deepTimerRef.current) clearInterval(deepTimerRef.current);
    };
  }, [readingMode]);

  const handleFinishSession = () => {
      // Logic for WPM Calculation:
      // If Skimming: Use the preset speed setting.
      // If Deep Reading: Use words / seconds taken.
      
      let calculatedWPM = speed;
      let duration = (Date.now() - sessionStartTime) / 1000;

      if (readingMode === 'deep') {
          // Prevent division by zero
          const seconds = deepReadingSeconds > 0 ? deepReadingSeconds : 1;
          calculatedWPM = Math.round((words.length / seconds) * 60);
          duration = deepReadingSeconds;
      }

      onComplete({
          levelOrSpeed: speed,
          durationSeconds: duration,
          wpmCalculated: calculatedWPM,
          comprehensionRate: 85 // Mock comprehension for MVP
      });
      onBack();
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderRSVPWord = (word: string) => {
    if (!word) return null;
    const centerIndex = Math.ceil(word.length / 2) - 1;
    const firstPart = word.slice(0, centerIndex);
    const middlePart = word[centerIndex];
    const lastPart = word.slice(centerIndex + 1);

    return (
      <div className="font-mono text-5xl sm:text-6xl font-bold tracking-wide text-slate-900 dark:text-white flex items-center justify-center h-40 w-full">
        <span className="text-right w-1/2 pr-[1px] text-slate-400 dark:text-slate-500">{firstPart}</span>
        <span className="text-red-500 text-center">{middlePart}</span>
        <span className="text-left w-1/2 pl-[1px] text-slate-400 dark:text-slate-500">{lastPart}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative group bg-background-light dark:bg-background-dark">
      {/* Top App Bar & Controls */}
      <header className="flex-none px-5 pt-6 pb-2 bg-background-light dark:bg-background-dark z-30 shadow-sm border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-white group">
            <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          
          <div className="flex flex-col items-center max-w-[200px]">
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold mb-0.5">
                {readingMode === 'skimming' ? 'RSVP Speed' : 'Lectura Profunda'}
            </span>
            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate w-full text-center">{book.title}</h2>
          </div>
          
          <button 
            onClick={() => {
                setReadingMode(readingMode === 'skimming' ? 'deep' : 'skimming');
                setIsPlaying(false); // Pause RSVP if switching
            }} 
            className={`flex items-center justify-center size-10 rounded-full transition-colors ${readingMode === 'deep' ? 'bg-primary text-black' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-white'}`}
            title="Cambiar Modo"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{readingMode === 'skimming' ? 'menu_book' : 'bolt'}</span>
          </button>
        </div>

        {/* Progress Indicator (Only for RSVP or static progress in Deep) */}
        {readingMode === 'skimming' && (
            <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 px-2 pb-2">
            <div className="h-1.5 flex-1 bg-gray-200 dark:bg-[#1A2C20] rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const pct = x / rect.width;
                setWordIndex(Math.floor(pct * words.length));
            }}>
                <div className="h-full bg-primary rounded-full relative" style={{ width: `${(wordIndex / words.length) * 100}%` }}>
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 rounded-full"></div>
                </div>
            </div>
            <span className="w-8 text-right text-primary">{Math.round((wordIndex / words.length) * 100)}%</span>
            </div>
        )}
      </header>

      {/* Main Reading Area */}
      <main className="flex-1 overflow-hidden relative group">
        
        {readingMode === 'skimming' ? (
          /* RSVP VIEW */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-sm aspect-video bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-white/5 flex items-center justify-center mb-24 overflow-hidden">
               {/* Guides for ORP */}
               <div className="absolute top-4 bottom-4 w-0.5 bg-red-500/10 left-1/2 -translate-x-1/2 pointer-events-none"></div>
               <div className="absolute left-4 right-4 h-0.5 bg-red-500/10 top-1/2 -translate-y-1/2 pointer-events-none"></div>
               
               {renderRSVPWord(words[wordIndex])}
            </div>
          </div>
        ) : (
          /* DEEP READING VIEW */
          <div className="h-full flex flex-col relative">
              {/* Sticky Timer for Deep Reading */}
              <div className="absolute top-4 right-6 z-20 bg-black/80 backdrop-blur-md text-primary font-mono text-sm px-3 py-1.5 rounded-full border border-primary/30 shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] animate-pulse">timer</span>
                  <span>{formatTime(deepReadingSeconds)}</span>
              </div>

              <article className="h-full overflow-y-auto px-6 pb-40 pt-8 no-scrollbar scroll-smooth">
                 <div className="max-w-lg mx-auto space-y-6">
                    {content.split('\n').map((para, idx) => (
                        para.trim() ? <p key={idx} className="text-xl leading-[1.8] text-gray-800 dark:text-gray-200 font-serif tracking-wide text-justify">{para}</p> : <div key={idx} className="h-4" />
                    ))}
                    
                    <div className="pt-12 pb-8 border-t border-gray-200 dark:border-white/10 mt-8">
                        <p className="text-center text-gray-500 text-sm mb-4">¿Terminaste de leer?</p>
                        <button 
                            onClick={handleFinishSession} 
                            className="w-full py-4 bg-primary text-black font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            Registrar Sesión
                        </button>
                    </div>
                 </div>
              </article>
          </div>
        )}
      </main>

      {/* Floating Control Docker (Only visible in RSVP/Skimming Mode) */}
      {readingMode === 'skimming' && (
      <div className="absolute bottom-[24px] left-4 right-4 z-20 max-w-md mx-auto">
        <div className="glass-panel rounded-2xl p-4 shadow-lg border border-white/5 flex flex-col gap-4 bg-black/40 backdrop-blur-lg">
          <div className="flex items-center gap-4">
            
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <div className="flex justify-between text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                <span>Velocidad</span>
                <span className="text-primary">{speed} WPM</span>
              </div>
              {/* Custom Slider */}
              <div className="relative h-6 flex items-center w-full group cursor-pointer">
                 <input 
                    type="range" 
                    min="100" 
                    max="1200" 
                    step="25"
                    value={speed} 
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="absolute z-10 w-full opacity-0 cursor-pointer h-full"
                 />
                <div className="absolute h-1.5 w-full bg-gray-600/30 rounded-full overflow-hidden pointer-events-none">
                  <div className="h-full bg-primary rounded-full transition-all duration-75" style={{ width: `${((speed - 100) / 1100) * 100}%` }}></div>
                </div>
                <div 
                    className="absolute h-4 w-4 bg-white rounded-full shadow-md -ml-2 group-hover:scale-110 transition-transform pointer-events-none"
                    style={{ left: `${((speed - 100) / 1100) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center justify-center size-14 rounded-xl bg-primary text-background-dark shadow-[0_0_20px_rgba(25,230,94,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[36px] fill-1">{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ReadingSession;