import React, { useState } from 'react';

interface LociTrainingProps {
  onBack: () => void;
}

const LociTraining: React.FC<LociTrainingProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);

  // Progressive Disclosure Content
  const renderStep = () => {
    switch(step) {
        case 1:
            return (
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="size-24 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-6xl text-yellow-500">home</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">El Palacio de la Memoria</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed">
                        Para recordar cualquier cosa, usaremos una ubicación espacial que conoces perfectamente. 
                        Tu cerebro ha evolucionado para recordar <b>lugares</b> mejor que palabras abstractas.
                    </p>
                    <button onClick={() => setStep(2)} className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-green-400 transition-colors">
                        Seleccionar Ubicación
                    </button>
                </div>
            );
        case 2:
             return (
                <div className="text-center animate-in fade-in slide-in-from-right-8 duration-500">
                    <h2 className="text-xl font-bold text-white mb-2">Paso 1: Elige tu Palacio</h2>
                    <p className="text-gray-400 mb-6 text-sm">Elige un lugar que conozcas a ciegas.</p>
                    
                    <div className="grid grid-cols-1 gap-3 mb-8">
                        <button onClick={() => setStep(3)} className="p-4 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all text-left flex items-center gap-4 group">
                             <div className="size-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"><span className="material-symbols-outlined">bedroom_parent</span></div>
                             <div>
                                 <p className="font-bold text-white">Tu Dormitorio</p>
                                 <p className="text-xs text-gray-500">Mejor para principiantes</p>
                             </div>
                        </button>
                        <button onClick={() => setStep(3)} className="p-4 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all text-left flex items-center gap-4">
                             <div className="size-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400"><span className="material-symbols-outlined">countertops</span></div>
                             <div>
                                 <p className="font-bold text-white">Tu Cocina</p>
                                 <p className="text-xs text-gray-500">Bueno para listas</p>
                             </div>
                        </button>
                    </div>
                    <button onClick={() => setStep(1)} className="text-gray-500 text-sm hover:text-white">Atrás</button>
                </div>
            );
        case 3:
            return (
                <div className="text-center animate-in fade-in slide-in-from-right-8 duration-500">
                    <h2 className="text-xl font-bold text-white mb-2">Paso 2: Define la Ruta</h2>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                        Cierra los ojos. Imagina que estás en la entrada. 
                        Camina en el sentido de las agujas del reloj. Identifica <b>5 objetos distintos</b> (Mueble, Ventana, Cama...).
                    </p>
                    <div className="bg-[#1A2C20] p-4 rounded-xl mb-8 border border-primary/20">
                        <p className="text-primary font-mono text-lg">Entrada &rarr; Armario &rarr; Cama &rarr; Escritorio &rarr; Ventana</p>
                    </div>
                    <button onClick={() => setStep(4)} className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-green-400 transition-colors">
                        Tengo mi ruta
                    </button>
                </div>
            );
        case 4:
            return (
                 <div className="text-center animate-in fade-in slide-in-from-right-8 duration-500">
                    <h2 className="text-xl font-bold text-white mb-2">Paso 3: Coloca el Concepto</h2>
                    <p className="text-gray-400 mb-4 text-sm">Recordemos: <b>"Neuroplasticidad"</b></p>
                    
                    <div className="bg-white/5 p-6 rounded-xl mb-8 border border-white/10">
                        <p className="text-gray-300 italic mb-4">
                            "Imagina un <b>Cerebro de Plástico</b> gigante derritiéndose en tu <b>Cama</b> (tu 3ª parada)."
                        </p>
                        <p className="text-xs text-gray-500">Cuanto más extraña la imagen, más fuerte el recuerdo.</p>
                    </div>
                    
                    <button onClick={() => setStep(5)} className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-green-400 transition-colors">
                        ¡Es vívido!
                    </button>
                </div>
            );
        case 5:
             return (
                <div className="text-center animate-in zoom-in-95 duration-500">
                    <div className="size-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-5xl text-green-500">verified</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">¡Técnica Desbloqueada!</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed">
                        Acabas de usar el Método Loci. En el futuro, extraeremos conceptos de tus libros y te pediremos que los coloques en tu palacio.
                    </p>
                    <button onClick={onBack} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                        Finalizar Entrenamiento
                    </button>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark font-display">
      <header className="flex items-center justify-between px-4 py-4 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
                <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-white/10'}`}></div>
            ))}
        </div>
        <div className="w-10"></div> 
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-sm mx-auto w-full">
         {renderStep()}
      </main>
    </div>
  );
};

export default LociTraining;