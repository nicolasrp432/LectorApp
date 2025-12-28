
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Book, QuizQuestion, ReadingMode } from '../types.ts';
import { generateReadingQuiz } from '../services/ai.ts';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Button } from '../components/ui/Button.tsx';
import { PRACTICE_LIBRARY } from '../constants.ts';
import { extractTextFromPdf } from '../utils/pdf.ts';
import TrainingGuide from '../components/TrainingGuide.tsx';

// --- SUB-COMPONENTES INDEPENDIENTES ---

const SessionHeader: React.FC<{ 
  onBack: () => void; 
  title?: string; 
  mode: ReadingMode;
  onHelp: () => void;
}> = ({ onBack, title, mode, onHelp }) => (
  <header className="flex-none p-4 flex justify-between items-center z-10 bg-background-light dark:bg-background-dark border-b border-black/5 dark:border-white/5">
    <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
      <span className="material-symbols-outlined">close</span>
    </button>
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-primary uppercase font-bold tracking-[0.2em] mb-0.5">
        {mode === 'focal' ? 'Entrenamiento Focal' : 
         mode === 'campo_visual' ? 'Escaneo Visual' : 
         mode === 'expansion' ? 'Expansión Visual' : 'Lectura Profunda'}
      </span>
      <h3 className="text-xs font-bold truncate max-w-[150px] opacity-70">{title}</h3>
    </div>
    <button onClick={onHelp} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-400">
      <span className="material-symbols-outlined">help</span>
    </button>
  </header>
);

const ReadingDisplay: React.FC<{
  mode: ReadingMode;
  words: string[];
  wordIndex: number;
  fullContent?: string;
}> = ({ mode, words, wordIndex, fullContent }) => {
  
  const renderFocal = () => {
    const word = words[wordIndex] || "";
    const pivotIdx = Math.max(0, Math.floor(word.length / 2) - 1);
    return (
      <div className="flex justify-center items-center h-full w-full font-mono text-3xl md:text-4xl font-bold tracking-tight">
        <div className="flex-1 text-right text-slate-100 opacity-20">{word.slice(0, pivotIdx)}</div>
        <div className="text-red-500 w-[0.8em] text-center bg-red-500/5 mx-0.5 border-x border-red-500/10">
          {word[pivotIdx]}
        </div>
        <div className="flex-1 text-left text-slate-100 opacity-20">{word.slice(pivotIdx + 1)}</div>
      </div>
    );
  };

  const renderBlocks = (isExpansion: boolean) => {
    const visibleCount = 40;
    const start = Math.max(0, wordIndex - (wordIndex % visibleCount));
    const blockWords = words.slice(start, start + visibleCount);

    return (
      <div className="w-full h-full p-8 flex flex-wrap gap-x-2 gap-y-3 justify-center items-center content-center">
        {blockWords.map((w, idx) => {
          const globalIdx = start + idx;
          let isHigh = false;
          if (!isExpansion) isHigh = globalIdx === wordIndex;
          else isHigh = globalIdx >= wordIndex && globalIdx < wordIndex + 4;

          return (
            <span key={idx} className={`text-xl transition-all duration-150 rounded px-1.5 py-0.5 ${isHigh ? 'bg-primary/80 text-black font-bold scale-110 shadow-lg' : 'text-slate-100 opacity-20'}`}>
              {w}
            </span>
          );
        })}
      </div>
    );
  };

  const renderDeepReading = () => (
    <div className="w-full h-full overflow-y-auto no-scrollbar p-8 prose prose-slate dark:prose-invert max-w-none">
      <div className="text-lg leading-relaxed text-slate-700 dark:text-slate-100 font-serif">
        {fullContent?.split('\n').map((p, i) => (
          p.trim() && <p key={i} className="mb-6">{p}</p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-xl h-[420px] bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-inner overflow-hidden relative flex items-center justify-center">
      {mode === 'focal' ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="absolute top-0 bottom-0 w-px bg-primary/5 left-1/2"></div>
          <div className="absolute left-0 right-0 h-px bg-primary/5 top-1/2"></div>
          {renderFocal()}
        </div>
      ) : mode === 'lectura_profunda' ? (
        renderDeepReading()
      ) : renderBlocks(mode === 'expansion')}
    </div>
  );
};

const ControlPanel: React.FC<{
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (val: number) => void;
  progress: number;
  onRestart: () => void;
  onFinish: () => void;
  isFinished?: boolean;
  mode: ReadingMode;
  timerSeconds?: number;
}> = ({ isPlaying, onTogglePlay, speed, onSpeedChange, progress, onRestart, onFinish, isFinished, mode, timerSeconds }) => {
  
  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-none p-6 bg-background-light dark:bg-background-dark border-t border-black/5 dark:border-white/5 shadow-2xl z-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-6">
          <div className="flex-1 space-y-4">
            <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-3">
                 {mode !== 'lectura_profunda' ? (
                   <>
                    <span className="material-symbols-outlined text-gray-400 text-sm">speed</span>
                    <input 
                        type="range" min="100" max="1000" step="50" 
                        value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))} 
                        className="w-24 h-1.5 bg-black/5 dark:bg-white/10 rounded-full accent-primary appearance-none cursor-pointer" 
                    />
                   </>
                 ) : (
                   <div className="flex items-center gap-2 text-primary">
                     <span className="material-symbols-outlined text-sm">timer</span>
                     <span className="text-sm font-bold font-mono tracking-widest">{formatTimer(timerSeconds || 0)}</span>
                   </div>
                 )}
              </div>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {mode !== 'lectura_profunda' ? (
                  <>{speed} <span className="text-[10px] font-normal text-gray-500 uppercase">WPM</span></>
                ) : (
                  <span className="text-xs uppercase text-gray-400 tracking-tighter">Lectura Activa</span>
                )}
              </span>
            </div>
          </div>
          
          <button 
            onClick={onTogglePlay} 
            className="size-16 rounded-2xl bg-primary text-black flex items-center justify-center shadow-[0_4px_15px_rgba(25,230,94,0.3)] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[42px] font-bold">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onRestart} 
            className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">replay</span> Reiniciar
          </button>
          <button 
            onClick={onFinish} 
            className={`flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm
              ${isFinished ? 'bg-primary text-black' : 'bg-primary/20 text-primary hover:bg-primary/30'}
            `}
          >
            <span className="material-symbols-outlined text-sm">check_circle</span> Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

