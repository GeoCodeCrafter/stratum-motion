import { test, expect } from '@playwright/test';

/**
 * The failure this library exists to prevent: a page whose content is hidden
 * by an entrance animation that never runs because the bundle did not load.
 */
test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('every reveal is visible', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('hero')).toBeVisible();
    await expect(page.getByTestId('hero')).toHaveCSS('opacity', '1');
  });

  test('content far below the fold is visible too', async ({ page }) => {
    await page.goto('/');

    for (const name of ['fade', 'blurIn', 'tilt']) {
      await expect(page.getByTestId(`preset-${name}`)).toHaveCSS('opacity', '1');
    }
  });

  test('nothing is blurred or displaced', async ({ page }) => {
    await page.goto('/');

    const styles = await page.getByTestId('preset-blurIn').evaluate((element) => {
      const computed = getComputedStyle(element);
      return { filter: computed.filter, transform: computed.transform };
    });

    expect(styles.filter).toBe('none');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(styles.transform);
  });

  test('the page still has its full text', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Motion that survives a failed bundle.')).toBeVisible();
  });
});
