import React, { useState } from 'react';

interface EditPreferenceModalProps {
  title: string;
  type: 'number' | 'select' | 'range';
  initialValue: any;
  options?: string[]; // For select
  min?: number;
  max?: number;
  step?: number;
  onSave: (value: any) => void;
  onClose: () => void;
}

const EditPreferenceModal: React.FC<EditPreferenceModalProps> = ({
  title,
  type,
  initialValue,
  options,
  min,
  max,
  step,
  onSave,
  onClose
}) => {
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1A2C20] w-full max-w-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl animate-in zoom-in-95">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
        
        <div className="mb-6">
            {type === 'number' && (
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-2xl font-bold text-center text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-gray-500 font-medium">mins</span>
                </div>
            )}
            
            {type === 'range' && (
                <div className="space-y-4">
                     <p className="text-3xl font-bold text-center text-primary">{value} <span className="text-base text-gray-500 font-normal">WPM</span></p>
                     <input 
                        type="range"
                        min={min} max={max} step={step}
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-xs text-gray-400">
                        <span>{min}</span>
                        <span>{max}</span>
                     </div>
                </div>
            )}

            {type === 'select' && options && (
                <div className="flex flex-col gap-2">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setValue(opt)}
                            className={`p-3 rounded-xl border text-left font-medium transition-all ${
                                value === opt 
                                ? 'bg-primary/20 border-primary text-primary' 
                                : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="flex gap-3">
            <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl font-bold bg-primary text-black hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
                Guardar
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditPreferenceModal;