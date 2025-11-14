import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

/**
 * Fallback UI component displayed when an error is caught by ErrorBoundary
 */
export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Something went wrong
        </h1>

        <p className="text-gray-600 text-center mb-6">
          We're sorry for the inconvenience. The application encountered an unexpected error.
        </p>

        {error && import.meta.env.DEV && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-mono text-red-800 break-words">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-red-700 cursor-pointer hover:text-red-800">
                  View stack trace
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-x-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="space-y-3">
          {onReset && (
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}

          <button
            onClick={handleReload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>

          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
