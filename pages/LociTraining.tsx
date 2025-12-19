
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateBizarreStory, generateMemoryImage } from '../services/ai';
import { Button } from '../components/ui/Button';
import { MemoryPalace, ImageSize } from '../types';
import { dbService } from '../services/db';
import { useToast } from '../context/ToastContext';

// --- DATA ---
const SYSTEMS = [
    { id: 'loci', name: 'Lugares', icon: 'castle', desc: 'Asocia datos a espacios físicos.', color: 'from-blue-600 to-indigo-700' },
    { id: 'body', name: 'Cuerpo', icon: 'accessibility_new', desc: 'Usa partes de tu cuerpo como estaciones.', color: 'from-pink-600 to-rose-700' },
    { id: 'color', name: 'Colores', icon: 'palette', desc: 'Vincula ideas a un espectro cromático.', color: 'from-orange-500 to-amber-600' }
];

const PRESET_PLACES = [
    { id: 'home', name: 'Mi Casa', stations: ['Puerta', 'Recibidor', 'Sofá', 'Mesa Comedor', 'Nevera', 'Cocina', 'Baño', 'Cama', 'Ventana', 'Pasillo'] },
    { id: 'office', name: 'Oficina', stations: ['Ascensor', 'Escritorio', 'Cafetera', 'Sala Juntas', 'Ventana', 'Entrada', 'Pizarra', 'Silla', 'Archivo', 'Baño'] },
    { id: 'custom', name: 'Lugar Imaginario', stations: ['Portal', 'Estatua', 'Cascada', 'Cueva', 'Cima', 'Bosque', 'Lago', 'Puente', 'Torre', 'Prado'] }
];

const BODY_STATIONS = ['Cabeza', 'Hombros', 'Pecho', 'Manos', 'Estómago', 'Piernas', 'Pies', 'Espalda', 'Cuello', 'Orejas'];
const COLOR_STATIONS = ['Rojo Neón', 'Azul Eléctrico', 'Verde Ácido', 'Amarillo Solar', 'Púrpura Profundo', 'Naranja Fuego', 'Rosa Chicle', 'Blanco Puro', 'Negro Mate', 'Cian'];

type Phase = 'library' | 'system' | 'qty' | 'setup' | 'input' | 'association' | 'test' | 'result' | 'view_saved';

