/**
 * TEST SUITE: Security Tests
 * Test IDs: TC-016, TC-017, TC-018, TC-019, TC-020
 * Module: Security Testing
 * Priority: P0/P1
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../fixtures/LoginPage');

test.describe('Security Tests', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');
  });

  // TC-016: SQL Injection in Username Field
  test('TC-016: SQL injection in username field is rejected', async ({ page }) => {
    const sqlPayloads = [
      "' OR '1'='1",
      "' OR 1=1--",
      "'; DROP TABLE users;--",
      "admin'--",
      "1' OR '1'='1' /*",
    ];

    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    for (const payload of sqlPayloads) {
      await loginPage.navigate();
      await page.waitForLoadState('networkidle');

      await loginPage.login(payload, 'anypassword');
      await page.waitForTimeout(2000);

      // Assert - Must not be logged in; must remain on login page or show error
      const currentUrl = page.url();
      expect(currentUrl, `SQL Injection with payload "${payload}" should not bypass login`).toContain('/login');
      expect(alertTriggered, 'No unexpected JS alert should appear').toBeFalsy();
    }

    await page.screenshot({ path: 'screenshots/TC-016-sql-injection-blocked.png', fullPage: true });
  });

  // TC-017: XSS in Username Field
  test('TC-017: XSS payloads in username field are sanitized', async ({ page }) => {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('xss')>",
      "javascript:alert('xss')",
      "<svg onload=alert('XSS')>",
    ];

    let xssAlertFired = false;
    page.on('dialog', async (dialog) => {
      xssAlertFired = true;
      console.log(`XSS Alert detected: ${dialog.message()}`);
      await dialog.dismiss();
    });

    for (const payload of xssPayloads) {
      await loginPage.navigate();
      await page.waitForLoadState('networkidle');

      await loginPage.fillUsername(payload);
      await loginPage.fillPassword('test');
      await loginPage.clickLogin();
      await page.waitForTimeout(2000);
    }

    // Assert - XSS should never execute
    expect(xssAlertFired, 'XSS alert must NOT fire - payload must be sanitized').toBeFalsy();

    await page.screenshot({ path: 'screenshots/TC-017-xss-sanitized.png', fullPage: true });
  });

  // TC-018: Password Field Masking
  test('TC-018: Password field masks characters (type=password)', async ({ page }) => {
    // Assert the input type is 'password'
    const inputType = await loginPage.passwordField.getAttribute('type');
    expect(inputType, 'Password field must have type="password" for masking').toBe('password');

    // Enter password and verify it stays masked
    await loginPage.fillPassword('MySecretPassword123');

    // The field type should remain 'password' (not changed to 'text')
    const inputTypeAfterFill = await loginPage.passwordField.getAttribute('type');
    expect(inputTypeAfterFill, 'Password field type should remain "password" after input').toBe('password');

    await page.screenshot({ path: 'screenshots/TC-018-password-masking.png', fullPage: true });
  });

  // TC-019: No Sensitive Data in Page Source
  test('TC-019: Page source does not contain sensitive data or API keys', async ({ page }) => {
    // Get page HTML content
    const pageContent = await page.content();

    // Check for common sensitive data patterns
    const sensitivePatterns = [
      /api[_-]?key\s*=\s*["'][a-zA-Z0-9_\-]{10,}/i,
      /secret\s*=\s*["'][a-zA-Z0-9_\-]{10,}/i,
      /password\s*=\s*["'][a-zA-Z0-9_\-]{6,}/i,
      /Bearer\s+[a-zA-Z0-9_\-\.]{20,}/i,
    ];

    for (const pattern of sensitivePatterns) {
      const match = pageContent.match(pattern);
      expect(match, `Page source should not contain sensitive pattern matching: ${pattern}`).toBeNull();
    }

    await page.screenshot({ path: 'screenshots/TC-019-page-source-check.png', fullPage: true });
  });

  // TC-020: HTTPS Protocol Enforcement
  test('TC-020: Site is served over HTTPS', async ({ page }) => {
    // Assert current URL uses HTTPS
    const currentUrl = page.url();
    expect(currentUrl, 'Login page must be served over HTTPS').toMatch(/^https:\/\//);

    // Verify no mixed content (HTTP resources on HTTPS page)
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('mixed content')) {
        errors.push(msg.text());
      }
    });

    // Navigate again to capture any console errors
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    expect(errors.length, 'No mixed content errors should be present').toBe(0);

    await page.screenshot({ path: 'screenshots/TC-020-https-enforcement.png', fullPage: true });
  });
});
