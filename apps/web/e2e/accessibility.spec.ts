import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have accessible form inputs on sign-in page', async ({ page }) => {
    await page.goto('/sign-in');
    
    const emailInput = page.getByPlaceholder('email');
    const passwordInput = page.getByPlaceholder('password');
    
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    await expect(emailInput).toBeEditable();
    await expect(passwordInput).toBeEditable();
  });

  test('should have accessible form inputs on sign-up page', async ({ page }) => {
    await page.goto('/sign-up');
    
    const nameInput = page.getByPlaceholder('name');
    const emailInput = page.getByPlaceholder('email');
    const passwordInput = page.getByPlaceholder('password').first();
    const confirmPasswordInput = page.getByPlaceholder('confirm password');
    
    await expect(nameInput).toHaveAttribute('type', 'text');
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    await expect(nameInput).toBeEditable();
    await expect(emailInput).toBeEditable();
    await expect(passwordInput).toBeEditable();
    await expect(confirmPasswordInput).toBeEditable();
  });

  test('should have form inputs with required attribute', async ({ page }) => {
    await page.goto('/sign-in');
    
    const emailInput = page.getByPlaceholder('email');
    const passwordInput = page.getByPlaceholder('password');
    
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/sign-in');
    
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('BING SCRAPER');
  });
});
