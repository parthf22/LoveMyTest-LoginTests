# Test Cases: LoveMyTestOnline Login Page

**Document ID:** TC-LMT-LOGIN-001  
**Test Plan Ref:** TP-LMT-LOGIN-001  
**Version:** 1.0  
**Date:** 2026-04-12  

---

## Test Case Summary

| Module | Total Cases | P0 | P1 | P2 |
|--------|------------|----|----|-----|
| Functional - Valid Login | 3 | 2 | 1 | 0 |
| Functional - Invalid Login | 4 | 3 | 1 | 0 |
| Form Validation | 5 | 3 | 2 | 0 |
| Navigation & Links | 3 | 0 | 3 | 0 |
| Security Testing | 5 | 2 | 3 | 0 |
| UI & Responsiveness | 4 | 0 | 2 | 2 |
| Accessibility | 3 | 0 | 1 | 2 |
| Performance | 2 | 0 | 1 | 1 |
| **TOTAL** | **29** | **10** | **14** | **5** |

---

## Module 1: Functional - Valid Login

### TC-001: Successful Login with Valid Credentials
- **Priority:** P0 - Critical  
- **Type:** Functional / Positive  
- **Pre-conditions:** Valid student username and password available  
- **Test Data:** Valid username, Valid password  
- **Steps:**
  1. Navigate to https://www.lovemytestonline.com/login
  2. Enter valid username in Username field
  3. Enter valid password in Password field
  4. Click the "Login" button
- **Expected Result:** User is redirected to the dashboard/exam page; no error message displayed
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-002: Login with Correct Username (Case Sensitivity Check)
- **Priority:** P0 - Critical  
- **Type:** Functional / Boundary  
- **Pre-conditions:** Valid student credentials  
- **Test Data:** Valid username in UPPERCASE, valid password  
- **Steps:**
  1. Navigate to login page
  2. Enter username in ALL CAPS
  3. Enter valid password
  4. Click Login
- **Expected Result:** Either logs in successfully (case-insensitive) or returns error (case-sensitive system)
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-003: Login Button State During API Call
- **Priority:** P1 - High  
- **Type:** Functional / UX  
- **Pre-conditions:** None  
- **Test Data:** Any credentials  
- **Steps:**
  1. Navigate to login page
  2. Enter any username and password
  3. Click Login
  4. Observe the button state immediately after click
- **Expected Result:** Button shows loading state / is disabled during API call to prevent double-submit
- **Actual Result:** [TBD]
- **Status:** Not Run

---

## Module 2: Functional - Invalid Login

### TC-004: Login with Invalid Username and Valid Password
- **Priority:** P0 - Critical  
- **Type:** Functional / Negative  
- **Pre-conditions:** None  
- **Test Data:** Username: `invalid_user_xyz123`, Password: `ValidPass123`  
- **Steps:**
  1. Navigate to login page
  2. Enter invalid username
  3. Enter any password
  4. Click Login
- **Expected Result:** Error message "Invalid login credentials !" displayed; user remains on login page; API returns 401
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-005: Login with Valid Username and Invalid Password
- **Priority:** P0 - Critical  
- **Type:** Functional / Negative  
- **Pre-conditions:** None  
- **Test Data:** Username: (valid username), Password: `wrongpassword`  
- **Steps:**
  1. Navigate to login page
  2. Enter valid username
  3. Enter wrong password
  4. Click Login
- **Expected Result:** Error message "Invalid login credentials !" displayed; API returns 401
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-006: Login with Both Invalid Username and Password
- **Priority:** P0 - Critical  
- **Type:** Functional / Negative  
- **Pre-conditions:** None  
- **Test Data:** Username: `fake_user_999`, Password: `badpassword`  
- **Steps:**
  1. Navigate to login page
  2. Enter fake username and password
  3. Click Login
- **Expected Result:** Error message "Invalid login credentials !" displayed
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-007: Error Message Disappears After Correction
- **Priority:** P1 - High  
- **Type:** Functional / UX  
- **Pre-conditions:** Error message visible after failed login  
- **Steps:**
  1. Trigger invalid credentials error
  2. Clear the username field and type new username
  3. Observe error message
- **Expected Result:** Error message clears or updates when user starts to re-enter credentials
- **Actual Result:** [TBD]
- **Status:** Not Run

---

## Module 3: Form Validation

