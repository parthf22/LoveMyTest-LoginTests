# Test Plan: LoveMyTestOnline Login Page

**Document ID:** TP-LMT-LOGIN-001  
**Version:** 1.0  
**Date:** 2026-04-12  
**Author:** QA Engineering Team  
**Status:** APPROVED  
**URL Under Test:** https://www.lovemytestonline.com/login

---

## 1. Introduction

### 1.1 Purpose
This Test Plan describes the testing strategy, scope, approach, and deliverables for the Login Page of the LoveMyTestOnline (LMTO) web application. It serves as the primary reference document for QA activities related to user authentication.

### 1.2 Background
LoveMyTestOnline is an online examination platform (ver: 3.8.0, Copyright © 2026 TKS) where students authenticate using credentials issued by their educational institution. The login page is the single entry point for all users.

### 1.3 Application Overview
- **Platform:** Angular Material web application
- **Backend API:** https://services.lovemytestonline.com/session/login
- **Auth Mechanism:** Username/Password (no OAuth/SSO)
- **Target Users:** Students authenticated by educational institutions

---

## 2. Test Objectives

| Objective | Priority |
|-----------|----------|
| Verify login with valid credentials works correctly | P0 - Critical |
| Verify invalid credentials are rejected with proper error messages | P0 - Critical |
| Verify empty field validation prevents form submission | P0 - Critical |
| Verify "Login issues?" help link navigates correctly | P1 - High |
| Verify "Check your system" diagnostic tool functions correctly | P1 - High |
| Verify password field masks input securely | P1 - High |
| Verify UI responsiveness across screen sizes | P2 - Medium |
| Verify accessibility compliance (keyboard navigation) | P2 - Medium |
| Verify page performance and load times | P2 - Medium |
| Verify security: no sensitive data in DOM/network | P1 - High |
| Verify SQL injection attempt handling | P1 - High |
| Verify XSS input sanitization | P1 - High |

---

## 3. Scope

### 3.1 In Scope
- Login form functionality (username field, password field, login button)
- Form validation (empty fields, field constraints)
- Error message display on failed authentication
- Success flow redirect after authentication
- "Login issues?" link navigation
- "Check your system" diagnostic tool
- Password field security (masking, no auto-fill vulnerabilities)
- Cross-browser compatibility (Chrome, Firefox, Edge)
- Mobile responsiveness
- Basic security testing (SQLi, XSS)
- API response validation (401 on failure)
- Keyboard/tab navigation accessibility
- Page load performance

### 3.2 Out of Scope
- Post-login functionality (exam engine, dashboard)
- User registration (not available from login page)
- Password reset (not available from login page)
- Admin panel access
- Database-level testing
- Load/stress testing
- Native mobile app testing

---

## 4. Test Strategy

### 4.1 Testing Types

| Type | Description | Tools |
|------|-------------|-------|
| **Functional Testing** | Validate all features work per requirements | Playwright |
| **Negative Testing** | Validate error handling and edge cases | Playwright |
| **Security Testing** | SQL injection, XSS, sensitive data exposure | Playwright + Manual |
| **UI/UX Testing** | Layout, responsiveness, visual consistency | Playwright + Screenshot |
| **Accessibility Testing** | Keyboard navigation, ARIA labels | Playwright a11y |
| **Performance Testing** | Page load time, API response time | Playwright + metrics |
| **Cross-Browser Testing** | Chrome, Firefox, Edge | Playwright multi-browser |

### 4.2 Test Levels

```
        /\          E2E Tests (Login flow - 8 tests)
       /  \         
      /----\        
     /      \       Integration Tests (API calls - 4 tests)
    /--------\      
   /          \     
  /------------\    Component Tests (UI validation - 10 tests)
```

### 4.3 Entry Criteria
- Test environment available at https://www.lovemytestonline.com/login
- Test data (valid credentials) provided by institution admin
- Test tools installed (Playwright, Node.js)
- Test plan reviewed and approved

