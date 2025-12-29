
import React, { useEffect, useState } from 'react';
import { AppRoute } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface AssessmentResultsProps {
  wpm: number;
  comprehension: number;
  onContinue: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({ wpm, comprehension, onContinue }) => {
  const { user, updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const tel = Math.round(wpm * (comprehension / 100));
  
  const getLevelLabel = (t: number) => {
    if (t > 400) return "Maestro Cognitivo";
    if (t > 250) return "Lector Ágil";
    if (t > 150) return "Lector Promedio";
    return "Iniciado";
  };

  const level = getLevelLabel(tel);

  const handleAction = async () => {
    if (user && user.id !== 'guest') {
      setIsUpdating(true);
      try {
        // Sincronización robusta con el nuevo esquema de stats y preferencias
        await updateUser({
          baselineWPM: wpm,
          level: level,
          stats: {
            ...user.stats,
            tel: tel,
            lastActiveDate: Date.now(),
            xp: user.stats.xp + 100 // Premio por completar el test
          },
          preferences: {
            ...user.preferences,
            targetWPM: Math.max(300, wpm + 100),
            difficultyLevel: tel > 250 ? 'Intermedio' : 'Básico'
          }
        });
        onContinue();
      } catch (error) {
        console.error("Error actualizando perfil tras test:", error);
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Guardar en persistencia temporal si es invitado/nuevo
      localStorage.setItem('pending_assessment', JSON.stringify({ wpm, comprehension, tel, level }));
      onContinue();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-background-light dark:bg-background-dark p-6 overflow-y-auto no-scrollbar">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative size-24 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-background-dark">
                <span className="material-symbols-outlined text-5xl text-black">emoji_events</span>
            </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">¡Análisis Completado!</h1>
        <p className="text-slate-500 dark:text-gray-400 text-center mb-8">Tu perfil cognitivo ha sido actualizado.</p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
            <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10 flex flex-col items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Velocidad</span>
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{wpm}</span>
                <span className="text-xs text-primary">WPM</span>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10 flex flex-col items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Comprensión</span>
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{comprehension}%</span>
                <span className="text-xs text-blue-400">Precisión</span>
            </div>
            <div className="col-span-2 bg-[#1A2C20] rounded-2xl p-6 border border-primary/20 flex flex-col items-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <span className="material-symbols-outlined text-6xl text-primary">psychology</span>
                </div>
                <span className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Tu Nivel Sugerido</span>
                <span className="text-3xl font-bold text-white mb-1">{level}</span>
                <span className="text-xs text-gray-400">Eficiencia Lectora (TEL): {tel}</span>
            </div>
        </div>

        <button 
            onClick={handleAction}
            disabled={isUpdating}
            className="w-full max-w-sm h-14 bg-primary text-black font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(25,230,94,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
            {isUpdating ? <span className="size-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span> : <span>Continuar</span>}
        </button>
      </div>
    </div>
  );
};

export default AssessmentResults;
