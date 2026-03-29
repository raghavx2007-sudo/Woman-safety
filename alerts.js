// alerts.js — SafeSphere AI+ Alerts & SOS Logs Page

document.getElementById('app').innerHTML = buildSidebar() + `
<div class="main-content">
  ${buildTopbar('Alerts & SOS Logs')}
  <div class="page" id="pageContent"></div>
</div>` + buildSharedUI();

document.getElementById('pageContent').innerHTML = `
<div class="page-header">
  <h1>Alerts &amp; SOS Logs</h1>
  <p>All triggered events, voice alerts, and SOS activations</p>
</div>

<div class="grid-4 section" id="alertStats"></div>

<div class="card section">
  <div class="card-header">
    <span class="card-icon">🔍</span><h2>Filter</h2>
  </div>
  <div class="filter-row">
    <button class="btn-ghost filter-btn active" data-filter="all"   onclick="setFilter('all')">All</button>
    <button class="btn-ghost filter-btn"        data-filter="high"  onclick="setFilter('high')">🔴 High</button>
    <button class="btn-ghost filter-btn"        data-filter="med"   onclick="setFilter('med')">🟡 Medium</button>
    <button class="btn-ghost filter-btn"        data-filter="low"   onclick="setFilter('low')">🟢 Low</button>
    <button class="btn-ghost filter-clear-btn" onclick="clearAll()">Clear All Logs</button>
  </div>
</div>

<div id="alertsList"></div>`;

const iconMap = { high:'🚨', med:'⚠️', low:'ℹ️' };
const typeMap = {
  'SOS triggered': 'SOS', 'Voice trigger': 'Voice', 'Threat simulated': 'Threat',
  'Stealth Mode': 'Stealth', 'journey': 'Journey', 'risk zone': 'Zone',
  'recording': 'Recording', 'Report': 'Report', 'System': 'System'
};

function getType(msg) {
  for (const [k, v] of Object.entries(typeMap)) {
    if (msg.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return 'Event';
}

let currentFilter = 'all';

function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === f));
  renderAlerts();
}

function renderStats() {
  const logs = SS.getLogs();
  const high = logs.filter(l => l.level === 'high').length;
  const med  = logs.filter(l => l.level === 'med').length;
  const low  = logs.filter(l => l.level === 'low').length;
  const sos  = logs.filter(l => l.msg.toLowerCase().includes('sos')).length;
  document.getElementById('alertStats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Total Events</div><div class="stat-value" style="font-size:20px">${logs.length}</div><div class="stat-sub">all time</div></div>
    <div class="stat-card"><div class="stat-label">Critical</div><div class="stat-value" style="font-size:20px;color:var(--high)">${high}</div><div class="stat-sub">high severity</div></div>
    <div class="stat-card"><div class="stat-label">Warnings</div><div class="stat-value" style="font-size:20px;color:var(--med)">${med}</div><div class="stat-sub">medium severity</div></div>
    <div class="stat-card"><div class="stat-label">SOS Events</div><div class="stat-value" style="font-size:20px;color:var(--high)">${sos}</div><div class="stat-sub">activated</div></div>`;
}

function renderAlerts() {
  const logs = SS.getLogs();
  const filtered = currentFilter === 'all' ? logs : logs.filter(l => l.level === currentFilter);
  const el = document.getElementById('alertsList');

  if (!filtered.length) {
    el.innerHTML = `<div class="card" style="text-align:center;padding:40px;color:var(--muted)">No ${currentFilter === 'all' ? '' : currentFilter + ' '}events logged yet.</div>`;
    return;
  }

  el.innerHTML = filtered.map(e => `
    <div class="alert-card ${e.level}" style="margin-bottom:10px">
      <div class="alert-icon">${iconMap[e.level] || 'ℹ️'}</div>
      <div class="alert-body">
        <div class="alert-title">${e.msg}</div>
        <div class="alert-meta">${getType(e.msg)} &nbsp;·&nbsp; ${e.date} at ${e.time}</div>
      </div>
      <div class="alert-badge ${e.level}">${e.level.toUpperCase()}</div>
    </div>`).join('');
}

function clearAll() {
  SS.clearLogs();
  renderStats();
  renderAlerts();
  SS.notify('All logs cleared.', '');
}

SS.init();
renderStats();
renderAlerts();
