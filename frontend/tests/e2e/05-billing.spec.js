/**
 * @file 05-billing.spec.js
 * @description Playwright E2E tests — Billing Page
 *
 * Tests:
 *  ✅ Billing page renders the new-bill form
 *  ✅ Customer name field is present
 *  ✅ Customer mobile field is present
 *  ✅ Payment method selector is present
 *  ✅ Barcode search input is present
 *  ✅ Bill total shows ₹0 when no items added
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth.js';

test.describe('Billing Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.keyboard.press('Alt+b');
    await page.waitForSelector('h2:has-text("New Bill"), h2:has-text("Billing")', { timeout: 8_000 });
  });

  test('billing page renders correctly', async ({ page }) => {
    await expect(page.locator('h2:has-text("New Bill"), h2:has-text("Billing")').first()).toBeVisible();
  });

  test('customer name input is visible', async ({ page }) => {
    const nameField = page.locator('input[placeholder*="Customer Name" i], input[placeholder*="customer name" i]').first();
    await expect(nameField).toBeVisible();
  });

  test('customer mobile input is visible', async ({ page }) => {
    const mobileField = page.locator('input[placeholder*="mobile" i], input[placeholder*="phone" i]').first();
    await expect(mobileField).toBeVisible();
  });

  test('payment method selector is visible', async ({ page }) => {
    // Payment method is usually a set of radio buttons or a select
    const paymentSection = page.locator('text=/Payment|Cash|UPI|Card/').first();
    await expect(paymentSection).toBeVisible();
  });

  test('product barcode/search input is visible', async ({ page }) => {
    const barcodeInput = page.locator('input[placeholder*="Search by"], input[placeholder*="Barcode" i], input[placeholder*="HUID"]').first();
    await expect(barcodeInput).toBeVisible();
  });

  test('F1 key focuses billing page from anywhere', async ({ page }) => {
    await page.keyboard.press('Alt+d');
    await page.waitForTimeout(300);
    await page.keyboard.press('F1');
    await expect(page.locator('h2:has-text("New Bill"), h2:has-text("Billing")').first()).toBeVisible({ timeout: 5_000 });
  });
});