const LociTraining: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, logReading } = useAuth();
  const { showToast } = useToast();
  
  const [phase, setPhase] = useState<Phase>('system');
  const [method, setMethod] = useState<typeof SYSTEMS[0] | null>(null);
  const [dataCount, setDataCount] = useState<number>(5);
  const [placeDesc, setPlaceDesc] = useState<string>('');
  const [stations, setStations] = useState<string[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [currentStationIdx, setCurrentStationIdx] = useState(0);
  const [memoryItems, setMemoryItems] = useState<MemoryPalace['items']>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recallAnswers, setRecallAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [savedPalaces, setSavedPalaces] = useState<MemoryPalace[]>([]);
  const [selectedPalace, setSelectedPalace] = useState<MemoryPalace | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');

  // Load saved palaces
  useEffect(() => {
    if (user) {
        dbService.getMemoryPalaces(user.id).then(setSavedPalaces);
    }
  }, [user]);

  // --- Handlers ---
  const handleSystemSelect = (sys: typeof SYSTEMS[0]) => {
      setMethod(sys);
      setPhase('qty');
  };

  const handleQtySelect = (qty: number) => {
      setDataCount(qty);
      setUserInputs(new Array(qty).fill(''));
      setRecallAnswers(new Array(qty).fill(''));
      
      if (method?.id === 'loci') {
          setPhase('setup');
      } else {
          const baseStations = method?.id === 'body' ? BODY_STATIONS : COLOR_STATIONS;
          setStations(baseStations.slice(0, qty));
          setPhase('input');
      }
  };

  const handlePlaceSelect = (placeId: string) => {
      const place = PRESET_PLACES.find(p => p.id === placeId);
      if (place) {
          setStations(place.stations.slice(0, dataCount));
          setPhase('input');
      }
  };

  const ensureApiKey = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
    }
  };

  const startAssociation = async () => {
    await ensureApiKey();

    setIsGenerating(true);
    setPhase('association');
    setStartTime(Date.now());
    
    const items: MemoryPalace['items'] = [];
    try {
        for (let i = 0; i < dataCount; i++) {
            const story = await generateBizarreStory(userInputs[i], stations[i], method?.name || 'Loci', placeDesc);
            const imageUrl = await generateMemoryImage(story, stations[i], imageSize);
            items.push({
                concept: userInputs[i],
                station: stations[i],
                story: story,
                imageUrl: imageUrl || undefined
            });
        }
        setMemoryItems(items);
    } catch (error: any) {
        console.error("Loci Training Generation Error:", error);
        if (error.message?.includes('PERMISSION_DENIED') || error.message?.includes('403')) {
            showToast("Tu clave API no tiene permisos. Por favor, selecciona una clave de un proyecto de pago.", "error");
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setPhase('input');
        } else {
            showToast("Error generando palacio. Reintenta.", "error");
            setPhase('input');
        }
    } finally {
        setIsGenerating(false);
    }
  };

  const handleTestSubmit = async () => {
      let correct = 0;
      userInputs.forEach((original, idx) => {
          const answer = recallAnswers[idx].toLowerCase().trim();
          const target = original.toLowerCase().trim();
          if (answer.length > 2 && (target.includes(answer) || answer.includes(target))) {
              correct++;
          }
      });
      const finalScore = Math.round((correct / dataCount) * 100);
      setScore(finalScore);
      setPhase('result');

      // Save to History/Logs
      await logReading({
          exerciseType: 'loci',
          levelOrSpeed: 1,
          durationSeconds: (Date.now() - startTime) / 1000,
          wpmCalculated: 0,
          comprehensionRate: finalScore,
          errors: dataCount - correct
      });

      // Save Palace to DB
      if (user) {
          const palace: MemoryPalace = {
              id: `pal-${Date.now()}`,
              userId: user.id,
              name: `Sesión ${new Date().toLocaleDateString()}`,
              method: method?.id as any,
              description: placeDesc,
              items: memoryItems,
              timestamp: Date.now()
          };
          await dbService.addMemoryPalace(palace);
          setSavedPalaces(prev => [palace, ...prev]);
      }
  };

  // --- Renderers ---
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1810] font-display relative overflow-hidden text-white">
      
      {/* Background FX */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-full h-full bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-full h-full bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <header className="flex items-center justify-between px-6 py-4 z-20 bg-[#0d1810]/80 backdrop-blur-md border-b border-white/5">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary animate-pulse">Supermemoria</span>
            <h2 className="text-sm font-bold">{method ? method.name : 'Sistemas de Mnemotecnia'}</h2>
        </div>
        <button onClick={() => setPhase('library')} className="p-2 rounded-full hover:bg-white/10">
            <span className="material-symbols-outlined">history</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col p-6 z-10 overflow-y-auto no-scrollbar">
        
        {/* PHASE: LIBRARY */}
        {phase === 'library' && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4">
                <h1 className="text-3xl font-bold mb-6">Tus Palacios</h1>
                {savedPalaces.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                        <span className="material-symbols-outlined text-6xl mb-4">castle</span>
                        <p>No tienes palacios guardados todavía.</p>
                        <Button variant="ghost" className="mt-4" onClick={() => setPhase('system')}>Empezar Entrenamiento</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedPalaces.map(pal => (
                            <button key={pal.id} onClick={() => { setSelectedPalace(pal); setPhase('view_saved'); }} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all flex items-center justify-between group">
                                <div className="text-left">
                                    <h3 className="font-bold">{pal.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase">{pal.method} • {pal.items.length} datos</p>
                                </div>
                                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary">visibility</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* PHASE: VIEW SAVED */}
        {phase === 'view_saved' && selectedPalace && (
            <div className="flex-1 flex flex-col animate-in zoom-in-95">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setPhase('library')} className="p-2 bg-white/5 rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
                    <h2 className="text-xl font-bold">{selectedPalace.name}</h2>
                </div>
                <div className="space-y-6 pb-20">
                    {selectedPalace.items.map((item, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.concept} className="w-full aspect-video object-cover" />}
                            <div className="p-4">
                                <span className="text-[10px] text-primary font-bold uppercase">{item.station}</span>
                                <h3 className="text-lg font-bold mb-2">"{item.concept}"</h3>
                                <p className="text-sm text-gray-400 italic">{item.story}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* PHASE 1: SYSTEM SELECT */}
        {phase === 'system' && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4">
                <h1 className="text-3xl font-bold mb-2">Elige tu Sistema</h1>
                <p className="text-gray-400 text-sm mb-8">Selecciona la base para tus asociaciones mentales.</p>
                <div className="space-y-4">
                    {SYSTEMS.map(sys => (
                        <button key={sys.id} onClick={() => handleSystemSelect(sys)} className="w-full p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-white/10 transition-all flex items-center gap-5 text-left group">
                            <div className={`size-14 rounded-xl bg-gradient-to-br ${sys.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined text-3xl">{sys.icon}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{sys.name}</h3>
                                <p className="text-xs text-gray-500">{sys.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* PHASE: QUANTITY */}
        {phase === 'qty' && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-4">¿Cuántos datos memorizar?</h1>
                <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                    {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <button key={n} onClick={() => handleQtySelect(n)} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary font-bold text-xl">{n}</button>
                    ))}
                </div>
            </div>
        )}

        {/* PHASE: SETUP (Loci only) */}
        {phase === 'setup' && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4">
                <h1 className="text-2xl font-bold mb-6">Describe tu Palacio</h1>
                <div className="space-y-4 mb-8">
                    <textarea 
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Ej: Es mi casa de la infancia. Es luminosa, huele a madera y tiene un pasillo largo con cuadros..."
                        value={placeDesc}
                        onChange={(e) => setPlaceDesc(e.target.value)}
                    />
                    <h3 className="text-xs font-bold text-gray-500 uppercase">O elige un preajuste:</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {PRESET_PLACES.map(place => (
                            <button key={place.id} onClick={() => handlePlaceSelect(place.id)} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 text-left">
                                {place.name}
                            </button>
                        ))}
                    </div>
                </div>
                <Button disabled={!placeDesc && stations.length === 0} onClick={() => setPhase('input')}>Continuar</Button>
            </div>
        )}

        {/* PHASE 3: INPUT CONCEPTS */}
        {phase === 'input' && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4">
                <h1 className="text-2xl font-bold mb-2">¿Qué quieres recordar?</h1>
                <div className="flex items-center justify-between mb-8">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Introduce {dataCount} conceptos</p>
                    {/* Image Size Selection Affordance */}
                    <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
                        {(['1K', '2K', '4K'] as ImageSize[]).map(s => (
                            <button 
                                key={s} 
                                onClick={() => setImageSize(s)}
                                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${imageSize === s ? 'bg-primary text-black' : 'text-gray-400'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-3 flex-1 pb-10">
                    {userInputs.map((val, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 focus-within:border-primary/50 transition-all">
                            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">{i+1}</div>
                            <input 
                                type="text" 
                                placeholder={`Dato ${i+1}...`}
                                value={val}
                                onChange={(e) => {
                                    const next = [...userInputs];
                                    next[i] = e.target.value;
                                    setUserInputs(next);
                                }}
                                className="bg-transparent border-none focus:ring-0 w-full text-white placeholder:text-gray-600"
                            />
                        </div>
                    ))}
                </div>
                <div className="sticky bottom-0 bg-[#0d1810] py-4">
                    <Button 
                        disabled={userInputs.some(v => v.length < 2)} 
                        onClick={startAssociation}
                        fullWidth
                    >
                        Generar Palacio Mental
                    </Button>
                </div>
            </div>
        )}

        {/* PHASE 4: ASSOCIATION (CORE) */}
        {phase === 'association' && (
            <div className="flex-1 flex flex-col">
                {isGenerating ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h2 className="text-xl font-bold">La IA está pintando tu Palacio...</h2>
                        <p className="text-gray-500 text-sm mt-2">Usando Gemini 3 Pro ({imageSize})</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col animate-in zoom-in-95">
                        <div className="flex-1 flex flex-col items-center py-4">
                            <div className="w-full aspect-video rounded-2xl bg-white/5 border border-white/10 overflow-hidden mb-6 shadow-2xl relative">
                                {memoryItems[currentStationIdx]?.imageUrl ? (
                                    <img src={memoryItems[currentStationIdx].imageUrl} alt="Memory scene" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                                        <span className="material-symbols-outlined text-4xl">broken_image</span>
                                        <span className="text-xs">Imagen no disponible</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[8px] font-bold text-primary">
                                    {imageSize}
                                </div>
                            </div>
                            
                            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                                Estación {currentStationIdx + 1}: {memoryItems[currentStationIdx]?.station}
                            </h3>
                            <h2 className="text-3xl font-bold mb-6 text-center px-4">"{memoryItems[currentStationIdx]?.concept}"</h2>
                            
                            <div className="bg-white/5 border border-primary/20 p-5 rounded-2xl max-w-sm w-full relative">
                                <span className="material-symbols-outlined absolute -top-3 -left-3 size-8 bg-primary text-black rounded-full flex items-center justify-center text-sm font-bold">psychology</span>
                                <p className="text-base leading-relaxed text-gray-200 italic">
                                    {memoryItems[currentStationIdx]?.story}
                                </p>
                            </div>
                            <p className="mt-6 text-xs text-gray-500 text-center px-8 italic">Visualiza la escena con total detalle antes de pasar.</p>
                        </div>

                        <div className="pb-8">
                            {currentStationIdx < dataCount - 1 ? (
                                <Button fullWidth onClick={() => setCurrentStationIdx(p => p + 1)}>Siguiente Estación</Button>
                            ) : (
                                <Button fullWidth onClick={() => setPhase('test')} variant="outline" className="border-primary text-primary">Ir al Test de Recuerdo</Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* PHASE 5: TEST */}
        {phase === 'test' && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4">
                <h1 className="text-2xl font-bold mb-2">Recuperación Activa</h1>
                <p className="text-gray-400 text-sm mb-8">Recorre tu mente y recupera los datos.</p>
                <div className="space-y-4 flex-1">
                    {stations.map((station, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">{i+1}. {station}</label>
                            <input 
                                type="text" 
                                placeholder="¿Qué había aquí?"
                                value={recallAnswers[i]}
                                onChange={(e) => {
                                    const next = [...recallAnswers];
                                    next[i] = e.target.value;
                                    setRecallAnswers(next);
                                }}
                                className="w-full bg-black/30 border-none rounded-lg text-white"
                            />
                        </div>
                    ))}
                </div>
                <Button fullWidth onClick={handleTestSubmit} className="mt-8">Verificar Mi Memoria</Button>
            </div>
        )}

        {/* PHASE 6: RESULT */}
        {phase === 'result' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                <div className={`size-32 rounded-full border-4 flex items-center justify-center mb-6 shadow-2xl ${score > 60 ? 'border-primary bg-primary/10' : 'border-orange-500 bg-orange-500/10'}`}>
                    <span className="material-symbols-outlined text-7xl">{score > 60 ? 'emoji_events' : 'psychology_alt'}</span>
                </div>
                <h1 className="text-5xl font-bold mb-2">{score}%</h1>
                <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-10">Precisión de Retención</p>
                
                <p className="text-sm text-gray-500 mb-8">Tu Palacio de Memoria ha sido guardado en tu historial para futuras revisiones.</p>

                <div className="w-full max-w-xs space-y-4">
                    <Button fullWidth onClick={onBack}>Finalizar Entrenamiento</Button>
                    <button onClick={() => window.location.reload()} className="text-primary font-bold hover:underline text-sm">Crear otro Palacio</button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default LociTraining;
