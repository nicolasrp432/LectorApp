import React, { useRef } from 'react';
import { AppRoute, Book } from '../types';

interface LibraryProps {
  onNavigate: (route: AppRoute) => void;
  books: Book[];
  onSelectBook: (id: string) => void;
  onImportBook: (title: string, content: string) => void;
}

const Library: React.FC<LibraryProps> = ({ onNavigate, books, onSelectBook, onImportBook }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Simple title extraction from filename
        const title = file.name.replace('.txt', '');
        onImportBook(title, text);
      };
      reader.readAsText(file);
    } else {
      alert("Para este MVP, por favor selecciona un archivo .txt");
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-24 overflow-y-auto no-scrollbar">
      {/* Top App Bar */}
      <div className="sticky top-0 z-40 flex items-center bg-background-light dark:bg-background-dark/95 backdrop-blur-sm p-4 pb-2 justify-between border-b border-white/5">
        <div className="text-white flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-[24px] text-slate-900 dark:text-white">sort</span>
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
              <p className="text-slate-500 dark:text-text-secondary text-sm font-normal leading-normal">Soporta .txt (MVP)</p>
            </div>
            <input 
              type="file" 
              accept=".txt" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full sm:w-fit items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-green-400 text-background-dark text-sm font-bold leading-normal transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="truncate">Elegir Archivo</span>
            </button>
          </div>
          <div
            className="w-24 sm:w-32 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 opacity-80"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCnGTdGY77cGTpyrFtEjC1uOTG3Zj1mXdsGaYOGx9q46Nmk1N00JaXQHhaWkl-m7EGGO4Y4dX7gGruuPNBZWiJ2tWs9M397bWZeDY9w2nSMaL_QpsRxSq-kSsL5Si_yn8EM2dNG_uZOktYpvudDVCui_MUHwMxF8j2OELU3TkAX3ZtweNAXSrxnxUj-r8c-UQZzU7--gxOyC38MikZzdT5nlJXpodHPRry0ozc9lq6-rlwm8cv8DysWzp_7Dq2KyS-aPML8qDmgeuLM")' }}
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
                className="bg-center bg-no-repeat aspect-[2/3] w-12 bg-cover rounded-md shadow-md shrink-0"
                style={{ backgroundImage: `url("${book.coverUrl}")` }}
              ></div>
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal truncate group-hover:text-primary transition-colors">{book.title}</p>
                <p className="text-slate-500 dark:text-text-secondary text-sm font-normal leading-normal truncate">{book.author}</p>
              </div>
            </div>
            <div className="shrink-0 pl-2">
              <div className="flex items-center gap-3">
                <div className="hidden sm:block w-[88px] overflow-hidden rounded-full bg-slate-200 dark:bg-white/10 h-1.5">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${book.progress}%` }}></div>
                </div>
                {book.progress > 0 ? (
                    <div className="flex flex-col items-end">
                     <span className="material-symbols-outlined text-primary text-[20px]">timelapse</span>
                    </div>
                ) : (
                    <button className="size-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-primary hover:bg-primary hover:text-background-dark transition-all">
                        <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                    </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-green-900/40 hover:scale-105 active:scale-95 transition-all md:hidden"
      >
        <span className="material-symbols-outlined text-background-dark text-[28px]">add</span>
      </button>
    </div>
  );
};

export default Library;