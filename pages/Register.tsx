
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
            email: email.trim(),
            password,
            options: {
                emailRedirectTo: window.location.origin,
                data: {
                    display_name: name.trim(),
                }
            }
        });

        if (error) {
            if (error.status === 400 && error.message.toLowerCase().includes('already registered')) {
                throw new Error("Este correo ya está registrado. Si usaste Google, inicia sesión directamente o usa 'Olvidaste tu contraseña' para crear una.");
            }
            throw error;
        }

        if (data.user) {
            const isNewUser = data.user.identities && data.user.identities.length > 0;
            if (!isNewUser) {
                throw new Error("Este correo ya está registrado con Google. Por favor, inicia sesión con Google o crea una contraseña vía 'Olvidaste tu contraseña'.");
            }

            if (!data.session) {
                setShowSuccess(true);
            } else {
                onRegister(name, email);
                onNavigate(AppRoute.DASHBOARD);
            }
        }

    } catch (error: any) {
        console.error("Error en el registro:", error);
        setErrorMsg(error.message || 'Error al procesar el registro.');
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">¡Verifica tu Email!</h1>
            <p className="text-slate-600 dark:text-gray-300 text-lg mb-8 max-w-sm leading-relaxed">
                Hemos enviado un enlace a:<br/><b>{email}</b>.<br/><br/>
                Confirma tu cuenta para acceder. Revisa también tu carpeta de spam.
            </p>
            <button 
                onClick={() => onNavigate(AppRoute.LOGIN)}
                className="w-full max-w-sm bg-primary hover:bg-primary-dark text-background-dark font-bold text-lg h-14 rounded-xl shadow-lg transition-transform active:scale-95"
            >
                Ir al Inicio de Sesión
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
                <p className="text-slate-500 dark:text-gray-400 text-sm">Empieza hoy tu camino a la supermemoria.</p>
            </div>

            {errorMsg && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center animate-in fade-in">
                    {errorMsg}
                </div>
            )}

            <button 
                type="button"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-white font-bold h-14 rounded-xl flex items-center justify-center gap-3 transition-all mb-6 shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
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
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-primary/30"
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
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-primary/30"
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
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-primary/30"
                        placeholder="Mínimo 6 caracteres"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-background-dark font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg mt-6"
                >
                    {isLoading ? (
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
