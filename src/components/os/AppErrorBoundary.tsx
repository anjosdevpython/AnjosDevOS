'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  appName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Erro no app "${this.props.appName || 'Desconhecido'}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-background text-text">
          <AlertTriangle className="w-10 h-10 text-neon-yellow mb-4" />
          <h2 className="text-sm font-semibold text-text mb-2">
            Erro ao carregar {this.props.appName || 'aplicativo'}
          </h2>
          <p className="text-[10px] text-text-muted text-center mb-4 max-w-sm">
            {this.state.error?.message || 'Ocorreu um erro inesperado'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded hover:bg-neon-green/30 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
