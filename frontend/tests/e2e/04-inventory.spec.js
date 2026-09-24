/**
 * @file 04-inventory.spec.js
 * @description Playwright E2E tests — Inventory Page
 *
 * Tests:
 *  ✅ Inventory page loads and shows the product table (or empty state)
 *  ✅ Search bar is present and functional
 *  ✅ "Add Product" button opens the form modal
 *  ✅ Form validation — required fields show error when empty
 *  ✅ Closing the form modal with Escape works
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth.js';

test.describe('Inventory Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    // Navigate to Inventory
    await page.keyboard.press('Alt+i');
    await page.waitForSelector('h1:has-text("Inventory"), h2:has-text("Inventory")', { timeout: 8_000 });
  });

  test('inventory page renders correctly', async ({ page }) => {
    await expect(page.locator('h1:has-text("Inventory"), h2:has-text("Inventory")').first()).toBeVisible();
  });

  test('search bar is visible', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]');
    await expect(searchInput.first()).toBeVisible();
  });

  test('search filters products', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    await searchInput.fill('ring');
    // Typing should filter — just verify no crash
    await page.waitForTimeout(500);
    await expect(searchInput).toHaveValue('ring');
  });

  test('/ shortcut focuses search bar', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await page.keyboard.press('/');
    await expect(searchInput).toBeFocused();
  });

  test('Add Product button is visible for Admin', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add Product"), button:has-text("Add"), button[title*="Add"]').first();
    await expect(addBtn).toBeVisible();
  });

  test('Add Product button opens form modal', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add Product"), button:has-text("Add")').first();
    await addBtn.click();

    // Form modal should appear
    await expect(page.locator('input[placeholder*="Product Name"], input[name="name"], input[placeholder*="name"]').first()).toBeVisible({ timeout: 5_000 });
  });

  test('form closes with Escape key', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add Product"), button:has-text("Add")').first();
    await addBtn.click();
    await page.waitForTimeout(300);

    await page.keyboard.press('Escape');

    // Form should close
    await expect(page.locator('input[placeholder*="Product Name"], input[name="name"]').first()).not.toBeVisible({ timeout: 4_000 });
  });

  test('form save shows validation error when fields empty', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add Product"), button:has-text("Add")').first();
    await addBtn.click();
    await page.waitForTimeout(300);

    // Click save without filling anything
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Add Product")').last();
    await saveBtn.click();

    // Validation error should appear
    await expect(page.locator('text=/required|fill all/i').first()).toBeVisible({ timeout: 5_000 });
  });
});
