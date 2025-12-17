import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full bg-white dark:bg-surface-dark 
            border border-gray-200 dark:border-white/10 
            rounded-xl py-3.5 ${icon ? 'pl-12' : 'pl-4'} pr-4 
            text-slate-900 dark:text-white placeholder:text-gray-400
            focus:ring-2 focus:ring-primary/50 focus:border-primary 
            transition-all outline-none shadow-sm
            disabled:opacity-60 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
    </div>
  );
};
