/**
 * @file 01-login.spec.js
 * @description Playwright E2E tests — Login Screen
 *
 * Tests:
 *  ✅ Shows the login form on page load
 *  ✅ Shows validation error when fields are empty
 *  ✅ Shows error on wrong credentials
 *  ✅ Successfully logs in with valid credentials
 *  ✅ Logout returns to the login screen
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin, CREDENTIALS } from './helpers/auth.js';

test.describe('Login Screen', () => {

  test('shows logo and login form on page load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VJS Jewellery');
    await expect(page.locator('input[placeholder="Enter your name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter your password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('shows error when username is empty', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In")');
    await expect(page.locator('text=Please enter your username')).toBeVisible();
  });

  test('shows error when password is empty', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder="Enter your name"]', 'System Admin');
    await page.click('button:has-text("Sign In")');
    await expect(page.locator('text=Please enter your password')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder="Enter your name"]', 'System Admin');
    await page.fill('input[placeholder="Enter your password"]', 'WRONGPIN');
    await page.click('button:has-text("Sign In")');
    // Wait up to 8s for error message
    await expect(page.locator('[class*="red"]')).toBeVisible({ timeout: 8_000 });
  });

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/');
    const passwordInput = page.locator('input[placeholder="Enter your password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye icon button
    await page.locator('button[type="button"]').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle back
    await page.locator('button[type="button"]').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Enter key triggers login', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder="Enter your name"]', CREDENTIALS.name);
    await page.fill('input[placeholder="Enter your password"]', CREDENTIALS.pin);
    await page.press('input[placeholder="Enter your password"]', 'Enter');
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 15_000 });
  });

  test('successfully logs in with valid credentials', async ({ page }) => {
    await loginAsAdmin(page);
    // Should see the main dashboard
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    // Sidebar should be visible
    await expect(page.locator('nav, aside, [class*="sidebar"]').first()).toBeVisible();
  });

  test('logout returns to login screen', async ({ page }) => {
    await loginAsAdmin(page);

    // Find and click the logout button (in sidebar)
    const logoutBtn = page.locator('button[title*="ogout"], button:has-text("Logout"), button:has-text("Sign out")').first();
    await logoutBtn.click();

    // Should land back on login
    await expect(page.locator('h1:has-text("VJS Jewellery")')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('input[placeholder="Enter your name"]')).toBeVisible();
  });
});
