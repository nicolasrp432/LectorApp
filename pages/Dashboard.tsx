import React, { useMemo, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
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
        name: `S${i+1}`,
        value: s.wpmCalculated || 0,
        date: new Date(s.timestamp).toLocaleDateString()
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
          name: `J${i+1}`,
          value: s.durationSeconds, // Lower is better
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
          name: `I${i+1}`,
          value: s.levelOrSpeed
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

      switch (selectedMetric) {
          case 'reading':
              title = "Velocidad de Lectura (WPM)";
              description = "Tu evolución en palabras por minuto.";
              chartData = readingStats.history;
              color = "#3b82f6"; // Blue
              advice = "Para aumentar tu velocidad, intenta usar una guía visual (dedo) y evita releer líneas anteriores.";
              break;
          case 'vision':
              title = "Tiempo de Reacción (Schulte)";
              description = "Segundos para completar la tabla (Menos es mejor).";
              chartData = visionStats.history;
              color = "#19e65e"; // Primary
              advice = "Mantén la vista en el centro de la cuadrícula. Intenta percibir los números periféricos sin mover los ojos.";
              break;
          case 'memory':
              title = "Capacidad de Trabajo";
              description = "Número de items retenidos en memoria a corto plazo.";
              chartData = memorySpanStats.history;
              color = "#ec4899"; // Pink
              advice = "Crea historias absurdas que unan las palabras para recordarlas mejor (Chunking).";
              break;
          default:
              return null;
      }

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-[#1A2C20] w-full max-w-md rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 border border-white/10">
                  <button 
                    onClick={() => setSelectedMetric(null)} 
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500"
                  >
                      <span className="material-symbols-outlined">close</span>
                  </button>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 mb-6">{description}</p>

                  <div className="h-48 w-full bg-slate-50 dark:bg-black/20 rounded-xl mb-6 p-2 border border-gray-100 dark:border-white/5">
                      {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#112116', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: color }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
                                <XAxis dataKey="name" hide />
                            </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                              Necesitas más datos para ver la gráfica.
                          </div>
                      )}
                  </div>

                  <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary">lightbulb</span>
                          <span className="text-sm font-bold text-primary">Consejo Neurocientífico</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                          {advice}
                      </p>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex-1 flex flex-col gap-6 px-0 pb-24 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark">
      
      {/* 1. Streak & Status Banner */}
      <div className="px-5 mt-2">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#1a2c20] to-[#112116] border border-primary/20 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none"></div>
          
          <div className="flex items-center gap-4 z-10">
            <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30">
              <span className="material-symbols-outlined text-2xl">local_fire_department</span>
            </div>
            <div className="flex flex-col">
              <p className="text-white font-bold text-lg leading-none">{user.stats.streak} Días Racha</p>
              <p className="text-gray-400 text-xs mt-1 font-medium">Nivel: {user.level}</p>
            </div>
          </div>
          
          <div className="text-right z-10">
             <p className="text-primary font-bold text-2xl">{user.stats.xp}</p>
             <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total XP</p>
          </div>
        </div>
      </div>

      {/* 2. Main Metric Chart (TEL) */}
      <section className="px-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Eficiencia Lectora (TEL)</h3>
        </div>
        <div className="relative flex flex-col justify-between h-48 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark p-6 shadow-sm overflow-hidden">
             
             <div className="flex justify-between items-start z-10">
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

             <div className="absolute bottom-0 left-0 right-0 h-24 w-full">
                 {readingStats.history.length > 1 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={readingStats.history}>
                            <defs>
                                <linearGradient id="colorTel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#19e65e" stopOpacity={0.3}/>
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
                     <div className="flex items-center justify-center h-full text-xs text-gray-400 italic">
                        Completa más sesiones para ver tu curva.
                     </div>
                 )}
             </div>
        </div>
      </section>

      {/* 3. METRICS CAROUSEL (Swipeable & Clickable) */}
      <section>
        <div className="px-5 mb-3 flex justify-between items-end">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Métricas por Habilidad</h3>
            <span className="text-[10px] text-gray-400">Desliza &bull; Toca para ver detalle</span>
        </div>
        
        {/* Carousel Container */}
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 px-5 pb-4">
            
            {/* Card 1: Lectura (WPM) */}
            <div 
                onClick={() => setSelectedMetric('reading')}
                className="snap-center shrink-0 w-40 h-48 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/5 p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all active:scale-95"
            >
                 <div className="absolute top-[-20%] right-[-20%] size-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors"></div>
                 <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 z-10">
                     <span className="material-symbols-outlined">speed</span>
                 </div>
                 <div className="z-10">
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">{readingStats.avgWPM}</p>
                     <p className="text-xs text-gray-500 font-bold uppercase mt-1">Velocidad (WPM)</p>
                 </div>
                 <div className="w-full bg-gray-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden z-10">
                     <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (readingStats.avgWPM / user.preferences.targetWPM) * 100)}%` }}></div>
                 </div>
            </div>

            {/* Card 2: Visión (Schulte) */}
            <div 
                onClick={() => setSelectedMetric('vision')}
                className="snap-center shrink-0 w-40 h-48 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/5 p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all active:scale-95"
            >
                 <div className="absolute top-[-20%] right-[-20%] size-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
                 <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary z-10">
                     <span className="material-symbols-outlined">grid_view</span>
                 </div>
                 <div className="z-10">
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">Nvl {visionStats.level}</p>
                     <p className="text-xs text-gray-500 font-bold uppercase mt-1">Visión Periférica</p>
                 </div>
                 <p className="text-[10px] text-gray-400 z-10">Mejor tiempo: <span className="text-white font-bold">{visionStats.bestTime}</span></p>
            </div>

            {/* Card 3: Palacio Mental (Loci) */}
            <div className="snap-center shrink-0 w-40 h-48 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/5 p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                 <div className="absolute top-[-20%] right-[-20%] size-24 bg-yellow-500/10 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-colors"></div>
                 <div className="size-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 z-10">
                     <span className="material-symbols-outlined">castle</span>
                 </div>
                 <div className="z-10">
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {logs.filter(l => l.exerciseType === 'schulte').length > 0 ? 'Activo' : '---'}
                     </p>
                     <p className="text-xs text-gray-500 font-bold uppercase mt-1">Palacio Mental</p>
                 </div>
                 <p className="text-[10px] text-gray-400 z-10">Construcciones: <span className="text-white font-bold">{logs.filter(l => l.exerciseType === 'schulte').length}</span></p>
            </div>

            {/* Card 4: Memoria Trabajo (Word Span) */}
            <div 
                onClick={() => setSelectedMetric('memory')}
                className="snap-center shrink-0 w-40 h-48 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/5 p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group cursor-pointer hover:border-pink-500/50 transition-all active:scale-95"
            >
                 <div className="absolute top-[-20%] right-[-20%] size-24 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/20 transition-colors"></div>
                 <div className="size-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 z-10">
                     <span className="material-symbols-outlined">text_fields</span>
                 </div>
                 <div className="z-10">
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">{memorySpanStats.maxSpan}</p>
                     <p className="text-xs text-gray-500 font-bold uppercase mt-1">Items Retenidos</p>
                 </div>
                 <p className="text-[10px] text-gray-400 z-10">Top <span className="text-white font-bold">{memorySpanStats.percentile}%</span> global</p>
            </div>

            {/* Card 5: Retención (Flashcards) */}
            <div className="snap-center shrink-0 w-40 h-48 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/5 p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                 <div className="absolute top-[-20%] right-[-20%] size-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-colors"></div>
                 <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 z-10">
                     <span className="material-symbols-outlined">psychology_alt</span>
                 </div>
                 <div className="z-10">
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">{retentionStats.rate}%</p>
                     <p className="text-xs text-gray-500 font-bold uppercase mt-1">Tasa Recuerdo</p>
                 </div>
                 <p className="text-[10px] text-gray-400 z-10">Estabilidad: <span className="text-white font-bold">{retentionStats.stability}</span></p>
            </div>

        </div>
      </section>

      {/* 4. Quick Actions */}
      <section className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Entrenar Ahora</h3>
          </div>
          <div className="space-y-3">
              {/* Schulte */}
              <button 
                onClick={() => onNavigate(AppRoute.SCHULTE)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1A2C20] border border-[#2c4a36] hover:border-primary/50 transition-all group active:scale-[0.98]"
              >
                  <div className="size-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                      <span className="material-symbols-outlined">grid_view</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-white text-lg">Visión Periférica</h4>
                      <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded">Tabla Schulte</span>
                          <span className="text-xs text-gray-400">~5 min</span>
                      </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all">chevron_right</span>
              </button>
              
              {/* Loci */}
              <button 
                onClick={() => onNavigate(AppRoute.LOCI_TRAINING)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1A2C20] border border-[#2c4a36] hover:border-primary/50 transition-all group active:scale-[0.98]"
              >
                  <div className="size-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/10">
                      <span className="material-symbols-outlined">castle</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-white text-lg">Palacio de la Memoria</h4>
                      <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded">Método Loci</span>
                          <span className="text-xs text-gray-400">~8 min</span>
                      </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all">chevron_right</span>
              </button>

              {/* Word Span */}
              <button 
                onClick={() => onNavigate(AppRoute.WORD_SPAN)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1A2C20] border border-[#2c4a36] hover:border-primary/50 transition-all group active:scale-[0.98]"
              >
                   <div className="size-12 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/10">
                      <span className="material-symbols-outlined">text_fields</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-white text-lg">Memoria de Trabajo</h4>
                      <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded">Word Span</span>
                          <span className="text-xs text-gray-400">~3 min</span>
                      </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all">chevron_right</span>
              </button>

              {/* Memory */}
              <button 
                onClick={() => onNavigate(AppRoute.MEMORY_TRAINING)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1A2C20] border border-[#2c4a36] hover:border-primary/50 transition-all group active:scale-[0.98]"
              >
                   <div className="size-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10">
                      <span className="material-symbols-outlined">psychology_alt</span>
                  </div>
                  <div className="text-left flex-1">
                      <h4 className="font-bold text-white text-lg">Repaso Espaciado</h4>
                      <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 bg-black/20 px-2 py-0.5 rounded">Supermemoria</span>
                          <span className="text-xs text-gray-400">Variable</span>
                      </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all">chevron_right</span>
              </button>
          </div>
      </section>

      {/* Render Modal */}
      {renderMetricDetail()}
    </div>
  );
};

export default Dashboard;