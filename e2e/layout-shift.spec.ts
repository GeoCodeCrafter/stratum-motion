import { test, expect } from '@playwright/test';

/**
 * The budget the library's design is supposed to make unreachable. Google
 * calls anything under 0.1 "good"; a page whose animations only ever touch
 * opacity and transform should not register a shift at all, so the budget
 * here is deliberately an order of magnitude tighter.
 */
const CLS_BUDGET = 0.01;

async function measureCumulativeLayoutShift(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as Array<{
        value: number;
        hadRecentInput: boolean;
      }>) {
        if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  // Scroll the whole page in steps, which is when a badly built reveal shifts.
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let position = 0; position < height; position += 400) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }), position);
    await page.waitForTimeout(120);
  }

  return page.evaluate(() => (window as unknown as { __cls: number }).__cls);
}

test.describe('cumulative layout shift', () => {
  test('stays inside the budget while scrolling the whole page', async ({ page }) => {
    await page.goto('/');

    const cls = await measureCumulativeLayoutShift(page);

    expect(cls).toBeLessThan(CLS_BUDGET);
  });

  test('stays inside the budget under reduced motion too', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const cls = await measureCumulativeLayoutShift(page);

    expect(cls).toBeLessThan(CLS_BUDGET);
  });

  test('a parallax layer never moves the content after it', async ({ page }) => {
    await page.goto('/');
    const band = page.getByTestId('band');
    await band.scrollIntoViewIfNeeded();

    const before = await band.boundingBox();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
    const after = await band.boundingBox();

    // The band moves with the scroll, but its size must not change at all.
    expect(after?.width).toBe(before?.width);
    expect(after?.height).toBe(before?.height);
  });
});
