
import React, { useMemo } from 'react';
import { AppRoute, TrainingModule, ReadingLog } from '../types.ts';
import { TRAINING_MODULES } from '../constants.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Button } from '../components/ui/Button.tsx';

interface TrainingsListProps {
    onNavigate: (route: AppRoute) => void;
    onBack: () => void;
}

const TrainingsList: React.FC<TrainingsListProps> = ({ onNavigate, onBack }) => {
    const { readingLogs, user } = useAuth();

    const getTrainingStats = (moduleId: string) => {
        let type = moduleId;
        if(moduleId === 'rsvp') type = 'reading_session';
        const logs = readingLogs.filter(l => 
            l.exerciseType === type || 
            (moduleId === 'rsvp' && (l.exerciseType === 'reading_session' || l.exerciseType === 'focal' || l.exerciseType === 'lectura_profunda'))
        );

        const currentVal = logs.length > 0 ? (logs[logs.length - 1].telCalculated || logs[logs.length - 1].levelOrSpeed) : 0;
        const avgVal = logs.length > 1 
            ? logs.slice(0, -1).reduce((acc, curr) => acc + (curr.telCalculated || curr.levelOrSpeed), 0) / (logs.length - 1)
            : currentVal;

        const improvement = avgVal > 0 ? Math.round(((currentVal - avgVal) / avgVal) * 100) : 0;

        return {
            totalSessions: logs.length,
            currentVal,
            avgVal,
            improvement,
            logs: logs.slice(-5) // Últimos 5 para el historial visual
        };
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-24 font-display">
            <div className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 p-4 flex items-center gap-4">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Entrenamientos</h1>
            </div>

            <div className="p-4 space-y-6">
                <section>
                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">Catálogo & Progreso</h2>
                    <div className="grid grid-cols-1 gap-5">
                        {TRAINING_MODULES.map((module) => {
                            const stats = getTrainingStats(module.id);
                            
                            return (
                                <div 
                                    key={module.id}
                                    className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/30 transition-all active:scale-[0.99] cursor-pointer group flex flex-col"
                                    onClick={() => onNavigate(module.route)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex gap-4">
                                            <div className={`size-14 rounded-2xl flex items-center justify-center ${module.colorClass}`}>
                                                <span className="material-symbols-outlined text-3xl">{module.icon}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{module.title}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{module.description}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-100 dark:bg-white/5 size-10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </div>
                                    </div>

                                    {/* Métrica de Mejora Comparativa */}
                                    {stats.totalSessions > 1 && (
                                        <div className="flex items-center gap-2 mb-6 bg-primary/5 border border-primary/10 rounded-2xl p-3">
                                            <div className={`size-8 rounded-full flex items-center justify-center ${stats.improvement >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                <span className="material-symbols-outlined text-sm font-black">
                                                    {stats.improvement >= 0 ? 'trending_up' : 'trending_down'}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold">
                                                <span className={stats.improvement >= 0 ? 'text-green-500' : 'text-red-500'}>
                                                    {stats.improvement >= 0 ? '+' : ''}{stats.improvement}%
                                                </span>
                                                <span className="text-gray-500 ml-1">vs promedio histórico</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Historial Visual Simple */}
                                    <div className="flex items-end justify-between h-12 gap-1 mb-4 px-1">
                                        {stats.logs.map((log, i) => {
                                            const maxVal = Math.max(...stats.logs.map(l => l.telCalculated || l.levelOrSpeed));
                                            const height = maxVal > 0 ? `${((log.telCalculated || log.levelOrSpeed) / maxVal) * 100}%` : '10%';
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                                                    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden h-12 flex flex-col justify-end">
                                                        <div 
                                                            className="w-full bg-primary/40 rounded-full transition-all duration-700" 
                                                            style={{ height }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[7px] text-gray-500 font-bold uppercase tracking-tighter">
                                                        {new Date(log.timestamp).toLocaleDateString([], {day: '2-digit', month: 'short'})}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {stats.logs.length === 0 && (
                                            <p className="text-[10px] text-gray-500 italic w-full text-center">Inicia tu primera sesión para ver historial</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        {module.metrics.slice(0, 2).map((metric, idx) => (
                                            <div key={idx} className="bg-gray-50 dark:bg-black/20 rounded-2xl p-3 border border-gray-100 dark:border-white/5">
                                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">{metric.label}</p>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                                    {stats.currentVal > 0 ? stats.currentVal : '--'}
                                                    <span className="text-[10px] text-gray-500 ml-0.5 font-normal">{metric.unit || ''}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TrainingsList;
