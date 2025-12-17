import React from 'react';
import { AppRoute } from '../types';

interface BottomNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const isDashboard = currentRoute === AppRoute.DASHBOARD;
  const isLibrary = currentRoute === AppRoute.LIBRARY;
  const isRewards = currentRoute === AppRoute.REWARDS;
  const isSettings = currentRoute === AppRoute.SETTINGS;

  const navItemClass = (isActive: boolean) => `
    relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200
    ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-300'}
  `;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#112116] border-t border-gray-200 dark:border-white/5 pb-safe">
      <nav className="flex items-center justify-between h-16 px-2 max-w-md mx-auto">
          
          {/* Dashboard */}
          <button
            onClick={() => onNavigate(AppRoute.DASHBOARD)}
            className={navItemClass(isDashboard)}
          >
            <span className={`material-symbols-outlined text-[24px] ${isDashboard ? 'fill-1' : ''}`}>dashboard</span>
            <span className="text-[10px] font-medium">Inicio</span>
            {isDashboard && <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_2px_10px_rgba(25,230,94,0.5)]"></div>}
          </button>

          {/* Library */}
          <button
             onClick={() => onNavigate(AppRoute.LIBRARY)}
             className={navItemClass(isLibrary)}
          >
            <span className={`material-symbols-outlined text-[24px] ${isLibrary ? 'fill-1' : ''}`}>menu_book</span>
            <span className="text-[10px] font-medium">Librería</span>
          </button>

          {/* Play FAB (Center - Elevated) */}
          <div className="relative -top-6">
            <button 
              onClick={() => onNavigate(AppRoute.READING)}
              className="flex items-center justify-center size-16 rounded-full bg-primary text-[#112116] shadow-[0_0_20px_rgba(25,230,94,0.4)] hover:scale-105 transition-all active:scale-95 border-4 border-white dark:border-[#112116]"
            >
              <span className="material-symbols-outlined text-[32px] fill-1">play_arrow</span>
            </button>
          </div>

          {/* Rewards */}
          <button
             onClick={() => onNavigate(AppRoute.REWARDS)}
             className={navItemClass(isRewards)}
          >
             <span className={`material-symbols-outlined text-[24px] ${isRewards ? 'fill-1' : ''}`}>local_mall</span>
             <span className="text-[10px] font-medium">Tienda</span>
          </button>

           {/* Settings */}
           <button
             onClick={() => onNavigate(AppRoute.SETTINGS)}
             className={navItemClass(isSettings)}
          >
            <span className={`material-symbols-outlined text-[24px] ${isSettings ? 'fill-1' : ''}`}>settings</span>
            <span className="text-[10px] font-medium">Ajustes</span>
          </button>

      </nav>
      {/* Safe area spacer for iPhone X+ */}
      <div className="h-[env(safe-area-inset-bottom)] w-full bg-white dark:bg-[#112116]"></div>
    </div>
  );
};

export default BottomNav;