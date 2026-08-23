import { test, expect } from '@playwright/test';

test.describe('PageTransition', () => {
  test('swaps route content on click', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('page').scrollIntoViewIfNeeded();

    await page.getByTestId('route-work').click();

    await expect(page.getByTestId('page')).toHaveAttribute('data-stratum-key', '/work');
    await expect(page.getByTestId('page')).toContainText('/work');
  });

  test('ends fully opaque', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('page').scrollIntoViewIfNeeded();

    await page.getByTestId('route-contact').click();
    await expect(page.getByTestId('page')).toHaveAttribute('data-stratum-key', '/contact');

    await expect(page.getByTestId('page')).toHaveCSS('opacity', '1');
  });

  test('survives rapid route changes', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('page').scrollIntoViewIfNeeded();

    await page.getByTestId('route-work').click();
    await page.getByTestId('route-contact').click();
    await page.getByTestId('route-home').click();

    await expect(page.getByTestId('page')).toHaveAttribute('data-stratum-key', '/');
    await expect(page.getByTestId('page')).toHaveCSS('opacity', '1');
  });
});
