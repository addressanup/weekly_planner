import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { TaskCard } from './TaskCard';
import type { PlannerTask } from '../../types/planner';
import { DndContext } from '@dnd-kit/core';

// Mock the useSortable hook
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

const mockTask: PlannerTask = {
  id: 'task-1',
  title: 'Review pull requests',
  category: 'work',
  energy: 'high',
  status: 'planned',
  durationMinutes: 45,
  order: 0,
  assignedDayId: 'monday',
  swimlaneId: 'focus',
};

describe('TaskCard', () => {
  it('renders task title correctly', () => {
    render(
      <DndContext>
        <TaskCard task={mockTask} index={0} context="scheduled" />
      </DndContext>
    );

    expect(screen.getByText('Review pull requests')).toBeInTheDocument();
  });

  it('displays task duration and energy level', () => {
    render(
      <DndContext>
        <TaskCard task={mockTask} index={0} context="scheduled" />
      </DndContext>
    );

    expect(screen.getByText(/45 mins/)).toBeInTheDocument();
    expect(screen.getByText(/High energy/)).toBeInTheDocument();
  });

  it('displays task category badge', () => {
    render(
      <DndContext>
        <TaskCard task={mockTask} index={0} context="scheduled" />
      </DndContext>
    );

    expect(screen.getByText('WORK')).toBeInTheDocument();
  });

  it('displays energy badge', () => {
    render(
      <DndContext>
        <TaskCard task={mockTask} index={0} context="scheduled" />
      </DndContext>
    );

    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('displays target occurrences when provided', () => {
    const taskWithTarget: PlannerTask = {
      ...mockTask,
      targetOccurrencesPerWeek: 3,
    };

    render(
      <DndContext>
        <TaskCard task={taskWithTarget} index={0} context="scheduled" />
      </DndContext>
    );

    expect(screen.getByText('3x/week')).toBeInTheDocument();
  });

  it('does not display target occurrences when not provided', () => {
    render(
      <DndContext>
        <TaskCard task={mockTask} index={0} context="scheduled" />
      </DndContext>
    );

    expect(screen.queryByText(/x\/week/)).not.toBeInTheDocument();
  });

  it('applies floating context styles correctly', () => {
    const { container } = render(
      <DndContext>
        <TaskCard task={mockTask} index={0} context="floating" />
      </DndContext>
    );

    const article = container.querySelector('article');
    expect(article).toHaveClass('border-dashed', 'border-slate-300', 'bg-white/80');
  });

  it('renders drag handle button', () => {
    render(
      <DndContext>
        <TaskCard task={mockTask} index={0} context="scheduled" />
      </DndContext>
    );

    const dragButton = screen.getByLabelText('Drag task');
    expect(dragButton).toBeInTheDocument();
  });

  it('rounds duration to nearest 15 minutes', () => {
    const taskWithOddDuration: PlannerTask = {
      ...mockTask,
      durationMinutes: 37, // Should round to 30 (nearest 15)
    };

    render(
      <DndContext>
        <TaskCard task={taskWithOddDuration} index={0} context="scheduled" />
      </DndContext>
    );

    expect(screen.getByText(/30 mins/)).toBeInTheDocument();
  });

  describe('Category Styles', () => {
    it('applies correct styles for work category', () => {
      const { container } = render(
        <DndContext>
          <TaskCard task={{ ...mockTask, category: 'work' }} index={0} context="scheduled" />
        </DndContext>
      );

      const badge = container.querySelector('.bg-indigo-100');
      expect(badge).toBeInTheDocument();
    });

    it('applies correct styles for health category', () => {
      const { container } = render(
        <DndContext>
          <TaskCard task={{ ...mockTask, category: 'health' }} index={0} context="scheduled" />
        </DndContext>
      );

      const badge = container.querySelector('.bg-emerald-100');
      expect(badge).toBeInTheDocument();
    });

    it('applies correct styles for personal category', () => {
      const { container } = render(
        <DndContext>
          <TaskCard task={{ ...mockTask, category: 'personal' }} index={0} context="scheduled" />
        </DndContext>
      );

      const badge = container.querySelector('.bg-rose-100');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Energy Levels', () => {
    it('displays high energy correctly', () => {
      render(
        <DndContext>
          <TaskCard task={{ ...mockTask, energy: 'high' }} index={0} context="scheduled" />
        </DndContext>
      );

      expect(screen.getByText(/High energy/)).toBeInTheDocument();
    });

    it('displays medium energy correctly', () => {
      render(
        <DndContext>
          <TaskCard task={{ ...mockTask, energy: 'medium' }} index={0} context="scheduled" />
        </DndContext>
      );

      expect(screen.getByText(/Medium energy/)).toBeInTheDocument();
    });

    it('displays low energy correctly', () => {
      render(
        <DndContext>
          <TaskCard task={{ ...mockTask, energy: 'low' }} index={0} context="scheduled" />
        </DndContext>
      );

      expect(screen.getByText(/Low energy/)).toBeInTheDocument();
    });
  });
});
