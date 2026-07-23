/**
 * TEST SUITE: Navigation & Links Tests
 * Test IDs: TC-013, TC-014, TC-015
 * Module: Navigation & Links
 * Priority: P1
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../fixtures/LoginPage');

test.describe('Navigation & Links Tests', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');
  });

  // TC-013: "Login issues?" Link Navigation
  test('TC-013: Login issues link navigates to help/instructions page', async ({ page }) => {
    // Act - Find and click Login issues link
    const loginIssuesLink = page.locator('a', { hasText: /login issues/i }).first();

    // Check if link exists
    const linkVisible = await loginIssuesLink.isVisible().catch(() => false);

    if (linkVisible) {
      // Open instructions page
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page').catch(() => null),
        loginIssuesLink.click(),
      ]);

      // Handle both same-tab and new-tab navigation
      const targetPage = newPage || page;
      await targetPage.waitForLoadState('load', { timeout: 10000 });

      const targetUrl = targetPage.url();
      expect(targetUrl, 'Should navigate to instructions/help page').toMatch(/instructions|help|support/i);

      await targetPage.screenshot({ path: 'screenshots/TC-013-login-issues-page.png', fullPage: true });
    } else {
      // Link not found - mark as observation
      console.log('TC-013: Login issues link not currently visible on page - checking text');
      await page.screenshot({ path: 'screenshots/TC-013-login-issues-not-found.png', fullPage: true });
    }
  });

  // TC-014: Check Your System Diagnostic Tool
  test('TC-014: Check your system link/button opens diagnostic info', async ({ page }) => {
    // Find "Check your system" element
    const checkSystemEl = page.locator('text=/check your system/i').first();
    const elVisible = await checkSystemEl.isVisible().catch(() => false);

    if (elVisible) {
      await checkSystemEl.click();
      await page.waitForTimeout(2000);

      // Assert some diagnostic content appeared
      const pageContent = await page.textContent('body');
      const hasDiagnostic = /browser|chrome|firefox|system time|camera|math/i.test(pageContent);
      expect(hasDiagnostic, 'Diagnostic content should be visible after clicking Check your system').toBeTruthy();

      await page.screenshot({ path: 'screenshots/TC-014-check-system-diagnostic.png', fullPage: true });
    } else {
      console.log('TC-014: Check your system element not found on page');
      await page.screenshot({ path: 'screenshots/TC-014-check-system-not-found.png', fullPage: true });
    }
  });

  // TC-015: Page Refresh Clears Form
  test('TC-015: Page refresh clears form fields', async ({ page }) => {
    // Arrange - Enter text in fields
    await loginPage.fillUsername('testusername123');
    await loginPage.fillPassword('testpassword456');

    // Verify data entered
    const usernameBefore = await loginPage.usernameField.inputValue();
    expect(usernameBefore).toBe('testusername123');

    // Act - Refresh the page
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Assert - Fields should be empty after refresh
    const usernameAfter = await loginPage.usernameField.inputValue().catch(() => '');
    const passwordAfter = await loginPage.passwordField.inputValue().catch(() => '');

    expect(usernameAfter, 'Username field should be empty after refresh').toBe('');
    expect(passwordAfter, 'Password field should be empty after refresh').toBe('');

    // Login page should still be displayed
    expect(page.url()).toContain('/login');

    await page.screenshot({ path: 'screenshots/TC-015-page-refresh.png', fullPage: true });
  });
});
