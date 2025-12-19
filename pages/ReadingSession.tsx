
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Book, QuizQuestion, ReadingMode } from '../types';
import { generateReadingQuiz } from '../services/ai';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { PRACTICE_LIBRARY } from '../constants';
import { extractTextFromPdf } from '../utils/pdf';

interface ReadingSessionProps {
  onBack: () => void;
  initialBook?: Book;
  onComplete: (metrics: { 
      levelOrSpeed: number; 
      durationSeconds: number; 
      wpmCalculated: number; 
      comprehensionRate: number;
      telCalculated: number;
      exerciseType: ReadingMode;
  }) => void;
}

type SessionPhase = 'select' | 'config' | 'reading' | 'finish_options' | 'quiz_choice' | 'evaluation' | 'results';

const ReadingSession: React.FC<ReadingSessionProps> = ({ onBack, initialBook, onComplete }) => {
  const { books, addBook } = useAuth();
  const { showToast } = useToast();
  
  // Estados de flujo
  const [phase, setPhase] = useState<SessionPhase>(initialBook ? 'config' : 'select');
  const [selectedBook, setSelectedBook] = useState<Book | null>(initialBook || null);
  const [readingMode, setReadingMode] = useState<ReadingMode>('focal');
  const [speed, setSpeed] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  
  // Evaluación
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [finalScore, setFinalScore] = useState(0);
  
  // Tracking
  const startTimeRef = useRef<number>(0);
  const wordsReadRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const words = useMemo(() => {
    if (!selectedBook?.content) return [];
    return selectedBook.content.split(/\s+/).filter(w => w.length > 0);
  }, [selectedBook]);

  // Lógica de avance
  useEffect(() => {
    let timer: any;
    if (isPlaying && phase === 'reading') {
      const msPerWord = 60000 / speed;
      const step = readingMode === 'expansion' ? 4 : 1;
      
      timer = setInterval(() => {
        setWordIndex(prev => {
          if (prev >= words.length - step) {
            setIsPlaying(false);
            setPhase('finish_options');
            return prev;
          }
          wordsReadRef.current += step;
          return prev + step;
        });
      }, msPerWord * step);
    }
    return () => clearInterval(timer);
  }, [isPlaying, phase, speed, readingMode, words.length]);

  const startExercise = () => {
    setWordIndex(0);
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
    const duration = (Date.now() - startTimeRef.current) / 1000;
    const wpm = Math.round((wordsReadRef.current / duration) * 60) || speed;
    const tel = Math.round(wpm * (score / 100));

    onComplete({
      levelOrSpeed: speed,
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
        author: 'Mi Texto',
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

  // --- RENDERERS ---

  const renderFocalContent = () => {
    const word = words[wordIndex] || "";
    const pivotIdx = Math.max(0, Math.floor(word.length / 2) - 1);
    return (
      <div className="flex justify-center items-center h-48 w-full font-mono text-5xl md:text-7xl font-bold tracking-tight">
        <div className="flex-1 text-right text-slate-500 opacity-20">{word.slice(0, pivotIdx)}</div>
        <div className="text-primary w-[0.8em] text-center border-x border-primary/20 bg-primary/5">{word[pivotIdx]}</div>
        <div className="flex-1 text-left text-slate-500 opacity-20">{word.slice(pivotIdx + 1)}</div>
      </div>
    );
  };

  const renderBlockContent = (mode: 'campo_visual' | 'expansion') => {
    const visibleCount = 40;
    const start = Math.max(0, wordIndex - (wordIndex % visibleCount));
    const blockWords = words.slice(start, start + visibleCount);

    return (
      <div className="max-w-lg w-full p-8 bg-surface-dark/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] shadow-2xl flex flex-wrap gap-x-2 gap-y-3 justify-center items-center min-h-[300px]">
        {blockWords.map((w, idx) => {
          const globalIdx = start + idx;
          let isHigh = false;
          if (mode === 'campo_visual') isHigh = globalIdx === wordIndex;
          else isHigh = globalIdx >= wordIndex && globalIdx < wordIndex + 4;

          return (
            <span key={idx} className={`text-2xl transition-all duration-150 rounded px-1.5 py-0.5 ${isHigh ? 'bg-primary text-black font-bold scale-110 shadow-lg' : 'text-slate-500 opacity-20'}`}>
              {w}
            </span>
          );
        })}
      </div>
    );
  };

  if (phase === 'select') {
    return (
      <div className="flex flex-col h-full bg-background-dark animate-in fade-in">
        <header className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10"><span className="material-symbols-outlined">arrow_back</span></button>
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
                        className="flex items-center gap-5 p-5 bg-surface-dark border border-white/5 rounded-[2rem] hover:border-primary/50 transition-all cursor-pointer group shadow-lg"
                    >
                        <img src={book.coverUrl} className="w-14 h-18 object-cover rounded-xl shadow-lg" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg truncate">{book.title}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">{book.difficulty || 'Personal'}</p>
                        </div>
                        <span className="material-symbols-outlined text-gray-700 group-hover:text-primary transition-colors">play_circle</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  if (phase === 'config') {
    return (
      <div className="flex flex-col h-full bg-background-dark items-center justify-center p-8 animate-in zoom-in-95">
          <div className="w-full max-w-xs aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl mb-10 relative border border-white/5">
              <img src={selectedBook?.coverUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 p-8 flex flex-col justify-end">
                  <h2 className="text-3xl font-bold text-white leading-tight">{selectedBook?.title}</h2>
                  <p className="text-primary font-bold text-xs mt-2 uppercase tracking-widest">{selectedBook?.author}</p>
              </div>
          </div>
          <div className="w-full max-w-sm space-y-6">
              <div className="flex p-1 bg-white/5 rounded-2xl">
                  {(['focal', 'campo_visual', 'expansion'] as ReadingMode[]).map(m => (
                      <button 
                        key={m} onClick={() => setReadingMode(m)}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${readingMode === m ? 'bg-white text-black shadow-lg' : 'text-gray-500'}`}
                      >
                        <span className="material-symbols-outlined text-sm">{m === 'focal' ? 'center_focus_strong' : m === 'campo_visual' ? 'visibility' : 'open_in_full'}</span>
                        {m.replace('_', ' ')}
                      </button>
                  ))}
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">WPM Objetivo</span>
                      <span className="text-3xl font-bold text-primary font-mono">{speed}</span>
                  </div>
                  <input type="range" min="100" max="1000" step="50" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
              </div>
              <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setPhase('select')} fullWidth>Cambiar Texto</Button>
                  <Button onClick={startExercise} fullWidth>Iniciar</Button>
              </div>
          </div>
      </div>
    );
  }

  if (phase === 'reading' || phase === 'finish_options') {
    return (
      <div className="flex flex-col h-full bg-background-dark overflow-hidden relative">
        <header className="p-6 flex justify-between items-center z-10">
            <button onClick={() => { setIsPlaying(false); setPhase('config'); }} className="p-2 rounded-full hover:bg-white/10"><span className="material-symbols-outlined">close</span></button>
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-primary uppercase font-bold tracking-[0.3em] mb-1">{readingMode.replace('_', ' ')}</span>
                <h3 className="text-sm font-bold truncate max-w-[150px]">{selectedBook?.title}</h3>
            </div>
            <div className="w-10"></div>
        </header>

        {/* El área de contenido ocupa el centro, pero se ajusta el margen inferior para no colisionar */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 pb-40">
            <div className="w-full flex flex-col items-center justify-center animate-in fade-in duration-500">
               {readingMode === 'focal' && (
                  <div className="relative w-full flex flex-col items-center mt-12">
                    <div className="absolute top-0 bottom-0 w-px bg-primary/10 left-1/2 -translate-x-1/2"></div>
                    <div className="absolute left-0 right-0 h-px bg-primary/10 top-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10 w-full overflow-hidden">
                      {renderFocalContent()}
                    </div>
                    <p className="mt-8 text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Punto Focal Ergonómico</p>
                  </div>
               )}
               {readingMode !== 'focal' && (
                 <div className="mt-12 w-full flex justify-center">
                    {renderBlockContent(readingMode as any)}
                 </div>
               )}
            </div>
        </main>

        {/* Panel de Control REUBICADO a la parte inferior extrema */}
        <div className="absolute bottom-6 left-6 right-6 z-40">
            <div className="glass-panel rounded-[2.5rem] p-6 shadow-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(wordIndex / words.length) * 100}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                           <input type="range" min="100" max="1000" step="50" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-24 h-1 bg-white/10 rounded-full accent-primary appearance-none cursor-pointer" />
                           <span className="text-xl font-bold font-mono text-white">{speed} <span className="text-[10px] font-normal text-gray-500">WPM</span></span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)} 
                        className="size-16 rounded-3xl bg-primary text-black flex items-center justify-center shadow-[0_0_20px_rgba(25,230,94,0.4)] active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[42px] font-bold">{isPlaying ? 'pause' : 'play_arrow'}</span>
                    </button>
                </div>
                <div className="flex gap-2 mt-6">
                    <button onClick={startExercise} className="flex-1 py-4 rounded-2xl bg-white/5 text-[10px] font-bold uppercase text-gray-400 hover:bg-white/10 transition-colors">Reiniciar</button>
                    <button onClick={() => setPhase('quiz_choice')} className="flex-1 py-4 rounded-2xl bg-primary text-black text-[10px] font-bold uppercase shadow-lg active:scale-95 transition-all">Finalizar Entrenamiento</button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (phase === 'quiz_choice') {
    const hasPreset = selectedBook?.questions && selectedBook.questions.length > 0;
    return (
      <div className="flex flex-col h-full bg-background-dark items-center justify-center p-8 text-center animate-in zoom-in-95">
          <div className="size-20 bg-blue-500/20 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-500/30">
            <span className="material-symbols-outlined text-4xl text-blue-500">quiz</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Prueba de Comprensión</h2>
          <p className="text-sm text-gray-500 mb-10 max-w-xs leading-relaxed">Verifica cuánto has retenido antes de guardar tu sesión de hoy.</p>
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
      <div className="flex flex-col h-full bg-background-dark p-8 animate-in slide-in-from-bottom-8">
          {isGeneratingQuiz ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8 shadow-2xl shadow-primary/20"></div>
              <h2 className="text-2xl font-bold">IA trabajando...</h2>
              <p className="text-sm text-gray-500 mt-2">Creando preguntas inteligentes sobre el texto.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
               <h2 className="text-2xl font-bold mb-10 text-center">Evaluación</h2>
               <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                  {activeQuiz.map((q, idx) => (
                    <div key={q.id} className="bg-surface-dark p-6 rounded-[2rem] border border-white/5">
                      <p className="font-bold text-lg mb-6 leading-snug">{idx + 1}. {q.question}</p>
                      <div className="grid gap-3">
                        {q.options.map(opt => (
                          <button 
                            key={opt.id} onClick={() => setUserAnswers({...userAnswers, [q.id]: opt.id})}
                            className={`p-4 text-left text-sm rounded-2xl border-2 transition-all ${userAnswers[q.id] === opt.id ? 'border-primary bg-primary/10 font-bold' : 'border-white/5 text-gray-400 hover:bg-white/5'}`}
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
                    Finalizar Evaluación
                 </Button>
               </div>
            </div>
          )}
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="flex flex-col h-full bg-background-dark items-center justify-center p-8 text-center animate-in zoom-in-95">
          <div className="size-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 border-2 border-primary shadow-2xl">
              <span className="material-symbols-outlined text-6xl text-primary">emoji_events</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">¡Bien hecho!</h1>
          <p className="text-sm text-gray-500 mb-12">Tus métricas de eficiencia han sido actualizadas.</p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-12">
              <div className="bg-surface-dark p-5 rounded-3xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Velocidad</p>
                  <p className="text-2xl font-bold text-primary font-mono">{speed}</p>
              </div>
              <div className="bg-surface-dark p-5 rounded-3xl border border-white/5">
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
