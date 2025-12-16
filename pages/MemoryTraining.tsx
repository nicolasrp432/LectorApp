import React, { useState, useMemo } from 'react';
import { AppRoute, Flashcard } from '../types';
import { calculateSM2 } from '../utils/sm2';

interface MemoryTrainingProps {
  onNavigate: (route: AppRoute) => void;
  flashcards: Flashcard[];
  onUpdateCard: (updatedCard: Flashcard) => void;
}

const MemoryTraining: React.FC<MemoryTrainingProps> = ({ onNavigate, flashcards, onUpdateCard }) => {
  // Filter due cards
  const dueCards = useMemo(() => {
    const now = Date.now();
    return flashcards.filter(card => card.dueDate <= now);
  }, [flashcards]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // If no cards are due (or empty list)
  if (dueCards.length === 0 && !sessionComplete) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark text-center">
             <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-primary">check_circle</span>
             </div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Todo al día!</h2>
             <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-xs">
                Has repasado todos tus conceptos clave por ahora. El algoritmo programará más para más tarde.
             </p>
             <button onClick={() => onNavigate(AppRoute.DASHBOARD)} className="px-8 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white">
                Volver al Inicio
             </button>
        </div>
    );
  }

  const currentCard = dueCards[currentIndex];

  const handleRating = (rating: number) => {
    // 1. Calculate new state via SM-2
    const updates = calculateSM2(currentCard, rating);
    const updatedCard = { ...currentCard, ...updates };

    // 2. Propagate update to App state
    onUpdateCard(updatedCard);

    // 3. Move to next
    if (currentIndex < dueCards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
    } else {
        setSessionComplete(true);
    }
  };

  if (sessionComplete) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark text-center animate-in zoom-in-95">
             <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(25,230,94,0.3)]">
                <span className="material-symbols-outlined text-5xl text-primary">psychology_alt</span>
             </div>
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sesión Completada</h2>
             <p className="text-slate-500 dark:text-gray-400 mb-8">
                Tus rutas neuronales han sido fortalecidas.
             </p>
             <div className="flex gap-4 w-full max-w-xs">
                <button onClick={() => onNavigate(AppRoute.DASHBOARD)} className="flex-1 px-6 py-4 bg-primary text-background-dark rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                    Finalizar
                </button>
             </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 z-10">
        <button onClick={() => onNavigate(AppRoute.DASHBOARD)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
            <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Supermemoria</span>
            <span className="text-xs text-gray-500">{currentIndex + 1} / {dueCards.length}</span>
        </div>
        <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-white/5">
        <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${((currentIndex) / dueCards.length) * 100}%` }}
        ></div>
      </div>

      {/* Card Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 perspective-1000">
         <div 
            className={`relative w-full max-w-xs aspect-[3/4] transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
         >
            {/* Front (Question) */}
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

            {/* Back (Answer) */}
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
                    <span className="text-lg font-bold">Otra vez</span>
                    <span className="text-[10px] uppercase font-bold opacity-70">&lt; 1m</span>
                </button>
                <button onClick={() => handleRating(3)} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-colors">
                    <span className="text-lg font-bold">Difícil</span>
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