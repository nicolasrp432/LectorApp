
import React, { useState } from 'react';
import { AppRoute, Reward, Achievement } from '../types';
import { REWARDS_LIST, ACHIEVEMENTS_LIST } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface RewardsProps {
  onBack: () => void;
}

const Rewards: React.FC<RewardsProps> = ({ onBack }) => {
  const { user, updateUser, equipReward } = useAuth();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'theme' | 'avatar' | 'book' | 'achievements'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!user) return null;

  const filteredRewards = REWARDS_LIST.filter(r => filter === 'all' || r.type === filter);

  const handleAction = async (reward: Reward) => {
      setProcessingId(reward.id);
      
      const isOwned = user.preferences.unlockedRewards?.includes(reward.id);
      
      if (reward.requiredAchievementId) {
          const hasAchievement = user.achievements.some(a => a.id === reward.requiredAchievementId);
          if (!hasAchievement) {
              const ach = ACHIEVEMENTS_LIST.find(a => a.id === reward.requiredAchievementId);
              showToast(`Bloqueado: Requiere logro "${ach?.title || '??'}"`, 'warning');
              setProcessingId(null);
              return;
          }
      }

      if (isOwned) {
          await equipReward(reward);
          showToast(`¡${reward.title} equipado!`, 'success');
          setProcessingId(null);
          return;
      }

      if (user.stats.xp < reward.cost) {
          showToast(`Te faltan ${reward.cost - user.stats.xp} XP`, 'error');
          setProcessingId(null);
          return;
      }

      setTimeout(async () => {
          const newXP = user.stats.xp - reward.cost;
          const newUnlocked = [...(user.preferences.unlockedRewards || []), reward.id];

          await updateUser({
              stats: { ...user.stats, xp: newXP },
              preferences: {
                  ...user.preferences,
                  unlockedRewards: newUnlocked
              }
          });
          
          showToast(`¡${reward.title} comprado!`, 'success');
          setProcessingId(null);
      }, 600);
  };

  const isEquipped = (reward: Reward) => {
      if (reward.type === 'avatar') return user.avatarUrl === reward.value;
      if (reward.type === 'theme') return user.preferences.themeColor === reward.value;
      return false; 
  };

  const isLockedByAchievement = (reward: Reward) => {
      if (!reward.requiredAchievementId) return false;
      return !user.achievements.some(a => a.id === reward.requiredAchievementId);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display overflow-hidden">
      {/* Header */}
      <header className="flex-none p-6 pt-8 bg-gradient-to-b from-yellow-500/10 to-transparent">
        <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-500/30 shadow-lg animate-in slide-in-from-top-4">
                <span className="material-symbols-outlined text-yellow-400 text-lg">bolt</span>
                <span className="text-white font-bold text-lg">{user.stats.xp} XP</span>
            </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mercado Cerebral</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm">Invierte tu conocimiento y visualiza tus logros.</p>
      </header>

      {/* Filter Tabs */}
      <div className="px-6 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Todo' },
            { id: 'theme', label: 'Temas' },
            { id: 'avatar', label: 'Avatares' },
            { id: 'book', label: 'Libros' },
            { id: 'achievements', label: 'Logros' }
          ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === f.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
              >
                  {f.label}
              </button>
          ))}
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6 pt-2 pb-32 no-scrollbar">
          {filter === 'achievements' ? (
              <div className="grid grid-cols-1 gap-4">
                  {ACHIEVEMENTS_LIST.map(achievement => {
                      const unlockedData = user.achievements.find(a => a.id === achievement.id);
                      const isUnlocked = !!unlockedData;

                      return (
                          <div 
                            key={achievement.id}
                            className={`flex items-center gap-4 p-5 rounded-2xl border transition-all relative overflow-hidden
                                ${isUnlocked 
                                    ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/30 shadow-lg' 
                                    : 'bg-white/5 border-white/5 opacity-60'
                                }
                            `}
                          >
                              {/* Icon Container */}
                              <div className={`size-16 rounded-full flex items-center justify-center shrink-0 border-2
                                  ${isUnlocked ? 'bg-primary text-black border-primary/50' : 'bg-black/40 text-gray-600 border-white/5'}
                              `}>
                                  <span className="material-symbols-outlined text-3xl">
                                      {isUnlocked ? achievement.icon : 'lock'}
                                  </span>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                      <h3 className={`font-bold text-lg leading-none ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                          {achievement.title}
                                      </h3>
                                      {isUnlocked && <span className="material-symbols-outlined text-primary text-sm">verified</span>}
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
                                  {isUnlocked && unlockedData.unlockedAt && (
                                      <p className="text-[10px] text-primary/60 mt-2 font-bold uppercase tracking-widest">
                                          Obtenido: {new Date(unlockedData.unlockedAt).toLocaleDateString()}
                                      </p>
                                  )}
                              </div>

                              {!isUnlocked && (
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Bloqueado</span>
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          ) : (
              <div className="grid grid-cols-2 gap-4">
                  {filteredRewards.map(reward => {
                      const owned = user.preferences.unlockedRewards?.includes(reward.id);
                      const equipped = isEquipped(reward);
                      const canAfford = user.stats.xp >= reward.cost;
                      const locked = isLockedByAchievement(reward);
                      const isProcessing = processingId === reward.id;

                      return (
                          <div 
                            key={reward.id} 
                            className={`bg-white dark:bg-surface-dark rounded-2xl p-4 border flex flex-col gap-3 shadow-sm transition-all group relative overflow-hidden 
                                ${equipped ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-100 dark:border-white/5 hover:border-yellow-500/30'}
                                ${locked ? 'opacity-70 grayscale-[0.5]' : ''}
                            `}
                          >
                              <div className="absolute top-2 right-2 z-10">
                                  {equipped && <span className="material-symbols-outlined text-primary text-xl">check_circle</span>}
                                  {locked && <span className="material-symbols-outlined text-gray-500 text-xl bg-black/40 rounded-full p-0.5">lock</span>}
                              </div>

                              <div className="aspect-square rounded-xl bg-gray-50 dark:bg-black/20 flex items-center justify-center relative overflow-hidden">
                                  {reward.type === 'avatar' && (
                                      <img src={reward.value} alt={reward.title} className="w-20 h-20 rounded-full shadow-lg object-cover" />
                                  )}
                                  {reward.type === 'theme' && (
                                      <div className="size-16 rounded-full shadow-lg border-4 border-white dark:border-gray-700" style={{ backgroundColor: reward.value }}></div>
                                  )}
                                  {reward.type === 'book' && (
                                      <span className="material-symbols-outlined text-6xl text-gray-400 group-hover:text-primary transition-colors">menu_book</span>
                                  )}
                                  {locked && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px] p-2 text-center">
                                        <span className="material-symbols-outlined text-white text-2xl mb-1">workspace_premium</span>
                                        <p className="text-[8px] text-white font-bold uppercase tracking-widest leading-none">Requiere logro</p>
                                    </div>
                                  )}
                              </div>
                              
                              <div className="flex-1">
                                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-1">{reward.title}</h3>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{reward.description}</p>
                              </div>

                              <button 
                                disabled={equipped || (!owned && !canAfford) || isProcessing || locked}
                                onClick={() => handleAction(reward)}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-all
                                    ${equipped 
                                        ? 'bg-transparent text-primary border border-primary/20 cursor-default opacity-50' 
                                        : owned
                                            ? 'bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-gray-50'
                                            : locked
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                                                : canAfford 
                                                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 active:scale-95' 
                                                    : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                                    }`}
                              >
                                  {isProcessing ? (
                                      <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                  ) : equipped ? (
                                      'En uso'
                                  ) : owned ? (
                                      'Equipar'
                                  ) : locked ? (
                                      'Bloqueado'
                                  ) : (
                                      <>{reward.cost} XP</>
                                  )}
                              </button>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>
    </div>
  );
};

export default Rewards;
