import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/Button.tsx';
import { editImage } from '../services/ai.ts';
import { useToast } from '../context/ToastContext.tsx';

interface ImageEditorProps {
    onBack: () => void;
    initialImage?: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onBack, initialImage }) => {
    const { showToast } = useToast();
    const [image, setImage] = useState<string | null>(initialImage || null);
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = async () => {
        if (!image || !prompt) return;
        setIsProcessing(true);
        try {
            const result = await editImage(image, prompt);
            if (result) {
                setImage(result);
                showToast("Imagen editada con éxito", "success");
                setPrompt('');
            } else {
                showToast("No se pudo editar la imagen", "error");
            }
        } catch (error) {
            showToast("Error en el laboratorio de imagen", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display p-6 overflow-y-auto no-scrollbar">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Laboratorio de Imágenes</h1>
            </header>

            <div className="flex-1 flex flex-col gap-6">
                {/* Canvas Area */}
                <div className="w-full aspect-square bg-gray-100 dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden relative flex items-center justify-center">
                    {image ? (
                        <img src={image} alt="Edit target" className="w-full h-full object-contain" />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-gray-500">
                            <span className="material-symbols-outlined text-6xl">image_search</span>
                            <p className="text-sm font-medium">Sube una imagen para empezar</p>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                            <Button size="sm" onClick={() => fileInputRef.current?.click()}>Seleccionar</Button>
                        </div>
                    )}
                    
                    {isProcessing && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                            <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                            <h3 className="text-lg font-bold text-white">Nano Banana procesando...</h3>
                            <p className="text-xs text-gray-400 mt-1">Transformando tu visión</p>
                        </div>
                    )}
                </div>

                {/* Prompt Section */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Instrucciones para la IA</label>
                        <div className="relative">
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ej: 'Añade un filtro retro', 'Quita el fondo', 'Añade un gato futurista'..."
                                className="w-full h-24 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none text-sm"
                            />
                            <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                Gemini 2.5 Flash Image
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Cambiar Imagen</Button>
                        <Button disabled={!image || !prompt} onClick={handleEdit}>Ejecutar Edición</Button>
                    </div>
                </div>

                {/* Quick Prompts */}
                <div className="mt-4">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-3">Sugerencias rápidas</p>
                    <div className="flex flex-wrap gap-2">
                        {['Filtro B&N', 'Estilo Ciberpunk', 'Iluminación Cálida', 'Convertir en dibujo', 'Añadir neblina'].map(s => (
                            <button 
                                key={s} 
                                onClick={() => setPrompt(s)}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full text-xs hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;