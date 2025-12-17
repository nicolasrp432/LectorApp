import React, { useState, useMemo } from 'react';
import { AppRoute, Flashcard } from '../types';
import { calculateSM2 } from '../utils/sm2';
import { PRESET_FLASHCARD_SETS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface MemoryTrainingProps {
  onNavigate: (route: AppRoute) => void;
  flashcards: Flashcard[];
  onUpdateCard: (updatedCard: Flashcard) => void;
}

const MemoryTraining: React.FC<MemoryTrainingProps> = ({ onNavigate, flashcards, onUpdateCard }) => {
  const { addFlashcards, user } = useAuth();
  const { showToast } = useToast();
  
  const [mode, setMode] = useState<'menu' | 'review' | 'create'>('menu');
  const [createFront, setCreateFront] = useState('');
  const [createBack, setCreateBack] = useState('');

  // FILTER LOGIC: Spaced Repetition (Prioritize overdue cards)
  const sessionCards = useMemo(() => {
    const now = Date.now();
    // Sort by due date (overdue first)
    return [...flashcards]
        .filter(card => card.dueDate <= now)
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 15); // Limit session size for micro-learning
  }, [flashcards]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const handleRating = (rating: number) => {
    const currentCard = sessionCards[currentIndex];
    const updates = calculateSM2(currentCard, rating);
    onUpdateCard({ ...currentCard, ...updates });

    if (currentIndex < sessionCards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
    } else {
        setSessionComplete(true);
    }
  };

  const handleCreateCard = async () => {
      if(!createFront.trim() || !createBack.trim()) return;
      
      const newCard: Flashcard = {
          id: `custom-${Date.now()}`,
          userId: user?.id,
          front: createFront,
          back: createBack,
          interval: 0,
          repetition: 0,
          efactor: 2.5,
          dueDate: Date.now()
      };
      
      await addFlashcards([newCard]);
      showToast('Tarjeta creada. ¡A repasar!', 'success');
      setCreateFront('');
      setCreateBack('');
  };

  const handleLoadPreset = async (presetId: string) => {
      const preset = PRESET_FLASHCARD_SETS.find(p => p.id === presetId);
      if(!preset) return;

      const newCards = preset.cards.map((c, i) => ({
          id: `${presetId}-${Date.now()}-${i}`,
          userId: user?.id,
          front: c.front!,
          back: c.back!,
          interval: 0,
          repetition: 0,
          efactor: 2.5,
          dueDate: Date.now()
      }));

      await addFlashcards(newCards as Flashcard[]);
      showToast(`Set "${preset.title}" añadido a tu mazo.`, 'success');
  };

  // --- VIEW: MENU ---
  if (mode === 'menu') {
      return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display p-6 overflow-y-auto no-scrollbar">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => onNavigate(AppRoute.DASHBOARD)} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Supermemoria</h1>
            </header>

            <div className="space-y-6">
                {/* SRS Review Action */}
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group cursor-pointer" onClick={() => setMode('review')}>
                    <div className="absolute right-0 top-0 p-6 opacity-20 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-8xl text-primary">style</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Repaso Diario</h2>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-4 max-w-[70%]">
                        {sessionCards.length > 0 
                            ? `Tienes ${sessionCards.length} tarjetas listas para reforzar.` 
                            : "Estás al día. ¡Buen trabajo!"}
                    </p>
                    <button className="bg-primary text-black font-bold px-6 py-2 rounded-lg text-sm shadow-lg hover:bg-primary-dark transition-colors" disabled={sessionCards.length === 0}>
                        {sessionCards.length > 0 ? 'Comenzar Sesión' : 'Repasar Todo'}
                    </button>
                </div>

                {/* Create New */}
                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 rounded-2xl p-6 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setMode('create')}>
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <span className="material-symbols-outlined">add</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Crear Tarjeta</h3>
                            <p className="text-xs text-gray-500">Añade tus propios conceptos.</p>
                        </div>
                    </div>
                </div>

                {/* Presets */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 px-1">Sets Predefinidos</h3>
                    <div className="space-y-3">
                        {PRESET_FLASHCARD_SETS.map(preset => (
                            <div key={preset.id} className="flex items-center justify-between bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 p-4 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{preset.title}</h4>
                                    <p className="text-xs text-gray-500">{preset.cards.length} tarjetas</p>
                                </div>
                                <button onClick={() => handleLoadPreset(preset.id)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined">download</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- VIEW: CREATE ---
  if (mode === 'create') {
      return (
          <div className="flex-1 flex flex-col p-6 bg-background-light dark:bg-background-dark">
              <header className="flex items-center gap-4 mb-6">
                <button onClick={() => setMode('menu')} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold">Nueva Tarjeta</h1>
            </header>
            
            <div className="space-y-4 flex-1">
                <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Pregunta (Frente)</label>
                    <textarea 
                        className="w-full h-32 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl p-4 resize-none focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Escribe el concepto a recordar..."
                        value={createFront}
                        onChange={(e) => setCreateFront(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Respuesta (Dorso)</label>
                    <textarea 
                        className="w-full h-32 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl p-4 resize-none focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Escribe la explicación..."
                        value={createBack}
                        onChange={(e) => setCreateBack(e.target.value)}
                    />
                </div>
            </div>

            <button 
                onClick={handleCreateCard}
                disabled={!createFront || !createBack}
                className="w-full py-4 bg-primary text-black font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Guardar Tarjeta
            </button>
          </div>
      )
  }

  // --- VIEW: REVIEW (SESSION COMPLETE) ---
  if (sessionComplete) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark text-center animate-in zoom-in-95">
             <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(25,230,94,0.3)]">
                <span className="material-symbols-outlined text-5xl text-primary">psychology_alt</span>
             </div>
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sesión Completada</h2>
             <p className="text-slate-500 dark:text-gray-400 mb-8">
                Has repasado {sessionCards.length} conceptos.
             </p>
             <button onClick={() => setMode('menu')} className="w-full max-w-xs px-6 py-4 bg-primary text-background-dark rounded-xl font-bold shadow-lg">
                Volver al Menú
             </button>
        </div>
      );
  }

  // --- VIEW: REVIEW (ACTIVE) ---
  const currentCard = sessionCards[currentIndex];
  // If no cards are due but user clicked review (edge case handling)
  if (!currentCard) {
       return (
           <div className="flex-1 flex flex-col items-center justify-center p-6">
               <p className="text-gray-500 mb-4">No hay tarjetas pendientes.</p>
               <button onClick={() => setMode('menu')} className="text-primary font-bold">Volver</button>
           </div>
       )
  }

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden relative">
      {/* Review Header */}
      <header className="flex items-center justify-between px-4 py-4 z-10">
        <button onClick={() => setMode('menu')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Repaso Espaciado</span>
            <span className="text-xs text-gray-500">{currentIndex + 1} / {sessionCards.length}</span>
        </div>
        <div className="w-10"></div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-white/5">
        <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${((currentIndex) / sessionCards.length) * 100}%` }}
        ></div>
      </div>

      {/* Card Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 perspective-1000">
         <div 
            className={`relative w-full max-w-xs aspect-[3/4] transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
         >
            {/* Front */}
            <div 
                className="absolute inset-0 backface-hidden bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: 'hidden' }}
            >
                <div className="mb-6 size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <span className="material-symbols-outlined text-2xl">help</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                    {currentCard.front}
                </h3>
                <p className="mt-8 text-sm text-gray-400 font-medium uppercase tracking-widest">Toca para Voltear</p>
            </div>

            {/* Back */}
            <div 
                className="absolute inset-0 backface-hidden bg-[#1f3025] border border-primary/20 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center rotate-y-180"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
                 <div className="mb-6 size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">lightbulb</span>
                </div>
                <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
                    {currentCard.back}
                </p>
            </div>
         </div>
      </main>

      {/* Controls (SM-2 Ratings) */}
      <div className="p-6 pb-8">
        {!isFlipped ? (
            <button 
                onClick={() => setIsFlipped(true)}
                className="w-full py-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 font-bold text-slate-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
                Mostrar Respuesta
            </button>
        ) : (
            <div className="grid grid-cols-4 gap-3">
                <button onClick={() => handleRating(0)} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors">
                    <span className="text-lg font-bold">Fallé</span>
                    <span className="text-[10px] uppercase font-bold opacity-70">1m</span>
                </button>
                <button onClick={() => handleRating(3)} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-colors">
                    <span className="text-lg font-bold">Dudé</span>
                    <span className="text-[10px] uppercase font-bold opacity-70">2d</span>
                </button>
                <button onClick={() => handleRating(4)} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors">
                    <span className="text-lg font-bold">Bien</span>
                    <span className="text-[10px] uppercase font-bold opacity-70">4d</span>
                </button>
                <button onClick={() => handleRating(5)} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
                    <span className="text-lg font-bold">Fácil</span>
                    <span className="text-[10px] uppercase font-bold opacity-70">7d</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default MemoryTraining;