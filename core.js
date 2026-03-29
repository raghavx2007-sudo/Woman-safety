// ═══════════════════════════════════════════════════════════════
//  SafeSphere AI+ — Core Shared Logic (loaded on every page)
// ═══════════════════════════════════════════════════════════════

const SS = (() => {

  // ── Storage helpers ──────────────────────────────────────────
  const KEYS = { score: 'ss_score', logs: 'ss_logs', stealth: 'ss_stealth', settings: 'ss_settings' };

  function getScore()   { return parseInt(localStorage.getItem(KEYS.score) || '0'); }
  function setScore(v)  { localStorage.setItem(KEYS.score, Math.min(Math.max(v, 0), 10)); }
  function getLogs()    { try { return JSON.parse(localStorage.getItem(KEYS.logs) || '[]'); } catch { return []; } }
  function saveLogs(l)  { localStorage.setItem(KEYS.logs, JSON.stringify(l)); }
  function getStealth() { return localStorage.getItem(KEYS.stealth) === 'true'; }
  function setStealth(v){ localStorage.setItem(KEYS.stealth, v); }
  function getSettings(){ try { return JSON.parse(localStorage.getItem(KEYS.settings) || '{}'); } catch { return {}; } }
  function saveSettings(s){ localStorage.setItem(KEYS.settings, JSON.stringify(s)); }

  // ── Threat helpers ───────────────────────────────────────────
  function getLevel(score) {
    if (score <= 2) return 'LOW';
    if (score <= 5) return 'MEDIUM';
    return 'HIGH';
  }
  function getLevelClass(score) { return getLevel(score).toLowerCase(); }
  function getLevelColor(score) {
    const l = getLevel(score);
    return l === 'LOW' ? '#a855f7' : l === 'MEDIUM' ? '#ec4899' : '#be123c';
  }

  function addScore(n) {
    const s = Math.min(getScore() + n, 10);
    setScore(s);
    return s;
  }

  // ── Log event ────────────────────────────────────────────────
  function logEvent(msg, level = 'low') {
    const logs = getLogs();
    const entry = {
      msg, level,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      date: new Date().toLocaleDateString(),
      ts: Date.now()
    };
    logs.unshift(entry);
    if (logs.length > 100) logs.pop();
    saveLogs(logs);
    return entry;
  }

  function clearLogs() { saveLogs([]); }

  // ── Notification ─────────────────────────────────────────────
  let _notifTimer;
  function notify(msg, type = '') {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = msg;
    el.className = 'notification show ' + type;
    clearTimeout(_notifTimer);
    _notifTimer = setTimeout(() => el.classList.remove('show'), 3800);
  }

  // ── Topbar threat badge ──────────────────────────────────────
  function refreshTopbar() {
    const score = getScore();
    const level = getLevel(score);
    const cls   = getLevelClass(score);
    const badge = document.getElementById('topbarThreat');
    if (badge) { badge.textContent = level; badge.className = 'topbar-threat ' + cls; }
    const pulse = document.getElementById('sysPulse');
    if (pulse) pulse.className = 'pulse-dot' + (level === 'HIGH' ? ' danger' : '');
    const sysText = document.getElementById('sysStatusText');
    if (sysText) sysText.textContent = level === 'HIGH' ? 'CRITICAL' : level === 'MEDIUM' ? 'Alert Active' : 'System Online';
  }

  // ── Clock ────────────────────────────────────────────────────
  function startClock() {
    const el = document.getElementById('topbarTime');
    if (!el) return;
    const tick = () => { el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false }); };
    tick(); setInterval(tick, 1000);
  }

  // ── Loader ───────────────────────────────────────────────────
  function hideLoader(delay = 1200) {
    setTimeout(() => {
      const l = document.getElementById('loader');
      if (!l) return;
      l.classList.add('fade-out');
      setTimeout(() => l.remove(), 600);
    }, delay);
  }

  // ── Sidebar active link ──────────────────────────────────────
  function markActiveNav() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
    });
  }

  // ── Mobile sidebar toggle ────────────────────────────────────
  function initSidebarToggle() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (!toggle || !sidebar) return;
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) sidebar.classList.remove('open');
    });
  }

  // ── SOS ──────────────────────────────────────────────────────
  function triggerSOS(fromVoice = false) {
    addScore(0);
    notify('🚨 SOS Activated! Location sent to emergency contacts.', 'high');
    logEvent('SOS triggered' + (fromVoice ? ' via voice' : ' manually'), 'high');
    refreshTopbar();
    // Auto-start recording on SOS
    if (typeof ERS !== 'undefined') {
      ERS.startRecording(fromVoice ? 'voice' : 'sos');
    }
  }

  // ── Stealth ──────────────────────────────────────────────────
  function toggleStealth() {
    const s = !getStealth();
    setStealth(s);
    notify(s ? 'Stealth Mode activated. Location hidden.' : 'Stealth Mode deactivated.', s ? 'low' : '');
    logEvent(s ? 'Stealth Mode enabled' : 'Stealth Mode disabled', 'low');
    return s;
  }

  // ── Voice Trigger ────────────────────────────────────────────
  function detectVoiceTrigger() {
    addScore(5);
    setStealth(true);
    notify('🎤 Voice distress detected — "HELP" keyword triggered!', 'high');
    logEvent('Voice trigger: "HELP" detected — SOS activated', 'high');
    triggerSOS(true);
    refreshTopbar();
    // ERS already triggered inside triggerSOS
  }

  // ── Simulate Threat ──────────────────────────────────────────
  function simulateThreat() {
    const s = addScore(3);
    const level = getLevel(s);
    notify('⚠️ Threat simulated. Score +3 → ' + level, level.toLowerCase());
    logEvent('Threat simulated — score increased to ' + s, level.toLowerCase());
    refreshTopbar();
    // Auto-record when threat reaches HIGH
    if (level === 'HIGH' && typeof ERS !== 'undefined' && !ERS.isRecording()) {
      ERS.startRecording('threat_high');
    }
  }

  // ── Recording (delegates to ERS module) ─────────────────────
  async function startRecording(trigger = 'manual') {
    if (typeof ERS !== 'undefined') await ERS.startRecording(trigger);
  }
  function stopRecording() {
    if (typeof ERS !== 'undefined') ERS.stopRecording();
  }

  // ── Init (called on every page) ──────────────────────────────
  function init() {
    hideLoader();
    startClock();
    markActiveNav();
    initSidebarToggle();
    refreshTopbar();
  }

  return {
    getScore, setScore, addScore, getLogs, saveLogs, clearLogs,
    getStealth, setStealth, getSettings, saveSettings,
    getLevel, getLevelClass, getLevelColor,
    logEvent, notify, refreshTopbar, init,
    triggerSOS, toggleStealth, detectVoiceTrigger, simulateThreat,
    startRecording, stopRecording
  };
})();

