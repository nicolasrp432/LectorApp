import React, { useState } from 'react';
import { AppRoute } from '../types';

interface WelcomeProps {
  onNavigate: (route: AppRoute) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark overflow-y-auto">
      {/* Header / Logo */}
      <header className="w-full pt-8 pb-4 px-6 flex justify-center z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Lector</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        {/* Hero Visual */}
        <div className="w-full max-w-[280px] aspect-square relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
          <div
            className="w-full h-full bg-center bg-no-repeat bg-contain relative z-10"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop")',
              maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              opacity: 0.9,
              borderRadius: '20px'
            }}
          ></div>
        </div>

        {/* Headline */}
        <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-[1.1] text-center mb-4">
          Lee Más Rápido.<br />
          <span className="text-primary">Recuerda Más.</span>
        </h1>

        {/* Body Text */}
        <p className="text-slate-600 dark:text-gray-300 text-base font-normal leading-relaxed text-center max-w-[320px] mb-8">
          Únete al programa científicamente diseñado para triplicar tu velocidad de lectura y construir una supermemoria.
        </p>

        {/* Social Proof */}
        <div className="flex items-center gap-3 mb-4 bg-white/5 dark:bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-black/5 dark:border-white/10">
          <div className="flex -space-x-2 overflow-hidden">
            <img alt="User 1" className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#112116] object-cover" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
            <img alt="User 2" className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#112116] object-cover" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-gray-400">+10k estudiantes</span>
        </div>
      </main>

      {/* Footer / CTA Section */}
      <footer className="w-full px-6 pb-12 pt-4 relative z-10 mt-auto">
        <button
            onClick={() => onNavigate(AppRoute.LOGIN)}
            className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-primary text-[#112217] text-lg font-bold leading-normal tracking-[0.015em] transition-transform active:scale-[0.98] shadow-[0_0_20px_rgba(25,230,94,0.3)] hover:shadow-[0_0_30px_rgba(25,230,94,0.5)]"
        >
          <span className="mr-2">Iniciar Sesión</span>
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">login</span>
        </button>
        <div className="mt-6 text-center">
          <button onClick={() => onNavigate(AppRoute.ASSESSMENT_INTRO)} className="text-slate-500 dark:text-[#93c8a5] text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors">
            ¿Nuevo aquí? <span className="underline decoration-1 underline-offset-4">Toma el Test Inicial</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;