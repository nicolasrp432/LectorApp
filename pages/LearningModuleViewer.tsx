
import React, { useState, useEffect } from 'react';
import { LearningModule, AppRoute, LearningStep } from '../types.ts';
import { Button } from '../components/ui/Button.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface LearningModuleViewerProps {
    module: LearningModule;
    onBack: (route?: AppRoute) => void;
}

const LearningModuleViewer: React.FC<LearningModuleViewerProps> = ({ module, onBack }) => {
    const { user, updateLearningProgress } = useAuth();
    const { showToast } = useToast();
    
    const savedProgress = user?.learningProgress?.find(p => p.moduleId === module?.id);
    const [currentStep, setCurrentStep] = useState(savedProgress?.completedSteps || 0);
    const [isQuizPhase, setIsQuizPhase] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const steps = module?.steps ?? [];
    const isLastStep = currentStep >= steps.length - 1;
    
    const step: LearningStep = steps[currentStep] || { 
        title: 'Cargando...', 
        text: 'Preparando lección...', 
        icon: 'pending', 
        visualType: 'text', 
        animationKey: 'default' 
    };

    useEffect(() => {
        if (!isQuizPhase && module?.id) {
            updateLearningProgress(module.id, currentStep, false);
        }
    }, [currentStep, isQuizPhase, module?.id]);

    const handleQuizSubmit = () => {
        if (!module?.checkpointQuestion || !selectedOption) return;
        
        const option = module.checkpointQuestion.options.find(o => o.id === selectedOption);
        const correct = !!option?.isCorrect;
        
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            updateLearningProgress(module.id, steps.length, true);
            showToast("¡Módulo Completado! +50 XP", "success");
        } else {
            showToast("Vuelve a revisar la teoría.", "warning");
        }
    };

    const renderVisual = (key: string = 'default') => {
        switch (key) {
            case 'voice_wave':
                return (
                    <div className="flex items-center justify-center gap-1.5 h-24">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="w-2 h-full bg-primary rounded-full animate-[voice_1s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                    </div>
                );
            case 'focus_points':
                return (
                    <div className="relative w-56 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-around px-6 overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="size-4 rounded-full bg-primary/40 animate-pulse ring-8 ring-primary/5" style={{ animationDelay: `${i * 0.5}s` }}></div>
                        ))}
                    </div>
                );
            case 'rhythm_bar':
                return (
                    <div className="w-64 h-8 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 relative">
                        <div className="h-full bg-primary/30 rounded-full w-12 animate-[slide_2s_linear_infinite]"></div>
                        <div className="absolute inset-0 flex justify-around items-center">
                            {[...Array(5)].map((_, i) => <div key={i} className="size-1 bg-white/20 rounded-full"></div>)}
                        </div>
                    </div>
                );
            case 'scanning_radar':
                return (
                    <div className="size-40 border-2 border-primary/20 rounded-full relative overflow-hidden bg-primary/5">
                        <div className="absolute top-0 left-1/2 -ml-[1px] w-0.5 h-1/2 bg-primary origin-bottom animate-[spin_3s_linear_infinite] shadow-[0_0_15px_var(--primary)]"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-primary animate-pulse">BUSCANDO IDEAS</span>
                        </div>
                    </div>
                );
            case 'center_dot':
                return (
                    <div className="relative size-36 bg-white/5 border border-white/10 rounded-[2rem] p-3 grid grid-cols-3 gap-1.5 shadow-inner">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="bg-white/5 rounded-lg flex items-center justify-center text-[10px] text-gray-500 font-bold">{i+1}</div>
                        ))}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-3 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-ping"></div>
                        </div>
                    </div>
                );
            case 'memory_grid':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="size-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined text-gray-500">home</span></div>
                        <div className="size-16 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center animate-bounce"><span className="material-symbols-outlined text-primary">psychology</span></div>
                        <div className="size-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined text-gray-500">school</span></div>
                        <div className="size-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined text-gray-500">work</span></div>
                    </div>
                );
            default:
                return (
                    <div className="size-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center shadow-xl border border-primary/20">
                        <span className="material-symbols-outlined text-6xl text-primary animate-pulse">{step?.icon ?? 'psychology'}</span>
                    </div>
                );
        }
    };

    if (showResult) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-dark text-center animate-in zoom-in-95 duration-500">
                <div className={`size-24 rounded-full flex items-center justify-center mb-8 border-2 shadow-2xl ${isCorrect ? 'bg-primary/20 border-primary text-primary' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                    <span className="material-symbols-outlined text-6xl">{isCorrect ? 'verified' : 'psychology_alt'}</span>
                </div>
                <h2 className="text-3xl font-black mb-4">{isCorrect ? '¡Maestría Alcanzada!' : 'Casi lo tienes'}</h2>
                <p className="text-gray-400 mb-12 italic leading-relaxed max-w-xs">
                    {isCorrect 
                        ? `Has captado los conceptos clave de "${module?.title ?? 'este módulo'}". ¿Listo para aplicarlo en el campo de entrenamiento?` 
                        : "Tu respuesta no fue del todo exacta. Un buen lector siempre revisa sus fuentes."}
                </p>

                <div className="w-full max-w-sm space-y-4">
                    {isCorrect && module?.relatedTrainingRoute ? (
                        <Button fullWidth onClick={() => onBack(module.relatedTrainingRoute)} leftIcon="rocket_launch">Aceptar Desafío Práctico</Button>
                    ) : (
                        <Button fullWidth onClick={() => { setShowResult(false); setIsQuizPhase(false); setCurrentStep(0); }}>Reiniciar Módulo</Button>
                    )}
                    <Button variant="ghost" fullWidth onClick={() => onBack()}>Volver al Dashboard</Button>
                </div>
            </div>
        );
    }

    if (isQuizPhase && module?.checkpointQuestion) {
        return (
            <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar">
                <header className="p-6 border-b border-white/5 flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <h2 className="text-lg font-bold">Checkpoint Final</h2>
                </header>
                <main className="p-8 flex-1 flex flex-col justify-center">
                    <div className="bg-surface-dark border border-white/5 rounded-[3rem] p-8 shadow-2xl">
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest block mb-4">Pregunta de validación</span>
                        <h3 className="text-xl font-bold text-white mb-10 leading-snug">{module.checkpointQuestion.question}</h3>
                        <div className="space-y-3">
                            {(module.checkpointQuestion.options ?? []).map(opt => (
                                <button 
                                    key={opt.id}
                                    onClick={() => setSelectedOption(opt.id)}
                                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${selectedOption === opt.id ? 'border-primary bg-primary/10 shadow-lg' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                >
                                    <span className={`text-sm font-bold ${selectedOption === opt.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{opt.text}</span>
                                    {selectedOption === opt.id && <span className="material-symbols-outlined text-primary text-sm">radio_button_checked</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </main>
                <footer className="p-8">
                    <Button fullWidth disabled={!selectedOption} onClick={handleQuizSubmit} rightIcon="send">Enviar Respuesta</Button>
                </footer>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background-dark font-display overflow-hidden relative">
            <header className="flex-none p-6 flex items-center justify-between border-b border-white/5">
                <button onClick={() => onBack()} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="flex-1 px-8">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_8px_var(--primary)]" style={{ width: `${((currentStep + 1) / Math.max(steps.length, 1)) * 100}%` }}></div>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {currentStep + 1} / {steps.length}
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-10 text-center overflow-y-auto no-scrollbar">
                <div className="mb-14 h-48 flex items-center justify-center animate-in zoom-in duration-700">
                    {renderVisual(step?.animationKey ?? 'default')}
                </div>

                <div className="max-w-xs space-y-6 animate-in slide-in-from-bottom-4 duration-500" key={currentStep}>
                    <div className="flex items-center justify-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-sm">{step?.icon ?? 'school'}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Fase de Aprendizaje</span>
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight tracking-tight">{step?.title ?? 'Preparando...'}</h2>
                    <p className="text-sm text-gray-400 leading-relaxed italic opacity-80">
                        {step?.text ?? 'Un momento...'}
                    </p>
                </div>
            </main>

            <footer className="p-8 bg-gradient-to-t from-background-dark via-background-dark to-transparent">
                <div className="flex gap-4 max-w-sm mx-auto">
                    {currentStep > 0 && (
                        <button 
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="h-14 px-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            if (!isLastStep) setCurrentStep(prev => prev + 1);
                            else setIsQuizPhase(true);
                        }}
                        className="flex-1 h-14 bg-primary text-black font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isLastStep ? 'Terminar Teoría' : 'Siguiente Paso'}
                        <span className="material-symbols-outlined">
                            {isLastStep ? 'school' : 'arrow_forward'}
                        </span>
                    </button>
                </div>
            </footer>

            <style>{`
                @keyframes voice { 0%, 100% { height: 25%; } 50% { height: 100%; } }
                @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(500%); } }
            `}</style>
        </div>
    );
};

export default LearningModuleViewer;
