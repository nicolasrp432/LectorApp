import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-primary text-[#112217] shadow-[0_4px_14px_0_rgba(25,230,94,0.39)] hover:shadow-[0_6px_20px_rgba(25,230,94,0.23)] hover:bg-[#16cc53]",
    secondary: "bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    ghost: "text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
  };

  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg" // 56px height for Neuro-UX optimal touch target
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        leftIcon && <span className="material-symbols-outlined mr-2 text-[1.2em]">{leftIcon}</span>
      )}
      
      {children}

      {!isLoading && rightIcon && (
        <span className="material-symbols-outlined ml-2 text-[1.2em]">{rightIcon}</span>
      )}
    </button>
  );
};
