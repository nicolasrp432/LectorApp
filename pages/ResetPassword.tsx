import React, { useState, useEffect } from 'react';
import { AppRoute } from '../types.ts';
import { supabase } from '../utils/supabase.ts';
import { useToast } from '../context/ToastContext.tsx';

interface ResetPasswordProps {
  onNavigate: (route: AppRoute) => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase automatically creates a session when the user clicks the recovery link.
    // We check for it here. The onAuthStateChange in AuthContext handles the PASSWORD_RECOVERY event.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      } else {
        setHasSession(false);
        setErrorMsg("El enlace de recuperacion es invalido o ha expirado. Solicita uno nuevo desde el login.");
      }
    };
    checkSession();
  }, []);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contrasenas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        if (error.message.includes('same_password')) {
          throw new Error("La nueva contrasena debe ser diferente a la anterior.");
        }
        throw error;
      }

      setIsSuccess(true);
      showToast("Contrasena actualizada con exito", "success");
      
      // Clean the URL hash so it doesn't re-trigger on reload
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      setTimeout(() => {
        onNavigate(AppRoute.DASHBOARD);
      }, 2500);

    } catch (error: any) {
      setErrorMsg(error.message || "Error al actualizar la contrasena.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark items-center justify-center p-8 text-center animate-in fade-in">
        <div className="size-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-5xl text-green-500">verified</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Todo listo</h1>
        <p className="text-gray-400 mb-8">Tu contrasena ha sido actualizada. Redirigiendo...</p>
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => onNavigate(AppRoute.LOGIN)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white" aria-label="Volver">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 z-10 max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
          <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">lock_reset</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Nueva Contrasena</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Establece tu nueva clave de acceso.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-in fade-in">
            {errorMsg}
            {!hasSession && (
              <button 
                onClick={() => onNavigate(AppRoute.LOGIN)} 
                className="block mt-2 text-primary font-bold hover:underline mx-auto"
              >
                Ir al Login
              </button>
            )}
          </div>
        )}

        {hasSession !== false && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="new-password" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Nueva Contrasena</label>
              <div className="relative">
                <input 
                  id="new-password"
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
                  aria-label={showPassword ? "Ocultar" : "Mostrar"}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirm-password" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Confirmar Contrasena</label>
              <input 
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-white dark:bg-surface-dark border rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-primary/30 transition-all ${
                  passwordsMismatch ? 'border-red-500/50' : passwordsMatch ? 'border-primary/50' : 'border-gray-200 dark:border-white/10'
                }`}
                placeholder="Repite la contrasena"
              />
              {passwordsMatch && (
                <p className="text-xs text-primary flex items-center gap-1 ml-1 mt-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span> Las contrasenas coinciden
                </p>
              )}
              {passwordsMismatch && (
                <p className="text-xs text-red-400 flex items-center gap-1 ml-1 mt-1">
                  <span className="material-symbols-outlined text-sm">error</span> Las contrasenas no coinciden
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading || !passwordsMatch || password.length < 6}
              className="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold text-lg h-14 rounded-xl shadow-lg mt-4 flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? (
                <span className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Actualizar Contrasena"
              )}
            </button>
          </form>
        )}

        <button 
          onClick={() => onNavigate(AppRoute.LOGIN)}
          className="mt-6 text-sm text-gray-500 hover:text-primary transition-colors font-medium text-center w-full"
        >
          Cancelar y volver
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
