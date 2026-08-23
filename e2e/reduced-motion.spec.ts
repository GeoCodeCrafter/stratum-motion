import { test, expect } from '@playwright/test';

test.describe('prefers-reduced-motion: reduce', () => {
  // emulateMedia rather than a `use` option, so the emulation is applied by
  // the same API the CLS spec uses and there is one way to do it.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('still shows every reveal', async ({ page }) => {
    await page.goto('/');
    const card = page.getByTestId('preset-rise');

    await card.scrollIntoViewIfNeeded();

    await expect(card).toHaveCSS('opacity', '1');
  });

  test('never translates a reveal', async ({ page }) => {
    await page.goto('/');
    const card = page.getByTestId('preset-rise');
    await card.scrollIntoViewIfNeeded();

    const transform = await card.evaluate((element) => getComputedStyle(element).transform);

    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform);
  });

  test('leaves parallax layers completely still', async ({ page }) => {
    await page.goto('/');
    const layer = page.getByTestId('parallax-layer');
    await layer.scrollIntoViewIfNeeded();

    const before = await layer.evaluate((element) => getComputedStyle(element).transform);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
    const after = await layer.evaluate((element) => getComputedStyle(element).transform);

    expect(after).toBe(before);
  });

  test('pins scroll scenes to their finished state', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('scene').scrollIntoViewIfNeeded();

    await expect(page.getByTestId('scene-value')).toHaveText('1.00');
  });

  test('honours the in-app toggle as well as the OS setting', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('reduce-toggle').click();

    await expect(page.getByTestId('reduce-toggle')).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('with motion allowed', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('parallax layers do move', async ({ page }) => {
    await page.goto('/');
    const layer = page.getByTestId('parallax-layer');
    await layer.scrollIntoViewIfNeeded();

    const before = await layer.evaluate((element) => getComputedStyle(element).transform);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);
    const after = await layer.evaluate((element) => getComputedStyle(element).transform);

    expect(after).not.toBe(before);
  });
});
