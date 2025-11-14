import { z } from 'zod';
import type { PlannerCategory, PlannerEnergy, PlannerSwimlaneKey } from '../../types/planner';

/**
 * Validation schemas for form inputs using Zod
 */

// Task creation schema
export const taskCreationSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be less than 200 characters')
    .trim(),
  category: z.enum(['work', 'health', 'personal', 'learning', 'admin']),
  energy: z.enum(['high', 'medium', 'low']),
  durationMinutes: z
    .number()
    .int('Duration must be a whole number')
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  targetOccurrencesPerWeek: z
    .number()
    .int()
    .min(1)
    .max(21, 'Cannot exceed 3 times per day')
    .optional(),
});

export type TaskCreationInput = z.infer<typeof taskCreationSchema>;

// Quick add bar schema (natural language input)
export const quickAddSchema = z.object({
  input: z
    .string()
    .min(1, 'Please enter a task')
    .max(500, 'Input is too long')
    .trim(),
});

export type QuickAddInput = z.infer<typeof quickAddSchema>;

// Day theme schema
export const dayThemeSchema = z.object({
  theme: z
    .string()
    .max(100, 'Theme must be less than 100 characters')
    .trim()
    .optional(),
  focusMetric: z
    .string()
    .max(200, 'Focus metric must be less than 200 characters')
    .trim()
    .optional(),
});

export type DayThemeInput = z.infer<typeof dayThemeSchema>;

// Task update schema
export const taskUpdateSchema = taskCreationSchema.partial().extend({
  status: z.enum(['planned', 'in-progress', 'completed', 'skipped']).optional(),
});

export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

// Swimlane assignment schema
export const swimlaneAssignmentSchema = z.object({
  swimlaneId: z.enum(['focus', 'collaboration', 'self-care', 'life-admin'] as const),
  dayId: z.string().min(1, 'Day ID is required'),
});

export type SwimlaneAssignmentInput = z.infer<typeof swimlaneAssignmentSchema>;

// Helper: Parse duration from natural language
export const parseDuration = (input: string): number | null => {
  // Match patterns like: 90m, 1h, 2h30m, 45 mins, 1 hour 30 minutes
  const patterns = [
    /(\d+)\s*h(?:ours?)?(?:\s*(\d+)\s*m(?:ins?)?)?/i, // 2h, 2h30m, 2 hours 30 minutes
    /(\d+)\s*m(?:ins?)?/i, // 90m, 45 mins
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      if (match[2]) {
        // Hours + minutes
        return parseInt(match[1]) * 60 + parseInt(match[2]);
      } else if (pattern.source.includes('h')) {
        // Just hours
        return parseInt(match[1]) * 60;
      } else {
        // Just minutes
        return parseInt(match[1]);
      }
    }
  }

  return null;
};

// Helper: Parse category from hashtag
export const parseCategory = (input: string): PlannerCategory | null => {
  const categoryMap: Record<string, PlannerCategory> = {
    work: 'work',
    health: 'health',
    personal: 'personal',
    learning: 'learning',
    admin: 'admin',
  };

  const match = input.match(/#(\w+)/i);
  if (match) {
    const category = match[1].toLowerCase();
    return categoryMap[category] || null;
  }

  return null;
};

// Helper: Parse energy level
export const parseEnergy = (input: string): PlannerEnergy | null => {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('high energy') || lowerInput.includes('high-energy')) {
    return 'high';
  }
  if (lowerInput.includes('medium energy') || lowerInput.includes('medium-energy')) {
    return 'medium';
  }
  if (lowerInput.includes('low energy') || lowerInput.includes('low-energy')) {
    return 'low';
  }

  return null;
};

// Helper: Parse target occurrences (e.g., "3x/week")
export const parseOccurrences = (input: string): number | null => {
  const match = input.match(/(\d+)x?\s*\/?\s*week/i);
  return match ? parseInt(match[1]) : null;
};

// Helper: Parse swimlane hint (e.g., "@focus")
export const parseSwimlane = (input: string): PlannerSwimlaneKey | null => {
  const swimlaneMap: Record<string, PlannerSwimlaneKey> = {
    focus: 'focus',
    collaboration: 'collaboration',
    'self-care': 'self-care',
    selfcare: 'self-care',
    'life-admin': 'life-admin',
    admin: 'life-admin',
  };

  const match = input.match(/@([\w-]+)/i);
  if (match) {
    const swimlane = match[1].toLowerCase();
    return swimlaneMap[swimlane] || null;
  }

  return null;
};

// Helper: Clean title by removing parsed metadata
export const cleanTitle = (input: string): string => {
  return input
    .replace(/\d+\s*h(?:ours?)?(?:\s*\d+\s*m(?:ins?)?)?/gi, '') // Remove duration
    .replace(/\d+\s*m(?:ins?)?/gi, '') // Remove duration (minutes only)
    .replace(/#\w+/g, '') // Remove category
    .replace(/\d+x?\s*\/?\s*week/gi, '') // Remove occurrences
    .replace(/@[\w-]+/gi, '') // Remove swimlane hints
    .replace(/high energy|medium energy|low energy/gi, '') // Remove energy
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
};

// Validation helper: Validate and parse quick add input
export const validateQuickAdd = (input: string) => {
  const result = quickAddSchema.safeParse({ input });

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return {
      success: false as const,
      error: firstIssue?.message || 'Invalid input',
    };
  }

  const cleanedInput = result.data.input;

  // Extract metadata
  const duration = parseDuration(cleanedInput);
  const category = parseCategory(cleanedInput);
  const energy = parseEnergy(cleanedInput);
  const occurrences = parseOccurrences(cleanedInput);
  const swimlane = parseSwimlane(cleanedInput);
  const title = cleanTitle(cleanedInput);

  // Validate title after cleaning
  if (!title || title.length === 0) {
    return {
      success: false as const,
      error: 'Task title is required',
    };
  }

  return {
    success: true as const,
    data: {
      title,
      category: category || 'personal',
      energy: energy || 'medium',
      durationMinutes: duration || 30,
      targetOccurrencesPerWeek: occurrences,
      swimlane,
    },
  };
};
