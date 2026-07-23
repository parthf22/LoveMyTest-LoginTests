/**
 * TEST SUITE: Accessibility Tests
 * Test IDs: TC-025, TC-026, TC-027
 * Module: Accessibility
 * Priority: P1/P2
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../fixtures/LoginPage');

test.describe('Accessibility Tests', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');
  });

  // TC-025: Keyboard Tab Navigation Order
  test('TC-025: Form elements can be navigated via keyboard Tab key', async ({ page }) => {
    // Click on username field first to set focus origin
    await page.keyboard.press('Tab');

    // Tab through elements and record focused elements
    const focusedElements = [];
    for (let i = 0; i < 6; i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          type: el?.getAttribute('type'),
          id: el?.id,
          name: el?.getAttribute('name'),
          placeholder: el?.getAttribute('placeholder'),
          role: el?.getAttribute('role'),
        };
      });
      focusedElements.push(focused);
      await page.keyboard.press('Tab');
    }

    console.log('TC-025 Tab order:', JSON.stringify(focusedElements, null, 2));

    // Assert - At minimum, form inputs should be in the tab order
    const hasInputInTabOrder = focusedElements.some(
      (el) => el.tag === 'INPUT' || el.type === 'text' || el.type === 'password'
    );
    expect(hasInputInTabOrder, 'Form inputs must be reachable via Tab key').toBeTruthy();

    await page.screenshot({ path: 'screenshots/TC-025-keyboard-navigation.png', fullPage: true });
  });

  // TC-026: Enter Key Submits Form
  test('TC-026: Pressing Enter submits the login form', async ({ page }) => {
    let formSubmitted = false;
    page.on('request', (req) => {
      if (req.url().includes('/session/login')) {
        formSubmitted = true;
      }
    });

    // Arrange
    await loginPage.fillUsername('testuser_enter_key');
    await loginPage.fillPassword('testpassword_enter_key');

    // Act - Press Enter instead of clicking button
    await loginPage.passwordField.press('Enter');
    await page.waitForTimeout(3000);

    // Assert - Form should have been submitted (API call made or page changed)
    const currentUrl = page.url();
    const submittedByKey = formSubmitted || !currentUrl.includes('/login');
    expect(submittedByKey, 'Enter key should submit the form').toBeTruthy();

    await page.screenshot({ path: 'screenshots/TC-026-enter-key-submit.png', fullPage: true });
    console.log(`TC-026: Form submitted via Enter: ${formSubmitted}`);
  });

  // TC-027: ARIA Labels and Attributes
  test('TC-027: Form fields have proper accessibility attributes', async ({ page }) => {
    // Check Username field accessibility
    const usernameAttrs = await page.evaluate(() => {
      const usernameInput = document.querySelector('#mat-input-0, input[type="text"]');
      if (!usernameInput) return null;
      return {
        id: usernameInput.id,
        ariaLabel: usernameInput.getAttribute('aria-label'),
        ariaDescribedBy: usernameInput.getAttribute('aria-describedby'),
        required: usernameInput.required,
        hasLabel: !!document.querySelector(`label[for="${usernameInput.id}"]`) ||
                  !!document.querySelector('mat-label'),
      };
    });

    // Check Password field accessibility
    const passwordAttrs = await page.evaluate(() => {
      const passwordInput = document.querySelector('#mat-input-1, input[type="password"]');
      if (!passwordInput) return null;
      return {
        id: passwordInput.id,
        type: passwordInput.type,
        ariaLabel: passwordInput.getAttribute('aria-label'),
        required: passwordInput.required,
      };
    });

    console.log('TC-027: Username field attrs:', JSON.stringify(usernameAttrs));
    console.log('TC-027: Password field attrs:', JSON.stringify(passwordAttrs));

    // Assert - Password field must have type="password"
    if (passwordAttrs) {
      expect(passwordAttrs.type, 'Password input must have type="password"').toBe('password');
    }

    // Fields must exist and be identifiable
    expect(usernameAttrs, 'Username field must exist in DOM').not.toBeNull();
    expect(passwordAttrs, 'Password field must exist in DOM').not.toBeNull();

    await page.screenshot({ path: 'screenshots/TC-027-aria-attributes.png', fullPage: true });
  });
});
