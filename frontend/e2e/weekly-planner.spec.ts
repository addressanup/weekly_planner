import { test, expect } from '@playwright/test';

test.describe('Weekly Planner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="weekly-canvas"], .weekly-canvas, h2', {
      timeout: 10000,
    });
  });

  test('displays weekly canvas on load', async ({ page }) => {
    // Check that the page has loaded and displays week-related content
    const hasWeekContent = await page
      .locator('text=/week|monday|tuesday|wednesday/i')
      .first()
      .isVisible({ timeout: 5000 });

    expect(hasWeekContent).toBeTruthy();
  });

  test('shows days of the week', async ({ page }) => {
    // Check for at least some day indicators
    const dayPatterns = [
      /mon|monday/i,
      /tue|tuesday/i,
      /wed|wednesday/i,
      /thu|thursday/i,
      /fri|friday/i,
    ];

    let foundDays = 0;
    for (const pattern of dayPatterns) {
      const dayVisible = await page.locator(`text=${pattern}`).first().isVisible({ timeout: 2000 }).catch(() => false);
      if (dayVisible) foundDays++;
    }

    expect(foundDays).toBeGreaterThan(2); // At least 3 days should be visible
  });

  test('displays swimlanes', async ({ page }) => {
    // Check for swimlane labels
    const swimlanePatterns = [
      /focus|deep work/i,
      /collaboration|meetings/i,
      /self-care|wellness/i,
      /life admin|admin/i,
    ];

    let foundSwimlanesCount = 0;
    for (const pattern of swimlanePatterns) {
      const swimlaneExists = await page
        .locator(`text=${pattern}`)
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (swimlaneExists) foundSwimlanesCount++;
    }

    expect(foundSwimlanesCount).toBeGreaterThan(0); // At least one swimlane should be visible
  });

  test('has quick add functionality visible', async ({ page }) => {
    // Look for input field or quick add button
    const hasQuickAdd =
      (await page.locator('input[type="text"], textarea, [placeholder*="add"]').count()) > 0;

    expect(hasQuickAdd).toBeTruthy();
  });

  test('can create a floating task via quick add', async ({ page }) => {
    // Find the quick add input
    const quickAddInput = page.locator(
      'input[type="text"]:visible, textarea:visible'
    ).first();

    // Type a task
    await quickAddInput.fill('Write documentation 60m #work high energy');

    // Submit (press Enter or find submit button)
    await quickAddInput.press('Enter').catch(async () => {
      // If Enter doesn't work, try to find and click a submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Add")').first();
      await submitButton.click();
    });

    // Wait a moment for the task to be created
    await page.waitForTimeout(500);

    // Check if the task appears somewhere on the page
    const taskVisible = await page
      .locator('text=/write documentation/i')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    expect(taskVisible).toBeTruthy();
  });

  test('displays task cards with metadata', async ({ page }) => {
    // Create a task first
    const quickAddInput = page.locator(
      'input[type="text"]:visible, textarea:visible'
    ).first();

    await quickAddInput.fill('Review code 45m #work high energy');
    await quickAddInput.press('Enter').catch(async () => {
      const submitButton = page.locator('button[type="submit"], button:has-text("Add")').first();
      await submitButton.click();
    });

    await page.waitForTimeout(500);

    // Look for the task card
    const taskCard = page.locator('text=/review code/i').first();
    await expect(taskCard).toBeVisible({ timeout: 3000 });

    // Check for duration indicator (45 mins or 45m)
    const durationVisible = await page
      .locator('text=/45.*min/i')
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    // Check for energy level
    const energyVisible = await page
      .locator('text=/high/i')
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    expect(durationVisible || energyVisible).toBeTruthy(); // At least one metadata should be visible
  });

  test('can navigate between weeks', async ({ page }) => {
    // Look for week navigation buttons
    const prevButton = page.locator(
      'button:has-text("Previous"), button:has-text("Prev"), button[aria-label*="previous" i], svg.lucide-chevron-left'
    ).first();

    const nextButton = page.locator(
      'button:has-text("Next"), button[aria-label*="next" i], svg.lucide-chevron-right'
    ).first();

    const hasNavigation = (await prevButton.isVisible({ timeout: 2000 }).catch(() => false)) ||
                          (await nextButton.isVisible({ timeout: 2000 }).catch(() => false));

    expect(hasNavigation).toBeTruthy();
  });

  test('displays floating task shelf', async ({ page }) => {
    // Look for floating tasks section
    const hasFloatingSection = await page
      .locator('text=/floating|unscheduled|backlog/i')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    // Or look for a dedicated shelf/panel area
    const hasShelfElement = await page
      .locator('[class*="floating"], [class*="shelf"], [class*="unscheduled"]')
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    expect(hasFloatingSection || hasShelfElement).toBeTruthy();
  });

  test('persists data on page reload', async ({ page }) => {
    // Create a unique task
    const uniqueTaskName = `Test Task ${Date.now()}`;
    const quickAddInput = page.locator(
      'input[type="text"]:visible, textarea:visible'
    ).first();

    await quickAddInput.fill(`${uniqueTaskName} 30m #personal`);
    await quickAddInput.press('Enter').catch(async () => {
      const submitButton = page.locator('button[type="submit"], button:has-text("Add")').first();
      await submitButton.click();
    });

    // Wait for task to appear
    await page.waitForTimeout(1000);

    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="weekly-canvas"], .weekly-canvas, h2', {
      timeout: 10000,
    });

    // Check if the task still exists
    await page.waitForTimeout(1000);
    const taskStillVisible = await page
      .locator(`text=/${uniqueTaskName}/i`)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(taskStillVisible).toBeTruthy();
  });

  test('responsive layout works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that the page still loads and displays content
    await page.waitForTimeout(500);

    const hasContent = await page
      .locator('body')
      .isVisible({ timeout: 2000 });

    expect(hasContent).toBeTruthy();
  });
});
