import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Icon } from './CosmoUI';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-cosmos-base z-50">
          <div className="glass-panel-raised rounded-2xl p-8 max-w-md text-center border border-red-500/20">
            <div className="mb-4 flex justify-center"><Icon name="alert" className="w-8 h-8 text-red-400/60" /></div>
            <h2 className="text-sm font-bold text-white/80 mb-2">Something went wrong</h2>
            <p className="text-[11px] text-white/40 font-mono mb-4 break-all">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg border border-neon-cyan/30 text-neon-cyan/70 hover:bg-neon-cyan/10 transition-all text-xs"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
