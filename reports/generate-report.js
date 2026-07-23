/**
 * Test Report Generator
 * Reads Playwright JSON results and generates Katalon Studio-style HTML dashboard
 */

const fs = require('fs');
const path = require('path');

// ── Dynamic meta-inference engine ─────────────────────────────────────────────
// Maps spec filename keywords → display module name.
// Add entries here when you create a NEW spec file — no other changes needed.
const FILE_MODULE_MAP = {
  'form-validation': 'Form Validation',
  'invalid-login': 'Invalid Login',
  'navigation': 'Navigation',
  'security': 'Security',
  'ui-responsiveness': 'UI/Responsiveness',
  'accessibility': 'Accessibility',
  'performance': 'Performance',
};

// Maps module name → default priority tier.
// Tests with P0 keywords in their title override this automatically.
const MODULE_DEFAULT_PRIORITY = {
  'Form Validation': 'P1',
  'Invalid Login': 'P1',
  'Navigation': 'P1',
  'Security': 'P1',
  'UI/Responsiveness': 'P1',
  'Accessibility': 'P2',
  'Performance': 'P1',
};

// Title keyword patterns that always force P0 priority
const P0_PATTERNS = [
  /sql.inject/i, /xss/i,
  /empty.*username.*submit|empty.*password.*submit/i,
  /both.*fields.*empty.*prevent/i,
  /invalid.*username.*shows.*error/i,
  /wrong.*password.*shows.*error/i,
  /both.*invalid.*credentials/i,
];

/**
 * Infers TC ID, module name, and priority from a test's title and spec filename.
 * Works for ANY test — existing, new, renamed, or moved — without config changes.
 */
