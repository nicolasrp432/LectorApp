import React, { useState, useEffect } from 'react';
import { Book } from '../types';

interface ReadingSessionProps {
  onBack: () => void;
  book: Book;
  onComplete: (metrics: { levelOrSpeed: number; durationSeconds: number; wpmCalculated: number; comprehensionRate: number }) => void;
}

// Contenido por defecto en español
const DEFAULT_CONTENT = `
Los Fundamentos de los Pequeños Cambios.
¿Por qué es tan fácil repetir malos hábitos y tan difícil formar buenos? Pocas cosas pueden tener un impacto más poderoso en tu vida que mejorar tus hábitos diarios.
Mejorar un 1 por ciento no es particularmente notable, a veces ni siquiera es perceptible, pero puede ser mucho más significativo, especialmente a largo plazo. La diferencia que una pequeña mejora puede hacer con el tiempo es asombrosa.
Así es como funcionan las matemáticas: si puedes mejorar un 1 por ciento cada día durante un año, terminarás siendo treinta y siete veces mejor cuando hayas terminado. Por el contrario, si empeoras un 1 por ciento cada día durante un año, disminuirás casi hasta cero.
Lo que comienza como una pequeña victoria o un revés menor se acumula en algo mucho más grande. Los hábitos son el interés compuesto de la superación personal. De la misma manera que el dinero se multiplica a través del interés compuesto, los efectos de tus hábitos se multiplican a medida que los repites.
Parecen hacer poca diferencia en un día determinado y, sin embargo, el impacto que tienen a lo largo de los meses y años puede ser enorme. Solo cuando miramos atrás dos, cinco o quizás diez años después, el valor de los buenos hábitos y el costo de los malos se vuelve sorprendentemente evidente.
`;

