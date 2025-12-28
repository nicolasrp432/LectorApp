
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Error Boundary implementation with TypeScript fixes for state and props inheritance
// Fixed: Using React.Component and a constructor ensures the compiler correctly identifies 'props' as a member of the class.
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Lector Crash]:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#112116] flex flex-col items-center justify-center p-8 text-center">
          <div className="size-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <span className="material-symbols-outlined text-red-500 text-5xl">warning</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Algo no ha ido bien</h1>
          <p className="text-gray-400 text-sm mb-8 max-w-xs">
            La aplicación ha encontrado un error inesperado en el renderizado.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-primary text-black font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            Reiniciar Aplicación
          </button>
          <pre className="mt-8 p-4 bg-black/40 rounded-lg text-[10px] text-red-400 text-left max-w-full overflow-x-auto">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    // Safely return children from props
    return this.props.children;
  }
}