function inferTestMeta(title, filename, fallbackIndex) {
  // ── 1. TC ID: extract from "TC-XXX:" prefix in title, else auto-generate
  const tcMatch = title.match(/^(TC-\d+):/);
  const tcId = tcMatch ? tcMatch[1] : `TC-${String(fallbackIndex + 1).padStart(3, '0')}`;

  // ── 2. Module: derive from spec filename fragment
  const fileBase = (filename || '').toLowerCase();
  let module = 'General';
  for (const [key, label] of Object.entries(FILE_MODULE_MAP)) {
    if (fileBase.includes(key)) { module = label; break; }
  }
  // Fallback: prettify the filename itself if no match
  if (module === 'General' && fileBase) {
    module = fileBase
      .replace(/^\d+-/, '')
      .replace(/\.spec\.(js|ts)$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  // ── 3. Priority: P0 if title matches critical patterns, else module default
  const isP0 = P0_PATTERNS.some(rx => rx.test(title));
  const priority = isP0 ? 'P0' : (MODULE_DEFAULT_PRIORITY[module] || 'P2');

  return { tcId, module, priority };
}

function loadResults() {
  const jsonPath = path.join(__dirname, 'test-results.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌  No test-results.json found. Run tests first: npx playwright test');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

function parseResults(data) {
  // Use a Map keyed by spec title so each test appears only once (latest result wins)
  const seen = new Map();

  function traverseNestedSuites(suiteList) {
    if (!suiteList) return;
    for (const suite of suiteList) {
      if (suite.specs && Array.isArray(suite.specs)) {
        for (const spec of suite.specs) {
          if (spec.tests && Array.isArray(spec.tests)) {
            for (const t of spec.tests) {
              // Use the last result (accounts for retries — final outcome matters)
              const results = t.results || [];
              const result = results[results.length - 1] || {};

              let status = result.status || t.status || 'skipped';
              if (status === 'expected') status = 'passed';
              if (status === 'unexpected') status = 'failed';

              const key = spec.title || t.title || suite.title;
              seen.set(key, {
                title: key,
                status,
                duration: result.duration || 0,
                startTime: result.startTime || null,
                error: (result.errors && result.errors[0]) ? result.errors[0].message : null,
                retry: result.retry || 0,
                projectName: t.projectName || '',
                file: spec.file || suite.file || '',
              });
            }
          }
        }
      }
      if (suite.suites && Array.isArray(suite.suites)) {
        traverseNestedSuites(suite.suites);
      }
    }
  }

  traverseNestedSuites(data.suites);
  return Array.from(seen.values());
}

function generateHTML(tests, stats) {
  const passed = tests.filter(t => t.status === 'passed').length;
  const failed = tests.filter(t => t.status === 'failed').length;
  const skipped = tests.filter(t => t.status === 'skipped').length;
  const total = tests.length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const totalDuration = tests.reduce((s, t) => s + (t.duration || 0), 0);

  // ── Enrich every test with dynamic metadata (TC ID, module, priority) ─────
  const enriched = tests.map((test, idx) => ({
    ...test,
    ...inferTestMeta(test.title, test.file, idx),
  }));

  // Group by module for breakdown cards
  const modules = {};
  for (const test of enriched) {
    if (!modules[test.module]) modules[test.module] = { passed: 0, failed: 0, total: 0 };
    modules[test.module].total++;
    if (test.status === 'passed') modules[test.module].passed++;
    else modules[test.module].failed++;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const testRows = enriched.map((test) => {
    const { tcId, module, priority } = test;
    const durationSec = (test.duration / 1000).toFixed(2);
    const statusClass = test.status === 'passed' ? 'status-passed' : test.status === 'failed' ? 'status-failed' : 'status-skipped';
    const statusIcon = test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '—';
    const priorityClass = priority === 'P0' ? 'priority-p0' : priority === 'P1' ? 'priority-p1' : 'priority-p2';

    return `
    <tr class="test-row ${test.status === 'failed' ? 'row-failed' : ''}">
      <td class="tc-id">${tcId}</td>
      <td class="tc-name">${test.title.replace(/^TC-\d+:\s*/, '')}</td>
      <td><span class="module-badge">${module}</span></td>
      <td><span class="priority-badge ${priorityClass}">${priority}</span></td>
      <td class="duration">${durationSec}s</td>
      <td><span class="status-badge ${statusClass}">${statusIcon} ${test.status.toUpperCase()}</span></td>
      ${test.error ? `<td class="error-col"><span class="error-pill">Error</span></td>` : '<td>—</td>'}
    </tr>
    ${test.error ? `<tr class="error-detail-row"><td colspan="7"><div class="error-expand">⚠ ${test.error}</div></td></tr>` : ''}
  `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Execution Report — LoveMyTestOnline Login Page</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    /* ── TOKENS ──────────────────────────────────── */
    :root {
      --bg-primary: #0d1117;
      --bg-secondary: #161b22;
      --bg-card: #1c2330;
      --bg-card-hover: #21273a;
      --border: #30363d;
      --border-light: #21262d;
      --text-primary: #e6edf3;
      --text-secondary: #8b949e;
      --text-muted: #6e7681;
      --green: #3fb950;
      --green-dim: #1c8a31;
      --green-glow: rgba(63,185,80,.25);
      --red: #f85149;
      --red-dim: #8b1a1a;
      --red-glow: rgba(248,81,73,.2);
      --amber: #d29922;
      --amber-dim: #7d5900;
      --blue: #58a6ff;
      --blue-dim: #1f4b8e;
      --purple: #bc8cff;
      --katalon-green: #00c896;
      --katalon-accent: #00e5b4;
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;
      --shadow-card: 0 4px 24px rgba(0,0,0,.4);
      --shadow-glow: 0 0 40px rgba(0,200,150,.08);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ── TOPBAR ─────────────────────────────────── */
    .topbar {
      background: linear-gradient(135deg, #0a1628 0%, #0d1117 50%, #0a1628 100%);
      border-bottom: 1px solid var(--border);
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .topbar-left { display: flex; align-items: center; gap: 14px; }
    .katalon-logo {
      background: linear-gradient(135deg, var(--katalon-green), var(--katalon-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .katalon-logo span { opacity: .6; }
    .topbar-badge {
      background: linear-gradient(135deg, var(--katalon-green)22, var(--katalon-accent)22);
      border: 1px solid var(--katalon-green)44;
      color: var(--katalon-green);
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: .5px;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .topbar-right strong { color: var(--text-primary); }

    /* ── HERO BANNER ────────────────────────────── */
    .hero {
      background: linear-gradient(135deg, #0a1628 0%, #0d1117 40%, #0e1923 100%);
      border-bottom: 1px solid var(--border);
      padding: 40px 32px 32px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -80px; right: -80px;
      width: 400px; height: 400px;
      background: radial-gradient(circle, var(--katalon-green)08 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    .hero-title span {
      background: linear-gradient(135deg, var(--katalon-green), var(--katalon-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-sub { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }
    .hero-meta {
      display: flex; align-items: center; gap: 24px;
      font-size: 13px; color: var(--text-muted);
    }
    .hero-meta-item { display: flex; align-items: center; gap: 6px; }
    .hero-meta-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--katalon-green); }

    /* ── PASS RATE RING ─────────────────────────── */
    .stats-strip {
      display: grid;
      grid-template-columns: auto 1fr 1fr 1fr 1fr 1fr;
      gap: 20px;
      padding: 24px 32px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      align-items: center;
    }
    .ring-container {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
    }
    .ring-wrap { position: relative; width: 90px; height: 90px; }
    .ring-wrap svg { transform: rotate(-90deg); }
    .ring-bg { fill: none; stroke: var(--bg-card); stroke-width: 8; }
    .ring-val { fill: none; stroke-width: 8; stroke-linecap: round;
      stroke-dasharray: 226.2; transition: stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1); }
    .ring-center {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .ring-pct { font-size: 18px; font-weight: 700; }
    .ring-label { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      display: flex; flex-direction: column; gap: 4px;
      transition: transform .2s, box-shadow .2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card); }
    .stat-num { font-size: 28px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .stat-lbl { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; }
    .stat-card.green .stat-num { color: var(--green); }
    .stat-card.red .stat-num { color: var(--red); }
    .stat-card.amber .stat-num { color: var(--amber); }
    .stat-card.blue .stat-num { color: var(--blue); }

    /* ── MAIN LAYOUT ────────────────────────────── */
    .main { padding: 28px 32px; display: grid; gap: 24px; }

    .section-title {
      font-size: 14px; font-weight: 600; color: var(--text-secondary);
      text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 14px;
      display: flex; align-items: center; gap: 8px;
    }
    .section-title::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }

    /* ── MODULE SUMMARY ─────────────────────────── */
    .module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
    .module-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      transition: all .2s;
    }
    .module-card:hover { border-color: var(--katalon-green)44; box-shadow: var(--shadow-glow); }
    .module-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .module-name { font-weight: 600; font-size: 14px; }
    .module-count { font-size: 12px; color: var(--text-muted); }
    .module-progress-track { height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
    .module-progress-fill { height: 100%; border-radius: 3px; transition: width 1.2s cubic-bezier(.4,0,.2,1); }
    .module-stats { display: flex; gap: 16px; font-size: 12px; }
    .module-pass { color: var(--green); }
    .module-fail { color: var(--red); }

    /* ── TABLE ──────────────────────────────────── */
    .table-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .table-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
    }
    .table-header h3 { font-size: 15px; font-weight: 600; }
    .table-controls { display: flex; gap: 10px; }

    .filter-btn {
      padding: 6px 14px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      font-size: 12px;
      cursor: pointer;
      transition: all .2s;
      font-family: inherit;
    }
    .filter-btn:hover, .filter-btn.active { background: var(--katalon-green); color: #000; border-color: var(--katalon-green); font-weight: 600; }

    table { width: 100%; border-collapse: collapse; }
    th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .8px;
      color: var(--text-muted);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }
    td { padding: 13px 16px; font-size: 13px; border-bottom: 1px solid var(--border-light); vertical-align: middle; }
    tr.test-row:hover td { background: var(--bg-card-hover); }
    tr.test-row:last-child td { border-bottom: none; }
    tr.row-failed td { background: rgba(248,81,73,.04); }

    .tc-id { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--blue); font-weight: 500; white-space: nowrap; }
    .tc-name { color: var(--text-primary); max-width: 380px; line-height: 1.4; }
    .duration { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-muted); }

    .module-badge {
      padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 500;
      background: var(--blue-dim)66; color: var(--blue); border: 1px solid var(--blue)22;
      white-space: nowrap;
    }

    .priority-badge {
      padding: 2px 9px; border-radius: 4px; font-size: 11px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .priority-p0 { background: var(--red-dim); color: var(--red); }
    .priority-p1 { background: var(--amber-dim); color: var(--amber); }
    .priority-p2 { background: var(--blue-dim); color: var(--blue); }

    .status-badge {
      padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
      display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
    }
    .status-passed { background: var(--green-glow); color: var(--green); border: 1px solid var(--green)44; }
    .status-failed { background: var(--red-glow); color: var(--red); border: 1px solid var(--red)44; }
    .status-skipped { background: rgba(180,180,180,.1); color: var(--text-muted); border: 1px solid var(--border); }

    .error-col .error-pill {
      background: var(--red-glow); color: var(--red); font-size: 11px; padding: 2px 8px;
      border-radius: 4px; border: 1px solid var(--red)33;
    }
    .error-detail-row td { padding: 0; }
    .error-expand {
      background: #1a0d0d; border-left: 3px solid var(--red);
      padding: 10px 20px; font-family: 'JetBrains Mono', monospace; font-size: 11px;
      color: var(--red); line-height: 1.6; white-space: pre-wrap;
    }

    /* ── MODULE SUMMARY TABLE ───────────────────── */
    .module-table { margin-top: 8px; }
    .module-table table td { font-size: 13px; }
    .mod-name { font-weight: 500; }
    .passed-cell { color: var(--green); font-weight: 600; }
    .failed-cell { color: var(--red); font-weight: 600; }
    .mini-progress { display: flex; align-items: center; gap: 10px; }
    .mini-bar-track { flex: 1; height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden; }
    .mini-bar { height: 100%; border-radius: 3px; }
    .mini-label { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); min-width: 36px; }

    /* ── TIMELINE CHART ─────────────────────────── */
    .timeline { display: flex; height: 80px; align-items: flex-end; gap: 3px; padding: 8px 0; }
    .tl-bar {
      flex: 1; border-radius: 3px 3px 0 0; min-width: 8px;
      transition: opacity .2s;
      cursor: pointer; position: relative;
    }
    .tl-bar:hover { opacity: .85; }
    .tl-bar::after {
      content: attr(data-tip);
      position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
      background: var(--bg-primary); border: 1px solid var(--border);
      padding: 4px 8px; border-radius: 4px; font-size: 11px; white-space: nowrap;
      opacity: 0; pointer-events: none; transition: opacity .2s;
    }
    .tl-bar:hover::after { opacity: 1; }

    /* ── FOOTER ─────────────────────────────────── */
    .report-footer {
      padding: 24px 32px;
      border-top: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
      font-size: 12px; color: var(--text-muted);
    }
    .footer-badge {
      background: linear-gradient(135deg, var(--katalon-green)22, var(--katalon-accent)22);
      border: 1px solid var(--katalon-green)33;
      color: var(--katalon-green);
      padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 600;
    }

    /* ── ANIMATIONS ─────────────────────────────── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .stats-strip, .module-grid, .table-card { animation: fadeUp .4s ease both; }
    .stats-strip { animation-delay: .05s; }
    .module-grid { animation-delay: .1s; }
    .table-card { animation-delay: .15s; }

    /* ── RESPONSIVE ─────────────────────────────── */
    @media (max-width: 900px) {
      .stats-strip { grid-template-columns: 1fr 1fr; }
      .ring-container { grid-column: 1/-1; }
      .main { padding: 16px; }
    }
  </style>
</head>
<body>

<!-- TOP BAR -->
<header class="topbar">
  <div class="topbar-left">
    <div class="katalon-logo">Professional<span> Test Report</span></div>
    <div class="topbar-badge">TEST REPORT</div>
  </div>
  <div class="topbar-right">
    <span>🗓 ${dateStr}</span>
    <span>⏱ ${timeStr}</span>
    <strong>LoveMyTestOnline — Login Page</strong>
  </div>
</header>

<!-- HERO -->
<section class="hero">
  <div class="hero-title">Test Execution Report — <span>Login Page</span></div>
  <div class="hero-sub">https://www.lovemytestonline.com/login · Playwright E2E Automation</div>
  <div class="hero-meta">
    <div class="hero-meta-item"><div class="hero-meta-dot"></div> Browser: Chromium + Firefox</div>
    <div class="hero-meta-item"><div class="hero-meta-dot"></div> Environment: Production</div>
    <div class="hero-meta-item"><div class="hero-meta-dot"></div> Test Plan: TP-LMT-LOGIN-001</div>
    <div class="hero-meta-item"><div class="hero-meta-dot"></div> Report ID: RPT-${Date.now()}</div>
  </div>
</section>

<!-- STATS STRIP -->
<section class="stats-strip">
  <!-- Pass Rate Ring -->
  <div class="ring-container">
    <div class="ring-wrap">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle class="ring-bg" cx="45" cy="45" r="36"/>
        <circle class="ring-val" cx="45" cy="45" r="36"
          id="ring-circle"
          style="stroke:${passRate >= 90 ? '#3fb950' : passRate >= 70 ? '#d29922' : '#f85149'};
                 stroke-dashoffset:${226.2 - (226.2 * passRate / 100)}"/>
      </svg>
      <div class="ring-center">
        <div class="ring-pct" style="color:${passRate >= 90 ? '#3fb950' : passRate >= 70 ? '#d29922' : '#f85149'}">${passRate}%</div>
        <div class="ring-label">Pass Rate</div>
      </div>
    </div>
  </div>
  
  <div class="stat-card">
    <div class="stat-num">${total}</div>
    <div class="stat-lbl">Total Test Cases</div>
  </div>
  <div class="stat-card green">
    <div class="stat-num">${passed}</div>
    <div class="stat-lbl">✓ Passed</div>
  </div>
  <div class="stat-card red">
    <div class="stat-num">${failed}</div>
    <div class="stat-lbl">✗ Failed</div>
  </div>
  <div class="stat-card amber">
    <div class="stat-num">${skipped}</div>
    <div class="stat-lbl">— Skipped</div>
  </div>
  <div class="stat-card blue">
    <div class="stat-num">${(totalDuration / 1000).toFixed(1)}s</div>
    <div class="stat-lbl">Total Duration</div>
  </div>
</section>

<!-- MAIN CONTENT -->
<main class="main">

  <!-- MODULE BREAKDOWN -->
  <div>
    <div class="section-title">Module Breakdown</div>
    <div class="module-grid">
      ${Object.entries(modules).map(([mod, mStats]) => {
    const rate = Math.round((mStats.passed / mStats.total) * 100);
    const color = rate === 100 ? '#3fb950' : rate >= 75 ? '#d29922' : '#f85149';
    return `
        <div class="module-card">
          <div class="module-card-top">
            <div class="module-name">${mod}</div>
            <div class="module-count">${mStats.total} tests</div>
          </div>
          <div class="module-progress-track">
            <div class="module-progress-fill" style="width:${rate}%;background:${color}"></div>
          </div>
          <div class="module-stats">
            <span class="module-pass">✓ ${mStats.passed} Passed</span>
            ${mStats.failed > 0 ? `<span class="module-fail">✗ ${mStats.failed} Failed</span>` : ''}
            <span style="margin-left:auto;font-size:12px;color:${color};font-weight:600">${rate}%</span>
          </div>
        </div>`;
  }).join('')}
    </div>
  </div>

  <!-- EXECUTION TIMELINE -->
  <div>
    <div class="section-title">Execution Timeline</div>
    <div class="table-card" style="padding:20px 24px">
      <div class="timeline" id="timeline">
        ${tests.map(t => {
    const maxDur = Math.max(...tests.map(t2 => t2.duration));
    const heightPct = Math.max(8, Math.round((t.duration / maxDur) * 100));
    const color = t.status === 'passed' ? '#3fb950' : t.status === 'failed' ? '#f85149' : '#6e7681';
    const tip = `${t.title.substring(0, 30)}… (${(t.duration / 1000).toFixed(2)}s)`;
    return `<div class="tl-bar" style="height:${heightPct}%;background:${color}" data-tip="${tip}"></div>`;
  }).join('')}
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:4px">← Test execution sequence (bars represent duration)</div>
    </div>
  </div>

  <!-- DETAILED RESULTS TABLE -->
  <div>
    <div class="section-title">Detailed Test Results</div>
    <div class="table-card">
      <div class="table-header">
        <h3>All Test Cases (${total})</h3>
        <div class="table-controls">
          <button class="filter-btn active" onclick="filterTests('all', this)">All</button>
          <button class="filter-btn" onclick="filterTests('passed', this)">✓ Passed</button>
          <button class="filter-btn" onclick="filterTests('failed', this)">✗ Failed</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>TC ID</th>
            <th>Test Name</th>
            <th>Module</th>
            <th>Priority</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody id="test-table-body">
          ${testRows}
        </tbody>
      </table>
    </div>
  </div>

  <!-- MODULE SUMMARY TABLE -->
  <div>
    <div class="section-title">Module Summary</div>
    <div class="table-card module-table">
      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Total</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(modules).map(([mod, mStats]) => {
    const rate = Math.round((mStats.passed / mStats.total) * 100);
    const color = rate === 100 ? '#22c55e' : rate >= 75 ? '#f59e0b' : '#ef4444';
    return `<tr>
              <td class="mod-name">${mod}</td>
              <td>${mStats.total}</td>
              <td class="passed-cell">${mStats.passed}</td>
              <td class="failed-cell">${mStats.failed}</td>
              <td>
                <div class="mini-progress">
                  <div class="mini-bar-track" style="flex:1">
                    <div class="mini-bar" style="width:${rate}%;background:${color}"></div>
                  </div>
                  <span class="mini-label"> ${rate}%</span>
                </div>
              </td>
            </tr>`;
  }).join('')}
          <tr style="font-weight:700;background:var(--bg-secondary)">
            <td>TOTAL</td>
            <td>${total}</td>
            <td class="passed-cell">${passed}</td>
            <td class="failed-cell">${failed}</td>
            <td>
              <div class="mini-progress">
                <div class="mini-bar-track" style="flex:1">
                  <div class="mini-bar" style="width:${passRate}%;background:${passRate >= 90 ? '#22c55e' : '#f59e0b'}"></div>
                </div>
                <span class="mini-label"> ${passRate}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</main>

<!-- FOOTER -->
<footer class="report-footer">
  <div>Generated by Antigravity QA Framework · ${new Date().toISOString()}</div>
  <div class="footer-badge">Professional Test Report v1.0</div>
  <div>Test Plan: TP-LMT-LOGIN-001 · Playwright v1.x</div>
</footer>

<script>
  // Filter functionality
  function filterTests(filter, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const rows = document.querySelectorAll('#test-table-body tr');
    rows.forEach(row => {
      if (filter === 'all') {
        row.style.display = '';
      } else {
        const statusBadge = row.querySelector('.status-badge');
        if (statusBadge) {
          const isMatch = statusBadge.classList.contains('status-' + filter);
          row.style.display = isMatch ? '' : 'none';
        } else {
          row.style.display = 'none'; // Hide error detail rows when filtering
        }
      }
    });
  }

  // Animate ring on load
  window.addEventListener('load', () => {
    const circle = document.getElementById('ring-circle');
    if (circle) circle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)';
  });
</script>
</body>
</html>`;
}

// ── Main execution ────────────────────────────────────────────────────────────
const rawData = loadResults();
const tests = parseResults(rawData);

const stats = {
  passed: tests.filter(t => t.status === 'passed').length,
  failed: tests.filter(t => t.status === 'failed').length,
  total: tests.length,
};

const html = generateHTML(tests, stats);
const outputPath = path.join(__dirname, 'test-report.html');
fs.writeFileSync(outputPath, html, 'utf8');

console.log('');
console.log('╔══════════════════════════════════════════════════╗');
console.log('║    🎉 Katalon-Style Test Report Generated!       ║');
console.log('╠══════════════════════════════════════════════════╣');
console.log(`║  Total Tests : ${String(stats.total).padEnd(33)}║`);
console.log(`║  ✓ Passed    : ${String(stats.passed).padEnd(33)}║`);
console.log(`║  ✗ Failed    : ${String(stats.failed).padEnd(33)}║`);
console.log(`║  Pass Rate   : ${String(Math.round(stats.passed / stats.total * 100) + '%').padEnd(33)}║`);
console.log('╠══════════════════════════════════════════════════╣');
console.log(`║  📄 Report   : reports/test-report.html          ║`);
console.log('╚══════════════════════════════════════════════════╝');
console.log('');