// ── Shared HTML helpers ──────────────────────────────────────────────────────
function buildSidebar(activePage) {
  return `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div class="brand-dot"></div>
      <div><div class="brand-name">SafeSphere <span style="color:var(--muted);font-weight:300">AI+</span></div>
      <div class="brand-sub">SAFETY SYSTEM</div></div>
    </div>
    <nav class="sidebar-nav">
      <a href="index.html"    class="nav-item"><span class="nav-icon">⬡</span><span class="nav-label">Dashboard</span></a>
      <a href="map.html"      class="nav-item"><span class="nav-icon">◎</span><span class="nav-label">Smart Map</span></a>
      <a href="alerts.html"   class="nav-item"><span class="nav-icon">◈</span><span class="nav-label">Alerts & SOS</span></a>
      <a href="report.html"   class="nav-item"><span class="nav-icon">▤</span><span class="nav-label">Reports</span></a>
      <a href="settings.html" class="nav-item"><span class="nav-icon">◧</span><span class="nav-label">Settings</span></a>
    </nav>
    <div class="sidebar-footer">
      <div class="sys-status">
        <div class="pulse-dot" id="sysPulse"></div>
        <span id="sysStatusText">System Online</span>
      </div>
    </div>
  </aside>`;
}

function buildTopbar(title) {
  return `
  <div class="topbar">
    <div style="display:flex;align-items:center;gap:12px">
      <button class="menu-toggle" id="menuToggle">☰</button>
      <span class="topbar-title">${title}</span>
    </div>
    <div class="topbar-right">
      <span class="topbar-threat" id="topbarThreat">LOW</span>
      <span class="topbar-time" id="topbarTime"></span>
    </div>
  </div>`;
}

function buildSharedUI() {
  return `
  <div id="notification" class="notification"></div>

  <!-- ERS Stealth Indicator Widget -->
  <div id="ersWidget" class="ers-widget">
    <div class="ers-dot" id="ersDot"></div>
    <div class="ers-info">
      <span class="ers-label" id="ersLabel">Recording System Ready</span>
      <span class="ers-timer" id="ersTimer"></span>
    </div>
    <button class="ers-stop-btn" onclick="ERS.stopRecording()" title="Stop Recording">■</button>
  </div>

  <!-- Fake Call Popup -->
  <div id="fakeCallPopup" class="popup-overlay hidden">
    <div class="popup-card">
      <div class="popup-avatar">📞</div>
      <p class="popup-name">Mom</p>
      <p class="popup-sub">Incoming Call...</p>
      <div class="popup-actions">
        <button class="btn-accept" onclick="endFakeCall()">Accept</button>
        <button class="btn-decline" onclick="endFakeCall()">Decline</button>
      </div>
    </div>
  </div>

  <!-- Camera Preview (stealth corner) -->
  <div id="recordingPreview">
    <video id="recordingVideo" muted playsinline></video>
    <div class="rec-label"><div class="rec-dot"></div><span id="recPreviewLabel">Recording (Stealth)</span></div>
  </div>

  <!-- SOS -->
  <button class="sos-btn" onclick="SS.triggerSOS()">SOS</button>`;
}

function endFakeCall() {
  document.getElementById('fakeCallPopup').classList.add('hidden');
  SS.notify('Fake call ended.');
}
