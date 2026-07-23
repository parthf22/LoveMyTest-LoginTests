// Page Object Model for the Login Page
// Encapsulates all interactions with the LoveMyTestOnline login page

const { expect } = require('@playwright/test');

const LOGIN_URL = 'https://www.lovemytestonline.com/login';

class LoginPage {
  constructor(page) {
    this.page = page;

    // Locators
    this.usernameField = page.locator('#mat-input-0');
    this.passwordField = page.locator('#mat-input-1');
    this.loginButton = page.locator('button[type="submit"], button.mat-raised-button').filter({ hasText: 'Login' });
    this.errorMessage = page.locator('.error-message, [class*="error"], mat-error, .mat-snack-bar-container').first();
    this.loginIssuesLink = page.locator('a', { hasText: 'Login issues?' });
    this.checkSystemLink = page.locator('a, button', { hasText: 'Check your system' });
    this.footerText = page.locator('footer, .footer, [class*="footer"]');
    this.pageTitle = page.locator('h1, .brand-title, .app-title, mat-toolbar span').first();
  }

  async navigate() {
    await this.page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  }

  async fillUsername(username) {
    await this.usernameField.click();
    await this.usernameField.fill(username);
  }

  async fillPassword(password) {
    await this.passwordField.click();
    await this.passwordField.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async login(username, password) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async getErrorMessage() {
    // Try multiple possible error message selectors
    const selectors = [
      'text=Invalid login credentials',
      '.alert',
      '[role="alert"]',
      '.mat-snack-bar-container',
      '.error',
      'p.error-msg',
      'div.error-text',
    ];

    for (const sel of selectors) {
      const el = this.page.locator(sel).first();
      try {
        await el.waitFor({ timeout: 5000 });
        const text = await el.textContent();
        if (text && text.trim()) return text.trim();
      } catch {
        continue;
      }
    }
    return null;
  }

  async isUsernameInvalid() {
    const classAttr = await this.usernameField.getAttribute('class') || '';
    const ariaInvalid = await this.usernameField.getAttribute('aria-invalid');
    return classAttr.includes('ng-invalid') || ariaInvalid === 'true';
  }

  async isPasswordInvalid() {
    const classAttr = await this.passwordField.getAttribute('class') || '';
    const ariaInvalid = await this.passwordField.getAttribute('aria-invalid');
    return classAttr.includes('ng-invalid') || ariaInvalid === 'true';
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async getCurrentUrl() {
    return this.page.url();
  }

  async isOnLoginPage() {
    return this.page.url().includes('/login');
  }
}

module.exports = { LoginPage, LOGIN_URL };
