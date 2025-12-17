import React, { useState } from 'react';
import { AppRoute, User, UserPreferences } from '../types';
import { SettingsRow } from '../components/SettingsRow';
import EditPreferenceModal from '../components/EditPreferenceModal';

interface SettingsProps {
  onBack: () => void;
  user: User;
  onLogout: () => void;
  onNavigate: (route: AppRoute) => void;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack, user, onLogout, onNavigate, onUpdatePreferences }) => {
  const [modalConfig, setModalConfig] = useState<{
      isOpen: boolean;
      title: string;
      type: 'number' | 'range' | 'select';
      key: keyof UserPreferences;
      options?: string[];
      min?: number;
      max?: number;
      step?: number;
  } | null>(null);

  const handleToggle = (key: keyof UserPreferences) => {
      onUpdatePreferences({
          [key]: !user.preferences[key]
      });
  };

  const openModal = (key: keyof UserPreferences) => {
      let config: any = { isOpen: true, key };
      
      switch(key) {
          case 'dailyGoalMinutes':
              config = { ...config, title: 'Meta Diaria', type: 'number' };
              break;
          case 'targetWPM':
              config = { ...config, title: 'Objetivo de Velocidad', type: 'range', min: 100, max: 1000, step: 25 };
              break;
          case 'difficultyLevel':
              config = { ...config, title: 'Dificultad del Entrenamiento', type: 'select', options: ['Básico', 'Intermedio', 'Avanzado'] };
              break;
      }
      setModalConfig(config);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-24 font-display">
      
      {/* Top App Bar */}
      <div className="relative flex flex-col gap-2 p-4 pt-6 pb-2">
        <div className="flex items-center h-12 justify-between">
           <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
           </button>
        </div>
        <p className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Ajustes</p>
      </div>

      {/* Profile Header */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full h-16 w-16 shrink-0 border-2 border-primary/20" 
            style={{backgroundImage: `url("${user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}")`}}
          >
          </div>
          <div className="flex flex-col justify-center flex-1">
            <p className="text-lg font-bold leading-tight text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-slate-500 dark:text-gray-400 text-sm font-normal">{user.email}</p>
            <div 
                onClick={() => onNavigate(AppRoute.EDIT_PROFILE)}
                className="flex items-center mt-1 text-primary cursor-pointer hover:opacity-80"
            >
              <span className="text-sm font-medium">Editar Perfil</span>
              <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>

      {/* Training Preferences Section */}
      <div className="mb-6">
        <h3 className="text-slate-500 dark:text-gray-400 text-xs font-bold tracking-wider px-6 pb-2 uppercase">Preferencias de Entrenamiento</h3>
        <div className="mx-4 bg-surface-light dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
          <SettingsRow 
            icon="timer" 
            iconColorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            label="Meta Diaria"
            value={`${user.preferences.dailyGoalMinutes} mins`}
            onClick={() => openModal('dailyGoalMinutes')}
          />
          <SettingsRow 
            icon="speed" 
            iconColorClass="bg-primary/20 text-primary"
            label="Objetivo de Velocidad"
            value={`${user.preferences.targetWPM} WPM`}
            onClick={() => openModal('targetWPM')}
          />
          <SettingsRow 
            icon="signal_cellular_alt" 
            iconColorClass="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
            label="Dificultad"
            value={user.preferences.difficultyLevel}
            hasBorder={false}
            onClick={() => openModal('difficultyLevel')}
          />
        </div>
      </div>

      {/* App Settings Section */}
      <div className="mb-6">
        <h3 className="text-slate-500 dark:text-gray-400 text-xs font-bold tracking-wider px-6 pb-2 uppercase">Configuración de App</h3>
        <div className="mx-4 bg-surface-light dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
          <SettingsRow 
            icon="notifications" 
            iconColorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
            label="Notificaciones"
            isToggle={true}
            isToggled={user.preferences.notificationsEnabled}
            onToggle={() => handleToggle('notificationsEnabled')}
          />
          <SettingsRow 
            icon="volume_up" 
            iconColorClass="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
            label="Efectos de Sonido"
            isToggle={true}
            isToggled={user.preferences.soundEnabled}
            onToggle={() => handleToggle('soundEnabled')}
            hasBorder={false}
          />
        </div>
      </div>

      {/* Support Section */}
      <div className="mb-8">
        <h3 className="text-slate-500 dark:text-gray-400 text-xs font-bold tracking-wider px-6 pb-2 uppercase">Soporte</h3>
        <div className="mx-4 bg-surface-light dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
          <SettingsRow 
            icon="help" 
            iconColorClass="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            label="Centro de Ayuda"
          />
          <SettingsRow 
            icon="policy" 
            iconColorClass="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            label="Política de Privacidad"
            hasBorder={false}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mb-4">
        <button 
            onClick={onLogout}
            className="w-full py-4 text-center rounded-2xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
            Cerrar Sesión
        </button>
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">Versión 2.5.0 (Build 190)</p>
      </div>

      {/* Edit Modal */}
      {modalConfig && (
          <EditPreferenceModal 
            title={modalConfig.title}
            type={modalConfig.type}
            initialValue={user.preferences[modalConfig.key]}
            options={modalConfig.options}
            min={modalConfig.min}
            max={modalConfig.max}
            step={modalConfig.step}
            onClose={() => setModalConfig(null)}
            onSave={(val) => onUpdatePreferences({ [modalConfig.key]: val })}
          />
      )}

    </div>
  );
};

export default Settings;