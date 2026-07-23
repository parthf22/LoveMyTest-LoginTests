# 🧪 LoveMyTest — Login Page E2E Tests

[![Playwright E2E Tests](https://github.com/YOUR_USERNAME/LoveMyTest-LoginTests/actions/workflows/playwright-ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/LoveMyTest-LoginTests/actions/workflows/playwright-ci.yml)

Automated end-to-end test suite for the [LoveMyTestOnline](https://www.lovemytestonline.com) login page, built with **Playwright** and **Node.js**.

## 📊 Test Coverage

| Suite | Test Cases | Priority | Coverage |
|-------|-----------|----------|----------|
| Form Validation | TC-008 → TC-012 (5) | P0/P1 | Empty fields, whitespace, max length |
| Invalid Login | TC-004 → TC-007 (4) | P0/P1 | Invalid user, wrong password, error recovery |
| Navigation & Links | TC-013 → TC-015 (3) | P1 | Help links, system check, refresh |
| Security | TC-016 → TC-020 (5) | P0/P1 | SQLi, XSS, password masking, HTTPS |
| UI & Responsiveness | TC-021 → TC-024 (4) | P1/P2 | Desktop, mobile, footer, title |
| Accessibility | TC-025 → TC-027 (3) | P1/P2 | Tab navigation, Enter key, ARIA |
| Performance | TC-028 → TC-029 (2) | P1/P2 | Page load, API response time |

**Total: 26 test cases**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run all tests (headless)
npm test

# Run tests (headed - visible browser)
npm run test:headed

# Run and generate PDF report
npm run run-all
```

## 📄 Reports

Reports are **auto-generated** after every test run via `globalTeardown.js`:

| Format | Location | Description |
|--------|----------|-------------|
| HTML Dashboard | `reports/test-report.html` | Styled test report |
| PDF Report | `reports/test-report.pdf` | A4 landscape, full color |
| JSON Data | `reports/test-results.json` | Raw test results |
| Playwright HTML | `playwright-report/` | Interactive Playwright report |

## 🔄 CI/CD

This project uses **GitHub Actions** for continuous testing:

- **Trigger**: Push/PR to `main` branch + manual dispatch
- **Browser**: Chromium on Ubuntu
- **Artifacts**: PDF report, HTML report, screenshots, and traces uploaded automatically
- **Retention**: 30 days

## 🏗 Project Structure

```
LoveMyTest-LoginTests/
├── .github/workflows/
│   └── playwright-ci.yml      # CI/CD pipeline
├── tests/
│   ├── e2e/                   # Test spec files
│   │   ├── 01-form-validation.spec.js
│   │   ├── 02-invalid-login.spec.js
│   │   ├── 03-navigation.spec.js
│   │   ├── 04-security.spec.js
│   │   ├── 05-ui-responsiveness.spec.js
│   │   ├── 06-accessibility.spec.js
│   │   └── 07-performance.spec.js
│   └── fixtures/
│       └── LoginPage.js       # Page Object Model
├── reports/
│   ├── generate-report.js     # HTML report generator
│   └── generate-pdf.js        # PDF report generator
├── globalTeardown.js          # Auto-runs report generation
├── playwright.config.js       # Playwright configuration
└── package.json
```

## 📌 Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 23 July 2026 | Initial release — 26 test cases, CI/CD pipeline, auto-reporting |

---

*Built with ❤️ using Playwright*
