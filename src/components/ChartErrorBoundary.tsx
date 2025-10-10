import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ChartErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
            <div className="text-center">
              <div className="text-gray-500 mb-2">Chart Error</div>
              <div className="text-sm text-gray-400">
                Unable to display chart data
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
