import React, { useState } from 'react';
import { AppRoute } from '../types.ts';
import { supabase } from '../utils/supabase.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginProps {
  onNavigate: (route: AppRoute) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { loginAsGuest, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) {
            const msg = error.message.toLowerCase();
            if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
                throw new Error("Email o contrasena incorrectos. Verifica tus datos e intenta de nuevo.");
            }
            if (msg.includes('email not confirmed')) {
                throw new Error("Tu correo aun no ha sido confirmado. Revisa tu bandeja de entrada.");
            }
            if (msg.includes('too many requests') || error.status === 429) {
                throw new Error("Demasiados intentos. Espera un momento antes de volver a intentar.");
            }
            throw new Error(error.message);
        }
        // AuthContext onAuthStateChange will detect the session and redirect to DASHBOARD
    } catch (error: any) {
        setErrorMsg(error.message || 'Error al iniciar sesion.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
        setErrorMsg("Escribe tu email primero para enviarte el enlace de recuperacion.");
        return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
            redirectTo: `${window.location.origin}/#reset-password`,
        });
        
        if (error) {
            if (error.status === 429) {
                throw new Error("Demasiados intentos. Espera unos minutos.");
            }
            throw new Error(error.message);
        }
        setSuccessMsg("Enlace de recuperacion enviado a " + trimmedEmail + ". Revisa tu correo (incluido spam).");
    } catch (error: any) {
        setErrorMsg(error.message || "Error al enviar recuperacion.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        setIsLoading(true);
        setErrorMsg('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            }
        });
        if (error) throw error;
    } catch (error: any) {
        setErrorMsg("Error al conectar con Google. Intenta de nuevo.");
        setIsLoading(false);
    }
  };

  const displayError = errorMsg || authError;

  return (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-20%] w-[70%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute top-6 left-6 z-20">
            <button onClick={() => onNavigate(AppRoute.WELCOME)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white" aria-label="Volver">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 z-10 max-w-md mx-auto w-full">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Bienvenido</h1>
                <p className="text-slate-500 dark:text-gray-400 text-sm">Inicia sesion para continuar tu entrenamiento.</p>
            </div>

            {successMsg && (
                <div className="mb-6 p-3 rounded-xl text-sm text-center animate-in fade-in bg-green-500/10 border border-green-500/20 text-green-400">
                    {successMsg}
                </div>
            )}

            {displayError && !successMsg && (
                <div className="mb-6 p-3 rounded-xl text-sm text-center animate-in fade-in bg-red-500/10 border border-red-500/20 text-red-400">
                    {displayError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="login-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Email</label>
                    <input 
                        id="login-email"
                        type="email" 
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-primary/30 transition-all"
                        placeholder="usuario@ejemplo.com"
                    />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                        <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500">Contrasena</label>
                        <button 
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={isLoading}
                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline disabled:opacity-50"
                        >
                            Olvidaste tu contrasena?
                        </button>
                    </div>
                    <div className="relative">
                        <input 
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 pr-12 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-primary/30 transition-all"
                            placeholder="Tu contrasena"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                        >
                            <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading || !email.trim() || !password}
                    className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-background-dark font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg mt-6 disabled:opacity-50 disabled:scale-100"
                >
                    {isLoading ? (
                        <span className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        "Entrar"
                    )}
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                    <span className="px-2 bg-background-light dark:bg-background-dark text-gray-500">{'O continua con'}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-gray-50 dark:hover:bg-white/10 active:scale-[0.98] disabled:opacity-50"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    <span className="text-sm">Google</span>
                </button>
                <button 
                    type="button"
                    onClick={loginAsGuest}
                    disabled={isLoading}
                    className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-gray-50 dark:hover:bg-white/10 active:scale-[0.98] disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-gray-400">person_search</span>
                    <span className="text-sm">Invitado</span>
                </button>
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-500">
                    {'No tienes cuenta? '}<span onClick={() => onNavigate(AppRoute.REGISTER)} className="text-primary font-bold cursor-pointer hover:underline">{'Registrate gratis'}</span>
                </p>
            </div>
        </div>
    </div>
  );
};

export default Login;
