/**
 * TEST SUITE: UI & Responsiveness Tests
 * Test IDs: TC-021, TC-022, TC-023, TC-024
 * Module: UI & Responsiveness
 * Priority: P1/P2
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../fixtures/LoginPage');

test.describe('UI & Responsiveness Tests', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  // TC-021: Desktop Layout (1920x1080)
  test('TC-021: Login page renders correctly at 1920x1080 desktop resolution', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');

    // Assert - Key elements are visible
    await expect(loginPage.usernameField, 'Username field must be visible').toBeVisible();
    await expect(loginPage.passwordField, 'Password field must be visible').toBeVisible();
    await expect(loginPage.loginButton, 'Login button must be visible').toBeVisible();

    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 1920;
    expect(bodyWidth, 'No horizontal overflow at 1920px').toBeLessThanOrEqual(viewportWidth + 20);

    await page.screenshot({ path: 'screenshots/TC-021-desktop-layout-1920.png', fullPage: true });
  });

  // TC-022: Mobile Layout (375x812)
  test('TC-022: Login page is responsive at mobile resolution (375x812)', async ({ page }) => {
    // Arrange - iPhone SE-like viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');

    // Assert - All critical elements still visible and accessible
    await expect(loginPage.usernameField, 'Username field visible on mobile').toBeVisible();
    await expect(loginPage.passwordField, 'Password field visible on mobile').toBeVisible();
    await expect(loginPage.loginButton, 'Login button visible on mobile').toBeVisible();

    // No horizontal scroll on mobile
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll, 'No horizontal scrollbar on mobile').toBeFalsy();

    await page.screenshot({ path: 'screenshots/TC-022-mobile-layout-375.png', fullPage: true });
  });

  // TC-023: Copyright Footer
  test('TC-023: Footer contains copyright information', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');

    // Look for copyright text
    const bodyText = await page.textContent('body');
    const hasCopyright = /copyright|©|TKS/i.test(bodyText);

    expect(hasCopyright, 'Page should contain copyright information in footer').toBeTruthy();

    // Specific version check if available
    if (/ver:/i.test(bodyText)) {
      console.log('TC-023: Version info found in footer ✓');
    }

    await page.screenshot({ path: 'screenshots/TC-023-copyright-footer.png', fullPage: true });
  });

  // TC-024: Browser Tab Title
  test('TC-024: Browser tab shows appropriate page title', async ({ page }) => {
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');

    // Assert
    const title = await page.title();
    console.log(`TC-024: Page title is "${title}"`);

    expect(title, 'Page title should not be empty').toBeTruthy();
    expect(title.length, 'Page title should be meaningful').toBeGreaterThan(0);

    // Should relate to the application
    const isRelevantTitle = /onlinetest|test|login|lmt|exam/i.test(title);
    expect(isRelevantTitle, `Title "${title}" should be application-relevant`).toBeTruthy();

    await page.screenshot({ path: 'screenshots/TC-024-page-title.png', fullPage: true });
  });
});
