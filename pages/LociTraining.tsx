import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LociTrainingProps {
  onBack: () => void;
  onComplete?: (score: number) => void;
}

// Data for interactive rooms
const ROOMS = [
    { id: 'bedroom', name: 'Dormitorio', icon: 'bed', color: 'from-blue-500/20 to-indigo-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    { id: 'kitchen', name: 'Cocina', icon: 'kitchen', color: 'from-green-500/20 to-emerald-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    { id: 'living', name: 'Sala', icon: 'chair', color: 'from-orange-500/20 to-red-500/20', text: 'text-orange-400', border: 'border-orange-500/30' }
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
  const { logReading } = useAuth();
  const [phase, setPhase] = useState<'select' | 'build' | 'test' | 'result'>('select');
  const [selectedRoom, setSelectedRoom] = useState<typeof ROOMS[0] | null>(null);
  const [stations, setStations] = useState<{id: number, x: number, y: number, concept: string}[]>([]);
  const [nextStationId, setNextStationId] = useState(1);
  const [recallAnswers, setRecallAnswers] = useState<{[key: number]: string}>({});
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const handleRoomSelect = (room: typeof ROOMS[0]) => {
      setSelectedRoom(room);
      setPhase('build');
      setStartTime(Date.now());
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

  const handleTestSubmit = async () => {
      let correctCount = 0;
      stations.forEach(st => {
          const userAnswer = recallAnswers[st.id]?.toLowerCase() || "";
          const correctAnswer = st.concept.toLowerCase();
          
          if (userAnswer.length > 2 && correctAnswer.includes(userAnswer)) {
              correctCount++;
          }
      });
      
      const finalScore = Math.round((correctCount / 5) * 100);
      const durationSeconds = (Date.now() - startTime) / 1000;

      setScore(finalScore);
      setPhase('result');
      
      // Persist to Backend
      await logReading({
          exerciseType: 'loci',
          levelOrSpeed: 1, // Phase 1 of Loci
          durationSeconds: durationSeconds,
          wpmCalculated: 0,
          comprehensionRate: finalScore,
          errors: 5 - correctCount
      });

      if (onComplete) onComplete(finalScore);
  };

  const resetBuilder = () => {
      setStations([]);
      setNextStationId(1);
      setRecallAnswers({});
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark font-display relative overflow-hidden transition-colors duration-700">
      
      {/* Styles for dynamic line drawing */}
      <style>{`
        @keyframes drawLine {
          from { stroke-dashoffset: 100; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 0.6; }
        }
        .path-draw {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawLine 0.8s ease-out forwards;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Immersive Background */}
      <div className="absolute inset-0 bg-[#0f172a] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#0f172a] to-[#0f172a]"></div>
          {/* Animated Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[80px] animate-pulse delay-700"></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      </div>

      <header className="flex items-center justify-between px-4 py-4 z-10 relative bg-gradient-to-b from-[#0f172a] to-transparent">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">Entrenamiento</span>
            <span className="text-sm font-bold text-white">Palacio Mental</span>
        </div>
        <div className="w-10"></div> 
      </header>

      {/* Dynamic Content Container */}
      <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
        
        {phase === 'select' && (
            <main key="select" className="flex-1 flex flex-col px-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out overflow-y-auto no-scrollbar">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-full bg-yellow-500/10 mb-4 animate-float">
                         <span className="material-symbols-outlined text-4xl text-yellow-400">castle</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Construye tu Palacio</h1>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                        Asocia conocimientos abstractos a lugares físicos familiares para recordarlos siempre.
                    </p>
                </div>
                
                <div className="grid gap-4 max-w-sm mx-auto w-full">
                    {ROOMS.map((room, idx) => (
                        <button 
                            key={room.id}
                            onClick={() => handleRoomSelect(room)}
                            className={`group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all text-left shadow-lg relative overflow-hidden`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${room.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                            
                            <div className={`size-14 rounded-xl bg-gradient-to-br ${room.color} flex items-center justify-center ${room.text} group-hover:scale-110 transition-transform duration-300 shadow-inner border border-white/10`}>
                                <span className="material-symbols-outlined text-2xl">{room.icon}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{room.name}</h3>
                                <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Iniciar Construcción</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-700 ml-auto group-hover:text-white transition-all group-hover:translate-x-1">arrow_forward_ios</span>
                        </button>
                    ))}
                </div>
            </main>
        )}

        {phase === 'build' && selectedRoom && (
            <main key="build" className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
                <div className="absolute top-2 w-full px-6 py-2 z-20 flex justify-center pointer-events-none">
                        <div className="flex items-center gap-3 bg-black/70 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl animate-in slide-in-from-top-4 duration-500">
                            <span className="material-symbols-outlined text-yellow-400 animate-pulse">place</span>
                            <p className="text-center text-sm text-white font-medium">
                                {stations.length < 5 ? (
                                    <>Ubica: <span className="text-yellow-400 font-bold">"{CONCEPTS_TO_MEMORIZE[nextStationId-1]}"</span></>
                                ) : (
                                    <span className="text-green-400 font-bold">¡Palacio Completo!</span>
                                )}
                            </p>
                        </div>
                </div>

                {/* Interactive Room Canvas */}
                <div 
                    className="flex-1 m-4 mb-0 bg-[#1e293b] rounded-3xl border border-white/10 relative overflow-hidden cursor-crosshair shadow-2xl group"
                    onClick={handleCanvasClick}
                >
                    {/* Room Background Hint */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center transition-opacity duration-700 group-hover:opacity-10">
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
                                    strokeLinecap="round"
                                    className="path-draw"
                                    filter="url(#glow)"
                                />
                            );
                        })}
                    </svg>

                    {/* Stations / Dots */}
                    {stations.map((st, i) => (
                        <div 
                            key={st.id}
                            className="absolute flex flex-col items-center gap-2 z-10"
                            style={{ left: `${st.x}%`, top: `${st.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            {/* Dot */}
                            <div className="relative group/dot">
                                {i === stations.length - 1 && (
                                    <div className="absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-75"></div>
                                )}
                                <div className="relative size-12 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold text-lg rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)] border-2 border-white ring-4 ring-yellow-500/20 animate-[bounce_0.5s_ease-out]">
                                    {st.id}
                                </div>
                            </div>
                            
                            {/* Label */}
                            <div className="bg-black/80 px-3 py-1.5 rounded-lg text-xs text-white whitespace-nowrap backdrop-blur-md border border-white/10 shadow-xl font-bold tracking-wide animate-in slide-in-from-bottom-2 fade-in duration-300">
                                {st.concept}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Controls */}
                <div className="p-6 pb-8 pt-6">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <div className="flex gap-1">
                            {[1,2,3,4,5].map(n => (
                                <div key={n} className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${n <= stations.length ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                            ))}
                        </div>
                        <button onClick={resetBuilder} className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">Reiniciar</button>
                    </div>
                    
                    <button 
                        disabled={stations.length < 5}
                        onClick={() => setPhase('test')}
                        className={`
                            w-full h-14 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                            ${stations.length < 5 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
                                : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                            }
                        `}
                    >
                        {stations.length < 5 ? 'Completa el recorrido...' : 'Probar Memoria'}
                        {stations.length >= 5 && <span className="material-symbols-outlined animate-pulse">psychology</span>}
                    </button>
                </div>
            </main>
        )}

        {phase === 'test' && (
            <main key="test" className="flex-1 flex flex-col px-6 pt-6 overflow-y-auto no-scrollbar relative z-10 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">Recuperación Activa</h2>
                    <p className="text-sm text-gray-400">Recorre tu palacio mental y escribe qué guardaste.</p>
                </div>
                
                <div className="space-y-4 pb-24">
                    {stations.map((st, idx) => (
                        <div 
                            key={st.id} 
                            className="relative bg-white/5 rounded-2xl p-5 border border-white/10 focus-within:border-yellow-500/50 focus-within:bg-white/10 transition-all duration-300"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-yellow-500 text-black size-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                                    {st.id}
                                </div>
                                <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">Ubicación {st.id}</span>
                            </div>
                            
                            <input 
                                type="text" 
                                placeholder="¿Qué concepto era?"
                                className="w-full bg-black/20 border-b-2 border-white/10 rounded-t-lg px-0 py-2 text-lg text-white placeholder:text-gray-600 focus:border-yellow-500 focus:ring-0 outline-none transition-all font-medium"
                                onChange={(e) => setRecallAnswers({...recallAnswers, [st.id]: e.target.value})}
                                autoFocus={idx === 0}
                            />
                        </div>
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent">
                    <button 
                        onClick={handleTestSubmit}
                        className="w-full h-14 bg-green-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:bg-green-400 hover:scale-[1.02] transition-all"
                    >
                        Verificar Resultados
                    </button>
                </div>
            </main>
        )}

        {phase === 'result' && (
            <main key="result" className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500 relative z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent pointer-events-none"></div>
                
                <div className={`size-32 rounded-full flex items-center justify-center mb-6 border-4 shadow-[0_0_50px_rgba(255,255,255,0.1)] ${score > 60 ? 'border-green-500 bg-green-500/20' : 'border-orange-500 bg-orange-500/20'} animate-float`}>
                    <span className="material-symbols-outlined text-7xl text-white drop-shadow-lg">
                        {score > 60 ? 'emoji_events' : 'psychology_alt'}
                    </span>
                </div>
                
                <h2 className="text-5xl font-bold text-white mb-2 tracking-tight">{score}%</h2>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Precisión de Memoria</p>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 max-w-xs w-full mb-8 backdrop-blur-md">
                    <p className="text-gray-300 leading-relaxed text-sm">
                        {score > 80 
                            ? "¡Increíble! Has creado conexiones neuronales sólidas. Tu palacio mental es estable." 
                            : "Buen intento. Recuerda: cuanto más absurda o exagerada sea la imagen mental, más difícil será olvidarla."}
                    </p>
                </div>
                
                <div className="w-full max-w-xs space-y-3">
                    <button onClick={() => {
                            resetBuilder();
                            setPhase('select');
                        }} className="w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/5">
                        Construir Nuevo Palacio
                    </button>
                    <button onClick={onBack} className="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/20">
                        Finalizar Entrenamiento
                    </button>
                </div>
            </main>
        )}
      </div>
    </div>
  );
};

export default LociTraining;