// dashboard.js — SafeSphere AI+ Dashboard Page

document.getElementById('app').innerHTML = buildSidebar() + `
<div class="main-content">
  ${buildTopbar('Dashboard')}
  <div class="page" id="pageContent"></div>
</div>` + buildSharedUI();

document.getElementById('pageContent').innerHTML = `
<div class="page-header">
  <h1>Dashboard</h1>
  <p>Real-time safety monitoring and threat control</p>
</div>

<div class="grid-5 section">
  <div class="stat-card">
    <div class="stat-label">Threat Score</div>
    <div class="stat-value" id="dashScore">0</div>
    <div class="stat-sub">out of 10</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Threat Level</div>
    <div class="stat-value" id="dashLevel">LOW</div>
    <div class="stat-sub" id="dashStatus">Safe</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Total Events</div>
    <div class="stat-value" id="dashEvents">0</div>
    <div class="stat-sub">logged</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Stealth Mode</div>
    <div class="stat-value" id="dashStealth">OFF</div>
    <div class="stat-sub">location hidden</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Recording</div>
    <div class="stat-value" id="dashRecording">OFF</div>
    <div class="stat-sub" id="dashRecSub">evidence system</div>
  </div>
</div>

<div class="grid-2 section">
  <div class="card">
    <div class="card-header"><span class="card-icon">⚠️</span><h2>Threat Monitor</h2></div>
    <div class="threat-monitor-inner">
      <div class="threat-ring" id="threatRing">
        <div class="threat-inner">
          <span class="threat-label" id="threatLabel">LOW</span>
          <span class="threat-score" id="threatScoreDisplay">0</span>
        </div>
      </div>
      <div class="threat-monitor-info">
        <div class="status-row">
          <div class="status-item"><span class="status-key">Status</span><span class="status-val" id="statusVal">Safe</span></div>
          <div class="status-item"><span class="status-key">Score</span><span class="status-val" id="scoreVal">0/10</span></div>
        </div>
        <div class="threat-bar-wrap"><div class="threat-bar" id="threatBar"></div></div>
        <div class="threat-hint" id="threatHint">All clear — no threats detected</div>
      </div>
    </div>
    <button class="btn-ghost w-full" onclick="resetThreat()">↺ Reset Threat Score</button>
  </div>

  <div class="card">
    <div class="card-header"><span class="card-icon">🎛️</span><h2>Controls</h2></div>
    <div class="grid-2">
      <button class="ctrl-btn" id="stealthBtn" onclick="doToggleStealth()">
        <span class="ctrl-icon">🕵️</span>
        <span class="ctrl-label">Stealth Mode</span>
        <span class="ctrl-state" id="stealthState">OFF</span>
      </button>
      <button class="ctrl-btn" onclick="doSimulateThreat()">
        <span class="ctrl-icon">🔺</span>
        <span class="ctrl-label">Simulate Threat</span>
        <span class="ctrl-state">+3</span>
      </button>
      <button class="ctrl-btn" onclick="doVoiceTrigger()">
        <span class="ctrl-icon">🎤</span>
        <span class="ctrl-label">Voice Trigger</span>
        <span class="ctrl-state">HELP</span>
      </button>
      <button class="ctrl-btn" onclick="doFakeCall()">
        <span class="ctrl-icon">📱</span>
        <span class="ctrl-label">Fake Call</span>
        <span class="ctrl-state">Simulate</span>
      </button>
    </div>
  </div>
</div>

<div class="grid-2">
  <div class="card">
    <div class="card-header">
      <span class="card-icon">📜</span><h2>Incident Timeline</h2>
      <button class="btn-ghost" onclick="doClearLogs()">Clear</button>
    </div>
    <div class="timeline" id="timeline">
      <div class="timeline-empty">No incidents logged yet.</div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><span class="card-icon">⚡</span><h2>Quick Access</h2></div>
    <div class="quick-list">
      <a href="map.html" style="text-decoration:none">
        <div class="ctrl-btn ctrl-btn-row">
          <span class="ctrl-icon">◎</span>
          <div><div class="ctrl-label">Smart Map</div><div class="ctrl-state">View live threat zones</div></div>
        </div>
      </a>
      <a href="alerts.html" style="text-decoration:none">
        <div class="ctrl-btn ctrl-btn-row">
          <span class="ctrl-icon">◈</span>
          <div><div class="ctrl-label">Alerts &amp; SOS Logs</div><div class="ctrl-state">View all triggered events</div></div>
        </div>
      </a>
      <a href="report.html" style="text-decoration:none">
        <div class="ctrl-btn ctrl-btn-row">
          <span class="ctrl-icon">▤</span>
          <div><div class="ctrl-label">Generate Report</div><div class="ctrl-state">Download incident report</div></div>
        </div>
      </a>
      <a href="settings.html" style="text-decoration:none">
        <div class="ctrl-btn ctrl-btn-row">
          <span class="ctrl-icon">◧</span>
          <div><div class="ctrl-label">Settings</div><div class="ctrl-state">Configure safety preferences</div></div>
        </div>
      </a>
    </div>
  </div>
</div>`;

