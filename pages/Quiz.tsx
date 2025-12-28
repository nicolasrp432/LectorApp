import React, { useState } from 'react';
import { MOCK_QUIZ_QUESTION } from '../constants.ts';
import { AppRoute } from '../types.ts';

interface QuizProps {
  onNavigate: (route: AppRoute) => void;
  onBack: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onNavigate, onBack }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const question = MOCK_QUIZ_QUESTION;

  const handleOptionSelect = (optionId: string) => {
    if (!selectedOption) {
        setSelectedOption(optionId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased overflow-x-hidden pb-[100px]">
      {/* Top App Bar */}
      <div className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-all duration-200">
        <div className="flex items-center px-4 py-3 justify-between max-w-lg mx-auto w-full">
          <button onClick={onBack} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Evaluación</h2>
          <button onClick={() => onNavigate(AppRoute.DASHBOARD)} className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-slate-500 dark:text-[#93c8a5]" style={{ fontSize: '24px' }}>close</span>
          </button>
        </div>
        {/* Progress Bar Integrated in Header Area */}
        <div className="px-6 pb-4 pt-1 max-w-lg mx-auto w-full">
          <div className="flex justify-between items-end mb-2">
            <p className="text-slate-600 dark:text-[#93c8a5] text-xs font-semibold uppercase tracking-wider">Pregunta 3 de 5</p>
            <p className="text-primary text-xs font-bold uppercase tracking-wider">Puntaje: 100%</p>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-[#346544] rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 px-4 pt-6 max-w-lg mx-auto w-full overflow-y-auto no-scrollbar">
        {/* Question Card */}
        <div className="flex flex-col gap-0 rounded-2xl overflow-hidden bg-white dark:bg-white/5 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          {/* Visual Context */}
          <div
            className="h-32 w-full bg-cover bg-center relative"
            style={{
                backgroundImage: `linear-gradient(0deg, rgba(17, 33, 22, 0.9) 0%, rgba(17, 33, 22, 0.2) 100%), url("${question.imageUrl}")`
            }}
          >
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[14px]">bolt</span>
              <span className="text-[10px] font-bold text-white uppercase tracking-wide">Recuerdo</span>
            </div>
          </div>
          {/* Question Text */}
          <div className="p-5 pt-4">
            <h1 className="text-slate-900 dark:text-white text-xl font-bold leading-snug">
              {question.question}
            </h1>
          </div>
        </div>

        {/* Answer Options */}
        <div className="flex flex-col gap-3">
          {question.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isCorrect = option.isCorrect;
            const showFeedback = isSelected; 

            // Styles based on state
            let containerClass = "group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ";
            let icon = null;
            let feedback = null;

            if (selectedOption && isSelected) {
                 if (isCorrect) {
                    // Correct & Selected
                    containerClass += "border-2 border-primary bg-primary/10 shadow-[0_0_15px_rgba(25,230,94,0.15)]";
                    icon = (
                        <div className="mt-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-background-dark shrink-0">
                            <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                        </div>
                    );
                    feedback = (
                        <div className="flex items-center gap-1 mt-1.5">
                            <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
                            <p className="text-primary text-xs font-bold">{option.explanation || "¡Respuesta correcta!"}</p>
                        </div>
                    );
                 } else {
                    // Incorrect & Selected
                    containerClass += "border-2 border-red-500/50 bg-red-50 dark:bg-red-500/10";
                    icon = (
                        <div className="mt-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white shrink-0">
                            <span className="material-symbols-outlined text-[14px] font-bold">close</span>
                        </div>
                    );
                    feedback = (
                        <div className="flex items-center gap-1 mt-1.5">
                            <span className="material-symbols-outlined text-red-500 text-[14px]">error</span>
                            <p className="text-red-600 dark:text-red-400 text-xs font-medium">{option.explanation || "Incorrecto."}</p>
                        </div>
                    );
                 }
            } else if (selectedOption && !isSelected && isCorrect && selectedOption !== option.id) {
                // Show correct answer if wrong was picked (optional behavior, here simpler: just unselected style)
                containerClass += "border-slate-200 dark:border-[#346544] bg-white dark:bg-transparent opacity-50";
                 icon = (
                   <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-slate-300 dark:border-[#346544] bg-transparent"></div>
                 );
            } else {
                // Default / Unselected
                 containerClass += "border-slate-200 dark:border-[#346544] bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5";
                 icon = (
                    <div className={`mt-0.5 h-5 w-5 rounded-full border-2 border-slate-300 dark:border-[#346544] bg-transparent ${selectedOption ? '' : 'group-hover:border-primary'}`}></div>
                 );
            }

            return (
                <div key={option.id} onClick={() => handleOptionSelect(option.id)} className={containerClass}>
                    {icon}
                    <div className="flex grow flex-col">
                        <p className={`text-sm font-medium leading-normal transition-colors ${isSelected && isCorrect ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                            {option.text}
                        </p>
                        {feedback}
                    </div>
                </div>
            )
          })}
        </div>

        {/* Next Button */}
        <div className="pt-4 flex justify-center">
            {selectedOption && (
                <button
                    onClick={() => onNavigate(AppRoute.DASHBOARD)} // End of demo quiz
                    className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-14 px-5 bg-primary hover:bg-[#16cc53] active:scale-[0.98] transition-all text-[#112217] shadow-lg shadow-primary/20"
                >
                    <span className="text-base font-bold leading-normal tracking-[0.015em]">Siguiente Pregunta</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
            )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;