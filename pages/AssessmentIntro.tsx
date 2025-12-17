import React from 'react';
import { AppRoute } from '../types';

interface AssessmentIntroProps {
  onNavigate: (route: AppRoute) => void;
  onBack: () => void;
}

const AssessmentIntro: React.FC<AssessmentIntroProps> = ({ onNavigate, onBack }) => {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <div className="flex items-center px-4 py-4 justify-between z-10">
        <div className="w-12 flex items-center justify-start">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <h2 className="text-sm font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">Evaluación Inicial</h2>
        <div className="flex w-12 items-center justify-end">
          <button onClick={() => onNavigate(AppRoute.DASHBOARD)} className="text-gray-400 dark:text-gray-500 text-sm font-medium hover:text-primary transition-colors">Saltar</button>
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-24 overflow-y-auto no-scrollbar">
        {/* Hero Image / Visual */}
        <div className="w-full relative mb-8 mt-4 group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-30 transform scale-75 group-hover:scale-90 transition-transform duration-700"></div>
          <div className="relative w-full aspect-[4/3] bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex items-center justify-center shadow-lg">
            <div
                className="bg-center bg-no-repeat bg-cover w-full h-full opacity-80"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1516574187841-69301905a304?q=80&w=600&auto=format&fit=crop")' }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent dark:from-background-dark"></div>
            {/* Floating Icon Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface-light dark:bg-[#1f3626] border border-gray-100 dark:border-white/10 p-4 rounded-full shadow-xl">
              <span className="material-symbols-outlined text-primary text-4xl">speed</span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold leading-tight text-center text-gray-900 dark:text-white mb-4">
          Calibra tu <span className="text-primary">Perfil Lector</span>
        </h1>

        {/* Body Text */}
        <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-relaxed text-center mb-8 max-w-xs mx-auto">
          Para construir tu supermemoria, primero necesitamos medir tu velocidad de lectura y comprensión actuales.
        </p>

        {/* Value Proposition List (Cards) */}
        <div className="w-full space-y-3 mb-8">
          <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">analytics</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Medir WPM</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Establece tu velocidad base.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">tune</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Personalizar Curriculum</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Adapta ejercicios a tu nivel.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Area */}
      <div className="absolute bottom-0 left-0 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 p-6 pb-8">
        {/* Time Chip */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-dark dark:bg-white/10 border border-gray-200 dark:border-white/5">
            <span className="material-symbols-outlined text-primary text-[18px]">timer</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Toma unos 2 minutos</span>
          </div>
        </div>
        <button
            onClick={() => onNavigate(AppRoute.ASSESSMENT_READING)}
            className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-background-dark font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(25,230,94,0.3)]"
        >
          Iniciar Test
          <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default AssessmentIntro;