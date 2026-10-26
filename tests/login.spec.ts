import { test, expect } from '@playwright/test';

test('Verify user can open practice login page', async ({ page }) => {
  // 1. Navigate to a web page
  await page.goto('https://example.com');

  // 2. Assert that the page title contains expected text
  await expect(page).toHaveTitle(/Example Domain/);

  // 3. Verify page heading
  const heading = page.locator('h1');
  await expect(heading).toHaveText('Example Domain');
});

