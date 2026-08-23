import { test, expect } from '@playwright/test';

test.describe('ScrollScene', () => {
  test('reports progress that rises as the page scrolls', async ({ page }) => {
    await page.goto('/');
    const scene = page.getByTestId('scene');
    await scene.scrollIntoViewIfNeeded();

    const first = Number(await page.getByTestId('scene-value').textContent());
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(300);
    const second = Number(await page.getByTestId('scene-value').textContent());

    expect(second).toBeGreaterThan(first);
    expect(second).toBeLessThanOrEqual(1);
  });

  test('stays within zero and one at the extremes of the page', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
    await page.waitForTimeout(200);
    const atTop = Number(await page.getByTestId('scene-value').textContent());

    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' as ScrollBehavior }),
    );
    await page.waitForTimeout(200);
    const atBottom = Number(await page.getByTestId('scene-value').textContent());

    expect(atTop).toBeGreaterThanOrEqual(0);
    expect(atBottom).toBeLessThanOrEqual(1);
    expect(atBottom).toBeGreaterThan(atTop);
  });
});
