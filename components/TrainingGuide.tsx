
import React, { useState } from 'react';
import { TRAINING_GUIDES } from '../constants.ts';

interface TrainingGuideProps {
    guideKey: keyof typeof TRAINING_GUIDES;
    onClose: () => void;
}

const TrainingGuide: React.FC<TrainingGuideProps> = ({ guideKey, onClose }) => {
    const guide = TRAINING_GUIDES[guideKey];
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "¿Qué entrenamos?",
            icon: "psychology",
            content: guide.why,
            visual: "intro"
        },
        {
            title: "Técnica Maestra",
            icon: "visibility",
            content: "Sigue estos pasos para un entrenamiento efectivo:",
            list: guide.steps,
            visual: "technique"
        },
        {
            title: "Errores a evitar",
            icon: "warning",
            content: "No caigas en estos hábitos comunes:",
            list: guide.errors,
            visual: "errors",
            isWarning: true
        },
        {
            title: "Truco Pro",
            icon: "bolt",
            content: guide.proTip,
            visual: "tip"
        }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
        else onClose();
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const renderVisual = (type: string) => {
        switch (guideKey) {
            case 'schulte':
                if (type === 'technique') return (
                    <div className="relative w-32 h-32 mx-auto bg-white/5 rounded-2xl border border-white/10 grid grid-cols-3 gap-1 p-2">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className={`bg-white/10 rounded-sm transition-opacity duration-1000 ${i % 2 === 0 ? 'opacity-20' : 'opacity-100'}`}></div>
                        ))}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10 animate-pulse"></div>
                        </div>
                    </div>
                );
                if (type === 'errors') return (
                    <div className="relative size-24 mx-auto flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-red-500/50">visibility_off</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-red-500 animate-bounce">close</span>
                        </div>
                    </div>
                );
                return (
                    <div className="size-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-primary animate-pulse">grid_view</span>
                    </div>
                );
            default:
                return (
                    <div className="size-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-primary animate-spin-slow">psychology</span>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="bg-[#1A2C20] w-full max-w-sm rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                
                {/* Indicadores de Progreso */}
                <div className="flex gap-1.5 px-8 pt-8">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-primary shadow-[0_0_8px_rgba(25,230,94,0.5)]' : 'bg-white/10'}`}></div>
                    ))}
                </div>

                <div className="relative p-8 pb-4 text-center">
                    <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors size-10 flex items-center justify-center bg-white/5 rounded-full">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>

                    <div className="mb-6 h-32 flex items-center justify-center">
                        {renderVisual(steps[currentStep].visual)}
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`material-symbols-outlined text-sm ${steps[currentStep].isWarning ? 'text-orange-400' : 'text-primary'}`}>
                                {steps[currentStep].icon}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                                Lección {currentStep + 1} / {steps.length}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-white leading-tight">{steps[currentStep].title}</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-4 no-scrollbar">
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300" key={currentStep}>
                        <p className="text-sm text-gray-300 leading-relaxed text-center italic">
                            {steps[currentStep].content}
                        </p>
                        
                        {steps[currentStep].list && (
                            <ul className="space-y-3 mt-4">
                                {steps[currentStep].list.map((item, idx) => (
                                    <li key={idx} className="flex gap-3 items-start group">
                                        <div className={`size-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${steps[currentStep].isWarning ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
                                            <span className="material-symbols-outlined text-[14px] font-bold">
                                                {steps[currentStep].isWarning ? 'close' : 'check'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-200 leading-tight">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Controles de Navegación */}
                <div className="p-8 pt-4 flex gap-3 bg-gradient-to-t from-[#1A2C20] to-transparent">
                    {currentStep > 0 ? (
                        <button 
                            onClick={prevStep}
                            className="h-14 px-6 bg-white/5 text-white font-bold rounded-2xl border border-white/10 active:scale-95 transition-all flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    ) : (
                        <div className="w-0 overflow-hidden"></div>
                    )}
                    <button 
                        onClick={nextStep}
                        className="flex-1 h-14 bg-primary text-[#112116] font-black text-lg rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {currentStep === steps.length - 1 ? 'Empezar' : 'Entendido'}
                        <span className="material-symbols-outlined">
                            {currentStep === steps.length - 1 ? 'bolt' : 'arrow_forward'}
                        </span>
                    </button>
                </div>
            </div>
            <style>{`
                .animate-spin-slow { animation: spin 8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default TrainingGuide;
