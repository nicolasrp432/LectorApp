
import React from 'react';
import { AppRoute, TrainingModule } from '../types';
import { TRAINING_MODULES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

interface TrainingsListProps {
    onNavigate: (route: AppRoute) => void;
    onBack: () => void;
}

const TrainingsList: React.FC<TrainingsListProps> = ({ onNavigate, onBack }) => {
    const { readingLogs, user } = useAuth();

    // Helper to calculate metrics dynamically from logs
    const getMetricValue = (moduleId: string, metricKey: string): string => {
        if (!user) return '-';

        // Filter logs specific to this module
        // Note: Map module IDs to log exercise types
        let exerciseType = '';
        if (moduleId === 'schulte') exerciseType = 'schulte';
        if (moduleId === 'rsvp') exerciseType = 'rsvp'; // or reading_session
        if (moduleId === 'word_span') exerciseType = 'word_span';
        if (moduleId === 'loci') exerciseType = 'loci';
        // Flashcards usually tracked via flashcard array, but we can look for logs too or use user stats
        
        const logs = readingLogs.filter(l => 
            l.exerciseType === exerciseType || 
            (moduleId === 'rsvp' && l.exerciseType === 'reading_session')
        );

        switch (metricKey) {
            case 'maxLevel':
                if (moduleId === 'schulte') return (user.stats.maxSchulteLevel || 1).toString();
                if (moduleId === 'word_span') return (user.stats.maxWordSpan || 3).toString();
                const maxLvl = logs.length ? Math.max(...logs.map(l => l.levelOrSpeed)) : 1;
                return maxLvl.toString();

            case 'avgTime':
                if (logs.length === 0) return '-';
                const avg = logs.reduce((acc, curr) => acc + curr.durationSeconds, 0) / logs.length;
                return avg.toFixed(1);

            case 'totalSessions':
                return logs.length.toString();

            case 'bestScore':
                if (logs.length === 0) return '-';
                if (moduleId === 'rsvp') {
                     const bestWpm = Math.max(...logs.map(l => l.wpmCalculated || 0));
                     return bestWpm > 0 ? bestWpm.toString() : user.baselineWPM.toString();
                }
                if (moduleId === 'loci') {
                     const bestComp = Math.max(...logs.map(l => l.comprehensionRate || 0));
                     return bestComp.toString();
                }
                return '-';
                
            default:
                return '-';
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-24 font-display">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 p-4 flex items-center gap-4">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Entrenamientos</h1>
            </div>

            <div className="p-4 space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Catálogo completo de ejercicios cognitivos diseñados para potenciar tu mente.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    {TRAINING_MODULES.map((module) => (
                        <div 
                            key={module.id}
                            className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/30 transition-all active:scale-[0.99] cursor-pointer group relative overflow-hidden"
                            onClick={() => onNavigate(module.route)}
                        >
                            {/* Decorative Background */}
                            <div className={`absolute top-0 right-0 p-10 opacity-5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 ${module.colorClass.split(' ')[0]}`}>
                                <div className="bg-current w-full h-full"></div>
                            </div>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className={`size-12 rounded-xl flex items-center justify-center ${module.colorClass}`}>
                                    <span className="material-symbols-outlined text-2xl">{module.icon}</span>
                                </div>
                                <div className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                                    <span className="material-symbols-outlined text-gray-400 text-lg group-hover:text-primary transition-colors">arrow_forward</span>
                                </div>
                            </div>

                            <div className="mb-4 relative z-10">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{module.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                                    {module.description}
                                </p>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-2 relative z-10">
                                {module.metrics.map((metric, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-black/20 rounded-lg p-2 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">{metric.label}</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                                            {getMetricValue(module.id, metric.key)}
                                            {metric.unit && <span className="text-[10px] text-gray-500 ml-0.5 font-normal">{metric.unit}</span>}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainingsList;
