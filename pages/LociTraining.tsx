import React, { useState } from 'react';

interface LociTrainingProps {
  onBack: () => void;
  onComplete?: (score: number) => void;
}

// Data for interactive rooms
const ROOMS = [
    { id: 'bedroom', name: 'Dormitorio', icon: 'bed', color: 'from-blue-500/20 to-indigo-500/20', text: 'text-blue-400' },
    { id: 'kitchen', name: 'Cocina', icon: 'kitchen', color: 'from-green-500/20 to-emerald-500/20', text: 'text-green-400' },
    { id: 'living', name: 'Sala', icon: 'chair', color: 'from-orange-500/20 to-red-500/20', text: 'text-orange-400' }
];

// Concepts to memorize
const CONCEPTS_TO_MEMORIZE = [
    "La Neuroplasticidad",
    "Curva del Olvido",
    "Lectura Vertical",
    "Fijación Ocular",
    "Sinapsis"
];

const LociTraining: React.FC<LociTrainingProps> = ({ onBack, onComplete }) => {
  const [phase, setPhase] = useState<'select' | 'build' | 'test' | 'result'>('select');
  const [selectedRoom, setSelectedRoom] = useState<typeof ROOMS[0] | null>(null);
  const [stations, setStations] = useState<{id: number, x: number, y: number, concept: string}[]>([]);
  const [nextStationId, setNextStationId] = useState(1);
  const [recallAnswers, setRecallAnswers] = useState<{[key: number]: string}>({});
  const [score, setScore] = useState(0);

  const handleRoomSelect = (room: typeof ROOMS[0]) => {
      setSelectedRoom(room);
      setPhase('build');
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (stations.length >= 5) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      const concept = CONCEPTS_TO_MEMORIZE[nextStationId - 1];
      
      setStations([...stations, { 
          id: nextStationId, 
          x, 
          y,
          concept
      }]);
      setNextStationId(prev => prev + 1);
  };

  const handleTestSubmit = () => {
      let correctCount = 0;
      stations.forEach(st => {
          const userAnswer = recallAnswers[st.id]?.toLowerCase() || "";
          const correctAnswer = st.concept.toLowerCase();
          
          if (userAnswer.length > 2 && correctAnswer.includes(userAnswer)) {
              correctCount++;
          }
      });
      
      const finalScore = Math.round((correctCount / 5) * 100);
      setScore(finalScore);
      setPhase('result');
      if (onComplete) onComplete(finalScore);
  };

  const resetBuilder = () => {
      setStations([]);
      setNextStationId(1);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark font-display relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-[#0f172a]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#0f172a] to-[#0f172a]"></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      </div>

      <header className="flex items-center justify-between px-4 py-4 z-10 relative">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-yellow-400 drop-shadow-md">Entrenamiento</span>
            <span className="text-sm font-bold text-white">Palacio Mental</span>
        </div>
        <div className="w-10"></div> 
      </header>

      {phase === 'select' && (
          <main className="flex-1 flex flex-col px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 overflow-y-auto no-scrollbar relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Construye tu Palacio</h1>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">Elige una habitación para asociar espacialmente 5 conceptos clave de memoria.</p>
              
              <div className="grid gap-4">
                  {ROOMS.map(room => (
                      <button 
                        key={room.id}
                        onClick={() => handleRoomSelect(room)}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/50 hover:bg-white/10 transition-all text-left shadow-lg hover:shadow-yellow-500/10"
                      >
                          <div className={`size-16 rounded-xl bg-gradient-to-br ${room.color} flex items-center justify-center ${room.text} group-hover:scale-110 transition-transform shadow-inner`}>
                              <span className="material-symbols-outlined text-3xl">{room.icon}</span>
                          </div>
                          <div>
                              <h3 className="font-bold text-white text-lg">{room.name}</h3>
                              <p className="text-xs text-gray-500">Espacio Familiar</p>
                          </div>
                          <span className="material-symbols-outlined text-gray-600 ml-auto group-hover:text-white transition-colors">arrow_forward</span>
                      </button>
                  ))}
              </div>
          </main>
      )}

      {phase === 'build' && selectedRoom && (
          <main className="flex-1 flex flex-col relative z-10">
               <div className="absolute top-2 w-full px-6 py-2 z-20 flex justify-center">
                    <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
                        <span className="material-symbols-outlined text-yellow-400 animate-pulse">place</span>
                        <p className="text-center text-sm text-white font-medium">
                            {stations.length < 5 ? `Ubica: "${CONCEPTS_TO_MEMORIZE[nextStationId-1]}"` : "¡Palacio completo!"}
                        </p>
                    </div>
               </div>

              {/* Interactive Room Canvas */}
              <div 
                className="flex-1 m-4 bg-[#1e293b] rounded-3xl border border-white/10 relative overflow-hidden cursor-crosshair shadow-2xl"
                onClick={handleCanvasClick}
              >
                  {/* Pseudo-Room Visuals */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                       <span className="material-symbols-outlined text-[200px] text-white">{selectedRoom.icon}</span>
                  </div>
                  
                  {/* SVG Layer for Connecting Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      <defs>
                          <filter id="glow">
                              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                              <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                          </filter>
                      </defs>
                      {stations.map((st, i) => {
                          if (i === 0) return null;
                          const prev = stations[i-1];
                          return (
                              <line 
                                key={`line-${i}`}
                                x1={`${prev.x}%`} y1={`${prev.y}%`}
                                x2={`${st.x}%`} y2={`${st.y}%`}
                                stroke="#fbbf24"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                opacity="0.6"
                                filter="url(#glow)"
                              >
                                  <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" />
                              </line>
                          );
                      })}
                  </svg>

                  {/* Stations */}
                  {stations.map((st, i) => (
                      <div 
                        key={st.id}
                        className="absolute flex flex-col items-center gap-1 animate-in zoom-in duration-300 z-10"
                        style={{ left: `${st.x}%`, top: `${st.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                          <div className="size-10 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.8)] border-2 border-white ring-4 ring-yellow-500/20">
                              {st.id}
                          </div>
                          <div className="bg-black/80 px-3 py-1.5 rounded-lg text-xs text-white whitespace-nowrap backdrop-blur-sm border border-white/10 shadow-lg font-bold tracking-wide">
                              {st.concept}
                          </div>
                      </div>
                  ))}
              </div>

              {/* Bottom Controls */}
              <div className="p-6 pb-8 bg-background-dark/95 border-t border-white/10 backdrop-blur-lg">
                  <div className="flex justify-between items-center mb-4">
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Conceptos: <span className="text-white">{stations.length} / 5</span></p>
                      <button onClick={resetBuilder} className="text-xs text-red-400 hover:text-red-300 underline font-medium">Reiniciar</button>
                  </div>
                  
                  <button 
                    disabled={stations.length < 5}
                    onClick={() => setPhase('test')}
                    className="w-full h-14 bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                      {stations.length < 5 ? 'Coloca todos los puntos...' : 'Hacer Prueba de Memoria'}
                      {stations.length >= 5 && <span className="material-symbols-outlined">psychology</span>}
                  </button>
              </div>
          </main>
      )}

      {phase === 'test' && (
          <main className="flex-1 flex flex-col px-6 pt-4 overflow-y-auto no-scrollbar relative z-10">
              <h2 className="text-xl font-bold text-white mb-6 text-center">¿Qué había en cada lugar?</h2>
              
              <div className="space-y-6">
                  {stations.map((st) => (
                      <div key={st.id} className="relative bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="absolute -top-3 -left-2 bg-yellow-500 text-black size-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                              {st.id}
                          </div>
                          <p className="text-gray-400 text-xs mb-2 pl-4">Ubicación {st.id} (Coordenada visual)</p>
                          <input 
                            type="text" 
                            placeholder="Escribe el concepto..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all placeholder:text-gray-600"
                            onChange={(e) => setRecallAnswers({...recallAnswers, [st.id]: e.target.value})}
                          />
                      </div>
                  ))}
              </div>

              <div className="pb-8 pt-6">
                 <button 
                    onClick={handleTestSubmit}
                    className="w-full h-14 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-colors"
                 >
                     Verificar Memoria
                 </button>
              </div>
          </main>
      )}

      {phase === 'result' && (
          <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 relative z-10">
              <div className={`size-24 rounded-full flex items-center justify-center mb-6 border-4 ${score > 60 ? 'border-green-500/50 bg-green-500/20' : 'border-orange-500/50 bg-orange-500/20'}`}>
                  <span className="material-symbols-outlined text-6xl text-white">
                      {score > 60 ? 'emoji_events' : 'psychology_alt'}
                  </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{score}% Precisión</h2>
              <p className="text-gray-400 mb-8 leading-relaxed max-w-xs">
                  {score > 80 
                    ? "¡Excelente! Tu palacio mental es sólido como una roca." 
                    : "Sigue practicando. Visualiza imágenes más vívidas y absurdas para reforzar la memoria."}
              </p>
              
              <div className="w-full max-w-xs space-y-3">
                  <button onClick={() => {
                        resetBuilder();
                        setRecallAnswers({});
                        setPhase('select');
                    }} className="w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors">
                      Intentar de Nuevo
                  </button>
                  <button onClick={onBack} className="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg">
                      Finalizar
                  </button>
              </div>
          </main>
      )}
    </div>
  );
};

export default LociTraining;