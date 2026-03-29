// report.js — SafeSphere AI+ Report Generator Page

document.getElementById('app').innerHTML = buildSidebar() + `
<div class="main-content">
  ${buildTopbar('Reports')}
  <div class="page" id="pageContent"></div>
</div>` + buildSharedUI();

document.getElementById('pageContent').innerHTML = `
<div class="page-header">
  <h1>Report Generator</h1>
  <p>Generate and download a full incident report</p>
</div>

<div class="grid-2 section">
  <div class="card">
    <div class="card-header"><span class="card-icon">📊</span><h2>Report Summary</h2></div>
    <div class="report-meta" id="reportMeta"></div>
    <div class="report-download-wrap">
      <button class="btn-primary" onclick="generateTxt()">⬇ Download .txt Report</button>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><span class="card-icon">🔺</span><h2>Threat Breakdown</h2></div>
    <div id="threatBreakdown"></div>
  </div>
</div>

<div class="card section">
  <div class="card-header">
    <span class="card-icon">🎥</span><h2>Recording Evidence</h2>
    <span class="badge" id="recEvidenceBadge" style="background:rgba(255,255,255,0.06);color:var(--muted);border:1px solid var(--border2)">NONE</span>
  </div>
  <div id="recEvidenceList"></div>
</div>

<div class="card">
  <div class="card-header">
    <span class="card-icon">📜</span><h2>Full Event Log</h2>
    <button class="btn-ghost" onclick="SS.clearLogs();renderPage()">Clear</button>
  </div>
  <div id="fullLog"></div>
</div>`;

function renderPage() {
  const score   = SS.getScore();
  const level   = SS.getLevel(score);
  const color   = SS.getLevelColor(score);
  const logs    = SS.getLogs();
  const stealth = SS.getStealth();
  const settings = SS.getSettings();
  const high = logs.filter(l => l.level === 'high').length;
  const med  = logs.filter(l => l.level === 'med').length;
  const low  = logs.filter(l => l.level === 'low').length;

  document.getElementById('reportMeta').innerHTML = `
    <div class="meta-row"><span>Generated</span><span>${new Date().toLocaleString()}</span></div>
    <div class="meta-row"><span>Threat Level</span><span style="color:${color}">${level}</span></div>
    <div class="meta-row"><span>Threat Score</span><span>${score} / 10</span></div>
    <div class="meta-row"><span>Stealth Mode</span><span>${stealth ? 'ON' : 'OFF'}</span></div>
    <div class="meta-row"><span>Auto Recording</span><span>${settings.autoRecord ? 'ON' : 'OFF'}</span></div>
    <div class="meta-row"><span>Recording Evidence</span><span style="color:${ERS.getRecordings().length ? 'var(--low)' : 'var(--muted)'}">${ERS.getRecordings().length ? 'Available (' + ERS.getRecordings().length + ' file' + (ERS.getRecordings().length > 1 ? 's' : '') + ')' : 'None'}</span></div>
    <div class="meta-row"><span>Alerts Sent</span><span>${ERS.getAlerts().length}</span></div>
    <div class="meta-row"><span>Total Events</span><span>${logs.length}</span></div>`;

  document.getElementById('threatBreakdown').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${[['Critical (High)', high, 'var(--high)'], ['Warning (Medium)', med, 'var(--med)'], ['Info (Low)', low, 'var(--low)']].map(([label, count, clr]) => `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span style="color:var(--muted)">${label}</span>
            <span style="color:${clr};font-weight:600">${count}</span>
          </div>
          <div class="threat-bar-wrap">
            <div class="threat-bar" style="width:${logs.length ? (count/logs.length*100) : 0}%;background:${clr}"></div>
          </div>
        </div>`).join('')}
    </div>`;

  const logEl = document.getElementById('fullLog');
  if (!logs.length) {
    logEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">No events recorded yet.</div>';
  } else {
    logEl.innerHTML = logs.map(e => `
      <div class="timeline-item">
        <div class="tl-dot ${e.level}"></div>
        <div class="tl-content">
          <div class="tl-msg">${e.msg}</div>
          <div class="tl-time">${e.date} ${e.time} &nbsp;·&nbsp; <span style="text-transform:uppercase;font-size:10px">${e.level}</span></div>
        </div>
      </div>`).join('');
  }

  // Recording evidence section
  const recs = ERS.getRecordings();
  const recBadge = document.getElementById('recEvidenceBadge');
  const recList  = document.getElementById('recEvidenceList');
  if (recBadge) {
    recBadge.textContent = recs.length ? recs.length + ' FILE' + (recs.length > 1 ? 'S' : '') : 'NONE';
    recBadge.style.background  = recs.length ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)';
    recBadge.style.color       = recs.length ? 'var(--low)' : 'var(--muted)';
    recBadge.style.borderColor = recs.length ? 'rgba(74,222,128,0.25)' : 'var(--border2)';
  }
  if (recList) {
    if (!recs.length) {
      recList.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px">No recordings available. Recording starts automatically on SOS or HIGH threat.</div>';
    } else {
      recList.innerHTML = recs.map(r => {
        const lvlColor = r.threatLevel === 'HIGH' ? 'var(--high)' : r.threatLevel === 'MEDIUM' ? 'var(--med)' : 'var(--low)';
        return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:20px">🎥</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:600">${r.filename}</div>
            <div style="font-size:11px;color:var(--muted)">${new Date(r.ts).toLocaleString()} &nbsp;·&nbsp; ${r.duration}s &nbsp;·&nbsp; <span style="color:${lvlColor}">${r.threatLevel}</span></div>
            <div style="font-size:11px;color:var(--muted)">📍 ${r.location}</div>
          </div>
          ${r.url ? `<a href="${r.url}" download="${r.filename}" style="font-size:11px;color:var(--muted);text-decoration:none;border:1px solid var(--border);border-radius:6px;padding:5px 10px">⬇ Download</a>` : ''}
        </div>`;
      }).join('');
    }
  }
}

