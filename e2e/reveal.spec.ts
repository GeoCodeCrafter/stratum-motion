import { test, expect } from '@playwright/test';

test.describe('Reveal', () => {
  test('reveals what is already on screen', async ({ page }) => {
    await page.goto('/');
    const hero = page.getByTestId('hero');

    await expect(hero).toHaveAttribute('data-stratum-state', 'revealed');
    await expect(hero).toHaveCSS('opacity', '1');
  });

  test('leaves content below the fold hidden until it is scrolled to', async ({ page }) => {
    await page.goto('/');
    const card = page.getByTestId('preset-tilt');

    await expect(card).toHaveCSS('opacity', '0');

    await card.scrollIntoViewIfNeeded();

    await expect(card).toHaveCSS('opacity', '1');
    await expect(card).toHaveAttribute('data-stratum-state', 'revealed');
  });

  test('reveals every card in a staggered group', async ({ page }) => {
    await page.goto('/');

    // The grid wraps, so the last card can still be below the fold once the
    // first one is visible. Scroll to each in turn rather than assuming.
    for (const name of ['fade', 'fadeUp', 'rise', 'tilt']) {
      const card = page.getByTestId(`preset-${name}`);
      await card.scrollIntoViewIfNeeded();
      await expect(card).toHaveCSS('opacity', '1');
    }
  });

  test('ends with no residual transform', async ({ page }) => {
    await page.goto('/');
    const hero = page.getByTestId('hero');

    await expect(hero).toHaveAttribute('data-stratum-state', 'revealed');

    const transform = await hero.evaluate((element) => getComputedStyle(element).transform);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform);
  });
});
