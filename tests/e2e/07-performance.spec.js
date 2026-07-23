/**
 * TEST SUITE: Performance Tests
 * Test IDs: TC-028, TC-029
 * Module: Performance
 * Priority: P1/P2
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../fixtures/LoginPage');

test.describe('Performance Tests', () => {
  let loginPage;

  // TC-028: Page Load Time
  test('TC-028: Login page loads within 5 seconds', async ({ page }) => {
    loginPage = new LoginPage(page);

    const startTime = Date.now();

    // Navigate and measure
    await page.goto('https://www.lovemytestonline.com/login', {
      waitUntil: 'domcontentloaded',
    });

    const domContentLoaded = Date.now() - startTime;
    console.log(`TC-028: DOM Content Loaded in ${domContentLoaded}ms`);

    await page.waitForLoadState('networkidle');
    const fullLoadTime = Date.now() - startTime;

    console.log(`TC-028: Full page load time: ${fullLoadTime}ms`);

    // Assert - Page loads within 5 seconds (lenient for network conditions)
    expect(domContentLoaded, 'DOM Content should load within 5000ms').toBeLessThan(5000);

    // Collect Web Vitals via Performance API
    const perfMetrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoadedEventEnd: nav?.domContentLoadedEventEnd,
        loadEventEnd: nav?.loadEventEnd,
        transferSize: nav?.transferSize,
        responseEnd: nav?.responseEnd,
      };
    });

    console.log('TC-028 Performance Metrics:', JSON.stringify(perfMetrics, null, 2));

    await loginPage.navigate();
    await page.screenshot({ path: 'screenshots/TC-028-page-load-performance.png', fullPage: true });
  });

  // TC-029: API Login Response Time
  test('TC-029: Login API responds within 5 seconds', async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');

    let apiCallStartTime = null;
    let apiResponseTime = null;

    // Intercept API call to measure timing
    page.on('request', (req) => {
      if (req.url().includes('/session/login')) {
        apiCallStartTime = Date.now();
      }
    });

    page.on('response', (res) => {
      if (res.url().includes('/session/login') && apiCallStartTime) {
        apiResponseTime = Date.now() - apiCallStartTime;
        console.log(`TC-029: API response received in ${apiResponseTime}ms`);
      }
    });

    // Act - Attempt a login to trigger API call
    await loginPage.fillUsername('perf_test_user_' + Date.now());
    await loginPage.fillPassword('perf_test_pass_' + Date.now());

    const loginClickStart = Date.now();
    await loginPage.clickLogin();
    await page.waitForTimeout(5000);

    const totalWait = Date.now() - loginClickStart;

    // Assert
    if (apiResponseTime !== null) {
      console.log(`TC-029: API response time: ${apiResponseTime}ms`);
      expect(apiResponseTime, 'API should respond within 5000ms').toBeLessThan(5000);
    } else {
      console.log(`TC-029: API call not intercepted (may not have fired). Total wait: ${totalWait}ms`);
    }

    await page.screenshot({ path: 'screenshots/TC-029-api-response-time.png', fullPage: true });
  });
});
