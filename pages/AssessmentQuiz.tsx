import React, { useState } from 'react';
import { ASSESSMENT_QUESTIONS } from '../constants.ts';

interface AssessmentQuizProps {
  onFinishQuiz: (comprehensionScore: number) => void;
}

const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({ onFinishQuiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const question = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1;

  const handleOptionSelect = (optionId: string) => {
    if (!selectedOption) {
        setSelectedOption(optionId);
    }
  };

  const handleNext = () => {
      // Check if correct
      const isCorrect = question.options.find(o => o.id === selectedOption)?.isCorrect;
      let newCorrectCount = correctAnswers;
      if (isCorrect) {
          newCorrectCount++;
          setCorrectAnswers(prev => prev + 1);
      }

      if (isLastQuestion) {
          // Calculate percentage based on the updated count
          const finalScore = Math.round((newCorrectCount / ASSESSMENT_QUESTIONS.length) * 100);
          onFinishQuiz(finalScore);
      } else {
          setSelectedOption(null);
          setCurrentQuestionIndex(prev => prev + 1);
      }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased overflow-x-hidden pb-[100px]">
      {/* Top App Bar */}
      <div className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-all duration-200">
        <div className="flex items-center px-4 py-3 justify-center max-w-lg mx-auto w-full relative">
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight text-center">Comprobación</h2>
        </div>
        {/* Progress Bar */}
        <div className="px-6 pb-4 pt-1 max-w-lg mx-auto w-full">
          <div className="flex justify-between items-end mb-2">
            <p className="text-slate-600 dark:text-[#93c8a5] text-xs font-semibold uppercase tracking-wider">Pregunta {currentQuestionIndex + 1} de {ASSESSMENT_QUESTIONS.length}</p>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-[#346544] rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 px-4 pt-6 max-w-lg mx-auto w-full overflow-y-auto no-scrollbar">
        {/* Question Card */}
        <div className="flex flex-col gap-0 rounded-2xl overflow-hidden bg-white dark:bg-white/5 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
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
            
            // Simple visual feedback during test
            let containerClass = "group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ";
            let icon = null;

            if (isSelected) {
                containerClass += "border-2 border-primary bg-primary/10 shadow-[0_0_15px_rgba(25,230,94,0.15)]";
                icon = (
                    <div className="mt-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-background-dark shrink-0">
                        <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </div>
                );
            } else {
                 containerClass += "border-slate-200 dark:border-[#346544] bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5";
                 icon = (
                    <div className={`mt-0.5 h-5 w-5 rounded-full border-2 border-slate-300 dark:border-[#346544] bg-transparent ${selectedOption ? '' : 'group-hover:border-primary'}`}></div>
                 );
            }

            return (
                <div key={option.id} onClick={() => handleOptionSelect(option.id)} className={containerClass}>
                    {icon}
                    <div className="flex grow flex-col">
                        <p className={`text-sm font-medium leading-normal transition-colors ${isSelected ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                            {option.text}
                        </p>
                    </div>
                </div>
            )
          })}
        </div>

        {/* Next Button */}
        <div className="pt-4 flex justify-center">
            {selectedOption && (
                <button
                    onClick={handleNext}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-14 px-5 bg-primary hover:bg-[#16cc53] active:scale-[0.98] transition-all text-[#112217] shadow-lg shadow-primary/20"
                >
                    <span className="text-base font-bold leading-normal tracking-[0.015em]">{isLastQuestion ? 'Ver Resultados' : 'Siguiente'}</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
            )}
        </div>
      </main>
    </div>
  );
};

export default AssessmentQuiz;