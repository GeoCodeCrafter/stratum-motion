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

  test('reveals a staggered group in order', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('preset-fade').scrollIntoViewIfNeeded();

    for (const name of ['fade', 'fadeUp', 'rise', 'tilt']) {
      await expect(page.getByTestId(`preset-${name}`)).toHaveCSS('opacity', '1');
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
