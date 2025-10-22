import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display sign-in page', async ({ page }) => {
    await page.goto('/sign-in');
    
    await expect(page.locator('h1')).toContainText('BING SCRAPER');
    await expect(page.getByPlaceholder('email')).toBeVisible();
    await expect(page.getByPlaceholder('password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should display sign-up page', async ({ page }) => {
    await page.goto('/sign-up');
    
    await expect(page.locator('h1')).toContainText('BING SCRAPER');
    await expect(page.getByPlaceholder('name')).toBeVisible();
    await expect(page.getByPlaceholder('email')).toBeVisible();
    await expect(page.getByPlaceholder('password').first()).toBeVisible();
    await expect(page.getByPlaceholder('confirm password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
  });

  test('should navigate between sign-in and sign-up pages', async ({ page }) => {
    await page.goto('/sign-in');
    
    await page.getByRole('link', { name: /register/i }).click();
    await expect(page).toHaveURL('/sign-up');
    
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should show error for mismatched passwords on sign-up', async ({ page }) => {
    await page.goto('/sign-up');
    
    await page.getByPlaceholder('name').fill('Test User');
    await page.getByPlaceholder('email').fill('test@example.com');
    await page.getByPlaceholder('password').first().fill('password123');
    await page.getByPlaceholder('confirm password').fill('different');
    
    await page.getByRole('button', { name: /sign up/i }).click();
    
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });
});
