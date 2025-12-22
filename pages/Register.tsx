
import React, { useState } from 'react';
import { AppRoute } from '../types';
import { supabase } from '../utils/supabase';

interface RegisterProps {
  onRegister: (name: string, email: string) => void;
  onNavigate: (route: AppRoute) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
        setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    setIsLoading(true);

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin, // Crucial para que Supabase envíe el email
                data: {
                    display_name: name,
                }
            }
        });

        if (error) {
            if (error.message.includes('security purposes') || error.status === 429) {
                throw new Error("Por seguridad, espera unos minutos antes de intentar de nuevo.");
            }
            throw error;
        }

        // Si el email no está confirmado y no hay sesión, mostramos éxito
        if (data.user && !data.session) {
            setShowSuccess(true);
            return;
        }

        // Si ya hay sesión (confirmación deshabilitada en Supabase o auto-confirmado)
        if (data.user && data.session) {
             onRegister(name, email);
             onNavigate(AppRoute.DASHBOARD);
        }

    } catch (error: any) {
        console.error("Register Error:", error);
        setErrorMsg(error.message || 'Error al registrarse');
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        setIsLoading(true);
        setErrorMsg('');
        
        const redirectTo = window.location.origin;
        console.log(`[Auth] Google Register: Redirigiendo a ${redirectTo}`);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });
        
        if (error) throw error;
    } catch (error: any) {
        console.error("Google Registration Error:", error);
        setErrorMsg("Error al conectar con Google.");
        setIsLoading(false);
    }
  };

  if (showSuccess) {
      return (
        <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark items-center justify-center p-8 text-center animate-in fade-in">
            <div className="size-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-6xl text-green-500">mark_email_read</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">¡Casi listo!</h1>
            <p className="text-slate-600 dark:text-gray-300 text-lg mb-8 max-w-sm leading-relaxed">
                Hemos enviado un correo de confirmación a <br/><b>{email}</b>.
                <br/><br/>
                Por favor, verifica tu cuenta desde tu bandeja de entrada para poder acceder.
            </p>
            <button 
                onClick={() => onNavigate(AppRoute.LOGIN)}
                className="w-full max-w-sm bg-primary hover:bg-primary-dark text-background-dark font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
                Ir a Iniciar Sesión
            </button>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute top-6 left-6 z-20">
            <button onClick={() => onNavigate(AppRoute.WELCOME)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 z-10 max-w-md mx-auto w-full">
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Crear Cuenta</h1>
                <p className="text-slate-500 dark:text-gray-400 text-sm">Guarda tus resultados y comienza tu entrenamiento.</p>
            </div>

            {errorMsg && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center animate-in fade-in zoom-in-95">
                    {errorMsg}
                </div>
            )}

            <button 
                type="button"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-white font-bold h-14 rounded-xl flex items-center justify-center gap-3 transition-all mb-6 shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
                {isLoading && !email && !name ? (
                    <span className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                )}
                <span>Registrarse con Google</span>
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Nombre</label>
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-sm"
                        placeholder="Tu nombre"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Email</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-sm"
                        placeholder="usuario@ejemplo.com"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Contraseña</label>
                    <input 
                        type="password" 
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-sm"
                        placeholder="Mínimo 6 caracteres"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-background-dark font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(25,230,94,0.3)] mt-6"
                >
                    {isLoading && (email || name) ? (
                        <span className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        "Registrarse"
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    ¿Ya tienes cuenta? <span onClick={() => onNavigate(AppRoute.LOGIN)} className="text-primary font-bold cursor-pointer hover:underline">Inicia Sesión</span>
                </p>
            </div>
        </div>
    </div>
  );
};

export default Register;
