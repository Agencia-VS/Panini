import { Component, type ReactNode, type ErrorInfo } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('panini-bingo-state');
    } catch { /* noop */ }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1 className="error-boundary__title">⚠️ Algo salió mal</h1>
          <p className="error-boundary__message">
            {this.state.error?.message ?? 'Error inesperado'}
          </p>
          <div className="error-boundary__actions">
            <button className="error-boundary__btn" onClick={this.handleReload}>
              Recargar página
            </button>
            <button className="error-boundary__btn error-boundary__btn--danger" onClick={this.handleReset}>
              Reiniciar todo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
