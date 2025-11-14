# Testing Guide

## Overview

This project uses a comprehensive testing strategy with multiple layers:

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Component Library**: Storybook (planned)
- **Coverage Target**: 80% for core logic, 60% for UI components

---

## Running Tests

### Unit Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

---

## Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── errors/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ErrorBoundary.test.tsx
│   │   └── weekly/
│   │       ├── TaskCard.tsx
│   │       └── TaskCard.test.tsx
│   ├── state/
│   │   ├── usePlannerStore.ts
│   │   └── usePlannerStore.test.ts
│   ├── lib/
│   │   └── notifications/
│   │       ├── toast.ts
│   │       └── toast.test.ts
│   └── test/
│       ├── setup.ts
│       └── test-utils.tsx
├── e2e/
│   └── weekly-planner.spec.ts
├── vitest.config.ts
└── playwright.config.ts
```

---

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('renders task title correctly', () => {
    const task = {
      id: 'task-1',
      title: 'Review pull requests',
      category: 'work',
      energy: 'high',
      status: 'planned',
      durationMinutes: 45,
      order: 0,
    };

    render(<TaskCard task={task} index={0} context="scheduled" />);

    expect(screen.getByText('Review pull requests')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('can create a floating task', async ({ page }) => {
  await page.goto('/');

  const quickAddInput = page.locator('input[type="text"]').first();
  await quickAddInput.fill('Write documentation 60m #work high energy');
  await quickAddInput.press('Enter');

  await expect(page.locator('text=/write documentation/i')).toBeVisible();
});
```

---

## Coverage Thresholds

The project enforces minimum coverage thresholds:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

View coverage reports:

```bash
npm run test:coverage
open frontend/coverage/index.html
```

---

## Test Utilities

### Custom Render Function

Use the custom `render` function from `test-utils.tsx` for consistent test setup:

```typescript
import { render, screen } from '../../test/test-utils';

// Automatically includes user event setup
const { user } = render(<Component />);
await user.click(screen.getByRole('button'));
```

### Mocking

```typescript
import { vi } from 'vitest';

// Mock a module
vi.mock('../services/api', () => ({
  fetchTasks: vi.fn(() => Promise.resolve([])),
}));

// Mock a function
const mockFn = vi.fn();
```

---

## CI/CD Integration

Tests run automatically on:

- Every push to any branch
- Every pull request to main/master/develop

### GitHub Actions Workflow

```yaml
- name: Run unit tests
  run: npm test -- --run --coverage

- name: Run E2E tests
  run: npm run test:e2e
```

---

## Best Practices

### 1. Test User Behavior, Not Implementation

```typescript
// ❌ Bad - testing implementation details
expect(component.state.isOpen).toBe(true);

// ✅ Good - testing user-visible behavior
expect(screen.getByRole('dialog')).toBeVisible();
```

### 2. Use Accessible Queries

```typescript
// ✅ Preferred order
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email');
screen.getByPlaceholderText('Enter email');
screen.getByText('Welcome');

// ❌ Avoid
screen.getByTestId('submit-button');
```

### 3. Test Error States

```typescript
it('displays error message on failure', async () => {
  mockApi.fetchTasks.mockRejectedValue(new Error('Network error'));

  render(<TaskList />);

  await waitFor(() => {
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
```

### 4. Clean Up After Tests

```typescript
afterEach(() => {
  cleanup(); // Automatically done by test setup
  vi.clearAllMocks();
});
```

---

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm test TaskCard.test.tsx

# Run tests matching pattern
npm test -- --grep "renders task"

# Run with debugger
npm test -- --inspect-brk
```

### E2E Tests

```bash
# Run in headed mode
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e:debug

# Run specific test
npm run test:e2e -- --grep "create task"
```

---

## Continuous Improvement

### Adding New Tests

1. Create test file alongside source file (e.g., `Component.test.tsx`)
2. Write tests for happy path and error cases
3. Run tests: `npm test`
4. Check coverage: `npm run test:coverage`

### Maintaining Coverage

- Review coverage reports regularly
- Add tests for uncovered code paths
- Remove dead code that can't be covered

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
