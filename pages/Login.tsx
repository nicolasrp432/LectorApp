
import React, { useState } from 'react';
import { AppRoute } from '../types';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onLogin: () => void;
  onNavigate: (route: AppRoute) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const { loginAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message.includes('Email not confirmed')) {
                throw new Error("Debes confirmar tu email antes de entrar. Revisa tu bandeja de entrada.");
            }
            if (error.message.toLowerCase().includes('invalid login')) {
                throw new Error("Credenciales incorrectas. Revisa tu email y contraseña.");
            }
            throw error;
        }
        onLogin(); 
        onNavigate(AppRoute.DASHBOARD);
    } catch (error: any) {
        console.error("Login error", error);
        setErrorMsg(error.message || 'Error al iniciar sesión.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
        setErrorMsg("Introduce tu email para enviarte un enlace de recuperación.");
        return;
    }
    setIsLoading(true);
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) throw error;
        setResetSent(true);
        setErrorMsg("Te hemos enviado un enlace de recuperación.");
    } catch (error: any) {
        setErrorMsg(error.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
        if (error) throw error;
    } catch (error: any) {
        setErrorMsg("Error al conectar con Google.");
        setIsLoading(false);
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

        <div className="flex-1 flex flex-col justify-center px-8 z-10 max-w-md mx-auto w-full">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 mb-6 shadow-lg">
                    <span className="material-symbols-outlined text-primary text-4xl">fingerprint</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bienvenido</h1>
                <p className="text-slate-500 dark:text-gray-400 text-sm">Accede a tu córtex de memoria personal.</p>
            </div>

            {errorMsg && (
                <div className={`mb-6 p-3 border rounded-xl text-sm text-center animate-in fade-in ${resetSent ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {errorMsg}
                </div>
            )}

            <button 
                type="button"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-white font-bold h-14 rounded-xl flex items-center justify-center gap-3 mb-4 shadow-sm active:scale-[0.98] disabled:opacity-50 transition-all"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                <span>Continuar con Google</span>
            </button>

            <button 
                type="button"
                onClick={() => { loginAsGuest(); onNavigate(AppRoute.DASHBOARD); }}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-500 text-[10px] font-bold h-10 rounded-xl mb-4 transition-all uppercase tracking-widest border-dashed"
            >
                Entrar como Invitado
            </button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                    <span className="px-2 bg-background-light dark:bg-background-dark text-gray-500">O usa tu email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Email</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm"
                        placeholder="tu@email.com"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 ml-1">Contraseña</label>
                        <button type="button" onClick={handleForgotPassword} className="text-[10px] text-primary font-bold hover:underline">¿Olvidaste?</button>
                    </div>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm"
                        placeholder="••••••••"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-background-dark font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 mt-2"
                >
                    {isLoading ? (
                        <span className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        "Iniciar Sesión"
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    ¿No tienes cuenta? <span onClick={() => onNavigate(AppRoute.REGISTER)} className="text-primary font-bold cursor-pointer hover:underline">Regístrate</span>
                </p>
            </div>
        </div>
    </div>
  );
};

export default Login;