### TC-008: Submit with Empty Username Field
- **Priority:** P0 - Critical  
- **Type:** Validation / Negative  
- **Test Data:** Username: (empty), Password: (any)  
- **Steps:**
  1. Navigate to login page
  2. Leave Username field empty
  3. Enter any password
  4. Click Login
- **Expected Result:** Username field highlighted in red (ng-invalid state); form not submitted
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-009: Submit with Empty Password Field
- **Priority:** P0 - Critical  
- **Type:** Validation / Negative  
- **Test Data:** Username: (any), Password: (empty)  
- **Steps:**
  1. Navigate to login page
  2. Enter any username
  3. Leave Password field empty
  4. Click Login
- **Expected Result:** Password field highlighted in red; form not submitted
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-010: Submit with Both Fields Empty
- **Priority:** P0 - Critical  
- **Type:** Validation / Negative  
- **Test Data:** All fields empty  
- **Steps:**
  1. Navigate to login page
  2. Click Login without entering any data
- **Expected Result:** Both fields highlighted in red; form not submitted; no API call made
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-011: Whitespace-Only Username
- **Priority:** P1 - High  
- **Type:** Validation / Edge Case  
- **Test Data:** Username: `   ` (spaces only), Password: any  
- **Steps:**
  1. Navigate to login page
  2. Type spaces in the Username field
  3. Enter password
  4. Click Login
- **Expected Result:** Either treated as empty (validation error) or trimmed and rejected as invalid
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-012: Maximum Length Input in Fields
- **Priority:** P1 - High  
- **Type:** Validation / Boundary  
- **Test Data:** 500-character string in both fields  
- **Steps:**
  1. Navigate to login page
  2. Paste 500-character string in Username
  3. Paste 500-character string in Password
  4. Click Login
- **Expected Result:** Either input is truncated at max length, or error is returned gracefully; no application crash
- **Actual Result:** [TBD]
- **Status:** Not Run

---

## Module 4: Navigation & Links

### TC-013: "Login issues?" Link Navigation
- **Priority:** P1 - High  
- **Type:** Functional / Navigation  
- **Steps:**
  1. Navigate to login page
  2. Click the "Login issues?" link
- **Expected Result:** Page navigates to `instructions.html` with student guidelines
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-014: "Check your system" Diagnostic Tool
- **Priority:** P1 - High  
- **Type:** Functional  
- **Steps:**
  1. Navigate to login page
  2. Click "Check your system" link
  3. Observe diagnostic panels expand
- **Expected Result:** Diagnostic section expands showing: Browser compatibility, System Time, Camera check, Math rendering panels
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-015: Page Refresh Clears Form
- **Priority:** P1 - High  
- **Type:** Functional  
- **Steps:**
  1. Navigate to login page
  2. Enter text in username and password fields
  3. Refresh the page (F5)
- **Expected Result:** Form fields are cleared; page loads fresh
- **Actual Result:** [TBD]
- **Status:** Not Run

---

## Module 5: Security Testing

### TC-016: SQL Injection in Username Field
- **Priority:** P0 - Critical  
- **Type:** Security  
- **Test Data:** Username: `' OR '1'='1`  
- **Steps:**
  1. Navigate to login page
  2. Enter SQL injection payload in Username field
  3. Enter any password
  4. Click Login
- **Expected Result:** Login is denied; error message shown; no unexpected behavior or data exposure; API returns 401/400
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-017: XSS Injection in Username Field
- **Priority:** P0 - Critical  
- **Type:** Security  
- **Test Data:** Username: `<script>alert('XSS')</script>`  
- **Steps:**
  1. Navigate to login page
  2. Enter XSS payload in Username field
  3. Click Login
- **Expected Result:** Script is NOT executed; input is sanitized; no alert dialog appears; error message shown normally
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-018: Password Field Masking
- **Priority:** P1 - High  
- **Type:** Security  
- **Steps:**
  1. Navigate to login page
  2. Click on Password field
  3. Type any text
  4. Inspect the typed characters visibility
- **Expected Result:** Characters are displayed as bullets/asterisks; password is never visible in plain text
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-019: No Sensitive Data in Page Source
- **Priority:** P1 - High  
- **Type:** Security  
- **Steps:**
  1. Navigate to login page
  2. View Page Source (Ctrl+U)
  3. Search for any credentials, API keys, or sensitive configuration
