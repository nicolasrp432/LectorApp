
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary component to catch rendering errors and display a fallback UI.
 * Standard class-based implementation for React Error Boundaries.
 */
// Fix: Use React.Component to ensure props and state are correctly inherited and typed.
export class ErrorBoundary extends React.Component<Props, State> {
  // Fix: Initialize state in the constructor to ensure standard React component property behavior and avoid shadowing issues.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  // Static method to update state from an error
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Lifecycle method to log error details
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Lector Crash]:", error, errorInfo);
  }

  public render() {
    // Fix: Access state via this.state which is correctly recognized via inheritance from React.Component.
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
    // Fix: Access children from this.props which is correctly inherited from React.Component.
    return this.props.children;
  }
}
