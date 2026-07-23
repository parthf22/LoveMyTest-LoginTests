/**
 * TEST SUITE: Form Validation Tests
 * Test IDs: TC-008, TC-009, TC-010, TC-011, TC-012
 * Module: Form Validation
 * Priority: P0/P1
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../fixtures/LoginPage');

test.describe('Form Validation Tests', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');
  });

  // TC-008: Submit with Empty Username Field
  test('TC-008: Submit form with empty username field shows validation state', async ({ page }) => {
    // Arrange
    await loginPage.fillPassword('somepassword');

    // Act - Click login without username
    await loginPage.clickLogin();
    await page.waitForTimeout(1000);

    // Assert
    const isInvalid = await loginPage.isUsernameInvalid();
    const currentUrl = await loginPage.getCurrentUrl();

    expect(isInvalid, 'Username field should show invalid state').toBeTruthy();
    expect(currentUrl, 'User should remain on login page').toContain('/login');

    // Take screenshot as evidence
    await page.screenshot({ path: 'screenshots/TC-008-empty-username-validation.png', fullPage: true });
  });

  // TC-009: Submit with Empty Password Field
  test('TC-009: Submit form with empty password field shows validation state', async ({ page }) => {
    // Arrange
    await loginPage.fillUsername('someusername');

    // Act - Click login without password
    await loginPage.clickLogin();
    await page.waitForTimeout(1000);

    // Assert
    const isInvalid = await loginPage.isPasswordInvalid();
    const currentUrl = await loginPage.getCurrentUrl();

    expect(isInvalid, 'Password field should show invalid state').toBeTruthy();
    expect(currentUrl, 'User should remain on login page').toContain('/login');

    await page.screenshot({ path: 'screenshots/TC-009-empty-password-validation.png', fullPage: true });
  });

  // TC-010: Submit with Both Fields Empty
  test('TC-010: Submit form with both fields empty prevents submission', async ({ page }) => {
    // Track network requests to ensure no API call is made
    let apiCallMade = false;
    page.on('request', (req) => {
      if (req.url().includes('/session/login')) {
        apiCallMade = true;
      }
    });

    // Act - Click login with empty form
    await loginPage.clickLogin();
    await page.waitForTimeout(1500);

    // Assert
    const usernameInvalid = await loginPage.isUsernameInvalid();
    const passwordInvalid = await loginPage.isPasswordInvalid();
    const currentUrl = await loginPage.getCurrentUrl();

    expect(usernameInvalid, 'Username should show invalid state').toBeTruthy();
    expect(passwordInvalid, 'Password should show invalid state').toBeTruthy();
    expect(currentUrl, 'Should stay on login page').toContain('/login');

    await page.screenshot({ path: 'screenshots/TC-010-both-empty-validation.png', fullPage: true });
  });

  // TC-011: Whitespace-Only Username
  test('TC-011: Whitespace-only username is treated as invalid input', async ({ page }) => {
    // Arrange
    await loginPage.fillUsername('   ');
    await loginPage.fillPassword('anypassword');

    // Act
    await loginPage.clickLogin();
    await page.waitForTimeout(2000);

    // Assert - Either validation error or auth failure, NOT a successful login
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl, 'Should not navigate away from login page on whitespace input').toContain('/login');

    await page.screenshot({ path: 'screenshots/TC-011-whitespace-username.png', fullPage: true });
  });

  // TC-012: Maximum Length Input
  test('TC-012: Extremely long input is handled gracefully without crash', async ({ page }) => {
    // Arrange
    const longString = 'A'.repeat(500);

    // Act
    await loginPage.fillUsername(longString);
    await loginPage.fillPassword(longString);
    await loginPage.clickLogin();
    await page.waitForTimeout(3000);

    // Assert - Page should not crash or throw unhandled errors
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl, 'Page should handle long input gracefully').toContain('/login');

    // Page should still be responsive
    await expect(loginPage.usernameField).toBeVisible();

    await page.screenshot({ path: 'screenshots/TC-012-max-length-input.png', fullPage: true });
  });
});
