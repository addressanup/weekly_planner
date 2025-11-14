import { describe, it, expect } from 'vitest';
import {
  taskCreationSchema,
  quickAddSchema,
  parseDuration,
  parseCategory,
  parseEnergy,
  parseOccurrences,
  parseSwimlane,
  cleanTitle,
  validateQuickAdd,
} from './schemas';

describe('Validation Schemas', () => {
  describe('taskCreationSchema', () => {
    it('validates a valid task', () => {
      const validTask = {
        title: 'Complete project report',
        category: 'work' as const,
        energy: 'high' as const,
        durationMinutes: 90,
      };

      const result = taskCreationSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it('rejects task with empty title', () => {
      const invalidTask = {
        title: '',
        category: 'work' as const,
        energy: 'high' as const,
        durationMinutes: 90,
      };

      const result = taskCreationSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('rejects task with title too long', () => {
      const invalidTask = {
        title: 'a'.repeat(201),
        category: 'work' as const,
        energy: 'high' as const,
        durationMinutes: 90,
      };

      const result = taskCreationSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('rejects task with invalid category', () => {
      const invalidTask = {
        title: 'Test task',
        category: 'invalid' as any,
        energy: 'high' as const,
        durationMinutes: 90,
      };

      const result = taskCreationSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('rejects task with duration too short', () => {
      const invalidTask = {
        title: 'Test task',
        category: 'work' as const,
        energy: 'high' as const,
        durationMinutes: 2,
      };

      const result = taskCreationSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('rejects task with duration too long', () => {
      const invalidTask = {
        title: 'Test task',
        category: 'work' as const,
        energy: 'high' as const,
        durationMinutes: 500,
      };

      const result = taskCreationSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('accepts optional fields', () => {
      const validTask = {
        title: 'Test task',
        category: 'work' as const,
        energy: 'high' as const,
        durationMinutes: 90,
        notes: 'Some notes',
        targetOccurrencesPerWeek: 3,
      };

      const result = taskCreationSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });
  });

  describe('quickAddSchema', () => {
    it('validates non-empty input', () => {
      const result = quickAddSchema.safeParse({ input: 'Write docs' });
      expect(result.success).toBe(true);
    });

    it('rejects empty input', () => {
      const result = quickAddSchema.safeParse({ input: '' });
      expect(result.success).toBe(false);
    });

    it('trims whitespace', () => {
      const result = quickAddSchema.safeParse({ input: '  Write docs  ' });
      if (result.success) {
        expect(result.data.input).toBe('Write docs');
      }
    });
  });

  describe('parseDuration', () => {
    it('parses minutes format (90m)', () => {
      expect(parseDuration('Task 90m')).toBe(90);
    });

    it('parses hours format (2h)', () => {
      expect(parseDuration('Task 2h')).toBe(120);
    });

    it('parses hours and minutes (1h30m)', () => {
      expect(parseDuration('Task 1h30m')).toBe(90);
    });

    it('parses with spaces (45 mins)', () => {
      expect(parseDuration('Task 45 mins')).toBe(45);
    });

    it('parses full words (2 hours 30 minutes)', () => {
      expect(parseDuration('Task 2 hours 30 minutes')).toBe(150);
    });

    it('returns null for no duration', () => {
      expect(parseDuration('Just a task')).toBeNull();
    });
  });

  describe('parseCategory', () => {
    it('parses work category', () => {
      expect(parseCategory('Task #work')).toBe('work');
    });

    it('parses health category', () => {
      expect(parseCategory('Task #health')).toBe('health');
    });

    it('parses personal category', () => {
      expect(parseCategory('Task #personal')).toBe('personal');
    });

    it('parses learning category', () => {
      expect(parseCategory('Task #learning')).toBe('learning');
    });

    it('parses admin category', () => {
      expect(parseCategory('Task #admin')).toBe('admin');
    });

    it('is case insensitive', () => {
      expect(parseCategory('Task #WORK')).toBe('work');
    });

    it('returns null for invalid category', () => {
      expect(parseCategory('Task #invalid')).toBeNull();
    });

    it('returns null for no category', () => {
      expect(parseCategory('Just a task')).toBeNull();
    });
  });

  describe('parseEnergy', () => {
    it('parses high energy', () => {
      expect(parseEnergy('Task high energy')).toBe('high');
    });

    it('parses medium energy', () => {
      expect(parseEnergy('Task medium energy')).toBe('medium');
    });

    it('parses low energy', () => {
      expect(parseEnergy('Task low energy')).toBe('low');
    });

    it('parses hyphenated format', () => {
      expect(parseEnergy('Task high-energy')).toBe('high');
    });

    it('is case insensitive', () => {
      expect(parseEnergy('Task HIGH ENERGY')).toBe('high');
    });

    it('returns null for no energy', () => {
      expect(parseEnergy('Just a task')).toBeNull();
    });
  });

  describe('parseOccurrences', () => {
    it('parses 3x/week format', () => {
      expect(parseOccurrences('Task 3x/week')).toBe(3);
    });

    it('parses without slash (3x week)', () => {
      expect(parseOccurrences('Task 3x week')).toBe(3);
    });

    it('parses with spaces (3 / week)', () => {
      expect(parseOccurrences('Task 3 / week')).toBe(3);
    });

    it('returns null for no occurrences', () => {
      expect(parseOccurrences('Just a task')).toBeNull();
    });
  });

  describe('parseSwimlane', () => {
    it('parses focus swimlane', () => {
      expect(parseSwimlane('Task @focus')).toBe('focus');
    });

    it('parses collaboration swimlane', () => {
      expect(parseSwimlane('Task @collaboration')).toBe('collaboration');
    });

    it('parses self-care swimlane', () => {
      expect(parseSwimlane('Task @self-care')).toBe('self-care');
    });

    it('parses selfcare variant', () => {
      expect(parseSwimlane('Task @selfcare')).toBe('self-care');
    });

    it('parses life-admin swimlane', () => {
      expect(parseSwimlane('Task @life-admin')).toBe('life-admin');
    });

    it('parses admin shorthand', () => {
      expect(parseSwimlane('Task @admin')).toBe('life-admin');
    });

    it('returns null for invalid swimlane', () => {
      expect(parseSwimlane('Task @invalid')).toBeNull();
    });

    it('returns null for no swimlane', () => {
      expect(parseSwimlane('Just a task')).toBeNull();
    });
  });

  describe('cleanTitle', () => {
    it('removes duration', () => {
      expect(cleanTitle('Task 90m')).toBe('Task');
    });

    it('removes category', () => {
      expect(cleanTitle('Task #work')).toBe('Task');
    });

    it('removes energy', () => {
      expect(cleanTitle('Task high energy')).toBe('Task');
    });

    it('removes occurrences', () => {
      expect(cleanTitle('Task 3x/week')).toBe('Task');
    });

    it('removes swimlane', () => {
      expect(cleanTitle('Task @focus')).toBe('Task');
    });

    it('removes all metadata', () => {
      expect(cleanTitle('Write docs 90m #work high energy 3x/week @focus')).toBe(
        'Write docs'
      );
    });

    it('collapses multiple spaces', () => {
      expect(cleanTitle('Write    docs    90m')).toBe('Write docs');
    });

    it('trims whitespace', () => {
      expect(cleanTitle('  Task 90m  ')).toBe('Task');
    });
  });

  describe('validateQuickAdd', () => {
    it('validates and parses complete input', () => {
      const result = validateQuickAdd('Write docs 90m #work high energy 3x/week @focus');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Write docs');
        expect(result.data.durationMinutes).toBe(90);
        expect(result.data.category).toBe('work');
        expect(result.data.energy).toBe('high');
        expect(result.data.targetOccurrencesPerWeek).toBe(3);
        expect(result.data.swimlane).toBe('focus');
      }
    });

    it('uses defaults when metadata missing', () => {
      const result = validateQuickAdd('Write docs');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Write docs');
        expect(result.data.category).toBe('personal');
        expect(result.data.energy).toBe('medium');
        expect(result.data.durationMinutes).toBe(30);
      }
    });

    it('rejects empty input', () => {
      const result = validateQuickAdd('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('rejects input with only metadata', () => {
      const result = validateQuickAdd('90m #work high energy');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Task title is required');
      }
    });

    it('handles partial metadata', () => {
      const result = validateQuickAdd('Review code #work');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Review code');
        expect(result.data.category).toBe('work');
        expect(result.data.energy).toBe('medium'); // default
        expect(result.data.durationMinutes).toBe(30); // default
      }
    });
  });
});
