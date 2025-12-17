import React, { useMemo, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AppRoute, ReadingLog, RetentionLog, User } from '../types';

interface DashboardProps {
    onNavigate: (route: AppRoute) => void;
    logs: ReadingLog[];
    retentionLogs: RetentionLog[];
    user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, logs, retentionLogs, user }) => {
  const [selectedMetric, setSelectedMetric] = useState<'reading' | 'vision' | 'memory' | 'loci' | 'retention' | null>(null);

  // --- 1. Cálculo Avanzado de Métricas ---

  // A. Métricas de Lectura (TEL & WPM)
  const readingStats = useMemo(() => {
    const sessions = logs.filter(l => l.exerciseType === 'reading_session');
    const sorted = [...sessions].sort((a,b) => a.timestamp - b.timestamp);
    
    const history = sorted.slice(-10).map((s, i) => ({
        id: s.id,
        name: `S${i+1}`,
        value: s.wpmCalculated || 0,
        fullDate: new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        detail: `${s.comprehensionRate}% Comprensión`
    }));

    const currentTEL = sorted.length > 0 ? sorted[sorted.length - 1].telCalculated || 0 : 0;
    const maxTEL = Math.max(...sorted.map(s => s.telCalculated || 0), 0);
    const avgWPM = sorted.length > 0 ? Math.round(sorted.reduce((acc, s) => acc + (s.wpmCalculated || 0), 0) / sorted.length) : user.baselineWPM;

    return { currentTEL, maxTEL, avgWPM, history };
  }, [logs, user.baselineWPM]);

  // B. Métricas de Visión (Schulte)
  const visionStats = useMemo(() => {
      const schulteLogs = logs.filter(l => l.exerciseType === 'schulte');
      const maxLevel = user.stats.maxSchulteLevel || 1;
      
      const history = schulteLogs.slice(-10).map((s, i) => ({
          id: s.id,
          name: `J${i+1}`,
          value: s.durationSeconds, // Lower is better
          fullDate: new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          detail: `Nivel ${s.levelOrSpeed}`
      }));

      const bestTimeCurrentLevel = schulteLogs
        .filter(l => l.levelOrSpeed === maxLevel)
        .reduce((min, curr) => curr.durationSeconds < min ? curr.durationSeconds : min, 999);

      return {
          level: maxLevel,
          bestTime: bestTimeCurrentLevel === 999 ? '--' : `${bestTimeCurrentLevel.toFixed(1)}s`,
          history
      };
  }, [logs, user.stats.maxSchulteLevel]);

  // C. Métricas de Memoria de Trabajo (Word Span)
  const memorySpanStats = useMemo(() => {
      const spanLogs = logs.filter(l => l.exerciseType === 'word_span');
      const maxSpan = user.stats.maxWordSpan || 3;
      const percentile = Math.min(99, Math.round((maxSpan / 9) * 100));
      
      const history = spanLogs.slice(-10).map((s, i) => ({
          id: s.id,
          name: `I${i+1}`,
          value: s.levelOrSpeed,
          fullDate: new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          detail: `${s.levelOrSpeed} Palabras`
      }));

      return { maxSpan, percentile, history };
  }, [user.stats.maxWordSpan, logs]);

  // D. Métricas de Retención
  const retentionStats = useMemo(() => {
      const goodRecall = retentionLogs.filter(r => r.rating >= 4).length;
      const rate = retentionLogs.length > 0 ? Math.round((goodRecall / retentionLogs.length) * 100) : 0;
      
      let stability = 'Baja';
      if (rate > 60) stability = 'Media';
      if (rate > 85) stability = 'Alta';

      return { rate, totalReviews: retentionLogs.length, stability };
  }, [retentionLogs]);

  // --- Modal Content Renderer ---
  const renderMetricDetail = () => {
      if (!selectedMetric) return null;

      let title = "";
      let description = "";
      let chartData: any[] = [];
      let color = "";
      let advice = "";
      let statLabel = "";
      let statValue = "";

      switch (selectedMetric) {
          case 'reading':
              title = "Velocidad de Lectura";
              description = "Historial de Palabras por Minuto (WPM).";
              chartData = readingStats.history;
              color = "#3b82f6"; // Blue
              advice = "Para aumentar tu velocidad, intenta usar una guía visual (dedo) y evita releer líneas anteriores.";
              statLabel = "Promedio";
              statValue = `${readingStats.avgWPM} WPM`;
              break;
          case 'vision':
              title = "Visión Periférica";
              description = "Tiempo de reacción en Tabla Schulte.";
              chartData = visionStats.history;
              color = "#19e65e"; // Primary
              advice = "Mantén la vista en el centro de la cuadrícula. Intenta percibir los números periféricos sin mover los ojos.";
              statLabel = "Mejor Tiempo";
              statValue = visionStats.bestTime;
              break;
          case 'memory':
              title = "Memoria de Trabajo";
              description = "Capacidad de retención inmediata (Word Span).";
              chartData = memorySpanStats.history;
              color = "#ec4899"; // Pink
              advice = "Crea historias absurdas que unan las palabras para recordarlas mejor (Chunking).";
              statLabel = "Récord";
              statValue = `${memorySpanStats.maxSpan} Items`;
              break;
          default:
              return null;
      }

      return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#112116] w-full sm:max-w-md h-[85vh] sm:h-auto rounded-t-3xl sm:rounded-3xl flex flex-col relative shadow-2xl animate-in slide-in-from-bottom-10 border border-white/10 overflow-hidden">
                  
                  {/* Modal Header */}
                  <div className="p-6 pb-2 shrink-0 flex justify-between items-start">
                      <div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
                          <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedMetric(null)} 
                        className="p-2 -mr-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 transition-colors"
                      >
                          <span className="material-symbols-outlined text-gray-600 dark:text-white">close</span>
                      </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 pt-2 no-scrollbar">
                      
                      {/* Main Stat Card */}
                      <div className="flex items-center justify-between bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl p-4 mb-6 shadow-sm">
                          <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{statLabel}</p>
                              <p className="text-3xl font-bold text-slate-900 dark:text-white" style={{ color: color }}>{statValue}</p>
                          </div>
                          <div className={`size-12 rounded-full flex items-center justify-center opacity-20`} style={{ backgroundColor: color }}>
                              <span className="material-symbols-outlined text-2xl" style={{ color: color }}>trending_up</span>
                          </div>
                      </div>

                      {/* Chart */}
                      <div className="h-56 w-full mb-6 relative">
                          {chartData.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id={`colorMetric-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1A2C20', border: '1px solid #ffffff20', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: color }}
                                        labelStyle={{ color: '#9ca3af' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke={color} 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill={`url(#colorMetric-${selectedMetric})`} 
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide domain={['auto', 'auto']} />
                                </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                              <div className="flex items-center justify-center h-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                  <p className="text-sm text-gray-400">Datos insuficientes para la gráfica</p>
                              </div>
                          )}
                      </div>

                      {/* History List */}
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Historial Reciente</h4>
                      <div className="space-y-3 mb-6">
                          {chartData.length > 0 ? [...chartData].reverse().slice(0, 5).map((data, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                  <div className="flex items-center gap-3">
                                      <div className="text-xs font-mono text-gray-400 bg-white dark:bg-black/20 px-2 py-1 rounded">{data.fullDate}</div>
                                      <span className="text-sm text-gray-600 dark:text-gray-300">{data.detail}</span>
                                  </div>
                                  <span className="font-bold text-slate-900 dark:text-white">{data.value}</span>
                              </div>
                          )) : (
                              <p className="text-sm text-gray-500 italic">No hay sesiones registradas aún.</p>
                          )}
                      </div>

                      {/* Advice Box */}
                      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                          <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                              <span className="text-xs font-bold text-primary uppercase">Consejo Neurocientífico</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
                              {advice}
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex-1 flex flex-col gap-6 px-0 pb-24 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark">
      
      {/* 1. Streak & Status Banner */}
      <div className="px-5 mt-4">
        <div className="flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-[#112116] to-[#0d1810] border border-white/5 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-500"></div>
          
          <div className="flex items-center gap-5 z-10">
            <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-md opacity-40 animate-pulse rounded-full"></div>
                <div className="flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg relative">
                    <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                </div>
            </div>
            <div className="flex flex-col">
              <p className="text-white font-bold text-xl leading-none">{user.stats.streak} Días</p>
              <p className="text-gray-400 text-xs mt-1.5 font-medium uppercase tracking-wider">Racha Actual</p>
            </div>
          </div>
          
          <div className="text-right z-10 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
             <p className="text-primary font-bold text-2xl leading-none">{user.stats.xp}</p>
             <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-1">Total XP</p>
          </div>
        </div>
      </div>

      {/* 2. Main Metric Chart (TEL) */}
      <section className="px-5 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary"></span>
            Eficiencia Lectora
          </h3>
          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">TEL</span>
        </div>
        <div className="relative flex flex-col justify-between h-52 rounded-3xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark p-0 shadow-sm overflow-hidden">
             
             <div className="flex justify-between items-start z-10 p-6 pb-0">
                <div>
                    <p className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">
                        {readingStats.currentTEL}
                    </p>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">Puntos Actuales</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-primary">{readingStats.maxTEL}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Récord</p>
                </div>
             </div>

             <div className="absolute bottom-0 left-0 right-0 h-28 w-full">
                 {readingStats.history.length > 1 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={readingStats.history}>
                            <defs>
                                <linearGradient id="colorTel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#19e65e" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#19e65e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#19e65e" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorTel)" 
                            />
                        </AreaChart>
                     </ResponsiveContainer>
                 ) : (
                     <div className="flex items-center justify-center h-full text-xs text-gray-400 italic bg-gray-50/50 dark:bg-white/5">
                        Completa más sesiones para ver tu curva.
                     </div>
                 )}
             </div>
        </div>
      </section>

      {/* 3. METRICS CAROUSEL (Updated for Smooth Scroll) */}
      <section>
        <div className="px-5 mb-4 flex justify-between items-end">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-500"></span>
                Habilidades
            </h3>
            <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">Desliza para ver más</span>
        </div>
        
        {/* Carousel Container */}
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 px-5 pb-8 scroll-smooth" style={{ scrollPaddingLeft: '1.25rem', scrollPaddingRight: '1.25rem' }}>
            
            {/* Card 1: Lectura (WPM) */}
            <div 
                onClick={() => setSelectedMetric('reading')}
                className="snap-center shrink-0 w-44 h-52 bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-white/5 p-5 flex flex-col justify-between shadow-lg hover:shadow-xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all duration-300"
            >
                 <div className="absolute top-[-20%] right-[-20%] size-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                 <div className="flex justify-between items-start z-10">
                    <div className="size-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <span className="material-symbols-outlined">speed</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-500 transition-colors">open_in_full</span>
                 </div>
                 <div className="z-10 mt-2">
                     <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{readingStats.avgWPM}</p>
                     <p className="text-xs text-gray-500 font-bold uppercase mt-1">Velocidad (WPM)</p>
                 </div>
                 <div className="w-full bg-gray-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden z-10 mt-auto">
                     <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (readingStats.avgWPM / user.preferences.targetWPM) * 100)}%` }}></div>
                 </div>
            </div>

            {/* Card 2: Visión (Schulte) */}
            <div 
                onClick={() => setSelectedMetric('vision')}
                className="snap-center shrink-0 w-44 h-52 bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-white/5 p-5 flex flex-col justify-between shadow-lg hover:shadow-xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all duration-300"
            >
                 <div className="absolute top-[-20%] right-[-20%] size-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
                 <div className="flex justify-between items-start z-10">
                    <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">grid_view</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">open_in_full</span>
                 </div>
                 <div className="z-10 mt-2">
                     <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Nvl {visionStats.level}</p>
                     <p className="text-xs text-gray-500 font-bold uppercase mt-1">Visión Periférica</p>
                 </div>
                 <div className="z-10 mt-auto bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                    <p className="text-[10px] text-gray-500">Mejor tiempo: <span className="text-slate-900 dark:text-white font-bold">{visionStats.bestTime}</span></p>
                 </div>
            </div>

            {/* Card 3: Palacio Mental (Loci) */}
            <div className="snap-center shrink-0 w-44 h-52 bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-white/5 p-5 flex flex-col justify-between shadow-lg hover:shadow-xl relative overflow-hidden group">
                 <div className="absolute top-[-20%] right-[-20%] size-32 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-colors"></div>
                 <div className="flex justify-between items-start z-10">
                    <div className="size-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <span className="material-symbols-outlined">castle</span>
                    </div>
                 </div>
                 <div className="z-10 mt-2">
                     <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {logs.filter(l => l.exerciseType === 'schulte').length > 0 ? 'Activo' : '---'}
                     </p>
                     <p className="text-xs text-gray-500 font-bold uppercase mt-1">Palacio Mental</p>
                 </div>
                 <p className="text-[10px] text-gray-400 z-10">Construcciones: <span className="text-slate-900 dark:text-white font-bold">{logs.filter(l => l.exerciseType === 'schulte').length}</span></p>
            </div>

            {/* Card 4: Memoria Trabajo (Word Span) */}
            <div 
                onClick={() => setSelectedMetric('memory')}
                className="snap-center shrink-0 w-44 h-52 bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-white/5 p-5 flex flex-col justify-between shadow-lg hover:shadow-xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all duration-300"
            >
                 <div className="absolute top-[-20%] right-[-20%] size-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-colors"></div>
                 <div className="flex justify-between items-start z-10">
                     <div className="size-10 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                        <span className="material-symbols-outlined">text_fields</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-pink-500 transition-colors">open_in_full</span>
                 </div>
                 <div className="z-10 mt-2">
                     <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{memorySpanStats.maxSpan}</p>
                     <p className="text-xs text-gray-500 font-bold uppercase mt-1">Items Retenidos</p>
                 </div>
                 <div className="z-10 mt-auto bg-pink-500/5 px-2 py-1 rounded-lg border border-pink-500/10">
                     <p className="text-[10px] text-gray-500">Top <span className="text-slate-900 dark:text-white font-bold">{memorySpanStats.percentile}%</span> global</p>
                 </div>
            </div>

            {/* Card 5: Retención (Flashcards) */}
            <div className="snap-center shrink-0 w-44 h-52 bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-white/5 p-5 flex flex-col justify-between shadow-lg hover:shadow-xl relative overflow-hidden group">
                 <div className="absolute top-[-20%] right-[-20%] size-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                 <div className="flex justify-between items-start z-10">
                     <div className="size-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <span className="material-symbols-outlined">psychology_alt</span>
                    </div>
                 </div>
                 <div className="z-10 mt-2">
                     <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{retentionStats.rate}%</p>
                     <p className="text-xs text-gray-500 font-bold uppercase mt-1">Tasa Recuerdo</p>
                 </div>
                 <p className="text-[10px] text-gray-400 z-10">Estabilidad: <span className="text-slate-900 dark:text-white font-bold">{retentionStats.stability}</span></p>
            </div>

        </div>
      </section>

      {/* 4. Quick Actions */}
      <section className="px-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <span className="size-2 rounded-full bg-white dark:bg-gray-500"></span>
                Ejercicios Rápidos
            </h3>
          </div>
          <div className="space-y-3">
              {/* Schulte */}
              <button 
                onClick={() => onNavigate(AppRoute.SCHULTE)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A2C20] border border-gray-200 dark:border-[#2c4a36] hover:border-primary/50 transition-all group active:scale-[0.98] shadow-sm"
              >
                  <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                      <span className="material-symbols-outlined">grid_view</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Visión Periférica</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black/20 px-2 py-0.5 rounded font-medium">Tabla Schulte</span>
                          <span className="text-[10px] text-gray-400">~5 min</span>
                      </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
              </button>
              
              {/* Loci */}
              <button 
                onClick={() => onNavigate(AppRoute.LOCI_TRAINING)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A2C20] border border-gray-200 dark:border-[#2c4a36] hover:border-primary/50 transition-all group active:scale-[0.98] shadow-sm"
              >
                  <div className="size-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/10">
                      <span className="material-symbols-outlined">castle</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Palacio de la Memoria</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black/20 px-2 py-0.5 rounded font-medium">Método Loci</span>
                          <span className="text-[10px] text-gray-400">~8 min</span>
                      </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all">chevron_right</span>
              </button>

              {/* Word Span */}
              <button 
                onClick={() => onNavigate(AppRoute.WORD_SPAN)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A2C20] border border-gray-200 dark:border-[#2c4a36] hover:border-primary/50 transition-all group active:scale-[0.98] shadow-sm"
              >
                   <div className="size-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/10">
                      <span className="material-symbols-outlined">text_fields</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Memoria de Trabajo</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black/20 px-2 py-0.5 rounded font-medium">Word Span</span>
                          <span className="text-[10px] text-gray-400">~3 min</span>
                      </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all">chevron_right</span>
              </button>

              {/* Memory */}
              <button 
                onClick={() => onNavigate(AppRoute.MEMORY_TRAINING)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A2C20] border border-gray-200 dark:border-[#2c4a36] hover:border-primary/50 transition-all group active:scale-[0.98] shadow-sm"
              >
                   <div className="size-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10">
                      <span className="material-symbols-outlined">psychology_alt</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Repaso Espaciado</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black/20 px-2 py-0.5 rounded font-medium">Supermemoria</span>
                          <span className="text-[10px] text-gray-400">Variable</span>
                      </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all">chevron_right</span>
              </button>
          </div>
      </section>

      {/* Render Modal */}
      {renderMetricDetail()}
    </div>
  );
};

export default Dashboard;