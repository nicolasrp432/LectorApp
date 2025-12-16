import React from 'react';

// This component isolates the UI logic for a settings row.
// When migrating to React Native, replace div with View, p with Text, etc.
// keeping the props interface consistent.

interface SettingsRowProps {
  icon: string;
  iconColorClass: string; // e.g., "text-blue-600 bg-blue-100"
  label: string;
  value?: string | number;
  isToggle?: boolean;
  isToggled?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  hasBorder?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconColorClass,
  label,
  value,
  isToggle,
  isToggled,
  onToggle,
  onClick,
  hasBorder = true
}) => {
  return (
    <div 
      onClick={isToggle ? onToggle : onClick}
      className={`flex items-center gap-4 px-4 min-h-[64px] justify-between ${hasBorder ? 'border-b border-slate-100 dark:border-slate-800/50' : ''} hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center rounded-lg shrink-0 size-8 ${iconColorClass}`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <p className="text-base font-normal flex-1 truncate text-slate-900 dark:text-white">{label}</p>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {!isToggle ? (
          <>
            {value && <p className="text-slate-500 dark:text-gray-400 text-base font-normal">{value}</p>}
            <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
          </>
        ) : (
          <div className={`w-12 h-7 rounded-full relative transition-colors duration-200 ${isToggled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isToggled ? 'right-1' : 'left-1'}`}></div>
          </div>
        )}
      </div>
    </div>
  );
};