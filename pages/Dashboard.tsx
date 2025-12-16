import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { AppRoute, ReadingLog, RetentionLog, User } from '../types';

interface DashboardProps {
    onNavigate: (route: AppRoute) => void;
    logs: ReadingLog[];
    retentionLogs: RetentionLog[];
    user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, logs, retentionLogs, user }) => {
  
  // 1. Calculate Real TEL (Tasa de Eficiencia Lectora)
  const telStats = useMemo(() => {
    const sessions = logs.filter(l => l.exerciseType === 'reading_session');
    if (sessions.length === 0) return { current: 0, trend: 0, history: [] };

    const sorted = sessions.sort((a,b) => a.timestamp - b.timestamp);
    const lastSession = sorted[sorted.length - 1];
    const previousSession = sorted.length > 1 ? sorted[sorted.length - 2] : null;

    const currentTEL = lastSession.telCalculated || 0;
    const trend = previousSession && previousSession.telCalculated 
        ? Math.round(((currentTEL - previousSession.telCalculated) / previousSession.telCalculated) * 100)
        : 0;

    const history = sorted.slice(-7).map((s, i) => ({
        day: `S${i+1}`,
        value: s.telCalculated || 0
    }));

    return { current: currentTEL, trend, history };
  }, [logs]);

  // 2. Peer Comparison (WPM vs Global Average)
  const wpmComparison = useMemo(() => {
      const avgWPM = 238; 
      const userWPM = logs.filter(l => l.wpmCalculated).reduce((acc, curr, _, arr) => acc + (curr.wpmCalculated || 0)/arr.length, 0) || user.baselineWPM;
      
      const percentDiff = Math.round(((userWPM - avgWPM) / avgWPM) * 100);
      const percentile = Math.min(99, Math.max(1, 50 + (percentDiff / 2))); 

      return { userWPM: Math.round(userWPM), avgWPM, percentile };
  }, [logs, user.baselineWPM]);

  // 3. Retention Rate
  const retentionRate = useMemo(() => {
      if (retentionLogs.length === 0) return 0;
      const goodRecall = retentionLogs.filter(r => r.rating >= 4).length;
      return Math.round((goodRecall / retentionLogs.length) * 100);
  }, [retentionLogs]);

  return (
    <div className="flex-1 flex flex-col gap-6 px-5 pb-24 overflow-y-auto no-scrollbar">
      {/* Streak Card */}
      <div className="p-1 mt-2">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-orange-500/20 text-orange-500">
              <span className="material-symbols-outlined">local_fire_department</span>
            </div>
            <div className="flex flex-col">
              <p className="text-base font-bold leading-tight">Racha de {user.stats.streak} Días</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">La constancia crea neuroplasticidad.</p>
            </div>
          </div>
          <div className="flex -space-x-1">
            {[1,2,3,4,5].map(i => (
                 <span key={i} className={`size-2 rounded-full ${i <= (user.stats.streak % 5) || user.stats.streak > 5 ? 'bg-orange-500' : 'bg-orange-500/30'}`}></span>
            ))}
          </div>
        </div>
      </div>

      {/* Main TEL Chart */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Eficiencia Lectora (TEL)</h3>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">Métrica Principal</span>
        </div>
        <div className="relative flex flex-col gap-2 rounded-2xl border border-gray-200 dark:border-card-border bg-white dark:bg-surface-dark p-6 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {Math.round(telStats.current)} <span className="text-sm text-gray-400 font-normal ml-1">pts</span>
              </p>
              <p className={`text-sm font-medium mt-1 flex items-center gap-1 ${telStats.trend >= 0 ? 'text-primary' : 'text-red-400'}`}>
                <span className="material-symbols-outlined text-sm">{telStats.trend >= 0 ? 'trending_up' : 'trending_down'}</span>
                {telStats.trend > 0 ? '+' : ''}{telStats.trend}% vs última sesión
              </p>
            </div>
          </div>
          
          {/* Chart Visualization */}
          <div className="h-32 w-full mt-4 relative">
             {telStats.history.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telStats.history}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#19e65e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#19e65e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                        <Area type="monotone" dataKey="value" stroke="#19e65e" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                 </ResponsiveContainer>
             ) : (
                 <div className="flex items-center justify-center h-full text-gray-500 text-xs">Completa una lectura para ver datos.</div>
             )}
          </div>
        </div>
      </section>

      {/* Peer Comparison & Speed */}
      <section className="grid grid-cols-2 gap-4">
        {/* Comparison Card */}
        <div className="col-span-2 rounded-xl bg-[#1a3222] border border-[#244730] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Comparativa (No-Ficción Adultos)</h3>
            <span className="material-symbols-outlined text-gray-400 text-lg">leaderboard</span>
          </div>
          <div className="flex justify-between items-end mb-2">
            <div>
                <p className="text-xs text-gray-400">Promedio Global</p>
                <p className="text-lg font-mono text-gray-300">238 WPM</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-primary font-bold">Tú</p>
                <p className="text-2xl font-mono font-bold text-white">{wpmComparison.userWPM} <span className="text-sm font-normal text-gray-400">WPM</span></p>
            </div>
          </div>
          
          <div className="relative h-3 bg-gray-700 rounded-full w-full mt-2 overflow-hidden">
             <div className="absolute top-0 bottom-0 w-1 bg-white/50 z-10" style={{ left: '50%' }}></div>
             
             <div 
                className="h-full bg-primary rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, (wpmComparison.userWPM / 500) * 100)}%` }} 
             ></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">Eres más rápido que el <span className="text-white font-bold">{Math.round(wpmComparison.percentile)}%</span> de tus pares.</p>
        </div>

        {/* Retention Rate */}
        <div className="flex flex-col gap-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-card-border p-4">
          <div className="flex justify-between items-start">
             <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tasa Recuerdo</p>
             <span className="material-symbols-outlined text-purple-400">memory</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{retentionRate}%</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full mt-2">
            <div className="bg-purple-400 h-1 rounded-full" style={{ width: `${retentionRate}%` }}></div>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="flex flex-col gap-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-card-border p-4">
          <div className="flex justify-between items-start">
             <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Meta Diaria</p>
             <span className="material-symbols-outlined text-blue-400">flag</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">1/3</p>
          <p className="text-[10px] text-gray-500">Sesiones</p>
        </div>
      </section>

      {/* Quick Actions / Modules */}
      <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Empezar Entrenamiento</h3>
          </div>
          <div className="space-y-3">
              <button 
                onClick={() => onNavigate(AppRoute.SCHULTE)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1A2C20] border border-[#2c4a36] hover:border-primary/50 transition-colors group"
              >
                  <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">grid_view</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-white leading-tight">Visión Periférica</h4>
                      <p className="text-xs text-gray-400">Tabla de Schulte • 5 min</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-white">chevron_right</span>
              </button>
              
              <button 
                onClick={() => onNavigate(AppRoute.MEMORY_TRAINING)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1A2C20] border border-[#2c4a36] hover:border-primary/50 transition-colors group"
              >
                  <div className="size-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">psychology_alt</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-white leading-tight">Supermemoria</h4>
                      <p className="text-xs text-gray-400">Repaso Espaciado • 10 min</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-white">chevron_right</span>
              </button>

              <button 
                onClick={() => onNavigate(AppRoute.LOCI_TRAINING)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1A2C20] border border-[#2c4a36] hover:border-primary/50 transition-colors group"
              >
                  <div className="size-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">castle</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-white leading-tight">Palacio de la Memoria</h4>
                      <p className="text-xs text-gray-400">Método Loci • Guiado</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-white">chevron_right</span>
              </button>
          </div>
      </section>
    </div>
  );
};

export default Dashboard;