- **Expected Result:** No credentials, API keys, or sensitive data embedded in HTML source
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-020: HTTPS Protocol Enforcement
- **Priority:** P1 - High  
- **Type:** Security  
- **Steps:**
  1. Navigate to https://www.lovemytestonline.com/login
  2. Verify URL protocol
  3. Try accessing http://www.lovemytestonline.com/login
- **Expected Result:** Site runs on HTTPS; HTTP redirects to HTTPS; padlock icon shown in browser
- **Actual Result:** [TBD]
- **Status:** Not Run

---

## Module 6: UI & Responsiveness

### TC-021: Login Page Layout on Desktop (1920x1080)
- **Priority:** P1 - High  
- **Type:** UI / Visual  
- **Steps:**
  1. Open browser at 1920×1080 resolution
  2. Navigate to login page
  3. Check layout: logo, form card, fields, button, links
- **Expected Result:** Centered card layout; "Onlinetest" logo visible; all elements properly aligned; no overflow
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-022: Login Page Layout on Mobile (375x812)
- **Priority:** P1 - High  
- **Type:** UI / Responsive  
- **Steps:**
  1. Set viewport to 375×812
  2. Navigate to login page
  3. Check all elements fit within viewport
- **Expected Result:** Layout adapts to mobile; fields full-width; button accessible; no horizontal scrollbar
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-023: Copyright Footer Presence
- **Priority:** P2 - Low  
- **Type:** UI / Visual  
- **Steps:**
  1. Navigate to login page
  2. Scroll to bottom
  3. Read footer text
- **Expected Result:** Footer shows "Copyright © 2026, TKS | ver: 3.8.0"
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-024: Browser Tab Title
- **Priority:** P2 - Low  
- **Type:** UI  
- **Steps:**
  1. Navigate to login page
  2. Check browser tab title
- **Expected Result:** Tab shows "Onlinetest" or appropriate application title
- **Actual Result:** [TBD]
- **Status:** Not Run

---

## Module 7: Accessibility

### TC-025: Keyboard Navigation - Tab Order
- **Priority:** P1 - High  
- **Type:** Accessibility  
- **Steps:**
  1. Navigate to login page
  2. Press Tab key repeatedly from top of page
  3. Observe focus order: Username → Password → Login button → Links
- **Expected Result:** Logical tab order through all interactive elements; focus visible on each element
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-026: Login via Keyboard Only (Enter Key)
- **Priority:** P2 - Medium  
- **Type:** Accessibility  
- **Steps:**
  1. Navigate to login page
  2. Tab to Username field, type credentials
  3. Tab to Password field, type password
  4. Press Enter key (do not click Login button)
- **Expected Result:** Login form submits on Enter key press when Password field is focused
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-027: Form Field Labels (ARIA Accessibility)
- **Priority:** P2 - Medium  
- **Type:** Accessibility  
- **Steps:**
  1. Navigate to login page
  2. Inspect the username and password fields with browser DevTools
  3. Check for `aria-label`, `aria-required`, and `label` attributes
- **Expected Result:** Fields have proper ARIA attributes; screen readers can identify field purpose
- **Actual Result:** [TBD]
- **Status:** Not Run

---

## Module 8: Performance

### TC-028: Page Load Time
- **Priority:** P1 - High  
- **Type:** Performance  
- **Steps:**
  1. Clear browser cache
  2. Navigate to login page
  3. Measure time until page is fully interactive (DOM Content Loaded + all resources)
- **Expected Result:** Page loads within 3 seconds on standard broadband connection
- **Actual Result:** [TBD]
- **Status:** Not Run

### TC-029: API Response Time on Login Attempt
- **Priority:** P2 - Medium  
- **Type:** Performance  
- **Steps:**
  1. Navigate to login page
  2. Enter credentials
  3. Click Login
  4. Measure API response time for POST /session/login
- **Expected Result:** API responds within 2 seconds; loading state shown to user
- **Actual Result:** [TBD]
- **Status:** Not Run

---

## Status Legend

| Status | Description |
|--------|-------------|
| ✅ PASS | Test executed, expected result achieved |
| ❌ FAIL | Test executed, expected result NOT achieved |
| ⚠️ BLOCKED | Cannot execute due to dependency |
| 🔄 IN PROGRESS | Currently executing |
| ⬜ NOT RUN | Awaiting execution |
