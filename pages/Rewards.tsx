import React, { useState } from 'react';
import { AppRoute, User, Reward } from '../types';
import { REWARDS_LIST } from '../constants';

interface RewardsProps {
  onBack: () => void;
  user: User;
  onPurchase: (reward: Reward) => void;
}

const Rewards: React.FC<RewardsProps> = ({ onBack, user, onPurchase }) => {
  const [filter, setFilter] = useState<'all' | 'theme' | 'avatar' | 'book'>('all');

  const filteredRewards = REWARDS_LIST.filter(r => filter === 'all' || r.type === filter);

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display overflow-hidden">
      {/* Header */}
      <header className="flex-none p-6 pt-8 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30 shadow-lg">
                <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                <span className="text-white font-bold text-lg">{user.stats.xp} XP</span>
            </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mercado Cerebral</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm">Invierte tu conocimiento.</p>
      </header>

      {/* Filter Tabs */}
      <div className="px-6 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'theme', 'avatar', 'book'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f ? 'bg-white dark:bg-white text-black shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white'}`}
              >
                  {f === 'all' ? 'Todo' : f}
              </button>
          ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 pt-2 pb-32 grid grid-cols-2 gap-4">
          {filteredRewards.map(reward => {
              const isOwned = user.unlockedRewards?.includes(reward.id);
              const canAfford = user.stats.xp >= reward.cost;

              return (
                  <div key={reward.id} className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 flex flex-col gap-3 shadow-sm hover:border-primary/30 transition-all group">
                      <div className="aspect-square rounded-xl bg-gray-50 dark:bg-black/20 flex items-center justify-center relative overflow-hidden">
                          {/* Visual representation */}
                          {reward.type === 'avatar' && (
                              <img src={reward.value} alt={reward.title} className="w-20 h-20 rounded-full shadow-lg" />
                          )}
                          {reward.type === 'theme' && (
                              <div className="size-16 rounded-full shadow-lg border-4 border-white dark:border-gray-700" style={{ backgroundColor: reward.value }}></div>
                          )}
                          {reward.type === 'book' && (
                              <span className="material-symbols-outlined text-6xl text-gray-400 group-hover:text-primary transition-colors">menu_book</span>
                          )}
                          
                          {isOwned && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                              </div>
                          )}
                      </div>
                      
                      <div className="flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{reward.title}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{reward.description}</p>
                      </div>

                      <button 
                        disabled={isOwned || !canAfford}
                        onClick={() => onPurchase(reward)}
                        className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all
                            ${isOwned 
                                ? 'bg-gray-200 dark:bg-white/10 text-gray-500 cursor-default' 
                                : canAfford 
                                    ? 'bg-primary text-black hover:bg-primary-dark shadow-lg shadow-primary/20' 
                                    : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                            }`}
                      >
                          {isOwned ? 'Adquirido' : <>{reward.cost} XP</>}
                      </button>
                  </div>
              );
          })}
      </div>
    </div>
  );
};

export default Rewards;