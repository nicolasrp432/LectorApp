import React from 'react';
import { AppRoute } from '../types';

interface BottomNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const isDashboard = currentRoute === AppRoute.DASHBOARD;
  const isLibrary = currentRoute === AppRoute.LIBRARY;
  const isMemory = currentRoute === AppRoute.MEMORY_TRAINING || currentRoute === AppRoute.ASSESSMENT_QUIZ;
  const isSettings = currentRoute === AppRoute.SETTINGS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center w-full">
      <div className="w-full max-w-md bg-surface-light dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-card-border px-6 pb-6 pt-3">
        <div className="flex justify-between items-center">
          
          {/* Dashboard */}
          <button
            onClick={() => onNavigate(AppRoute.DASHBOARD)}
            className={`flex flex-col items-center justify-center gap-1 group w-16 ${isDashboard ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'}`}
          >
            <div className="relative p-1">
              <span className={`material-symbols-outlined text-[28px] transition-transform ${isDashboard ? 'scale-110' : 'group-hover:scale-110'}`}>
                dashboard
              </span>
              {isDashboard && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 bg-primary rounded-full"></span>}
            </div>
            <span className="text-[10px] font-medium tracking-wide">Inicio</span>
          </button>

          {/* Library / Reading */}
          <button
             onClick={() => onNavigate(AppRoute.LIBRARY)}
             className={`flex flex-col items-center justify-center gap-1 group w-16 ${isLibrary ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'}`}
          >
            <span className={`material-symbols-outlined text-[28px] transition-transform ${isLibrary ? 'scale-110' : 'group-hover:scale-110'}`}>
              menu_book
            </span>
            <span className="text-[10px] font-medium tracking-wide">Librería</span>
          </button>

          {/* Play FAB */}
          <div className="relative -top-6">
            <button 
              onClick={() => onNavigate(AppRoute.READING)}
              className="flex items-center justify-center size-14 rounded-full bg-primary text-background-dark shadow-[0_0_15px_rgba(25,230,94,0.4)] hover:shadow-[0_0_20px_rgba(25,230,94,0.6)] hover:scale-105 transition-all border-4 border-background-light dark:border-background-dark"
            >
              <span className="material-symbols-outlined text-[32px] fill-1">play_arrow</span>
            </button>
          </div>

          {/* Memory */}
          <button
             onClick={() => onNavigate(AppRoute.MEMORY_TRAINING)}
             className={`flex flex-col items-center justify-center gap-1 group w-16 ${isMemory ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'}`}
          >
             <div className="relative p-1">
                <span className={`material-symbols-outlined text-[28px] transition-transform ${isMemory ? 'scale-110' : 'group-hover:scale-110'}`}>
                psychology_alt
                </span>
                {isMemory && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 bg-primary rounded-full"></span>}
             </div>
            <span className="text-[10px] font-medium tracking-wide">Memoria</span>
          </button>

           {/* Settings */}
           <button
             onClick={() => onNavigate(AppRoute.SETTINGS)}
             className={`flex flex-col items-center justify-center gap-1 group w-16 ${isSettings ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'}`}
          >
            <div className="relative p-1">
                <span className={`material-symbols-outlined text-[28px] transition-transform ${isSettings ? 'scale-110' : 'group-hover:scale-110'}`}>
                settings
                </span>
                {isSettings && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 bg-primary rounded-full"></span>}
            </div>
            <span className="text-[10px] font-medium tracking-wide">Ajustes</span>
          </button>

        </div>
      </div>
    </nav>
  );
};

export default BottomNav;