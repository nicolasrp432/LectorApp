import React, { useRef, useState } from 'react';
import { AppRoute, Book } from '../types';
import { extractTextFromPdf } from '../utils/pdf';

interface LibraryProps {
  onNavigate: (route: AppRoute) => void;
  books: Book[];
  onSelectBook: (id: string) => void;
  onImportBook: (title: string, content: string) => void;
}

const Library: React.FC<LibraryProps> = ({ onNavigate, books, onSelectBook, onImportBook }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
        let title = file.name.replace(/\.(txt|pdf)$/i, '');
        let content = '';

        if (file.type === "text/plain") {
            content = await file.text();
        } else if (file.type === "application/pdf") {
            content = await extractTextFromPdf(file);
        } else {
            alert("Formato no soportado. Usa .txt o .pdf");
            setIsLoading(false);
            return;
        }

        if (content.length < 50) {
            alert("El archivo parece estar vacío o no se pudo leer texto.");
        } else {
            onImportBook(title, content);
        }
    } catch (error) {
        console.error(error);
        alert("Hubo un error al leer el archivo.");
    } finally {
        setIsLoading(false);
        // Reset input to allow selecting same file again
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateClick = (e: React.MouseEvent, book: Book) => {
      e.stopPropagation();
      const content = book.content || "Contenido simulado para generación de IA..."; 
      onImportBook(book.title, content); 
  };

  return (
    <div className="flex-1 flex flex-col pb-24 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark relative">
      {isLoading && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-white">Procesando Documento...</h3>
          </div>
      )}

      {/* Top App Bar */}
      <div className="sticky top-0 z-40 flex items-center bg-background-light dark:bg-background-dark/95 backdrop-blur-sm p-4 pb-2 justify-between border-b border-white/5">
        <div className="text-white flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-[24px] text-slate-900 dark:text-white">library_books</span>
        </div>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Librería</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0 hover:opacity-80 transition-opacity">Editar</button>
        </div>
      </div>

      {/* Import Card Section */}
      <div className="p-4 pt-6">
        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-slate-200 dark:border-white/5">
          <div className="flex flex-[2_2_0px] flex-col gap-4 justify-center">
            <div className="flex flex-col gap-1">
              <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Importar Documento</p>
              <p className="text-slate-500 dark:text-text-secondary text-sm font-normal leading-normal">Soporta PDF y TXT</p>
            </div>
            <input 
              type="file" 
              accept=".txt,.pdf" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full sm:w-fit items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-green-400 text-background-dark text-sm font-bold leading-normal transition-colors shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              <span className="truncate">Subir Archivo</span>
            </button>
          </div>
          <div
            className="w-24 sm:w-32 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 opacity-80"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=300&auto=format&fit=crop")' }}
          ></div>
        </div>
      </div>

      {/* Library List */}
      <div className="flex flex-col">
        <h2 className="text-slate-900 dark:text-white text-[20px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-4">Tus Libros</h2>
        {books.map((book) => (
          <div key={book.id} onClick={() => onSelectBook(book.id)} className="flex items-center gap-4 px-4 py-3 justify-between hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className="bg-center bg-no-repeat aspect-[2/3] w-12 bg-cover rounded-md shadow-md shrink-0 border border-white/10"
                style={{ backgroundImage: `url("${book.coverUrl}")` }}
              ></div>
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal truncate group-hover:text-primary transition-colors">{book.title}</p>
                <div className="flex items-center gap-2">
                    <p className="text-slate-500 dark:text-text-secondary text-sm font-normal leading-normal truncate">{book.author}</p>
                    {book.isAnalyzed && <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded font-bold">AI READY</span>}
                </div>
              </div>
            </div>
            
            <div className="shrink-0 pl-2">
                {!book.isAnalyzed ? (
                     <button 
                        onClick={(e) => handleGenerateClick(e, book)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors"
                        title="Generar Flashcards"
                     >
                         <span className="material-symbols-outlined text-[20px]">psychology</span>
                         <span className="text-[9px] font-bold">Analizar</span>
                     </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block w-[88px] overflow-hidden rounded-full bg-slate-200 dark:bg-white/10 h-1.5">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${book.progress}%` }}></div>
                        </div>
                        {book.progress > 0 ? (
                            <span className="material-symbols-outlined text-primary text-[20px]">timelapse</span>
                        ) : (
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">play_arrow</span>
                        )}
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;