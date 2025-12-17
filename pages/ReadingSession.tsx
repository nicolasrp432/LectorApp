
import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import { getQuickDefinition } from '../services/ai';
import { useToast } from '../context/ToastContext';

interface ReadingSessionProps {
  onBack: () => void;
  book: Book;
  onComplete: (metrics: { 
      levelOrSpeed: number; 
      durationSeconds: number; 
      wpmCalculated: number; 
      comprehensionRate: number;
      telCalculated: number; // New: efficiency
      exerciseType: 'reading_session' | 'rsvp';
  }) => void;
}

const DEFAULT_CONTENT = `Los Fundamentos de los Pequeños Cambios. ¿Por qué es tan fácil repetir malos hábitos y tan difícil formar buenos? Pocas cosas pueden tener un impacto más poderoso en tu vida que mejorar un 1 por ciento.`;

const ReadingSession: React.FC<ReadingSessionProps> = ({ onBack, book, onComplete }) => {
  const { showToast } = useToast();
  const [readingMode, setReadingMode] = useState<'skimming' | 'deep'>('skimming');
  const [speed, setSpeed] = useState(300); // WPM target for RSVP
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  
  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: string}>({});
  
  // AI Assist
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
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

  const handleFinishButton = () => {
      // If book has questions, show quiz first
      if (book.questions && book.questions.length > 0) {
          setShowQuiz(true);
      } else {
          // Finish directly
          finalizeSession(100); // Assume 100% comp if no questions (or generic log)
      }
  };

  const finalizeSession = (comprehensionScore: number) => {
      let calculatedWPM = speed;
      let duration = (Date.now() - sessionStartTime) / 1000;

      if (readingMode === 'deep') {
          const seconds = deepReadingSeconds > 0 ? deepReadingSeconds : 1;
          calculatedWPM = Math.round((words.length / seconds) * 60);
          duration = deepReadingSeconds;
      }

      // Calculate Efficiency (TEL)
      // Formula: WPM * (Comprehension / 100)
      const tel = Math.round(calculatedWPM * (comprehensionScore / 100));

      onComplete({
          levelOrSpeed: speed,
          durationSeconds: duration,
          wpmCalculated: calculatedWPM,
          comprehensionRate: comprehensionScore,
          telCalculated: tel,
          exerciseType: readingMode === 'skimming' ? 'rsvp' : 'reading_session'
      });
      onBack();
  };

  const submitQuiz = () => {
      if (!book.questions) return;
      let correct = 0;
      book.questions.forEach(q => {
          // Simple string match for answer ID logic (assuming option.text for now or ID)
          // In real app, we check ID. For this mock UI, let's assume quizAnswers stores ID.
          const selectedId = quizAnswers[q.id];
          const correctOption = q.options.find(o => o.isCorrect);
          if (correctOption && selectedId === correctOption.id) correct++;
      });
      
      const score = Math.round((correct / book.questions.length) * 100);
      finalizeSession(score);
  };

  const handleAiAssist = async () => {
      if(!aiQuery.trim()) return;
      setIsAiLoading(true);
      setAiResponse('');
      // Use Flash-Lite for speed
      const res = await getQuickDefinition(aiQuery);
      setAiResponse(res);
      setIsAiLoading(false);
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

  if (showQuiz && book.questions) {
      return (
          <div className="flex-1 flex flex-col p-6 bg-background-light dark:bg-background-dark animate-in slide-in-from-right">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Comprobación</h2>
              <div className="flex-1 overflow-y-auto space-y-8 pb-20">
                  {book.questions.map((q, idx) => (
                      <div key={q.id} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10">
                          <p className="font-bold text-lg mb-4 text-slate-900 dark:text-white">{idx+1}. {q.question}</p>
                          <div className="space-y-2">
                              {q.options.map(opt => (
                                  <label key={opt.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${quizAnswers[q.id] === opt.id ? 'bg-primary/10 border-primary' : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                      <input 
                                        type="radio" 
                                        name={`q-${q.id}`} 
                                        className="text-primary focus:ring-primary"
                                        checked={quizAnswers[q.id] === opt.id}
                                        onChange={() => setQuizAnswers({...quizAnswers, [q.id]: opt.id})}
                                      />
                                      <span className="ml-3 text-sm text-slate-700 dark:text-gray-200">{opt.text}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
              <button 
                onClick={submitQuiz}
                disabled={Object.keys(quizAnswers).length < book.questions.length}
                className="w-full h-14 bg-primary text-black font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  Verificar Respuestas
              </button>
          </div>
      )
  }

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
          
          <div className="flex gap-2">
             <button 
                onClick={() => setShowAiModal(true)}
                className="flex items-center justify-center size-10 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                title="AI Assist"
             >
                <span className="material-symbols-outlined">bolt</span>
             </button>
             <button 
                onClick={() => {
                    setReadingMode(readingMode === 'skimming' ? 'deep' : 'skimming');
                    setIsPlaying(false);
                }} 
                className={`flex items-center justify-center size-10 rounded-full transition-colors ${readingMode === 'deep' ? 'bg-primary text-black' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-white'}`}
                title="Cambiar Modo"
            >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{readingMode === 'skimming' ? 'menu_book' : 'bolt'}</span>
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
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
              {/* Sticky Timer */}
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
                        <p className="text-center text-gray-500 text-sm mb-4">
                            {book.questions ? "¿Listo para comprobar tu comprensión?" : "¿Terminaste de leer?"}
                        </p>
                        <button 
                            onClick={handleFinishButton} 
                            className="w-full py-4 bg-primary text-black font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            {book.questions ? "Realizar Test" : "Registrar Sesión"}
                        </button>
                    </div>
                 </div>
              </article>
          </div>
        )}
      </main>

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1A2C20] w-full max-w-sm rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">bolt</span> Asistente Rápido
                    </h3>
                    <button onClick={() => setShowAiModal(false)} className="text-gray-400"><span className="material-symbols-outlined">close</span></button>
                </div>
                
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Define una palabra..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 text-white text-sm"
                    />
                    <button 
                        onClick={handleAiAssist} 
                        disabled={isAiLoading}
                        className="bg-blue-600 text-white rounded-xl px-4 font-bold text-xs"
                    >
                        {isAiLoading ? '...' : 'Consultar'}
                    </button>
                </div>

                {aiResponse && (
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <p className="text-sm text-gray-200">{aiResponse}</p>
                        <p className="text-[10px] text-gray-500 mt-2 text-right">Gemini Flash-Lite</p>
                    </div>
                )}
            </div>
        </div>
      )}

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
          {book.questions && (
              <button onClick={handleFinishButton} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-colors">
                  Terminar y Evaluar
              </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default ReadingSession;