### 4.4 Exit Criteria
- All P0 (Critical) test cases passed
- ≥ 95% of P1 (High) test cases passed
- ≥ 80% of P2 (Medium) test cases passed
- Test report generated and reviewed
- All critical defects resolved

---

## 5. Test Environment

### 5.1 Environment Details

| Parameter | Value |
|-----------|-------|
| URL | https://www.lovemytestonline.com/login |
| Backend | https://services.lovemytestonline.com |
| Application Version | 3.8.0 |
| Environment Type | Production (Read-Only Testing) |
| Test Framework | Playwright v1.x |
| Node.js Version | ≥ 18.x |
| Recommended Browser | Firefox (per app guidelines) |

### 5.2 Browser Matrix

| Browser | Version | Priority |
|---------|---------|----------|
| Google Chrome | Latest | P0 |
| Mozilla Firefox | Latest | P0 |
| Microsoft Edge | Latest | P1 |
| Safari | Latest | P2 |

### 5.3 Device/Resolution Matrix

| Device | Resolution | Priority |
|--------|-----------|----------|
| Desktop | 1920×1080 | P0 |
| Desktop | 1366×768 | P1 |
| Tablet | 768×1024 | P1 |
| Mobile | 375×812 (iPhone) | P2 |

---

## 6. Test Data

### 6.1 Data Categories

| Category | Data | Source |
|----------|------|--------|
| Valid Credentials | Active student username/password | Institution Admin |
| Invalid Username | `invalid_user_xyz` | Test-Generated |
| Invalid Password | `wrongpassword123` | Test-Generated |
| Empty Username | (blank) | N/A |
| Empty Password | (blank) | N/A |
| SQL Injection | `' OR '1'='1` | Security Testing |
| XSS Payload | `<script>alert('xss')</script>` | Security Testing |
| Very Long Input | 500-character string | Boundary Testing |
| Special Characters | `!@#$%^&*()` | Edge Case |
| Whitespace Only | `   ` | Edge Case |

---

## 7. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| No valid test credentials available | High | Critical | Coordinate with institution admin; test failure paths without login |
| Production environment changes | Medium | High | Run smoke tests before full suite |
| Rate limiting on failed logins | Medium | Medium | Add delays between negative test runs |
| Network instability during testing | Low | Medium | Retry logic in test scripts |
| Angular lazy loading causes timing issues | Medium | Medium | Use proper Playwright await patterns |

---

## 8. Deliverables

| Deliverable | Description | Format |
|-------------|-------------|--------|
| Test Plan | This document | Markdown |
| Test Cases | Detailed test case list | Markdown/Excel |
| Test Scripts | Automated Playwright E2E scripts | TypeScript/JavaScript |
| Test Report | Katalon-style HTML dashboard | HTML |
| Screenshots | Evidence of test execution | PNG |

---

## 9. Schedule

| Phase | Activity | Duration |
|-------|----------|----------|
| Phase 1 | Test Planning & Analysis | 1 day |
| Phase 2 | Test Case Design | 1 day |
| Phase 3 | Test Script Development | 2 days |
| Phase 4 | Test Execution | 1 day |
| Phase 5 | Defect Reporting & Report Generation | 1 day |

---

## 10. Roles and Responsibilities

| Role | Responsibility |
|------|---------------|
| QA Lead | Test plan approval, defect triage |
| Test Engineer | Test case design, script development, execution |
| Developer | Defect resolution |
| Product Owner | Acceptance criteria sign-off |

---

## 11. Defect Management

### Defect Severity Levels

| Severity | Description | Example |
|----------|-------------|---------|
| **S1 - Critical** | Blocks core functionality | Login button does nothing |
| **S2 - High** | Core feature impaired | Error message not shown on invalid login |
| **S3 - Medium** | Non-critical feature broken | "Login issues?" link broken |
| **S4 - Low** | Cosmetic/minor issue | Label misalignment |

---

## 12. Approval

| Name | Role | Signature | Date |
|------|------|-----------|------|
| | QA Lead | | |
| | Product Owner | | |
| | Development Lead | | |
