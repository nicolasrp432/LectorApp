import React, { useMemo, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AppRoute, ReadingLog } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Button } from '../components/ui/Button.tsx';
import { TRAINING_MODULES } from '../constants.ts';
import { AICoachChat } from '../components/AICoachChat.tsx';

interface DashboardProps {
    onNavigate: (route: AppRoute) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, readingLogs, loading } = useAuth();
  const [metricIndex, setMetricIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const stats = useMemo(() => {
    if (!user) return null;
    
    // Filtrar sesiones de lectura reales
    const sessions = readingLogs.filter(l => 
        (l.exerciseType === 'reading_session' || 
         l.exerciseType === 'focal' || 
         l.exerciseType === 'campo_visual' || 
         l.exerciseType === 'expansion' || 
         l.exerciseType === 'lectura_profunda') && 
        l.telCalculated !== undefined
    ).sort((a,b) => a.timestamp - b.timestamp);

    const memoryLogs = readingLogs.filter(l => l.exerciseType === 'word_span' || l.exerciseType === 'loci');
    
    const metricsData = [
        {
            title: 'Eficiencia (TEL)',
            key: 'telCalculated',
            color: '#19e65e',
            data: sessions.slice(-10).map((s, i) => ({ name: `S${i+1}`, value: s.telCalculated || 0 })),
            icon: 'analytics',
            unit: ''
        },
        {
            title: 'Velocidad (WPM)',
            key: 'wpmCalculated',
            color: '#3b82f6',
            data: sessions.slice(-10).map((s, i) => ({ name: `S${i+1}`, value: s.wpmCalculated || 0 })),
            icon: 'speed',
            unit: 'wpm'
        },
        {
            title: 'Precisión Memoria',
            key: 'comprehensionRate',
            color: '#f97316',
            data: memoryLogs.slice(-10).map((s, i) => ({ name: `M${i+1}`, value: s.comprehensionRate || 0 })),
            icon: 'psychology',
            unit: '%'
        },
        {
            title: 'Consistencia',
            key: 'durationSeconds',
            color: '#a855f7',
            data: readingLogs.slice(-10).map((s, i) => ({ name: `D${i+1}`, value: Math.round(s.durationSeconds / 60) })),
            icon: 'calendar_today',
            unit: 'm'
        }
    ];

    const getModuleStats = (moduleId: string) => {
        let type = moduleId;
        if(moduleId === 'rsvp') type = 'reading_session';
        const logs = readingLogs.filter(l => l.exerciseType === type || (moduleId === 'rsvp' && l.exerciseType === 'lectura_profunda'));
        
        return {
            totalSessions: logs.length,
            maxLevel: logs.length ? Math.max(...logs.map(l => l.levelOrSpeed)) : (moduleId === 'schulte' ? user.stats.maxSchulteLevel : (moduleId === 'word_span' ? user.stats.maxWordSpan : 0)),
            avgTime: logs.length ? (logs.reduce((a, b) => a + b.durationSeconds, 0) / logs.length).toFixed(1) : '--',
            bestScore: logs.length ? Math.max(...logs.map(l => l.telCalculated || 0)) : 0
        };
    };

    return { 
        metricsData,
        isStreakSafe: (Date.now() - user.stats.lastActiveDate) < (24 * 60 * 60 * 1000 * 1.5),
        moduleData: TRAINING_MODULES.reduce((acc, m) => ({...acc, [m.id]: getModuleStats(m.id)}), {})
    };
  }, [user, readingLogs]);

  if (loading || !user) return <div className="p-6">Cargando perfil...</div>;

  const currentMetric = stats?.metricsData[metricIndex];

  return (
    <div className="flex-1 flex flex-col gap-6 px-0 pb-32 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark">
      
      {/* Panel Principal Title */}
      <div className="px-5 mt-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Panel Principal</h1>

        <div className="flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-[#112116] to-[#0d1810] border border-white/5 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none"></div>
          
          <div className="flex items-center gap-5 z-10">
            <div className="relative">
                <div className={`absolute inset-0 ${user.stats.streak > 0 ? 'bg-orange-500' : 'bg-gray-500'} blur-md opacity-40 animate-pulse rounded-full`}></div>
                <div className={`flex items-center justify-center size-14 rounded-2xl ${user.stats.streak > 0 ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gray-700'} text-white shadow-lg`}>
                    <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                </div>
            </div>
            <div className="flex flex-col">
              <p className="text-white font-bold text-xl leading-none">{user.stats.streak} Días</p>
              <p className="text-gray-400 text-xs mt-1.5 font-medium uppercase tracking-wider">
                  {user.stats.streak > 0 ? 'Racha Activa' : 'Sin racha'}
              </p>
            </div>
          </div>
          
          <div className="text-right z-10">
             <p className="text-primary font-bold text-2xl leading-none">{user.stats.xp}</p>
             <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-1">XP Total</p>
          </div>
        </div>
      </div>

      {/* Carrusel de Métricas Reales */}
      <section className="px-5">
        <div className="h-[280px] rounded-3xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark p-0 shadow-sm overflow-hidden flex flex-col relative min-h-[280px] group">
             
             <button 
                onClick={() => setMetricIndex(p => (p - 1 + stats!.metricsData.length) % stats!.metricsData.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity"
             >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
             </button>
             <button 
                onClick={() => setMetricIndex(p => (p + 1) % stats!.metricsData.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity"
             >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
             </button>

             <div className="p-6 pb-2 z-10 flex justify-between items-start">
                <div className="animate-in slide-in-from-left-2" key={currentMetric?.title}>
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <span className="material-symbols-outlined text-sm" style={{ color: currentMetric?.color }}>{currentMetric?.icon}</span>
                        <p className="text-[10px] uppercase font-bold tracking-widest">{currentMetric?.title}</p>
                    </div>
                    <p className="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white">
                        {currentMetric?.data.length ? currentMetric.data[currentMetric.data.length - 1].value : '0'}{currentMetric?.unit}
                    </p>
                </div>
                <div className="flex gap-1.5 mt-2">
                    {stats?.metricsData.map((_, i) => (
                        <div key={i} className={`size-1.5 rounded-full transition-all ${i === metricIndex ? 'w-4 bg-primary' : 'bg-gray-600'}`}></div>
                    ))}
                </div>
             </div>

             <div className="absolute bottom-0 left-0 right-0 top-24 w-full px-2" style={{ minHeight: '160px' }}>
                 {currentMetric && currentMetric.data.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentMetric.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`color-${metricIndex}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis dataKey="name" hide />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#112116', border: '1px solid #ffffff20', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: currentMetric.color, fontWeight: 'bold' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={currentMetric.color} 
                                strokeWidth={3} 
                                fill={`url(#color-${metricIndex})`} 
                                animationDuration={1000}
                            />
                        </AreaChart>
                     </ResponsiveContainer>
                 ) : (
                     <div className="flex h-full items-center justify-center text-xs text-gray-500">
                         Sin datos suficientes. Empieza un entrenamiento.
                     </div>
                 )}
             </div>
        </div>
      </section>

      {/* Entrenamientos */}
      <section>
          <div className="flex items-center justify-between px-5 mb-3">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Entrenamientos</h3>
             <span onClick={() => onNavigate(AppRoute.TRAININGS)} className="text-xs text-primary font-bold cursor-pointer hover:underline">Ver Todo</span>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-5 pb-4 no-scrollbar">
              {TRAINING_MODULES.map((module) => {
                  const mStats = stats?.moduleData[module.id] || { totalSessions: 0, maxLevel: 0, avgTime: '--' };
                  return (
                    <div 
                        key={module.id}
                        onClick={() => onNavigate(module.route)}
                        className="snap-center shrink-0 w-72 h-44 bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-200 dark:border-white/5 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all cursor-pointer group active:scale-[0.97]"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`size-12 rounded-2xl flex items-center justify-center ${module.colorClass}`}>
                                <span className="material-symbols-outlined text-2xl">{module.icon}</span>
                            </div>
                            <div className="bg-gray-100 dark:bg-white/5 size-8 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{module.title}</h4>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {module.metrics.slice(0, 2).map((metric, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-black/20 rounded-xl p-2">
                                        <p className="text-[10px] text-gray-400 uppercase truncate">{metric.label}</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {mStats[metric.key as keyof typeof mStats] || '0'}{metric.unit || ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  );
              })}
          </div>
      </section>

      {/* Coach IA - Diseño optimizado sin bordes */}
      <section className="px-5 transition-all duration-500 ease-in-out">
          <div className={`rounded-3xl transition-all duration-500 ease-in-out overflow-hidden ${isChatOpen ? 'max-h-[500px] shadow-2xl' : 'max-h-[84px] shadow-lg'}`}>
              <AICoachChat isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
          </div>
      </section>
    </div>
  );
};

export default Dashboard;