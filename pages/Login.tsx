import React, { useState } from 'react';
import { AppRoute } from '../types';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onLogin: () => void; // Used to trigger data refresh in App.tsx
  onNavigate: (route: AppRoute) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const { loginAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        
        // Success
        onLogin(); 
        onNavigate(AppRoute.DASHBOARD);
        
    } catch (error: any) {
        console.error("Login error", error);
        
        if (error.message.includes('Email not confirmed')) {
            setErrorMsg('Tu email no ha sido confirmado. Revisa tu correo o usa Google.');
        } else if (error.message.includes('Invalid login credentials')) {
            setErrorMsg('Credenciales inválidas. Verifica tu email y contraseña.');
        } else {
            setErrorMsg(error.message || 'Error al iniciar sesión');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
      loginAsGuest();
      onLogin(); // Trigger app state refresh if needed
      onNavigate(AppRoute.DASHBOARD);
  };

  const handleGoogleLogin = async () => {
    try {
        setErrorMsg('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Esto redirige al usuario de vuelta a la app después de loguearse en Google
                redirectTo: window.location.origin 
            }
        });
        if (error) throw error;
    } catch (error: any) {
        console.error("Google Login Error:", error);
        setErrorMsg("Error al conectar con Google.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute top-6 left-6 z-20">
            <button onClick={() => onNavigate(AppRoute.WELCOME)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 z-10">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 mb-6 shadow-lg shadow-primary/10">
                    <span className="material-symbols-outlined text-primary text-4xl">fingerprint</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bienvenido</h1>
                <p className="text-slate-500 dark:text-gray-400">Accede a tu córtex de memoria personal.</p>
            </div>

            {errorMsg && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                    {errorMsg}
                </div>
            )}

            {/* Guest Button */}
            <button 
                type="button"
                onClick={handleGuestLogin}
                className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all mb-4 text-sm uppercase tracking-wide"
            >
                <span className="material-symbols-outlined text-[18px]">person_off</span>
                <span>Ingresar como Invitado</span>
            </button>

            {/* Google Button */}
            <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-white font-bold h-14 rounded-xl flex items-center justify-center gap-3 transition-all mb-6"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                <span>Continuar con Google</span>
            </button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background-light dark:bg-background-dark text-gray-500">O usa tu email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Email</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">mail</span>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none shadow-sm"
                            placeholder="tu@email.com"
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            <span>Iniciar Sesión</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    ¿No tienes cuenta? <span onClick={() => onNavigate(AppRoute.REGISTER)} className="text-primary font-bold cursor-pointer hover:underline">Solicitar Acceso</span>
                </p>
            </div>
        </div>
    </div>
  );
};

export default Login;