import { WeeklyCanvas } from "./components/weekly/WeeklyCanvas";
import { usePlannerBootstrap } from "./hooks/usePlannerBootstrap";

const App = () => {
  usePlannerBootstrap();

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <WeeklyCanvas />
    </div>
  );
};

export default App;
