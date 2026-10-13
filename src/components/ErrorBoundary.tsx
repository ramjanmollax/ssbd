import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State;
  props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-emerald-50/50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🌱
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              সাইটটি লোড হতে সমস্যা হয়েছে
            </h1>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              অনুগ্রহ করে পেজটি রিফ্রেশ করুন অথবা পুনরায় লোড করার চেষ্টা করুন।
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                পেজ রিফ্রেশ করুন
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm transition-all cursor-pointer"
              >
                রিসেট করে খুলুন
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-[11px] text-gray-400 cursor-pointer hover:text-gray-600">
                  কারিগরি তথ্য (Debug info)
                </summary>
                <pre className="mt-2 p-3 bg-gray-50 border rounded-xl text-[10px] text-red-600 overflow-x-auto whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
