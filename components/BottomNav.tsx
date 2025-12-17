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

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto bg-[#1A2C20]/90 dark:bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center gap-2">
          
          {/* Dashboard */}
          <button
            onClick={() => onNavigate(AppRoute.DASHBOARD)}
            className={`relative flex items-center justify-center size-12 rounded-full transition-all duration-300 ${isDashboard ? 'bg-primary text-black scale-110 shadow-[0_0_15px_rgba(25,230,94,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
          </button>

          {/* Library */}
          <button
             onClick={() => onNavigate(AppRoute.LIBRARY)}
             className={`relative flex items-center justify-center size-12 rounded-full transition-all duration-300 ${isLibrary ? 'bg-primary text-black scale-110 shadow-[0_0_15px_rgba(25,230,94,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined">menu_book</span>
          </button>

          {/* Play FAB (Center) */}
          <div className="mx-2">
            <button 
              onClick={() => onNavigate(AppRoute.READING)}
              className="flex items-center justify-center size-14 rounded-full bg-gradient-to-br from-primary to-green-600 text-black shadow-[0_0_20px_rgba(25,230,94,0.6)] hover:scale-110 transition-all active:scale-95 border-2 border-[#1A2C20]"
            >
              <span className="material-symbols-outlined text-[32px] fill-1">play_arrow</span>
            </button>
          </div>

          {/* Rewards (New) */}
          <button
             onClick={() => onNavigate(AppRoute.REWARDS)}
             className={`relative flex items-center justify-center size-12 rounded-full transition-all duration-300 ${isRewards ? 'bg-yellow-500 text-black scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
             <span className="material-symbols-outlined">local_mall</span>
          </button>

           {/* Settings */}
           <button
             onClick={() => onNavigate(AppRoute.SETTINGS)}
             className={`relative flex items-center justify-center size-12 rounded-full transition-all duration-300 ${isSettings ? 'bg-primary text-black scale-110 shadow-[0_0_15px_rgba(25,230,94,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>

      </nav>
    </div>
  );
};

export default BottomNav;