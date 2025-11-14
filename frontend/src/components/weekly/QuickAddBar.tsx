import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Sparkles, Timer } from "lucide-react";

import { usePlanner } from "../../hooks/usePlanner";
import type { PlannerCategory, PlannerEnergy } from "../../types/planner";

interface ParsedQuickAdd {
  title: string;
  category: PlannerCategory;
  energy: PlannerEnergy;
  durationMinutes: number;
  targetOccurrencesPerWeek?: number;
}

const defaultSuggestion = [
  "e.g. Deep work block on Tuesday for 90 mins #work high energy",
  "e.g. Run club 3x/week #health 45m low energy",
  "Use @focus or @self-care to target a lane soon",
];

const categoryHints: Record<PlannerCategory, RegExp> = {
  work: /\b(work|project|client|deep work|focus)\b/i,
  health: /\b(health|run|workout|exercise|yoga|gym)\b/i,
  personal: /\b(personal|family|friend|relationship|call|social)\b/i,
  learning: /\b(learn|course|study|reading|read|practice|class)\b/i,
  admin: /\b(admin|finance|email|inbox|paperwork|logistics|plan|errand)\b/i,
};

const laneHints: Record<string, PlannerCategory> = {
  "@focus": "work",
  "@collab": "work",
  "@self-care": "health",
  "@life-admin": "admin",
};

const energyHints: Record<PlannerEnergy, RegExp> = {
  high: /\b(high energy|high-energy|high)\b/i,
  medium: /\b(medium energy|medium-energy|medium|balanced)\b/i,
  low: /\b(low energy|low-energy|low|light)\b/i,
};

const parseDuration = (input: string) => {
  const durationRegex = /(\d+)\s?(mins?|minutes?|m|hours?|hrs?|h)\b/i;
  const match = input.match(durationRegex);
  if (!match) {
    return { minutes: 60, remaining: input };
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const minutes = unit.startsWith("h") ? value * 60 : value;

  return {
    minutes: Math.max(15, Math.min(minutes, 240)),
    remaining: input.replace(durationRegex, "").trim(),
  };
};

const parseOccurrences = (input: string) => {
  const occurrenceRegex = /(\d+)\s?(x\/?week|x per week|times? per week)/i;
  const match = input.match(occurrenceRegex);
  if (!match) {
    return { count: undefined, remaining: input };
  }

  const count = Number.parseInt(match[1], 10);
  return {
    count: Math.max(1, Math.min(count, 7)),
    remaining: input.replace(occurrenceRegex, "").trim(),
  };
};

const detectCategory = (input: string): PlannerCategory => {
  const hashCategoryMatch = input.match(/#(\w+)/);
  if (hashCategoryMatch) {
    const tag = hashCategoryMatch[1].toLowerCase();
    switch (tag) {
      case "work":
      case "focus":
        return "work";
      case "health":
      case "wellness":
      case "fitness":
        return "health";
      case "personal":
      case "home":
      case "family":
        return "personal";
      case "learn":
      case "learning":
      case "study":
        return "learning";
      case "admin":
      case "ops":
        return "admin";
      default:
        break;
    }
  }

  for (const [category, pattern] of Object.entries(categoryHints)) {
    if (pattern.test(input)) {
      return category as PlannerCategory;
    }
  }

  for (const [hint, mappedCategory] of Object.entries(laneHints)) {
    if (input.includes(hint)) {
      return mappedCategory;
    }
  }

  return "work";
};

const detectEnergy = (
  input: string
): { energy: PlannerEnergy; remaining: string } => {
  for (const [energy, pattern] of Object.entries(energyHints)) {
    if (pattern.test(input)) {
      return {
        energy: energy as PlannerEnergy,
        remaining: input.replace(pattern, "").trim(),
      };
    }
  }

  return { energy: "medium", remaining: input };
};

const stripMetaTokens = (input: string) =>
  input.replace(/#\w+/g, "").replace(/@\w+/g, "").replace(/\s+/g, " ").trim();

const parseQuickAdd = (raw: string): ParsedQuickAdd | null => {
  const base = raw.trim();
  if (!base) {
    return null;
  }

  const { minutes, remaining: afterDuration } = parseDuration(base);
  const { count, remaining: afterOccurrences } =
    parseOccurrences(afterDuration);
  const category = detectCategory(afterOccurrences);
  const { energy, remaining } = detectEnergy(afterOccurrences);

  const title = stripMetaTokens(remaining).replace(/\s+/g, " ").trim();

  if (!title) {
    return null;
  }

  return {
    title,
    category,
    energy,
    durationMinutes: minutes,
    targetOccurrencesPerWeek: count,
  };
};

export const QuickAddBar = () => {
  const inputId = useId();
  const [value, setValue] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [lastCreatedTitle, setLastCreatedTitle] = useState<string | null>(null);

  const createFloatingTask = usePlanner(
    (state) => state.createFloatingTask
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseQuickAdd(value);
    if (!parsed) {
      setHintIndex((index) => (index + 1) % defaultSuggestion.length);
      return;
    }

    // createFloatingTask may return Promise<PlannerTask> or PlannerTask
    const task = await Promise.resolve(createFloatingTask({
      ...parsed,
    }));

    setLastCreatedTitle(task.title);
    setValue("");
  };

  return (
    <section className="border-b border-slate-200 bg-white/70 px-6 py-4 shadow-sm backdrop-blur">
      <form
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-indigo-200 hover:shadow"
        onSubmit={handleSubmit}
      >
        <label
          htmlFor={inputId}
          className="flex items-center gap-2 text-sm font-medium text-slate-600"
        >
          <Sparkles className="size-4 text-indigo-500" aria-hidden />
          Quick add a task or routine
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              id={inputId}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={defaultSuggestion[hintIndex]}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-inner outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            <Timer className="size-4" aria-hidden />
            Add to floating
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>#work #health #personal #learning #admin</span>
          <span>@focus @collab @self-care @life-admin</span>
          <span>Include durations (45m, 2h) and energy (high/medium/low)</span>
          {lastCreatedTitle ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
              Added “{lastCreatedTitle}” to floating tasks
            </span>
          ) : null}
        </div>
      </form>
    </section>
  );
};
