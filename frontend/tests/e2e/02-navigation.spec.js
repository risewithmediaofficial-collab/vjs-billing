/**
 * @file 02-navigation.spec.js
 * @description Playwright E2E tests — Sidebar Navigation
 *
 * Tests:
 *  ✅ Dashboard tab is active by default after login
 *  ✅ Clicking "Billing" navigates to the Billing page
 *  ✅ Clicking "Invoices" navigates to the Invoices page
 *  ✅ Clicking "Inventory" navigates to the Inventory page
 *  ✅ Clicking "Loans" navigates to Jewel Loans page
 *  ✅ Clicking "Schemes" navigates to Gold Schemes page
 *  ✅ Sidebar collapse / expand toggle works
 *  ✅ Keyboard shortcut Alt+B navigates to Billing
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth.js';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Dashboard is the default active tab', async ({ page }) => {
    await expect(page.locator('h1:has-text("Dashboard"), h2:has-text("Dashboard")').first()).toBeVisible();
  });

  test('navigates to Billing page', async ({ page }) => {
    await page.click('button:has-text("New Bill"), button:has-text("Billing"), [title*="Billing"]');
    await expect(page.locator('h2:has-text("New Bill"), h1:has-text("New Bill"), h2:has-text("Billing")').first()).toBeVisible({ timeout: 8_000 });
  });

  test('navigates to Invoices page', async ({ page }) => {
    await page.click('a[href*="invoice"], button:has-text("Invoice"), [title*="Invoice"]');
    await expect(page.locator('h1:has-text("Invoice"), h2:has-text("Invoice")').first()).toBeVisible({ timeout: 8_000 });
  });

  test('navigates to Inventory page', async ({ page }) => {
    await page.click('a[href*="inventory"]:not([href*="secret"]), button:has-text("Inventory"):not(:has-text("Secret")), [title*="Inventory"]:not([title*="Secret"])');
    await expect(page.locator('h1:has-text("Inventory"), h2:has-text("Inventory")').first()).toBeVisible({ timeout: 8_000 });
  });

  test('navigates to Jewel Loans page', async ({ page }) => {
    await page.click('button:has-text("Loan"), [title*="Loan"]');
    await expect(page.locator('h1:has-text("Loan"), h2:has-text("Loan")').first()).toBeVisible({ timeout: 8_000 });
  });

  test('navigates to Gold Schemes page', async ({ page }) => {
    await page.click('button:has-text("Scheme"), [title*="Scheme"]');
    await expect(page.locator('h1:has-text("Scheme"), h2:has-text("Scheme")').first()).toBeVisible({ timeout: 8_000 });
  });

  test('sidebar collapse/expand toggle works', async ({ page }) => {
    // Find the hamburger/close button in the top bar
    const toggleBtn = page.locator('button[title="Close Menu"], button[title="Open Menu"]').first();
    const initialTitle = await toggleBtn.getAttribute('title');

    await toggleBtn.click();
    // Title should flip
    const newTitle = await toggleBtn.getAttribute('title');
    expect(newTitle).not.toBe(initialTitle);

    // Toggle back
    await toggleBtn.click();
    const finalTitle = await toggleBtn.getAttribute('title');
    expect(finalTitle).toBe(initialTitle);
  });

  test('keyboard shortcut Alt+B navigates to Billing', async ({ page }) => {
    await page.keyboard.press('Alt+b');
    await expect(page.locator('h2:has-text("New Bill"), h2:has-text("Billing")').first()).toBeVisible({ timeout: 8_000 });
  });

  test('keyboard shortcut Alt+D navigates to Dashboard', async ({ page }) => {
    // Go to billing first
    await page.keyboard.press('Alt+b');
    await page.keyboard.press('Alt+d');
    await expect(page.locator('h1:has-text("Dashboard"), h2:has-text("Dashboard")').first()).toBeVisible({ timeout: 8_000 });
  });

  test('F1 key navigates to Billing', async ({ page }) => {
    await page.keyboard.press('F1');
    await expect(page.locator('h2:has-text("New Bill"), h2:has-text("Billing")').first()).toBeVisible({ timeout: 8_000 });
  });

  test('keyboard shortcuts modal opens with ?', async ({ page }) => {
    await page.keyboard.press('Shift+/');
    await expect(page.locator('h2:has-text("Keyboard Shortcuts")').first()).toBeVisible({ timeout: 5_000 });

    // Escape closes it
    await page.keyboard.press('Escape');
    await expect(page.locator('h2:has-text("Keyboard Shortcuts")')).not.toBeVisible();
  });
});
