import { useEffect, useState } from "react";
import { WeeklyCanvas } from "./components/weekly/WeeklyCanvas";
import { usePlannerBootstrap } from "./hooks/usePlannerBootstrap";
import { ErrorBoundary } from "./components/errors";
import { ToastProvider } from "./components/providers/ToastProvider";
import { AuthModal } from "./components/auth";
import { useAuthStore, setupAuthEventListeners } from "./state/useAuthStore";

const App = () => {
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  usePlannerBootstrap();

  // Initialize authentication on mount
  useEffect(() => {
    console.log('[App] Mounted successfully');

    // Setup auth event listeners (e.g., logout on 401)
    setupAuthEventListeners();

    // Load user profile if token exists
    initialize();
  }, [initialize]);

  // Show auth modal when not authenticated and initialized
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [isInitialized, isAuthenticated]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="text-lg text-gray-600">Loading Weekly Planner...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[App] Error caught by boundary:', error, errorInfo);
      }}
    >
      <div className="flex h-screen flex-col bg-slate-100">
        {isAuthenticated ? (
          <WeeklyCanvas />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold text-gray-900">
                Weekly Planner
              </h1>
              <p className="text-lg text-gray-600">
                Please sign in to continue
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          // Modal can only be closed by logging in
          // User must authenticate to use the app
        }}
      />

      <ToastProvider />
    </ErrorBoundary>
  );
};

export default App;