const ReadingSession: React.FC<ReadingSessionProps> = ({ onBack, book, onComplete }) => {
  const [readingMode, setReadingMode] = useState<'skimming' | 'deep'>('skimming');
  const [speed, setSpeed] = useState(300); // WPM
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  
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

  const handleFinishSession = () => {
      const durationSeconds = (Date.now() - sessionStartTime) / 1000;
      // Estimación simple de WPM real si es lectura profunda
      const calculatedWPM = readingMode === 'skimming' ? speed : Math.round((words.length / durationSeconds) * 60);

      onComplete({
          levelOrSpeed: speed,
          durationSeconds: durationSeconds,
          wpmCalculated: calculatedWPM,
          comprehensionRate: 85 // Simulado para MVP, idealmente vendría de un Quiz post-lectura
      });
      onBack();
  };

  const renderRSVPWord = (word: string) => {
    if (!word) return null;
    const centerIndex = Math.floor(word.length / 2);
    const firstPart = word.slice(0, centerIndex);
    const middlePart = word[centerIndex];
    const lastPart = word.slice(centerIndex + 1);

    return (
      <div className="font-mono text-5xl sm:text-6xl font-bold tracking-wide text-slate-900 dark:text-white flex items-center justify-center h-40">
        <span className="text-right w-[45%] text-slate-400 dark:text-slate-500">{firstPart}</span>
        <span className="text-red-500 w-[10%] text-center">{middlePart}</span>
        <span className="text-left w-[45%] text-slate-400 dark:text-slate-500">{lastPart}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative group bg-background-light dark:bg-background-dark">
      {/* Top App Bar & Controls */}
      <header className="flex-none px-5 pt-6 pb-2 bg-background-light dark:bg-background-dark z-30">
        {/* Nav Row */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-white group">
            <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          <div className="flex flex-col items-center max-w-[200px]">
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold mb-0.5">Leyendo</span>
            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate w-full text-center">{book.title}</h2>
          </div>
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-white">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>tune</span>
          </button>
        </div>

        {/* Segmented Control (Mode Toggle) */}
        <div className="flex p-1.5 bg-gray-200 dark:bg-[#1A2C20] rounded-xl mb-5 mx-2">
          <button 
            onClick={() => { setReadingMode('skimming'); setIsPlaying(false); }}
            className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${readingMode === 'skimming' ? 'bg-white dark:bg-[#2A4532] text-gray-900 dark:text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <span className="material-symbols-outlined mr-1.5 text-[18px]">bolt</span>
            RSVP (Veloz)
          </button>
          <button 
            onClick={() => { setReadingMode('deep'); setIsPlaying(false); }}
            className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${readingMode === 'deep' ? 'bg-white dark:bg-[#2A4532] text-gray-900 dark:text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <span className="material-symbols-outlined mr-1.5 text-[18px]">menu_book</span>
            Profunda
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 px-2">
          <span className="w-8">Inicio</span>
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
      </header>

      {/* Main Reading Area */}
      <main className="flex-1 overflow-hidden relative group">
        
        {readingMode === 'skimming' ? (
          /* RSVP VIEW */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-sm aspect-video bg-white dark:bg-surface-dark rounded-2xl shadow-inner border border-gray-200 dark:border-white/5 flex items-center justify-center mb-10 overflow-hidden">
               {/* Guides for ORP (Optimal Recognition Point) */}
               <div className="absolute top-2 bottom-2 w-px bg-red-500/20 left-1/2 -translate-x-1/2 pointer-events-none"></div>
               <div className="absolute left-2 right-2 h-px bg-red-500/20 top-1/2 -translate-y-1/2 pointer-events-none"></div>
               
               {renderRSVPWord(words[wordIndex])}
            </div>
            <p className="text-gray-500 text-sm">Enfócate en la letra roja.</p>
          </div>
        ) : (
          /* DEEP READING VIEW (Scrollable) */
          <article className="h-full overflow-y-auto px-6 pb-40 pt-4 no-scrollbar scroll-smooth">
             <div className="max-w-lg mx-auto space-y-6">
                {content.split('\n').map((para, idx) => (
                    para.trim() ? <p key={idx} className="text-lg leading-[1.8] text-gray-700 dark:text-gray-300 font-serif">{para}</p> : <div key={idx} className="h-2" />
                ))}
                
                {/* Finish Button inside article for deep reading context */}
                <div className="pt-8 pb-4">
                    <button onClick={handleFinishSession} className="w-full py-4 bg-primary text-black font-bold rounded-xl shadow-lg">Terminar Lectura</button>
                </div>
             </div>
          </article>
        )}
      </main>

      {/* Floating Control Docker (Only for Skimming) */}
      {readingMode === 'skimming' && (
      <div className="absolute bottom-[24px] left-4 right-4 z-20 max-w-md mx-auto">
        <div className="glass-panel rounded-2xl p-4 shadow-lg border border-white/5 flex flex-col gap-4">
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
                    max="800" 
                    step="25"
                    value={speed} 
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="absolute z-10 w-full opacity-0 cursor-pointer h-full"
                 />
                <div className="absolute h-1.5 w-full bg-gray-600/30 rounded-full overflow-hidden pointer-events-none">
                  <div className="h-full bg-primary rounded-full transition-all duration-75" style={{ width: `${((speed - 100) / 700) * 100}%` }}></div>
                </div>
                <div 
                    className="absolute h-4 w-4 bg-white rounded-full shadow-md -ml-2 group-hover:scale-110 transition-transform pointer-events-none"
                    style={{ left: `${((speed - 100) / 700) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center justify-center size-12 rounded-xl bg-primary text-background-dark shadow-[0_0_15px_rgba(25,230,94,0.4)] hover:shadow-[0_0_20px_rgba(25,230,94,0.6)] hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[32px] fill-1">{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            
            <button
                onClick={handleFinishSession}
                className="flex items-center justify-center size-12 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                title="Terminar"
            >
                <span className="material-symbols-outlined text-[24px]">stop</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ReadingSession;