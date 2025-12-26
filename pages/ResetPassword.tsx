
import React, { useState, useEffect } from 'react';
import { AppRoute } from '../types';
import { supabase } from '../utils/supabase';
import { useToast } from '../context/ToastContext';

interface ResetPasswordProps {
  onNavigate: (route: AppRoute) => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión activa (Supabase la crea automáticamente al hacer clic en el link del email)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setErrorMsg("El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setIsSuccess(true);
      showToast("Contraseña actualizada con éxito", "success");
      
      // Esperar un momento y redirigir
      setTimeout(() => {
        onNavigate(AppRoute.LOGIN);
      }, 2000);

    } catch (error: any) {
      console.error("Error al actualizar contraseña:", error);
      setErrorMsg(error.message || "Error al actualizar la contraseña.");
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
        <h1 className="text-2xl font-bold mb-2">¡Todo listo!</h1>
        <p className="text-gray-500 mb-8">Tu contraseña ha sido actualizada. Redirigiéndote al inicio de sesión...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
      <div className="flex-1 flex flex-col justify-center px-8 z-10 max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Nueva Contraseña</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Establece tu nueva clave de acceso.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Nueva Contraseña</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 ml-1">Confirmar Contraseña</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white outline-none text-sm"
              placeholder="Repite la contraseña"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold text-lg h-14 rounded-xl shadow-lg mt-4 flex items-center justify-center"
          >
            {isLoading ? (
              <span className="size-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Actualizar Contraseña"
            )}
          </button>
        </form>

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
