import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should redirect to sign-in page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.locator('h1')).toContainText('BING SCRAPER');
  });

  test('should have working sign-in page', async ({ page }) => {
    await page.goto('/sign-in');
    
    await expect(page.locator('h1')).toContainText('BING SCRAPER');
    await expect(page.getByText(/scrape bing all you want/i)).toBeVisible();
    await expect(page.getByPlaceholder('email')).toBeVisible();
    await expect(page.getByPlaceholder('password')).toBeVisible();
  });

  test('should navigate to sign-up from sign-in', async ({ page }) => {
    await page.goto('/sign-in');
    
    await page.getByRole('link', { name: /register/i }).click();
    await expect(page).toHaveURL('/sign-up');
  });

  test('should navigate to sign-in from sign-up', async ({ page }) => {
    await page.goto('/sign-up');
    
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
