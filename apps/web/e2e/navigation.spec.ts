import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should have page header on sign-in page', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.locator('h1')).toContainText('BING SCRAPER');
  });

  test('should have page header on sign-up page', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.locator('h1')).toContainText('BING SCRAPER');
  });

  test('should display correct tagline on pages', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByText(/scrape bing all you want/i)).toBeVisible();
    
    await page.goto('/sign-up');
    await expect(page.getByText(/scrape bing all you want/i)).toBeVisible();
  });

  test('should redirect root to sign-in', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
