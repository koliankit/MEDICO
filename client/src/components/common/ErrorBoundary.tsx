import React, { Component, ErrorInfo, ReactNode } from 'react';
import { HeartPulse, RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in City Hospital Pune Portal:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    localStorage.removeItem('chp_auth_token');
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-hospital-navy text-white p-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-hospital-teal flex items-center justify-center shadow-md">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-base tracking-tight">CITY HOSPITAL PUNE</h2>
                <p className="text-xs text-teal-300">Application Resilience Guard</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm mb-1">Display Notice</h3>
                  <p className="leading-relaxed text-amber-800">
                    The portal encountered an unexpected display state. Your medical session data is safe.
                  </p>
                </div>
              </div>

              {this.state.error && (
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-[11px] overflow-x-auto max-h-36">
                  {this.state.error.toString()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={this.handleReload}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-hospital-teal hover:bg-hospital-tealDark text-white shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Portal
                </button>
                <button
                  onClick={this.handleReset}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Reset to Homepage
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              Emergency Contact (India): <strong className="text-red-600 font-bold">112</strong> • City Hospital Pune OPD
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
