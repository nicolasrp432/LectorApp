
import React, { useRef, useState } from 'react';
import { AppRoute, Book } from '../types.ts';
import { extractTextFromPdf } from '../utils/pdf.ts';
import { analyzeImageToText } from '../services/ai.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Button } from '../components/ui/Button.tsx';
import { PRACTICE_LIBRARY } from '../constants.ts';

interface LibraryProps {
  onNavigate: (route: AppRoute) => void;
  onSelectBook: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({ onNavigate, onSelectBook }) => {
  const { books, addBook, removeBook } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'books' | 'practice'>('books');
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');

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
            setLoadingMsg('Escaneando página...');
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });
            content = await analyzeImageToText(base64);
        } else {
            showToast("Formato no soportado.", 'error');
            setIsLoading(false);
            return;
        }

        if (content.trim().length < 20) {
            showToast("Texto insuficiente detectado.", 'warning');
        } else {
            const newBook: Book = {
                id: `user-${Date.now()}`,
                title,
                author: 'Importado',
                coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300',
                content,
                progress: 0,
                category: 'user'
            };
            await addBook(newBook);
            showToast("Libro añadido", 'success');
        }
    } catch (error) {
        showToast("Error al procesar archivo.", 'error');
    } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasteSubmit = async () => {
      if (pasteContent.trim().length < 20 || !pasteTitle.trim()) {
          showToast("Introduce un título y contenido suficiente.", "warning");
          return;
      }
      setIsLoading(true);
      const newBook: Book = {
          id: `user-${Date.now()}`,
          title: pasteTitle,
          author: 'Manual',
          coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300',
          content: pasteContent,
          progress: 0,
          category: 'user'
      };
      await addBook(newBook);
      showToast("Texto guardado", "success");
      setIsPasteMode(false);
      setPasteContent('');
      setPasteTitle('');
      setIsLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      // EVITAR PROPAGACIÓN INMEDIATA: Fundamental para no abrir el libro
      e.preventDefault();
      e.stopPropagation();
      
      if (confirm("¿Eliminar este texto permanentemente?")) {
          try {
              await removeBook(id);
              showToast("Texto eliminado", "info");
          } catch (err) {
              showToast("Error al eliminar", "error");
          }
      }
  };

  const displayedContent = activeTab === 'books' ? books : PRACTICE_LIBRARY;

  return (
    <div className="flex-1 flex flex-col pb-24 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark relative">
      {(isLoading || isPasteMode) && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              {isLoading ? (
                  <>
                    <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold text-white mb-1">Cargando</h3>
                    <p className="text-gray-400 text-sm">{loadingMsg}</p>
                  </>
              ) : (
                  <div className="bg-surface-dark p-8 rounded-[2.5rem] w-full max-w-sm border border-white/10 animate-in zoom-in-95">
                      <h3 className="text-xl font-bold mb-6">Pegar Contenido</h3>
                      <input 
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 mb-3 outline-none focus:border-primary text-sm"
                        placeholder="Título del texto..."
                        value={pasteTitle}
                        onChange={(e) => setPasteTitle(e.target.value)}
                      />
                      <textarea 
                        className="w-full h-48 bg-black/20 border border-white/10 rounded-xl p-4 mb-6 outline-none focus:border-primary text-sm resize-none"
                        placeholder="Pega aquí el artículo, capítulo o notas para entrenar..."
                        value={pasteContent}
                        onChange={(e) => setPasteContent(e.target.value)}
                      />
                      <div className="flex gap-3">
                          <Button variant="ghost" fullWidth onClick={() => setIsPasteMode(false)}>Cancelar</Button>
                          <Button fullWidth onClick={handlePasteSubmit}>Guardar</Button>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 border-b border-white/5">
        <h2 className="text-2xl font-bold mb-4">Librería</h2>
        <div className="flex p-1 bg-gray-200 dark:bg-black/20 rounded-xl">
            <button onClick={() => setActiveTab('books')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'books' ? 'bg-white dark:bg-surface-dark shadow-sm text-slate-900 dark:text-white' : 'text-gray-500'}`}>Mis Libros</button>
            <button onClick={() => setActiveTab('practice')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'practice' ? 'bg-white dark:bg-surface-dark shadow-sm text-slate-900 dark:text-white' : 'text-gray-500'}`}>Ejercicios</button>
        </div>
      </div>

      {activeTab === 'books' && (
          <div className="p-4 pt-2">
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 flex flex-col gap-4 items-center text-center">
                <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-1">
                    <span className="material-symbols-outlined">library_add</span>
                </div>
                <div>
                    <h3 className="font-bold text-lg">Añadir Nuevo</h3>
                    <p className="text-xs text-gray-500">Soporta PDF, TXT o pegado directo</p>
                </div>
                <div className="flex gap-2 w-full">
                    <input type="file" accept=".txt,.pdf,.jpg,.jpeg,.png" ref={fileInputRef} className="hidden" onChange={handleFileChange}/>
                    <Button onClick={() => fileInputRef.current?.click()} className="flex-1" size="sm" leftIcon="upload">Subir</Button>
                    <Button variant="secondary" onClick={() => setIsPasteMode(true)} className="flex-1" size="sm" leftIcon="content_paste">Pegar</Button>
                </div>
            </div>
          </div>
      )}

      <div className="px-4 space-y-3 mt-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
            {activeTab === 'books' ? 'Tu Colección' : 'Pre-cargados'}
        </h3>
        
        {displayedContent.map((item) => (
          <div key={item.id} onClick={() => onSelectBook(item.id)} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/50 transition-all cursor-pointer h-32 items-center group relative overflow-hidden">
            <div className="w-16 h-24 bg-cover bg-center rounded-lg shadow-sm shrink-0" style={{ backgroundImage: `url("${item.coverUrl}")` }}></div>
            <div className="flex flex-col justify-center flex-1 min-w-0">
                <h4 className="font-bold truncate pr-6">{item.title}</h4>
                <p className="text-xs text-gray-500 truncate">{item.author}</p>
                <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${item.progress}%` }}></div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{item.progress}%</span>
                </div>
            </div>
            
            {activeTab === 'books' && (
                <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Eliminar texto"
                >
                    <span className="material-symbols-outlined text-sm">delete</span>
                </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
