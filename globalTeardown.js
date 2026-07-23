/**
 * Playwright Global Teardown
 * Auto-runs after EVERY test execution (headed or headless).
 * Generates fresh HTML dashboard + PDF from the latest test-results.json.
 */

const { execSync } = require('child_process');
const path = require('path');

async function globalTeardown() {
  const root = path.resolve(__dirname);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📊 Auto-generating reports from latest results...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Step 1 — Regenerate HTML dashboard
    execSync(`node "${path.join(root, 'reports', 'generate-report.js')}"`, {
      cwd: root,
      stdio: 'inherit',
    });

    // Step 2 — Render PDF from the fresh HTML
    execSync(`node "${path.join(root, 'reports', 'generate-pdf.js')}"`, {
      cwd: root,
      stdio: 'inherit',
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ Reports auto-updated successfully!');
    console.log('     HTML → reports/test-report.html');
    console.log('     PDF  → reports/test-report.pdf');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('\n⚠️  Report auto-generation failed:', err.message);
  }
}

module.exports = globalTeardown;
