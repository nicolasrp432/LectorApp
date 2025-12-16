import React, { useState } from 'react';
import { User } from '../types';
import { AVATARS } from '../constants';

interface EditProfileProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onBack, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl || AVATARS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate network delay
    setTimeout(() => {
        onUpdateUser({
            name,
            email,
            avatarUrl: selectedAvatar
        });
        setIsSaving(false);
        onBack();
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar font-display">
      
      {/* Top App Bar */}
      <div className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 p-4 flex items-center justify-between">
         <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
         </button>
         <h2 className="text-lg font-bold text-slate-900 dark:text-white">Editar Perfil</h2>
         <button 
            onClick={handleSave}
            disabled={isSaving}
            className="text-primary font-bold text-sm hover:opacity-80 disabled:opacity-50 transition-opacity"
         >
            {isSaving ? 'Guardando...' : 'Guardar'}
         </button>
      </div>

      <form onSubmit={handleSave} className="p-6 flex flex-col gap-8 pb-24">
        
        {/* Avatar Selection */}
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div 
                    className="size-32 rounded-full bg-cover bg-center border-4 border-primary/20 shadow-xl"
                    style={{ backgroundImage: `url("${selectedAvatar}")` }}
                ></div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="material-symbols-outlined text-white text-3xl">edit</span>
                </div>
            </div>
            
            <div className="w-full overflow-x-auto pb-4 no-scrollbar">
                <div className="flex gap-4 justify-center min-w-max px-2">
                    {AVATARS.map((avatar, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`size-16 rounded-full bg-cover bg-center border-2 transition-all ${selectedAvatar === avatar ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            style={{ backgroundImage: `url("${avatar}")` }}
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 ml-1">Nombre Completo</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-4 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 ml-1">Correo Electrónico</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl py-4 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                />
            </div>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;