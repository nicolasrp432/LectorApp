import React from 'react';
import { AppRoute } from '../types.ts';

interface AssessmentIntroProps {
  onNavigate: (route: AppRoute) => void;
  onBack: () => void;
}

const AssessmentIntro: React.FC<AssessmentIntroProps> = ({ onNavigate, onBack }) => {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
      {/* Top App Bar - Discreto */}
      <div className="flex items-center px-4 py-4 justify-between z-20">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
          aria-label="Volver"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
          <span className="material-symbols-outlined text-primary text-[14px]">verified_user</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Evaluación Científica</span>
        </div>
        <button 
          onClick={() => onNavigate(AppRoute.DASHBOARD)} 
          className="text-gray-400 dark:text-gray-500 text-xs font-medium hover:text-primary transition-colors"
        >
          Saltar
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center px-8 pt-2 pb-32 overflow-y-auto no-scrollbar z-10">
        
        {/* Hero Visual - Impactante y Simbólico */}
        <div className="w-full relative mb-10 mt-2">
          <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full opacity-40 transform scale-90"></div>
          <div className="relative flex flex-col items-center">
            <div className="size-28 bg-gradient-to-br from-[#1A2C20] to-[#112116] rounded-3xl border border-primary/30 flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
               <span className="material-symbols-outlined text-primary text-6xl drop-shadow-[0_0_15px_rgba(25,230,94,0.5)]">speed</span>
            </div>
            {/* Elementos decorativos de "radar" o "escaneo" */}
            <div className="absolute -z-10 size-40 border border-primary/10 rounded-full animate-[ping_3s_linear_infinite]"></div>
            <div className="absolute -z-10 size-56 border border-primary/5 rounded-full animate-[ping_4s_linear_infinite]"></div>
          </div>
        </div>

        {/* Headline con jerarquía clara */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold leading-tight text-gray-900 dark:text-white mb-3">
            Calibra tu <br/>
            <span className="text-primary bg-primary/5 px-2 rounded-lg">Perfil Lector</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
            Mide tu capacidad cognitiva actual para personalizar tu programa de entrenamiento.
          </p>
        </div>

        {/* Feature Cards - Beneficios Directos */}
        <div className="w-full space-y-4">
          <div className="group flex items-start gap-4 bg-white dark:bg-[#1A2C20] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:border-primary/30 active:scale-[0.98]">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">bar_chart</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Medición de WPM</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Determinamos tu velocidad base exacta (Palabras Por Minuto) y tu tasa de retención.</p>
            </div>
          </div>

          <div className="group flex items-start gap-4 bg-white dark:bg-[#1A2C20] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:border-primary/30 active:scale-[0.98]">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Algoritmo Adaptativo</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Ajustamos la dificultad de los ejercicios de supermemoria según tu rendimiento inicial.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Area - Siempre Visible y Prominente */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark dark:to-transparent pt-16 pb-8 px-8 z-30 pointer-events-none">
        <div className="flex flex-col items-center pointer-events-auto">
          {/* Time Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 border border-black/5 dark:border-white/10 mb-5 shadow-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Toma unos 2 minutos</span>
          </div>
          
          {/* Main Action Button */}
          <button
            onClick={() => onNavigate(AppRoute.ASSESSMENT_READING)}
            className="w-full bg-primary hover:bg-primary-dark active:scale-[0.95] transition-all text-[#112116] font-extrabold text-xl h-16 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(25,230,94,0.4)] group"
          >
            <span>Iniciar Test</span>
            <span className="material-symbols-outlined text-[24px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
      
      {/* Decorative Circles Overlay */}
      <div className="absolute bottom-[-10%] right-[-10%] size-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
    </div>
  );
};

export default AssessmentIntro;