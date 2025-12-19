
import React, { useRef, useState } from 'react';
import { AppRoute, Book } from '../types';
import { extractTextFromPdf } from '../utils/pdf';
import { analyzeImageToText } from '../services/ai';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { PRACTICE_LIBRARY } from '../constants';

interface LibraryProps {
  onNavigate: (route: AppRoute) => void;
  onSelectBook: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({ onNavigate, onSelectBook }) => {
  const { books, addBook } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'books' | 'practice'>('books');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMsg('Procesando archivo...');
    
    try {
        let title = file.name.replace(/\.(txt|pdf|jpg|png|jpeg)$/i, '');
        let content = '';

        if (file.type === "text/plain") {
            content = await file.text();
        } else if (file.type === "application/pdf") {
            setLoadingMsg('Extrayendo texto de PDF...');
            content = await extractTextFromPdf(file);
        } else if (file.type.startsWith("image/")) {
            setLoadingMsg('Escaneando página con Gemini Vision...');
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });
            content = await analyzeImageToText(base64);
        } else {
            showToast("Formato no soportado. Usa PDF, TXT o Imágenes.", 'error');
            setIsLoading(false);
            return;
        }

        if (content.length < 50) {
            showToast("No se pudo extraer suficiente texto.", 'warning');
        } else {
            const newBook: Book = {
                id: `user-${Date.now()}`,
                title,
                author: 'Importado',
                coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300',
                content,
                progress: 0,
                isAnalyzed: false,
                category: 'user'
            };
            await addBook(newBook);
            showToast("Libro importado correctamente", 'success');
        }
    } catch (error) {
        showToast("Error al procesar archivo.", 'error');
        console.error(error);
    } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const displayedContent = activeTab === 'books' ? books : PRACTICE_LIBRARY;

  return (
    <div className="flex-1 flex flex-col pb-24 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark relative">
      {isLoading && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-white mb-1">Analizando</h3>
              <p className="text-gray-400 text-sm">{loadingMsg}</p>
          </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Librería</h2>
        </div>
        
        {/* Tabs */}
        <div className="flex p-1 bg-gray-200 dark:bg-black/20 rounded-xl">
            <button onClick={() => setActiveTab('books')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'books' ? 'bg-white dark:bg-surface-dark shadow-sm text-slate-900 dark:text-white' : 'text-gray-500'}`}>Mis Libros</button>
            <button onClick={() => setActiveTab('practice')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'practice' ? 'bg-white dark:bg-surface-dark shadow-sm text-slate-900 dark:text-white' : 'text-gray-500'}`}>Ejercicios</button>
        </div>
      </div>

      {activeTab === 'books' && (
          <div className="p-4 pt-2">
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 flex flex-col gap-4 items-center text-center">
                <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-1">
                    <span className="material-symbols-outlined">document_scanner</span>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Importar o Escanear</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Soporta PDF, TXT y Fotos</p>
                </div>
                <input type="file" accept=".txt,.pdf,.jpg,.jpeg,.png" ref={fileInputRef} className="hidden" onChange={handleFileChange}/>
                <Button onClick={() => fileInputRef.current?.click()} leftIcon="add_a_photo">Subir Archivo</Button>
            </div>
          </div>
      )}

      <div className="px-4 space-y-3 mt-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
            {activeTab === 'books' ? 'Tu Colección' : 'Entrenamientos Guiados'}
        </h3>
        
        {displayedContent.map((item) => (
          <div key={item.id} onClick={() => onSelectBook(item.id)} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/50 transition-all cursor-pointer active:scale-[0.99] h-32 items-center">
            <div className="w-16 h-24 bg-cover bg-center rounded-lg shadow-sm shrink-0 relative overflow-hidden" style={{ backgroundImage: `url("${item.coverUrl}")` }}>
                {item.category === 'practice' && (
                    <div className="absolute bottom-0 w-full bg-black/60 text-white text-[9px] font-bold text-center py-1 uppercase">{item.difficulty}</div>
                )}
            </div>
            <div className="flex flex-col justify-center flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                <p className="text-sm text-gray-500 truncate">{item.author}</p>
                
                {item.category === 'practice' ? (
                     <div className="mt-3 flex items-center gap-2 text-xs text-primary font-bold">
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        Entrenamiento de Velocidad
                     </div>
                ) : (
                    <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${item.progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{item.progress}%</span>
                    </div>
                )}
            </div>
          </div>
        ))}

        {displayedContent.length === 0 && (
            <div className="text-center py-10 opacity-50"><p>No hay elementos disponibles.</p></div>
        )}
      </div>
    </div>
  );
};

export default Library;
