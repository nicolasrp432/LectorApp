import React, { useState, useEffect } from 'react';
import { ASSESSMENT_TEXT_CONTENT } from '../constants.ts';
import { AppRoute } from '../types.ts';

interface AssessmentReadingProps {
  onFinishReading: (wpm: number) => void;
  onBack: () => void;
}

const AssessmentReading: React.FC<AssessmentReadingProps> = ({ onFinishReading, onBack }) => {
  const [startTime, setStartTime] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);
  
  // Calculate word count
  const wordCount = ASSESSMENT_TEXT_CONTENT.trim().split(/\s+/).length;

  useEffect(() => {
    // Start timer only when user clicks "Start" to avoid measuring reading instructions
  }, []);

  const handleStart = () => {
      setIsReady(true);
      setStartTime(Date.now());
  };

  const handleFinish = () => {
      const endTime = Date.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      const durationInMinutes = durationInSeconds / 60;
      const calculatedWPM = Math.round(wordCount / durationInMinutes);
      
      onFinishReading(calculatedWPM);
  };

  if (!isReady) {
      return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark items-center justify-center p-6 text-center">
             <div className="size-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-blue-500">visibility</span>
             </div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Instrucciones</h2>
             <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                Lee el siguiente texto a tu ritmo normal. No intentes ir demasiado rápido, ya que luego te haremos preguntas sobre él.
                <br/><br/>
                Pulsa <b>"Terminé de Leer"</b> tan pronto como acabes la última palabra.
             </p>
             <button onClick={handleStart} className="px-8 py-4 bg-primary text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
                Comenzar Lectura
             </button>
             <button onClick={onBack} className="mt-4 text-gray-500 text-sm hover:underline">Volver</button>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden relative">
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">La Memoria Reconstructiva</h2>
        <div className="prose dark:prose-invert text-lg leading-relaxed text-slate-700 dark:text-gray-300 font-serif">
            {ASSESSMENT_TEXT_CONTENT.split('\n').map((p, i) => (
                p.trim() && <p key={i} className="mb-4">{p}</p>
            ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark pt-12">
        <button 
            onClick={handleFinish}
            className="w-full h-14 bg-primary text-black font-bold text-lg rounded-xl shadow-xl hover:bg-primary-dark transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
            <span className="material-symbols-outlined">stop_circle</span>
            Terminé de Leer
        </button>
      </div>
    </div>
  );
};

export default AssessmentReading;