interface ReadingSessionProps {
  onBack: () => void;
  initialBook?: Book;
  onComplete: (metrics: { 
      levelOrSpeed: number; 
      durationSeconds: number; 
      wpmCalculated: number; 
      comprehensionRate: number;
      telCalculated: number;
      exerciseType: any;
  }) => void;
}

type SessionPhase = 'select' | 'config' | 'reading' | 'quiz_choice' | 'evaluation' | 'results';

const ReadingSession: React.FC<ReadingSessionProps> = ({ onBack, initialBook, onComplete }) => {
  const { books, addBook } = useAuth();
  const { showToast } = useToast();
  
  const [phase, setPhase] = useState<SessionPhase>(initialBook ? 'config' : 'select');
  const [selectedBook, setSelectedBook] = useState<Book | null>(initialBook || null);
  const [readingMode, setReadingMode] = useState<ReadingMode>('focal');
  const [speed, setSpeed] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [finalScore, setFinalScore] = useState(0);
  
  const startTimeRef = useRef<number>(0);
  const wordsReadRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const words = useMemo(() => {
    if (!selectedBook?.content) return [];
    return selectedBook.content.split(/\s+/).filter(w => w.length > 0);
  }, [selectedBook]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && phase === 'reading') {
      if (readingMode === 'lectura_profunda') {
        timer = setInterval(() => {
          setTimerSeconds(prev => prev + 1);
        }, 1000);
      } else {
        const msPerWord = 60000 / speed;
        const step = readingMode === 'expansion' ? 4 : 1;
        
        timer = setInterval(() => {
          setWordIndex(prev => {
            if (prev >= words.length - step) {
              setIsPlaying(false);
              return prev;
            }
            wordsReadRef.current += step;
            return prev + step;
          });
        }, msPerWord * step);
      }
    }
    return () => clearInterval(timer);
  }, [isPlaying, phase, speed, readingMode, words.length]);

  const startExercise = () => {
    setWordIndex(0);
    setTimerSeconds(0);
    wordsReadRef.current = 0;
    startTimeRef.current = Date.now();
    setPhase('reading');
    setIsPlaying(true);
  };

  const handleStartQuiz = async (useAi: boolean) => {
    if (useAi) {
      setIsGeneratingQuiz(true);
      setPhase('evaluation');
      try {
        const questions = await generateReadingQuiz(selectedBook?.content || "");
        setActiveQuiz(questions);
      } catch (e) {
        showToast("Error generando evaluación con IA.", "error");
        setPhase('quiz_choice');
      } finally {
        setIsGeneratingQuiz(false);
      }
    } else {
      if (selectedBook?.questions && selectedBook.questions.length > 0) {
        setActiveQuiz(selectedBook.questions);
        setPhase('evaluation');
      } else {
        finalizeMetrics(100);
      }
    }
  };

  const finalizeMetrics = (score: number) => {
    const duration = readingMode === 'lectura_profunda' ? timerSeconds : (Date.now() - startTimeRef.current) / 1000;
    const wpm = readingMode === 'lectura_profunda' 
      ? Math.round((words.length / (Math.max(duration, 1) / 60)))
      : Math.round((wordsReadRef.current / Math.max(duration, 1)) * 60) || speed;
    const tel = Math.round(wpm * (score / 100));

    onComplete({
      levelOrSpeed: readingMode === 'lectura_profunda' ? wpm : speed,
      durationSeconds: duration,
      wpmCalculated: wpm,
      comprehensionRate: score,
      telCalculated: tel,
      exerciseType: readingMode
    });
    
    setFinalScore(score);
    setPhase('results');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let content = '';
      if (file.type === 'application/pdf') content = await extractTextFromPdf(file);
      else content = await file.text();
      
      const newBook: Book = {
        id: `user-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        author: 'Contenido Propio',
        coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400',
        content,
        progress: 0,
        category: 'user'
      };
      await addBook(newBook);
      setSelectedBook(newBook);
      setPhase('config');
    } catch (err) {
      showToast("Error al procesar archivo.", "error");
    }
  };

  if (showGuide) {
      return <TrainingGuide guideKey="reading" onClose={() => setShowGuide(false)} />;
  }

  if (phase === 'select') {
    return (
      <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-in fade-in pb-16">
        <header className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="text-xl font-bold">Librería de Lectura</h1>
           </div>
           <button onClick={() => fileInputRef.current?.click()} className="size-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
             <span className="material-symbols-outlined">add</span>
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.pdf" className="hidden" />
           </button>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
            <div className="grid gap-4">
                {[...PRACTICE_LIBRARY, ...books.filter(b => b.category === 'user')].map(book => (
                    <div 
                        key={book.id} onClick={() => { setSelectedBook(book); setPhase('config'); }}
                        className="flex items-center gap-5 p-5 bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-[2rem] hover:border-primary/50 transition-all cursor-pointer group shadow-sm h-32"
                    >
                        <img src={book.coverUrl} className="w-14 h-20 object-cover rounded-xl shadow-sm" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg truncate text-slate-900 dark:text-white">{book.title}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">{book.difficulty || 'Personal'}</p>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">play_circle</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  if (phase === 'config') {
    return (
      <div className="flex flex-col h-full bg-background-light dark:bg-background-dark items-center justify-center p-8 animate-in zoom-in-95 pb-32">
          <div className="w-full max-w-xs aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 relative border border-black/5 dark:border-white/5">
              <img src={selectedBook?.coverUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 p-8 flex flex-col justify-end">
                  <h2 className="text-2xl font-bold text-white leading-tight">{selectedBook?.title}</h2>
                  <p className="text-primary font-bold text-xs mt-2 uppercase tracking-widest">{selectedBook?.author}</p>
              </div>
          </div>
          <div className="w-full max-w-sm space-y-6">
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl">
                  {(['focal', 'campo_visual', 'expansion', 'lectura_profunda'] as ReadingMode[]).map(m => (
                      <button 
                        key={m} onClick={() => setReadingMode(m)}
                        className={`py-3 rounded-xl text-[9px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${readingMode === m ? 'bg-white dark:bg-surface-dark shadow-md text-primary' : 'text-gray-500'}`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {m === 'focal' ? 'center_focus_strong' : 
                           m === 'campo_visual' ? 'visibility' : 
                           m === 'expansion' ? 'open_in_full' : 'article'}
                        </span>
                        {m.replace('_', ' ')}
                      </button>
                  ))}
              </div>
              <div className="bg-black/5 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5">
                  <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">WPM Objetivo</span>
                      <span className="text-2xl font-bold text-primary font-mono">{speed}</span>
                  </div>
                  <input type="range" min="100" max="1000" step="50" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-primary h-1 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer" />
              </div>
              <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setPhase('select')} fullWidth>Cambiar</Button>
                  <Button onClick={startExercise} fullWidth>Iniciar</Button>
              </div>
              <button onClick={() => setShowGuide(true)} className="text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span> ¿Cómo leer más rápido?
              </button>
          </div>
      </div>
    );
  }

  if (phase === 'reading') {
    return (
      <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden font-display pb-16">
        <SessionHeader 
          onBack={() => { setIsPlaying(false); setPhase('config'); }} 
          title={selectedBook?.title} 
          mode={readingMode} 
          onHelp={() => setShowGuide(true)}
        />

        <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
          <ReadingDisplay 
            mode={readingMode}
            words={words}
            wordIndex={wordIndex}
            fullContent={selectedBook?.content}
          />
        </main>

        <ControlPanel 
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          speed={speed}
          onSpeedChange={setSpeed}
          progress={readingMode === 'lectura_profunda' ? 100 : (wordIndex / words.length) * 100}
          onRestart={() => { setWordIndex(0); setTimerSeconds(0); setIsPlaying(true); }}
          onFinish={() => setPhase('quiz_choice')}
          isFinished={readingMode === 'lectura_profunda' || wordIndex >= words.length - 4}
          mode={readingMode}
          timerSeconds={timerSeconds}
        />
      </div>
    );
  }

  if (phase === 'quiz_choice') {
    const hasPreset = selectedBook?.questions && selectedBook.questions.length > 0;
    return (
      <div className="flex flex-col h-full bg-background-light dark:bg-background-dark items-center justify-center p-8 text-center animate-in zoom-in-95 pb-32">
          <div className="size-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-500/30">
            <span className="material-symbols-outlined text-4xl text-blue-500">quiz</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Comprensión</h2>
          <p className="text-sm text-gray-500 mb-10 max-w-xs">Valida tu lectura antes de guardar el progreso.</p>
          <div className="w-full max-w-xs space-y-4">
              {hasPreset && <Button fullWidth variant="primary" onClick={() => handleStartQuiz(false)}>Cuestionario del Libro</Button>}
              <Button fullWidth variant={hasPreset ? 'secondary' : 'primary'} onClick={() => handleStartQuiz(true)}>Generar con Gemini IA</Button>
              <Button fullWidth variant="ghost" onClick={() => finalizeMetrics(100)}>Finalizar sin Test</Button>
          </div>
      </div>
    );
  }

  if (phase === 'evaluation') {
    return (
      <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-8 animate-in slide-in-from-bottom-8 pb-32">
          {isGeneratingQuiz ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
              <h2 className="text-2xl font-bold">Analizando texto...</h2>
              <p className="text-sm text-gray-500 mt-2">Gemini está creando tu evaluación.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
               <h2 className="text-2xl font-bold mb-10 text-center text-slate-900 dark:text-white">Evaluación</h2>
               <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                  {activeQuiz.map((q, idx) => (
                    <div key={q.id} className="bg-black/5 dark:bg-surface-dark p-6 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm">
                      <p className="font-bold text-lg mb-6 leading-snug text-slate-900 dark:text-white">{idx + 1}. {q.question}</p>
                      <div className="grid gap-3">
                        {q.options.map(opt => (
                          <button 
                            key={opt.id} onClick={() => setUserAnswers({...userAnswers, [q.id]: opt.id})}
                            className={`p-4 text-left text-sm rounded-2xl border-2 transition-all ${userAnswers[q.id] === opt.id ? 'border-primary bg-primary/10 font-bold text-slate-900 dark:text-white' : 'border-black/10 dark:border-white/5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
               <div className="pt-8">
                 <Button 
                    fullWidth 
                    onClick={() => {
                        let correct = 0;
                        activeQuiz.forEach(q => { if (userAnswers[q.id] && activeQuiz.find(aq => aq.id === q.id)?.options.find(o => o.id === userAnswers[q.id])?.isCorrect) correct++; });
                        finalizeMetrics(Math.round((correct / activeQuiz.length) * 100));
                    }} 
                    disabled={Object.keys(userAnswers).length < activeQuiz.length}
                 >
                    Ver Resultados
                 </Button>
               </div>
            </div>
          )}
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="flex flex-col h-full bg-background-light dark:bg-background-dark items-center justify-center p-8 text-center animate-in zoom-in-95 pb-32">
          <div className="size-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 border-2 border-primary shadow-lg">
              <span className="material-symbols-outlined text-6xl text-primary">emoji_events</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">¡Sesión Lista!</h1>
          <p className="text-sm text-gray-500 mb-12">Tus métricas han sido registradas.</p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-12">
              <div className="bg-black/5 dark:bg-surface-dark p-5 rounded-3xl border border-black/5 dark:border-white/5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Velocidad</p>
                  <p className="text-2xl font-bold text-primary font-mono">{finalScore > 0 ? (readingMode === 'lectura_profunda' ? 'Variable' : speed) : '0'}</p>
              </div>
              <div className="bg-black/5 dark:bg-surface-dark p-5 rounded-3xl border border-black/5 dark:border-white/5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Retención</p>
                  <p className="text-2xl font-bold text-blue-400 font-mono">{finalScore}%</p>
              </div>
          </div>
          <div className="w-full max-w-sm space-y-4">
              <Button fullWidth onClick={onBack}>Volver al Inicio</Button>
              <button onClick={() => setPhase('config')} className="text-primary font-bold text-xs uppercase tracking-[0.2em] hover:underline pt-4">Nuevo Entrenamiento</button>
          </div>
      </div>
    );
  }

  return null;
};

export default ReadingSession;
