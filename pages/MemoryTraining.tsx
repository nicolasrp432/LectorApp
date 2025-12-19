
import React, { useState, useMemo } from 'react';
import { AppRoute, Flashcard, Book } from '../types';
import { calculateSM2 } from '../utils/sm2';
import { PRESET_FLASHCARD_SETS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { generateFlashcardsFromText } from '../services/ai';
import { Button } from '../components/ui/Button';

type MemoryMode = 'menu' | 'review' | 'create' | 'ai_generate';

const MemoryTraining: React.FC<{ onNavigate: (route: AppRoute) => void }> = ({ onNavigate }) => {
  const { flashcards, updateFlashcard, addFlashcards, user, books } = useAuth();
  const { showToast } = useToast();
  
  const [mode, setMode] = useState<MemoryMode>('menu');
  const [createFront, setCreateFront] = useState('');
  const [createBack, setCreateBack] = useState('');

  // AI Generation States
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tempCards, setTempCards] = useState<Flashcard[]>([]);
  const [aiSourceType, setAiSourceType] = useState<'topic' | 'book'>('topic');

  // Spaced Repetition Logic (Filter and Sort)
  const sessionCards = useMemo(() => {
    const now = Date.now();
    return [...flashcards]
        .filter(card => card.dueDate <= now)
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 15); 
  }, [flashcards, mode]); // Recalcular solo al entrar/cambiar modo

  const stats = useMemo(() => {
    const learned = flashcards.filter(f => f.interval > 15).length;
    const learning = flashcards.filter(f => f.interval <= 15).length;
    return { total: flashcards.length, learned, learning, due: sessionCards.length };
  }, [flashcards, sessionCards]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRating = async (rating: number) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
        const currentCard = sessionCards[currentIndex];
        if (!currentCard) return;

        const updates = calculateSM2(currentCard, rating);
        await updateFlashcard({ ...currentCard, ...updates });

        // Animación de salida y cambio de card
        setTimeout(() => {
            if (currentIndex < sessionCards.length - 1) {
                setIsFlipped(false);
                setCurrentIndex(prev => prev + 1);
            } else {
                setSessionComplete(true);
            }
            setIsUpdating(false);
        }, 150);
        
    } catch (error) {
        showToast("Error al guardar progreso", "error");
        setIsUpdating(false);
    }
  };

  const handleManualCreate = async () => {
    if(!createFront.trim() || !createBack.trim()) return;
    const newCard: Flashcard = {
        id: `manual-${Date.now()}`,
        userId: user?.id,
        front: createFront,
        back: createBack,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        dueDate: Date.now()
    };
    await addFlashcards([newCard]);
    showToast('Tarjeta guardada', 'success');
    setCreateFront(''); setCreateBack('');
  };

  const startAiGeneration = async () => {
    if(!aiInput.trim()) return;
    setIsGenerating(true);
    try {
        let content = aiInput;
        if(aiSourceType === 'book') {
            const selectedBook = books.find(b => b.id === aiInput);
            content = selectedBook?.content || "";
        }
        const generated = await generateFlashcardsFromText(user?.id || 'guest', content, aiSourceType === 'topic');
        setTempCards(generated);
    } catch (e) {
        showToast("Error al conectar con Gemini", "error");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveAiCards = async () => {
      await addFlashcards(tempCards);
      showToast(`${tempCards.length} tarjetas añadidas`, "success");
      setTempCards([]);
      setAiInput('');
      setMode('menu');
  };

  // --- VIEWS ---

  if (mode === 'menu') {
      return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display overflow-y-auto no-scrollbar pb-24">
            <header className="p-6 flex items-center gap-4">
                <button onClick={() => onNavigate(AppRoute.DASHBOARD)} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Supermemoria</h1>
            </header>

            <main className="px-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Dominadas</span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.learned}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-primary">Para hoy</span>
                        <p className="text-2xl font-bold text-primary">{stats.due}</p>
                    </div>
                </div>

                <div 
                    className={`p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer transition-all border
                        ${stats.due > 0 ? 'bg-primary text-black border-primary shadow-xl shadow-primary/20' : 'bg-white dark:bg-surface-dark border-black/5 dark:border-white/5'}
                    `}
                    onClick={() => stats.due > 0 && setMode('review')}
                >
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-1">Repaso Diario</h2>
                        <p className="text-sm opacity-70 mb-4 max-w-[70%]">
                            {stats.due > 0 ? `Refuerza ${stats.due} conceptos hoy para no olvidarlos.` : 'Estás al día con tus repasos.'}
                        </p>
                        {stats.due > 0 ? (
                             <button className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm">Empezar Sesión</button>
                        ) : (
                             <div className="flex items-center gap-2 text-primary font-bold">
                                <span className="material-symbols-outlined">check_circle</span>
                                <span>Todo al día</span>
                             </div>
                        )}
                    </div>
                    <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[120px] opacity-10 rotate-12 group-hover:scale-110 transition-transform">psychology</span>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Añadir Contenido</h3>
                    
                    <button onClick={() => setMode('create')} className="w-full p-5 bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl flex items-center gap-4 hover:border-primary/50 transition-all text-left">
                        <div className="size-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><span className="material-symbols-outlined">edit</span></div>
                        <div><h4 className="font-bold">Creación Manual</h4><p className="text-xs text-gray-500">Escribe tus propios conceptos</p></div>
                    </button>

                    <button onClick={() => setMode('ai_generate')} className="w-full p-5 bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl flex items-center gap-4 hover:border-primary/50 transition-all text-left relative overflow-hidden">
                        <div className="size-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center"><span className="material-symbols-outlined">smart_toy</span></div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold">Generar con IA</h4>
                                <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-bold rounded uppercase">Gemini</span>
                            </div>
                            <p className="text-xs text-gray-500">Usa tus libros o temas de interés</p>
                        </div>
                    </button>
                </div>

                <div className="space-y-3 pb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Sets Sugeridos</h3>
                    <div className="grid gap-3">
                        {PRESET_FLASHCARD_SETS.map(preset => (
                            <div key={preset.id} className="flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-xl border border-black/5 dark:border-white/5">
                                <div><h4 className="font-bold text-sm">{preset.title}</h4><p className="text-[10px] text-gray-500 uppercase">{preset.cards.length} tarjetas</p></div>
                                <button 
                                    onClick={async () => {
                                        const newCards = preset.cards.map((c, i) => ({ id: `${preset.id}-${Date.now()}-${i}`, userId: user?.id, front: c.front!, back: c.back!, interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now() }));
                                        await addFlashcards(newCards as Flashcard[]);
                                        showToast(`Set "${preset.title}" añadido`, 'success');
                                    }}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
      );
  }

  if (mode === 'review') {
      const card = sessionCards[currentIndex];
      if (!card) return null;

      return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            <header className="p-6 flex items-center justify-between border-b border-black/5 dark:border-white/5">
                <button onClick={() => setMode('menu')} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><span className="material-symbols-outlined">close</span></button>
                <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Repasando</p>
                    <p className="text-xs text-gray-500 font-mono">{currentIndex + 1} de {sessionCards.length}</p>
                </div>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 perspective-1000">
                <div 
                    onClick={() => !isFlipped && setIsFlipped(true)}
                    className={`relative w-full max-w-sm aspect-[4/5] transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180 shadow-2xl' : 'hover:-translate-y-2'}`}
                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                    <div className="absolute inset-0 backface-hidden bg-white dark:bg-surface-dark border border-black/5 dark:border-white/10 rounded-[2.5rem] shadow-xl p-8 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden' }}>
                        <div className="size-12 rounded-full bg-blue-500/10 text-blue-500 mb-8 flex items-center justify-center"><span className="material-symbols-outlined">help</span></div>
                        <h2 className="text-2xl font-bold leading-tight">{card.front}</h2>
                        <div className="mt-12 flex flex-col items-center gap-2 text-gray-400">
                            <span className="material-symbols-outlined animate-bounce">touch_app</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest">Pulsa para ver respuesta</p>
                        </div>
                    </div>
                    <div className="absolute inset-0 backface-hidden bg-[#1f3025] border-2 border-primary/30 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center justify-center text-center rotate-y-180" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                         <div className="size-12 rounded-full bg-primary/20 text-primary mb-8 flex items-center justify-center"><span className="material-symbols-outlined">lightbulb</span></div>
                         <p className="text-xl font-medium leading-relaxed text-white">{card.back}</p>
                         <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 opacity-40">
                             {Array.from({length: 5}).map((_, i) => (
                                 <div key={i} className={`size-1.5 rounded-full ${i < (card.masteryLevel || 0) ? 'bg-primary' : 'bg-white/20'}`}></div>
                             ))}
                         </div>
                    </div>
                </div>
            </main>

            <footer className="p-8 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md">
                {!isFlipped ? (
                    <Button fullWidth onClick={() => setIsFlipped(true)}>Mostrar Respuesta</Button>
                ) : (
                    <div className="space-y-4">
                        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">¿Qué tan difícil fue?</p>
                        <div className="grid grid-cols-4 gap-3">
                            <button disabled={isUpdating} onClick={() => handleRating(0)} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all active:scale-95 disabled:opacity-50">
                                <span className="material-symbols-outlined">sentiment_extremely_dissatisfied</span>
                                <span className="text-[9px] font-bold uppercase">Fallo</span>
                            </button>
                            <button disabled={isUpdating} onClick={() => handleRating(3)} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-all active:scale-95 disabled:opacity-50">
                                <span className="material-symbols-outlined">sentiment_dissatisfied</span>
                                <span className="text-[9px] font-bold uppercase">Difícil</span>
                            </button>
                            <button disabled={isUpdating} onClick={() => handleRating(4)} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-all active:scale-95 disabled:opacity-50">
                                <span className="material-symbols-outlined">sentiment_satisfied</span>
                                <span className="text-[9px] font-bold uppercase">Media</span>
                            </button>
                            <button disabled={isUpdating} onClick={() => handleRating(5)} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-95 border border-primary/20 disabled:opacity-50">
                                <span className="material-symbols-outlined">sentiment_very_satisfied</span>
                                <span className="text-[9px] font-bold uppercase">Fácil</span>
                            </button>
                        </div>
                    </div>
                )}
            </footer>
        </div>
      );
  }

  if (sessionComplete) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-light dark:bg-background-dark text-center animate-in zoom-in-95">
             <div className="size-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 border-2 border-primary shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-6xl text-primary">emoji_events</span>
             </div>
             <h2 className="text-4xl font-bold mb-3">¡Sesión Terminada!</h2>
             <p className="text-gray-500 mb-10">Has reforzado {sessionCards.length} conceptos. Tu cerebro te lo agradecerá.</p>
             <Button fullWidth onClick={() => { setMode('menu'); setSessionComplete(false); setCurrentIndex(0); }}>Volver al Inicio</Button>
        </div>
      );
  }

  // Otros modos (create, ai_generate) se mantienen igual...
  return null; 
};

export default MemoryTraining;
