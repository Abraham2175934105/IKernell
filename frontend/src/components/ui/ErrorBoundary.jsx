import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary atrapó un error de renderizado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 my-4 bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-3xl text-red-900 dark:text-red-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 rounded-2xl shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                {this.props.title || 'Error en tiempo de ejecución capturado'}
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                Se evitó un cierre inesperado de la aplicación (White Screen of Death).
              </p>
            </div>
          </div>

          {this.state.error?.message && (
            <div className="p-3 bg-white/80 dark:bg-zinc-900/80 border border-red-200 dark:border-red-900 rounded-xl font-mono text-[0.72rem] text-red-600 dark:text-red-400 overflow-x-auto">
              <strong>Detalle del error:</strong> {this.state.error.message}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>Reintentar componente</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
