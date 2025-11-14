import { WeeklyCanvas } from "./components/weekly/WeeklyCanvas";
import { usePlannerBootstrap } from "./hooks/usePlannerBootstrap";
import { ErrorBoundary } from "./components/errors";
import { ToastProvider } from "./components/providers/ToastProvider";

const App = () => {
  usePlannerBootstrap();

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col bg-slate-100">
        <WeeklyCanvas />
      </div>
      <ToastProvider />
    </ErrorBoundary>
  );
};

export default App;
