import React from 'react';
import { Achievement } from '../types.ts';

interface AchievementModalProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ achievement, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1A2C20] rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-primary/20 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Confetti / Ray Effect Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,#19e65e10_0deg,transparent_60deg,transparent_300deg,#19e65e10_360deg)] animate-[spin_4s_linear_infinite] pointer-events-none"></div>

        <div className="relative z-10">
            <div className="size-24 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/40 animate-bounce">
                <span className="material-symbols-outlined text-6xl text-background-dark">{achievement.icon}</span>
            </div>
            
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">¡Nuevo Logro Desbloqueado!</h3>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{achievement.title}</h2>
            <p className="text-slate-500 dark:text-gray-300 mb-8 leading-relaxed">{achievement.description}</p>
            
            <button 
                onClick={onClose} 
                className="w-full py-4 rounded-xl font-bold bg-primary text-background-dark hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 active:scale-95 transition-transform"
            >
                ¡Genial!
            </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;