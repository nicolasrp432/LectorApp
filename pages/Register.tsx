import React, { useState } from 'react';
import { AppRoute } from '../types.ts';
import { supabase } from '../utils/supabase.ts';

interface RegisterProps {
  onNavigate: (route: AppRoute) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabels = ['', 'Debil', 'Aceptable', 'Fuerte'];
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-primary'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
        setErrorMsg("La contrasena debe tener al menos 6 caracteres.");
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
                    full_name: name.trim(),
                }
            }
        });

        if (error) {
            if (error.status === 422 || (error.message && error.message.toLowerCase().includes('already registered'))) {
                throw new Error("Este correo ya esta registrado. Intenta iniciar sesion o usa 'Olvidaste tu contrasena'.");
            }
            if (error.status === 429) {
                throw new Error("Demasiados intentos. Espera unos minutos.");
            }
            throw new Error(error.message);
        }

        if (data.user) {
            // Check if this is genuinely a new user (has identities) or a duplicate
            const isNewUser = data.user.identities && data.user.identities.length > 0;
            if (!isNewUser) {
                throw new Error("Este correo ya esta registrado. Inicia sesion directamente o recupera tu contrasena.");
            }

            if (!data.session) {
                // Email confirmation required
                setShowSuccess(true);
            } else {
                // Auto-confirmed, AuthContext will pick up the session
                onNavigate(AppRoute.DASHBOARD);
            }
        }

    } catch (error: any) {
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
        setErrorMsg("Error al conectar con Google. Intenta de nuevo.");
        setIsLoading(false);
    }
  };

  if (showSuccess) {
      return (
        <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark items-center justify-center p-8 text-center animate-in fade-in">
            <div className="size-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-6xl text-green-500">mark_email_read</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 text-balance">Verifica tu Email</h1>
            <p className="text-slate-600 dark:text-gray-300 text-base mb-8 max-w-sm leading-relaxed">
                Hemos enviado un enlace de confirmacion a <strong className="text-white">{email}</strong>. Revisa tu bandeja de entrada y carpeta de spam.
            </p>
            <button 
                onClick={() => onNavigate(AppRoute.LOGIN)}
                className="w-full max-w-sm bg-primary hover:bg-primary-dark text-background-dark font-bold text-lg h-14 rounded-xl shadow-lg transition-transform active:scale-95"
            >
                Ir al Inicio de Sesion
            </button>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute top-6 left-6 z-20">
            <button onClick={() => onNavigate(AppRoute.WELCOME)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white" aria-label="Volver">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 z-10 max-w-md mx-auto w-full">
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Crear Cuenta</h1>
                <p className="text-slate-500 dark:text-gray-400 text-sm">Empieza hoy tu camino a la supermemoria.</p>
            </div>

            {errorMsg && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-in fade-in">
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
                    <label htmlFor="register-name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Nombre</label>
                    <input 
                        id="register-name"
                        type="text" 
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-primary/30"
                        placeholder="Tu nombre"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="register-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Email</label>
                    <input 
                        id="register-email"
                        type="email" 
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-primary/30"
                        placeholder="usuario@ejemplo.com"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="register-password" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Contrasena</label>
                    <div className="relative">
                        <input 
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 pr-12 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-primary/30"
                            placeholder="Minimo 6 caracteres"
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
                    {password.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 px-1">
                            <div className="flex-1 flex gap-1">
                                {[1, 2, 3].map(level => (
                                    <div key={level} className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength ? strengthColors[passwordStrength] : 'bg-white/10'}`}></div>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{strengthLabels[passwordStrength]}</span>
                        </div>
                    )}
                </div>

                <button 
                    type="submit"
                    disabled={isLoading || !name.trim() || !email.trim() || password.length < 6}
                    className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-background-dark font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg mt-6 disabled:opacity-50 disabled:scale-100"
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
                    {'Ya tienes cuenta? '}<span onClick={() => onNavigate(AppRoute.LOGIN)} className="text-primary font-bold cursor-pointer hover:underline">Inicia Sesion</span>
                </p>
            </div>
        </div>
    </div>
  );
};

export default Register;
