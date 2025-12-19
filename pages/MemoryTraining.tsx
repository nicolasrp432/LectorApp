
import React, { useState, useMemo, useEffect } from 'react';
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

  // Session State - Fixed list for the current session to avoid disappearing cards
  const [activeSessionCards, setActiveSessionCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate how many cards are due for the menu display
  const dueCount = useMemo(() => {
    const now = Date.now();
    return flashcards.filter(card => card.dueDate <= now).length;
  }, [flashcards]);

  const stats = useMemo(() => {
    const learned = flashcards.filter(f => f.interval > 15).length;
    const learning = flashcards.filter(f => f.interval <= 15).length;
    return { total: flashcards.length, learned, learning, due: dueCount };
  }, [flashcards, dueCount]);

  // Start the review session with a frozen list of cards
  const startReviewSession = () => {
    const now = Date.now();
    const cardsToReview = [...flashcards]
        .filter(card => card.dueDate <= now)
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 15);
    
    if (cardsToReview.length > 0) {
        setActiveSessionCards(cardsToReview);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionComplete(false);
        setMode('review');
    } else {
        showToast("No hay tarjetas pendientes para hoy", "info");
    }
  };

  const handleRating = async (quality: number) => {
    if (isUpdating || sessionComplete) return;
    setIsUpdating(true);
    
    try {
        const currentCard = activeSessionCards[currentIndex];
        if (!currentCard) return;

        // Calculate new SRS data
        const updates = calculateSM2(currentCard, quality);
        const updatedCard = { ...currentCard, ...updates };
        
        // Persist to global state and DB
        await updateFlashcard(updatedCard);

        // Advance to next or finish
        setTimeout(() => {
            if (currentIndex < activeSessionCards.length - 1) {
                setIsFlipped(false);
                setCurrentIndex(prev => prev + 1);
            } else {
                setSessionComplete(true);
            }
            setIsUpdating(false);
        }, 300);
        
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

  const handleImportPreset = async (preset: typeof PRESET_FLASHCARD_SETS[0]) => {
      const existingFronts = new Set(flashcards.map(f => f.front.toLowerCase()));
      const newCards: Flashcard[] = preset.cards
        .filter(c => !existingFronts.has(c.front?.toLowerCase() || ""))
        .map((c, i) => ({
            id: `preset-${preset.id}-${Date.now()}-${i}`,
            userId: user?.id,
            front: c.front || "",
            back: c.back || "",
            interval: 0,
            repetition: 0,
            efactor: 2.5,
            dueDate: Date.now()
        }));

      if (newCards.length === 0) {
          showToast("Este mazo ya está en tu colección", "info");
          return;
      }

      await addFlashcards(newCards);
      showToast(`¡Mazo "${preset.title}" añadido!`, "success");
  };

  const handleSaveAiCards = async () => {
    if (tempCards.length === 0) return;
    try {
        await addFlashcards(tempCards);
        showToast(`${tempCards.length} tarjetas añadidas`, 'success');
        setTempCards([]);
        setMode('menu');
    } catch (error) {
        showToast("Error al guardar tarjetas", "error");
    }
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

  if (sessionComplete) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-light dark:bg-background-dark text-center animate-in zoom-in-95">
           <div className="size-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 border-2 border-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-6xl text-primary">emoji_events</span>
           </div>
           <h2 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white">¡Sesión Terminada!</h2>
           <p className="text-gray-500 mb-10">Has reforzado {activeSessionCards.length} conceptos. Tu cerebro te lo agradecerá.</p>
           
           <div className="w-full max-w-xs space-y-4">
               <Button fullWidth onClick={startReviewSession} leftIcon="replay">Volver a Intentar</Button>
               <Button variant="secondary" fullWidth onClick={() => { setMode('menu'); setSessionComplete(false); }}>Salir al Menú</Button>
           </div>
      </div>
    );
  }

  if (mode === 'menu') {
      return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display overflow-y-auto no-scrollbar pb-32">
            <header className="p-6 flex items-center gap-4 sticky top-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md z-20">
                <button onClick={() => onNavigate(AppRoute.DASHBOARD)} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Supermemoria</h1>
            </header>

            <main className="px-6 space-y-8 mt-2">
                {/* Stats Grid */}
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

                {/* Main Action Card */}
                <div 
                    className={`p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer transition-all border
                        ${stats.due > 0 ? 'bg-primary text-black border-primary shadow-xl shadow-primary/20' : 'bg-white dark:bg-surface-dark border-black/5 dark:border-white/5'}
                    `}
                    onClick={() => stats.due > 0 && startReviewSession()}
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

                {/* Librería de Mazos (NEW) */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Librería de Mazos</h3>
                    <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
                        {PRESET_FLASHCARD_SETS.map(preset => (
                            <button 
                                key={preset.id}
                                onClick={() => handleImportPreset(preset)}
                                className="shrink-0 w-40 bg-white dark:bg-surface-dark p-4 rounded-2xl border border-black/5 dark:border-white/5 text-left hover:border-primary/50 transition-all active:scale-95 group"
                            >
                                <div className={`size-10 ${preset.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined text-xl">{preset.icon}</span>
                                </div>
                                <h4 className="font-bold text-xs leading-tight mb-1">{preset.title}</h4>
                                <p className="text-[9px] text-gray-500 uppercase font-bold">{preset.cards.length} tarjetas</p>
                            </button>
                        ))}
                    </div>
                </section>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Añadir Propio</h3>
                    
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
            </main>
        </div>
      );
  }

  if (mode === 'review') {
      const card = activeSessionCards[currentIndex];
      
      if (!card) return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-light dark:bg-background-dark text-center">
              <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Cargando sesión...</p>
          </div>
      );

      return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden pb-16">
            <header className="p-6 flex items-center justify-between border-b border-black/5 dark:border-white/5">
                <button onClick={() => setMode('menu')} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><span className="material-symbols-outlined">close</span></button>
                <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Repasando</p>
                    <p className="text-xs text-gray-500 font-mono">{currentIndex + 1} de {activeSessionCards.length}</p>
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
                        <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">{card.front}</h2>
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

  // --- MODO CREACIÓN MANUAL ---
  if (mode === 'create') {
    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark pb-20">
            <header className="p-6 flex items-center gap-4">
                <button onClick={() => setMode('menu')} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><span className="material-symbols-outlined">arrow_back</span></button>
                <h1 className="text-2xl font-bold">Crear Tarjeta</h1>
            </header>
            <main className="p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Frente (Concepto/Pregunta)</label>
                    <textarea 
                        value={createFront}
                        onChange={(e) => setCreateFront(e.target.value)}
                        className="w-full h-32 bg-white dark:bg-surface-dark border border-black/10 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Ej: ¿Qué es la neuroplasticidad?"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Dorso (Respuesta/Explicación)</label>
                    <textarea 
                        value={createBack}
                        onChange={(e) => setCreateBack(e.target.value)}
                        className="w-full h-32 bg-white dark:bg-surface-dark border border-black/10 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Ej: La capacidad del cerebro para reorganizar sus conexiones..."
                    />
                </div>
                <Button fullWidth onClick={handleManualCreate} disabled={!createFront || !createBack}>Guardar Tarjeta</Button>
            </main>
        </div>
    );
  }

  // --- MODO GENERACIÓN IA ---
  if (mode === 'ai_generate') {
      return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark pb-20">
            <header className="p-6 flex items-center gap-4">
                <button onClick={() => setMode('menu')} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><span className="material-symbols-outlined">arrow_back</span></button>
                <h1 className="text-2xl font-bold">Generador IA</h1>
            </header>
            
            <main className="p-6 flex-1 overflow-y-auto no-scrollbar pb-24">
                {tempCards.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase">Tarjetas Propuestas ({tempCards.length})</h3>
                        {tempCards.map((c, i) => (
                            <div key={i} className="bg-white dark:bg-surface-dark border border-white/5 p-4 rounded-xl">
                                <p className="text-xs font-bold text-gray-500 mb-1">Frente: {c.front}</p>
                                <p className="text-sm text-slate-900 dark:text-gray-300">Dorso: {c.back}</p>
                            </div>
                        ))}
                        <div className="flex gap-3 pt-4">
                            <Button variant="secondary" fullWidth onClick={() => setTempCards([])}>Descartar</Button>
                            <Button fullWidth onClick={handleSaveAiCards}>Guardar Todas</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="bg-purple-500/10 p-6 rounded-[2rem] border border-purple-500/20">
                            <h3 className="text-lg font-bold text-purple-500 mb-2">Poder de Gemini 3</h3>
                            <p className="text-sm text-gray-500">Introduce un tema o elige un libro y la IA extraerá los conceptos más importantes por ti.</p>
                        </div>

                        <div className="flex p-1 bg-black/10 rounded-xl">
                            <button onClick={() => setAiSourceType('topic')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${aiSourceType === 'topic' ? 'bg-white dark:bg-surface-dark shadow-sm' : 'text-gray-500'}`}>Por Tema</button>
                            <button onClick={() => setAiSourceType('book')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${aiSourceType === 'book' ? 'bg-white dark:bg-surface-dark shadow-sm' : 'text-gray-500'}`}>De un Libro</button>
                        </div>

                        {aiSourceType === 'topic' ? (
                            <textarea 
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                className="w-full h-32 bg-white dark:bg-surface-dark border border-black/10 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Escribe un tema: Ej. Mitología Griega, React Hooks, Historia de Roma..."
                            />
                        ) : (
                            <div className="space-y-3">
                                {books.map(b => (
                                    <button 
                                        key={b.id} 
                                        onClick={() => setAiInput(b.id)}
                                        className={`w-full p-4 rounded-xl border text-left transition-all ${aiInput === b.id ? 'border-primary bg-primary/10' : 'border-black/10'}`}
                                    >
                                        <h4 className="font-bold text-sm">{b.title}</h4>
                                    </button>
                                ))}
                                {books.length === 0 && <p className="text-center text-xs text-gray-500">Importa un libro en la librería primero.</p>}
                            </div>
                        )}

                        <Button fullWidth onClick={startAiGeneration} isLoading={isGenerating} disabled={!aiInput}>Generar Tarjetas</Button>
                    </div>
                )}
            </main>
        </div>
      );
  }

  return null; 
};

export default MemoryTraining;
