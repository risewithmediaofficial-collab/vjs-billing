/**
 * Shared auth helper — logs in once and stores the token in localStorage
 * so every test can reuse it without re-logging in.
 */

export const CREDENTIALS = {
  name: 'System Admin',
  pin:  '0000',
};

export const BASE_URL = 'http://localhost:5173';
export const API_URL  = 'http://localhost:5000';

/**
 * Login via the UI and wait for the dashboard to appear.
 * Call this at the start of tests that need an authenticated session.
 */
export async function loginAsAdmin(page) {
  if (!page.url().includes('localhost:5173')) {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  // If already logged in, dashboard heading is already visible
  const dashboardHeading = page.locator('h1:has-text("Dashboard"), h2:has-text("Dashboard")').first();
  const isAlreadyLoggedIn = await dashboardHeading.isVisible().catch(() => false);
  if (isAlreadyLoggedIn) {
    return;
  }

  // Wait for login input or dashboard heading
  const nameInput = page.locator('input[placeholder="Enter your name"]');
  const appeared = await Promise.race([
    nameInput.waitFor({ state: 'visible', timeout: 6_000 }).then(() => 'login').catch(() => null),
    dashboardHeading.waitFor({ state: 'visible', timeout: 6_000 }).then(() => 'dashboard').catch(() => null),
  ]);

  if (appeared === 'login') {
    await nameInput.fill(CREDENTIALS.name);
    await page.fill('input[placeholder="Enter your password"]', CREDENTIALS.pin);
    await page.click('button:has-text("Sign In")');
    await dashboardHeading.waitFor({ state: 'visible', timeout: 15_000 });
  } else if (appeared === 'dashboard') {
    return;
  } else {
    // Fallback: wait for dashboard
    await dashboardHeading.waitFor({ state: 'visible', timeout: 10_000 });
  }
}
