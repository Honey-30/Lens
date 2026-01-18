/**
 * Production-grade Error Boundary Component
 * Catches React errors and provides graceful fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';
import { performanceMonitor } from '../utils/performance';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorCount } = this.state;
    
    // Log to console
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    
    // Log to structured logger
    logger.critical('[ErrorBoundary] React component error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorCount: errorCount + 1
    }, error);

    // Track in performance monitor
    performanceMonitor.trackUserAction('error_boundary_triggered', 'error', error.message);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Update state
    this.setState(prev => ({
      errorInfo,
      errorCount: prev.errorCount + 1
    }));

    // Auto-recover after too many errors
    if (errorCount >= 3) {
      logger.critical('[ErrorBoundary] Too many errors - clearing state');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  handleReset = () => {
    logger.info('[ErrorBoundary] Manual error reset');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    logger.info('[ErrorBoundary] Page reload requested');
    window.location.reload();
  };

  handleGoHome = () => {
    logger.info('[ErrorBoundary] Navigate to home');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 p-8">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-black/[0.03] p-12">
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-[1.5rem] bg-rose-100 flex items-center justify-center">
                  <AlertTriangle size={40} className="text-rose-600" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-center mb-4 tracking-tight text-[#1A1A1D]">
                System <span className="serif italic text-rose-600">Anomaly</span>
              </h1>

              {/* Description */}
              <p className="text-center text-black/60 mb-8 text-lg leading-relaxed">
                We encountered an unexpected error in the cognitive layer.
                <br />
                Our systems have logged the incident for analysis.
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-8 p-6 bg-black/[0.02] rounded-2xl border border-black/[0.05]">
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-black/40 mb-3">
                    Development Info
                  </p>
                  <div className="font-mono text-sm text-rose-700 space-y-2">
                    <div className="font-bold">{this.state.error.message}</div>
                    {this.state.error.stack && (
                      <pre className="text-xs overflow-auto max-h-40 text-black/60">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Error Counter */}
              {this.state.errorCount > 1 && (
                <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-800 text-center">
                    <strong>Warning:</strong> This error has occurred {this.state.errorCount} times.
                    {this.state.errorCount >= 3 && ' Auto-refresh in 3 seconds...'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-[#1A1A1D] text-white rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-black transition-all shadow-lg hover:shadow-xl"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-black/10 text-[#1A1A1D] rounded-2xl font-bold text-sm uppercase tracking-wider hover:border-black/30 transition-all"
                >
                  <RefreshCw size={18} />
                  Reload Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-black/10 text-[#1A1A1D] rounded-2xl font-bold text-sm uppercase tracking-wider hover:border-black/30 transition-all"
                >
                  <Home size={18} />
                  Go Home
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-8 border-t border-black/[0.05]">
                <p className="text-center text-xs uppercase tracking-[0.3em] text-black/30">
                  Error logged at {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