function refreshUI() {
  const score   = SS.getScore();
  const level   = SS.getLevel(score);
  const cls     = SS.getLevelClass(score);
  const color   = SS.getLevelColor(score);
  const logs    = SS.getLogs();
  const stealth = SS.getStealth();
  const statuses = { LOW:'Safe', MEDIUM:'Warning', HIGH:'Danger' };
  const hints    = { LOW:'All clear — no threats detected', MEDIUM:'Elevated risk — stay alert', HIGH:'CRITICAL — immediate action required' };

  document.getElementById('threatRing').className = 'threat-ring ' + cls;
  document.getElementById('threatLabel').textContent = level;
  document.getElementById('threatLabel').style.color = color;
  document.getElementById('threatScoreDisplay').textContent = score;
  document.getElementById('threatScoreDisplay').style.color = color;
  document.getElementById('statusVal').textContent = statuses[level];
  document.getElementById('statusVal').style.color = color;
  document.getElementById('scoreVal').textContent = score + '/10';
  document.getElementById('threatBar').style.width = (score / 10 * 100) + '%';
  document.getElementById('threatBar').style.background = color;
  document.getElementById('threatHint').textContent = hints[level];
  document.getElementById('dashScore').textContent = score;
  document.getElementById('dashScore').style.color = color;
  document.getElementById('dashLevel').textContent = level;
  document.getElementById('dashLevel').style.color = color;
  document.getElementById('dashStatus').textContent = statuses[level];
  document.getElementById('dashEvents').textContent = logs.length;
  document.getElementById('dashStealth').textContent = stealth ? 'ON' : 'OFF';
  document.getElementById('dashStealth').style.color = stealth ? 'var(--low)' : '';

  // Recording status
  const recActive = typeof ERS !== 'undefined' && ERS.isRecording();
  const recEl = document.getElementById('dashRecording');
  const recSub = document.getElementById('dashRecSub');
  if (recEl) { recEl.textContent = recActive ? 'LIVE' : 'OFF'; recEl.style.color = recActive ? 'var(--high)' : ''; }
  if (recSub) recSub.textContent = recActive ? '● capturing evidence' : 'evidence system';
  document.getElementById('stealthBtn').classList.toggle('active', stealth);
  document.getElementById('stealthState').textContent = stealth ? 'ON' : 'OFF';

  const tl = document.getElementById('timeline');
  if (!logs.length) { tl.innerHTML = '<div class="timeline-empty">No incidents logged yet.</div>'; }
  else {
    tl.innerHTML = logs.slice(0,20).map(e => `
      <div class="timeline-item">
        <div class="tl-dot ${e.level}"></div>
        <div class="tl-content"><div class="tl-msg">${e.msg}</div><div class="tl-time">${e.date} ${e.time}</div></div>
      </div>`).join('');
  }
  SS.refreshTopbar();
}

function doToggleStealth()  { SS.toggleStealth(); refreshUI(); }
function doSimulateThreat() { SS.simulateThreat(); refreshUI(); }
function doVoiceTrigger()   { SS.detectVoiceTrigger(); refreshUI(); }
function doFakeCall() {
  document.getElementById('fakeCallPopup').classList.remove('hidden');
  SS.logEvent('Fake call initiated', 'low'); refreshUI();
}
function doClearLogs() { SS.clearLogs(); refreshUI(); }
function resetThreat() {
  SS.setScore(0); SS.logEvent('Threat score reset', 'low');
  SS.notify('Threat score reset to 0.', 'low'); refreshUI();
}

SS.init();
refreshUI();
