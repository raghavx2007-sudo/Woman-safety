// settings.js — SafeSphere AI+ Settings Page

document.getElementById('app').innerHTML = buildSidebar() + `
<div class="main-content">
  ${buildTopbar('Settings')}
  <div class="page" id="pageContent"></div>
</div>` + buildSharedUI();

document.getElementById('pageContent').innerHTML = `
<div class="page-header">
  <h1>Settings</h1>
  <p>Configure safety preferences, emergency contacts, and recording system</p>
</div>

<div class="grid-2 section">
  <div class="card">
    <div class="card-header"><span class="card-icon">👤</span><h2>Emergency Contacts</h2></div>
    <div class="settings-fields">
      <div class="field-group">
        <div class="field-label">Primary Contact Name</div>
        <input class="input-field" id="contactName" type="text" placeholder="e.g. Mom"/>
      </div>
      <div class="field-group">
        <div class="field-label">Primary Phone</div>
        <input class="input-field" id="contactPhone" type="tel" placeholder="+91 98765 43210"/>
      </div>
      <div class="field-group">
        <div class="field-label">Primary Email</div>
        <input class="input-field" id="contactEmail" type="email" placeholder="contact@example.com"/>
      </div>
      <div class="field-group">
        <div class="field-label">Secondary Contact Name</div>
        <input class="input-field" id="contact2Name" type="text" placeholder="e.g. Friend"/>
      </div>
      <div class="field-group">
        <div class="field-label">Secondary Phone</div>
        <input class="input-field" id="contact2Phone" type="tel" placeholder="+91 98765 43211"/>
      </div>
      <button class="btn-primary" onclick="saveContacts()">Save Contacts</button>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><span class="card-icon">⚙️</span><h2>System Preferences</h2></div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-label">Auto Recording on SOS</div>
        <div class="setting-desc">Start camera + mic when SOS or HIGH threat triggers</div>
      </div>
      <label class="toggle-wrap">
        <input type="checkbox" id="toggleAutoRecord" onchange="saveSetting('autoRecord', this.checked)"/>
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-label">Voice Detection</div>
        <div class="setting-desc">Enable background voice keyword monitoring</div>
      </div>
      <label class="toggle-wrap">
        <input type="checkbox" id="toggleVoice" onchange="saveSetting('voiceDetection', this.checked)"/>
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-label">Stealth Mode on SOS</div>
        <div class="setting-desc">Automatically enable stealth when SOS is triggered</div>
      </div>
      <label class="toggle-wrap">
        <input type="checkbox" id="toggleStealthSOS" onchange="saveSetting('stealthOnSOS', this.checked)"/>
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-label">Auto-Send Alert</div>
        <div class="setting-desc">Send location + recording to contacts on SOS</div>
      </div>
      <label class="toggle-wrap">
        <input type="checkbox" id="toggleAutoAlert" onchange="saveSetting('autoAlert', this.checked)" checked/>
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-label">Notifications</div>
        <div class="setting-desc">Show in-app notification popups</div>
      </div>
      <label class="toggle-wrap">
        <input type="checkbox" id="toggleNotifs" onchange="saveSetting('notifications', this.checked)" checked/>
        <span class="toggle-slider"></span>
      </label>
    </div>
  </div>
</div>

<div class="grid-2 section">
  <div class="card">
    <div class="card-header">
      <span class="card-icon">🎥</span><h2>Emergency Recording System</h2>
      <span class="badge" id="ersBadge" style="background:rgba(255,255,255,0.06);color:var(--muted);border:1px solid var(--border2)">STANDBY</span>
    </div>
    <p class="card-desc">
      Records video + audio automatically when SOS is triggered, voice distress is detected, or threat reaches HIGH. Evidence saved locally and alert sent to emergency contact.
    </p>
    <div class="ers-controls">
      <button class="btn-primary ers-start-btn" onclick="manualStartRecording()">▶ Start Recording</button>
      <button class="btn-ghost" onclick="manualStopRecording()">■ Stop</button>
    </div>
    <div class="ers-status-row">
      <div id="ersStatusDot" class="ers-status-dot"></div>
      <span id="ersStatusText">System ready — waiting for trigger</span>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <span class="card-icon">📁</span><h2>Saved Evidence</h2>
      <button class="btn-ghost" onclick="clearEvidence()">Clear</button>
    </div>
    <div id="recordingsList"></div>
  </div>
</div>

<div class="card section">
  <div class="card-header">
    <span class="card-icon">📡</span><h2>Sent Alerts Log</h2>
    <button class="btn-ghost" onclick="clearAlerts()">Clear</button>
  </div>
  <div id="alertsLog"></div>
</div>

<div class="card">
  <div class="card-header"><span class="card-icon">🗑️</span><h2>Data Management</h2></div>
  <div class="data-mgmt-row">
    <button class="btn-ghost" onclick="clearLogs()">Clear Event Logs</button>
    <button class="btn-ghost" onclick="resetScore()">Reset Threat Score</button>
    <button class="btn-ghost" onclick="clearEvidence()">Clear Recordings</button>
    <button class="btn-ghost btn-danger" onclick="resetAll()">Reset All Data</button>
  </div>
</div>`;

