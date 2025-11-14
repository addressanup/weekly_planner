import { useEffect } from "react";
import { WeeklyCanvas } from "./components/weekly/WeeklyCanvas";
import { usePlannerBootstrap } from "./hooks/usePlannerBootstrap";
import { ErrorBoundary } from "./components/errors";
import { ToastProvider } from "./components/providers/ToastProvider";

const App = () => {
  useEffect(() => {
    console.log('[App] Mounted successfully');
  }, []);

  usePlannerBootstrap();

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[App] Error caught by boundary:', error, errorInfo);
      }}
    >
      <div className="flex h-screen flex-col bg-slate-100">
        <WeeklyCanvas />
      </div>
      <ToastProvider />
    </ErrorBoundary>
  );
};

export default App;
