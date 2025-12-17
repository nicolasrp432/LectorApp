
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AppRoute, ReadingLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { generatePersonalizedPlan } from '../services/ai';
import { Button } from '../components/ui/Button';

interface DashboardProps {
    onNavigate: (route: AppRoute) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, readingLogs, loading } = useAuth();
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  
  // --- Data Aggregation Logic ---
  const stats = useMemo(() => {
    if (!user) return null;
    
    // 1. TEL History (Chart) - Optimized for Efficiency Graph
    // Filter legitimate reading sessions
    const sessions = readingLogs.filter(l => (l.exerciseType === 'reading_session' || l.exerciseType === 'rsvp') && l.telCalculated && l.telCalculated > 0);
    const sortedSessions = [...sessions].sort((a,b) => a.timestamp - b.timestamp);
    
    // Take last 10 sessions or default to baseline
    let history = sortedSessions.slice(-10).map((s, i) => ({
        name: `S${i+1}`,
        value: s.telCalculated || 0,
        date: new Date(s.timestamp).toLocaleDateString()
    }));

    if (history.length === 0) {
        history = [
            { name: 'Inicio', value: user.baselineWPM, date: 'Inicio' },
            { name: 'Ahora', value: user.baselineWPM, date: 'Hoy' }
        ];
    }
    
    const currentTEL = history[history.length-1].value;
    
    // Calculate Min/Max for Chart Y-Axis scaling
    const values = history.map(h => h.value);
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.1;

    // 2. Training Specific Stats
    const schulteLogs = readingLogs.filter(l => l.exerciseType === 'schulte');
    const schulteBestTime = schulteLogs.length ? Math.min(...schulteLogs.map(l => l.durationSeconds)).toFixed(1) : '--';
    const schulteTotal = schulteLogs.length;

    const memoryLogs = readingLogs.filter(l => l.exerciseType === 'word_span' || l.exerciseType === 'loci');
    const maxMemoryLevel = memoryLogs.length ? Math.max(...memoryLogs.map(l => l.levelOrSpeed)) : 0;
    const memoryTotal = memoryLogs.length;

    const readingTotalMinutes = Math.round(readingLogs.filter(l => l.exerciseType === 'reading_session' || l.exerciseType === 'rsvp').reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60);

    const isStreakSafe = (Date.now() - user.stats.lastActiveDate) < (24 * 60 * 60 * 1000 * 1.5);

    return { 
        currentTEL, 
        history, 
        chartDomain: [Math.floor(minVal), Math.ceil(maxVal)],
        isStreakSafe,
        trainings: {
            schulte: { best: schulteBestTime, total: schulteTotal },
            memory: { maxLevel: maxMemoryLevel, total: memoryTotal },
            reading: { totalMins: readingTotalMinutes, sessions: sessions.length }
        }
    };
  }, [user, readingLogs]);

  const handleGeneratePlan = async () => {
    if (!user) return;
    setIsThinking(true);
    setAiPlan(null);
    const plan = await generatePersonalizedPlan(user.stats, readingLogs.slice(-5));
    setAiPlan(plan);
    setIsThinking(false);
  };

  if (loading || !user) return <div className="p-6">Cargando perfil...</div>;

  return (
    <div className="flex-1 flex flex-col gap-6 px-0 pb-32 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark">
      
      {/* 1. Header & Streak Banner */}
      <div className="px-5 mt-4">
        <div className="flex items-center justify-between mb-4">
             <div>
                 <h2 className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Hola, {user.name.split(' ')[0]}</h2>
                 <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel Principal</h1>
             </div>
             <div 
                className="size-10 bg-cover bg-center rounded-full border-2 border-primary/30"
                style={{ backgroundImage: `url("${user.avatarUrl}")` }}
             ></div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-[#112116] to-[#0d1810] border border-white/5 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none"></div>
          
          <div className="flex items-center gap-5 z-10">
            <div className="relative">
                <div className={`absolute inset-0 ${stats?.isStreakSafe ? 'bg-orange-500' : 'bg-gray-500'} blur-md opacity-40 animate-pulse rounded-full`}></div>
                <div className={`flex items-center justify-center size-14 rounded-2xl ${stats?.isStreakSafe ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gray-700'} text-white shadow-lg`}>
                    <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                </div>
            </div>
            <div className="flex flex-col">
              <p className="text-white font-bold text-xl leading-none">{user.stats.streak} Días</p>
              <p className="text-gray-400 text-xs mt-1.5 font-medium uppercase tracking-wider">
                  {stats?.isStreakSafe ? 'Racha Activa' : 'En Peligro'}
              </p>
            </div>
          </div>
          
          <div className="text-right z-10">
             <p className="text-primary font-bold text-2xl leading-none">{user.stats.xp}</p>
             <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-1">XP Total</p>
          </div>
        </div>
      </div>

      {/* 2. Main Metric Chart (TEL) - Optimized */}
      <section className="px-5">
        <div className="h-56 rounded-3xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark p-0 shadow-sm overflow-hidden flex flex-col relative">
             <div className="p-6 pb-2 z-10 flex justify-between items-start">
                <div>
                    <p className="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white">
                        {stats?.currentTEL}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">Tasa de Eficiencia (TEL)</p>
                </div>
                {/* Micro badge for trend (mock logic for visual) */}
                <div className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    Evolución
                </div>
             </div>

             <div className="absolute bottom-0 left-0 right-0 top-20 w-full px-2">
                 {stats && stats.history.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#19e65e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#19e65e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fill: '#6b7280'}} 
                                interval="preserveStartEnd"
                            />
                            <YAxis 
                                domain={stats.chartDomain} 
                                hide 
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#112116', border: '1px solid #ffffff20', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#19e65e', fontWeight: 'bold' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                                formatter={(value: number) => [`${value}`, 'TEL']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#19e65e" 
                                strokeWidth={3} 
                                fill="url(#colorTel)" 
                                animationDuration={1000}
                            />
                        </AreaChart>
                     </ResponsiveContainer>
                 ) : (
                     <div className="flex h-full items-center justify-center text-xs text-gray-500">
                         Completa sesiones de lectura para ver tu gráfica.
                     </div>
                 )}
             </div>
        </div>
      </section>

      {/* 3. Training Carousel (Horizontal Scroll) */}
      <section>
          <div className="flex items-center justify-between px-5 mb-3">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Mis Entrenamientos</h3>
             <span 
                onClick={() => onNavigate(AppRoute.TRAININGS)} 
                className="text-xs text-primary font-bold cursor-pointer hover:underline"
            >
                Ver Todo
             </span>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-5 pb-4 no-scrollbar">
              
              {/* Card 1: Vision / Schulte */}
              <div className="snap-center shrink-0 w-72 bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-200 dark:border-white/5 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                      <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <span className="material-symbols-outlined text-2xl">grid_view</span>
                      </div>
                      <Button size="sm" variant="ghost" className="!p-0 size-8 rounded-full" onClick={() => onNavigate(AppRoute.SCHULTE)}>
                         <span className="material-symbols-outlined">arrow_forward</span>
                      </Button>
                  </div>
                  <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Visión Periférica</h4>
                      <p className="text-xs text-gray-500 mb-4">Tabla Schulte & Campo Visual</p>
                      <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2">
                              <p className="text-[10px] text-gray-400 uppercase">Mejor Tiempo</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{stats?.trainings.schulte.best}s</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2">
                              <p className="text-[10px] text-gray-400 uppercase">Sesiones</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{stats?.trainings.schulte.total}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Card 2: Memory */}
              <div className="snap-center shrink-0 w-72 bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-200 dark:border-white/5 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                      <div className="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <span className="material-symbols-outlined text-2xl">psychology</span>
                      </div>
                       <Button size="sm" variant="ghost" className="!p-0 size-8 rounded-full" onClick={() => onNavigate(AppRoute.MEMORY_TRAINING)}>
                         <span className="material-symbols-outlined">arrow_forward</span>
                      </Button>
                  </div>
                  <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Supermemoria</h4>
                      <p className="text-xs text-gray-500 mb-4">Flashcards & Palacio Mental</p>
                      <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2">
                              <p className="text-[10px] text-gray-400 uppercase">Nivel Max</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{stats?.trainings.memory.maxLevel}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2">
                              <p className="text-[10px] text-gray-400 uppercase">Repasos</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{stats?.trainings.memory.total}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Card 3: Reading */}
              <div className="snap-center shrink-0 w-72 bg-white dark:bg-surface-dark rounded-3xl p-5 border border-gray-200 dark:border-white/5 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-2xl">menu_book</span>
                      </div>
                       <Button size="sm" variant="ghost" className="!p-0 size-8 rounded-full" onClick={() => onNavigate(AppRoute.READING)}>
                         <span className="material-symbols-outlined">arrow_forward</span>
                      </Button>
                  </div>
                  <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Lectura Veloz</h4>
                      <p className="text-xs text-gray-500 mb-4">RSVP & Comprensión</p>
                      <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2">
                              <p className="text-[10px] text-gray-400 uppercase">Tiempo Total</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{stats?.trainings.reading.totalMins}m</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2">
                              <p className="text-[10px] text-gray-400 uppercase">Libros</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{stats?.trainings.reading.sessions}</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* 4. AI Coach Block */}
      <section className="px-5">
        <div className="bg-gradient-to-r from-[#1A2C20] to-[#112116] border border-primary/20 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-2 opacity-10">
             <span className="material-symbols-outlined text-6xl text-primary">smart_toy</span>
          </div>
          <h3 className="text-primary font-bold text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
             <span className="material-symbols-outlined text-sm">psychology</span> Coach IA
          </h3>
          
          {!aiPlan ? (
             <div className="relative z-10">
               <p className="text-gray-300 text-sm mb-4">Genera un plan de entrenamiento adaptativo basado en tus últimas métricas.</p>
               <Button 
                 onClick={handleGeneratePlan} 
                 isLoading={isThinking}
                 size="sm"
                 variant="outline"
                 className="text-primary border-primary hover:bg-primary hover:text-black w-full"
               >
                 {isThinking ? 'Analizando Datos...' : 'Generar Plan Inteligente'}
               </Button>
             </div>
          ) : (
             <div className="relative z-10">
               <div className="prose prose-invert prose-sm max-h-48 overflow-y-auto mb-3 text-gray-200">
                  <pre className="whitespace-pre-wrap font-sans text-xs">{aiPlan}</pre>
               </div>
               <button onClick={() => setAiPlan(null)} className="text-xs text-primary font-bold hover:underline">Cerrar</button>
             </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
