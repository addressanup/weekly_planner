import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { ...options }),
  };
}

/**
 * Re-export everything from testing-library
 */
export * from '@testing-library/react';
export { userEvent };
export { renderWithProviders as render };
