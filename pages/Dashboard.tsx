
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AppRoute, TrainingModule } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { TRAINING_MODULES, LEARNING_MODULES } from '../constants.ts';
import { AICoachChat } from '../components/AICoachChat.tsx';

interface DashboardProps {
    onNavigate: (route: AppRoute, params?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, readingLogs, loading } = useAuth();
  const [metricIndex, setMetricIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Optimización: Cálculos estadísticos segregados para evitar re-renders innecesarios
  const stats = useMemo(() => {
    if (!user || readingLogs.length === 0) return null;
    
    // Filtrado eficiente
    const sessionLogs = [];
    const memoryLogs = [];
    
    // Procesar en un solo bucle para O(n)
    for (const log of readingLogs) {
        if (log.telCalculated !== undefined && 
           ['reading_session', 'focal', 'campo_visual', 'expansion', 'lectura_profunda'].includes(log.exerciseType)) {
            sessionLogs.push(log);
        }
        if (['word_span', 'loci'].includes(log.exerciseType)) {
            memoryLogs.push(log);
        }
    }

    const metricsData = [
        {
            title: 'Eficiencia (TEL)',
            key: 'telCalculated',
            color: 'var(--primary)',
            data: sessionLogs.slice(0, 10).reverse().map((s, i) => ({ name: i, value: s.telCalculated || 0 })),
            icon: 'analytics',
            unit: ''
        },
        {
            title: 'Velocidad (WPM)',
            key: 'wpmCalculated',
            color: '#3b82f6',
            data: sessionLogs.slice(0, 10).reverse().map((s, i) => ({ name: i, value: s.wpmCalculated || 0 })),
            icon: 'speed',
            unit: 'wpm'
        },
        {
            title: 'Precisión Memoria',
            key: 'comprehensionRate',
            color: '#f97316',
            data: memoryLogs.slice(0, 10).reverse().map((s, i) => ({ name: i, value: s.comprehensionRate || 0 })),
            icon: 'psychology',
            unit: '%'
        }
    ];

    const getRecommendation = () => {
        const lastSchulte = readingLogs.find(l => l.exerciseType === 'schulte');
        if (lastSchulte && (lastSchulte.errors || 0) > 3) {
            return {
                title: "Refuerza tu Foco",
                desc: "Tuviste varios errores en tu última Tabla Schulte. Vamos a calmar la vista.",
                module: TRAINING_MODULES.find(m => m.id === 'schulte')
            };
        }
        return {
            title: "Desafío de Velocidad",
            desc: "Tu TEL actual es sólido. ¿Probamos subir 50 WPM hoy?",
            module: TRAINING_MODULES.find(m => m.id === 'rsvp')
        };
    };

    return { metricsData, recommendation: getRecommendation() };
  }, [readingLogs, user?.id]); // Solo re-memoizar si cambian los logs o el ID de usuario

  if (loading || !user) return <div className="p-10 flex justify-center items-center h-full"><div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  const currentMetric = stats?.metricsData[metricIndex];

  return (
    <div className="flex-1 flex flex-col gap-6 px-0 pb-32 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark">
      
      {/* Header Racha & XP */}
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

      {/* Recomendación */}
      <section className="px-5">
          <div 
            onClick={() => stats?.recommendation.module && onNavigate(stats.recommendation.module.route)}
            className="bg-primary/5 border border-primary/20 rounded-[2rem] p-5 flex items-center gap-4 cursor-pointer hover:bg-primary/10 transition-all group"
          >
              <div className="size-12 rounded-full bg-primary flex items-center justify-center text-black shrink-0">
                  <span className="material-symbols-outlined font-black">lightbulb</span>
              </div>
              <div className="flex-1">
                  <h3 className="text-xs font-black uppercase text-primary tracking-widest mb-0.5">{stats?.recommendation.title || 'Inicia hoy'}</h3>
                  <p className="text-sm text-gray-300 leading-tight italic line-clamp-2">"{stats?.recommendation.desc || 'Toma tu primer test para calibrar tu cerebro.'}"</p>
              </div>
              <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
          </div>
      </section>

      {/* Gráfica de Progreso */}
      <section className="px-5">
        <div className="h-[280px] rounded-3xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark p-0 shadow-sm overflow-hidden flex flex-col relative group">
             <div className="p-6 pb-2 z-10 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <span className="material-symbols-outlined text-sm" style={{ color: currentMetric?.color }}>{currentMetric?.icon || 'analytics'}</span>
                        <p className="text-[10px] uppercase font-bold tracking-widest">{currentMetric?.title || 'Sin datos'}</p>
                    </div>
                    <p className="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white">
                        {currentMetric?.data.length ? currentMetric.data[currentMetric.data.length - 1].value : '0'}{currentMetric?.unit}
                    </p>
                </div>
                <div className="flex gap-1.5 mt-2">
                    {stats?.metricsData.map((_, i) => (
                        <button key={i} onClick={() => setMetricIndex(i)} className={`size-2 rounded-full transition-all ${i === metricIndex ? 'w-5 bg-primary' : 'bg-gray-600'}`}></button>
                    ))}
                </div>
             </div>

             <div className="absolute bottom-0 left-0 right-0 top-24 w-full">
                 {currentMetric && currentMetric.data.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentMetric.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`color-${metricIndex}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                            <XAxis dataKey="name" hide />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#112116', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                itemStyle={{ color: currentMetric.color }}
                            />
                            <Area type="monotone" dataKey="value" stroke={currentMetric.color} strokeWidth={3} fill={`url(#color-${metricIndex})`} />
                        </AreaChart>
                     </ResponsiveContainer>
                 ) : (
                     <div className="flex h-full items-center justify-center text-xs text-gray-500">Entrena para ver tu evolución gráfica</div>
                 )}
             </div>
        </div>
      </section>

      {/* Entrenamientos Rápidos */}
      <section>
          <div className="flex items-center justify-between px-5 mb-3">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Entrenamientos</h3>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-5 pb-4 no-scrollbar">
              {TRAINING_MODULES.map((module) => (
                    <div 
                        key={module.id}
                        onClick={() => onNavigate(module.route)}
                        className="snap-center shrink-0 w-64 bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-200 dark:border-white/5 shadow-sm hover:border-primary/40 transition-all cursor-pointer group"
                    >
                        <div className={`size-12 rounded-2xl flex items-center justify-center mb-4 ${module.colorClass}`}>
                            <span className="material-symbols-outlined text-2xl">{module.icon}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{module.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{module.description}</p>
                    </div>
              ))}
          </div>
      </section>

      {/* Módulos de Teoría */}
      <section>
          <div className="flex items-center justify-between px-5 mb-3">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Cursos</h3>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-5 pb-4 no-scrollbar">
              {LEARNING_MODULES.map((module) => {
                  const progress = user.learningProgress?.find(p => p.moduleId === module.id);
                  return (
                    <div 
                        key={module.id}
                        onClick={() => onNavigate(AppRoute.LEARNING_MODULE, { moduleId: module.id })}
                        className={`snap-center shrink-0 w-72 bg-gradient-to-br ${module.color} rounded-[2rem] p-6 text-white shadow-xl flex flex-col justify-between cursor-pointer transition-transform active:scale-95`}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">{module.duration}</div>
                                <span className="material-symbols-outlined opacity-50">{progress?.isCompleted ? 'check_circle' : 'play_circle'}</span>
                            </div>
                            <h4 className="text-xl font-black leading-tight mb-2">{module.title}</h4>
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white" style={{ width: progress?.isCompleted ? '100%' : `${((progress?.completedSteps || 0) / module.steps.length) * 100}%` }}></div>
                            </div>
                            <span className="text-[9px] font-bold uppercase">{progress?.isCompleted ? 'Listo' : 'Seguir'}</span>
                        </div>
                    </div>
                  );
              })}
          </div>
      </section>

      {/* Coach Chat */}
      <section className="px-5">
          <div className={`rounded-3xl overflow-hidden transition-all duration-500 ${isChatOpen ? 'max-h-[500px] shadow-2xl' : 'max-h-[84px] shadow-md'}`}>
              <AICoachChat isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
          </div>
      </section>
    </div>
  );
};

export default Dashboard;
