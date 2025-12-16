import React, { useState } from 'react';
import { AppRoute } from '../types';

interface LoginProps {
  onLogin: () => void;
  onNavigate: (route: AppRoute) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
        {/* Decorative Background */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
            <button onClick={() => onNavigate(AppRoute.WELCOME)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 z-10">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 mb-6 shadow-lg shadow-primary/10">
                    <span className="material-symbols-outlined text-primary text-4xl">fingerprint</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bienvenido</h1>
                <p className="text-slate-500 dark:text-gray-400">Accede a tu córtex de memoria personal.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Email / Identidad</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">mail</span>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none shadow-sm"
                            placeholder="usuario@ejemplo.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Contraseña</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">lock</span>
                        <input 
                            type="password" 
                            required
                            className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-background-dark font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(25,230,94,0.3)] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? (
                        <span className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <span>Desbloquear Córtex</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    ¿No tienes cuenta? <span className="text-primary font-bold cursor-pointer hover:underline">Solicitar Acceso</span>
                </p>
            </div>
        </div>
    </div>
  );
};

export default Login;