function generateTxt() {
  const score   = SS.getScore();
  const level   = SS.getLevel(score);
  const logs    = SS.getLogs();
  const stealth = SS.getStealth();
  const settings = SS.getSettings();
  const recs    = ERS.getRecordings();
  const alerts  = ERS.getAlerts();
  let c = `SAFESPHERE AI+ — INCIDENT REPORT\n${'='.repeat(44)}\n`;
  c += `Generated      : ${new Date().toLocaleString()}\n`;
  c += `Threat Level   : ${level}\n`;
  c += `Threat Score   : ${score} / 10\n`;
  c += `Stealth Mode   : ${stealth ? 'ON' : 'OFF'}\n`;
  c += `Auto Recording : ${settings.autoRecord ? 'ON' : 'OFF'}\n`;
  c += `Rec. Evidence  : ${recs.length ? 'Available (' + recs.length + ' file(s))' : 'None'}\n`;
  c += `Alerts Sent    : ${alerts.length}\n`;
  c += `Total Events   : ${logs.length}\n`;
  c += `${'='.repeat(44)}\n`;

  if (recs.length) {
    c += `\nRECORDING EVIDENCE:\n\n`;
    recs.forEach(r => {
      c += `  File     : ${r.filename}\n`;
      c += `  Time     : ${new Date(r.ts).toLocaleString()}\n`;
      c += `  Location : ${r.location}\n`;
      c += `  Duration : ${r.duration}s\n`;
      c += `  Threat   : ${r.threatLevel}\n\n`;
    });
    c += `${'='.repeat(44)}\n`;
  }

  if (alerts.length) {
    c += `\nSENT ALERTS:\n\n`;
    alerts.forEach(a => {
      c += `  To       : ${a.contact} (${a.phone})\n`;
      c += `  Time     : ${a.ts}\n`;
      c += `  Location : ${a.loc}\n`;
      c += `  Trigger  : ${a.trigger}\n`;
      c += `  Message  : ${a.message}\n\n`;
    });
    c += `${'='.repeat(44)}\n`;
  }

  c += `\nEVENT LOG:\n\n`;
  if (!logs.length) { c += 'No events recorded.\n'; }
  else { logs.forEach(e => { c += `[${e.date} ${e.time}] [${e.level.toUpperCase()}] ${e.msg}\n`; }); }
  c += `\n${'='.repeat(44)}\nSafeSphere AI+ — Confidential Safety Report\n`;

  const blob = new Blob([c], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `safesphere-report-${Date.now()}.txt`; a.click();
  URL.revokeObjectURL(url);
  SS.logEvent('Incident report downloaded', 'low');
  SS.notify('Report downloaded successfully.', 'low');
}

SS.init();
renderPage();