function loadSettings() {
  const s = SS.getSettings();
  if (s.contactName)   document.getElementById('contactName').value   = s.contactName;
  if (s.contactPhone)  document.getElementById('contactPhone').value  = s.contactPhone;
  if (s.contactEmail)  document.getElementById('contactEmail').value  = s.contactEmail;
  if (s.contact2Name)  document.getElementById('contact2Name').value  = s.contact2Name;
  if (s.contact2Phone) document.getElementById('contact2Phone').value = s.contact2Phone;
  document.getElementById('toggleAutoRecord').checked = !!s.autoRecord;
  document.getElementById('toggleVoice').checked      = !!s.voiceDetection;
  document.getElementById('toggleStealthSOS').checked = !!s.stealthOnSOS;
  document.getElementById('toggleAutoAlert').checked  = s.autoAlert !== false;
  document.getElementById('toggleNotifs').checked     = s.notifications !== false;
  renderRecordings();
  renderAlertsLog();
}

function saveContacts() {
  const s = SS.getSettings();
  s.contactName   = document.getElementById('contactName').value.trim();
  s.contactPhone  = document.getElementById('contactPhone').value.trim();
  s.contactEmail  = document.getElementById('contactEmail').value.trim();
  s.contact2Name  = document.getElementById('contact2Name').value.trim();
  s.contact2Phone = document.getElementById('contact2Phone').value.trim();
  SS.saveSettings(s);
  SS.notify('Emergency contacts saved.', 'low');
  SS.logEvent('Emergency contacts updated', 'low');
}

function saveSetting(key, val) {
  const s = SS.getSettings();
  s[key] = val;
  SS.saveSettings(s);
  SS.notify(`${key.replace(/([A-Z])/g,' $1').trim()} ${val ? 'enabled' : 'disabled'}.`, val ? 'low' : '');
}

async function manualStartRecording() {
  await ERS.startRecording('manual');
  updateERSStatus();
  setTimeout(renderRecordings, 3000);
}

function manualStopRecording() {
  ERS.stopRecording();
  updateERSStatus();
  setTimeout(renderRecordings, 500);
}

function updateERSStatus() {
  const active = ERS.isRecording();
  const badge  = document.getElementById('ersBadge');
  const dot    = document.getElementById('ersStatusDot');
  const text   = document.getElementById('ersStatusText');
  if (badge) {
    badge.textContent = active ? 'RECORDING' : 'STANDBY';
    badge.classList.toggle('badge-recording', active);
    badge.classList.toggle('badge-standby', !active);
  }
  if (dot)  dot.classList.toggle('ers-status-dot--active', active);
  if (text) text.textContent = active ? '● Recording in progress...' : 'System ready — waiting for trigger';
}

function renderRecordings() {
  const list = ERS.getRecordings();
  const el   = document.getElementById('recordingsList');
  if (!list.length) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px">No recordings saved yet.</div>';
    return;
  }
  el.innerHTML = list.map(r => {
    const lvlColor = r.threatLevel === 'HIGH' ? 'var(--high)' : r.threatLevel === 'MEDIUM' ? 'var(--med)' : 'var(--low)';
    return `<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:18px;flex-shrink:0">🎥</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.filename}</div>
        <div style="font-size:11px;color:var(--muted)">${new Date(r.ts).toLocaleString()}</div>
        <div style="font-size:11px;color:var(--muted)">📍 ${r.location} &nbsp;·&nbsp; ${r.duration}s &nbsp;·&nbsp; <span style="color:${lvlColor}">${r.threatLevel}</span></div>
      </div>
      ${r.url ? `<a href="${r.url}" download="${r.filename}" style="font-size:11px;color:var(--muted);text-decoration:none;border:1px solid var(--border);border-radius:6px;padding:4px 8px;flex-shrink:0">⬇</a>` : ''}
    </div>`;
  }).join('');
}

function renderAlertsLog() {
  const alerts = ERS.getAlerts();
  const el     = document.getElementById('alertsLog');
  if (!alerts.length) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px">No alerts sent yet.</div>';
    return;
  }
  el.innerHTML = alerts.map(a => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:18px;flex-shrink:0">📡</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:600;margin-bottom:2px">Alert sent to ${a.contact} (${a.phone})</div>
        <div style="font-size:11px;color:var(--muted)">${a.ts} &nbsp;·&nbsp; Trigger: ${a.trigger}</div>
        <div style="font-size:11px;color:var(--muted)">📍 ${a.loc}</div>
        <div style="font-size:11px;color:var(--muted);font-style:italic;margin-top:2px">"${a.message}"</div>
      </div>
      <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;flex-shrink:0;background:rgba(248,113,113,0.1);color:var(--high);border:1px solid rgba(248,113,113,0.2)">${a.level}</span>
    </div>`).join('');
}

function clearEvidence() { ERS.clearRecordings(); renderRecordings(); SS.notify('Recordings cleared.', ''); }
function clearAlerts()   { localStorage.removeItem('ss_alerts'); renderAlertsLog(); SS.notify('Alert log cleared.', ''); }
function clearLogs()     { SS.clearLogs(); SS.notify('Event logs cleared.', 'low'); }
function resetScore()    { SS.setScore(0); SS.logEvent('Threat score reset', 'low'); SS.notify('Threat score reset.', 'low'); SS.refreshTopbar(); }
function resetAll() {
  SS.clearLogs(); SS.setScore(0); SS.setStealth(false); SS.saveSettings({});
  ERS.clearRecordings(); localStorage.removeItem('ss_alerts');
  SS.notify('All data reset.', 'high');
  SS.refreshTopbar();
  loadSettings();
}

SS.init();
loadSettings();
setInterval(updateERSStatus, 2000);
