/**
 * ErrorBoundary.tsx
 *
 * React Error Boundary for graceful error handling
 * Prevents entire UI from crashing when component errors occur
 */

import { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * Catches React rendering errors and displays fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-400 mb-2">
                  문제가 발생했습니다
                </h3>
                <p className="text-red-300 mb-4">
                  일시적인 오류가 발생했습니다. 다시 시도하거나 페이지를 새로고침해주세요.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 p-4 bg-black/30 rounded text-xs text-gray-400 font-mono">
                    <summary className="cursor-pointer text-red-400 mb-2">
                      오류 상세 정보 (개발 모드)
                    </summary>
                    <div className="space-y-2">
                      <div>
                        <strong className="text-red-400">Error:</strong>
                        <pre className="mt-1 overflow-x-auto">{this.state.error.message}</pre>
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong className="text-red-400">Stack Trace:</strong>
                          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      {this.state.errorInfo && (
                        <div>
                          <strong className="text-red-400">Component Stack:</strong>
                          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <button
                  onClick={this.handleReset}
                  className="
                    mt-4 px-6 py-2 bg-red-500 hover:bg-red-600
                    text-white font-bold rounded-lg
                    transition-all transform hover:scale-105 active:scale-95
                  "
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized ErrorBoundary for Evidence components
 */
export function EvidenceErrorBoundary({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <ErrorBoundary
      fallback={
        <motion.div
          className="p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-red-400 font-bold mb-1">증거 로드 실패</h3>
                <p className="text-red-300 text-sm">
                  증거 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      }
      onError={(error) => {
        console.error('Evidence component error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
